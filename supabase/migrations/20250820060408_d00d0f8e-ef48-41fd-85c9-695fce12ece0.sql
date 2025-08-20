-- Fix infinite recursion in user_profiles RLS policies completely
-- Drop all existing policies that are causing recursion
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Only admins can update user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile details" ON public.user_profiles;
DROP POLICY IF EXISTS "System can insert user profiles" ON public.user_profiles;

-- Create simple, non-recursive policies
-- Allow users to view their own profile (no recursion)
CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own profile (no recursion)
CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow system to insert user profiles
CREATE POLICY "System can insert profiles" 
ON public.user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Simple admin policy without recursion - use service role for admin operations
CREATE POLICY "Service role can manage all profiles" 
ON public.user_profiles 
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);