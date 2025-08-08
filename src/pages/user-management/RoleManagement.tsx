import { useState } from "react";
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const RoleManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const roles = [
    {
      id: "1",
      name: "Administrator",
      description: "Full system access and management capabilities",
      userCount: 15,
      permissions: ["user_management", "system_config", "reports_access", "audit_logs"],
      status: "Active",
      createdAt: "2024-01-01"
    },
    {
      id: "2",
      name: "Mentor",
      description: "Can mentor students and access counseling features",
      userCount: 245,
      permissions: ["counseling_sessions", "student_access", "reports_view"],
      status: "Active",
      createdAt: "2024-01-01"
    },
    {
      id: "3",
      name: "Student",
      description: "Standard student access to mentoring features",
      userCount: 1847,
      permissions: ["session_participation", "goal_setting", "profile_view"],
      status: "Active",
      createdAt: "2024-01-01"
    },
    {
      id: "4",
      name: "Department Lead",
      description: "Oversight of department-specific mentoring activities",
      userCount: 25,
      permissions: ["dept_reports", "mentor_oversight", "student_access"],
      status: "Active",
      createdAt: "2024-01-01"
    },
  ];

  const allPermissions = [
    { id: "user_management", label: "User Management", description: "Create, edit, and manage users" },
    { id: "system_config", label: "System Configuration", description: "Configure system settings" },
    { id: "reports_access", label: "Full Reports Access", description: "Access all reports and analytics" },
    { id: "audit_logs", label: "Audit Logs", description: "View system audit logs" },
    { id: "counseling_sessions", label: "Counseling Sessions", description: "Create and manage counseling sessions" },
    { id: "student_access", label: "Student Access", description: "View and interact with student data" },
    { id: "reports_view", label: "Reports View", description: "View reports and basic analytics" },
    { id: "session_participation", label: "Session Participation", description: "Participate in counseling sessions" },
    { id: "goal_setting", label: "Goal Setting", description: "Set and manage personal goals" },
    { id: "profile_view", label: "Profile View", description: "View own profile information" },
    { id: "dept_reports", label: "Department Reports", description: "View department-specific reports" },
    { id: "mentor_oversight", label: "Mentor Oversight", description: "Oversee mentor activities" },
  ];

  const handleCreateRole = () => {
    // Handle role creation logic
    setIsCreateDialogOpen(false);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = () => {
    // Handle role update logic
    setIsEditDialogOpen(false);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Create and manage user roles and permissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="roleName">Role Name</Label>
                <Input id="roleName" placeholder="Enter role name" />
              </div>
              <div>
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea id="roleDescription" placeholder="Describe the role's purpose" />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {allPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox id={permission.id} />
                      <div className="flex-1">
                        <label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                          {permission.label}
                        </label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{role.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 2).map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                      {role.permissions.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{role.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {role.createdAt}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role details and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editRoleName">Role Name</Label>
                <Input id="editRoleName" defaultValue={selectedRole.name} />
              </div>
              <div>
                <Label htmlFor="editRoleDescription">Description</Label>
                <Textarea id="editRoleDescription" defaultValue={selectedRole.description} />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {allPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-${permission.id}`} 
                        defaultChecked={selectedRole.permissions.includes(permission.id)}
                      />
                      <div className="flex-1">
                        <label htmlFor={`edit-${permission.id}`} className="text-sm font-medium cursor-pointer">
                          {permission.label}
                        </label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagement;