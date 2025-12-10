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
    const { message, matchedProducts } = await req.json();
    // Gemini API key - hardcoded for reliable deployment
    const GEMINI_API_KEY = "AIzaSyAehIpr_xshjrQnhOIAcMyZIsp49CUaNm0";

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured in environment');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      
      // Fallback response when API fails (temporary workaround)
      let fallbackReply = "I'm having trouble connecting to the AI right now, but I'm here to help! Our sustainable products include eco-friendly alternatives in clothing, home goods, and more. Would you like recommendations for a specific category?";
      
      // If user asked a simple greeting
      if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        fallbackReply = "Hello! Welcome to EcoMart! I'm ShopBuddy, your sustainability assistant. How can I help you find eco-friendly products today? 🌱";
      }
      
      // If product matches exist, mention them
      if (matchedProducts && matchedProducts.length > 0) {
        fallbackReply = `Great! I found ${matchedProducts.length} matching products from your receipt. ${matchedProducts.map(p => p.name).join(', ')} are available. Would you like eco-friendly alternatives for any of these?`;
      }
      
      console.log('Using fallback response due to API error');
      return new Response(
        JSON.stringify({ 
          success: true,
          reply: fallbackReply,
          note: 'Using fallback response - API temporarily unavailable'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = JSON.parse(responseText);
    console.log('Parsed Gemini response:', JSON.stringify(data, null, 2));
    
    // Check for error in response
    if (data.error) {
      console.error('Gemini API returned error:', data.error);
      
      // Fallback response
      const fallbackReply = "I'm temporarily unavailable, but I'm here to help with sustainable shopping! Ask me about eco-friendly products or try scanning a receipt. 🌿";
      console.log('Using fallback response due to API error');
      return new Response(
        JSON.stringify({ 
          success: true,
          reply: fallbackReply,
          note: 'Using fallback response - API error'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      
      // Fallback response
      const fallbackReply = "I'm working on your request! Feel free to ask me about sustainable products or share what you're looking for. 🌍";
      console.log('Using fallback response due to unexpected structure');
      return new Response(
        JSON.stringify({ 
          success: true,
          reply: fallbackReply,
          note: 'Using fallback response - invalid response structure'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    
    // Fallback response for any error
    const fallbackReply = "I'm here to help you find eco-friendly products! Try asking about sustainable items or our product categories. 💚";
    
    return new Response(
      JSON.stringify({ 
        success: true,
        reply: fallbackReply,
        note: 'Using fallback response - error encountered'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
