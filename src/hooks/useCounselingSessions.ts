import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CounselingSession {
  id: string;
  name: string;
  session_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  description?: string;
  session_type: 'one_on_one' | 'group';
  status: 'pending' | 'completed' | 'cancelled';
  priority?: 'low' | 'normal' | 'high';
  created_by?: string;
  created_at: string;
  updated_at: string;
  participants?: SessionParticipant[];
  can_view_details?: boolean; // Indicates if user can see full details
}

export interface SessionParticipant {
  id: string;
  student_external_id: string;
  participation_status: 'invited' | 'confirmed' | 'attended' | 'missed';
}

export interface CreateSessionData {
  name: string;
  session_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  description?: string;
  session_type: 'one_on_one' | 'group';
  priority?: 'low' | 'normal' | 'high';
  students: string[]; // Array of student external IDs
}

export const useCounselingSessions = () => {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get sessions from the limited view which handles access control
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('session_limited_view')
        .select('*')
        .order('session_date', { ascending: false });

      if (sessionsError) {
        throw sessionsError;
      }

      // For sessions where user can view details, fetch participants
      const sessionsWithParticipants = await Promise.all(
        (sessionsData || []).map(async (session) => {
          let participants: SessionParticipant[] = [];
          
          // Only fetch participants if user can view details
          if (session.can_view_details) {
            const { data: participantsData, error: participantsError } = await supabase
              .from('session_participants')
              .select(`
                id,
                student_external_id,
                participation_status
              `)
              .eq('session_id', session.id);

            if (!participantsError && participantsData) {
              participants = participantsData as SessionParticipant[];
            }
          }

          return {
            ...session,
            session_type: session.session_type as 'one_on_one' | 'group',
            status: session.status as 'pending' | 'completed' | 'cancelled',
            priority: session.priority as 'low' | 'normal' | 'high',
            participants: participants
          };
        })
      );

      setSessions(sessionsWithParticipants);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
      toast({
        title: 'Error Loading Sessions',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: CreateSessionData, sendEmails: boolean = false, mentorName?: string): Promise<CounselingSession | null> => {
    try {
      // Create the main session record
      const { data: session, error: sessionError } = await supabase
        .from('counseling_sessions')
        .insert({
          name: sessionData.name,
          session_date: sessionData.session_date,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time,
          location: sessionData.location,
          description: sessionData.description,
          session_type: sessionData.session_type,
          priority: sessionData.priority || 'normal',
          status: 'pending',
          created_by: (await supabase.auth.getUser()).data.user?.id // Explicitly set creator
        })
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      // Create participant records for each student
      if (sessionData.students.length > 0) {
        const participantRecords = sessionData.students.map(studentId => ({
          session_id: session.id,
          student_external_id: studentId,
          participation_status: 'invited'
        }));

        const { error: participantsError } = await supabase
          .from('session_participants')
          .insert(participantRecords);

        if (participantsError) {
          console.error('Error creating participants:', participantsError);
          // Don't throw here as the session was created successfully
        }
      }

      // Send in-app notifications to all students
      if (sessionData.students.length > 0) {
        const notificationData = sessionData.students.map(studentId => ({
          user_external_id: studentId, // Student ID is already the external ID
          user_type: 'student' as const,
          title: '📚 New Counseling Session Invitation',
          message: `You have been invited to "${sessionData.name}" scheduled for ${new Date(sessionData.session_date).toLocaleDateString()}${sessionData.start_time ? ` at ${sessionData.start_time}` : ''} by ${mentorName || 'your mentor'}.`,
          type: 'session_invitation' as const,
          data: {
            sessionId: session.id,
            sessionName: sessionData.name,
            sessionDate: sessionData.session_date,
            sessionTime: sessionData.start_time,
            location: sessionData.location,
            mentorName: mentorName
          },
          action_required: true,
          action_url: `/session/${session.id}`
        }));

        const { error: notificationsError } = await supabase
          .from('notifications')
          .insert(notificationData);

        if (notificationsError) {
          console.error('Error creating notifications:', notificationsError);
          // Continue execution, notifications are not critical for session creation
        } else {
          console.log('Successfully created in-app notifications for students:', sessionData.students);
        }
      }

      // Send emails if requested
      if (sendEmails && sessionData.students.length > 0) {
        await sendCounselingEmails(sessionData, mentorName || 'Your Mentor');
      }

      // Refetch sessions to update the list
      await fetchSessions();

      toast({
        title: 'Session Created',
        description: `Successfully created "${sessionData.name}" session.${sendEmails ? ' Email notifications sent to students.' : ''} In-app notifications sent to all participants.`
      });

      // Return properly typed session
      return {
        ...session,
        session_type: session.session_type as 'one_on_one' | 'group',
        status: session.status as 'pending' | 'completed' | 'cancelled',
        priority: session.priority as 'low' | 'normal' | 'high',
        participants: []
      };
    } catch (err) {
      console.error('Error creating session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      toast({
        title: 'Error Creating Session',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    }
  };

  const sendCounselingEmails = async (sessionData: CreateSessionData, mentorName: string) => {
    try {
      // Get student details from the database
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name, email')
        .in('id', sessionData.students);

      if (studentsError) {
        console.error('Error fetching student details:', studentsError);
        return;
      }

      if (!students || students.length === 0) {
        console.error('No student details found for IDs:', sessionData.students);
        return;
      }

      const studentEmails = students.map(s => s.email).filter(email => email);
      const studentNames = students.map(s => s.name);

      if (studentEmails.length === 0) {
        console.error('No valid email addresses found for students');
        return;
      }

      // Call the email function
      const { error: emailError } = await supabase.functions.invoke('send-counseling-email', {
        body: {
          sessionName: sessionData.name,
          sessionDate: sessionData.session_date,
          sessionTime: sessionData.start_time || '00:00',
          location: sessionData.location,
          description: sessionData.description,
          mentorName: mentorName,
          studentEmails: studentEmails,
          studentNames: studentNames
        }
      });

      if (emailError) {
        console.error('Error sending counseling emails:', emailError);
        toast({
          title: 'Email Error',
          description: 'Session created successfully, but emails could not be sent.',
          variant: 'destructive'
        });
      } else {
        console.log('Counseling emails sent successfully');
      }
    } catch (error) {
      console.error('Error in sendCounselingEmails:', error);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: 'pending' | 'completed' | 'cancelled', rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from('counseling_sessions')
        .update({ 
          status,
          rejection_reason: rejectionReason || null
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      // Refetch sessions to update the list
      await fetchSessions();

      toast({
        title: 'Session Updated',
        description: `Session status updated to ${status}.`
      });
    } catch (err) {
      console.error('Error updating session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      toast({
        title: 'Error Updating Session',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Filter functions for different tab views
  const getUpcomingSessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.session_date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= today && session.status === 'pending';
    });
  };

  const getCompletedSessions = () => {
    return sessions.filter(session => session.status === 'completed');
  };

  const getAllSessions = () => {
    return sessions;
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    loading,
    error,
    createSession,
    updateSessionStatus,
    refetch: fetchSessions,
    // Filtered sessions for tabs
    upcomingSessions: getUpcomingSessions(),
    completedSessions: getCompletedSessions(),
    allSessions: getAllSessions()
  };
};