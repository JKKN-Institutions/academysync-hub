-- Fix critical security issue: Restrict audit logs access to administrators only
-- Currently any authenticated user can view all audit logs which exposes sensitive system data

-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;

-- Create a secure policy that only allows administrators to view audit logs
CREATE POLICY "Only administrators can view audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Keep the insert policy as is since the system needs to create audit entries
-- The existing "System can insert audit logs" policy is appropriate

-- Add a policy to allow admins to manage audit logs if needed
CREATE POLICY "Administrators can manage audit logs" 
ON public.audit_logs 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);