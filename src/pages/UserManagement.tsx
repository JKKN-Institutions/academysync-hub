import { Outlet, useLocation, NavLink } from "react-router-dom";
import { BarChart3, Users, Shield, Settings, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const UserManagement = () => {
  const location = useLocation();
  const isRootPath = location.pathname === "/user-management";

  const menuItems = [
    {
      title: "Analytics Dashboard",
      path: "/user-management/analytics",
      icon: BarChart3,
      description: "User analytics and insights"
    },
    {
      title: "All Users",
      path: "/user-management/users",
      icon: Users,
      description: "View and manage all users"
    },
    {
      title: "Roles Assignment",
      path: "/user-management/roles-assignment",
      icon: Shield,
      description: "Assign roles to users"
    },
    {
      title: "Role Management",
      path: "/user-management/role-management",
      icon: Settings,
      description: "Create and manage roles"
    },
    {
      title: "Activity Audit Logs",
      path: "/user-management/audit-logs",
      icon: Activity,
      description: "View user activity logs"
    }
  ];

  if (isRootPath) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage users, roles, and monitor system activity
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Admin Module
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.path} className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {item.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {item.description}
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <NavLink to={item.path}>
                      Open
                    </NavLink>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-2xl font-bold">2,132</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">124</p>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">15</p>
                <p className="text-xs text-muted-foreground">User Roles</p>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">1,847</p>
                <p className="text-xs text-muted-foreground">Recent Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default UserManagement;