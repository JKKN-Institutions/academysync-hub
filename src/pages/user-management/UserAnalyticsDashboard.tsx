import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  UserPlus,
  Settings,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface UserAnalytics {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  department: string;
  institution: string;
  login_count: number;
  last_login: string;
  joined_date: string;
  email_confirmed_at: string;
  last_sign_in_at: string;
  activity_status: string;
  sessions_created: number;
  goals_created: number;
  recent_activity_count: number;
}

interface SyncLog {
  id: string;
  sync_type: string;
  users_processed: number;
  users_created: number;
  users_updated: number;
  errors: any;
  sync_status: string;
  created_at: string;
  completed_at: string;
}

const UserAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .order('joined_date', { ascending: false });

      if (error) throw error;
      setAnalytics((data || []) as UserAnalytics[]);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const syncStaffToUsers = async () => {
    try {
      setSyncing(true);
      
      // Call the edge function to sync staff data
      const { data, error } = await supabase.functions.invoke('sync-staff-users', {
        body: { action: 'sync_all' }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Sync completed: ${data.users_processed} users processed, ${data.users_created} created, ${data.users_updated} updated`,
      });

      await fetchAnalytics();
      await fetchSyncLogs();
    } catch (error: any) {
      console.error('Error syncing users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sync users",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchSyncLogs();
  }, []);

  const getActivityStatusCounts = () => {
    const counts = analytics.reduce((acc, user) => {
      acc[user.activity_status] = (acc[user.activity_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { name: 'Active', value: counts.active || 0, color: '#10b981' },
      { name: 'Inactive', value: counts.inactive || 0, color: '#f59e0b' },
      { name: 'Never Logged In', value: counts.never_logged_in || 0, color: '#ef4444' },
      { name: 'Dormant', value: counts.dormant || 0, color: '#6b7280' }
    ];
  };

  const getRoleDistribution = () => {
    const counts = analytics.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([role, count]) => ({
      role,
      count,
      color: getRoleColor(role)
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return '#9333ea';
      case 'admin': return '#dc2626';
      case 'mentor': return '#2563eb';
      case 'mentee': return '#059669';
      case 'dept_lead': return '#ea580c';
      default: return '#6b7280';
    }
  };

  const totalUsers = analytics.length;
  const activeUsers = analytics.filter(u => u.activity_status === 'active').length;
  const totalLogins = analytics.reduce((sum, u) => sum + (u.login_count || 0), 0);
  const totalSessions = analytics.reduce((sum, u) => sum + (u.sessions_created || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and user management insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={syncStaffToUsers}
            disabled={syncing}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {syncing ? 'Syncing...' : 'Sync Staff to Users'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.filter(u => u.joined_date > new Date(Date.now() - 30*24*60*60*1000).toISOString()).length} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((activeUsers / totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogins}</div>
            <p className="text-xs text-muted-foreground">
              Avg {(totalLogins / totalUsers).toFixed(1)} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Counseling sessions conducted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getActivityStatusCounts()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getActivityStatusCounts().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getRoleDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics
              .filter(user => user.recent_activity_count > 0)
              .sort((a, b) => b.recent_activity_count - a.recent_activity_count)
              .slice(0, 10)
              .map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.display_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.activity_status === 'active' ? 'default' : 'secondary'}>
                      {user.activity_status.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.recent_activity_count} activities
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{log.sync_type.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={log.sync_status === 'completed' ? 'default' : log.sync_status === 'failed' ? 'destructive' : 'secondary'}>
                    {log.sync_status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {log.users_processed} processed | {log.users_created} created | {log.users_updated} updated
                  </p>
                  {log.errors && JSON.parse(log.errors).length > 0 && (
                    <p className="text-sm text-destructive">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      {JSON.parse(log.errors).length} errors
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalyticsDashboard;