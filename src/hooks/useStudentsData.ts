import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from './useDemoMode';
import { getDemoStudents } from '@/data/demoData';
import { useToast } from '@/hooks/use-toast';

export interface Student {
  id: string;
  studentId: string;
  rollNo: string;
  name: string;
  email: string;
  program: string;
  semesterYear: number;
  status: 'active' | 'inactive';
  gpa?: number;
  department?: string;
  mentor?: string | null;
  avatar?: string;
  interests?: string[];
  mobile?: string;
}

export const useStudentsData = () => {
  const { isDemoMode } = useDemoMode();
  const [students, setStudents] = useState<Student[]>([]);
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
        // First try to fetch from Supabase database (synced from MyJKKN API)
        const { data, error: dbError } = await supabase
          .from('students')
          .select('*')
          .eq('status', 'active')
          .order('name');

        if (dbError) {
          throw dbError;
        }

        // If no students in database, fetch directly from MyJKKN API
        if (!data || data.length === 0) {
          console.log('No students in local database, fetching from MyJKKN API...');
          
          try {
            // Import the fetchStudents function
            const { fetchStudents } = await import('@/services/myjkknApi');
            const apiStudents = await fetchStudents();
            
            console.log(`Fetched ${apiStudents.length} students from MyJKKN API`);
            
            // Transform API data to match expected interface (API already transformed in fetchStudents)
            const transformedStudents = apiStudents.map(student => ({
              id: student.id,
              studentId: student.studentId,
              rollNo: student.rollNo || '',
              name: student.name,
              email: student.email || '',
              program: student.program || 'Unknown Program',
              semesterYear: student.semesterYear || 1,
              status: student.status,
              department: student.department || 'Unknown Department',
              avatar: student.avatar,
              mobile: undefined, // Not available in the interface
              gpa: student.gpa,
              mentor: student.mentor,
              interests: student.interests || []
            }));

            setStudents(transformedStudents);
            return;
          } catch (apiError) {
            console.warn('Failed to fetch from MyJKKN API, using empty array:', apiError);
            setStudents([]);
            return;
          }
        }

        // Transform database data to match expected interface
        const transformedStudents = (data || []).map(student => ({
          id: student.id,
          studentId: student.student_id,
          rollNo: student.roll_no || '',
          name: student.name,
          email: student.email || '',
          program: student.program || 'Unknown Program',
          semesterYear: student.semester_year || 1,
          status: student.status as 'active' | 'inactive',
          department: student.department,
          avatar: student.avatar_url,
          mobile: student.mobile,
          gpa: student.gpa ? Number(student.gpa) : undefined,
          mentor: null,
          interests: []
        }));

        setStudents(transformedStudents);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students';
      setError(errorMessage);
      
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