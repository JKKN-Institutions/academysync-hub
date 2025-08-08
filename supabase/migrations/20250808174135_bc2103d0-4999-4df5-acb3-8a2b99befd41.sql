-- Create roles table for comprehensive role management
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_system_role boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_role_assignments table for many-to-many relationship
CREATE TABLE public.user_role_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for roles table
CREATE POLICY "Admins can manage roles" 
ON public.roles 
FOR ALL 
USING (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Users can view active roles" 
ON public.roles 
FOR SELECT 
USING (status = 'active');

-- Create policies for user_role_assignments table
CREATE POLICY "Admins can manage role assignments" 
ON public.user_role_assignments 
FOR ALL 
USING (get_current_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "Users can view their own role assignments" 
ON public.user_role_assignments 
FOR SELECT 
USING (user_id = auth.uid());

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(DISTINCT permission_item)
    FILTER (WHERE permission_item IS NOT NULL),
    '[]'::jsonb
  )
  FROM (
    SELECT jsonb_array_elements_text(r.permissions) as permission_item
    FROM public.user_role_assignments ura
    JOIN public.roles r ON r.id = ura.role_id
    WHERE ura.user_id = user_uuid 
      AND ura.status = 'active'
      AND r.status = 'active'
      AND (ura.expires_at IS NULL OR ura.expires_at > now())
  ) permissions;
$$;

-- Create function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(permission_name text, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_role_assignments ura
    JOIN public.roles r ON r.id = ura.role_id
    WHERE ura.user_id = user_uuid 
      AND ura.status = 'active'
      AND r.status = 'active'
      AND (ura.expires_at IS NULL OR ura.expires_at > now())
      AND r.permissions ? permission_name
  );
$$;

-- Insert default system roles
INSERT INTO public.roles (name, description, permissions, is_system_role) VALUES
('super_admin', 'Super Administrator with full system access', 
 '["user_management", "system_config", "reports_access", "audit_logs", "role_management", "counseling_sessions", "student_access", "mentor_oversight"]'::jsonb, true),
('admin', 'Administrator with system management capabilities', 
 '["user_management", "system_config", "reports_access", "audit_logs", "counseling_sessions", "student_access"]'::jsonb, true),
('dept_lead', 'Department Lead with oversight capabilities', 
 '["dept_reports", "mentor_oversight", "student_access", "reports_view"]'::jsonb, true),
('mentor', 'Mentor with counseling and student interaction capabilities', 
 '["counseling_sessions", "student_access", "reports_view", "session_participation", "goal_setting"]'::jsonb, true),
('mentee', 'Student with basic access to mentoring features', 
 '["session_participation", "goal_setting", "profile_view"]'::jsonb, true);

-- Create trigger for updated_at
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit triggers for role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, actor_id, new_values)
    VALUES ('role', NEW.id::text, 'created', auth.uid(), row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, actor_id, old_values, new_values)
    VALUES ('role', NEW.id::text, 'updated', auth.uid(), row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (entity_type, entity_id, action, actor_id, old_values)
    VALUES ('role', OLD.id::text, 'deleted', auth.uid(), row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER roles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_changes();

CREATE TRIGGER user_role_assignments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_role_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_changes();