-- Fix infinite recursion in user_profiles RLS policies
-- The issue is likely in the get_current_user_role() function or policies calling themselves

-- First, let's recreate the get_current_user_role function to be more secure
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$;

-- Check if there are any problematic policies and recreate them to avoid recursion
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Only admins can update user profiles" ON public.user_profiles;

-- Recreate admin policies without using get_current_user_role to avoid recursion
CREATE POLICY "Admins can view all user profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Only admins can update user profiles" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.user_id = auth.uid() 
    AND up.role IN ('admin', 'super_admin')
  )
);