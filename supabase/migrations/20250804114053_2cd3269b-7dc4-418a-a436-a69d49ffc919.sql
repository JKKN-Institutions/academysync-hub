-- Add assignment mode setting to system_settings if not exists
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES (
    'assignment_mode', 
    '{"mode": "app", "description": "Controls whether assignments are managed by the app or read from upstream source"}',
    'Assignment management mode: app (app-managed) or upstream (read-only from external system)'
) 
ON CONFLICT (setting_key) DO NOTHING;