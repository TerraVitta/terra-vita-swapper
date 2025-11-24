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
      { headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } }
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
        headers: { ...buildCorsHeaders(origin ?? '*'), 'Content-Type': 'application/json' } 
      }
    );
  }
});