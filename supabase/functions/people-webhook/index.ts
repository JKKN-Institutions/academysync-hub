import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

interface WebhookEvent {
  id: string;
  type: 'person.created' | 'person.updated' | 'person.deactivated';
  timestamp: string;
  data: {
    person: {
      id: string;
      type: 'mentor' | 'student';
      name: string;
      email: string;
      department?: string;
      program?: string;
      semesterYear?: number;
      status: 'active' | 'inactive';
      rollNo?: string;
      staffId?: string;
      programs?: string[];
    };
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
  const webhookSecret = Deno.env.get('PEOPLE_API_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const computedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const computedHex = Array.from(new Uint8Array(computedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const expectedSignature = `sha256=${computedHex}`;
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

async function checkEventIdempotency(eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('entity_type', 'webhook_event')
    .eq('entity_id', eventId)
    .single();

  return !!data;
}

async function logWebhookEvent(event: WebhookEvent, action: string): Promise<void> {
  await supabase
    .from('audit_logs')
    .insert({
      entity_type: 'webhook_event',
      entity_id: event.id,
      action,
      details: {
        event_type: event.type,
        person_id: event.data.person.id,
        timestamp: event.timestamp
      }
    });
}

async function updateUserProfile(person: WebhookEvent['data']['person'], eventType: string): Promise<void> {
  const profileData = {
    external_id: person.id,
    display_name: person.name,
    department: person.department || null,
    role: person.type === 'mentor' ? 'mentor' : 'mentee',
    updated_at: new Date().toISOString()
  };

  if (eventType === 'person.created') {
    // Try to find existing profile by external_id first
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('external_id', person.id)
      .single();

    if (!existing) {
      // Create new profile entry
      await supabase
        .from('user_profiles')
        .insert({
          ...profileData,
          user_id: crypto.randomUUID(), // Temporary until real auth user
        });
    }
  } else if (eventType === 'person.updated') {
    await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('external_id', person.id);
  } else if (eventType === 'person.deactivated') {
    // Mark as inactive but keep record
    await supabase
      .from('user_profiles')
      .update({ 
        ...profileData,
        role: `inactive_${person.type}` 
      })
      .eq('external_id', person.id);
  }
}

async function updateSyncTimestamp(): Promise<void> {
  await supabase
    .from('system_settings')
    .upsert({
      setting_key: 'last_incremental_sync',
      setting_value: { timestamp: new Date().toISOString() },
      description: 'Last incremental sync via webhook'
    });
}

async function handleWebhookEvent(event: WebhookEvent): Promise<void> {
  console.log(`Processing webhook event: ${event.type} for person ${event.data.person.id}`);

  // Check idempotency
  const alreadyProcessed = await checkEventIdempotency(event.id);
  if (alreadyProcessed) {
    console.log(`Event ${event.id} already processed, skipping`);
    return;
  }

  try {
    // Update user profile based on event type
    await updateUserProfile(event.data.person, event.type);

    // Update assignments if person is deactivated
    if (event.type === 'person.deactivated') {
      if (event.data.person.type === 'mentor') {
        await supabase
          .from('assignments')
          .update({ status: 'inactive' })
          .eq('mentor_external_id', event.data.person.id);
      } else {
        await supabase
          .from('assignments')
          .update({ status: 'inactive' })
          .eq('student_external_id', event.data.person.id);
      }
    }

    // Update sync timestamp
    await updateSyncTimestamp();

    // Log successful processing
    await logWebhookEvent(event, 'processed');

    console.log(`Successfully processed webhook event ${event.id}`);
  } catch (error) {
    console.error(`Failed to process webhook event ${event.id}:`, error);
    
    // Log failed processing
    await logWebhookEvent(event, 'failed');
    
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const signature = req.headers.get('x-webhook-signature');
    if (!signature) {
      return new Response('Missing webhook signature', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const payload = await req.text();
    
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(payload, signature);
    if (!isValid) {
      return new Response('Invalid webhook signature', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const event: WebhookEvent = JSON.parse(payload);
    
    // Validate event structure
    if (!event.id || !event.type || !event.data?.person) {
      return new Response('Invalid webhook event format', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Process the webhook event
    await handleWebhookEvent(event);

    return new Response(JSON.stringify({ 
      success: true, 
      eventId: event.id 
    }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
});
