import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MyjkknStudent {
  id: string
  first_name: string
  last_name?: string
  student_id?: string
  roll_number?: string
  student_email?: string
  program?: {
    program_name?: string
  }
  department?: {
    department_name?: string
  }
  semester_year?: number
  gpa?: number
  mobile?: string
  status: string
}

interface MyjkknStaff {
  id: string
  first_name: string
  last_name?: string
  email: string
  department?: {
    department_name?: string
  }
  designation?: string
  mobile?: string
  status: string
  staff_photo_url?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body for special operations
    let requestBody: any = {}
    try {
      requestBody = await req.json()
    } catch {
      // No body or invalid JSON, continue with normal sync
    }

    // Get MyJKKN API key
    const apiKey = Deno.env.get('MYJKKN_API_KEY')
    if (!apiKey) {
      throw new Error('MyJKKN API key not configured')
    }

    // Handle connectivity test request
    if (requestBody.test_connectivity) {
      console.log('Running connectivity test...')
      try {
        // Test a simple API endpoint
        const testResponse = await fetch(`https://my.jkkn.ac.in/api/api-management/staff?limit=1`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        })

        return new Response(
          JSON.stringify({
            success: testResponse.ok,
            status: testResponse.status,
            connectivity_test: true,
            api_key_valid: testResponse.ok,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            connectivity_test: true,
            api_key_valid: false,
            error: error.message,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    console.log('Starting automatic data sync from MyJKKN API on login...')

    // Generic API request function
    const makeApiRequest = async <T>(endpoint: string): Promise<T> => {
      console.log(`Making request to: https://my.jkkn.ac.in/api${endpoint}`)
      
      const response = await fetch(`https://my.jkkn.ac.in/api${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error ${response.status}:`, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    }

    // Sync Students using multiple endpoint discovery like myjkknApi
    console.log('Syncing students...')
    let allStudents: MyjkknStudent[] = []
    let studentError: string | null = null

    try {
      console.log('Starting to fetch students with pagination...')
      console.log('=== STUDENTS API PAGINATION FETCH ===')
      
      let currentPage = 1
      let totalPages = 1

      // Try multiple possible endpoints for students like myjkknApi does
      const possibleEndpoints = [
        `/api-management/students?limit=1000`,
        `/api-management/organizations/students?limit=1000`, 
        `/api-management/student?limit=1000`,
        `/students?limit=1000`,
        `/api-management/students`
      ];

      let response: {data: MyjkknStudent[], metadata?: any} | null = null;
      let workingEndpoint: string = '';

      // Try each endpoint until we find one that works
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await makeApiRequest<{data: MyjkknStudent[], metadata?: any}>(endpoint);
          workingEndpoint = endpoint;
          console.log(`✅ Endpoint ${endpoint} worked!`);
          break;
        } catch (error) {
          console.log(`❌ Endpoint ${endpoint} failed:`, error);
          continue;
        }
      }

      if (!response) {
        throw new Error('All student API endpoints failed. Please check API configuration.');
      }

      // Now fetch all pages using the working endpoint
      do {
        console.log(`Fetching students page ${currentPage} from ${workingEndpoint}...`)
        
        if (currentPage > 1) {
          // Add pagination parameters for subsequent pages
          const separator = workingEndpoint.includes('?') ? '&' : '?';
          const paginatedEndpoint = `${workingEndpoint}${separator}page=${currentPage}`;
          response = await makeApiRequest<{data: MyjkknStudent[], metadata?: any}>(paginatedEndpoint);
        }

        console.log(`Page ${currentPage} response:`, {
          studentsCount: response.data?.length || 0,
          metadata: response.metadata
        })

        // Add this page's students to our collection
        if (response.data && Array.isArray(response.data)) {
          allStudents = [...allStudents, ...response.data]
        }

        // Update pagination info
        if (response.metadata) {
          totalPages = response.metadata.totalPages || response.metadata.total_pages || 1
          console.log(`Pagination info: page ${currentPage} of ${totalPages}, total students so far: ${allStudents.length}`)
        } else {
          console.log('No metadata found, assuming single page')
          break
        }

        currentPage++
      } while (currentPage <= totalPages)

      console.log(`✅ Successfully fetched all ${allStudents.length} students from ${totalPages} pages`)
    } catch (error) {
      console.error('Error fetching students:', error)
      studentError = `Failed to fetch students: ${error.message}`
    }

    // Filter and transform students
    const activeStudents = allStudents.filter(student => 
      (student.status === 'active' || student.status === 'Active' || 
       student.status === 1 || student.status === '1') && student.id
    )

    const transformedStudents = activeStudents.map(student => ({
      student_id: student.student_id || student.id,
      roll_no: student.roll_number || null,
      name: `${student.first_name}${student.last_name ? ` ${student.last_name}` : ''}`.trim(),
      email: student.student_email || null,
      program: student.program?.program_name || null,
      department: student.department?.department_name || null,
      semester_year: student.semester_year || null,
      gpa: student.gpa ? parseFloat(student.gpa.toString()) : null,
      mobile: student.mobile || null,
      status: 'active',
      synced_at: new Date().toISOString()
    })).filter(student => student.student_id && student.name)

    // Upsert students only if we have data and no fetch error
    let studentCount = 0
    let studentSyncError: any = null
    
    if (!studentError && transformedStudents.length > 0) {
      console.log(`Syncing ${transformedStudents.length} students to database...`)
      const { error: syncError, count } = await supabase
        .from('students')
        .upsert(transformedStudents, { 
          onConflict: 'student_id',
          count: 'exact'
        })
      
      studentCount = count || 0
      studentSyncError = syncError
      
      if (syncError) {
        console.error('Student sync error:', syncError)
      } else {
        console.log(`Successfully synced ${studentCount} students`)
      }
    }

    // Sync Staff with proper variable scoping
    console.log('Syncing staff...')
    let allStaff: MyjkknStaff[] = []
    let staffError: string | null = null
    let staffCount = 0
    let staffSyncError: any = null

    try {
      let staffCurrentPage = 1
      let staffTotalPages = 1

      do {
        console.log(`Fetching staff page ${staffCurrentPage}...`)
        
        const response = await makeApiRequest<{data: MyjkknStaff[], metadata?: any}>(
          `/api-management/staff?page=${staffCurrentPage}&limit=1000`
        )

        if (response.data && Array.isArray(response.data)) {
          allStaff = [...allStaff, ...response.data]
        }

        if (response.metadata) {
          staffTotalPages = response.metadata.totalPages || response.metadata.total_pages || 1
        } else {
          break
        }

        staffCurrentPage++
      } while (staffCurrentPage <= staffTotalPages)

      console.log(`✅ Successfully fetched all ${allStaff.length} staff members`)

      // Filter and transform staff
      const activeStaff = allStaff.filter(staff => 
        (staff.status === 'active' || staff.status === 'Active' || 
         staff.status === 1 || staff.status === '1') && staff.id && staff.email
      )

      const transformedStaff = activeStaff.map(staff => ({
        staff_id: staff.id,
        name: `${staff.first_name}${staff.last_name ? ` ${staff.last_name}` : ''}`.trim(),
        email: staff.email,
        department: staff.department?.department_name || null,
        designation: staff.designation || null,
        mobile: staff.mobile || null,
        status: 'active',
        avatar_url: staff.staff_photo_url || null,
        synced_at: new Date().toISOString()
      })).filter(staff => staff.staff_id && staff.name && staff.email)

      // Upsert staff
      if (transformedStaff.length > 0) {
        console.log(`Syncing ${transformedStaff.length} staff to database...`)
        const { error: syncError, count } = await supabase
          .from('staff')
          .upsert(transformedStaff, { 
            onConflict: 'staff_id',
            count: 'exact'
          })

        staffCount = count || 0
        staffSyncError = syncError
        
        if (syncError) {
          console.error('Staff sync error:', syncError)
        } else {
          console.log(`Successfully synced ${staffCount} staff members`)
        }
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      staffError = `Failed to fetch staff: ${error.message}`
    }

    const syncResult = {
      success: true,
      students_synced: studentCount || 0,
      staff_synced: staffCount || 0,
      timestamp: new Date().toISOString(),
      errors: [
        ...(studentError ? [`Student fetch: ${studentError}`] : []),
        ...(studentSyncError ? [`Student sync: ${studentSyncError.message}`] : []),
        ...(staffError ? [`Staff fetch: ${staffError}`] : []),
        ...(staffSyncError ? [`Staff sync: ${staffSyncError.message}`] : [])
      ]
    }

    console.log('✅ Auto sync completed:', syncResult)

    return new Response(
      JSON.stringify(syncResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Auto sync failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})