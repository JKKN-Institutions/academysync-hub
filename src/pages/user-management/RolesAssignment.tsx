import { useState, useEffect } from "react";
import { Search, UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoles } from "@/hooks/useRoles";
import { useStaffData } from "@/hooks/useStaffData";
import { useStudentsData } from "@/hooks/useStudentsData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface UserWithRoles {
  id: string;
  display_name: string;
  email: string;
  department: string | null;
  currentRoles: string[];
  auth_user_id: string | null;
  userType: 'profile' | 'staff' | 'student';
  designation?: string;
  rollNo?: string;
  program?: string;
}

const RolesAssignment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const { roles, loading: rolesLoading, assignRoleToUser } = useRoles();
  const { staff, loading: staffLoading } = useStaffData();
  const { students, loading: studentsLoading } = useStudentsData();
  const { user } = useAuth();
  const { toast } = useToast();

  // Define role hierarchy - higher number means higher privilege
  const roleHierarchy = {
    'mentee': 1,
    'mentor': 2,
    'dept_lead': 3,
    'admin': 4,
    'super_admin': 5
  };

  // Get assignable roles based on current user's role
  const getAssignableRoles = () => {
    if (!user?.role) return [];
    
    const currentUserLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    
    return roles.filter(role => {
      const roleLevel = roleHierarchy[role.name as keyof typeof roleHierarchy] || 0;
      
      // Super admin can assign any role
      if (user.role === 'super_admin') return true;
      
      // Admin can assign roles below their level (cannot create other admins or super admins)
      if (user.role === 'admin') return roleLevel < currentUserLevel;
      
      // Other roles cannot assign roles
      return false;
    });
  };

  // Fetch users with their current roles
  const fetchUsersWithRoles = async () => {
    try {
      setLoading(true);

      // Get user profiles with auth user emails  
      const { data: authUsersResponse } = await supabase.auth.admin.listUsers();
      const authUsers = authUsersResponse?.users || [];

      // Get user profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('*');

      // Get user role assignments with role names
      const { data: roleAssignments } = await supabase
        .from('user_role_assignments')
        .select(`
          user_id,
          roles (
            name
          )
        `)
        .eq('status', 'active');

      const allUsers: UserWithRoles[] = [];

      // Add user profiles
      if (profiles) {
        profiles.forEach((profile) => {
          const authUser = authUsers.find(user => user.id === profile.user_id);
          const userRoles = (roleAssignments || [])
            .filter(assignment => assignment.user_id === profile.user_id)
            .map(assignment => (assignment.roles as any)?.name)
            .filter(Boolean);

          allUsers.push({
            id: profile.id || crypto.randomUUID(),
            display_name: profile.display_name || authUser?.email || 'Unknown User',
            email: authUser?.email || '',
            department: profile.department || null,
            currentRoles: userRoles,
            auth_user_id: profile.user_id,
            userType: 'profile'
          });
        });
      }

      // Add staff members (from external API)
      staff.forEach((staffMember) => {
        // Check if staff member already exists in profiles
        const existingProfile = allUsers.find(user => user.email === staffMember.email);
        if (!existingProfile) {
          allUsers.push({
            id: `staff-${staffMember.id}`,
            display_name: staffMember.name,
            email: staffMember.email,
            department: staffMember.department || null,
            designation: staffMember.designation,
            currentRoles: [],
            auth_user_id: null,
            userType: 'staff'
          });
        }
      });

      // Add students (from external API)
      students.forEach((student) => {
        // Check if student already exists in profiles
        const existingProfile = allUsers.find(user => user.email === student.email);
        if (!existingProfile) {
          allUsers.push({
            id: `student-${student.id}`,
            display_name: student.name,
            email: student.email,
            department: student.department || null,
            rollNo: student.rollNo,
            program: student.program,
            currentRoles: [],
            auth_user_id: null,
            userType: 'student'
          });
        }
      });

      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!staffLoading && !studentsLoading) {
      fetchUsersWithRoles();
    }
  }, [staffLoading, studentsLoading]);

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkAssignment = async () => {
    if (selectedUsers.length === 0 || !selectedRole) return;
    
    try {
      setAssigning(true);
      
      // Get the selected users
      const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id));
      
      // Filter only users who have auth_user_id (authenticated users)
      const authenticatedUsers = selectedUserObjects.filter(user => user.auth_user_id);
      
      if (authenticatedUsers.length === 0) {
        toast({
          title: "Warning",
          description: "Selected users need to sign up first before roles can be assigned",
          variant: "destructive",
        });
        return;
      }
      
      // Assign role to each authenticated user
      for (const user of authenticatedUsers) {
        await assignRoleToUser(user.auth_user_id!, selectedRole);
      }
      
      const notAuthenticatedCount = selectedUserObjects.length - authenticatedUsers.length;
      
      toast({
        title: "Success",
        description: `Role assigned to ${authenticatedUsers.length} user(s) successfully${
          notAuthenticatedCount > 0 ? `. ${notAuthenticatedCount} users need to sign up first.` : ''
        }`,
      });
      
      // Reset selections and refresh data
      setSelectedUsers([]);
      setSelectedRole("");
      await fetchUsersWithRoles();
      
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      toast({
        title: "Error",
        description: "Failed to assign roles to some users",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles Assignment</h1>
          <p className="text-muted-foreground">
            Assign and manage user roles and permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                User Selection
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading || staffLoading || studentsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found matching your search.
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleUserSelection(user.id, !!checked)}
                    />
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {user.display_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.display_name}</p>
                          <Badge variant="outline" className="text-xs">
                            {user.userType}
                          </Badge>
                          {!user.auth_user_id && (
                            <Badge variant="destructive" className="text-xs">
                              Not signed up
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{user.department || 'No department'}</p>
                          {user.designation && <p>Designation: {user.designation}</p>}
                          {user.rollNo && <p>Roll No: {user.rollNo}</p>}
                          {user.program && <p>Program: {user.program}</p>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {user.currentRoles.length > 0 ? (
                          user.currentRoles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            No roles
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Role Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole} disabled={rolesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Choose a role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAssignableRoles().map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-xs text-muted-foreground">{role.description || 'No description'}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUsers.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {selectedUsers.length} user(s) selected for role assignment
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleBulkAssignment}
                disabled={selectedUsers.length === 0 || !selectedRole || assigning || rolesLoading}
                className="w-full"
              >
                {assigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign Role to Selected Users'
                )}
              </Button>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {user?.role === 'super_admin' ? 'All Available Roles' : 'Assignable Roles'}
                </h4>
                {rolesLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  getAssignableRoles().map((role) => (
                    <div key={role.id} className="p-2 border rounded text-sm">
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {role.description || 'No description available'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {role.user_count || 0} users assigned
                      </div>
                    </div>
                  ))
                )}
                {getAssignableRoles().length === 0 && !rolesLoading && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    You don't have permission to assign roles
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RolesAssignment;