# Terra Vitta Swapper — Dev notes

This project contains a small frontend and a set of Supabase serverless functions (edge functions) used for OCR scanning, chat assistant, and sustainability checks.

Important security notes and required environment variables for safe deployment:

- SUPABASE_URL - your Supabase project URL
- SUPABASE_SERVICE_ROLE_KEY - **server-side only** service role key (must not be committed to the repo)
- OCR_SPACE_API_KEY - API key for OCR.space service
- GEMINI_API_KEY - API key for Google Generative Language (Gemini)
- FUNCTION_SECRET - a secret string that edge functions expect in the `x-function-secret` header to prevent public abuse
- ALLOWED_ORIGIN - optional comma separated list of allowed origins for CORS (recommended)

Frontend environment variables (prefixed with VITE_):

- VITE_SUPABASE_URL - public supabase URL used by the client
- VITE_SUPABASE_PUBLISHABLE_KEY - optionally used by the client
- VITE_FUNCTION_SECRET - when present the client will send this to functions (note: client-exposed secrets are visible — prefer authenticated calls or server-side usage for sensitive functions)

Security recommendations:

- Rotate any keys accidentally checked into source control and remove them from the repository history.
- Do not use the service role key in publicly exposed logic unless the function is protected and cannot be invoked by unauthenticated clients.
- Set `ALLOWED_ORIGIN` in your function environment to restrict CORS to your domain.
- Prefer authenticated server-side endpoints for admin actions.

If you'd like, I can help further by moving admin-only flows to an authenticated server endpoint or by wiring a secure signed upload flow for receipt images.

Deployment note for Vercel:
- This repo contains Supabase Deno edge functions under `supabase/functions/`. Vercel's build may attempt to process those files and fail because they are not Node-based server code.
- We added a `.vercelignore` to prevent Vercel from deploying or building the `supabase/functions` directory. Keep Supabase functions deployed via Supabase or a separate Deno-compatible runner.


