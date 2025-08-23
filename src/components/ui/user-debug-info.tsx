import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const UserDebugInfo: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="mb-4 border-orange-200">
        <CardHeader>
          <CardTitle className="text-sm">User Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No user logged in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm">User Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium">ID:</span> {user.id}
          </div>
          <div>
            <span className="font-medium">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-medium">Role:</span> 
            <Badge variant="outline" className="ml-1 text-xs">
              {user.role || 'Not set'}
            </Badge>
          </div>
          <div>
            <span className="font-medium">External ID:</span> {user.externalId || 'Not set'}
          </div>
          <div>
            <span className="font-medium">Display Name:</span> {user.displayName || 'Not set'}
          </div>
          <div>
            <span className="font-medium">Department:</span> {user.department || 'Not set'}
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          <p>This debug info helps verify user data for notifications.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDebugInfo;