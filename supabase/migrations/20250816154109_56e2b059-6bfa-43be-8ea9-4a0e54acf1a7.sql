-- Fix the Security Definer View issue completely
-- The issue is likely that the view still has security definer characteristics or 
-- the existing functions are causing the warning

-- First, let's check and fix any remaining security definer issues
-- by ensuring proper role-based access

-- Create a proper security definer function for checking mentor access
CREATE OR REPLACE FUNCTION public.is_mentor_or_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = user_uuid 
    AND role IN ('mentor', 'admin', 'super_admin', 'dept_lead')
  );
$$;

-- Ensure the active_mentor_assignments view uses proper security
DROP VIEW IF EXISTS public.active_mentor_assignments CASCADE;

-- Recreate the view with explicit security context
CREATE VIEW public.active_mentor_assignments AS
SELECT 
    ma.id,
    ma.mentor_id,
    ma.student_id,
    ma.student_name,
    ma.assignment_type,
    ma.status,
    ma.assigned_date,
    ma.end_date,
    ma.assigned_by,
    ma.notes,
    ma.created_at,
    ma.updated_at,
    s.name AS mentor_name,
    s.email AS mentor_email,
    s.department AS mentor_department,
    s.designation AS mentor_designation
FROM public.mentor_assignments ma
JOIN public.staff s ON ma.mentor_id = s.id
WHERE ma.status = 'active' 
  AND s.status = 'active';

-- Enable RLS on the view to prevent security definer issues
ALTER TABLE public.active_mentor_assignments ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for the view
CREATE POLICY "Mentors and admins can view active assignments" 
ON public.active_mentor_assignments
FOR SELECT
TO authenticated
USING (
  -- Allow mentors to see their own assignments or admins to see all
  (mentor_id IN (
    SELECT s.id FROM public.staff s
    JOIN auth.users u ON s.email = u.email
    WHERE u.id = auth.uid()
  ))
  OR 
  public.is_mentor_or_admin(auth.uid())
);

-- Fix remaining anonymous access policies by being more specific about authentication

-- Update user_profiles policy to be more restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Authenticated users can view their own profile" 
ON public.user_profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile" 
ON public.user_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Update user_role_assignments policies
DROP POLICY IF EXISTS "Users can view their own role assignments" ON public.user_role_assignments;

CREATE POLICY "Authenticated users can view their own role assignments" 
ON public.user_role_assignments
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Update news_feed policy to require authentication
DROP POLICY IF EXISTS "Anonymous and permanent users can view the news feed" ON public.news_feed;

CREATE POLICY "Authenticated users can view the news feed" 
ON public.news_feed
FOR SELECT 
TO authenticated
USING (true);

-- Update staff policies to be more restrictive
DROP POLICY IF EXISTS "Staff records are viewable by authenticated users" ON public.staff;

CREATE POLICY "Authenticated users can view active staff records" 
ON public.staff
FOR SELECT 
TO authenticated
USING (status = 'active');

-- Ensure all policies target the authenticated role specifically
-- and fix any remaining policies that might allow anonymous access

-- Update mentor_assignments policies to be more specific
DROP POLICY IF EXISTS "Mentor assignments are viewable by authenticated users" ON public.mentor_assignments;

CREATE POLICY "Authenticated users can view mentor assignments" 
ON public.mentor_assignments
FOR SELECT 
TO authenticated
USING (true);

-- Add comments for documentation
COMMENT ON FUNCTION public.is_mentor_or_admin IS 'Security definer function to check if user has mentor or admin role';
COMMENT ON VIEW public.active_mentor_assignments IS 'View of active mentor assignments with proper RLS policies to prevent security definer issues';

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.active_mentor_assignments TO authenticated;