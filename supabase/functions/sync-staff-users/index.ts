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

    const { action = 'sync_all' } = await req.json();

    console.log('Starting user sync operation:', action);

    // Create sync log entry
    const { data: syncLogData, error: syncLogError } = await supabaseClient
      .from('user_sync_logs')
      .insert({
        sync_type: 'staff_to_users',
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
      // Fetch staff data from external API
      const myjkknApiKey = Deno.env.get('MYJKKN_API_KEY');
      if (!myjkknApiKey) {
        throw new Error('MYJKKN_API_KEY not configured');
      }

      console.log('Fetching staff data from external API with pagination...');
      console.log('=== STAFF API PAGINATION FETCH ===');
      
      let allStaff: any[] = [];
      let currentPage = 1;
      let totalPages = 1;

      // Try multiple possible endpoints for staff
      const possibleEndpoints = [
        `/api-management/staff?limit=1000`,
        `/api-management/organizations/staff?limit=1000`,
        `/staff?limit=1000`,
        `/api-management/staff`
      ];

      let staffResponse: any = null;
      let workingEndpoint: string = '';

      // Try each endpoint until we find one that works
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying staff endpoint: ${endpoint}`);
          const response = await fetch(`https://www.jkkn.ai/api${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${myjkknApiKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.log(`❌ Endpoint ${endpoint} failed with status ${response.status}`);
            continue;
          }

          staffResponse = await response.json();
          workingEndpoint = endpoint;
          console.log(`✅ Endpoint ${endpoint} worked!`);
          break;
        } catch (error) {
          console.log(`❌ Endpoint ${endpoint} failed:`, error);
          continue;
        }
      }

      if (!staffResponse) {
        throw new Error('All staff API endpoints failed. Please check API configuration.');
      }

      // Now fetch all pages using the working endpoint
      do {
        console.log(`Fetching staff page ${currentPage} from ${workingEndpoint}...`);
        
        if (currentPage > 1) {
          // Add pagination parameters for subsequent pages
          const separator = workingEndpoint.includes('?') ? '&' : '?';
          const paginatedEndpoint = `${workingEndpoint}${separator}page=${currentPage}`;
          
          const response = await fetch(`https://www.jkkn.ai/api${paginatedEndpoint}`, {
            headers: {
              'Authorization': `Bearer ${myjkknApiKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.error(`Failed to fetch page ${currentPage}: ${response.statusText}`);
            break;
          }

          staffResponse = await response.json();
        }

        console.log(`Page ${currentPage} response:`, {
          staffCount: staffResponse.data?.length || 0,
          metadata: staffResponse.metadata
        });

        // Add this page's staff to our collection
        if (staffResponse.data && Array.isArray(staffResponse.data)) {
          allStaff = [...allStaff, ...staffResponse.data];
        }

        // Update pagination info
        if (staffResponse.metadata) {
          totalPages = staffResponse.metadata.totalPages || staffResponse.metadata.total_pages || 1;
          console.log(`Pagination info: page ${currentPage} of ${totalPages}, total staff so far: ${allStaff.length}`);
        } else {
          console.log('No metadata found, assuming single page');
          break;
        }

        currentPage++;
      } while (currentPage <= totalPages);

      console.log(`✅ Successfully fetched all ${allStaff.length} staff from ${totalPages} pages`);

      const staffList = allStaff;
      console.log(`Found ${staffList.length} staff members to process`);

      // Process each staff member
      for (const staff of staffList) {
        try {
          usersProcessed++;
          
          // Extract email from various possible field names
          const email = staff.email || staff.staff_email || staff.employee_email;
          
          if (!email) {
            errors.push({
              staff_id: staff.staff_id || staff.id,
              error: 'No email address provided'
            });
            continue;
          }

          // Extract name from various possible field combinations
          let staffName = 'Unknown Staff';
          if (staff.name) {
            staffName = staff.name;
          } else if (staff.staff_name) {
            staffName = staff.staff_name;
          } else if (staff.full_name) {
            staffName = staff.full_name;
          } else if (staff.first_name || staff.last_name) {
            const firstName = staff.first_name || '';
            const lastName = staff.last_name || '';
            staffName = `${firstName} ${lastName}`.trim();
          }

          console.log(`Processing staff: ${staffName} (${email})`);

          // Check if user already exists in auth.users
          const { data: existingAuthUsers, error: authCheckError } = await supabaseClient.auth.admin.listUsers();
          
          if (authCheckError) {
            console.error('Error checking auth users:', authCheckError);
            errors.push({
              staff_id: staff.staff_id,
              error: `Auth check failed: ${authCheckError.message}`
            });
            continue;
          }

          const existingAuthUser = existingAuthUsers.users.find(u => u.email === email);
          let authUserId = existingAuthUser?.id;

          // Create auth user if doesn't exist
          if (!existingAuthUser) {
            console.log(`Creating new auth user for: ${email}`);
            
            const { data: newAuthUser, error: createAuthError } = await supabaseClient.auth.admin.createUser({
              email: email,
              password: 'TempPassword123!',
              email_confirm: true,
              user_metadata: {
                display_name: staffName,
                staff_id: staff.staff_id || staff.id
              }
            });

            if (createAuthError) {
              console.error('Error creating auth user:', createAuthError);
              errors.push({
                staff_id: staff.staff_id || staff.id,
                email: email,
                error: `Auth user creation failed: ${createAuthError.message}`
              });
              continue;
            }

            authUserId = newAuthUser.user.id;
            usersCreated++;
            console.log(`Created auth user: ${authUserId}`);
          }

          // Determine role based on designation
          let role = 'mentee'; // default
          const designation = (staff.designation || staff.employee_designation || '').toLowerCase();
          
          if (designation.includes('professor') || designation.includes('faculty') || designation.includes('lecturer') || designation.includes('assistant')) {
            role = 'mentor';
          } else if (designation.includes('admin') || designation.includes('director') || designation.includes('principal')) {
            role = 'admin';
          } else if (designation.includes('head') || designation.includes('lead') || designation.includes('hod')) {
            role = 'dept_lead';
          }

          // Extract department name
          const departmentName = staff.department?.department_name || staff.department || 'Unknown Department';

          // Insert or update user profile
          const { error: profileError } = await supabaseClient
            .from('user_profiles')
            .upsert({
              user_id: authUserId,
              display_name: staffName,
              department: departmentName,
              external_id: staff.staff_id || staff.id,
              role: role,
              institution: staff.institution?.institution_name || staff.institution || 'JKKN Institution',
              mobile: staff.mobile || staff.phone,
              is_synced_from_staff: true,
              staff_id: staff.staff_id || staff.id,
              designation: staff.designation || staff.employee_designation,
              email: email
            }, {
              onConflict: 'user_id'
            });

          if (profileError) {
            console.error('Error upserting user profile:', profileError);
            errors.push({
              staff_id: staff.staff_id || staff.id,
              email: email,
              error: `Profile upsert failed: ${profileError.message}`
            });
            continue;
          }

          // Insert staff record into our staff table if not exists
          const { error: staffInsertError } = await supabaseClient
            .from('staff')
            .upsert({
              staff_id: staff.staff_id || staff.id,
              name: staffName,
              email: email,
              department: departmentName,
              designation: staff.designation || staff.employee_designation,
              mobile: staff.mobile || staff.phone,
              status: (staff.is_active === true || staff.is_active === 1 || staff.is_active === '1') ? 'active' : 'inactive'
            }, {
              onConflict: 'staff_id'
            });

          if (staffInsertError) {
            console.error('Error inserting staff record:', staffInsertError);
            // Don't add to errors as this is not critical
          }

          if (existingAuthUser) {
            usersUpdated++;
          }

          console.log(`Successfully processed: ${staffName}`);

        } catch (staffError) {
          console.error(`Error processing staff ${staff.staff_id || staff.id}:`, staffError);
          errors.push({
            staff_id: staff.staff_id || staff.id,
            email: staff.email || staff.staff_email,
            error: staffError instanceof Error ? staffError.message : String(staffError)
          });
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
        success: true
      };

      console.log('Sync operation completed:', result);

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
          errors: JSON.stringify([...errors, { error: syncError instanceof Error ? syncError.message : String(syncError) }]),
          sync_status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', syncLogId);

      throw syncError;
    }

  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})