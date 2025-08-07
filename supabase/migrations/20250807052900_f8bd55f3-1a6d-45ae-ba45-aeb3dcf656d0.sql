-- Add super_admin role support and create a temporary way to set it
-- First, let's check what users exist and manually set the first one to super_admin
INSERT INTO user_profiles (user_id, role, display_name, external_id)
SELECT 
    id as user_id,
    'super_admin' as role,
    COALESCE(email, 'Super Administrator') as display_name,
    email as external_id
FROM auth.users 
WHERE email IS NOT NULL
LIMIT 1
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'super_admin',
    display_name = COALESCE(user_profiles.display_name, 'Super Administrator'),
    updated_at = now();