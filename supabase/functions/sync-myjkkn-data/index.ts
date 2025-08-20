import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
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

    const apiBaseUrl = 'https://myadmin.jkkn.ac.in/api'

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
        // Try mobile API first for institutions
        const mobileApiUrl = 'https://m.jkkn.ac.in/api'
        console.log(`Making request to: ${mobileApiUrl}/api-management/organizations/institutions`)
        
        const response = await fetch(`${mobileApiUrl}/api-management/organizations/institutions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${myjkknApiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Mobile API Error ${response.status}:`, errorText)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const institutionsResponse = await response.json()
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
        results.institutions = { error: error.message }
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
        results.departments = { error: error.message }
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
          const staffToSync = results.staff.data.map(s => ({
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
        results.staff = { error: error.message }
      }
    }

    // Fetch students if requested
    if (!entities || entities.includes('students')) {
      console.log('Fetching students...')
      try {
        let allStudents: any[] = []
        let currentPage = 1
        let totalPages = 1
        let attempts = 0
        const maxAttempts = 3

        do {
          attempts++
          console.log(`Fetching students page ${currentPage}, attempt ${attempts}...`)
          
          try {
            // Try different endpoint parameters to avoid 500 errors
            let endpoint = `/api-management/students?page=${currentPage}&limit=100`
            
            // For first attempt, try smaller limit
            if (attempts === 1 && currentPage === 1) {
              endpoint = `/api-management/students?page=1&limit=50`
            }
            
            const response = await makeApiRequest<{data: any[], metadata?: any}>(endpoint)

            console.log(`Students API response for page ${currentPage}:`, {
              hasData: !!response.data,
              dataLength: response.data?.length || 0,
              metadata: response.metadata
            })

            if (response.data && Array.isArray(response.data)) {
              allStudents = [...allStudents, ...response.data]
              attempts = 0 // Reset attempts on success
            }

            if (response.metadata) {
              totalPages = response.metadata.totalPages || response.metadata.total_pages || 1
              console.log(`Page ${currentPage} of ${totalPages}, total students so far: ${allStudents.length}`)
            } else {
              console.log('No metadata found, assuming single page')
              break
            }

            currentPage++
          } catch (pageError) {
            console.error(`Error fetching students page ${currentPage}, attempt ${attempts}:`, pageError.message)
            
            if (attempts >= maxAttempts) {
              // If we've tried multiple times and still failing, try alternative approaches
              if (currentPage === 1) {
                // For the first page, try without pagination
                console.log('Trying to fetch students without pagination...')
                try {
                  const simpleResponse = await makeApiRequest<{data: any[]}>(`/api-management/students`)
                  if (simpleResponse.data && Array.isArray(simpleResponse.data)) {
                    allStudents = simpleResponse.data
                    console.log(`Fetched ${allStudents.length} students without pagination`)
                    break
                  }
                } catch (simpleError) {
                  console.error('Simple fetch also failed:', simpleError.message)
                  throw new Error(`Students API is experiencing issues: ${pageError.message}. Please try again later or contact the API administrator.`)
                }
              } else {
                // If we've already got some data, break the loop
                console.log(`Got partial data (${allStudents.length} students), stopping due to API errors`)
                break
              }
            } else {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
            }
          }
        } while (currentPage <= totalPages && attempts < maxAttempts)

        if (allStudents.length === 0) {
          throw new Error('No student data could be retrieved from the API. The API may be experiencing technical difficulties.')
        }

        // Filter active students
        const activeStudents = allStudents.filter(student => {
          // Be more flexible with status checking
          const status = student.status || student.is_active
          return status === 'active' || status === 'Active' || status === 1 || status === '1' || status === true
        })

        console.log(`Fetched ${allStudents.length} students, ${activeStudents.length} active`)
        
        const transformedStudents = activeStudents.map(s => {
          // Handle different possible field names from the API
          const firstName = s.first_name || s.student_name || s.name || ''
          const lastName = s.last_name || ''
          const fullName = firstName + (lastName ? ` ${lastName}` : '')
          
          return {
            id: s.id,
            student_id: s.id,
            roll_no: s.roll_number || s.rollNo || s.roll_no || '',
            name: fullName || 'Unknown Student',
            email: s.student_email || s.email || '',
            program: s.program?.program_name || s.program_name || 'Unknown Program',
            semester_year: s.semester_year || s.semesterYear || 1,
            status: 'active',
            department: s.department?.department_name || s.department_name || 'Unknown Department',
            avatar_url: s.student_photo_url || s.avatar_url || s.photo_url,
            mobile: s.mobile || s.phone || s.student_mobile,
            gpa: s.gpa || s.cgpa
          }
        })

        results.students = {
          fetched: allStudents.length,
          active: activeStudents.length,
          data: transformedStudents
        }

        // If action is 'sync', also update the students table
        if (action === 'sync') {
          const studentsToSync = transformedStudents.map(s => ({
            student_id: s.student_id,
            roll_no: s.roll_no,
            name: s.name,
            email: s.email,
            program: s.program,
            semester_year: s.semester_year,
            status: s.status,
            department: s.department,
            avatar_url: s.avatar_url,
            mobile: s.mobile,
            gpa: s.gpa,
            synced_at: new Date().toISOString()
          }))

          console.log(`Syncing ${studentsToSync.length} students to database...`)
          const { error: studentsError } = await supabase
            .from('students')
            .upsert(studentsToSync, { 
              onConflict: 'student_id',
              ignoreDuplicates: false 
            })

          if (studentsError) {
            console.error('Error syncing students:', studentsError)
            results.students.syncError = studentsError.message
          } else {
            results.students.synced = studentsToSync.length
            console.log(`Successfully synced ${studentsToSync.length} students`)
          }

          // Extract and sync unique programs
          const programs = new Set<string>()
          transformedStudents.forEach(student => {
            if (student.program && student.program !== 'Unknown Program') {
              programs.add(student.program)
            }
          })

          const programsToSync = Array.from(programs).map(programName => ({
            program_name: programName,
            status: 'active'
          }))

          if (programsToSync.length > 0) {
            console.log(`Syncing ${programsToSync.length} programs to database...`)
            const { error: programsError } = await supabase
              .from('programs')
              .upsert(programsToSync, { 
                onConflict: 'program_name',
                ignoreDuplicates: false 
              })

            if (programsError) {
              console.error('Error syncing programs:', programsError)
              results.programs = { syncError: programsError.message }
            } else {
              results.programs = { synced: programsToSync.length }
              console.log(`Successfully synced ${programsToSync.length} programs`)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        results.students = { 
          error: `Students API Error: ${error.message}. This appears to be a server-side issue with the MyJKKN API. Please try again later.`,
          fetched: 0,
          active: 0
        }
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
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})