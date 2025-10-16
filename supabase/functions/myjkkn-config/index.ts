// Supabase Edge Function: myjkkn-config
// Returns public configuration required by the frontend (safe values only)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const appId = Deno.env.get("MYJKKN_APP_ID") ?? "";
  const parentAppUrl = Deno.env.get("MYJKKN_BASE_URL") ?? "https://www.jkkn.ai";

  return new Response(JSON.stringify({ appId, parentAppUrl }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});