
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Calendar, Target, FileText, Bell, BarChart3, Settings, Shield, GraduationCap, BookOpen, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentsData } from "@/hooks/useStudentsData";
import { useStaffData } from "@/hooks/useStaffData";
import { TestDepartments } from "@/components/TestDepartments";
import { useCounselingSessions } from "@/hooks/useCounselingSessions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'session_created' | 'goal_completed' | 'meeting_scheduled';
  timestamp: Date;
  isRead: boolean;
  sessionData?: any;
}

const Index = () => {
  const { user } = useAuth();
  const { students, loading: studentsLoading, error: studentsError, refetch: refetchStudents, isDemo } = useStudentsData();
  const { staff, loading: staffLoading, error: staffError, refetch: refetchStaff } = useStaffData();
  const { sessions, upcomingSessions, completedSessions, loading: sessionsLoading } = useCounselingSessions();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Default to admin if no user (for development)
  const userRole = user?.role || "admin";

  // Set up real-time notifications
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'counseling_sessions'
        },
        (payload) => {
          const session = payload.new;
          const newNotification: Notification = {
            id: `session-${session.id}`,
            title: 'New Counseling Session Created',
            message: `Session "${session.name}" has been scheduled for ${new Date(session.session_date).toLocaleDateString()}`,
            type: 'session_created',
            timestamp: new Date(),
            isRead: false,
            sessionData: session
          };

          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
          
          toast({
            title: "New Session Created",
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

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

  // Get recent activities (last 7 days)
  const getRecentActivities = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return sessions.filter(session => 
      new Date(session.created_at) >= sevenDaysAgo
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const getUpcomingThisWeek = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return upcomingSessions.filter(session => {
      const sessionDate = new Date(session.session_date);
      return sessionDate >= today && sessionDate <= nextWeek;
    }).sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const recentActivities = getRecentActivities();
  const upcomingThisWeek = getUpcomingThisWeek();

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
                Notifications ({notifications.filter(n => !n.isRead).length})
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

        {/* Recent Activity & Session Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentActivities.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          Session Created: {session.name}
                        </p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span>📅 {formatDate(session.session_date)}</span>
                            {session.start_time && (
                              <span>⏰ {formatTime(session.start_time)}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span>👥 {session.session_type === 'one_on_one' ? '1:1' : 'Group'}</span>
                            <span>📍 {session.location || 'No location'}</span>
                          </div>
                          <div className="text-gray-500">
                            Participants: {session.participants?.length || 0} student{(session.participants?.length || 0) !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge 
                            variant={session.status === 'completed' ? 'default' : session.status === 'cancelled' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Create a counseling session to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Session Schedule
              </CardTitle>
              <CardDescription>Upcoming sessions this week</CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : upcomingThisWeek.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {upcomingThisWeek.map((session) => (
                    <div key={session.id} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                      <div className="flex-shrink-0">
                        <Calendar className="w-5 h-5 text-green-600 mt-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {session.name}
                        </p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">📅 {formatDate(session.session_date)}</span>
                            {session.start_time && (
                              <span className="font-medium">⏰ {formatTime(session.start_time)}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span>👥 {session.session_type === 'one_on_one' ? '1:1 Session' : 'Group Session'}</span>
                            {session.location && <span>📍 {session.location}</span>}
                          </div>
                          <div className="text-gray-500">
                            Students: {session.participants?.length || 0}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {session.priority || 'normal'} priority
                          </Badge>
                          <Link to={`/counseling`} className="text-xs text-blue-600 hover:underline">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No upcoming sessions</p>
                  <p className="text-xs">Schedule a session to see it here</p>
                  <Link to="/counseling">
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-1" />
                      Create Session
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-orange-600" />
                  Live Notifications
                </div>
                <Badge variant="secondary" className="text-xs">
                  {notifications.filter(n => !n.isRead).length} unread
                </Badge>
              </CardTitle>
              <CardDescription>Real-time updates and system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                      notification.isRead 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-orange-50 border-orange-200 border-l-4 border-l-orange-500'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === 'session_created' && (
                        <Calendar className="w-5 h-5 text-orange-600" />
                      )}
                      {notification.type === 'goal_completed' && (
                        <Target className="w-5 h-5 text-green-600" />
                      )}
                      {notification.type === 'meeting_scheduled' && (
                        <Bell className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                              className="text-xs px-2 py-1 h-auto"
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="text-xs px-1 py-1 h-auto text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals & Completion Activity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Goal Completion Activity
            </CardTitle>
            <CardDescription>Recent goal achievements and progress updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                <Target className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Research Proposal Completed</p>
                  <p className="text-xs text-gray-600">Student: John Doe</p>
                  <p className="text-xs text-gray-500">Completed 2 days ago</p>
                  <Badge variant="default" className="text-xs mt-1">Goal Achieved</Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Academic Progress Review</p>
                  <p className="text-xs text-gray-600">Student: Jane Smith</p>
                  <p className="text-xs text-gray-500">In Progress - 75%</p>
                  <Badge variant="secondary" className="text-xs mt-1">Ongoing</Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-l-yellow-500">
                <Target className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Career Planning Goals</p>
                  <p className="text-xs text-gray-600">Student: Mike Johnson</p>
                  <p className="text-xs text-gray-500">Due in 3 days</p>
                  <Badge variant="outline" className="text-xs mt-1">Pending</Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/goals">
                <Button variant="outline" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  View All Goals
                </Button>
              </Link>
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
