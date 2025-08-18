-- Fix Security Definer View issue by properly reviewing SECURITY DEFINER usage
-- According to Supabase docs, the issue is likely functions that don't need SECURITY DEFINER

-- The get_current_user_role function only accesses the current user's own data
-- It doesn't need SECURITY DEFINER since it only reads user's own profile
-- However, we need to update dependent policies first

-- Let's create a new function name and update policies gradually
CREATE OR REPLACE FUNCTION public.get_current_user_role_safe()
RETURNS text
LANGUAGE sql
STABLE
AS $function$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$function$;

-- Update the policies to use the new function
DROP POLICY IF EXISTS "Only admins can insert assignments" ON public.assignments;
CREATE POLICY "Only admins can insert assignments" 
ON public.assignments 
FOR INSERT 
WITH CHECK (public.get_current_user_role_safe() = 'admin');

DROP POLICY IF EXISTS "Only admins can update assignments" ON public.assignments;
CREATE POLICY "Only admins can update assignments" 
ON public.assignments 
FOR UPDATE 
USING (public.get_current_user_role_safe() = 'admin');

DROP POLICY IF EXISTS "Only admins can update system settings" ON public.system_settings;
CREATE POLICY "Only admins can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (public.get_current_user_role_safe() = 'admin');

DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
CREATE POLICY "Admins can manage roles" 
ON public.roles 
FOR ALL 
USING (public.get_current_user_role_safe() IN ('admin', 'super_admin'));

DROP POLICY IF EXISTS "Admins can manage role assignments" ON public.user_role_assignments;
CREATE POLICY "Admins can manage role assignments" 
ON public.user_role_assignments 
FOR ALL 
USING (public.get_current_user_role_safe() IN ('admin', 'super_admin'));

-- Now we can safely drop the old function and rename the new one
DROP FUNCTION public.get_current_user_role();

-- Rename the new function to replace the old one
ALTER FUNCTION public.get_current_user_role_safe() RENAME TO get_current_user_role;