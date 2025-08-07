-- Add super_admin to allowed roles by updating the check constraint
-- First drop the existing constraint and add a new one with super_admin included

ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('admin', 'mentor', 'mentee', 'dept_lead', 'super_admin'));

-- Now update the first user to super_admin role
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