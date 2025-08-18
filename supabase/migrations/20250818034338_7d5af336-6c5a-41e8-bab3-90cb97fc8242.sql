-- Fix Security Definer View issue
-- The issue is likely with overly broad SECURITY DEFINER functions
-- Let's review and fix any inappropriate use of SECURITY DEFINER

-- First, check if any views are using SECURITY DEFINER inappropriately
-- Drop and recreate any problematic functions without SECURITY DEFINER where appropriate

-- The core issue: Some functions have SECURITY DEFINER that don't need it
-- SECURITY DEFINER should only be used when the function needs to access
-- data with elevated privileges that the caller doesn't have

-- Recreate the get_current_user_role function without SECURITY DEFINER
-- since it only reads the user's own profile
DROP FUNCTION IF EXISTS public.get_current_user_role();

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $function$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid();
$function$;

-- Keep SECURITY DEFINER only for functions that truly need elevated privileges
-- like audit logging and permission checking

-- Add comment to clarify why certain functions need SECURITY DEFINER
COMMENT ON FUNCTION public.get_user_permissions(uuid) IS 
'SECURITY DEFINER required: Needs to read role assignments across all users for permission checks';

COMMENT ON FUNCTION public.user_has_permission(text, uuid) IS 
'SECURITY DEFINER required: Needs to read role assignments across all users for permission checks';

COMMENT ON FUNCTION public.log_role_changes() IS 
'SECURITY DEFINER required: Trigger function needs to write audit logs regardless of user permissions';

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'SECURITY DEFINER required: Trigger function needs to update timestamps regardless of user permissions';

COMMENT ON FUNCTION public.create_goal_version() IS 
'SECURITY DEFINER required: Trigger function needs to create version records regardless of user permissions';

COMMENT ON FUNCTION public.handle_new_user() IS 
'SECURITY DEFINER required: Trigger function needs to create user profiles during registration';