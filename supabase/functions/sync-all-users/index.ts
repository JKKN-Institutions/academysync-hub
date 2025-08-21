import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Handle empty request body
    let requestBody = {};
    try {
      const body = await req.text();
      if (body.trim()) {
        requestBody = JSON.parse(body);
      }
    } catch (parseError) {
      console.log('Failed to parse request body, using defaults:', parseError);
    }

    const { action = 'sync_all', sync_students = true, sync_staff = true } = requestBody;

    console.log('Starting comprehensive user sync operation:', { action, sync_students, sync_staff });

    // Create sync log entry
    const { data: syncLogData, error: syncLogError } = await supabaseClient
      .from('user_sync_logs')
      .insert({
        sync_type: 'comprehensive_sync',
        sync_status: 'in_progress'
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('Error creating sync log:', syncLogError);
      throw syncLogError;
    }

    const syncLogId = syncLogData.id;
    let usersProcessed = 0;
    let usersCreated = 0;
    let usersUpdated = 0;
    let errors: any[] = [];

    try {
      const myjkknApiKey = Deno.env.get('MYJKKN_API_KEY');
      if (!myjkknApiKey) {
        throw new Error('MYJKKN_API_KEY not configured');
      }

      const baseHeaders = {
        'Authorization': `Bearer ${myjkknApiKey}`,
        'Content-Type': 'application/json'
      };

      // Sync Staff if requested
      if (sync_staff) {
        console.log('=== SYNCING STAFF ===');
        
        const staffResponse = await fetch('https://my.jkkn.ac.in/api/api-management/staff', {
          headers: baseHeaders
        });

        if (!staffResponse.ok) {
          throw new Error(`Failed to fetch staff: ${staffResponse.statusText}`);
        }

        const staffData = await staffResponse.json();
        const staffList = staffData.data || [];
        console.log(`Found ${staffList.length} staff members to process`);

        for (const staff of staffList) {
          try {
            usersProcessed++;
            
            if (!staff.email) {
              errors.push({
                type: 'staff',
                external_id: staff.staff_id,
                error: 'No email address provided'
              });
              continue;
            }

            console.log(`Processing staff: ${staff.name} (${staff.email})`);

            // Check if user exists in auth
            const { data: existingAuthUsers, error: authCheckError } = await supabaseClient.auth.admin.listUsers();
            
            if (authCheckError) {
              console.error('Error checking auth users:', authCheckError);
              errors.push({
                type: 'staff',
                external_id: staff.staff_id,
                error: `Auth check failed: ${authCheckError.message}`
              });
              continue;
            }

            const existingAuthUser = existingAuthUsers.users.find(u => u.email === staff.email);
            let authUserId = existingAuthUser?.id;

            // Create auth user if doesn't exist
            if (!existingAuthUser) {
              console.log(`Creating new auth user for staff: ${staff.email}`);
              
              const { data: newAuthUser, error: createAuthError } = await supabaseClient.auth.admin.createUser({
                email: staff.email,
                password: 'TempPassword123!',
                email_confirm: true,
                user_metadata: {
                  display_name: staff.name,
                  staff_id: staff.staff_id,
                  user_type: 'staff'
                }
              });

              if (createAuthError) {
                console.error('Error creating auth user:', createAuthError);
                errors.push({
                  type: 'staff',
                  external_id: staff.staff_id,
                  email: staff.email,
                  error: `Auth user creation failed: ${createAuthError.message}`
                });
                continue;
              }

              authUserId = newAuthUser.user.id;
              usersCreated++;
            }

            // Determine role based on designation
            let role = 'mentee';
            const designation = (staff.designation || '').toLowerCase();
            
            if (designation.includes('professor') || designation.includes('faculty') || designation.includes('lecturer')) {
              role = 'mentor';
            } else if (designation.includes('admin') || designation.includes('director') || designation.includes('principal')) {
              role = 'admin';
            } else if (designation.includes('head') || designation.includes('lead')) {
              role = 'dept_lead';
            }

            // Upsert user profile
            const { error: profileError } = await supabaseClient
              .from('user_profiles')
              .upsert({
                user_id: authUserId,
                display_name: staff.name,
                department: staff.department,
                external_id: staff.staff_id,
                role: role,
                institution: 'JKKN College of Arts and Science',
                mobile: staff.mobile,
                is_synced_from_staff: true,
                staff_id: staff.staff_id,
                designation: staff.designation
              }, {
                onConflict: 'user_id'
              });

            if (profileError) {
              console.error('Error upserting staff profile:', profileError);
              errors.push({
                type: 'staff',
                external_id: staff.staff_id,
                email: staff.email,
                error: `Profile upsert failed: ${profileError.message}`
              });
              continue;
            }

            // Upsert staff record
            const { error: staffInsertError } = await supabaseClient
              .from('staff')
              .upsert({
                staff_id: staff.staff_id,
                name: staff.name,
                email: staff.email,
                department: staff.department,
                designation: staff.designation,
                mobile: staff.mobile,
                status: staff.is_active ? 'active' : 'inactive'
              }, {
                onConflict: 'staff_id'
              });

            if (staffInsertError) {
              console.error('Error inserting staff record:', staffInsertError);
            }

            if (existingAuthUser) {
              usersUpdated++;
            }

          } catch (staffError) {
            console.error(`Error processing staff ${staff.staff_id}:`, staffError);
            errors.push({
              type: 'staff',
              external_id: staff.staff_id,
              error: staffError.message
            });
          }
        }
      }

      // Sync Students if requested
      if (sync_students) {
        console.log('=== SYNCING STUDENTS ===');
        
        let allStudents: any[] = [];
        let currentPage = 1;
        let totalPages = 1;

        // Fetch all pages of students
        do {
          console.log(`Fetching students page ${currentPage}...`);
          
          const studentsResponse = await fetch(`https://my.jkkn.ac.in/api/api-management/students?page=${currentPage}&limit=1000`, {
            headers: baseHeaders
          });

          if (!studentsResponse.ok) {
            throw new Error(`Failed to fetch students page ${currentPage}: ${studentsResponse.statusText}`);
          }

          const studentsData = await studentsResponse.json();
          
          if (studentsData.data && Array.isArray(studentsData.data)) {
            allStudents = [...allStudents, ...studentsData.data];
          }

          if (studentsData.metadata) {
            totalPages = studentsData.metadata.totalPages || studentsData.metadata.total_pages || 1;
          } else {
            break;
          }

          currentPage++;
        } while (currentPage <= totalPages);

        console.log(`Found ${allStudents.length} total students from ${totalPages} pages`);

        // Filter for active students only
        const activeStudents = allStudents.filter(student => {
          const isActive = student.status === 'active' || student.status === 'Active' || student.status === 1 || student.status === '1';
          return isActive;
        });

        console.log(`Processing ${activeStudents.length} active students`);

        for (const student of activeStudents) {
          try {
            usersProcessed++;
            
            if (!student.student_email) {
              errors.push({
                type: 'student',
                external_id: student.id,
                error: 'No email address provided'
              });
              continue;
            }

            console.log(`Processing student: ${student.first_name} ${student.last_name || ''} (${student.student_email})`);

            // Check if user exists in auth
            const { data: existingAuthUsers, error: authCheckError } = await supabaseClient.auth.admin.listUsers();
            
            if (authCheckError) {
              console.error('Error checking auth users:', authCheckError);
              errors.push({
                type: 'student',
                external_id: student.id,
                error: `Auth check failed: ${authCheckError.message}`
              });
              continue;
            }

            const existingAuthUser = existingAuthUsers.users.find(u => u.email === student.student_email);
            let authUserId = existingAuthUser?.id;

            // Create auth user if doesn't exist
            if (!existingAuthUser) {
              console.log(`Creating new auth user for student: ${student.student_email}`);
              
              const { data: newAuthUser, error: createAuthError } = await supabaseClient.auth.admin.createUser({
                email: student.student_email,
                password: 'TempPassword123!',
                email_confirm: true,
                user_metadata: {
                  display_name: `${student.first_name} ${student.last_name || ''}`.trim(),
                  student_id: student.id,
                  user_type: 'student'
                }
              });

              if (createAuthError) {
                console.error('Error creating auth user:', createAuthError);
                errors.push({
                  type: 'student',
                  external_id: student.id,
                  email: student.student_email,
                  error: `Auth user creation failed: ${createAuthError.message}`
                });
                continue;
              }

              authUserId = newAuthUser.user.id;
              usersCreated++;
            }

            // Upsert user profile for student
            const { error: profileError } = await supabaseClient
              .from('user_profiles')
              .upsert({
                user_id: authUserId,
                display_name: `${student.first_name} ${student.last_name || ''}`.trim(),
                department: student.department?.department_name,
                external_id: student.id,
                role: 'mentee',
                institution: 'JKKN College of Arts and Science',
                mobile: student.mobile_number,
                is_synced_from_staff: false
              }, {
                onConflict: 'user_id'
              });

            if (profileError) {
              console.error('Error upserting student profile:', profileError);
              errors.push({
                type: 'student',
                external_id: student.id,
                email: student.student_email,
                error: `Profile upsert failed: ${profileError.message}`
              });
              continue;
            }

            // Upsert student record
            const { error: studentInsertError } = await supabaseClient
              .from('students')
              .upsert({
                student_id: student.id,
                roll_no: student.roll_number,
                name: `${student.first_name} ${student.last_name || ''}`.trim(),
                email: student.student_email,
                program: student.program?.program_name || 'Unknown Program',
                semester_year: 1,
                department: student.department?.department_name,
                status: 'active',
                avatar_url: student.student_photo_url,
                mobile: student.mobile_number
              }, {
                onConflict: 'student_id'
              });

            if (studentInsertError) {
              console.error('Error inserting student record:', studentInsertError);
            }

            if (existingAuthUser) {
              usersUpdated++;
            }

          } catch (studentError) {
            console.error(`Error processing student ${student.id}:`, studentError);
            errors.push({
              type: 'student',
              external_id: student.id,
              error: studentError.message
            });
          }
        }
      }

      // Update sync log with results
      const { error: updateLogError } = await supabaseClient
        .from('user_sync_logs')
        .update({
          users_processed: usersProcessed,
          users_created: usersCreated,
          users_updated: usersUpdated,
          errors: JSON.stringify(errors),
          sync_status: errors.length > 0 ? 'completed_with_errors' : 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', syncLogId);

      if (updateLogError) {
        console.error('Error updating sync log:', updateLogError);
      }

      const result = {
        sync_log_id: syncLogId,
        users_processed: usersProcessed,
        users_created: usersCreated,
        users_updated: usersUpdated,
        errors: errors,
        success: true,
        stats: {
          staff_synced: sync_staff,
          students_synced: sync_students,
          total_errors: errors.length
        }
      };

      console.log('Comprehensive sync operation completed:', result);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (syncError) {
      console.error('Sync operation failed:', syncError);
      
      // Update sync log with failure
      await supabaseClient
        .from('user_sync_logs')
        .update({
          users_processed: usersProcessed,
          users_created: usersCreated,
          users_updated: usersUpdated,
          errors: JSON.stringify([...errors, { error: syncError.message }]),
          sync_status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', syncLogId);

      throw syncError;
    }

  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})