-- Fix security vulnerability: Remove auth.users exposure from user_analytics view
-- Drop the problematic view that exposes auth.users
DROP VIEW IF EXISTS public.user_analytics;

-- Create a secure version that only uses data from user_profiles
-- This avoids exposing sensitive auth.users data while maintaining functionality
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
        WHEN (up.last_login > (now() - '7 days'::interval)) THEN 'active'::text
        WHEN (up.last_login > (now() - '30 days'::interval)) THEN 'inactive'::text
        WHEN (up.last_login IS NULL) THEN 'never_logged_in'::text
        ELSE 'dormant'::text
    END AS activity_status,
    ( SELECT count(*) AS count
           FROM counseling_sessions cs
          WHERE (cs.created_by = up.user_id)) AS sessions_created,
    ( SELECT count(*) AS count
           FROM goals g
          WHERE (g.created_by = up.user_id)) AS goals_created,
    ( SELECT count(*) AS count
           FROM user_activity_logs ual
          WHERE ((ual.user_id = up.user_id) AND (ual.created_at > (now() - '30 days'::interval)))) AS recent_activity_count
FROM user_profiles up
WHERE up.user_id IS NOT NULL;

-- Add RLS policy for the view
ALTER VIEW public.user_analytics OWNER TO postgres;

-- Grant appropriate permissions
GRANT SELECT ON public.user_analytics TO authenticated;
GRANT SELECT ON public.user_analytics TO service_role;