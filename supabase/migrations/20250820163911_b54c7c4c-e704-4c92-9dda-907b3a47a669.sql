-- Fix RLS policies - work with actual tables, not views

-- Drop overly restrictive policies from user_analytics table (not the view)
DROP POLICY IF EXISTS "Admins can view all user analytics" ON public.user_analytics;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_analytics;

-- Create more permissive policy for user_analytics table
CREATE POLICY "Authenticated users can view user analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix user_profiles RLS policies to allow admins to view all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.user_profiles;

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

CREATE POLICY "System can insert profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile" 
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

-- Make the first user (ceo@jkkn.ac.in) an admin
SELECT public.make_user_admin('ceo@jkkn.ac.in');