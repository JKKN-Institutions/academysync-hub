import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from './useDemoMode';

export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  activeStaff: number;
  activeMentors: number;
  totalAssignments: number;
  activeAssignments: number;
  totalSessions: number;
  completedSessions: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalStaff: 0,
    activeStaff: 0,
    activeMentors: 0,
    totalAssignments: 0,
    activeAssignments: 0,
    totalSessions: 0,
    completedSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode } = useDemoMode();

  const fetchStats = async () => {
    if (isDemoMode) {
      // Demo data
      setStats({
        totalStudents: 1000,
        totalStaff: 50,
        activeStaff: 45,
        activeMentors: 30,
        totalAssignments: 850,
        activeAssignments: 820,
        totalSessions: 250,
        completedSessions: 180,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all stats in parallel
      const [
        studentsResult,
        staffResult,
        activeStaffResult,
        mentorsResult,
        assignmentsResult,
        activeAssignmentsResult,
        sessionsResult,
        completedSessionsResult,
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('staff').select('id', { count: 'exact', head: true }),
        supabase.from('staff').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'mentor'),
        supabase.from('assignments').select('id', { count: 'exact', head: true }),
        supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('counseling_sessions').select('id', { count: 'exact', head: true }),
        supabase.from('counseling_sessions').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      ]);

      setStats({
        totalStudents: studentsResult.count || 0,
        totalStaff: staffResult.count || 0,
        activeStaff: activeStaffResult.count || 0,
        activeMentors: mentorsResult.count || 0,
        totalAssignments: assignmentsResult.count || 0,
        activeAssignments: activeAssignmentsResult.count || 0,
        totalSessions: sessionsResult.count || 0,
        completedSessions: completedSessionsResult.count || 0,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
      setError(errorMessage);
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isDemoMode]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};