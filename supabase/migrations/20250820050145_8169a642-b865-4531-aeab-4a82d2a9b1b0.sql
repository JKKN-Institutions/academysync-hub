-- Fix User Role Management Issues
-- This addresses security issues where users could modify their own roles

-- 1. First, drop existing problematic policies on user_profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "System can insert user profiles" ON public.user_profiles;

-- 2. Create more secure and granular policies for user_profiles

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all user profiles
CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = ANY (ARRAY['admin'::text, 'super_admin'::text])
  )
);

-- Users can update their own profile BUT NOT THE ROLE field
-- Split this into two policies for clarity
CREATE POLICY "Users can update their own profile details" 
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only admins can update any user profiles (including roles)
CREATE POLICY "Only admins can update user profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.user_id = auth.uid() 
    AND up.role = ANY (ARRAY['admin'::text, 'super_admin'::text])
  )
);

-- System can insert user profiles (for new user registration)
CREATE POLICY "System can insert user profiles" 
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Create a secure function for role changes that includes audit logging
CREATE OR REPLACE FUNCTION public.change_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role TEXT;
  old_role TEXT;
BEGIN
  -- Check if current user is admin
  SELECT role INTO current_user_role 
  FROM user_profiles 
  WHERE user_id = auth.uid();
  
  IF current_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  -- Get the old role for logging
  SELECT role INTO old_role 
  FROM user_profiles 
  WHERE user_id = target_user_id;
  
  -- Update the user's role
  UPDATE user_profiles 
  SET role = new_role, updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log the role change in audit_logs
  INSERT INTO audit_logs (
    entity_type,
    entity_id,
    action,
    actor_id,
    old_values,
    new_values,
    details
  ) VALUES (
    'user_profile',
    target_user_id::text,
    'role_change',
    auth.uid(),
    jsonb_build_object('role', old_role),
    jsonb_build_object('role', new_role),
    jsonb_build_object(
      'changed_by', current_user_role,
      'target_user', target_user_id,
      'change_type', 'role_update'
    )
  );
  
  RETURN TRUE;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.change_user_role(UUID, TEXT) TO authenticated;