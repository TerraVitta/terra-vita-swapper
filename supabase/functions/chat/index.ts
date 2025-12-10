import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const current = requestCounts.get(clientId);

  if (!current || now > current.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count < maxRequests) {
    current.count++;
    return true;
  }

  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, matchedProducts } = await req.json();
    
    // Get client identifier (IP or fallback)
    const clientId = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limit: 10 requests per 60 seconds per client
    if (!checkRateLimit(clientId, 10, 60000)) {
      console.warn('Rate limit exceeded for client:', clientId);
      return new Response(
        JSON.stringify({ 
          success: true,
          reply: "You're sending messages too quickly. Please wait a moment before trying again! 😊"
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gemini API key - hardcoded for reliable deployment
    const GEMINI_API_KEY = "AIzaSyDbME4-8Tjj3tODyQPbdCKDCGr00s6zsIM";

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured in environment');
      return new Response(
        JSON.stringify({ 
          success: true,
          reply: "I'm connecting to the store. Please try again in a moment!"
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optimized system prompt - much shorter to reduce token usage
    let systemPrompt = `You are ShopBuddy, a helpful eco-friendly shopping assistant. Keep responses to 2-3 sentences max. Help users find sustainable products and answer about eco-shopping.`;

    // If we have matched products from a receipt scan, customize the prompt
    if (matchedProducts && matchedProducts.length > 0) {
      const productList = matchedProducts.map((p: any) => `${p.name} (د.إ${p.price})`).join(', ');
      systemPrompt += `\n\nMatched products: ${productList}. Help user understand what was found.`;
    }

    console.log('Calling Gemini API with message:', message.substring(0, 100));

    // Use exponential backoff for retries with longer initial delays
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
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
                temperature: 0.7,
                maxOutputTokens: 150,
              },
            }),
          }
        );

        console.log('Gemini API response status:', response.status);
        
        const responseText = await response.text();
        console.log('Gemini API raw response:', responseText.substring(0, 200));

        if (response.ok) {
          const data = JSON.parse(responseText);
          
          if (data.error) {
            console.error('Gemini API returned error:', data.error.message);
            lastError = data.error.message;
            
            // If it's a quota error and not the last attempt, retry after delay
            if (data.error.message?.includes('quota') && attempt === 0) {
              console.log('Quota exceeded, retrying after delay...');
              await new Promise(res => setTimeout(res, 3000));
              continue;
            }
          } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const reply = data.candidates[0].content.parts[0].text;
            console.log('Successfully extracted reply');
            return new Response(
              JSON.stringify({ success: true, reply }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          console.error('Gemini API error:', response.status, responseText.substring(0, 200));
          lastError = `HTTP ${response.status}`;
          
          // If rate limited and not last attempt, wait and retry
          if (response.status === 429 && attempt === 0) {
            console.log('Rate limited, retrying after delay...');
            await new Promise(res => setTimeout(res, 5000));
            continue;
          }
        }
        
        break;
      } catch (error) {
        console.error('Request failed:', error.message);
        lastError = error.message;
        
        // If network error and not last attempt, retry
        if (attempt === 0) {
          console.log('Network error, retrying...');
          await new Promise(res => setTimeout(res, 2000));
          continue;
        }
      }
    }

    // All retries exhausted, use fallback
    console.log('All retries exhausted, using fallback. Last error:', lastError);
    
    const fallbackReplies = [
      "I'm here to help you find sustainable products! What category interests you? 🌱",
      "Tell me what you're looking for and I'll help you find eco-friendly options! 💚",
      "Great question! Our sustainable products range from clothing to home goods. What would you like to explore?",
      "I love your interest in eco-friendly shopping! Which product category interests you most?",
      "Welcome to EcoMart! I'm here to help you shop sustainably. What can I assist you with today?",
    ];
    
    const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    
    return new Response(
      JSON.stringify({ 
        success: true,
        reply: randomFallback,
        note: 'Using fallback response due to temporary API unavailability'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    
    const fallbackReply = "I'm here to help! Ask me about sustainable products or our eco-friendly alternatives. 🌍";
    
    return new Response(
      JSON.stringify({ 
        success: true,
        reply: fallbackReply,
        note: 'Using fallback response due to error'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
      
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
