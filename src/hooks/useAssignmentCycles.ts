import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface AssignmentCycle {
  id: string;
  academic_year: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'locked' | 'archived';
  is_locked: boolean;
  locked_at?: string;
  locked_by?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface CreateCycleData {
  academic_year: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  status?: 'draft' | 'active';
}

export const useAssignmentCycles = () => {
  const [cycles, setCycles] = useState<AssignmentCycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<AssignmentCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';

  const fetchCycles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('assignment_cycles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const typedData = (data || []).map(c => ({
        ...c,
        status: c.status as 'draft' | 'active' | 'locked' | 'archived'
      }));
      setCycles(typedData);
      
      // Find active cycle
      const active = typedData.find(c => c.status === 'active' && !c.is_locked);
      setActiveCycle(active || null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cycles';
      setError(errorMessage);
      console.error('Error fetching cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCycle = async (cycleData: CreateCycleData) => {
    if (!isSuperAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only super admins can create assignment cycles.',
        variant: 'destructive'
      });
      return { success: false };
    }

    try {
      // Check if academic year already exists
      const { data: existing } = await supabase
        .from('assignment_cycles')
        .select('id')
        .eq('academic_year', cycleData.academic_year)
        .single();

      if (existing) {
        toast({
          title: 'Cycle Already Exists',
          description: `Assignment cycle for ${cycleData.academic_year} already exists.`,
          variant: 'destructive'
        });
        return { success: false };
      }

      const { data, error } = await supabase
        .from('assignment_cycles')
        .insert({
          ...cycleData,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Cycle Created',
        description: `Assignment cycle for ${cycleData.academic_year} created successfully.`,
      });

      await fetchCycles();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create cycle';
      toast({
        title: 'Creation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const lockCycle = async (cycleId: string, reason?: string) => {
    if (!isSuperAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only super admins can lock assignment cycles.',
        variant: 'destructive'
      });
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from('assignment_cycles')
        .update({
          is_locked: true,
          locked_at: new Date().toISOString(),
          locked_by: user?.id,
          status: 'locked',
          metadata: { lock_reason: reason }
        })
        .eq('id', cycleId)
        .select()
        .single();

      if (error) throw error;

      // Also lock all assignments in this cycle
      await supabase
        .from('assignments')
        .update({
          is_locked: true,
          locked_at: new Date().toISOString()
        })
        .eq('cycle_id', cycleId);

      toast({
        title: 'Cycle Locked',
        description: 'Assignment cycle and all assignments locked for the academic year.',
      });

      await fetchCycles();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to lock cycle';
      toast({
        title: 'Lock Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const activateCycle = async (cycleId: string) => {
    if (!isSuperAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only super admins can activate assignment cycles.',
        variant: 'destructive'
      });
      return { success: false };
    }

    try {
      // Deactivate any existing active cycles
      await supabase
        .from('assignment_cycles')
        .update({ status: 'archived' })
        .eq('status', 'active');

      const { data, error } = await supabase
        .from('assignment_cycles')
        .update({ status: 'active' })
        .eq('id', cycleId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Cycle Activated',
        description: 'Assignment cycle is now active and ready for assignments.',
      });

      await fetchCycles();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate cycle';
      toast({
        title: 'Activation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const getCycleStats = (cycleId: string) => {
    // This would be implemented with a separate query to count assignments
    return {
      totalAssignments: 0,
      activeAssignments: 0,
      completedAssignments: 0
    };
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  return {
    cycles,
    activeCycle,
    loading,
    error,
    isSuperAdmin,
    createCycle,
    lockCycle,
    activateCycle,
    getCycleStats,
    refetch: fetchCycles
  };
};