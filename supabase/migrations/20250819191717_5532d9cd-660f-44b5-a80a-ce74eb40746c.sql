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

-- 3. Create a secure view for mentor assignments that only shows non-sensitive information
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

-- Grant select permission on the directory view to authenticated users
GRANT SELECT ON public.staff_directory TO authenticated;