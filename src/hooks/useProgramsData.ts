import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from './useDemoMode';
import { useToast } from '@/hooks/use-toast';

export interface Program {
  id: string;
  program_name: string;
  department_id?: string;
  institution_id?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export const useProgramsData = () => {
  const { isDemoMode } = useDemoMode();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        // Use demo data
        const demoPrograms: Program[] = [
          {
            id: '1',
            program_name: 'Bachelor of Computer Science',
            status: 'active'
          },
          {
            id: '2',
            program_name: 'Bachelor of Engineering',
            status: 'active'
          },
          {
            id: '3',
            program_name: 'Bachelor of Pharmacy',
            status: 'active'
          },
          {
            id: '4',
            program_name: 'Bachelor of Nursing',
            status: 'active'
          }
        ];
        setPrograms(demoPrograms);
      } else {
        // Fetch from Supabase database
        const { data, error: dbError } = await supabase
          .from('programs')
          .select('*')
          .eq('status', 'active')
          .order('program_name');

        if (dbError) {
          throw dbError;
        }

        setPrograms((data || []) as Program[]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load programs';
      setError(errorMessage);
      
      if (!isDemoMode) {
        toast({
          title: 'Error Loading Programs',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [isDemoMode]);

  const refetch = () => {
    loadPrograms();
  };

  return {
    programs,
    loading,
    error,
    refetch,
    isDemo: isDemoMode
  };
};