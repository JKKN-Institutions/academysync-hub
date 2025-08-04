import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TestTube, AlertCircle, Shield } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Link } from 'react-router-dom';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <TestTube className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-blue-800">
            <strong>Demo Mode Active:</strong> You are viewing safe mock data for training. All IDs are clearly marked as DEMO_*.
          </span>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            <Shield className="w-3 h-3 mr-1" />
            Training Safe
          </Badge>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin">
            <AlertCircle className="w-4 h-4 mr-1" />
            Exit Demo
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};