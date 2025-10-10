import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AssignmentHistoryEntry {
  id: string;
  assignment_id: string;
  cycle_id?: string;
  action_type: 'created' | 'updated' | 'reassigned' | 'ended' | 'locked' | 'unlocked';
  changed_by?: string;
  changed_at: string;
  old_values?: any;
  new_values?: any;
  change_reason?: string;
  metadata?: any;
}

export const useAssignmentHistory = (assignmentId?: string) => {
  const [history, setHistory] = useState<AssignmentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';

  const fetchHistory = async () => {
    if (!isSuperAdmin) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('assignment_history')
        .select('*')
        .order('changed_at', { ascending: false });

      if (assignmentId) {
        query = query.eq('assignment_id', assignmentId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const typedData = (data || []).map(h => ({
        ...h,
        action_type: h.action_type as 'created' | 'updated' | 'reassigned' | 'ended' | 'locked' | 'unlocked'
      }));
      setHistory(typedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(errorMessage);
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [assignmentId]);

  return {
    history,
    loading,
    error,
    isSuperAdmin,
    refetch: fetchHistory
  };
};