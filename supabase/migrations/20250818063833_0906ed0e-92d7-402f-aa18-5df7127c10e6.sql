-- Fix the analytics view by removing the non-existent email column
-- Create comprehensive user analytics and sync system
-- Add missing columns to user_profiles for better analytics
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS institution text,
ADD COLUMN IF NOT EXISTS mobile text,
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone,
ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_synced_from_staff boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS staff_id text,
ADD COLUMN IF NOT EXISTS designation text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create user activity tracking table for analytics
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type text NOT NULL,
    activity_data jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user_activity_logs
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activity_logs
CREATE POLICY "Users can view their own activity" 
ON user_activity_logs 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" 
ON user_activity_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all activity" 
ON user_activity_logs 
FOR SELECT 
USING (get_current_user_role() IN ('admin', 'super_admin'));

-- Create user sync log table
CREATE TABLE IF NOT EXISTS user_sync_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type text NOT NULL, -- 'staff_to_users', 'manual_create', etc.
    users_processed integer DEFAULT 0,
    users_created integer DEFAULT 0,
    users_updated integer DEFAULT 0,
    errors jsonb,
    sync_status text DEFAULT 'in_progress', -- 'completed', 'failed', 'in_progress'
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone
);

-- Enable RLS on user_sync_logs
ALTER TABLE user_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sync_logs
CREATE POLICY "Admins can view sync logs" 
ON user_sync_logs 
FOR ALL 
USING (get_current_user_role() IN ('admin', 'super_admin'));

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    activity_type text,
    activity_data jsonb DEFAULT NULL,
    user_ip text DEFAULT NULL,
    user_agent_string text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO user_activity_logs (
        user_id,
        activity_type,
        activity_data,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        activity_type,
        activity_data,
        user_ip,
        user_agent_string
    );
    
    -- Update login count if this is a login activity
    IF activity_type = 'login' THEN
        UPDATE user_profiles 
        SET 
            last_login = now(),
            login_count = COALESCE(login_count, 0) + 1
        WHERE user_id = auth.uid();
    END IF;
END;
$$;

-- Create view for user analytics (fixed)
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
    up.id,
    up.user_id,
    up.display_name,
    au.email,
    up.role,
    up.department,
    up.institution,
    up.login_count,
    up.last_login,
    up.created_at as joined_date,
    au.email_confirmed_at,
    au.last_sign_in_at,
    CASE 
        WHEN up.last_login > now() - interval '7 days' THEN 'active'
        WHEN up.last_login > now() - interval '30 days' THEN 'inactive'
        WHEN up.last_login IS NULL THEN 'never_logged_in'
        ELSE 'dormant'
    END as activity_status,
    -- Count of counseling sessions
    (SELECT COUNT(*) FROM counseling_sessions cs WHERE cs.created_by = up.user_id) as sessions_created,
    -- Count of goals
    (SELECT COUNT(*) FROM goals g WHERE g.created_by = up.user_id) as goals_created,
    -- Recent activity count (last 30 days)
    (SELECT COUNT(*) FROM user_activity_logs ual 
     WHERE ual.user_id = up.user_id 
     AND ual.created_at > now() - interval '30 days') as recent_activity_count
FROM user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id;

-- Grant permissions for the analytics view
GRANT SELECT ON user_analytics TO authenticated;

-- Create RLS policy for the analytics view  
-- Note: This won't work directly on views, so we handle this in the application

-- Create trigger to log user profile updates
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
        row_to_json(NEW)::jsonb
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger for user profile changes
DROP TRIGGER IF EXISTS log_user_profile_changes ON user_profiles;
CREATE TRIGGER log_user_profile_changes
    AFTER INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_profile_changes();