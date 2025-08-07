import { supabase } from '@/integrations/supabase/client';

// Type definitions for myjkkn API responses
export interface MyjkknStudent {
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
}

export interface MyjkknStaff {
  id: string;
  staffId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: 'active' | 'inactive';
  mobile?: string;
  avatar?: string;
}

export interface MyjkknDepartment {
  id: string;
  department_name: string;
  description?: string;
  status: 'active' | 'inactive';
  institution_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MyjkknInstitution {
  id: string;
  institution_name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface MyjkknApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

// Error handling
export class MyjkknApiError extends Error {
  public status: number;
  public statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = 'MyjkknApiError';
    this.status = status;
    this.statusText = statusText;
  }
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
      throw new MyjkknApiError(
        `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof MyjkknApiError) {
      throw error;
    }
    
    console.error('Error making API request:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch data from myjkkn API'
    );
  }
};

// Fetch students from myjkkn API
export const fetchStudents = async (): Promise<MyjkknStudent[]> => {
  try {
    const response = await makeApiRequest<{data: any[]}>(
      '/api-management/students?limit=1000'
    );

    // The API returns {data: [...]} format, not {success: true, data: [...]}
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from API');
    }

    // Transform API response to match our expected format
    return response.data.map(student => ({
      id: student.id,
      studentId: student.id,
      rollNo: student.roll_number,
      name: student.first_name + (student.last_name ? ` ${student.last_name}` : ''),
      email: student.student_email,
      program: student.program?.program_name || 'Unknown Program',
      semesterYear: 1, // Default since not available in API
      status: student.status as 'active' | 'inactive',
      department: student.department?.department_name,
      avatar: student.student_photo_url || undefined,
      gpa: undefined,
      mentor: null,
      interests: []
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Fetch single student by ID
export const fetchStudentById = async (studentId: string): Promise<MyjkknStudent | null> => {
  try {
    const response = await makeApiRequest<MyjkknApiResponse<MyjkknStudent>>(
      `/api-management/students/${studentId}`
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch student');
    }

    return {
      ...response.data,
      id: response.data.studentId || response.data.id,
      avatar: response.data.avatar || `https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=400&h=400&fit=crop&crop=face`,
    };
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
};

// Fetch staff from myjkkn API
export const fetchStaff = async (): Promise<MyjkknStaff[]> => {
  try {
    const response = await makeApiRequest<{data: any[]}>(
      '/api-management/staff?limit=1000'
    );

    // The API returns {data: [...]} format
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from API');
    }

    // Transform API response to match our expected format
    return response.data.map(staff => ({
      id: staff.id,
      staffId: staff.id,
      name: staff.first_name + (staff.last_name ? ` ${staff.last_name}` : ''),
      email: staff.email,
      department: staff.department?.department_name || 'Unknown Department',
      designation: staff.designation || 'Staff',
      status: staff.status as 'active' | 'inactive',
      mobile: staff.mobile,
      avatar: staff.staff_photo_url || undefined
    }));
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
};

// Fetch single staff by ID
export const fetchStaffById = async (staffId: string): Promise<MyjkknStaff | null> => {
  try {
    const response = await makeApiRequest<{data: any}>(
      `/api-management/staff/${staffId}`
    );

    if (!response.data) {
      throw new Error('Staff not found');
    }

    return {
      id: response.data.id,
      staffId: response.data.id,
      name: response.data.first_name + (response.data.last_name ? ` ${response.data.last_name}` : ''),
      email: response.data.email,
      department: response.data.department?.department_name || 'Unknown Department',
      designation: response.data.designation || 'Staff',
      status: response.data.status as 'active' | 'inactive',
      mobile: response.data.mobile,
      avatar: response.data.staff_photo_url || undefined
    };
  } catch (error) {
    console.error('Error fetching staff:', error);
    return null;
  }
};

// Fetch departments from myjkkn API
export const fetchDepartments = async (): Promise<MyjkknDepartment[]> => {
  try {
    const response = await makeApiRequest<{data: any[]}>(
      '/api-management/organizations/departments'
    );

    // The API returns {data: [...]} format
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from API');
    }

    // Transform API response to match our expected format
    return response.data.map(department => ({
      id: department.id,
      department_name: department.department_name,
      description: department.description,
      status: department.status as 'active' | 'inactive',
      institution_id: department.institution_id,
      created_at: department.created_at,
      updated_at: department.updated_at
    }));
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Fetch institutions from myjkkn API
export const fetchInstitutions = async (): Promise<MyjkknInstitution[]> => {
  try {
    const response = await makeApiRequest<{data: any[]}>(
      '/api-management/organizations/institutions'
    );

    // The API returns {data: [...]} format
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from API');
    }

    // Transform API response to match our expected format
    return response.data.map(institution => ({
      id: institution.id,
      institution_name: institution.institution_name,
      description: institution.description,
      status: institution.status as 'active' | 'inactive',
      created_at: institution.created_at,
      updated_at: institution.updated_at
    }));
  } catch (error) {
    console.error('Error fetching institutions:', error);
    throw error;
  }
};

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    await makeApiRequest('/api-management/students?limit=1');
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};