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
      } else {
        // Fetch from myjkkn API with fallback to demo data on server error
        try {
          const apiStudents = await fetchStudents();
          setStudents(apiStudents);
        } catch (apiError) {
          console.warn('API failed, falling back to demo data:', apiError);
          // Fallback to demo data when API fails
          const demoStudents = getDemoStudents().map(student => ({
            ...student,
            status: student.status as 'active' | 'inactive'
          }));
          setStudents(demoStudents);
          
          // Show toast indicating fallback
          toast({
            title: 'Using Demo Data',
            description: 'Student API is unavailable. Showing demo data instead.',
            variant: 'default'
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students';
      setError(errorMessage);
      
      // Show error toast only for API errors (not demo mode)
      if (!isDemoMode) {
        toast({
          title: 'Error Loading Students',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      // Fallback to empty array on error
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [isDemoMode]);

  const refetch = () => {
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