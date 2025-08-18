-- Create students table to store student data
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id varchar NOT NULL UNIQUE,
  roll_no varchar,
  name varchar NOT NULL,
  email varchar,
  program varchar,
  semester_year integer,
  department varchar,
  status varchar DEFAULT 'active',
  avatar_url text,
  gpa decimal,
  mobile varchar,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  synced_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students are viewable by authenticated users" 
ON public.students 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage students" 
ON public.students 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

-- Create trigger for students updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create comprehensive analytics view for all users
CREATE OR REPLACE VIEW public.comprehensive_user_analytics AS
WITH user_stats AS (
  SELECT 
    au.id as user_id,
    au.email,
    au.email_confirmed_at,
    au.last_sign_in_at,
    au.created_at as joined_date,
    up.display_name,
    up.role,
    up.department,
    up.institution,
    up.login_count,
    up.last_login,
    up.external_id,
    up.is_synced_from_staff,
    up.staff_id,
    CASE 
      WHEN up.is_synced_from_staff THEN 'staff'
      WHEN up.external_id IS NOT NULL THEN 'student'
      ELSE 'manual'
    END as user_type,
    CASE
      WHEN au.last_sign_in_at > (now() - interval '7 days') THEN 'active'
      WHEN au.last_sign_in_at > (now() - interval '30 days') THEN 'inactive'
      ELSE 'dormant'
    END as activity_status
  FROM auth.users au
  LEFT JOIN user_profiles up ON au.id = up.user_id
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