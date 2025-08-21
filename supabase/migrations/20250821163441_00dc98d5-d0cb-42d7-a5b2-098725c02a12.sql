-- Enhanced user profile creation with automatic role detection
-- This function will automatically determine if a user is staff or student based on MyJKKN data

-- Drop the old trigger and function first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create enhanced function to handle new user signup with automatic role detection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_email TEXT;
    staff_record RECORD;
    student_record RECORD;
    user_role TEXT := 'mentee'; -- Default role
    user_external_id TEXT;
    user_display_name TEXT;
    user_department TEXT;
    user_designation TEXT;
BEGIN
    user_email := NEW.email;
    
    -- Extract display name from metadata
    user_display_name := COALESCE(
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'display_name',
        user_email
    );
    
    -- Only process JKKN emails
    IF user_email ~* '@(jkkn\.ac\.in|jkkniu\.edu\.in|jkknce\.ac\.in)$' THEN
        -- First check if user is staff
        SELECT * INTO staff_record 
        FROM public.staff 
        WHERE LOWER(email) = LOWER(user_email) 
        AND status = 'active' 
        LIMIT 1;
        
        IF staff_record.id IS NOT NULL THEN
            -- User is staff - assign mentor role
            user_role := 'mentor';
            user_external_id := staff_record.staff_id;
            user_display_name := COALESCE(staff_record.name, user_display_name);
            user_department := staff_record.department;
            user_designation := staff_record.designation;
        ELSE
            -- Check if user is student
            SELECT * INTO student_record 
            FROM public.students 
            WHERE LOWER(email) = LOWER(user_email) 
            AND status = 'active' 
            LIMIT 1;
            
            IF student_record.id IS NOT NULL THEN
                -- User is student - assign mentee role
                user_role := 'mentee';
                user_external_id := student_record.student_id;
                user_display_name := COALESCE(student_record.name, user_display_name);
                user_department := student_record.department;
            END IF;
        END IF;
    END IF;
    
    -- Insert user profile with detected role and data
    INSERT INTO public.user_profiles (
        user_id, 
        display_name, 
        role,
        email,
        external_id,
        department,
        designation,
        is_synced_from_staff
    ) VALUES (
        NEW.id,
        user_display_name,
        user_role,
        user_email,
        user_external_id,
        user_department,
        user_designation,
        CASE WHEN user_role = 'mentor' THEN TRUE ELSE FALSE END
    );
    
    -- Log the user creation activity
    INSERT INTO public.user_activity_logs (
        user_id,
        activity_type,
        activity_data
    ) VALUES (
        NEW.id,
        'signup',
        jsonb_build_object(
            'email', user_email,
            'role_assigned', user_role,
            'external_id', user_external_id,
            'auto_detected', CASE WHEN user_external_id IS NOT NULL THEN true ELSE false END
        )
    );
    
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates user profiles with appropriate roles based on MyJKKN staff/student data. Assigns mentor role for staff, mentee role for students, with fallback to mentee for unknown users with JKKN emails.';