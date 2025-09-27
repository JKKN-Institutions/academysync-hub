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
        // Always try direct API fetch to get fresh data
        console.log('🏢 Fetching departments from API...');
        
        try {
          // Import fetchDepartments dynamically to avoid circular dependency
          const { fetchDepartments } = await import('@/services/myjkknApi');
          const apiDepartments = await fetchDepartments();
          
          console.log('📊 Raw departments from API:', apiDepartments.length, 'items');
          
          // Transform API data to match our interface
          const transformedDepartments: Department[] = apiDepartments.map(dept => ({
            id: dept.id,
            department_id: dept.id,
            department_name: dept.department_name,
            description: dept.description || dept.department_name,
            institution_id: dept.institution_id,
            status: 'active' as 'active' | 'inactive',
            created_at: dept.created_at,
            updated_at: dept.updated_at
          }));
          
          console.log('✅ Transformed departments:', transformedDepartments.map(d => d.department_name));
          setDepartments(transformedDepartments);
          
        } catch (apiError) {
          console.error('❌ Direct API fetch failed, trying Supabase fallback:', apiError);
          
          // Fallback to Supabase data if API fails
          const { data, error: dbError } = await supabase
            .from('departments')
            .select('*')
            .eq('status', 'active')
            .order('department_name');

          if (dbError) {
            console.warn('Supabase departments fetch also failed:', dbError);
            throw dbError;
          }

          if (data && data.length > 0) {
            console.log('📦 Using Supabase fallback data:', data.length, 'departments');
            setDepartments((data || []) as Department[]);
          } else {
            console.warn('⚠️ No departments found in either API or Supabase');
            setDepartments([]);
          }
        }
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