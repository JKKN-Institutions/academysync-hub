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

CREATE POLICY "System can insert user profiles"
ON public.user_profiles
FOR INSERT
WITH CHECK (true);

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

-- Add trigger to user_profiles for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$$;

-- Enhanced policies for assignments - only admins can manage
DROP POLICY IF EXISTS "Only admins can manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Only admins can update assignments" ON public.assignments;

CREATE POLICY "Only admins can insert assignments"
ON public.assignments
FOR INSERT
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update assignments"
ON public.assignments
FOR UPDATE
USING (public.get_current_user_role() = 'admin');

-- Enhanced policies for system settings - admin only
DROP POLICY IF EXISTS "Only admins can manage system settings" ON public.system_settings;

CREATE POLICY "Only admins can update system settings"
ON public.system_settings
FOR UPDATE
USING (public.get_current_user_role() = 'admin');