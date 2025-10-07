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
  const [authReady, setAuthReady] = useState(false);

  // Wait for auth to be ready before fetching
  useEffect(() => {
    const timer = setTimeout(() => setAuthReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchSessions = async () => {
    if (!authReady) return;
    
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
      
      // Log silently, don't show disruptive toast on initial load/refresh
      console.warn('Session fetch failed:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: CreateSessionData, sendEmails: boolean = false, mentorName?: string): Promise<CounselingSession | null> => {
    try {
      console.log('=== SESSION CREATION DEBUG ===');
      
      // Check authentication first
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      console.log('Auth user:', authUser);
      console.log('Auth error:', authError);
      
      if (!authUser) {
        throw new Error('User not authenticated. Please log in again.');
      }
      
      // Check user profile and permissions
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, display_name, department, external_id')
        .eq('user_id', authUser.id)
        .single();
      
      console.log('User profile:', userProfile);
      console.log('Profile error:', profileError);
      
      if (!userProfile) {
        throw new Error('User profile not found. Please contact administrator.');
      }
      
      if (!['admin', 'super_admin', 'mentor'].includes(userProfile.role)) {
        throw new Error(`Insufficient permissions. Your role (${userProfile.role}) cannot create sessions.`);
      }
      
      console.log('Creating session with data:', sessionData);
      
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
          created_by: authUser.id
        })
        .select()
        .single();

      console.log('Session creation result:', { session, sessionError });
      
      if (sessionError) {
        console.error('Session creation error details:', {
          message: sessionError.message,
          details: sessionError.details,
          hint: sessionError.hint,
          code: sessionError.code
        });
        throw new Error(`Failed to create session: ${sessionError.message}`);
      }

      // Create participant records for each student
      let participants: SessionParticipant[] = [];
      if (sessionData.students.length > 0) {
        const participantRecords = sessionData.students.map(studentId => ({
          session_id: session.id,
          student_external_id: studentId,
          participation_status: 'invited'
        }));

        const { data: insertedParticipants, error: participantsError } = await supabase
          .from('session_participants')
          .insert(participantRecords)
          .select('id, student_external_id, participation_status');

        if (participantsError) {
          console.error('Error creating participants:', participantsError);
          // Don't throw here as the session was created successfully
        } else if (insertedParticipants) {
          participants = insertedParticipants as SessionParticipant[];
          console.log('✅ Successfully created participants:', participants);
        }
      }

      // Send in-app notifications to all students
      if (sessionData.students.length > 0) {
        const studentNotifications = sessionData.students.map(studentId => ({
          user_external_id: studentId,
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

        const { error: studentNotificationsError } = await supabase
          .from('notifications')
          .insert(studentNotifications);

        if (studentNotificationsError) {
          console.error('Error creating student notifications:', studentNotificationsError);
        } else {
          console.log('Successfully created in-app notifications for students:', sessionData.students);
        }
      }

      // Send mentor confirmation notification
      if (userProfile.external_id) {
        const mentorNotification = {
          user_external_id: userProfile.external_id,
          user_type: 'mentor' as const,
          title: '✅ Session Created Successfully',
          message: `Your counseling session "${sessionData.name}" has been created with ${sessionData.students.length} student${sessionData.students.length !== 1 ? 's' : ''} for ${new Date(sessionData.session_date).toLocaleDateString()}${sessionData.start_time ? ` at ${sessionData.start_time}` : ''}. All students have been notified.`,
          type: 'session_confirmation' as const,
          data: {
            sessionId: session.id,
            sessionName: sessionData.name,
            studentCount: sessionData.students.length,
            sessionDate: sessionData.session_date,
            sessionTime: sessionData.start_time,
            location: sessionData.location,
            emailsSent: sendEmails
          },
          action_required: false,
          action_url: `/session/${session.id}`
        };

        const { error: mentorNotificationError } = await supabase
          .from('notifications')
          .insert(mentorNotification);

        if (mentorNotificationError) {
          console.error('Error creating mentor notification:', mentorNotificationError);
        } else {
          console.log('Successfully created mentor confirmation notification');
        }
      }

      // Send emails if requested
      if (sendEmails && sessionData.students.length > 0) {
        const emailResult = await sendCounselingEmails(sessionData, mentorName || userProfile.display_name || 'Your Mentor');
        console.log('Email sending result:', emailResult);
      }

      // Refetch sessions to update the list
      await fetchSessions();

      toast({
        title: 'Session Created Successfully',
        description: `"${sessionData.name}" session created with ${sessionData.students.length} student${sessionData.students.length !== 1 ? 's' : ''}.${sendEmails ? ' Email notifications sent.' : ''} All participants notified.`
      });

      // Return properly typed session with participants
      return {
        ...session,
        session_type: session.session_type as 'one_on_one' | 'group',
        status: session.status as 'pending' | 'completed' | 'cancelled',
        priority: session.priority as 'low' | 'normal' | 'high',
        participants: participants,
        can_view_details: true // User who created can view details
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
      console.log('=== EMAIL SENDING DEBUG ===');
      console.log('Session data:', sessionData);
      console.log('Mentor name:', mentorName);
      
      // Get student details from the database using correct field mapping
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('student_id, name, email, id')
        .in('student_id', sessionData.students); // Use student_id field to match external IDs

      console.log('Student query result:', { students, studentsError });

      if (studentsError) {
        console.error('Error fetching student details:', studentsError);
        throw new Error(`Failed to fetch student details: ${studentsError.message}`);
      }

      if (!students || students.length === 0) {
        console.error('No student details found for IDs:', sessionData.students);
        throw new Error(`No students found with IDs: ${sessionData.students.join(', ')}`);
      }

      // Filter students with valid emails
      const studentsWithEmails = students.filter(s => s.email && s.email.trim() !== '');
      console.log('Students with valid emails:', studentsWithEmails);

      if (studentsWithEmails.length === 0) {
        throw new Error('No valid email addresses found for the selected students');
      }

      const studentEmails = studentsWithEmails.map(s => s.email);
      const studentNames = studentsWithEmails.map(s => s.name);

      console.log('Sending emails to:', studentEmails);

      // Call the email function
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-counseling-email', {
        body: {
          sessionName: sessionData.name,
          sessionDate: sessionData.session_date,
          sessionTime: sessionData.start_time || '00:00',
          location: sessionData.location || 'To be confirmed',
          description: sessionData.description || 'Counseling session details will be discussed during the meeting.',
          mentorName: mentorName,
          studentEmails: studentEmails,
          studentNames: studentNames
        }
      });

      console.log('Email function response:', { emailResult, emailError });

      if (emailError) {
        console.error('Error sending counseling emails:', emailError);
        throw new Error(`Failed to send emails: ${emailError.message}`);
      }

      // Check if any emails failed
      if (emailResult?.emailsSent < studentEmails.length) {
        console.warn(`Only ${emailResult.emailsSent} out of ${studentEmails.length} emails were sent successfully`);
        toast({
          title: 'Partial Email Success',
          description: `${emailResult.emailsSent} out of ${studentEmails.length} emails were sent successfully.`,
          variant: 'default'
        });
      } else {
        console.log('All counseling emails sent successfully');
        toast({
          title: 'Emails Sent Successfully',
          description: `Counseling session emails sent to all ${studentEmails.length} students.`
        });
      }

      return {
        success: true,
        emailsSent: emailResult?.emailsSent || 0,
        totalStudents: studentEmails.length
      };
    } catch (error) {
      console.error('Error in sendCounselingEmails:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while sending emails';
      
      toast({
        title: 'Email Error',
        description: errorMessage,
        variant: 'destructive'
      });

      return {
        success: false,
        error: errorMessage,
        emailsSent: 0,
        totalStudents: 0
      };
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
    if (authReady) {
      fetchSessions();
    }
  }, [authReady]);

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