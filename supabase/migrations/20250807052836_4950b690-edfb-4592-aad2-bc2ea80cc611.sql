-- Add super_admin role and update your profile
-- First check current user profiles
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current authenticated user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Update the current user's role to super_admin (or insert if doesn't exist)
    INSERT INTO user_profiles (user_id, role, display_name)
    VALUES (current_user_id, 'super_admin', 'Super Administrator')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = 'super_admin',
        display_name = COALESCE(user_profiles.display_name, 'Super Administrator'),
        updated_at = now();
        
    RAISE NOTICE 'User role updated to super_admin for user: %', current_user_id;
END $$;