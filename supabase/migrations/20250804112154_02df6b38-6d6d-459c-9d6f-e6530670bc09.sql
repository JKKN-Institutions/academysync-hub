-- Create user profiles table for role management
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'mentee' CHECK (role IN ('admin', 'mentor', 'mentee', 'dept_lead')),
  display_name TEXT,
  department TEXT,
  external_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    'mentee'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to user_profiles for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enhanced RLS policies for existing tables based on roles
-- Counseling sessions - mentors can only manage their own sessions
CREATE POLICY "Mentors can only manage their assigned students' sessions"
ON public.counseling_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.assignments a ON a.mentor_external_id = up.external_id
    JOIN public.session_participants sp ON sp.session_id = counseling_sessions.id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'mentor'
    AND a.student_external_id = sp.student_external_id
    AND a.status = 'active'
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'dept_lead')
  )
);

-- Goals - similar restrictions for mentors
CREATE POLICY "Mentors can only manage their assigned students' goals"
ON public.goals
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.assignments a ON a.mentor_external_id = up.external_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'mentor'
    AND a.student_external_id = goals.student_external_id
    AND a.status = 'active'
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'dept_lead')
  )
);

-- Meeting logs - restrict to mentors of assigned students
CREATE POLICY "Mentors can only manage meeting logs for their students"
ON public.meeting_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    JOIN public.assignments a ON a.mentor_external_id = up.external_id
    JOIN public.session_participants sp ON sp.session_id = meeting_logs.session_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'mentor'
    AND a.student_external_id = sp.student_external_id
    AND a.status = 'active'
  )
  OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'dept_lead')
  )
);

-- Assignments - only admins can manage unless read-only
CREATE POLICY "Only admins can manage assignments"
ON public.assignments
FOR INSERT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update assignments"
ON public.assignments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- System settings - admin only
CREATE POLICY "Only admins can manage system settings"
ON public.system_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);