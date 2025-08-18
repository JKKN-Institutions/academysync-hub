-- Fix security issue: Remove reference to auth.users from the view
-- Create a secure version of comprehensive_user_analytics that doesn't expose auth.users
DROP VIEW IF EXISTS public.comprehensive_user_analytics;

CREATE OR REPLACE VIEW public.comprehensive_user_analytics AS
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
    up.created_at as joined_date,
    CASE 
      WHEN up.is_synced_from_staff THEN 'staff'
      WHEN up.external_id IS NOT NULL THEN 'student'
      ELSE 'manual'
    END as user_type,
    CASE
      WHEN up.last_login > (now() - interval '7 days') THEN 'active'
      WHEN up.last_login > (now() - interval '30 days') THEN 'inactive'
      ELSE 'dormant'
    END as activity_status
  FROM user_profiles up
  WHERE up.user_id IS NOT NULL
),
activity_counts AS (
  SELECT 
    cs.created_by as user_id,
    COUNT(*) as sessions_created
  FROM counseling_sessions cs
  GROUP BY cs.created_by
),
goal_counts AS (
  SELECT 
    g.created_by as user_id,
    COUNT(*) as goals_created
  FROM goals g
  GROUP BY g.created_by
),
recent_activity AS (
  SELECT 
    ual.user_id,
    COUNT(*) as recent_activity_count
  FROM user_activity_logs ual
  WHERE ual.created_at > (now() - interval '30 days')
  GROUP BY ual.user_id
)
SELECT 
  us.*,
  COALESCE(ac.sessions_created, 0) as sessions_created,
  COALESCE(gc.goals_created, 0) as goals_created,
  COALESCE(ra.recent_activity_count, 0) as recent_activity_count
FROM user_stats us
LEFT JOIN activity_counts ac ON us.user_id = ac.user_id
LEFT JOIN goal_counts gc ON us.user_id = gc.user_id
LEFT JOIN recent_activity ra ON us.user_id = ra.user_id;