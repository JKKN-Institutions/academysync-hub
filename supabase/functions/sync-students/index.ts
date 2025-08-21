import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
  institution?: {
    name?: string
  }
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

    // Get MyJKKN API key
    const apiKey = Deno.env.get('MYJKKN_API_KEY')
    if (!apiKey) {
      throw new Error('MyJKKN API key not configured')
    }

    console.log('Starting automatic student sync from MyJKKN API...')

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
      console.log(`Response from ${endpoint}:`, { dataCount: Array.isArray(data.data) ? data.data.length : 'N/A' })
      return data
    }

    console.log('Starting to fetch students with pagination...')
    console.log('=== STUDENTS API PAGINATION FETCH ===')
    
    let allStudents: MyjkknStudent[] = []
    let currentPage = 1
    let totalPages = 1

    // Fetch all pages of students using pagination
    do {
      console.log(`Fetching students page ${currentPage}...`)
      
      const response = await makeApiRequest<{data: MyjkknStudent[], metadata?: any}>(
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

    if (allStudents.length === 0) {
      throw new Error('No students found from API')
    }

    // Filter for active students only
    const activeStudents = allStudents.filter(student => {
      const isActive = student.status === 'active' || student.status === 'Active' || 
                       student.status === 1 || student.status === '1'
      return isActive && student.id
    })

    console.log(`Filtered to ${activeStudents.length} active students out of ${allStudents.length} total`)

    // Transform and sync students to database
    const transformedStudents = activeStudents.map(student => ({
      student_id: student.student_id || student.id,
      roll_no: student.roll_number || null,
      name: `${student.first_name}${student.last_name ? ` ${student.last_name}` : ''}`,
      email: student.student_email || null,
      program: student.program?.program_name || null,
      department: student.department?.department_name || null,
      semester_year: student.semester_year || null,
      gpa: student.gpa || null,
      mobile: student.mobile || null,
      status: 'active',
      synced_at: new Date().toISOString()
    }))

    console.log(`Prepared ${transformedStudents.length} students for database sync`)

    // Upsert students to database
    const { error: upsertError, count } = await supabase
      .from('students')
      .upsert(transformedStudents, { 
        onConflict: 'student_id',
        count: 'exact'
      })

    if (upsertError) {
      console.error('Database upsert error:', upsertError)
      throw upsertError
    }

    const syncResult = {
      success: true,
      students_fetched: allStudents.length,
      active_students: activeStudents.length,
      students_synced: count || 0,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Student sync completed:', syncResult)

    return new Response(
      JSON.stringify(syncResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Student sync failed:', error)
    
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