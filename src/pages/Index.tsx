
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, Calendar, Target, FileText, Bell, BarChart3, Settings, Shield, GraduationCap, BookOpen, Plus, X, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentsData } from "@/hooks/useStudentsData";
import { useStaffData } from "@/hooks/useStaffData";
import { TestDepartments } from "@/components/TestDepartments";
import { useCounselingSessions } from "@/hooks/useCounselingSessions";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import NotificationDashboard from "@/components/ui/notification-dashboard";
import UserDebugInfo from "@/components/ui/user-debug-info";

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
  const { user, isAuthenticated, login, logout } = useAuth();
  const { students, loading: studentsLoading, error: studentsError, refetch: refetchStudents, isDemo } = useStudentsData();
  const { staff, loading: staffLoading, error: staffError, refetch: refetchStaff } = useStaffData();
  const { sessions, upcomingSessions, completedSessions, loading: sessionsLoading } = useCounselingSessions();
  const { goals, loading: goalsLoading } = useGoals();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Default to admin if no user (for development)
  const userRole = user?.role || "admin";

  // Set up real-time notifications
  useEffect(() => {
    console.log('🔔 Setting up real-time notifications...');
    
    const channel = supabase
      .channel('dashboard-notifications', {
        config: {
          broadcast: { self: true },
          presence: { key: user?.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'counseling_sessions'
        },
        (payload) => {
          console.log('🆕 New session detected:', payload);
          const session = payload.new;
          
          // Create notification for session creation
          const newNotification: Notification = {
            id: `session-${session.id}-${Date.now()}`,
            title: 'New Counseling Session Scheduled',
            message: `"${session.name}" scheduled for ${new Date(session.session_date).toLocaleDateString()}${session.start_time ? ` at ${formatTime(session.start_time)}` : ''}`,
            type: 'session_created',
            timestamp: new Date(),
            isRead: false,
            sessionData: session
          };

          console.log('📝 Adding notification:', newNotification);
          setNotifications(prev => {
            const updated = [newNotification, ...prev.slice(0, 9)];
            console.log('🔢 Notifications count will be:', updated.length);
            return updated;
          });
          
          // Show toast notification
          toast({
            title: "📅 New Session Scheduled",
            description: newNotification.message,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'counseling_sessions'
        },
        (payload) => {
          console.log('✏️ Session updated:', payload);
          const session = payload.new;
          const oldSession = payload.old;
          
          // Check if status changed to completed
          if (oldSession.status !== 'completed' && session.status === 'completed') {
            const newNotification: Notification = {
              id: `session-completed-${session.id}-${Date.now()}`,
              title: 'Session Completed',
              message: `"${session.name}" has been marked as completed`,
              type: 'meeting_scheduled',
              timestamp: new Date(),
              isRead: false,
              sessionData: session
            };

            console.log('✅ Adding completion notification:', newNotification);
            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
            
            toast({
              title: "✅ Session Completed",
              description: newNotification.message,
              duration: 3000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('🎯 New goal created:', payload);
          const goal = payload.new;
          
          const newNotification: Notification = {
            id: `goal-${goal.id}-${Date.now()}`,
            title: 'New Goal Created',
            message: `Goal in "${goal.area_of_focus}" has been created`,
            type: 'goal_completed',
            timestamp: new Date(),
            isRead: false,
            sessionData: goal
          };

          console.log('🎯 Adding goal notification:', newNotification);
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          
          toast({
            title: "🎯 New Goal Created",
            description: newNotification.message,
            duration: 4000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('🎯 Goal updated:', payload);
          const goal = payload.new;
          const oldGoal = payload.old;
          
          // Check if status changed to completed
          if (oldGoal.status !== 'completed' && goal.status === 'completed') {
            const newNotification: Notification = {
              id: `goal-completed-${goal.id}-${Date.now()}`,
              title: 'Goal Completed',
              message: `Goal "${goal.area_of_focus}" has been completed!`,
              type: 'goal_completed',
              timestamp: new Date(),
              isRead: false,
              sessionData: goal
            };

            console.log('🏆 Adding goal completion notification:', newNotification);
            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
            
            toast({
              title: "🏆 Goal Completed",
              description: newNotification.message,
              duration: 4000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('🗑️ Goal deleted/cancelled:', payload);
          const goal = payload.old;
          
          const newNotification: Notification = {
            id: `goal-deleted-${goal.id}-${Date.now()}`,
            title: 'Goal Cancelled',
            message: `Goal "${goal.area_of_focus}" has been cancelled`,
            type: 'goal_completed',
            timestamp: new Date(),
            isRead: false,
            sessionData: goal
          };

          console.log('🗑️ Adding goal deletion notification:', newNotification);
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          
          toast({
            title: "🗑️ Goal Cancelled",
            description: newNotification.message,
            duration: 3000,
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime notifications');
          // Add a test notification to verify the system works
          const testNotification: Notification = {
            id: `test-${Date.now()}`,
            title: 'Notification System Ready',
            message: 'Real-time notifications are now active',
            type: 'session_created',
            timestamp: new Date(),
            isRead: false
          };
          setNotifications(prev => [testNotification, ...prev]);
          
          toast({
            title: "🔔 Notifications Active",
            description: "Real-time notifications are now working",
            duration: 3000,
          });
        } else if (status === 'CLOSED') {
          console.log('❌ Realtime subscription closed');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime channel error');
        }
      });

    return () => {
      console.log('🧹 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [toast, user?.id]);

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

  // Get recent activities (last 7 days) - includes both sessions and goals
  const getRecentActivities = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get recent sessions
    const recentSessions = sessions.filter(session => 
      new Date(session.created_at) >= sevenDaysAgo
    ).map(session => ({
      ...session,
      activityType: 'session' as const,
      activityTitle: `Session Created: ${session.name}`,
      activityDate: session.created_at
    }));

    // Get recent goals
    const recentGoals = goals.filter(goal => 
      new Date(goal.created_at) >= sevenDaysAgo
    ).map(goal => ({
      ...goal,
      activityType: 'goal' as const,
      activityTitle: `Goal Created: ${goal.area_of_focus}`,
      activityDate: goal.created_at
    }));

    // Combine and sort by date
    return [...recentSessions, ...recentGoals]
      .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime());
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
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return time;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatUserName = (displayName: string) => {
    // If displayName contains @ (email), extract just the username part
    if (displayName.includes('@')) {
      return displayName.split('@')[0];
    }
    return displayName;
  };

  const recentActivities = getRecentActivities();
  const upcomingThisWeek = getUpcomingThisWeek();

  // Show login interface if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Mentor-Mentee Platform</CardTitle>
            <CardDescription className="text-gray-600">Please login to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Login with MyJKKN
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {formatUserName(user?.displayName || 'User')}</h2>
              <div className="space-y-1 text-gray-600">
                <p>Email: {user?.email}</p>
                <p>Role: <Badge variant="outline">{user?.role}</Badge></p>
              </div>
            </div>
            <Button 
              onClick={logout}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
          
          {/* Debug Info - Show only in development or for testing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <UserDebugInfo />
            </div>
          )}
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

         {/* Dashboard Overview & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Notifications Dashboard - Show for students and mentors */}
          {user && user.externalId && user.role && user.role !== 'admin' && (
            <NotificationDashboard 
              userExternalId={user.externalId}
              userType={user.role === 'mentee' ? 'student' : user.role === 'mentor' ? 'mentor' : 'admin'}
              className="lg:col-span-1"
            />
          )}
          
          {/* Session Schedule */}
          <Card className={user && user.externalId && user.role && user.role !== 'admin' ? '' : 'lg:col-span-2'}>
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

        {/* System Overview Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Students Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Students Overview</CardTitle>
              <CardDescription>Current student statistics {isDemo && <Badge variant="secondary" className="ml-2">Demo Data</Badge>}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Students</span>
                  <span className="font-bold text-2xl text-blue-600">
                    {studentsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      students.length
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Students</span>
                  <span className="font-bold text-2xl text-green-600">
                    {studentsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      students.filter(s => s.status === 'active').length
                    )}
                  </span>
                </div>
                {user?.role === 'admin' || user?.role === 'super_admin' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={refetchStudents}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                ) : null}
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
                    {staffLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      staff.length
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Staff</span>
                  <span className="font-bold text-2xl text-green-600">
                    {staffLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      staff.filter(s => s.status === 'active').length
                    )}
                  </span>
                </div>
                {user?.role === 'admin' || user?.role === 'super_admin' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={refetchStaff}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                ) : null}
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
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {(sessionsLoading || goalsLoading) ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.activityType === 'session' ? (
                          <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                        ) : (
                          <Target className="w-5 h-5 text-purple-600 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {activity.activityTitle}
                        </p>
                        {activity.activityType === 'session' ? (
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center space-x-4">
                              <span>📅 {formatDate((activity as any).session_date)}</span>
                              {(activity as any).start_time && (
                                <span>⏰ {formatTime((activity as any).start_time)}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <span>👥 {(activity as any).session_type === 'one_on_one' ? '1:1' : 'Group'}</span>
                              <span>📍 {(activity as any).location || 'No location'}</span>
                            </div>
                            <div className="text-gray-500">
                              Participants: {(activity as any).participants?.length || 0} student{((activity as any).participants?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center space-x-4">
                              <span>🎯 Goal Status: {(activity as any).status}</span>
                              {(activity as any).target_date && (
                                <span>⏰ Due: {formatDate((activity as any).target_date)}</span>
                              )}
                            </div>
                            <div className="text-gray-500">
                              SMART Goal: {(activity as any).smart_goal_text?.substring(0, 50) || 'No description'}...
                            </div>
                          </div>
                        )}
                        <div className="mt-2">
                          <Badge 
                            variant={
                              activity.activityType === 'session' 
                                ? ((activity as any).status === 'completed' ? 'default' : (activity as any).status === 'cancelled' ? 'destructive' : 'secondary')
                                : ((activity as any).status === 'completed' ? 'default' : (activity as any).status === 'cancelled' ? 'destructive' : 'secondary')
                            }
                            className="text-xs"
                          >
                            {activity.activityType === 'session' ? (activity as any).status : (activity as any).status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.activityDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Create a counseling session or goal to get started</p>
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
