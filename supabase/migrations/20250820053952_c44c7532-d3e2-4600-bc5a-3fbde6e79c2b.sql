-- Fix the log_profile_changes function to use lowercase 'update' action
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO audit_logs (
        entity_type,
        entity_id,
        action,
        actor_id,
        old_values,
        new_values
    ) VALUES (
        'user_profile',
        NEW.id::text,
        lower(TG_OP),  -- Convert to lowercase
        auth.uid(),
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        row_to_json(NEW)::jsonb
    );
    
    RETURN NEW;
END;
$$;

-- Now update boobalan.a@jkkn.ac.in role to super_admin
UPDATE public.user_profiles 
SET role = 'super_admin', updated_at = now()
WHERE user_id = '06287b14-8a1c-43d0-ac56-84105ccb49cc';