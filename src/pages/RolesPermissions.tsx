import { useState, useEffect } from "react";
import { Search, Users, Filter, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TableSkeleton } from "@/components/ui/loading-skeleton";

interface UserRoleAssignment {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  department?: string;
  current_roles: string[];
  staff_id?: string;
  updated_at: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

const RolesPermissions = () => {
  const [users, setUsers] = useState<UserRoleAssignment[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkRoleAssignment, setBulkRoleAssignment] = useState<string>("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('id, name, description')
        .eq('status', 'active')
        .order('name');

      if (rolesError) throw rolesError;
      setRoles(rolesData || []);

      // Fetch users with their profiles including the legacy role field
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, user_id, display_name, department, role');

      if (profilesError) throw profilesError;

      // Get auth users data
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.warn('Cannot fetch auth users (admin access required)');
        // Continue with just profile data
      }

      // Get role assignments separately
      const { data: roleAssignments, error: roleAssignmentsError } = await supabase
        .from('user_role_assignments')
        .select(`
          user_id,
          status,
          roles(id, name)
        `)
        .eq('status', 'active');

      if (roleAssignmentsError) throw roleAssignmentsError;

      // Combine data
      const usersWithRoles = (profilesData || []).map(profile => {
        const authUser = authUsers?.users?.find((u: any) => u.id === profile.user_id);
        const userRoleAssignments = (roleAssignments || []).filter((ra: any) => ra.user_id === profile.user_id);
        
        // Get roles from both new system (user_role_assignments) and legacy system (user_profiles.role)
        const newSystemRoles = userRoleAssignments
          .filter(ra => ra?.roles && typeof ra.roles === 'object' && 'name' in ra.roles)
          .map(ra => (ra.roles as any).name);
        
        const legacyRole = profile.role ? [profile.role] : [];
        
        // Prefer new system roles, fallback to legacy role
        const currentRoles = newSystemRoles.length > 0 ? newSystemRoles : legacyRole;
        
        return {
          id: profile.user_id,
          user_id: profile.user_id,
          display_name: profile.display_name || authUser?.email || 'Unknown User',
          email: authUser?.email || '',
          department: profile.department,
          current_roles: currentRoles,
          updated_at: new Date().toISOString()
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users and roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRoleName: string) => {
    try {
      const newRole = roles.find(r => r.name === newRoleName);
      if (!newRole) return;

      // Update both systems for backward compatibility
      
      // 1. Update the user_profiles.role field (legacy system)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ role: newRoleName })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // 2. Remove existing role assignments for this user
      await supabase
        .from('user_role_assignments')
        .delete()
        .eq('user_id', userId);

      // 3. Add new role assignment
      const { error: assignmentError } = await supabase
        .from('user_role_assignments')
        .insert({
          user_id: userId,
          role_id: newRole.id,
          status: 'active',
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (assignmentError) throw assignmentError;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleBulkRoleAssignment = async () => {
    if (!bulkRoleAssignment || selectedUsers.length === 0) return;

    try {
      const role = roles.find(r => r.name === bulkRoleAssignment);
      if (!role) return;

      // Process bulk assignment
      for (const userId of selectedUsers) {
        // Update user_profiles.role (legacy system)
        await supabase
          .from('user_profiles')
          .update({ role: bulkRoleAssignment })
          .eq('user_id', userId);

        // Remove existing assignments
        await supabase
          .from('user_role_assignments')
          .delete()
          .eq('user_id', userId);

        // Add new assignment
        await supabase
          .from('user_role_assignments')
          .insert({
            user_id: userId,
            role_id: role.id,
            status: 'active',
            assigned_by: (await supabase.auth.getUser()).data.user?.id
          });
      }

      toast({
        title: "Success",
        description: `Updated roles for ${selectedUsers.length} users`,
      });

      setSelectedUsers([]);
      setBulkRoleAssignment("");
      await fetchData();
    } catch (error: any) {
      console.error('Error in bulk assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update roles",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || user.current_roles.includes(roleFilter);
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const uniqueDepartments = [...new Set(users.map(u => u.department).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage user roles and permissions. Only super admins can modify roles.
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Role Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg mb-4">
              <span className="text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <Select value={bulkRoleAssignment} onValueChange={setBulkRoleAssignment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Assign Role" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleBulkRoleAssignment}
                disabled={!bulkRoleAssignment}
              >
                Apply Changes
              </Button>
            </div>
          )}

          {/* Users Table */}
          {loading ? (
            <TableSkeleton rows={8} columns={5} showHeader={false} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers(filteredUsers.map(u => u.user_id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>New Role</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.user_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, user.user_id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.user_id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.display_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.department && (
                          <div className="text-xs text-muted-foreground">{user.department}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.current_roles.map(role => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.current_roles[0] || ""}
                        onValueChange={(value) => handleRoleChange(user.user_id, value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          {roles.map(role => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border z-50">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RolesPermissions;