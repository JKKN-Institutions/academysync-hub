
import { useState, useEffect } from 'react';
import { useDemoMode } from './useDemoMode';
import { getDemoStudents } from '@/data/demoData';
import { fetchStudents, MyjkknStudent } from '@/services/myjkknApi';
import { useToast } from '@/hooks/use-toast';

export const useStudentsData = () => {
  const { isDemoMode } = useDemoMode();
  const [students, setStudents] = useState<MyjkknStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        // Use demo data with type conversion
        const demoStudents = getDemoStudents().map(student => ({
          ...student,
          status: student.status as 'active' | 'inactive'
        }));
        setStudents(demoStudents);
        console.log(`Loaded ${demoStudents.length} demo students`);
      } else {
        // Fetch from myjkkn API with better error handling
        console.log('Attempting to fetch students from API...');
        const apiStudents = await fetchStudents();
        setStudents(apiStudents);
        console.log(`Successfully fetched ${apiStudents.length} students from API`);
        
        // Show success message if we got data
        if (apiStudents.length > 0) {
          toast({
            title: 'Students Loaded',
            description: `Successfully loaded ${apiStudents.length} students from MyJKKN API`,
          });
        }
      }
    } catch (err) {
      console.error('Error in loadStudents:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students';
      setError(errorMessage);
      
      // More specific error handling based on error type
      if (errorMessage.includes('500')) {
        toast({
          title: 'Server Error',
          description: 'MyJKKN API is experiencing issues. Please contact your system administrator.',
          variant: 'destructive'
        });
      } else if (errorMessage.includes('API key')) {
        toast({
          title: 'API Configuration Error',
          description: 'Please check your MyJKKN API key configuration in settings.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error Loading Students',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      // Set empty array on error
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [isDemoMode]);

  const refetch = () => {
    console.log('Refetching students data...');
    loadStudents();
  };

  return {
    students,
    loading,
    error,
    refetch,
    isDemo: isDemoMode
  };
};
