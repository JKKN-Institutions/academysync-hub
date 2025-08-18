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

      console.log('Fetching staff data from external API...');
      
      // Fetch staff from external API
      const staffResponse = await fetch('https://myadmin.jkkn.ac.in/api/api-management/staff', {
        headers: {
          'Authorization': `Bearer ${myjkknApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!staffResponse.ok) {
        throw new Error(`Failed to fetch staff: ${staffResponse.statusText}`);
      }

      const staffData = await staffResponse.json();
      const staffList = staffData.data || [];

      console.log(`Found ${staffList.length} staff members to process`);

      // Process each staff member
      for (const staff of staffList) {
        try {
          usersProcessed++;
          
          if (!staff.email) {
            errors.push({
              staff_id: staff.staff_id,
              error: 'No email address provided'
            });
            continue;
          }

          console.log(`Processing staff: ${staff.name} (${staff.email})`);

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

          const existingAuthUser = existingAuthUsers.users.find(u => u.email === staff.email);
          let authUserId = existingAuthUser?.id;

          // Create auth user if doesn't exist
          if (!existingAuthUser) {
            console.log(`Creating new auth user for: ${staff.email}`);
            
            const { data: newAuthUser, error: createAuthError } = await supabaseClient.auth.admin.createUser({
              email: staff.email,
              password: 'TempPassword123!',
              email_confirm: true,
              user_metadata: {
                display_name: staff.name,
                staff_id: staff.staff_id
              }
            });

            if (createAuthError) {
              console.error('Error creating auth user:', createAuthError);
              errors.push({
                staff_id: staff.staff_id,
                email: staff.email,
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
          const designation = (staff.designation || '').toLowerCase();
          
          if (designation.includes('professor') || designation.includes('faculty') || designation.includes('lecturer')) {
            role = 'mentor';
          } else if (designation.includes('admin') || designation.includes('director') || designation.includes('principal')) {
            role = 'admin';
          } else if (designation.includes('head') || designation.includes('lead')) {
            role = 'dept_lead';
          }

          // Insert or update user profile
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
            console.error('Error upserting user profile:', profileError);
            errors.push({
              staff_id: staff.staff_id,
              email: staff.email,
              error: `Profile upsert failed: ${profileError.message}`
            });
            continue;
          }

          // Insert staff record into our staff table if not exists
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
            // Don't add to errors as this is not critical
          }

          if (existingAuthUser) {
            usersUpdated++;
          }

          console.log(`Successfully processed: ${staff.name}`);

        } catch (staffError) {
          console.error(`Error processing staff ${staff.staff_id}:`, staffError);
          errors.push({
            staff_id: staff.staff_id,
            email: staff.email,
            error: staffError.message
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