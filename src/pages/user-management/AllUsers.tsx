import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  Plus, 
  MoreVertical, 
  Users, 
  Eye, 
  Edit, 
  UserX, 
  Trash2, 
  RefreshCw,
  Filter
} from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { useInstitutionsData } from "@/hooks/useInstitutionsData";
import { useRoles } from "@/hooks/useRoles";

interface User {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  mobile?: string;
  department?: string;
  institution?: string;
  external_id?: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
  avatar_url?: string;
  supervisor_id?: string;
  supervisor_name?: string;
}

interface AddUserFormData {
  display_name: string;
  email: string;
  mobile: string;
  role: string;
  department: string;
  institution: string;
  supervisor_id: string;
}

const AllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Dialog states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  
  // Add user form data
  const [addUserForm, setAddUserForm] = useState<AddUserFormData>({
    display_name: "",
    email: "",
    mobile: "",
    role: "",
    department: "",
    institution: "",
    supervisor_id: ""
  });

  const { toast } = useToast();
  const { institutions, loading: institutionsLoading } = useInstitutionsData();
  const { roles, loading: rolesLoading } = useRoles();

  // Available departments/institutions
  const [departments, setDepartments] = useState<string[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchSupervisors();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, institutionFilter, roleFilter]);

  const fetchDepartments = async () => {
    try {
      // Fetch departments from staff table
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('department')
        .not('department', 'is', null);
      
      if (staffError) throw staffError;
      
      const uniqueDepartments = [...new Set(staffData.map(d => d.department).filter(Boolean))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSupervisors = async () => {
    try {
      // Fetch users who can be supervisors (admin, super_admin, dept_lead)
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          display_name,
          role
        `)
        .in('role', ['admin', 'super_admin', 'dept_lead', 'mentor']);

      if (profilesError) throw profilesError;

      const supervisorUsers = profilesData.map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name || 'Unknown User',
        email: '',
        role: profile.role,
        status: 'active' as const,
        created_at: '',
      }));

      setSupervisors(supervisorUsers);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch user profiles with role assignments including inactive users
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          display_name,
          department,
          external_id,
          created_at,
          role
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get auth users for email data
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.warn('Cannot fetch auth users (admin access required)');
      }

      // Get staff data for additional info including inactive staff
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('staff_id, name, email, mobile, department, status');

      if (staffError) throw staffError;

      // Create sample users if no real data exists for testing
      const sampleUsers = [
        {
          id: 'sample-mentor-1',
          user_id: 'sample-mentor-1',
          display_name: 'Dr. John Smith',
          email: 'john.smith@jkkn.edu',
          mobile: '+91 98765 43210',
          department: 'Computer Science',
          institution: 'JKKN College of Arts and Science (Aided)',
          external_id: 'FAC001',
          role: 'mentor',
          status: 'active' as const,
          created_at: new Date().toISOString(),
          avatar_url: undefined,
          supervisor_id: undefined,
          supervisor_name: undefined
        },
        {
          id: 'sample-mentee-1',
          user_id: 'sample-mentee-1',
          display_name: 'Priya Sharma',
          email: 'priya.sharma@student.jkkn.edu',
          mobile: '+91 87654 32109',
          department: 'Computer Science',
          institution: 'JKKN College of Arts and Science (Aided)',
          external_id: 'STU001',
          role: 'mentee',
          status: 'active' as const,
          created_at: new Date().toISOString(),
          avatar_url: undefined,
          supervisor_id: undefined,
          supervisor_name: undefined
        },
        {
          id: 'sample-admin-1',
          user_id: 'sample-admin-1',
          display_name: 'Admin User',
          email: 'admin@jkkn.edu',
          mobile: '+91 76543 21098',
          department: 'Administration',
          institution: 'JKKN College of Arts and Science (Self)',
          external_id: 'ADM001',
          role: 'admin',
          status: 'active' as const,
          created_at: new Date().toISOString(),
          avatar_url: undefined,
          supervisor_id: undefined,
          supervisor_name: undefined
        }
      ];

      // Combine all data including inactive users
      const combinedUsers = (profilesData || []).map(profile => {
        const authUser = authUsers?.users?.find((u: any) => u.id === profile.user_id);
        const staffInfo = staffData?.find(s => s.email === authUser?.email);
        
        // Determine institution from department mapping or use default
        let institution = undefined;
        if (staffInfo?.department) {
          institution = institutions.find(inst => 
            inst.institution_name.toLowerCase().includes(staffInfo.department?.toLowerCase() || '') ||
            staffInfo.department?.toLowerCase().includes(inst.institution_name.toLowerCase())
          )?.institution_name;
        }
        
        // If no institution found from department, assign based on domain or default
        if (!institution && authUser?.email) {
          if (authUser.email.includes('jkkn')) {
            institution = institutions.length > 0 ? institutions[0].institution_name : 'JKKN College of Arts and Science (Aided)';
          }
        }

        return {
          id: profile.id,
          user_id: profile.user_id,
          display_name: profile.display_name || staffInfo?.name || authUser?.email || 'Unknown User',
          email: authUser?.email || staffInfo?.email || '',
          mobile: staffInfo?.mobile || '',
          department: profile.department || staffInfo?.department,
          institution: institution || 'JKKN College of Arts and Science (Aided)', // Default institution
          external_id: profile.external_id || staffInfo?.staff_id,
          role: (profile.role || 'mentee').toString(),
          status: (staffInfo?.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
          created_at: profile.created_at,
          avatar_url: undefined,
          supervisor_id: undefined,
          supervisor_name: undefined
        };
      });

      // If no real users found, add sample users for testing
      const finalUsers = combinedUsers.length > 0 ? combinedUsers : sampleUsers;
      
      setUsers(finalUsers);
      setTotalUsers(finalUsers.length);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = !searchTerm || 
                           user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.external_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesInstitution = institutionFilter === 'all' || 
                                user.institution === institutionFilter ||
                                !institutionFilter ||
                                !user.institution; // Include users without institutions when "all" is selected
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesInstitution && matchesRole;
    });
    
    setFilteredUsers(filtered);
  };

  const handleAddUser = async () => {
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: addUserForm.email,
        password: 'TempPassword123!', // Temporary password
        email_confirm: true
      });

      if (authError) throw authError;

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          display_name: addUserForm.display_name,
          department: addUserForm.department,
          role: addUserForm.role
        });

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setIsAddUserOpen(false);
      setAddUserForm({
        display_name: "",
        email: "",
        mobile: "",
        role: "",
        department: "",
        institution: "",
        supervisor_id: ""
      });
      
      await fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      // Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.user_id);

      if (profileError) throw profileError;

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.user_id);
      
      if (authError) {
        console.warn('Could not delete auth user:', authError);
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        if (user) {
          await handleDeleteUser(user);
        }
      }
      
      setSelectedUsers([]);
      setIsBulkDeleteOpen(false);
      
      toast({
        title: "Success",
        description: `Deleted ${selectedUsers.length} users`,
      });
    } catch (error: any) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Error",
        description: "Failed to delete selected users",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async (user: User, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Mobile', 'Role', 'Department', 'Status', 'Joined'],
      ...filteredUsers.map(user => [
        user.display_name,
        user.email,
        user.mobile || '',
        user.role,
        user.department || '',
        user.status,
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'mentor': return 'bg-blue-100 text-blue-800';
      case 'mentee': return 'bg-green-100 text-green-800';
      case 'dept_lead': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">View and manage user accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
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
            
            <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Institutions" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map(inst => (
                  <SelectItem key={inst.id} value={inst.institution_name}>{inst.institution_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="mentee">Mentee</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="dept_lead">Dept Lead</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setInstitutionFilter("all");
                setRoleFilter("all");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Change Role
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setIsBulkDeleteOpen(true)}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={10} columns={7} showHeader={false} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.display_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.external_id && (
                            <div className="text-xs text-muted-foreground">ID: {user.external_id}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.mobile || '-'}</TableCell>
                    <TableCell>
                       <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                         {(user.role || '').toString().replace('_', ' ').toUpperCase()}
                       </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border z-50">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem
                             onClick={() => handleChangeRole(user, 'mentor')}
                             disabled={user.role === 'mentor'}
                           >
                             <UserX className="h-4 w-4 mr-2" />
                             Change to Mentor
                           </DropdownMenuItem>
                           <DropdownMenuItem
                             onClick={() => handleChangeRole(user, 'mentee')}
                             disabled={user.role === 'mentee'}
                           >
                             <UserX className="h-4 w-4 mr-2" />
                             Change to Mentee
                           </DropdownMenuItem>
                           <DropdownMenuItem
                             onClick={() => handleChangeRole(user, 'admin')}
                             disabled={user.role === 'admin'}
                           >
                             <UserX className="h-4 w-4 mr-2" />
                             Change to Admin
                           </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setUserToDelete(user);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
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

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with role and department assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input
                value={addUserForm.display_name}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mobile Number</label>
              <Input
                value={addUserForm.mobile}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="Enter mobile number"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={addUserForm.role} onValueChange={(value) => setAddUserForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="mentee">Mentee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="dept_lead">Dept Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Institution</label>
              <Select value={addUserForm.institution} onValueChange={(value) => setAddUserForm(prev => ({ ...prev, institution: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {institutions.map(inst => (
                    <SelectItem key={inst.id} value={inst.institution_name}>{inst.institution_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <Select value={addUserForm.department} onValueChange={(value) => setAddUserForm(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Supervisor (Optional)</label>
              <Select value={addUserForm.supervisor_id} onValueChange={(value) => setAddUserForm(prev => ({ ...prev, supervisor_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="no_supervisor">No Supervisor</SelectItem>
                  {supervisors.map(supervisor => (
                    <SelectItem key={supervisor.id} value={supervisor.user_id}>{supervisor.display_name} ({supervisor.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={!addUserForm.display_name || !addUserForm.email || !addUserForm.role}
            >
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.display_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (userToDelete) {
                  handleDeleteUser(userToDelete);
                  setIsDeleteDialogOpen(false);
                  setUserToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUsers.length} selected users? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AllUsers;