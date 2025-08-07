import { useState, useEffect } from 'react';
import { useDemoMode } from './useDemoMode';
import { fetchDepartments, MyjkknDepartment } from '@/services/myjkknApi';
import { useToast } from '@/hooks/use-toast';

// Demo departments data
const getDemoDepartments = (): MyjkknDepartment[] => [
  {
    id: 'dept1',
    department_name: 'Computer Science',
    description: 'Department of Computer Science and Engineering',
    status: 'active'
  },
  {
    id: 'dept2',
    department_name: 'Electrical Engineering',
    description: 'Department of Electrical and Electronics Engineering',
    status: 'active'
  },
  {
    id: 'dept3',
    department_name: 'Mechanical Engineering',
    description: 'Department of Mechanical Engineering',
    status: 'active'
  },
  {
    id: 'dept4',
    department_name: 'Department of Nursing (UG)',
    description: 'Department of Nursing - Undergraduate',
    status: 'active'
  }
];

export const useDepartmentsData = () => {
  const { isDemoMode } = useDemoMode();
  const [departments, setDepartments] = useState<MyjkknDepartment[]>([]);
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
        // Fetch from myjkkn API
        const apiDepartments = await fetchDepartments();
        setDepartments(apiDepartments.filter(dept => dept.status === 'active'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load departments';
      setError(errorMessage);
      
      // Show error toast only for API errors (not demo mode)
      if (!isDemoMode) {
        toast({
          title: 'Error Loading Departments',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      // Fallback to empty array on error
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