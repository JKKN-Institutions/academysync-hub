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
        // Fetch from myjkkn API only - no demo data fallbacks
        const apiStudents = await fetchStudents();
        setStudents(apiStudents);
        console.log(`Successfully fetched ${apiStudents.length} students from API`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students';
      setError(errorMessage);
      
      // Show error toast for API errors
      toast({
        title: 'Error Loading Students',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Set empty array on error - no demo fallback
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