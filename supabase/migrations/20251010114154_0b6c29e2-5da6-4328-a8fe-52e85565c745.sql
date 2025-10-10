-- Update the current user's role to super_admin
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE email = 'thankamaniammal@jkkn.ac.in';

-- Log the change
INSERT INTO audit_logs (
  entity_type,
  entity_id,
  action,
  new_values,
  details
) 
SELECT 
  'user_profile',
  user_id::text,
  'role_change',
  jsonb_build_object('role', 'super_admin'),
  jsonb_build_object(
    'reason', 'Elevated to super_admin for assignment cycle management',
    'changed_via', 'system_migration'
  )
FROM user_profiles
WHERE email = 'thankamaniammal@jkkn.ac.in';