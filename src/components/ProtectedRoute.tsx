import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackPath = '/'
}) => {
  const { user, loading, canAccessRoute } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check route access
  if (!canAccessRoute(location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Access Restricted</CardTitle>
              <CardDescription>
                You don't have permission to access this page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                <p><strong>Your Role:</strong> {user.role}</p>
                <p><strong>Required:</strong> {requiredRoles.length > 0 ? requiredRoles.join(', ') : 'Special permissions'}</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => window.location.href = '/'}
                >
                  Dashboard
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                If you believe this is an error, please contact your administrator.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check specific permissions if provided
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      user.role && ['admin'].includes(user.role) // Admin bypass for now
    );
    
    if (!hasAllPermissions) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Check specific roles if provided
  if (requiredRoles.length > 0 && user.role && !requiredRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;