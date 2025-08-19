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
      console.log('Loading departments, isDemoMode:', isDemoMode);

      if (isDemoMode) {
        // Use demo data
        console.log('Using demo departments data');
        setDepartments(getDemoDepartments());
      } else {
        // Fetch from myjkkn API
        console.log('Fetching departments from API...');
        const apiDepartments = await fetchDepartments();
        console.log('Raw API departments received:', apiDepartments);
        
        // DETAILED ANALYSIS: Let's see exactly what we're getting
        console.log('=== DEPARTMENTS API ANALYSIS ===');
        console.log('Total departments returned:', apiDepartments.length);
        
        // Group by institution_id to see the distribution
        const byInstitution = apiDepartments.reduce((acc, dept) => {
          if (!acc[dept.institution_id]) {
            acc[dept.institution_id] = [];
          }
          acc[dept.institution_id].push(dept.department_name);
          return acc;
        }, {} as Record<string, string[]>);
        
        console.log('Departments grouped by institution_id:', byInstitution);
        console.log('Number of unique institutions with departments:', Object.keys(byInstitution).length);
        
        // Get unique institution IDs from departments
        const departmentInstitutionIds = [...new Set(apiDepartments.map(dept => dept.institution_id))];
        console.log('Unique institution IDs found in departments:', departmentInstitutionIds);
        
        const activeDepartments = apiDepartments.filter(dept => dept.status === 'active');
        console.log('Active departments filtered:', activeDepartments.length, 'out of', apiDepartments.length);
        setDepartments(activeDepartments);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load departments';
      console.error('Error in loadDepartments:', err);
      setError(errorMessage);
      
      // Show error toast for API failures
      toast({
        title: 'Error Loading Departments',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Set empty array on error - no demo fallback
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