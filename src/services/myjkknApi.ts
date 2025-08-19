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
export const getApiKey = async (): Promise<string> => {
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

// Generic API request function with improved error handling
export const makeApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  let apiKey: string;
  
  try {
    apiKey = await getApiKey();
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
  } catch (error) {
    console.error('Failed to get API key:', error);
    throw new Error('API key not configured. Please check your settings.');
  }
  
  try {
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

    console.log(`API Response status: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      // More specific error handling
      if (response.status === 500) {
        throw new MyjkknApiError(
          'MyJKKN server is experiencing issues. Please try again later or contact support.',
          response.status,
          response.statusText
        );
      } else if (response.status === 401) {
        throw new MyjkknApiError(
          'Invalid API key. Please check your authentication credentials.',
          response.status,
          response.statusText
        );
      } else if (response.status === 403) {
        throw new MyjkknApiError(
          'Access denied. Please check your permissions.',
          response.status,
          response.statusText
        );
      } else if (response.status === 404) {
        throw new MyjkknApiError(
          'API endpoint not found. Please check the API configuration.',
          response.status,
          response.statusText
        );
      } else {
        throw new MyjkknApiError(
          `HTTP error! status: ${response.status}`,
          response.status,
          response.statusText
        );
      }
    }

    const data = await response.json();
    console.log(`API request successful for ${endpoint}`);
    return data;
  } catch (error) {
    if (error instanceof MyjkknApiError) {
      throw error;
    }
    
    console.error('Error making API request:', error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch data from MyJKKN API'
    );
  }
};

// Fetch students from myjkkn API with improved error handling
export const fetchStudents = async (): Promise<MyjkknStudent[]> => {
  try {
    console.log('Starting to fetch students with pagination...');
    console.log('=== STUDENTS API PAGINATION FETCH ===');
    
    let allStudents: any[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let retryCount = 0;
    const maxRetries = 3;

    // Fetch all pages of students with retry logic
    do {
      try {
        console.log(`Fetching students page ${currentPage}...`);
        
        const response = await makeApiRequest<{data: any[], metadata?: any}>(
          `/api-management/students?page=${currentPage}&limit=100`
        );

        console.log(`Page ${currentPage} response:`, {
          studentsCount: response.data?.length || 0,
          metadata: response.metadata
        });

        // Add this page's students to our collection
        if (response.data && Array.isArray(response.data)) {
          allStudents = [...allStudents, ...response.data];
        }

        // Update pagination info
        if (response.metadata) {
          totalPages = response.metadata.totalPages || response.metadata.total_pages || 1;
          console.log(`Pagination info: page ${currentPage} of ${totalPages}, total students so far: ${allStudents.length}`);
        } else {
          console.log('No metadata found, assuming single page');
          break;
        }

        currentPage++;
        retryCount = 0; // Reset retry count on successful request
      } catch (pageError) {
        console.error(`Error fetching page ${currentPage}:`, pageError);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          throw pageError;
        }
        
        console.log(`Retrying page ${currentPage} (attempt ${retryCount + 1}/${maxRetries})`);
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    } while (currentPage <= totalPages && retryCount < maxRetries);

    console.log(`✅ Successfully fetched all ${allStudents.length} students from ${totalPages} pages`);

    // Filter for active students only
    const activeStudents = allStudents.filter(student => {
      const isActive = student.status === 'active' || student.status === 'Active' || student.status === 1 || student.status === '1';
      return isActive;
    });

    console.log(`Filtered to ${activeStudents.length} active students out of ${allStudents.length} total`);

    // Transform API response to match our expected format
    const transformedStudents = activeStudents.map(student => ({
      id: student.id,
      studentId: student.id,
      rollNo: student.roll_number || 'N/A',
      name: student.first_name + (student.last_name ? ` ${student.last_name}` : ''),
      email: student.student_email || '',
      program: student.program?.program_name || 'Unknown Program',
      semesterYear: 1, // Default since not available in API
      status: 'active' as 'active' | 'inactive',
      department: student.department?.department_name || 'Unknown Department',
      avatar: student.student_photo_url || undefined,
      gpa: undefined,
      mentor: null,
      interests: []
    }));

    console.log(`🎉 Successfully transformed ${transformedStudents.length} students`);
    return transformedStudents;
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
    console.log('Starting to fetch departments with pagination...');
    console.log('=== DEPARTMENTS API PAGINATION FETCH ===');
    
    let allDepartments: any[] = [];
    let currentPage = 1;
    let totalPages = 1;

    // Fetch all pages of departments
    do {
      console.log(`Fetching departments page ${currentPage}...`);
      
      const response = await makeApiRequest<{data: any[], metadata?: any}>(
        `/api-management/organizations/departments?page=${currentPage}`
      );

      console.log(`Page ${currentPage} response:`, {
        departmentsCount: response.data?.length || 0,
        metadata: response.metadata
      });

      // Add this page's departments to our collection
      if (response.data && Array.isArray(response.data)) {
        allDepartments = [...allDepartments, ...response.data];
      }

      // Update pagination info
      if (response.metadata) {
        totalPages = response.metadata.totalPages || response.metadata.total_pages || 1;
        console.log(`Pagination info: page ${currentPage} of ${totalPages}, total departments so far: ${allDepartments.length}`);
      } else {
        console.log('No metadata found, assuming single page');
        break;
      }

      currentPage++;
    } while (currentPage <= totalPages);

    console.log(`✅ Successfully fetched all ${allDepartments.length} departments from ${totalPages} pages`);

    // Debug: Log departments by institution
    const byInstitution = allDepartments.reduce((acc, dept) => {
      if (!acc[dept.institution_id]) {
        acc[dept.institution_id] = [];
      }
      acc[dept.institution_id].push(dept.department_name);
      return acc;
    }, {} as Record<string, string[]>);
    
    console.log('All departments grouped by institution_id:', byInstitution);
    console.log('Number of unique institutions with departments:', Object.keys(byInstitution).length);

    // Filter for active departments only
    const activeDepartments = allDepartments.filter(department => {
      const isActive = department.is_active === true || department.is_active === 1 || department.is_active === '1';
      return isActive;
    });

    console.log(`Filtered to ${activeDepartments.length} active departments out of ${allDepartments.length} total`);

    // Transform API response to match our expected format
    const transformedData = activeDepartments.map(department => {
      console.log('Processing department:', department);
      
      // Extract the actual string value from the department_name field
      let departmentName = 'Unknown Department';
      if (typeof department.department_name === 'string') {
        departmentName = department.department_name;
      } else if (department.department_name && typeof department.department_name === 'object') {
        departmentName = department.department_name.value || department.department_name.text || department.department_name.name || 'Unknown Department';
      }

      // Extract the actual string value from the department_code field  
      let departmentCode = departmentName; // Use name as fallback for description
      if (typeof department.department_code === 'string') {
        departmentCode = department.department_code;
      } else if (department.department_code && typeof department.department_code === 'object') {
        departmentCode = department.department_code.value || department.department_code.text || department.department_code.code || departmentName;
      }

      const transformed = {
        id: department.id,
        department_name: departmentName,
        description: departmentCode,
        status: 'active' as 'active' | 'inactive',
        institution_id: department.institution_id,
        created_at: department.created_at,
        updated_at: department.updated_at
      };
      
      console.log('Transformed department:', transformed);
      return transformed;
    });

    console.log(`🎉 Successfully transformed ${transformedData.length} departments:`, transformedData);
    return transformedData;
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
      institution_name: institution.name, // API returns 'name', not 'institution_name'
      description: institution.website || institution.email || 'Institution',
      status: institution.is_active ? 'active' : 'inactive' as 'active' | 'inactive',
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
