-- Fix User Activity Logs Security Vulnerability
-- This addresses the issue where user behavior data could be exploited for surveillance

-- 1. First, ensure all existing logs have a user_id (clean up orphaned logs)
DELETE FROM public.user_activity_logs WHERE user_id IS NULL;

-- 2. Make user_id NOT NULL to prevent future orphaned logs
ALTER TABLE public.user_activity_logs 
  ALTER COLUMN user_id SET NOT NULL;

-- 3. Strengthen RLS policies to be more explicit and secure
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity" ON public.user_activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_logs;

-- 4. Create more restrictive policies

-- Only allow admins and super_admins to view all activity logs
CREATE POLICY "Admins can view all user activity logs"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])
  )
);

-- Users can only view their own activity logs
CREATE POLICY "Users can view their own activity logs only"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only authenticated users can insert activity logs for themselves
CREATE POLICY "System can insert user activity logs"
ON public.user_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- 5. Add a trigger to ensure user_id is always set on insert
CREATE OR REPLACE FUNCTION public.ensure_user_activity_log_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If no user_id is provided, use the current authenticated user
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  
  -- Ensure the user_id matches the current authenticated user (prevent impersonation)
  IF NEW.user_id != auth.uid() AND auth.uid() IS NOT NULL THEN
    -- Only allow service role to insert for other users
    IF NOT (auth.jwt() ->> 'role' = 'service_role') THEN
      RAISE EXCEPTION 'Cannot log activity for another user';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce user_id validation
CREATE TRIGGER ensure_user_activity_log_user_id_trigger
  BEFORE INSERT ON public.user_activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_activity_log_user_id();