import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, Settings2, Shield, Database } from 'lucide-react';
import { useAssignmentMode, AssignmentMode } from '@/hooks/useAssignmentMode';
import { FormSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { DemoModeSettings } from '@/components/DemoModeSettings';

export const AssignmentModeSettings: React.FC = () => {
  console.log('AssignmentModeSettings component loading - v2...');
  const { mode, loading, error, updateMode, isAppManaged, isUpstreamManaged } = useAssignmentMode();

  const handleModeChange = (newMode: string) => {
    updateMode(newMode as AssignmentMode);
  };

  if (loading) {
    return <FormSkeleton fields={3} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings2 className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-medium">Assignment Authority</h3>
          <p className="text-sm text-muted-foreground">
            Choose how mentor-student assignments are managed in the system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Mode</span>
            <Badge variant={isAppManaged ? "default" : "secondary"}>
              {isAppManaged ? "App-managed" : "Upstream-managed"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isAppManaged 
              ? "Assignments are created and managed within this application"
              : "Assignments are read-only and synchronized from the upstream system"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={handleModeChange} className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="app" id="app" className="mt-1" />
              <div className="space-y-2 flex-1">
                <Label htmlFor="app" className="text-base font-medium cursor-pointer">
                  App-managed
                </Label>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and delete assignments directly within the application. 
                  Full control over mentor-student relationships.
                </p>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Link/unlink enabled</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="upstream" id="upstream" className="mt-1" />
              <div className="space-y-2 flex-1">
                <Label htmlFor="upstream" className="text-base font-medium cursor-pointer">
                  Upstream-managed
                </Label>
                <p className="text-sm text-muted-foreground">
                  Assignments are read-only and automatically synchronized from the external system.
                  No local assignment modifications allowed.
                </p>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Read-only from external system</span>
                </div>
              </div>
            </div>
          </RadioGroup>

          {isUpstreamManaged && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Upstream Mode Active
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Assignment creation and editing is disabled. All assignment data is managed 
                    by the external system and synchronized automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DemoModeSettings />
    </div>
  );
};