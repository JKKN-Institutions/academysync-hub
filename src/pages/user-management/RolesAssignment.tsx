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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface UserWithRoles {
  id: string;
  display_name: string;
  email: string;
  department: string | null;
  currentRoles: string[];
  auth_user_id: string;
}

const RolesAssignment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const { roles, loading: rolesLoading, assignRoleToUser } = useRoles();
  const { toast } = useToast();

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

      // Combine data
      const usersWithRoles: UserWithRoles[] = (profiles || []).map((profile) => {
        const authUser = authUsers.find(user => user.id === profile.user_id);
        const userRoles = (roleAssignments || [])
          .filter(assignment => assignment.user_id === profile.user_id)
          .map(assignment => (assignment.roles as any)?.name)
          .filter(Boolean);

        return {
          id: profile.id || crypto.randomUUID(),
          display_name: profile.display_name || authUser?.email || 'Unknown User',
          email: authUser?.email || '',
          department: profile.department || null,
          currentRoles: userRoles,
          auth_user_id: profile.user_id
        };
      });

      setUsers(usersWithRoles);
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
    fetchUsersWithRoles();
  }, []);

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
      
      // Get the selected users' auth user IDs
      const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id));
      
      // Assign role to each selected user
      for (const user of selectedUserObjects) {
        await assignRoleToUser(user.auth_user_id, selectedRole);
      }
      
      toast({
        title: "Success",
        description: `Role assigned to ${selectedUsers.length} user(s) successfully`,
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
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
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
              {loading ? (
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
                        <p className="font-medium">{user.display_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.department || 'No department'}</p>
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
                    {roles.map((role) => (
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
                <h4 className="text-sm font-medium">Available Roles</h4>
                {rolesLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  roles.map((role) => (
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RolesAssignment;