-- Update boobalan.a@jkkn.ac.in role to super_admin
UPDATE public.user_profiles 
SET role = 'super_admin', updated_at = now()
WHERE user_id = '06287b14-8a1c-43d0-ac56-84105ccb49cc';

-- Log the role change in audit_logs
INSERT INTO public.audit_logs (
  entity_type,
  entity_id,
  action,
  actor_id,
  old_values,
  new_values,
  details
) VALUES (
  'user_profile',
  '06287b14-8a1c-43d0-ac56-84105ccb49cc',
  'role_change',
  'f7036645-09a5-4e60-aa0f-30e15db359a8',
  jsonb_build_object('role', 'mentee'),
  jsonb_build_object('role', 'super_admin'),
  jsonb_build_object(
    'changed_by', 'super_admin',
    'target_user', '06287b14-8a1c-43d0-ac56-84105ccb49cc',
    'change_type', 'role_update',
    'action_description', 'Role changed from mentee to super_admin for boobalan.a@jkkn.ac.in'
  )
);