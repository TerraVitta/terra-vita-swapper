// This file runs in Supabase's Deno edge runtime. To avoid workspace TypeScript errors
// we mark it as not type-checked here so editor/CI tooling won't flag Deno globals.
// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

// CORS and security setup - prefer setting ALLOWED_ORIGIN (comma-separated) and FUNCTION_SECRET in the function environment
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

  // If allowed origins list is configured, require the incoming origin to be in it
  if (ALLOWED_ORIGINS.length > 0 && origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ success: false, error: 'Origin not allowed' }), { status: 403, headers: { ...buildCorsHeaders('*'), 'Content-Type': 'application/json' } });
  }

  if (req.method === 'OPTIONS') {
    // echo back the origin for proper preflight handling
    return new Response(null, { headers: buildCorsHeaders(origin ?? '*') });
  }

  try {
    // Require a function secret header for sensitive operations
    const incomingSecret = req.headers.get('x-function-secret') || null;
    if (FUNCTION_SECRET && (!incomingSecret || incomingSecret !== FUNCTION_SECRET)) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } });
    }

    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'No image provided' }),
         { status: 400, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
      );
    }

    // Use environment variable for OCR API key
    const OCR_API_KEY = Deno.env.get('OCR_SPACE_API_KEY');
    if (!OCR_API_KEY) {
      console.error('OCR_SPACE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OCR API key not configured' }),
         { status: 500, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling OCR.space API...');
    
    // Call OCR.space API
    const formData = new FormData();
    formData.append('apikey', OCR_API_KEY);
    formData.append('base64Image', imageBase64);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const ocrResult = await ocrResponse.json();
    console.log('OCR Result:', JSON.stringify(ocrResult, null, 2));

    if (!ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No text found in image',
          details: ocrResult 
        }),
         { status: 400, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
      );
    }

    const extractedText = ocrResult.ParsedResults[0].ParsedText;
    console.log('Extracted text:', extractedText);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // Service role key may be required for searching across the DB, but it must not be committed to the repository.
    // Ensure the environment contains SUPABASE_SERVICE_ROLE_KEY in production and that the function is secured.
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('*');

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
         { status: 500, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
      );
    }

    // Match products from OCR text
    const matchedProducts = products?.filter(product => {
      const productName = product.name.toLowerCase();
      const textLower = extractedText.toLowerCase();
      // Simple matching - check if product name appears in the text
      return textLower.includes(productName) || 
             productName.split(' ').some((word: string) => word.length > 3 && textLower.includes(word));
    }) || [];

    console.log(`Found ${matchedProducts.length} matching products`);

    return new Response(
      JSON.stringify({ 
        success: true,
        extractedText,
        matchedProducts,
        totalMatches: matchedProducts.length
      }),
       { headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scan-receipt function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
       { status: 500, headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
    );
  }
});
