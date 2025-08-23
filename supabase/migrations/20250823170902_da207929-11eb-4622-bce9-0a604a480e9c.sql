-- Drop existing overly permissive policies for counseling_sessions
DROP POLICY IF EXISTS "Authenticated users can view counseling sessions" ON public.counseling_sessions;
DROP POLICY IF EXISTS "Authenticated users can create counseling sessions" ON public.counseling_sessions;
DROP POLICY IF EXISTS "Authenticated users can update counseling sessions" ON public.counseling_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete counseling sessions" ON public.counseling_sessions;

-- Create function to get user's department and institution
CREATE OR REPLACE FUNCTION public.get_user_department_info()
RETURNS TABLE(department text, institution text) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    up.department,
    up.institution
  FROM user_profiles up 
  WHERE up.user_id = auth.uid();
$$;

-- Create function to check if user can access session based on department/institution
CREATE OR REPLACE FUNCTION public.can_access_session(session_creator_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
      -- Same department and institution
      WHEN current_user_info.department = session_creator_info.department 
           AND current_user_info.institution = session_creator_info.institution THEN true
      ELSE false
    END
  FROM current_user_info, session_creator_info;
$$;

-- Create new granular RLS policies for counseling_sessions

-- Policy for SELECT: Department-based access with different visibility levels
CREATE POLICY "Users can view sessions in their department" 
ON public.counseling_sessions 
FOR SELECT 
USING (
  can_access_session(created_by)
);

-- Policy for INSERT: Users can create sessions in their department
CREATE POLICY "Users can create sessions in their department" 
ON public.counseling_sessions 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid()
);

-- Policy for UPDATE: Only session creators and super admins can update
CREATE POLICY "Session creators and admins can update sessions" 
ON public.counseling_sessions 
FOR UPDATE 
USING (
  created_by = auth.uid() OR 
  (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
);

-- Policy for DELETE: Only session creators and super admins can delete
CREATE POLICY "Session creators and admins can delete sessions" 
ON public.counseling_sessions 
FOR DELETE 
USING (
  created_by = auth.uid() OR 
  (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
);

-- Update session_participants policies for department-based access
DROP POLICY IF EXISTS "Authenticated users can view session participants" ON public.session_participants;
DROP POLICY IF EXISTS "Authenticated users can manage session participants" ON public.session_participants;

-- Create function to check session participant access
CREATE OR REPLACE FUNCTION public.can_access_session_participants(session_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT can_access_session(cs.created_by)
  FROM counseling_sessions cs
  WHERE cs.id = session_uuid;
$$;

-- New policies for session_participants
CREATE POLICY "Users can view participants in accessible sessions" 
ON public.session_participants 
FOR SELECT 
USING (
  can_access_session_participants(session_id)
);

CREATE POLICY "Session creators can manage participants" 
ON public.session_participants 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM counseling_sessions cs 
    WHERE cs.id = session_participants.session_id 
    AND (
      cs.created_by = auth.uid() OR 
      (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM counseling_sessions cs 
    WHERE cs.id = session_participants.session_id 
    AND (
      cs.created_by = auth.uid() OR 
      (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
    )
  )
);

-- Create a view for limited session details (for non-creators in same department)
CREATE OR REPLACE VIEW public.session_limited_view AS
SELECT 
  cs.id,
  cs.name,
  cs.session_date,
  cs.start_time,
  cs.end_time,
  cs.session_type,
  cs.status,
  cs.priority,
  cs.created_at,
  cs.updated_at,
  -- Only show full details if user is creator or super admin
  CASE 
    WHEN cs.created_by = auth.uid() OR 
         (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
    THEN cs.description
    ELSE NULL
  END as description,
  CASE 
    WHEN cs.created_by = auth.uid() OR 
         (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
    THEN cs.location
    ELSE NULL
  END as location,
  CASE 
    WHEN cs.created_by = auth.uid() OR 
         (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
    THEN cs.created_by
    ELSE NULL
  END as created_by,
  -- Indicate if user can see full details
  (cs.created_by = auth.uid() OR 
   (SELECT role FROM user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')) as can_view_details
FROM public.counseling_sessions cs
WHERE can_access_session(cs.created_by);

-- Grant access to the view
GRANT SELECT ON public.session_limited_view TO authenticated;

-- Create RLS policy for the view (though views inherit from base tables)
ALTER VIEW public.session_limited_view SET (security_barrier = true);