import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, BellOff, Check, CheckCheck, ExternalLink, Clock } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

interface NotificationCenterProps {
  userExternalId: string;
  userType: 'student' | 'mentor' | 'admin';
}

export const NotificationCenter = ({ userExternalId, userType }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
        return '📚';
      case 'session_confirmation':
        return '✅';
      case 'session_update':
        return '📝';
      case 'session_cancellation':
        return '❌';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'session_invitation':
        return 'border-blue-200 bg-blue-50';
      case 'session_confirmation':
        return 'border-green-200 bg-green-50';
      case 'session_update':
        return 'border-yellow-200 bg-yellow-50';
      case 'session_cancellation':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} unread</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Stay updated with your counseling sessions and activities
              </DialogDescription>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead}
                className="flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <BellOff className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-medium text-muted-foreground">No notifications yet</h3>
                <p className="text-sm text-muted-foreground">
                  You'll see session invitations and updates here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.read_at 
                      ? `ring-2 ring-primary/20 ${getNotificationColor(notification.type)}` 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-xl flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read_at && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.created_at)}
                          </div>
                          
                          {notification.action_required && (
                            <Badge variant="outline" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                          
                          {notification.action_url && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <ExternalLink className="w-3 h-3" />
                              View Details
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="h-8 w-8 p-0 flex-shrink-0"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};