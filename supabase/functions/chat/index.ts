import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are Ecomart's helpful shopping assistant. You help users with:
- Finding sustainable and eco-friendly products
- Explaining product sustainability scores
- Recommending eco alternatives
- Answering questions about green shopping
- Information about products available on Ecomart

Keep responses friendly, concise, and focused on helping users shop sustainably.`;

    console.log('Calling Gemini API with message:', message);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully extracted reply:', reply);

    return new Response(
      JSON.stringify({ success: true, reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});