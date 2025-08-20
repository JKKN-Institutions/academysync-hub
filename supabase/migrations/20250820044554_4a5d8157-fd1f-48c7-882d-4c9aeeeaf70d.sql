-- Fix Security Definer View vulnerability
-- Replace SECURITY DEFINER views with secure alternatives that respect RLS

-- First, drop the existing views that have SECURITY DEFINER issues
DROP VIEW IF EXISTS public.active_mentor_assignments;
DROP VIEW IF EXISTS public.comprehensive_user_analytics; 
DROP VIEW IF EXISTS public.staff_directory;
DROP VIEW IF EXISTS public.user_analytics;

-- Recreate active_mentor_assignments view without SECURITY DEFINER
-- This view shows active mentor assignments with mentor details
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
FROM mentor_assignments ma
JOIN staff s ON (ma.mentor_id = s.id)
WHERE ma.status = 'active' 
    AND s.status = 'active';

-- Enable RLS on the view (this inherits from underlying tables)
ALTER VIEW public.active_mentor_assignments SET (security_invoker = true);

-- Recreate staff_directory view without SECURITY DEFINER
-- This view shows only active staff for directory purposes
CREATE VIEW public.staff_directory AS
SELECT 
    id,
    staff_id,
    name,
    department,
    designation,
    status,
    avatar_url
FROM staff
WHERE status = 'active';

-- Enable security invoker to respect RLS from underlying tables
ALTER VIEW public.staff_directory SET (security_invoker = true);

-- Recreate user_analytics view without SECURITY DEFINER
-- This view provides user analytics while respecting RLS
CREATE VIEW public.user_analytics AS
SELECT 
    up.id,
    up.user_id,
    up.display_name,
    up.role,
    up.department,
    up.institution,
    up.login_count,
    up.last_login,
    up.created_at AS joined_date,
    CASE
        WHEN up.last_login > (now() - interval '7 days') THEN 'active'
        WHEN up.last_login > (now() - interval '30 days') THEN 'inactive'
        WHEN up.last_login IS NULL THEN 'never_logged_in'
        ELSE 'dormant'
    END AS activity_status,
    (SELECT count(*) FROM counseling_sessions cs WHERE cs.created_by = up.user_id) AS sessions_created,
    (SELECT count(*) FROM goals g WHERE g.created_by = up.user_id) AS goals_created,
    (SELECT count(*) FROM user_activity_logs ual 
     WHERE ual.user_id = up.user_id 
     AND ual.created_at > (now() - interval '30 days')) AS recent_activity_count
FROM user_profiles up
WHERE up.user_id IS NOT NULL;

-- Enable security invoker to respect RLS from underlying tables
ALTER VIEW public.user_analytics SET (security_invoker = true);

-- Recreate comprehensive_user_analytics view without SECURITY DEFINER
-- This view provides comprehensive analytics while respecting RLS
CREATE VIEW public.comprehensive_user_analytics AS
WITH user_stats AS (
    SELECT 
        up.user_id,
        up.display_name,
        up.role,
        up.department,
        up.institution,
        up.login_count,
        up.last_login,
        up.external_id,
        up.is_synced_from_staff,
        up.staff_id,
        up.created_at AS joined_date,
        CASE
            WHEN up.is_synced_from_staff THEN 'staff'
            WHEN up.external_id IS NOT NULL THEN 'student'
            ELSE 'manual'
        END AS user_type,
        CASE
            WHEN up.last_login > (now() - interval '7 days') THEN 'active'
            WHEN up.last_login > (now() - interval '30 days') THEN 'inactive'
            ELSE 'dormant'
        END AS activity_status
    FROM user_profiles up
    WHERE up.user_id IS NOT NULL
),
activity_counts AS (
    SELECT 
        cs.created_by AS user_id,
        count(*) AS sessions_created
    FROM counseling_sessions cs
    GROUP BY cs.created_by
),
goal_counts AS (
    SELECT 
        g.created_by AS user_id,
        count(*) AS goals_created
    FROM goals g
    GROUP BY g.created_by
),
recent_activity AS (
    SELECT 
        ual.user_id,
        count(*) AS recent_activity_count
    FROM user_activity_logs ual
    WHERE ual.created_at > (now() - interval '30 days')
    GROUP BY ual.user_id
)
SELECT 
    us.user_id,
    us.display_name,
    us.role,
    us.department,
    us.institution,
    us.login_count,
    us.last_login,
    us.external_id,
    us.is_synced_from_staff,
    us.staff_id,
    us.joined_date,
    us.user_type,
    us.activity_status,
    COALESCE(ac.sessions_created, 0) AS sessions_created,
    COALESCE(gc.goals_created, 0) AS goals_created,
    COALESCE(ra.recent_activity_count, 0) AS recent_activity_count
FROM user_stats us
LEFT JOIN activity_counts ac ON (us.user_id = ac.user_id)
LEFT JOIN goal_counts gc ON (us.user_id = gc.user_id)
LEFT JOIN recent_activity ra ON (us.user_id = ra.user_id);

-- Enable security invoker to respect RLS from underlying tables
ALTER VIEW public.comprehensive_user_analytics SET (security_invoker = true);

-- Add RLS policies for the views to ensure proper access control
-- Note: Views inherit RLS from their underlying tables when security_invoker is true

-- Create policies for active_mentor_assignments view access
CREATE POLICY "Authenticated users can view active mentor assignments"
ON public.mentor_assignments
FOR SELECT
TO authenticated
USING (true);

-- The existing policies on staff and mentor_assignments tables will handle the security
-- since we're using security_invoker = true

-- Add a comment to document the security change
COMMENT ON VIEW public.active_mentor_assignments IS 'View of active mentor assignments. Uses security_invoker to respect RLS from underlying tables.';
COMMENT ON VIEW public.staff_directory IS 'Directory of active staff. Uses security_invoker to respect RLS from underlying tables.';
COMMENT ON VIEW public.user_analytics IS 'User analytics view. Uses security_invoker to respect RLS from underlying tables.';
COMMENT ON VIEW public.comprehensive_user_analytics IS 'Comprehensive user analytics. Uses security_invoker to respect RLS from underlying tables.';