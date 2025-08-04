
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Target, FileText, Bell, BarChart3, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  // Default to admin if no user (for development)
  const userRole = user?.role || "admin";

  const quickActions = [
    { icon: Users, label: "My Assignments", href: "/assignments", roles: ["mentor", "mentee"] },
    { icon: Calendar, label: "Counseling Sessions", href: "/counseling", roles: ["mentor", "mentee"] },
    { icon: Target, label: "Goals & Plans", href: "/goals", roles: ["mentor", "mentee"] },
    { icon: FileText, label: "Meeting Logs", href: "/meetings", roles: ["mentor"] },
    { icon: BarChart3, label: "Reports", href: "/reports", roles: ["admin", "dept_lead"] },
    { icon: Settings, label: "Admin Panel", href: "/admin", roles: ["admin"] },
  ];

  const filteredActions = quickActions.filter(action => 
    action.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AcademySync Hub</h1>
              <p className="text-sm text-gray-600">Academic Mentoring Platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                People API Connected
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications (3)
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.displayName || 'User'}</h2>
          <p className="text-lg text-gray-600">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} • {user?.department || 'Department'}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-1" />
            Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <Icon className="w-5 h-5 mr-3 text-blue-600" />
                      {action.label}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across your mentoring activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Session scheduled with Alex Chen</p>
                    <p className="text-sm text-gray-600">Tomorrow at 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Goal completed: Research Project Proposal</p>
                    <p className="text-sm text-gray-600">By Maria Rodriguez - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Bell className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">New Q&A submission</p>
                    <p className="text-sm text-gray-600">From John Smith - Career guidance</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Overview</CardTitle>
              <CardDescription>Current mentoring statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Mentees</span>
                  <span className="font-bold text-2xl text-blue-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week's Sessions</span>
                  <span className="font-bold text-2xl text-green-600">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Goals</span>
                  <span className="font-bold text-2xl text-yellow-600">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Open Q&As</span>
                  <span className="font-bold text-2xl text-red-600">5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              System Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">People API: Connected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Calendar Sync: Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Last Data Sync: 5 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
