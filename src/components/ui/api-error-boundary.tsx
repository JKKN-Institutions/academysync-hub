
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ApiErrorBoundaryProps {
  error: string | null;
  loading: boolean;
  onRetry: () => void;
  title: string;
  description?: string;
  showConfigButton?: boolean;
  children: React.ReactNode;
}

export const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({
  error,
  loading,
  onRetry,
  title,
  description,
  showConfigButton = true,
  children
}) => {
  const navigate = useNavigate();

  if (error && !loading) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {description || error}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            {showConfigButton && (
              <Button 
                onClick={() => navigate('/admin')} 
                variant="default" 
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Check API Settings
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
