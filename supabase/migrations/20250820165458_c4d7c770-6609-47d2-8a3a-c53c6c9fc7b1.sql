-- Enable RLS on tables that have policies but RLS disabled
ALTER TABLE active_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehensive_user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for these tables
CREATE POLICY "Authenticated users can view active mentor assignments" ON active_mentor_assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view comprehensive user analytics" ON comprehensive_user_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Authenticated users can view staff directory" ON staff_directory
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can view user analytics" ON user_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );