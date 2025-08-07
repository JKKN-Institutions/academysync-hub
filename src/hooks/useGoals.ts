import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Goal {
  id: string;
  area_of_focus: string;
  smart_goal_text: string;
  knowledge_what: string | null;
  knowledge_how: string | null;
  skills_what: string | null;
  skills_how: string | null;
  action_plan: string | null;
  student_external_id: string;
  target_date: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  version_number: number;
  session_id: string | null;
}

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('🎯 Fetching goals...');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching goals:', error);
        throw error;
      }

      console.log('✅ Goals fetched successfully:', data);
      setGoals(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGoalStatus = async (goalId: string, status: string) => {
    try {
      console.log(`🔄 Updating goal ${goalId} status to ${status}`);

      const { data, error } = await supabase
        .from('goals')
        .update({ status: status as any })
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating goal status:', error);
        throw error;
      }

      console.log('✅ Goal status updated successfully:', data);
      
      // Update local state
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, status } : goal
      ));

      return data;
    } catch (err: any) {
      console.error('Error updating goal status:', err);
      throw err;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      console.log(`🗑️ Deleting goal ${goalId}`);

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) {
        console.error('❌ Error deleting goal:', error);
        throw error;
      }

      console.log('✅ Goal deleted successfully');
      
      // Update local state
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  // Set up real-time subscription for goals
  useEffect(() => {
    if (!user) return;

    console.log('🔄 Setting up goals real-time subscription...');

    const channel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('🎯 Goals change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setGoals(prev => [payload.new as Goal, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setGoals(prev => prev.map(goal => 
              goal.id === payload.new.id ? payload.new as Goal : goal
            ));
          } else if (payload.eventType === 'DELETE') {
            setGoals(prev => prev.filter(goal => goal.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up goals subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    updateGoalStatus,
    deleteGoal
  };
}