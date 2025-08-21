import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';

interface SyncResult {
  success: boolean;
  endpoint_used?: string;
  students_fetched?: number;
  students_synced?: number;
  error?: string;
  timestamp: string;
}

export const AutoStudentSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleAutoSync = async () => {
    try {
      setSyncing(true);
      setProgress(10);
      
      toast({
        title: 'Starting Student Sync',
        description: 'Automatically fetching all student details from MyJKKN API...'
      });

      setProgress(30);
      
      // Call our edge function to sync students
      const { data, error } = await supabase.functions.invoke('sync-students');

      setProgress(70);

      if (error) {
        throw error;
      }

      setProgress(90);

      const result: SyncResult = data;
      setLastSync(result);
      
      if (result.success) {
        toast({
          title: 'Sync Successful! 🎉',
          description: `Fetched ${result.students_fetched || 0} students, synced ${result.students_synced || 0} to database`,
        });
      } else {
        throw new Error(result.error || 'Sync failed');
      }

      setProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000);

    } catch (error) {
      console.error('Student sync error:', error);
      
      const failedResult: SyncResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
      
      setLastSync(failedResult);
      
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync student data',
        variant: 'destructive'
      });
      
      setProgress(0);
    } finally {
      setSyncing(false);
    }
  };

  const getSyncStatusColor = (result: SyncResult | null) => {
    if (!result) return 'text-muted-foreground';
    return result.success ? 'text-green-600' : 'text-red-600';
  };

  const getSyncStatusIcon = (result: SyncResult | null) => {
    if (!result) return <Database className="h-4 w-4 text-muted-foreground" />;
    return result.success ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Automatic Student Data Sync</h3>
          <p className="text-sm text-muted-foreground">
            Fetch and sync all student details from MyJKKN API with your API key
          </p>
        </div>
        
        <Button 
          onClick={handleAutoSync} 
          disabled={syncing}
          size="lg"
          className="min-w-[140px]"
        >
          {syncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Students
            </>
          )}
        </Button>
      </div>

      {syncing && progress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Sync Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {lastSync && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getSyncStatusIcon(lastSync)}
                Last Sync Result
              </CardTitle>
              <Badge variant={lastSync.success ? 'default' : 'destructive'}>
                {lastSync.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp:</span>
                <span>{new Date(lastSync.timestamp).toLocaleString()}</span>
              </div>
              
              {lastSync.success ? (
                <>
                  {lastSync.endpoint_used && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Endpoint:</span>
                      <span className="font-mono text-xs">{lastSync.endpoint_used.replace('https://my.jkkn.ac.in/api', '')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students Fetched:</span>
                    <span className="font-semibold text-blue-600">{lastSync.students_fetched || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students Synced:</span>
                    <span className="font-semibold text-green-600">{lastSync.students_synced || 0}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error:</span>
                  <span className={getSyncStatusColor(lastSync)}>{lastSync.error}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">How it works</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Automatically tries multiple API endpoints to find working student data</p>
                <p>• Fetches all active student records with complete details</p>
                <p>• Syncs data to local database for fast access</p>
                <p>• Updates existing records and adds new ones</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};