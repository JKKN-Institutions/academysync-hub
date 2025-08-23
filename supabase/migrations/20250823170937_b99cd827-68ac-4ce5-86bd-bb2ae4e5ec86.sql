-- Fix security issues from the previous migration

-- Fix the search_path issue for functions
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

-- Remove the security definer view and recreate as regular view
DROP VIEW IF EXISTS public.session_limited_view;

-- Create a regular view without security definer
CREATE VIEW public.session_limited_view AS
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