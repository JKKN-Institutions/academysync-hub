import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from './useDemoMode';
import { useToast } from '@/hooks/use-toast';

export interface Department {
  id: string;
  department_id: string;
  department_name: string;
  description?: string;
  institution_id?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

// Demo departments data
const getDemoDepartments = (): Department[] => [
  {
    id: 'dept1',
    department_id: 'dept1',
    department_name: 'Computer Science',
    description: 'Department of Computer Science and Engineering',
    status: 'active',
    institution_id: 'jkkn-engineering'
  },
  {
    id: 'dept2',
    department_id: 'dept2',
    department_name: 'Electrical Engineering',
    description: 'Department of Electrical and Electronics Engineering',
    status: 'active',
    institution_id: 'jkkn-engineering'
  },
  {
    id: 'dept3',
    department_id: 'dept3',
    department_name: 'Mechanical Engineering',
    description: 'Department of Mechanical Engineering',
    status: 'active',
    institution_id: 'jkkn-engineering'
  },
  {
    id: 'dept4',
    department_id: 'dept4',
    department_name: 'Department of Nursing (UG)',
    description: 'Department of Nursing - Undergraduate',
    status: 'active',
    institution_id: 'jkkn-nursing'
  }
];

export const useDepartmentsData = () => {
  const { isDemoMode } = useDemoMode();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        // Use demo data
        setDepartments(getDemoDepartments());
      } else {
        // Fetch from Supabase database (synced from MyJKKN API)
        const { data, error: dbError } = await supabase
          .from('departments')
          .select('*')
          .eq('status', 'active')
          .order('department_name');

        if (dbError) {
          throw dbError;
        }

        setDepartments((data || []) as Department[]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load departments';
      setError(errorMessage);
      
      if (!isDemoMode) {
        toast({
          title: 'Error Loading Departments',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, [isDemoMode]);

  const refetch = () => {
    loadDepartments();
  };

  return {
    departments,
    loading,
    error,
    refetch,
    isDemo: isDemoMode
  };
};