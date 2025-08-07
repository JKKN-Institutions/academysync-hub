-- Update specific user to super_admin role
UPDATE user_profiles 
SET role = 'super_admin', 
    updated_at = now()
WHERE user_id = 'f7036645-09a5-4e60-aa0f-30e15db359a8';

-- If the profile doesn't exist, insert it
INSERT INTO user_profiles (user_id, role, display_name, external_id)
SELECT 
    'f7036645-09a5-4e60-aa0f-30e15db359a8' as user_id,
    'super_admin' as role,
    'ragul@jkkn.ac.in' as display_name,
    'ragul@jkkn.ac.in' as external_id
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = 'f7036645-09a5-4e60-aa0f-30e15db359a8'
);