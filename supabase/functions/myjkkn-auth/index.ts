// Supabase Edge Function: myjkkn-auth
// Exchanges OAuth codes and refresh tokens with MyJKKN securely using server-side API key

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = Deno.env.get("MYJKKN_BASE_URL") ?? "https://my.jkkn.ac.in";
    const appId = Deno.env.get("MYJKKN_APP_ID") ?? "";
    const apiKey = Deno.env.get("MYJKKN_API_KEY") ?? "";

    if (!appId || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Server missing configuration: appId or apiKey" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { grant_type, code, refresh_token, redirect_uri } = await req.json();

    const payload: Record<string, unknown> = { grant_type, child_app_id: appId };
    if (grant_type === "authorization_code") {
      payload.code = code;
      payload.redirect_uri = redirect_uri;
    } else if (grant_type === "refresh_token") {
      payload.refresh_token = refresh_token;
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported grant_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const upstream = await fetch(`${baseUrl}/api/auth/child-app/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { error_description: text }; }

    return new Response(JSON.stringify(data), {
      status: upstream.ok ? 200 : upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});