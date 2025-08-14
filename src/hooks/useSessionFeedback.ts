import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SessionFeedback {
  id: string;
  session_id: string;
  mentee_external_id: string;
  overall_rating: number;
  mentor_helpfulness: number;
  session_effectiveness: number;
  would_recommend: boolean;
  comments?: string;
  improvement_suggestions?: string;
  created_at: string;
  updated_at: string;
}

export const useSessionFeedback = (sessionId?: string) => {
  const [feedback, setFeedback] = useState<SessionFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFeedback = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('session_feedback')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setFeedback(data || []);
    } catch (err) {
      console.error('Error fetching session feedback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feedback';
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
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('session_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setFeedback(data || []);
    } catch (err) {
      console.error('Error fetching all feedback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feedback';
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

  const getAverageRatings = () => {
    if (feedback.length === 0) {
      return {
        overall: 0,
        mentorHelpfulness: 0,
        sessionEffectiveness: 0,
        recommendationRate: 0,
        totalResponses: 0
      };
    }

    const totalResponses = feedback.length;
    const overall = feedback.reduce((sum, f) => sum + f.overall_rating, 0) / totalResponses;
    const mentorHelpfulness = feedback.reduce((sum, f) => sum + f.mentor_helpfulness, 0) / totalResponses;
    const sessionEffectiveness = feedback.reduce((sum, f) => sum + f.session_effectiveness, 0) / totalResponses;
    const recommendationRate = feedback.filter(f => f.would_recommend).length / totalResponses * 100;

    return {
      overall: Math.round(overall * 10) / 10,
      mentorHelpfulness: Math.round(mentorHelpfulness * 10) / 10,
      sessionEffectiveness: Math.round(sessionEffectiveness * 10) / 10,
      recommendationRate: Math.round(recommendationRate),
      totalResponses
    };
  };

  useEffect(() => {
    if (sessionId) {
      fetchFeedback();
    }
  }, [sessionId]);

  return {
    feedback,
    loading,
    error,
    refetch: fetchFeedback,
    getAllFeedback,
    getAverageRatings
  };
};