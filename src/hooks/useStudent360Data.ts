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

  // Generate demo student data
  const getDemoStudents = (): Student360Data[] => {
    return [
      {
        id: 'demo_1',
        studentId: 'demo_1',
        rollNo: 'CS2023001',
        name: 'Alex Chen',
        email: 'alex.chen@student.jkkn.ac.in',
        phone: '+91-9876543210',
        program: 'Computer Science - B.Tech',
        department: 'Computer Science & Engineering',
        institution: 'JKKN College of Engineering & Technology',
        degree: 'Bachelor of Technology',
        section: 'A',
        semester: 6,
        year: 3,
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=400&h=400&fit=crop&crop=face',
        attendance: {
          total_classes: 50,
          attended_classes: 42,
          percentage: 84,
          monthly_breakdown: [
            { month: 'January', classes: 20, attended: 18, percentage: 90 },
            { month: 'February', classes: 18, attended: 15, percentage: 83 },
            { month: 'March', classes: 12, attended: 9, percentage: 75 }
          ],
          subject_wise: [
            { subject: 'Data Structures', total: 15, attended: 13, percentage: 87 },
            { subject: 'Algorithms', total: 12, attended: 10, percentage: 83 },
            { subject: 'Database Systems', total: 10, attended: 8, percentage: 80 }
          ]
        },
        leave_records: [
          {
            id: '1',
            type: 'sick',
            start_date: '2024-01-15',
            end_date: '2024-01-17',
            days: 3,
            reason: 'Fever and cold',
            status: 'approved',
            applied_date: '2024-01-14',
            approved_by: 'Dr. Smith'
          }
        ],
        assignments: [
          {
            id: '1',
            title: 'Data Structure Implementation',
            subject: 'Data Structures',
            due_date: '2024-01-25',
            submitted_date: '2024-01-24',
            status: 'graded',
            marks: 85,
            max_marks: 100,
            feedback: 'Excellent implementation'
          }
        ],
        results: [
          {
            id: '1',
            semester: 'Fall',
            year: '2023',
            subjects: [
              {
                subject_name: 'Data Structures',
                subject_code: 'CS301',
                internal_marks: 18,
                external_marks: 65,
                total_marks: 83,
                max_marks: 100,
                grade: 'A',
                credits: 4
              }
            ],
            sgpa: 3.7,
            cgpa: 3.65,
            percentage: 78.5,
            status: 'pass'
          }
        ],
        requests: [
          {
            id: '1',
            type: 'transcript',
            title: 'Academic Transcript Request',
            description: 'Transcript required for internship',
            status: 'completed',
            submitted_date: '2024-01-10',
            completed_date: '2024-01-15',
            priority: 'medium'
          }
        ],
        fees: {
          total_fees: 150000,
          paid_amount: 75000,
          pending_amount: 75000,
          due_date: '2024-03-15',
          fee_structure: [
            {
              category: 'Tuition Fee',
              amount: 100000,
              paid: 50000,
              pending: 50000,
              due_date: '2024-03-15'
            }
          ],
          payment_history: [
            {
              amount: 50000,
              payment_date: '2024-01-15',
              receipt_no: 'RCP001',
              payment_method: 'Online'
            }
          ]
        },
        bus_payments: {
          total_bus_fees: 12000,
          paid_amount: 8000,
          pending_amount: 4000,
          route: 'Route A - Main Campus',
          stop_name: 'Central Bus Stop',
          monthly_fee: 1000,
          payment_history: [
            {
              month: 'January 2024',
              amount: 1000,
              payment_date: '2024-01-05',
              receipt_no: 'BUS001',
              status: 'paid'
            },
            {
              month: 'February 2024',
              amount: 1000,
              payment_date: '2024-02-05',
              receipt_no: 'BUS002',
              status: 'paid'
            }
          ]
        },
        academic_dates: {
          join_date: '2023-08-15',
          expected_completion_date: '2027-05-15',
          course_duration_years: 4,
          current_academic_year: '2024-2025',
          current_semester: 6
        }
      },
      {
        id: 'demo_2',
        studentId: 'demo_2',
        rollNo: 'EC2023002',
        name: 'Priya Sharma',
        email: 'priya.sharma@student.jkkn.ac.in',
        phone: '+91-9876543211',
        program: 'Electronics & Communication - B.Tech',
        department: 'Electronics & Communication Engineering',
        institution: 'JKKN College of Engineering & Technology',
        degree: 'Bachelor of Technology',
        section: 'B',
        semester: 4,
        year: 2,
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b330?w=400&h=400&fit=crop&crop=face',
        attendance: {
          total_classes: 45,
          attended_classes: 40,
          percentage: 89,
          monthly_breakdown: [
            { month: 'January', classes: 18, attended: 16, percentage: 89 },
            { month: 'February', classes: 15, attended: 14, percentage: 93 },
            { month: 'March', classes: 12, attended: 10, percentage: 83 }
          ],
          subject_wise: [
            { subject: 'Circuit Analysis', total: 15, attended: 14, percentage: 93 },
            { subject: 'Signal Processing', total: 15, attended: 13, percentage: 87 },
            { subject: 'Communication Systems', total: 15, attended: 13, percentage: 87 }
          ]
        },
        leave_records: [],
        assignments: [
          {
            id: '2',
            title: 'Circuit Design Project',
            subject: 'Circuit Analysis',
            due_date: '2024-02-10',
            submitted_date: '2024-02-09',
            status: 'graded',
            marks: 92,
            max_marks: 100,
            feedback: 'Outstanding design approach'
          }
        ],
        results: [
          {
            id: '2',
            semester: 'Fall',
            year: '2023',
            subjects: [
              {
                subject_name: 'Circuit Analysis',
                subject_code: 'EC201',
                internal_marks: 19,
                external_marks: 72,
                total_marks: 91,
                max_marks: 100,
                grade: 'A+',
                credits: 4
              }
            ],
            sgpa: 3.9,
            cgpa: 3.85,
            percentage: 89.2,
            status: 'pass'
          }
        ],
        requests: [],
        fees: {
          total_fees: 150000,
          paid_amount: 150000,
          pending_amount: 0,
          due_date: '2024-03-15',
          fee_structure: [
            {
              category: 'Tuition Fee',
              amount: 100000,
              paid: 100000,
              pending: 0,
              due_date: '2024-01-15'
            }
          ],
          payment_history: [
            {
              amount: 150000,
              payment_date: '2024-01-05',
              receipt_no: 'RCP002',
              payment_method: 'Bank Transfer'
            }
          ]
        },
        bus_payments: {
          total_bus_fees: 12000,
          paid_amount: 12000,
          pending_amount: 0,
          route: 'Route B - Science Block',
          stop_name: 'Science Campus Stop',
          monthly_fee: 1000,
          payment_history: [
            {
              month: 'January 2024',
              amount: 1000,
              payment_date: '2024-01-05',
              receipt_no: 'BUS003',
              status: 'paid'
            },
            {
              month: 'February 2024',
              amount: 1000,
              payment_date: '2024-02-05',
              receipt_no: 'BUS004',
              status: 'paid'
            }
          ]
        },
        academic_dates: {
          join_date: '2022-08-15',
          expected_completion_date: '2026-05-15',
          course_duration_years: 4,
          current_academic_year: '2024-2025',
          current_semester: 4
        }
      }
    ];
  };

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
        console.warn('Real API failed, will use demo data as fallback:', apiError);
        
        // Always fall back to demo data if API fails, regardless of demo mode setting
        console.log('Using demo data as fallback since API is not available');
      }

      // Use demo data as fallback when API fails
      console.log('Loading demo data as fallback');
      // Filter demo data
      let demoStudents = getDemoStudents();
        
        if (newFilters.searchTerm) {
          const searchLower = newFilters.searchTerm.toLowerCase();
          demoStudents = demoStudents.filter(student => 
            student.name.toLowerCase().includes(searchLower) ||
            student.rollNo.toLowerCase().includes(searchLower) ||
            student.email.toLowerCase().includes(searchLower) ||
            student.department.toLowerCase().includes(searchLower)
          );
        }

        if (newFilters.institution) {
          demoStudents = demoStudents.filter(student => 
            student.institution.includes(newFilters.institution) ||
            student.institution === newFilters.institution
          );
        }

        if (newFilters.department) {
          demoStudents = demoStudents.filter(student => 
            student.department.includes(newFilters.department) ||
            student.department === newFilters.department
          );
        }

        if (newFilters.program) {
          demoStudents = demoStudents.filter(student => 
            student.program.includes(newFilters.program) ||
            student.program === newFilters.program
          );
        }

        if (newFilters.section) {
          demoStudents = demoStudents.filter(student => 
            student.section === newFilters.section
          );
        }

        if (newFilters.semester) {
          demoStudents = demoStudents.filter(student => 
            student.semester === newFilters.semester
          );
        }

      setStudents(demoStudents);
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
      console.warn('Real API failed for student details, using demo data as fallback:', error);
    }

    // Always fallback to demo data when API fails
    console.log('Using demo data as fallback for student details');
    const demoStudents = getDemoStudents();
    return demoStudents.find(s => s.id === studentId) || null;
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