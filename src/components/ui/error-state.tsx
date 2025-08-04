import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  variant?: 'card' | 'inline';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  className = "",
  variant = 'card'
}) => {
  if (variant === 'inline') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="ml-4 bg-background hover:bg-muted"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={`border-destructive/20 text-center ${className}`}>
      <CardHeader className="pb-4">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <CardTitle className="text-xl text-destructive">{title}</CardTitle>
        <CardDescription className="text-base max-w-md mx-auto">
          {message}
        </CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent className="pt-0">
          <Button onClick={onRetry} variant="outline" className="mx-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};