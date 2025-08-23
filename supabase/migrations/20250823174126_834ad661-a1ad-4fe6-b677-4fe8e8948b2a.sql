-- Fix counseling session RLS policies to allow Super Admin full access

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create sessions" ON counseling_sessions;
DROP POLICY IF EXISTS "Institution-based view access for sessions" ON counseling_sessions;
DROP POLICY IF EXISTS "Session creators and super admins can update sessions" ON counseling_sessions;
DROP POLICY IF EXISTS "Session creators and super admins can delete sessions" ON counseling_sessions;

-- Create new comprehensive policies that properly handle Super Admin access

-- INSERT policy: Super Admins can create sessions for any institution, others restricted to their institution
CREATE POLICY "Super admins and institution users can create sessions" 
ON counseling_sessions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Super Admin can create sessions for anyone
    (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
    OR
    -- Regular users can only create sessions within their institution
    EXISTS (
      SELECT 1 
      FROM user_profiles up1
      WHERE up1.user_id = auth.uid()
      AND up1.institution IS NOT NULL
    )
  )
);

-- SELECT policy: Super Admins see all sessions, others see institution-based sessions
CREATE POLICY "Institution-based view access for sessions" 
ON counseling_sessions 
FOR SELECT 
USING (
  -- Super Admin can view all sessions
  (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
  OR
  -- Regular users can view sessions from their institution
  EXISTS (
    SELECT 1
    FROM user_profiles up1, user_profiles up2
    WHERE up1.user_id = auth.uid()
    AND up2.user_id = counseling_sessions.created_by
    AND up1.institution = up2.institution
    AND up1.institution IS NOT NULL
  )
);

-- UPDATE policy: Super Admins can update all sessions, creators can update their own
CREATE POLICY "Session creators and super admins can update sessions" 
ON counseling_sessions 
FOR UPDATE 
USING (
  created_by = auth.uid() 
  OR 
  (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
);

-- DELETE policy: Super Admins can delete all sessions, creators can delete their own
CREATE POLICY "Session creators and super admins can delete sessions" 
ON counseling_sessions 
FOR DELETE 
USING (
  created_by = auth.uid() 
  OR 
  (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
);