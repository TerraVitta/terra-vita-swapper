// This file runs in Supabase's Deno edge runtime. To avoid workspace TypeScript errors
// we mark it as not type-checked here so editor/CI tooling won't flag Deno globals.
// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGIN') || '').split(',').map(s => s.trim()).filter(Boolean);
const FUNCTION_SECRET = Deno.env.get('FUNCTION_SECRET');

function buildCorsHeaders(origin: string | null = '*') {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-function-secret',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');

  if (ALLOWED_ORIGINS.length > 0 && origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ success: false, error: 'Origin not allowed' }), { status: 403, headers: { ...buildCorsHeaders('*'), 'Content-Type': 'application/json' } });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: buildCorsHeaders(origin ?? '*') });
  }

  try {
    const incomingSecret = req.headers.get('x-function-secret') || null;
    if (FUNCTION_SECRET && (!incomingSecret || incomingSecret !== FUNCTION_SECRET)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } });
    }

    const { username, password } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseClient.rpc('check_admin_credentials', {
      username_input: username,
      password_input: password
    });

    if (error) {
      console.error('Admin check error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        isAdmin: data 
      }),
      { headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in admin-login function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } 
      }
    );
  }
});