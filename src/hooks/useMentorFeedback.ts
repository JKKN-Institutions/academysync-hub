import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MentorFeedback {
  id: string;
  session_id: string;
  mentor_external_id: string;
  session_quality_rating: number;
  student_engagement_rating: number;
  goals_achieved_rating: number;
  student_progress_notes: string;
  key_outcomes?: string;
  challenges_faced?: string;
  next_steps_recommended: string;
  follow_up_required: boolean;
  follow_up_timeline?: string;
  additional_support_needed?: string;
  mentor_reflection?: string;
  improvement_areas?: string;
  created_at: string;
  updated_at: string;
}

export const useMentorFeedback = (sessionId?: string) => {
  const [feedback, setFeedback] = useState<MentorFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('mentor_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setFeedback(data || []);
    } catch (err) {
      console.error('Error fetching mentor feedback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mentor feedback';
      setError(errorMessage);
      toast({
        title: 'Error Loading Feedback',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getAllFeedback = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('mentor_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return data || [];
    } catch (err) {
      console.error('Error fetching all mentor feedback:', err);
      return [];
    }
  };

  const hasFeedback = (sessionId: string) => {
    return feedback.some(f => f.session_id === sessionId);
  };

  const getSessionFeedback = (sessionId: string) => {
    return feedback.find(f => f.session_id === sessionId);
  };

  const getAverageRatings = () => {
    if (feedback.length === 0) {
      return {
        session_quality: 0,
        student_engagement: 0,
        goals_achieved: 0
      };
    }

    const totals = feedback.reduce(
      (acc, item) => ({
        session_quality: acc.session_quality + item.session_quality_rating,
        student_engagement: acc.student_engagement + item.student_engagement_rating,
        goals_achieved: acc.goals_achieved + item.goals_achieved_rating
      }),
      { session_quality: 0, student_engagement: 0, goals_achieved: 0 }
    );

    return {
      session_quality: Number((totals.session_quality / feedback.length).toFixed(1)),
      student_engagement: Number((totals.student_engagement / feedback.length).toFixed(1)),
      goals_achieved: Number((totals.goals_achieved / feedback.length).toFixed(1))
    };
  };

  useEffect(() => {
    fetchFeedback();
  }, [sessionId]);

  return {
    feedback,
    loading,
    error,
    refetch: fetchFeedback,
    getAllFeedback,
    hasFeedback,
    getSessionFeedback,
    getAverageRatings
  };
};