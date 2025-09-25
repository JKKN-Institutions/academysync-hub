-- Enable demo mode by default for Student 360 functionality
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES (
  'demo_mode',
  '{"enabled": true, "description": "Demo mode active: using mock data for training sessions"}',
  'Demo mode configuration for training sessions'
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = '{"enabled": true, "description": "Demo mode active: using mock data for training sessions"}',
  updated_at = now();