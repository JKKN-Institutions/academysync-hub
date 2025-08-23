-- First fix existing NULL created_by values and then set constraints

-- Update existing sessions with NULL created_by to a default admin user or the first available user
-- First, let's check if there are any super_admin users to use as default
UPDATE public.counseling_sessions 
SET created_by = (
  SELECT user_id 
  FROM user_profiles 
  WHERE role IN ('admin', 'super_admin') 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE created_by IS NULL;

-- If no admin users exist, we'll set it to the first available user
UPDATE public.counseling_sessions 
SET created_by = (
  SELECT user_id 
  FROM user_profiles 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE created_by IS NULL;

-- Now set the column constraints
ALTER TABLE public.counseling_sessions 
ALTER COLUMN created_by SET DEFAULT auth.uid(),
ALTER COLUMN created_by SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create sessions in their department" ON public.counseling_sessions;
DROP POLICY IF EXISTS "Users can view sessions in their department" ON public.counseling_sessions;
DROP POLICY IF EXISTS "Session creators and admins can update sessions" ON public.counseling_sessions;
DROP POLICY IF EXISTS "Session creators and admins can delete sessions" ON public.counseling_sessions;

-- Create new RLS policies for institution-based access

-- Policy for inserting sessions - Super admins and authenticated users can create sessions
CREATE POLICY "Users can create sessions" 
ON public.counseling_sessions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND created_by = auth.uid()
);

-- Policy for viewing sessions - Super admins see all, others see institution-specific
CREATE POLICY "Institution-based view access for sessions" 
ON public.counseling_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND (
      -- Super admins can see all sessions
      up.role IN ('admin', 'super_admin')
      OR
      -- Other users can only see sessions from their institution
      (
        up.institution = (
          SELECT up2.institution 
          FROM user_profiles up2 
          WHERE up2.user_id = counseling_sessions.created_by
        )
      )
    )
  )
);

-- Policy for updating sessions - Super admins and session creators can update
CREATE POLICY "Session creators and super admins can update sessions" 
ON public.counseling_sessions 
FOR UPDATE 
USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Policy for deleting sessions - Super admins and session creators can delete
CREATE POLICY "Session creators and super admins can delete sessions" 
ON public.counseling_sessions 
FOR DELETE 
USING (
  created_by = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Update the can_access_session function to properly handle institution-based access
CREATE OR REPLACE FUNCTION public.can_access_session(session_creator_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH current_user_info AS (
    SELECT department, institution, role
    FROM user_profiles 
    WHERE user_id = auth.uid()
  ),
  session_creator_info AS (
    SELECT department, institution
    FROM user_profiles 
    WHERE user_id = session_creator_id
  )
  SELECT 
    CASE 
      -- Super admin can access all sessions
      WHEN current_user_info.role IN ('admin', 'super_admin') THEN true
      -- Same institution (not just department)
      WHEN current_user_info.institution = session_creator_info.institution THEN true
      ELSE false
    END
  FROM current_user_info, session_creator_info;
$function$;