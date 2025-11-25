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
    const { imageData } = await req.json();
    const OCR_API_KEY = Deno.env.get('OCR_SPACE_API_KEY');

    if (!OCR_API_KEY) {
      throw new Error('OCR_SPACE_API_KEY not configured');
    }

    console.log('Starting OCR scan...');

    // Call OCR.space API
    const formData = new FormData();
    formData.append('base64Image', imageData);
    formData.append('apikey', OCR_API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    const ocrResult = await ocrResponse.json();
    console.log('OCR result:', ocrResult);

    if (ocrResult.IsErroredOnProcessing) {
      throw new Error(ocrResult.ErrorMessage?.[0] || 'OCR processing failed');
    }

    const extractedText = ocrResult.ParsedResults?.[0]?.ParsedText || '';
    console.log('Extracted text:', extractedText);

    // Parse items from extracted text (split by newlines and filter)
    const items = extractedText
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 2 && line.length < 100)
      .map((line: string) => ({ name: line }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        items,
        rawText: extractedText 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scan-cart function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});