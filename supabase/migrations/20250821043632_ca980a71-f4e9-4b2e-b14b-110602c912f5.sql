-- Enable RLS on tables that have policies but RLS is not enabled
-- This fixes the critical security issue where policies exist but RLS is disabled

-- First, let's enable RLS on all tables that need it
ALTER TABLE public.active_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprehensive_user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for the tables that don't have them yet
-- active_mentor_assignments - authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view active mentor assignments" 
ON public.active_mentor_assignments 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Admins can manage active mentor assignments" 
ON public.active_mentor_assignments 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

-- comprehensive_user_analytics - admins only
CREATE POLICY "Admins can view comprehensive user analytics" 
ON public.comprehensive_user_analytics 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

-- staff_directory - authenticated users can view
CREATE POLICY "Authenticated users can view staff directory" 
ON public.staff_directory 
FOR SELECT 
TO authenticated
USING (true);

-- user_analytics - admins only
CREATE POLICY "Admins can view user analytics" 
ON public.user_analytics 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));