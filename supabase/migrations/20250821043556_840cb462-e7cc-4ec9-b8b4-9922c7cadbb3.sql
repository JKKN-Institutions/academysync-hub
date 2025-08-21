-- Add email field to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Update the user profile for ragul@jkkn.ac.in to super_admin
-- First, let's find the user by email in auth.users and update their profile
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Find the user ID by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'ragul@jkkn.ac.in';
    
    IF target_user_id IS NOT NULL THEN
        -- Update or insert the user profile
        INSERT INTO public.user_profiles (user_id, email, role, display_name)
        VALUES (target_user_id, 'ragul@jkkn.ac.in', 'super_admin', 'Ragul')
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            updated_at = now();
    END IF;
END $$;