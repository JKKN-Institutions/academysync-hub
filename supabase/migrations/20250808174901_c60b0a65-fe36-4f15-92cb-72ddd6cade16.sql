-- Check current audit_logs table structure and constraints
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'audit_logs' AND table_schema = 'public';

-- Check for any check constraints
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public';

-- Fix the audit logging function to use proper action values
DROP FUNCTION IF EXISTS public.log_role_changes();

CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    action_type text;
BEGIN
    -- Determine the action type based on TG_OP
    IF TG_OP = 'INSERT' THEN
        action_type := 'create';
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'update';
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'delete';
    ELSE
        action_type := 'unknown';
    END IF;

    -- Insert audit log based on operation type
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            entity_type, 
            entity_id, 
            action, 
            actor_id, 
            new_values
        )
        VALUES (
            'role', 
            NEW.id::text, 
            action_type, 
            auth.uid(), 
            row_to_json(NEW)::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (
            entity_type, 
            entity_id, 
            action, 
            actor_id, 
            old_values, 
            new_values
        )
        VALUES (
            'role', 
            NEW.id::text, 
            action_type, 
            auth.uid(), 
            row_to_json(OLD)::jsonb, 
            row_to_json(NEW)::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (
            entity_type, 
            entity_id, 
            action, 
            actor_id, 
            old_values
        )
        VALUES (
            'role', 
            OLD.id::text, 
            action_type, 
            auth.uid(), 
            row_to_json(OLD)::jsonb
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Recreate the triggers
DROP TRIGGER IF EXISTS roles_audit_trigger ON public.roles;
DROP TRIGGER IF EXISTS user_role_assignments_audit_trigger ON public.user_role_assignments;

CREATE TRIGGER roles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_role_changes();

CREATE TRIGGER user_role_assignments_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.user_role_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.log_role_changes();