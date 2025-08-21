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

    // Try different endpoints for students
    const possibleEndpoints = [
      'https://my.jkkn.ac.in/api/api-management/students?limit=1000',
      'https://my.jkkn.ac.in/api/api-management/organizations/students?limit=1000',
      'https://my.jkkn.ac.in/api/api-management/student?limit=1000',
      'https://my.jkkn.ac.in/api/students?limit=1000'
    ]

    let studentsData: MyjkknStudent[] = []
    let workingEndpoint = ''

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.data && Array.isArray(data.data)) {
            studentsData = data.data
            workingEndpoint = endpoint
            console.log(`✅ Successfully fetched ${studentsData.length} students from ${endpoint}`)
            break
          }
        } else {
          console.log(`❌ Endpoint failed with status ${response.status}: ${endpoint}`)
        }
      } catch (error) {
        console.log(`❌ Error with endpoint ${endpoint}:`, error)
      }
    }

    if (studentsData.length === 0) {
      throw new Error('No students found from any API endpoint')
    }

    // Transform and sync students to database
    const transformedStudents = studentsData
      .filter(student => {
        // Filter for active students
        const isActive = student.status === 'active' || student.status === 'Active' || 
                         student.status === 1 || student.status === '1'
        return isActive && student.id
      })
      .map(student => ({
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
      endpoint_used: workingEndpoint,
      students_fetched: studentsData.length,
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