-- Create admin credentials function for simple admin login
-- This is a simplified approach - in production, use proper RLS and role-based access

-- Insert a test admin user if not exists (password: admin)
-- This uses a hardcoded hash for 'admin' password
-- In production, use proper password hashing

-- Create a simple admin check function
CREATE OR REPLACE FUNCTION public.check_admin_credentials(
  username_input text,
  password_input text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple hardcoded admin check
  -- WARNING: This is for demo purposes only!
  RETURN username_input = 'admin' AND password_input = 'admin';
END;
$$;