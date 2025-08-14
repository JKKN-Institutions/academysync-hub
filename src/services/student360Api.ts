import { supabase } from '@/integrations/supabase/client';

// Extended type definitions for Student 360 data
export interface StudentAttendance {
  total_classes: number;
  attended_classes: number;
  percentage: number;
  monthly_breakdown: Array<{
    month: string;
    classes: number;
    attended: number;
    percentage: number;
  }>;
  subject_wise: Array<{
    subject: string;
    total: number;
    attended: number;
    percentage: number;
  }>;
}

export interface StudentLeave {
  id: string;
  type: 'sick' | 'casual' | 'emergency' | 'od';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_date: string;
  approved_by?: string;
}

export interface StudentAssignment {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  submitted_date?: string;
  status: 'pending' | 'submitted' | 'overdue' | 'graded';
  marks?: number;
  max_marks?: number;
  feedback?: string;
}

export interface StudentResult {
  id: string;
  semester: string;
  year: string;
  subjects: Array<{
    subject_name: string;
    subject_code: string;
    internal_marks: number;
    external_marks: number;
    total_marks: number;
    max_marks: number;
    grade: string;
    credits: number;
  }>;
  sgpa: number;
  cgpa: number;
  percentage: number;
  status: 'pass' | 'fail';
}

export interface StudentRequest {
  id: string;
  type: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  submitted_date: string;
  completed_date?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface StudentFees {
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  due_date: string;
  fee_structure: Array<{
    category: string;
    amount: number;
    paid: number;
    pending: number;
    due_date: string;
  }>;
  payment_history: Array<{
    amount: number;
    payment_date: string;
    receipt_no: string;
    payment_method: string;
  }>;
}

export interface StudentBusPayments {
  total_bus_fees: number;
  paid_amount: number;
  pending_amount: number;
  route: string;
  stop_name: string;
  monthly_fee: number;
  payment_history: Array<{
    month: string;
    amount: number;
    payment_date: string;
    receipt_no: string;
    status: 'paid' | 'pending' | 'overdue';
  }>;
}

export interface StudentAcademicDates {
  join_date: string;
  expected_completion_date: string;
  actual_completion_date?: string;
  course_duration_years: number;
  current_academic_year: string;
  current_semester: number;
}

export interface Student360Data {
  id: string;
  studentId: string;
  rollNo: string;
  name: string;
  email: string;
  phone?: string;
  program: string;
  department: string;
  institution: string;
  degree: string;
  section: string;
  semester: number;
  year: number;
  status: 'active' | 'inactive';
  avatar?: string;
  attendance: StudentAttendance;
  leave_records: StudentLeave[];
  assignments: StudentAssignment[];
  results: StudentResult[];
  requests: StudentRequest[];
  fees: StudentFees;
  bus_payments: StudentBusPayments;
  academic_dates: StudentAcademicDates;
}

// Get API key from Supabase secrets
const getApiKey = async (): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('get-secret', {
    body: { name: 'MYJKKN_API_KEY' }
  });

  if (error) {
    throw new Error('Failed to retrieve API key. Please configure MYJKKN_API_KEY in settings.');
  }

  if (!data?.value) {
    throw new Error('MYJKKN_API_KEY not found. Please add it in the admin settings.');
  }

  return data.value;
};

// Base API configuration
const API_BASE_URL = 'https://myadmin.jkkn.ac.in/api';

// Generic API request function
const makeApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const apiKey = await getApiKey();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error making API request:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch data from myjkkn API'
    );
  }
};

// Fetch student attendance data
export const fetchStudentAttendance = async (studentId: string): Promise<StudentAttendance> => {
  try {
    const response = await makeApiRequest<{data: any}>(
      `/api-management/students/${studentId}/attendance`
    );

    // Transform API response to match our expected format
    return {
      total_classes: response.data?.total_classes || 0,
      attended_classes: response.data?.attended_classes || 0,
      percentage: response.data?.percentage || 0,
      monthly_breakdown: response.data?.monthly_breakdown || [],
      subject_wise: response.data?.subject_wise || []
    };
  } catch (error) {
    console.warn('Attendance API not available, using mock data');
    // Return mock data when API is not available
    return {
      total_classes: 50,
      attended_classes: 42,
      percentage: 84,
      monthly_breakdown: [
        { month: 'January', classes: 20, attended: 18, percentage: 90 },
        { month: 'February', classes: 18, attended: 15, percentage: 83 },
        { month: 'March', classes: 12, attended: 9, percentage: 75 }
      ],
      subject_wise: [
        { subject: 'Mathematics', total: 15, attended: 13, percentage: 87 },
        { subject: 'Physics', total: 12, attended: 10, percentage: 83 },
        { subject: 'Chemistry', total: 10, attended: 8, percentage: 80 }
      ]
    };
  }
};

// Fetch student leave records
export const fetchStudentLeave = async (studentId: string): Promise<StudentLeave[]> => {
  try {
    const response = await makeApiRequest<{data: any[]}>(
      `/api-management/students/${studentId}/leave`
    );

    return response.data || [];
  } catch (error) {
    console.warn('Leave API not available, using mock data');
    return [
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
      },
      {
        id: '2',
        type: 'od',
        start_date: '2024-02-20',
        end_date: '2024-02-20',
        days: 1,
        reason: 'Technical symposium participation',
        status: 'approved',
        applied_date: '2024-02-18'
      }
    ];
  }
};

// Fetch student assignments
export const fetchStudentAssignments = async (studentId: string): Promise<StudentAssignment[]> => {
  try {
    const response = await makeApiRequest<{data: any[]}>(
      `/api-management/students/${studentId}/assignments`
    );

    return response.data || [];
  } catch (error) {
    console.warn('Assignments API not available, using mock data');
    return [
      {
        id: '1',
        title: 'Linear Algebra Assignment',
        subject: 'Mathematics',
        due_date: '2024-01-25',
        submitted_date: '2024-01-24',
        status: 'graded',
        marks: 85,
        max_marks: 100,
        feedback: 'Good work on theoretical concepts'
      },
      {
        id: '2',
        title: 'Physics Lab Report',
        subject: 'Physics',
        due_date: '2024-02-05',
        status: 'pending',
        max_marks: 50
      }
    ];
  }
};

// Fetch student results
export const fetchStudentResults = async (studentId: string): Promise<StudentResult[]> => {
  try {
    const response = await makeApiRequest<{data: any[]}>(
      `/api-management/students/${studentId}/results`
    );

    return response.data || [];
  } catch (error) {
    console.warn('Results API not available, using mock data');
    return [
      {
        id: '1',
        semester: 'Fall',
        year: '2023',
        subjects: [
          {
            subject_name: 'Advanced Mathematics',
            subject_code: 'MATH301',
            internal_marks: 18,
            external_marks: 65,
            total_marks: 83,
            max_marks: 100,
            grade: 'A',
            credits: 4
          },
          {
            subject_name: 'Physics',
            subject_code: 'PHY201',
            internal_marks: 16,
            external_marks: 58,
            total_marks: 74,
            max_marks: 100,
            grade: 'B+',
            credits: 3
          }
        ],
        sgpa: 3.7,
        cgpa: 3.65,
        percentage: 78.5,
        status: 'pass'
      }
    ];
  }
};

// Fetch student requests
export const fetchStudentRequests = async (studentId: string): Promise<StudentRequest[]> => {
  try {
    const response = await makeApiRequest<{data: any[]}>(
      `/api-management/students/${studentId}/requests`
    );

    return response.data || [];
  } catch (error) {
    console.warn('Requests API not available, using mock data');
    return [
      {
        id: '1',
        type: 'transcript',
        title: 'Academic Transcript Request',
        description: 'Transcript required for internship application',
        status: 'completed',
        submitted_date: '2024-01-10',
        completed_date: '2024-01-15',
        priority: 'medium'
      },
      {
        id: '2',
        type: 'certificate',
        title: 'Bonafide Certificate',
        description: 'Certificate for scholarship application',
        status: 'pending',
        submitted_date: '2024-02-01',
        priority: 'high'
      }
    ];
  }
};

// Fetch student fees information
export const fetchStudentFees = async (studentId: string): Promise<StudentFees> => {
  try {
    const response = await makeApiRequest<{data: any}>(
      `/api-management/students/${studentId}/fees`
    );

    return response.data || {};
  } catch (error) {
    console.warn('Fees API not available, using mock data');
    return {
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
        },
        {
          category: 'Library Fee',
          amount: 25000,
          paid: 25000,
          pending: 0,
          due_date: '2024-01-15'
        },
        {
          category: 'Lab Fee',
          amount: 25000,
          paid: 0,
          pending: 25000,
          due_date: '2024-03-15'
        }
      ],
      payment_history: [
        {
          amount: 50000,
          payment_date: '2024-01-15',
          receipt_no: 'RCP001',
          payment_method: 'Online'
        },
        {
          amount: 25000,
          payment_date: '2024-01-10',
          receipt_no: 'RCP002',
          payment_method: 'Cash'
        }
      ]
    };
  }
};

// Fetch student bus payments
export const fetchStudentBusPayments = async (studentId: string): Promise<StudentBusPayments> => {
  try {
    const response = await makeApiRequest<{data: any}>(
      `/api-management/students/${studentId}/bus-payments`
    );

    return response.data || {};
  } catch (error) {
    console.warn('Bus payments API not available, using mock data');
    return {
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
        },
        {
          month: 'March 2024',
          amount: 1000,
          payment_date: '',
          receipt_no: '',
          status: 'pending'
        }
      ]
    };
  }
};

// Fetch comprehensive student 360 data
export const fetchStudent360Data = async (studentId: string): Promise<Student360Data | null> => {
  try {
    console.log('Fetching student 360 data for ID:', studentId);
    
    // Fetch basic student info first
    const studentResponse = await makeApiRequest<{data: any}>(
      `/api-management/students/${studentId}`
    );

    console.log('Student API response:', studentResponse);

    if (!studentResponse.data) {
      console.warn('No student data found for ID:', studentId);
      return null;
    }

    const student = studentResponse.data;

    // Fetch all additional data in parallel
    const [attendance, leaveRecords, assignments, results, requests, fees, busPayments] = await Promise.all([
      fetchStudentAttendance(studentId),
      fetchStudentLeave(studentId),
      fetchStudentAssignments(studentId),
      fetchStudentResults(studentId),
      fetchStudentRequests(studentId),
      fetchStudentFees(studentId),
      fetchStudentBusPayments(studentId)
    ]);

    // Calculate academic dates
    const joinDate = student.admission_date || student.created_at || new Date().toISOString();
    const courseDurationYears = student.program?.duration_years || 4;
    const expectedCompletionDate = new Date(joinDate);
    expectedCompletionDate.setFullYear(expectedCompletionDate.getFullYear() + courseDurationYears);

    const result = {
      id: student.id,
      studentId: student.id,
      rollNo: student.roll_number || '',
      name: student.first_name + (student.last_name ? ` ${student.last_name}` : ''),
      email: student.student_email || '',
      phone: student.mobile || '',
      program: student.program?.program_name || 'Unknown Program',
      department: student.department?.department_name || 'Unknown Department',
      institution: student.institution?.institution_name || 'Unknown Institution',
      degree: student.degree?.degree_name || 'Unknown Degree',
      section: student.section || 'A',
      semester: student.current_semester || 1,
      year: student.current_year || 1,
      status: student.status as 'active' | 'inactive',
      avatar: student.student_photo_url,
      attendance,
      leave_records: leaveRecords,
      assignments,
      results,
      requests,
      fees,
      bus_payments: busPayments,
      academic_dates: {
        join_date: joinDate,
        expected_completion_date: expectedCompletionDate.toISOString(),
        actual_completion_date: student.graduation_date,
        course_duration_years: courseDurationYears,
        current_academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        current_semester: student.current_semester || 1
      }
    };

    console.log('Final student 360 data:', result);
    return result;
  } catch (error) {
    console.error('Error fetching student 360 data:', error);
    
    // Return mock data as fallback when API fails
    const mockStudent: Student360Data = {
      id: studentId,
      studentId: studentId,
      rollNo: "MOCK" + studentId.slice(-4),
      name: "Demo Student",
      email: "demo.student@jkkn.ac.in",
      phone: "+91-9876543210",
      program: "Computer Science - B.Tech",
      department: "Computer Science & Engineering",
      institution: "JKKN College of Engineering & Technology",
      degree: "Bachelor of Technology",
      section: "A",
      semester: 4,
      year: 2,
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
        current_semester: 4
      }
    };
    
    console.log('Returning mock data as fallback:', mockStudent);
    return mockStudent;
  }
};

// Fetch filtered students for Student 360 listing
export const fetchFilteredStudents = async (filters: {
  institution?: string;
  department?: string;
  degree?: string;
  section?: string;
  semester?: number;
  searchTerm?: string;
}): Promise<Student360Data[]> => {
  try {
    console.log('Fetching filtered students with filters:', filters);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.institution) params.append('institution_id', filters.institution);
    if (filters.department) params.append('department_id', filters.department);
    if (filters.degree) params.append('degree_id', filters.degree);
    if (filters.section) params.append('section', filters.section);
    if (filters.semester) params.append('semester', filters.semester.toString());
    if (filters.searchTerm) params.append('search', filters.searchTerm);
    
    params.append('limit', '1000'); // Get a large set for filtering
    
    const response = await makeApiRequest<{data: any[]}>(
      `/api-management/students?${params.toString()}`
    );

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    // Transform basic student data
    const transformedStudents = response.data
      .filter(student => student.status === 'active' || student.status === 'Active' || student.status === 1)
      .map(student => ({
        id: student.id,
        studentId: student.id,
        rollNo: student.roll_number || '',
        name: student.first_name + (student.last_name ? ` ${student.last_name}` : ''),
        email: student.student_email || '',
        phone: student.mobile || '',
        program: student.program?.program_name || 'Unknown Program',
        department: student.department?.department_name || 'Unknown Department',
        institution: student.institution?.institution_name || 'Unknown Institution',
        degree: student.degree?.degree_name || 'Unknown Degree',
        section: student.section || 'A',
        semester: student.current_semester || 1,
        year: student.current_year || 1,
        status: 'active' as const,
        avatar: student.student_photo_url,
        // Initialize with empty data - will be loaded on demand
        attendance: {
          total_classes: 0,
          attended_classes: 0,
          percentage: 0,
          monthly_breakdown: [],
          subject_wise: []
        },
        leave_records: [],
        assignments: [],
        results: [],
        requests: [],
        fees: {
          total_fees: 0,
          paid_amount: 0,
          pending_amount: 0,
          due_date: '',
          fee_structure: [],
          payment_history: []
        },
        bus_payments: {
          total_bus_fees: 0,
          paid_amount: 0,
          pending_amount: 0,
          route: '',
          stop_name: '',
          monthly_fee: 0,
          payment_history: []
        },
        academic_dates: {
          join_date: student.admission_date || student.created_at || new Date().toISOString(),
          expected_completion_date: new Date().toISOString(),
          course_duration_years: 4,
          current_academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          current_semester: student.current_semester || 1
        }
      }));

    console.log(`Successfully transformed ${transformedStudents.length} filtered students`);
    return transformedStudents;
  } catch (error) {
    console.error('Error fetching filtered students:', error);
    throw error;
  }
};