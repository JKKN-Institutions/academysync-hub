import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MyjkknApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  metadata?: {
    totalPages?: number;
    total_pages?: number;
    currentPage?: number;
    total?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the API key from secrets
    const myjkknApiKey = Deno.env.get('MYJKKN_API_KEY')
    if (!myjkknApiKey) {
      throw new Error('MYJKKN_API_KEY not found in environment variables')
    }

    const apiBaseUrl = 'https://my.jkkn.ac.in/api'

    // Generic API request function
    const makeApiRequest = async <T>(endpoint: string): Promise<T> => {
      console.log(`Making request to: ${apiBaseUrl}${endpoint}`)
      
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${myjkknApiKey}`,
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
      console.log(`Response from ${endpoint}:`, { dataCount: Array.isArray(data.data) ? data.data.length : 'N/A' })
      return data
    }

    // Parse request body
    const { action, entities } = await req.json()
    const results: any = {}

    console.log(`Starting sync with action: ${action}, entities: ${entities}`)

    // Fetch institutions if requested
    if (!entities || entities.includes('institutions')) {
      console.log('Fetching institutions...')
      try {
        // Use main API for institutions (matching user's working example)
        const institutionsResponse = await makeApiRequest<{data: any[], metadata?: any}>(
          '/api-management/organizations/institutions'
        );

        const institutions = institutionsResponse.data || []
        
        console.log(`Fetched ${institutions.length} institutions`)
        results.institutions = {
          fetched: institutions.length,
          data: institutions.map(inst => ({
            institution_id: inst.id,
            institution_name: inst.name,
            description: inst.counselling_code || inst.category || 'Institution',
            status: inst.is_active ? 'active' : 'inactive',
            created_at: inst.created_at,
            updated_at: inst.updated_at
          }))
        }

        // If action is 'sync', also update the institutions table
        if (action === 'sync') {
          const institutionsToSync = results.institutions.data

          console.log(`Syncing ${institutionsToSync.length} institutions to database...`)
          const { error: institutionsError } = await supabase
            .from('institutions')
            .upsert(institutionsToSync, { 
              onConflict: 'institution_id',
              ignoreDuplicates: false 
            })

          if (institutionsError) {
            console.error('Error syncing institutions:', institutionsError)
            results.institutions.syncError = institutionsError.message
          } else {
            results.institutions.synced = institutionsToSync.length
            console.log(`Successfully synced ${institutionsToSync.length} institutions`)
          }
        }
      } catch (error) {
        console.error('Error fetching institutions:', error)
        results.institutions = { error: error instanceof Error ? error.message : String(error) }
      }
    }

    // Fetch departments if requested
    if (!entities || entities.includes('departments')) {
      console.log('Fetching departments...')
      try {
        let allDepartments: any[] = []
        let currentPage = 1
        let totalPages = 1

        do {
          const response = await makeApiRequest<{data: any[], metadata?: any}>(
            `/api-management/organizations/departments?page=${currentPage}`
          )

          if (response.data && Array.isArray(response.data)) {
            allDepartments = [...allDepartments, ...response.data]
          }

          if (response.metadata) {
            totalPages = response.metadata.totalPages || response.metadata.total_pages || 1
          } else {
            break
          }

          currentPage++
        } while (currentPage <= totalPages)

        // Filter active departments
        const activeDepartments = allDepartments.filter(dept => 
          dept.is_active === true || dept.is_active === 1 || dept.is_active === '1'
        )

        console.log(`Fetched ${allDepartments.length} departments, ${activeDepartments.length} active`)
        
        const transformedDepartments = activeDepartments.map(dept => {
          let departmentName = 'Unknown Department'
          if (typeof dept.department_name === 'string') {
            departmentName = dept.department_name
          } else if (dept.department_name && typeof dept.department_name === 'object') {
            departmentName = dept.department_name.value || dept.department_name.text || dept.department_name.name || 'Unknown Department'
          }

          return {
            department_id: dept.id,
            department_name: departmentName,
            description: dept.department_code || departmentName,
            institution_id: dept.institution_id,
            degree_id: dept.degree_id, // Include degree_id from API
            status: 'active',
            created_at: dept.created_at,
            updated_at: dept.updated_at
          }
        })

        results.departments = {
          fetched: allDepartments.length,
          active: activeDepartments.length,
          data: transformedDepartments
        }

        // If action is 'sync', also update the departments table
        if (action === 'sync') {
          console.log(`Syncing ${transformedDepartments.length} departments to database...`)
          const { error: departmentsError } = await supabase
            .from('departments')
            .upsert(transformedDepartments, { 
              onConflict: 'department_id',
              ignoreDuplicates: false 
            })

          if (departmentsError) {
            console.error('Error syncing departments:', departmentsError)
            results.departments.syncError = departmentsError.message
          } else {
            results.departments.synced = transformedDepartments.length
            console.log(`Successfully synced ${transformedDepartments.length} departments`)
          }
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
        results.departments = { error: error instanceof Error ? error.message : String(error) }
      }
    }

    // Fetch staff if requested
    if (!entities || entities.includes('staff')) {
      console.log('Fetching staff...')
      try {
        const staffResponse = await makeApiRequest<{data: any[]}>('/api-management/staff?limit=1000')
        const staff = staffResponse.data || []
        
        console.log(`Fetched ${staff.length} staff members`)
        results.staff = {
          fetched: staff.length,
          data: staff.map(s => ({
            id: s.id,
            staff_id: s.id,
            name: s.first_name + (s.last_name ? ` ${s.last_name}` : ''),
            email: s.email,
            department: s.department?.department_name || 'Unknown Department',
            designation: s.designation || 'Staff',
            status: s.status || 'active',
            mobile: s.mobile,
            avatar_url: s.staff_photo_url
          }))
        }

        // If action is 'sync', also update the staff table
        if (action === 'sync') {
          const staffToSync = results.staff.data.map((s: any) => ({
            staff_id: s.staff_id,
            name: s.name,
            email: s.email,
            department: s.department,
            designation: s.designation,
            status: s.status,
            mobile: s.mobile,
            avatar_url: s.avatar_url,
            synced_at: new Date().toISOString()
          }))

          console.log(`Syncing ${staffToSync.length} staff to database...`)
          const { error: staffError } = await supabase
            .from('staff')
            .upsert(staffToSync, { 
              onConflict: 'staff_id',
              ignoreDuplicates: false 
            })

          if (staffError) {
            console.error('Error syncing staff:', staffError)
            results.staff.syncError = staffError.message
          } else {
            results.staff.synced = staffToSync.length
            console.log(`Successfully synced ${staffToSync.length} staff members`)
          }
        }
      } catch (error) {
        console.error('Error fetching staff:', error)
        results.staff = { error: error instanceof Error ? error.message : String(error) }
      }
    }

    // Fetch students if requested
    if (!entities || entities.includes('students')) {
      console.log('Fetching students...')
      try {
        console.log('Starting to fetch students with pagination...')
        console.log('=== STUDENTS API PAGINATION FETCH ===')
        
        let allStudents: any[] = []
        let currentPage = 1
        let totalPages = 1

        // Fetch all pages of students using the same approach as the working fetchStudents function
        do {
          console.log(`Fetching students page ${currentPage}...`)
          
          const response = await makeApiRequest<{data: any[], metadata?: any}>(
            `/api-management/students?page=${currentPage}&limit=1000`
          )

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

        // Filter for active students only using the same logic as fetchStudents
        const activeStudents = allStudents.filter(student => {
          const isActive = student.status === 'active' || student.status === 'Active' || student.status === 1 || student.status === '1'
          return isActive
        })

        console.log(`Filtered to ${activeStudents.length} active students out of ${allStudents.length} total`)

        // Transform API response to match our expected format - using the same mapping as fetchStudents
        const transformedStudents = activeStudents.map(student => ({
          id: student.id,
          student_id: student.id,
          roll_no: student.roll_number,
          name: student.first_name + (student.last_name ? ` ${student.last_name}` : ''),
          email: student.student_email,
          program: student.program?.program_name || 'Unknown Program',
          semester_year: 1, // Default since not available in API
          status: 'active',
          department: student.department?.department_name,
          avatar_url: student.student_photo_url || undefined,
          gpa: undefined,
          mobile: student.mobile || undefined,
          synced_at: new Date().toISOString()
        }))

        results.students = {
          fetched: allStudents.length,
          active: activeStudents.length,
          data: transformedStudents
        }

        // If action is 'sync', also update the students table
        if (action === 'sync') {
          console.log(`Syncing ${transformedStudents.length} students to database...`)
          const { error: studentsError } = await supabase
            .from('students')
            .upsert(transformedStudents, { 
              onConflict: 'student_id',
              ignoreDuplicates: false 
            })

          if (studentsError) {
            console.error('Error syncing students:', studentsError)
            results.students.syncError = studentsError.message
          } else {
            results.students.synced = transformedStudents.length
            console.log(`Successfully synced ${transformedStudents.length} students`)
          }
        }

        console.log(`🎉 Successfully processed ${transformedStudents.length} students`)
      } catch (error) {
        console.error('Error fetching students:', error)
        results.students = { error: `Failed to fetch students: ${error instanceof Error ? error.message : String(error)}` }
      }
    }
    console.log('Sync completed successfully:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${action} for ${entities || 'all entities'}`,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in sync function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})