-- Fix function search path for check_admin_credentials
ALTER FUNCTION public.check_admin_credentials(text, text) 
SET search_path = public;