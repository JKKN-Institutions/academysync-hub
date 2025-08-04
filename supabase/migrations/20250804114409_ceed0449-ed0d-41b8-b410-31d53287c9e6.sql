-- Add demo mode setting to system_settings if not exists
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES (
    'demo_mode', 
    '{"enabled": false, "description": "Enable demo mode with mock data for training sessions"}',
    'Demo mode toggle: when enabled, uses mock data instead of live API data'
) 
ON CONFLICT (setting_key) DO NOTHING;