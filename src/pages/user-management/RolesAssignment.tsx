import { useState } from "react";
import { Search, UserCheck, AlertCircle } from "lucide-react";
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

const RolesAssignment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");

  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      currentRoles: ["Student"],
      department: "Computer Science",
      status: "Active"
    },
    {
      id: "2",
      name: "Dr. Jane Smith",
      email: "jane.smith@example.com",
      currentRoles: ["Mentor", "Dept Lead"],
      department: "Engineering",
      status: "Active"
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      currentRoles: ["Admin"],
      department: "IT",
      status: "Active"
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      currentRoles: ["Student"],
      department: "Business",
      status: "Active"
    },
  ];

  const availableRoles = [
    { value: "admin", label: "Administrator", description: "Full system access" },
    { value: "mentor", label: "Mentor", description: "Can mentor students" },
    { value: "student", label: "Student", description: "Student access" },
    { value: "dept_lead", label: "Department Lead", description: "Department oversight" },
  ];

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkAssignment = () => {
    if (selectedUsers.length === 0 || !selectedRole) return;
    
    // Handle bulk role assignment logic here
    console.log(`Assigning role ${selectedRole} to users:`, selectedUsers);
    
    // Reset selections
    setSelectedUsers([]);
    setSelectedRole("");
  };

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
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleUserSelection(user.id, !!checked)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.department}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.currentRoles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
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
                disabled={selectedUsers.length === 0 || !selectedRole}
                className="w-full"
              >
                Assign Role to Selected Users
              </Button>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Available Roles</h4>
                {availableRoles.map((role) => (
                  <div key={role.value} className="p-2 border rounded text-sm">
                    <div className="font-medium">{role.label}</div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RolesAssignment;