import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDemoMode } from './useDemoMode';
import { fetchFilteredStudents, fetchStudent360Data, Student360Data } from '@/services/student360Api';

export interface Student360Filters {
  institution?: string;
  department?: string;
  program?: string;
  section?: string;
  semester?: number;
  searchTerm?: string;
}

export const useStudent360Data = () => {
  const { isDemoMode } = useDemoMode();
  const [students, setStudents] = useState<Student360Data[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Student360Filters>({});
  const { toast } = useToast();


  const loadFilteredStudents = useCallback(async (newFilters: Student360Filters) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch real data first
      try {
        console.log('Attempting to fetch real student data with filters:', newFilters);
        const apiStudents = await fetchFilteredStudents(newFilters);
        
        if (apiStudents && apiStudents.length >= 0) { // Changed condition to accept empty arrays
          console.log('Successfully loaded real student data:', apiStudents.length, 'students');
          setStudents(apiStudents);
          return; // Exit early if real data is available
        }
      } catch (apiError) {
        console.error('Real API failed:', apiError);
        throw new Error('Failed to fetch student data from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load student data';
      setError(errorMessage);
      
      toast({
        title: 'Error Loading Student Data',
        description: errorMessage,
        variant: 'destructive'
      });
      
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, toast]);

  // Load students when filters change
  useEffect(() => {
    loadFilteredStudents(filters);
  }, [filters, loadFilteredStudents]);

  const updateFilters = useCallback((newFilters: Partial<Student360Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const refetch = useCallback(() => {
    loadFilteredStudents(filters);
  }, [filters, loadFilteredStudents]);

  // Fetch detailed data for a specific student
  const fetchStudentDetails = useCallback(async (studentId: string): Promise<Student360Data | null> => {
    // Always try to fetch real data first
    try {
      console.log('Fetching real-time student data for ID:', studentId);
      const result = await fetchStudent360Data(studentId);
      
      if (result && result.name !== "Demo Student") {
        console.log('Successfully fetched real student data:', result);
        return result;
      }
    } catch (error) {
      console.error('Real API failed for student details:', error);
      throw new Error('Failed to fetch student details from API');
    }

    throw new Error('Student not found in API');
  }, [isDemoMode]);

  return {
    students,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch,
    fetchStudentDetails,
    isDemo: isDemoMode
  };
};