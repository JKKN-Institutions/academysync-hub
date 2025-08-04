import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, TestTube, Database, Users, Shield } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { FormSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';

export const DemoModeSettings: React.FC = () => {
  const { enabled, loading, error, updateDemoMode, isDemoMode } = useDemoMode();

  const handleToggle = (newEnabled: boolean) => {
    updateDemoMode(newEnabled);
  };

  if (loading) {
    return <FormSkeleton fields={2} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <TestTube className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-medium">Demo Mode</h3>
          <p className="text-sm text-muted-foreground">
            Use safe mock data for training sessions and demonstrations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Demo Data Toggle</span>
            <Badge variant={isDemoMode ? "default" : "secondary"}>
              {isDemoMode ? "Demo Mode Active" : "Live Data"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isDemoMode 
              ? "Currently using safe mock data with clearly fake IDs for training"
              : "Currently using live API data from external systems"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="demo-toggle" className="text-base font-medium cursor-pointer">
                Enable Demo Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Switch to safe mock data for training sessions. No live data will be affected.
              </p>
            </div>
            <Switch
              id="demo-toggle"
              checked={enabled}
              onCheckedChange={handleToggle}
            />
          </div>

          {isDemoMode && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TestTube className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Demo Mode Active
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      All data shown is fake and safe for training. No real student or mentor 
                      information will be accessed or modified.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">5 Demo Mentors</p>
                    <p className="text-xs text-muted-foreground">IDs: DEMO_MENTOR_*</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">6 Demo Students</p>
                    <p className="text-xs text-muted-foreground">IDs: DEMO_STUDENT_*</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">3 Demo Sessions</p>
                    <p className="text-xs text-muted-foreground">Safe training data</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isDemoMode && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Live Data Mode
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Currently connected to live API. All data shown is real and changes 
                    will affect the actual system.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Demo Data Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Clearly marked fake IDs (DEMO_*)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Safe for training sessions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>No real data modification</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Realistic demo scenarios</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};