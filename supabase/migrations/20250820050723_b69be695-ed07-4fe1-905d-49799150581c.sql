-- Fix the change_user_role function to use valid action values
-- The audit_logs table only allows: 'create', 'update', 'delete', 'assign', 'unassign'

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
  
  -- Log the role change in audit_logs using 'update' action (which is allowed)
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
    'update',
    auth.uid(),
    jsonb_build_object('role', old_role),
    jsonb_build_object('role', new_role),
    jsonb_build_object(
      'changed_by', current_user_role,
      'target_user', target_user_id,
      'change_type', 'role_update',
      'action_description', 'Role changed from ' || old_role || ' to ' || new_role
    )
  );
  
  RETURN TRUE;
END;
$$;