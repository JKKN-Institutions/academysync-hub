-- Fix infinite recursion in user_profiles RLS policies
-- The issue is that policies are trying to query user_profiles table within the policy itself

-- First, drop the problematic policies that are causing infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any user profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "System can insert user profiles" ON public.user_profiles;

-- Create a security definer function to get current user role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS TEXT 
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$;

-- Create safe RLS policies that don't cause recursion
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id OR 
  public.get_current_user_role_safe() IN ('admin', 'super_admin')
);

CREATE POLICY "Admins can update any profile" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (public.get_current_user_role_safe() IN ('admin', 'super_admin'));

CREATE POLICY "System can insert profiles" 
ON public.user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Service role full access" 
ON public.user_profiles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);