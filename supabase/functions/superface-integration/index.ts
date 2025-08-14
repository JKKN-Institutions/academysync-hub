import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, sessionId, data } = await req.json()
    
    if (!action || !sessionId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          message: 'action and sessionId are required'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Superface API key from environment
    const superfaceApiKey = Deno.env.get('SUPERFACE_API_KEY')
    
    if (!superfaceApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Superface API key not configured',
          message: 'Please add the SUPERFACE_API_KEY secret in your Supabase project settings.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let superfaceResponse;

    switch (action) {
      case 'mark_completed':
        // Call Superface API to mark session as completed
        superfaceResponse = await fetch('https://api.superface.ai/v1/sessions/complete', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${superfaceApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId,
            completed_at: new Date().toISOString(),
            completion_data: data
          })
        });
        break;

      case 'sync_feedback':
        // Sync feedback data to Superface
        superfaceResponse = await fetch('https://api.superface.ai/v1/feedback/sync', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${superfaceApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId,
            feedback_data: data
          })
        });
        break;

      default:
        return new Response(
          JSON.stringify({ 
            error: 'Invalid action',
            message: `Action '${action}' is not supported`
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    if (!superfaceResponse.ok) {
      const errorData = await superfaceResponse.text();
      console.error('Superface API error:', errorData);
      
      return new Response(
        JSON.stringify({ 
          error: 'Superface API error',
          message: 'Failed to process request with Superface',
          details: errorData
        }),
        { 
          status: superfaceResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await superfaceResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true,
        data: result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in superface-integration function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to process Superface integration'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})