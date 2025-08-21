import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const StudentSyncDebugger: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const { toast } = useToast();

  const checkDatabase = async () => {
    try {
      const { data: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      const { data: staffCount, error: staffError } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true });

      const { data: recentStudents } = await supabase
        .from('students')
        .select('name, synced_at, status')
        .limit(3)
        .order('synced_at', { ascending: false });

      setDbStats({
        students: studentsCount,
        staff: staffCount,
        recentStudents,
        studentsError,
        staffError
      });
    } catch (error) {
      console.error('Error checking database:', error);
    }
  };

  const triggerSync = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔄 Triggering MyJKKN student sync...');
      
      const { data, error } = await supabase.functions.invoke('auto-sync-on-login', {
        body: { 
          manual_trigger: true,
          trigger_source: 'debug_panel',
          timestamp: new Date().toISOString()
        }
      });

      console.log('📡 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Function invocation error:', error);
        
        // Check for specific error types
        if (error.message?.includes('API key')) {
          setResult({
            success: false,
            error: 'API Key Configuration Error: MyJKKN API key is not properly configured.',
            details: error,
            troubleshooting: [
              'Check if MYJKKN_API_KEY secret is set in Supabase',
              'Verify the API key format is correct (jk_xxxxx_xxxxx)',
              'Contact administrator to update the API key'
            ]
          });
        } else if (error.message?.includes('timeout')) {
          setResult({
            success: false,
            error: 'Connection Timeout: Unable to reach MyJKKN API.',
            details: error,
            troubleshooting: [
              'Check internet connectivity',
              'MyJKKN API servers may be temporarily unavailable',
              'Try again in a few minutes'
            ]
          });
        } else {
          setResult({
            success: false,
            error: error.message,
            details: error
          });
        }
        
        toast({
          title: "Sync Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Sync result:', data);
      setResult(data);
      
      if (data?.students_synced > 0) {
        toast({
          title: "✅ Sync Successful!",
          description: `Successfully synced ${data.students_synced} students and ${data.staff_synced || 0} staff members`,
        });
        
        // Wait a moment then refresh database stats
        setTimeout(async () => {
          await checkDatabase();
        }, 1500);
      } else if (data?.errors && data.errors.length > 0) {
        toast({
          title: "⚠️ Sync Completed with Errors",
          description: data.errors[0],
          variant: "destructive",
        });
      } else if (data?.success === false) {
        toast({
          title: "❌ Sync Failed",
          description: data.error || "Unknown sync error occurred",
          variant: "destructive",
        });
      } else {
        toast({
          title: "ℹ️ Sync Completed",
          description: "Sync completed but no students were found or synced. Check API configuration.",
          variant: "default",
        });
      }
      
    } catch (error) {
      console.error('💥 Sync error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        troubleshooting: [
          'Check browser console for detailed error logs',
          'Verify Supabase connection is working',
          'Contact technical support if the issue persists'
        ]
      });
      
      toast({
        title: "❌ Sync Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Student Sync Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={triggerSync} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {loading ? 'Syncing...' : 'Trigger Manual Sync'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={checkDatabase}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Check Database
            </Button>
          </div>

          {dbStats && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Students in DB:</strong> {dbStats.students?.length || 0}
                    {dbStats.studentsError && (
                      <Badge variant="destructive" className="ml-2">Error</Badge>
                    )}
                  </div>
                  <div>
                    <strong>Staff in DB:</strong> {dbStats.staff?.length || 0}
                    {dbStats.staffError && (
                      <Badge variant="destructive" className="ml-2">Error</Badge>
                    )}
                  </div>
                </div>
                {dbStats.recentStudents && dbStats.recentStudents.length > 0 && (
                  <div className="mt-2">
                    <strong>Recent students:</strong> {dbStats.recentStudents.map((s: any) => s.name).join(', ')}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert variant={result.success === false ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <strong>Status:</strong> 
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </Badge>
                  </div>
                  
                  {result.students_synced !== undefined && (
                    <div><strong>Students Synced:</strong> <span className="text-green-600 font-mono">{result.students_synced}</span></div>
                  )}
                  
                  {result.staff_synced !== undefined && (
                    <div><strong>Staff Synced:</strong> <span className="text-blue-600 font-mono">{result.staff_synced}</span></div>
                  )}
                  
                  {result.error && (
                    <div className="p-3 bg-destructive/10 rounded border">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.troubleshooting && result.troubleshooting.length > 0 && (
                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <strong>💡 Troubleshooting Steps:</strong>
                      <ul className="list-disc ml-4 mt-1">
                        {result.troubleshooting.map((step: string, index: number) => (
                          <li key={index} className="text-sm">{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.errors && result.errors.length > 0 && (
                    <div>
                      <strong>Detailed Errors:</strong>
                      <ul className="list-disc ml-4 mt-1">
                        {result.errors.map((error: string, index: number) => (
                          <li key={index} className="text-sm font-mono bg-red-50 p-1 rounded">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.timestamp && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      <strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Debug Info:</strong> If students show as "0.0.0", it usually means:
              <ul className="list-disc ml-4 mt-1">
                <li>The database has no student records</li>
                <li>The MyJKKN API sync is failing</li>
                <li>API credentials are incorrect or expired</li>
                <li>API endpoints have changed</li>
              </ul>
              Use the "Trigger Manual Sync" button to test the sync process.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentSyncDebugger;