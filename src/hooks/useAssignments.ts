import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDemoMode } from './useDemoMode';

export interface Assignment {
  id: string;
  mentor_external_id: string;
  student_external_id: string;
  role: 'primary' | 'co_mentor';
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  effective_from: string;
  effective_to?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  assignment_metadata?: {
    institution?: string;
    department?: string;
    section?: string;
    program?: string;
    semesterYear?: number;
    supervisor_id?: string;
    created_via?: string;
    is_fresh_assignment?: boolean;
    previous_mentor_id?: string;
  };
}

export interface CreateAssignmentData {
  mentor_external_id: string;
  student_external_id: string;
  role: 'primary' | 'co_mentor';
  notes?: string;
  supervisor_id?: string;
  assignment_metadata?: any;
}

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        // Demo data for assignments
        const demoAssignments: Assignment[] = [
          {
            id: "demo_001",
            mentor_external_id: "DEMO_STAFF_001",
            student_external_id: "DEMO_STU_001",
            role: "primary" as const,
            status: "active",
            effective_from: "2024-01-15T00:00:00Z",
            notes: "Focus on ML and research methods",
            created_at: "2024-01-15T00:00:00Z",
            updated_at: "2024-01-15T00:00:00Z",
            assignment_metadata: {
              institution: "Demo University",
              department: "Computer Science",
              program: "Computer Science",
              semesterYear: 6,
              is_fresh_assignment: true,
              created_via: "mentor_choice"
            }
          },
          {
            id: "demo_002",
            mentor_external_id: "DEMO_STAFF_002",
            student_external_id: "DEMO_STU_002",
            role: "primary" as const,
            status: "active",
            effective_from: "2024-01-10T00:00:00Z",
            notes: "Statistics and data analysis focus",
            created_at: "2024-01-10T00:00:00Z",
            updated_at: "2024-01-10T00:00:00Z",
            assignment_metadata: {
              institution: "Demo University",
              department: "Mathematics",
              program: "Mathematics",
              semesterYear: 4,
              is_fresh_assignment: true,
              created_via: "mentor_choice"
            }
          }
        ];
        setAssignments(demoAssignments);
      } else {
        const { data, error: fetchError } = await supabase
          .from('assignments')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        // Cast the data to match our interface
        const typedAssignments = (data || []).map(assignment => ({
          ...assignment,
          status: assignment.status as 'active' | 'pending' | 'completed' | 'cancelled'
        }));
        setAssignments(typedAssignments);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assignments';
      setError(errorMessage);
      
      if (!isDemoMode) {
        toast({
          title: 'Error Loading Assignments',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const validateAndCreateAssignment = async (
    assignmentData: CreateAssignmentData, 
    cycleId: string
  ) => {
    try {
      if (isDemoMode) {
        toast({
          title: 'Demo Mode',
          description: 'Assignment creation simulated in demo mode.',
        });
        return { success: true };
      }

      // Validate assignment constraints
      const { data: validation, error: validationError } = await supabase
        .rpc('validate_assignment_constraints', {
          p_mentor_external_id: assignmentData.mentor_external_id,
          p_student_external_id: assignmentData.student_external_id,
          p_cycle_id: cycleId
        });

      if (validationError) throw validationError;

      const validationResult = validation?.[0];
      
      if (!validationResult?.is_valid) {
        toast({
          title: 'Validation Failed',
          description: validationResult?.error_message || 'Assignment validation failed.',
          variant: 'destructive'
        });
        return { success: false, error: validationResult?.error_message };
      }

      // Create assignment with cycle and department/program info
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          ...assignmentData,
          cycle_id: cycleId,
          status: 'active',
          effective_from: new Date().toISOString(),
          department: validationResult.student_department,
          program: validationResult.student_program,
          institution: validationResult.student_department // Using department as institution
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Assignment Created',
        description: 'Assignment created and validated successfully.',
      });

      await fetchAssignments();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create assignment';
      toast({
        title: 'Creation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const createAssignment = async (assignmentData: CreateAssignmentData) => {
    // Fallback for backward compatibility - use active cycle if available
    const { data: activeCycle } = await supabase
      .from('assignment_cycles')
      .select('id')
      .eq('status', 'active')
      .eq('is_locked', false)
      .single();

    if (!activeCycle) {
      toast({
        title: 'No Active Cycle',
        description: 'No active assignment cycle available. Please create and activate a cycle first.',
        variant: 'destructive'
      });
      return { success: false, error: 'No active cycle' };
    }

    return validateAndCreateAssignment(assignmentData, activeCycle.id);
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    try {
      if (isDemoMode) {
        toast({
          title: 'Demo Mode',
          description: 'Assignment update simulated in demo mode.',
        });
        return { success: true };
      }

      const { data, error } = await supabase
        .from('assignments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Assignment Updated',
        description: 'Assignment updated successfully.',
      });

      await fetchAssignments(); // Refresh the list
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update assignment';
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const endAssignment = async (id: string, reason?: string) => {
    try {
      if (isDemoMode) {
        toast({
          title: 'Demo Mode',
          description: 'Assignment ending simulated in demo mode.',
        });
        return { success: true };
      }

      const { data, error } = await supabase
        .from('assignments')
        .update({
          status: 'completed',
          effective_to: new Date().toISOString(),
          notes: reason ? `${reason}` : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Assignment Ended',
        description: 'Assignment ended successfully.',
      });

      await fetchAssignments(); // Refresh the list
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end assignment';
      toast({
        title: 'End Assignment Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  const getAssignmentsByMentor = (mentorExternalId: string) => {
    return assignments.filter(a => a.mentor_external_id === mentorExternalId);
  };

  const getAssignmentsByStudent = (studentExternalId: string) => {
    return assignments.filter(a => a.student_external_id === studentExternalId);
  };

  const getAssignmentStats = () => {
    const active = assignments.filter(a => a.status === 'active').length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const needsAttention = assignments.filter(a => 
      a.status === 'active' && 
      !a.assignment_metadata?.is_fresh_assignment
    ).length;

    return {
      total: assignments.length,
      active,
      pending,
      completed,
      needsAttention
    };
  };

  useEffect(() => {
    fetchAssignments();
  }, [isDemoMode]);

  return {
    assignments,
    loading,
    error,
    createAssignment,
    validateAndCreateAssignment,
    updateAssignment,
    endAssignment,
    getAssignmentsByMentor,
    getAssignmentsByStudent,
    getAssignmentStats,
    refetch: fetchAssignments
  };
};