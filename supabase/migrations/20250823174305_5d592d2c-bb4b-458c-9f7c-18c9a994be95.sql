-- Fix the INSERT policy to properly handle Super Admin access without institution requirement

DROP POLICY IF EXISTS "Super admins and institution users can create sessions" ON counseling_sessions;

-- Create new INSERT policy that allows Super Admins regardless of institution
CREATE POLICY "Super admins and institution users can create sessions" 
ON counseling_sessions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Super Admin can create sessions for anyone (regardless of institution)
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
    OR
    -- Regular users must have a profile (institution check removed for now)
    EXISTS (
      SELECT 1 
      FROM user_profiles up1
      WHERE up1.user_id = auth.uid()
      AND up1.role IS NOT NULL
    )
  )
);