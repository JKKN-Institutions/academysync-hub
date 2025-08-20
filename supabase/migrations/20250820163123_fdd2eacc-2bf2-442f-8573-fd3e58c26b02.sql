-- Enable RLS on tables that are missing it
ALTER TABLE public.active_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprehensive_user_analytics ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.staff_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for these tables
-- Active mentor assignments - only accessible by authenticated users
CREATE POLICY "Active mentor assignments viewable by authenticated users" 
ON public.active_mentor_assignments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Comprehensive user analytics - only admins can view
CREATE POLICY "Only admins can view comprehensive analytics" 
ON public.comprehensive_user_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

-- Staff directory - viewable by authenticated users
CREATE POLICY "Staff directory viewable by authenticated users" 
ON public.staff_directory 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- User analytics - admins can view all, users can view their own
CREATE POLICY "Admins can view all user analytics" 
ON public.user_analytics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics 
FOR SELECT 
USING (user_id = auth.uid());