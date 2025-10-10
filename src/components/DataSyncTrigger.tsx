import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, GraduationCap, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SyncResult {
  success: boolean;
  students_fetched?: number;
  active_students?: number;
  students_synced?: number;
  users_processed?: number;
  users_created?: number;
  users_updated?: number;
  errors?: any[];
  error?: string;
  timestamp: string;
}

const DataSyncTrigger: React.FC = () => {
  const [syncing, setSyncing] = useState<'students' | 'staff' | 'both' | null>(null);
  const [lastSync, setLastSync] = useState<{
    students?: SyncResult;
    staff?: SyncResult;
  }>({});
  const { toast } = useToast();

  const syncStudents = async () => {
    setSyncing('students');
    try {
      console.log('🔄 Triggering student sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-students', {
        body: {}
      });

      if (error) throw error;

      console.log('✅ Student sync result:', data);
      
      setLastSync(prev => ({ ...prev, students: data }));
      
      if (data.success) {
        toast({
          title: 'Students Synced Successfully',
          description: `Synced ${data.students_synced || data.active_students || 0} students from MyJKKN API.`,
        });
      } else {
        toast({
          title: 'Student Sync Failed',
          description: data.error || 'Unknown error occurred',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Student sync error:', error);
      toast({
        title: 'Student Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync students',
        variant: 'destructive'
      });
    } finally {
      setSyncing(null);
    }
  };

  const syncStaff = async () => {
    setSyncing('staff');
    try {
      console.log('🔄 Triggering staff sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-staff-users', {
        body: { action: 'sync_all' }
      });

      if (error) throw error;

      console.log('✅ Staff sync result:', data);
      
      setLastSync(prev => ({ ...prev, staff: data }));
      
      if (data.success) {
        toast({
          title: 'Staff Synced Successfully',
          description: `Processed ${data.users_processed || 0} staff, created ${data.users_created || 0}, updated ${data.users_updated || 0}.`,
        });
      } else {
        toast({
          title: 'Staff Sync Failed',
          description: data.error || 'Unknown error occurred',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('❌ Staff sync error:', error);
      toast({
        title: 'Staff Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync staff',
        variant: 'destructive'
      });
    } finally {
      setSyncing(null);
    }
  };

  const syncAll = async () => {
    setSyncing('both');
    try {
      await Promise.all([syncStudents(), syncStaff()]);
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Data Synchronization</h2>
        <p className="text-muted-foreground">
          Sync students and staff data from MyJKKN API to update the dashboard.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This will fetch ALL students and staff from MyJKKN API with pagination to ensure complete data synchronization.
          The process may take a few minutes depending on the data volume.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Sync Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Students</span>
            </CardTitle>
            <CardDescription>Sync all student records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastSync.students && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {lastSync.students.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {lastSync.students.success ? 'Last Sync Successful' : 'Last Sync Failed'}
                  </span>
                </div>
                {lastSync.students.success && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Fetched: {lastSync.students.students_fetched || 0}</div>
                    <div>Active: {lastSync.students.active_students || 0}</div>
                    <div>Synced: {lastSync.students.students_synced || 0}</div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(lastSync.students.timestamp).toLocaleString()}
                </div>
              </div>
            )}
            <Button 
              onClick={syncStudents} 
              disabled={syncing !== null}
              className="w-full"
            >
              {syncing === 'students' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Students
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sync Staff */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Staff</span>
            </CardTitle>
            <CardDescription>Sync all staff records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastSync.staff && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {lastSync.staff.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {lastSync.staff.success ? 'Last Sync Successful' : 'Last Sync Failed'}
                  </span>
                </div>
                {lastSync.staff.success && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Processed: {lastSync.staff.users_processed || 0}</div>
                    <div>Created: {lastSync.staff.users_created || 0}</div>
                    <div>Updated: {lastSync.staff.users_updated || 0}</div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(lastSync.staff.timestamp).toLocaleString()}
                </div>
              </div>
            )}
            <Button 
              onClick={syncStaff} 
              disabled={syncing !== null}
              className="w-full"
            >
              {syncing === 'staff' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Staff
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sync All */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5" />
              <span>Sync All</span>
            </CardTitle>
            <CardDescription>Sync both students and staff</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Synchronize all data sources at once for complete dashboard update.
              </p>
              <Badge variant="secondary">Full Sync</Badge>
            </div>
            <Button 
              onClick={syncAll} 
              disabled={syncing !== null}
              variant="default"
              className="w-full"
            >
              {syncing === 'both' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing All...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Everything
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status */}
      {(lastSync.students?.errors?.length || lastSync.staff?.errors?.length) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>Sync Errors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastSync.students?.errors && lastSync.students.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Student Sync Errors:</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(lastSync.students.errors, null, 2)}
                </pre>
              </div>
            )}
            {lastSync.staff?.errors && lastSync.staff.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Staff Sync Errors:</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(lastSync.staff.errors, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataSyncTrigger;