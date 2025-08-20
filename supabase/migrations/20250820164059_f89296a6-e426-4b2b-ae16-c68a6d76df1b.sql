-- Drop all existing policies for user_profiles first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;

-- Create new more flexible policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up2
    WHERE up2.user_id = auth.uid() 
    AND up2.role IN ('admin', 'super_admin')
  ) OR auth.uid() = user_id
);

CREATE POLICY "System can insert user profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any user profile" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up2
    WHERE up2.user_id = auth.uid() 
    AND up2.role IN ('admin', 'super_admin')
  )
);

-- Create an admin user function that can be called safely
CREATE OR REPLACE FUNCTION public.make_user_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user by email in auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  -- Update their role to admin
  UPDATE user_profiles 
  SET role = 'admin' 
  WHERE user_id = target_user_id;
  
  -- Create profile if it doesn't exist
  INSERT INTO user_profiles (user_id, display_name, role)
  VALUES (target_user_id, target_email, 'admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin';
  
  RETURN TRUE;
END;
$$;

-- Create a function to set user roles easily
CREATE OR REPLACE FUNCTION public.set_user_role(target_email text, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the user by email in auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  -- Update their role
  UPDATE user_profiles 
  SET role = new_role 
  WHERE user_id = target_user_id;
  
  -- Create profile if it doesn't exist
  INSERT INTO user_profiles (user_id, display_name, role)
  VALUES (target_user_id, target_email, new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = new_role;
  
  RETURN TRUE;
END;
$$;

-- Make the first user (ceo@jkkn.ac.in) an admin
SELECT public.make_user_admin('ceo@jkkn.ac.in');

-- Also make some key users different roles for testing
SELECT public.make_user_admin('vijaythiyagarajan.j@jkkn.ac.in');

-- Set some users to different roles for testing
SELECT public.set_user_role('aishwarya@jkkn.ac.in', 'mentor');
SELECT public.set_user_role('kavinkumarv@jkkn.ac.in', 'dept_lead');