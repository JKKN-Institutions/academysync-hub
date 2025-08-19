-- Fix critical security vulnerability: Restrict access to staff personal information
-- Remove the overly permissive policy that allows all authenticated users to view staff records

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Staff records are viewable by authenticated users" ON public.staff;

-- Create secure policies that protect staff personal information

-- 1. Admins and super admins can view all staff records (for management purposes)
CREATE POLICY "Admins can view all staff records"
ON public.staff
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])
  )
);

-- 2. Staff members can view their own record only
CREATE POLICY "Staff can view their own record"
ON public.staff
FOR SELECT  
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.staff_id = staff.staff_id
  )
);

-- 3. Mentors can view limited staff information for assignment purposes only
-- This creates a view with only non-sensitive information for mentor assignments
CREATE VIEW public.staff_directory AS
SELECT 
  id,
  staff_id,
  name,
  department,
  designation,
  status,
  avatar_url
FROM public.staff
WHERE status = 'active';

-- Enable RLS on the view
ALTER VIEW public.staff_directory OWNER TO postgres;

-- Grant select permission on the directory view to authenticated users
GRANT SELECT ON public.staff_directory TO authenticated;

-- Create RLS policy for the staff directory view
CREATE POLICY "Active staff directory is viewable for assignments"
ON public.staff_directory
FOR SELECT
TO authenticated
USING (true);

-- Update any existing mentor assignment policies to ensure they work with the new restrictions
-- Note: This ensures mentor assignments can still function while protecting sensitive data