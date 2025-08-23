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

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('counseling_sessions')
        .select(`
          *,
          session_participants (
            id,
            student_external_id,
            participation_status
          )
        `)
        .order('session_date', { ascending: false });

      if (sessionsError) {
        throw sessionsError;
      }

      // Type-safe mapping of database response to our interface
      const typedSessions: CounselingSession[] = (sessionsData || []).map(session => ({
        ...session,
        session_type: session.session_type as 'one_on_one' | 'group',
        status: session.status as 'pending' | 'completed' | 'cancelled',
        priority: session.priority as 'low' | 'normal' | 'high',
        participants: session.session_participants as SessionParticipant[]
      }));

      setSessions(typedSessions);
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
          status: 'pending'
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

      // Send emails if requested
      if (sendEmails && sessionData.students.length > 0) {
        await sendCounselingEmails(sessionData, mentorName || 'Your Mentor');
      }

      // Refetch sessions to update the list
      await fetchSessions();

      toast({
        title: 'Session Created',
        description: `Successfully created "${sessionData.name}" session.${sendEmails ? ' Email notifications sent to students.' : ''}`
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