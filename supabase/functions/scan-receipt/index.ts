import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OCR API key from environment
    const OCR_API_KEY = Deno.env.get('OCR_SPACE_API_KEY');
    if (!OCR_API_KEY) {
      console.error('OCR_SPACE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OCR service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing OCR request...');

    // Call OCR.space API
    const formData = new FormData();
    formData.append('apikey', OCR_API_KEY);
    formData.append('base64Image', imageBase64);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const ocrResult = await ocrResponse.json();
    console.log('OCR result:', JSON.stringify(ocrResult));

    if (!ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to extract text from image',
          details: ocrResult.ErrorMessage || 'Unknown error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedText = ocrResult.ParsedResults[0].ParsedText || '';
    console.log('Extracted text:', extractedText);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active products from database
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('id, name, brand, price, currency, image_url, sustainability_score')
      .eq('is_active', true);

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch products' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple product matching - check if product name appears in the text
    const matchedProducts = products?.filter(product => {
      const searchTerms = [
        product.name.toLowerCase(),
        product.brand?.toLowerCase() || '',
      ].filter(Boolean);
      
      const lowerText = extractedText.toLowerCase();
      return searchTerms.some(term => lowerText.includes(term));
    }) || [];

    console.log(`Found ${matchedProducts.length} matching products`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedText,
        matchedProducts,
        totalMatches: matchedProducts.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scan-receipt function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
