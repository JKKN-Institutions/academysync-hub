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
    const response = await makeApiRequest<MyjkknApiResponse<MyjkknStudent[]>>(
      '/api-management/students'
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch students');
    }

    // Transform API response to match our expected format
    return response.data.map(student => ({
      ...student,
      id: student.studentId || student.id,
      avatar: student.avatar || `https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=400&h=400&fit=crop&crop=face`,
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