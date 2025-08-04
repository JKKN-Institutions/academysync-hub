import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Settings, Shield, ExternalLink } from 'lucide-react';
import { useAssignmentMode } from '@/hooks/useAssignmentMode';
import { Link } from 'react-router-dom';

export const AssignmentModeBanner: React.FC = () => {
  const { mode, isAppManaged, isUpstreamManaged } = useAssignmentMode();

  if (isAppManaged) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-green-800">
              <strong>App-managed mode:</strong> You can create, edit, and delete assignments directly in this application.
            </span>
            <Badge variant="outline" className="text-green-700 border-green-300">
              Full Control
            </Badge>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isUpstreamManaged) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-blue-800">
              <strong>Upstream-managed mode:</strong> Assignments are read-only and synchronized from the external system.
            </span>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              Read-only
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" />
              Source System
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};