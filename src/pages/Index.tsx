
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Calendar, Target, FileText, Bell, BarChart3, Settings, Shield, GraduationCap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentsData } from "@/hooks/useStudentsData";
import { useStaffData } from "@/hooks/useStaffData";
import { TestDepartments } from "@/components/TestDepartments";

const Index = () => {
  const { user } = useAuth();
  const { students, loading: studentsLoading, error: studentsError, refetch: refetchStudents, isDemo } = useStudentsData();
  const { staff, loading: staffLoading, error: staffError, refetch: refetchStaff } = useStaffData();
  
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Academic Mentoring Platform Overview</p>
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

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Students Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Students Overview</CardTitle>
              <CardDescription>Current student statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Students</span>
                  <span className="font-bold text-2xl text-blue-600">
                    {studentsLoading ? '...' : students.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Students</span>
                  <span className="font-bold text-2xl text-green-600">
                    {studentsLoading ? '...' : students.filter(s => s.status === 'active').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Overview</CardTitle>
              <CardDescription>Current staff statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Staff</span>
                  <span className="font-bold text-2xl text-purple-600">
                    {staffLoading ? '...' : staff.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Staff</span>
                  <span className="font-bold text-2xl text-green-600">
                    {staffLoading ? '...' : staff.filter(s => s.status === 'active').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
             <CardHeader>
               <CardTitle>Activity Overview</CardTitle>
               <CardDescription>Platform activity metrics</CardDescription>
             </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week's Sessions</span>
                  <span className="font-bold text-2xl text-yellow-600">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Goals</span>
                  <span className="font-bold text-2xl text-red-600">23</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your mentoring activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">Session scheduled</p>
                  <p className="text-sm text-gray-600">Tomorrow at 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium">Goal completed</p>
                  <p className="text-sm text-gray-600">Research proposal done</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                <Bell className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium">New Q&A submission</p>
                  <p className="text-sm text-gray-600">Career guidance request</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

         {/* Department API Test */}
         <div className="mt-8">
           <TestDepartments />
         </div>
       </main>
     </div>
  );
};

export default Index;
