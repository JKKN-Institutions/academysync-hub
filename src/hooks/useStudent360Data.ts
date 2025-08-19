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

      // Fetch from Student360 API only
      console.log('Fetching student data with filters:', newFilters);
      const apiStudents = await fetchFilteredStudents(newFilters);
      console.log('Successfully loaded student data:', apiStudents.length, 'students');
      setStudents(apiStudents);
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
  }, [toast]);

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
    try {
      console.log('Fetching student data for ID:', studentId);
      const result = await fetchStudent360Data(studentId);
      console.log('Successfully fetched student data:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch student details:', error);
      
      toast({
        title: 'Error Loading Student Details',
        description: 'Failed to fetch student details from API',
        variant: 'destructive'
      });
      
      return null;
    }
  }, [toast]);

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