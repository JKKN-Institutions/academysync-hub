import React from 'react';
import { Bell, X, Calendar, MapPin, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

interface NotificationDashboardProps {
  userExternalId: string;
  userType: 'student' | 'mentor' | 'admin';
  className?: string;
}

const NotificationDashboard: React.FC<NotificationDashboardProps> = ({
  userExternalId,
  userType,
  className
}) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(userExternalId, userType);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_invitation':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'session_confirmation':
        return <Bell className="h-4 w-4 text-green-500" />;
      case 'session_update':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'session_cancellation':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'session_invitation':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'session_confirmation':
        return 'border-l-green-500 bg-green-50/50';
      case 'session_update':
        return 'border-l-orange-500 bg-orange-50/50';
      case 'session_cancellation':
        return 'border-l-red-500 bg-red-50/50';
      default:
        return 'border-l-gray-500 bg-gray-50/50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll see session invitations and updates here</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-sm",
                    getNotificationColor(notification.type),
                    notification.read_at ? "opacity-75" : "shadow-sm"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "font-medium text-sm leading-tight",
                          !notification.read_at && "text-foreground",
                          notification.read_at && "text-muted-foreground"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <time className="text-xs text-muted-foreground">
                            {formatDate(notification.created_at)}
                          </time>
                          {!notification.read_at && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {/* Session Details */}
                      {notification.data && notification.type === 'session_invitation' && (
                        <div className="mt-3 text-xs space-y-1">
                          {notification.data.sessionDate && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(notification.data.sessionDate).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                                {notification.data.sessionTime && ` at ${notification.data.sessionTime}`}
                              </span>
                            </div>
                          )}
                          {notification.data.location && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{notification.data.location}</span>
                            </div>
                          )}
                          {notification.data.mentorName && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>Mentor: {notification.data.mentorName}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {notification.action_required && (
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            Action Required
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationDashboard;