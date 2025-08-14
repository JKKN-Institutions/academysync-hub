import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_external_id: string;
  user_type: 'student' | 'mentor' | 'admin';
  title: string;
  message: string;
  type: 'session_invitation' | 'session_confirmation' | 'session_update' | 'session_cancellation' | 'general';
  data?: any;
  read_at?: string;
  action_required: boolean;
  action_url?: string;
  created_at: string;
  expires_at?: string;
}

export const useNotifications = (userExternalId: string, userType: 'student' | 'mentor' | 'admin') => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_external_id', userExternalId)
        .eq('user_type', userType)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setNotifications((data || []).map(notification => ({
        ...notification,
        user_type: notification.user_type as 'student' | 'mentor' | 'admin',
        type: notification.type as 'session_invitation' | 'session_confirmation' | 'session_update' | 'session_cancellation' | 'general'
      })));
      setUnreadCount((data || []).filter(n => !n.read_at).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create notification (for system use)
  const createNotification = async (notificationData: {
    user_external_id: string;
    user_type: 'student' | 'mentor' | 'admin';
    title: string;
    message: string;
    type: 'session_invitation' | 'session_confirmation' | 'session_update' | 'session_cancellation' | 'general';
    data?: any;
    action_required?: boolean;
    action_url?: string;
    expires_at?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) {
        throw error;
      }

      // Show toast for immediate feedback
      if (notificationData.user_external_id === userExternalId) {
        toast({
          title: notificationData.title,
          description: notificationData.message,
        });
      }

      return true;
    } catch (err) {
      console.error('Error creating notification:', err);
      return false;
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
      
      if (unreadIds.length === 0) return true;

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);

      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  };

  // Send session invitation notifications
  const sendSessionInvitations = async (sessionData: {
    sessionId: string;
    sessionName: string;
    sessionDate: string;
    sessionTime?: string;
    location?: string;
    mentorName: string;
    studentIds: string[];
  }) => {
    try {
      const notifications = sessionData.studentIds.map(studentId => ({
        user_external_id: studentId,
        user_type: 'student' as const,
        title: '📚 New Counseling Session Invitation',
        message: `You have been invited to "${sessionData.sessionName}" scheduled for ${new Date(sessionData.sessionDate).toLocaleDateString()}${sessionData.sessionTime ? ` at ${sessionData.sessionTime}` : ''} by ${sessionData.mentorName}.`,
        type: 'session_invitation' as const,
        data: {
          sessionId: sessionData.sessionId,
          sessionName: sessionData.sessionName,
          sessionDate: sessionData.sessionDate,
          sessionTime: sessionData.sessionTime,
          location: sessionData.location,
          mentorName: sessionData.mentorName
        },
        action_required: true,
        action_url: `/session/${sessionData.sessionId}`
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      console.error('Error sending session invitations:', err);
      return false;
    }
  };

  // Send mentor confirmation notification
  const sendMentorConfirmation = async (sessionData: {
    sessionId: string;
    sessionName: string;
    studentCount: number;
    mentorExternalId: string;
    sessionDate: string;
  }) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_external_id: sessionData.mentorExternalId,
          user_type: 'mentor',
          title: '✅ Session Created Successfully',
          message: `Your counseling session "${sessionData.sessionName}" has been created with ${sessionData.studentCount} student${sessionData.studentCount !== 1 ? 's' : ''} for ${new Date(sessionData.sessionDate).toLocaleDateString()}. All students have been notified.`,
          type: 'session_confirmation',
          data: {
            sessionId: sessionData.sessionId,
            sessionName: sessionData.sessionName,
            studentCount: sessionData.studentCount,
            sessionDate: sessionData.sessionDate
          },
          action_required: false,
          action_url: `/session/${sessionData.sessionId}`
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      console.error('Error sending mentor confirmation:', err);
      return false;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_external_id=eq.${userExternalId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notifications
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_external_id=eq.${userExternalId}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userExternalId, toast]);

  // Initial fetch
  useEffect(() => {
    if (userExternalId) {
      fetchNotifications();
    }
  }, [userExternalId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead,
    sendSessionInvitations,
    sendMentorConfirmation,
    refetch: fetchNotifications
  };
};