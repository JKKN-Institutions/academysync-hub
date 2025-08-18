import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  GraduationCap,
  Briefcase
} from 'lucide-react';

interface SyncResult {
  sync_log_id: string;
  users_processed: number;
  users_created: number;
  users_updated: number;
  errors: any[];
  success: boolean;
  stats: {
    staff_synced: boolean;
    students_synced: boolean;
    total_errors: number;
  };
}

export const ComprehensiveUserSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncStaff, setSyncStaff] = useState(true);
  const [syncStudents, setSyncStudents] = useState(true);
  const { toast } = useToast();

  const handleSync = async () => {
    if (!syncStaff && !syncStudents) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least one user type to sync.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSyncResult(null);

    try {
      console.log('Starting comprehensive user sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-all-users', {
        body: {
          action: 'sync_all',
          sync_staff: syncStaff,
          sync_students: syncStudents
        }
      });

      if (error) {
        console.error('Sync error:', error);
        throw error;
      }

      console.log('Sync completed:', data);
      setSyncResult(data);

      if (data.success) {
        toast({
          title: 'Sync Completed Successfully',
          description: `Processed ${data.users_processed} users, created ${data.users_created}, updated ${data.users_updated}`,
        });
      } else {
        toast({
          title: 'Sync Completed with Errors',
          description: `${data.errors?.length || 0} errors occurred during sync`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Comprehensive User Sync
          </CardTitle>
          <CardDescription>
            Sync all staff and students from MYJKKN API to create Supabase users for deep analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sync Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Sync Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sync-staff"
                  checked={syncStaff}
                  onCheckedChange={setSyncStaff}
                />
                <Label htmlFor="sync-staff" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Sync Staff Members
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sync-students"
                  checked={syncStudents}
                  onCheckedChange={setSyncStudents}
                />
                <Label htmlFor="sync-students" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Sync Students
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Sync Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSync}
              disabled={isLoading || (!syncStaff && !syncStudents)}
              className="w-full md:w-auto"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing Users...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Start Comprehensive Sync
                </>
              )}
            </Button>
          </div>

          {/* Sync Results */}
          {syncResult && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  {syncResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  Sync Results
                </h4>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {syncResult.users_processed}
                    </div>
                    <div className="text-sm text-muted-foreground">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {syncResult.users_created}
                    </div>
                    <div className="text-sm text-muted-foreground">Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {syncResult.users_updated}
                    </div>
                    <div className="text-sm text-muted-foreground">Updated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {syncResult.errors?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>

                {/* Sync Types */}
                <div className="flex gap-2 justify-center">
                  {syncResult.stats.staff_synced && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      Staff Synced
                    </Badge>
                  )}
                  {syncResult.stats.students_synced && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      Students Synced
                    </Badge>
                  )}
                </div>

                {/* Errors */}
                {syncResult.errors && syncResult.errors.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <details className="cursor-pointer">
                        <summary className="font-medium">
                          {syncResult.errors.length} errors occurred during sync (click to view)
                        </summary>
                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                          {syncResult.errors.slice(0, 10).map((error, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              {error.type}: {error.external_id} - {error.error}
                            </div>
                          ))}
                          {syncResult.errors.length > 10 && (
                            <div className="text-xs text-muted-foreground italic">
                              ... and {syncResult.errors.length - 10} more errors
                            </div>
                          )}
                        </div>
                      </details>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};