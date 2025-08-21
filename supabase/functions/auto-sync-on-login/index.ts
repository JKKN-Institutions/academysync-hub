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

    // Get MyJKKN API key
    const apiKey = Deno.env.get('MYJKKN_API_KEY')
    if (!apiKey) {
      throw new Error('MyJKKN API key not configured')
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

    // Sync Students
    console.log('Syncing students...')
    let allStudents: MyjkknStudent[] = []
    let currentPage = 1
    let totalPages = 1

    do {
      const response = await makeApiRequest<{data: MyjkknStudent[], metadata?: any}>(
        `/api-management/students?page=${currentPage}&limit=1000`
      )

      if (response.data && Array.isArray(response.data)) {
        allStudents = [...allStudents, ...response.data]
      }

      if (response.metadata) {
        totalPages = response.metadata.totalPages || response.metadata.total_pages || 1
      } else {
        break
      }

      currentPage++
    } while (currentPage <= totalPages)

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

    // Upsert students
    const { error: studentError, count: studentCount } = await supabase
      .from('students')
      .upsert(transformedStudents, { 
        onConflict: 'student_id',
        count: 'exact'
      })

    if (studentError) {
      console.error('Student sync error:', studentError)
    }

    // Sync Staff
    console.log('Syncing staff...')
    let allStaff: MyjkknStaff[] = []
    currentPage = 1
    totalPages = 1

    do {
      const response = await makeApiRequest<{data: MyjkknStaff[], metadata?: any}>(
        `/api-management/staff?page=${currentPage}&limit=1000`
      )

      if (response.data && Array.isArray(response.data)) {
        allStaff = [...allStaff, ...response.data]
      }

      if (response.metadata) {
        totalPages = response.metadata.totalPages || response.metadata.total_pages || 1
      } else {
        break
      }

      currentPage++
    } while (currentPage <= totalPages)

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
    const { error: staffError, count: staffCount } = await supabase
      .from('staff')
      .upsert(transformedStaff, { 
        onConflict: 'staff_id',
        count: 'exact'
      })

    if (staffError) {
      console.error('Staff sync error:', staffError)
    }

    const syncResult = {
      success: true,
      students_synced: studentCount || 0,
      staff_synced: staffCount || 0,
      timestamp: new Date().toISOString(),
      errors: [
        ...(studentError ? [`Student sync: ${studentError.message}`] : []),
        ...(staffError ? [`Staff sync: ${staffError.message}`] : [])
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