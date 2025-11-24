// This file runs in Supabase's Deno edge runtime. To avoid workspace TypeScript errors
// we mark it as not type-checked here so editor/CI tooling won't flag Deno globals.
// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

  // Origin enforcement when ALLOWED_ORIGINS is set
  if (ALLOWED_ORIGINS.length > 0 && origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ success: false, error: 'Origin not allowed' }), { status: 403, headers: { ...buildCorsHeaders('*'), 'Content-Type': 'application/json' } });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: buildCorsHeaders(origin ?? '*') });
  }

  try {
    const { message, matchedProducts } = await req.json();
    // Validate caller using function secret
    const incomingSecret = req.headers.get('x-function-secret') || null;
    if (FUNCTION_SECRET && (!incomingSecret || incomingSecret !== FUNCTION_SECRET)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } });
    }

    // API key must be set in the function environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = `You are ShopBuddy, a helpful shopping assistant for our UAE/India sustainable marketplace. 
Display all prices in AED (د.إ) format.

You help users with:
- Finding sustainable and eco-friendly products
- Explaining product sustainability scores
- Recommending eco alternatives
- Answering questions about green shopping
- Processing scanned receipts and matching products

Keep responses friendly, short (2-3 sentences max), and focused on helping users shop sustainably.`;

    // If we have matched products from a receipt scan, customize the prompt
    if (matchedProducts && matchedProducts.length > 0) {
      const productList = matchedProducts.map((p: any) => 
        `- ${p.name} by ${p.brand || 'N/A'} | AED ${p.price} د.إ | Eco-Score: ${p.sustainability_score}/100`
      ).join('\n');
      
      systemPrompt += `\n\nThe user scanned a receipt and we found these matching products in our store:\n${productList}\n\nHelp them understand what products we found and guide them to add items to cart. If some items weren't found, let them know politely.`;
    }

    console.log('Calling Gemini API with message:', message);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    console.log('Gemini API response status:', response.status);
    
    const responseText = await response.text();
    console.log('Gemini API raw response:', responseText);

    if (!response.ok) {
      console.error('Gemini API error:', responseText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Gemini API error: ${response.status}`,
          details: responseText
        }),
        { status: 500, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
      );
    }

    const data = JSON.parse(responseText);
    console.log('Parsed Gemini response:', JSON.stringify(data, null, 2));
    
    // Check for error in response
    if (data.error) {
      console.error('Gemini API returned error:', data.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error.message || 'Gemini API error' 
        }),
        { status: 500, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
      );
    }

    // Extract reply from response
    let reply = '';
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    } else if (data.candidates?.[0]?.output) {
      reply = data.candidates[0].output;
    } else {
      console.error('Unexpected response structure:', data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response structure from Gemini API',
          details: data
        }),
        { status: 500, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully extracted reply:', reply);

    return new Response(
      JSON.stringify({ success: true, reply }),
      { headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } 
      }
    );
  }
});
