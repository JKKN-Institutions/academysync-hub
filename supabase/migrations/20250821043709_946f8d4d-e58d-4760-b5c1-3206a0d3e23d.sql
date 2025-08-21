-- Only enable RLS on actual tables, not views
-- Views inherit permissions from underlying tables

-- Check and enable RLS only on tables that exist and are not views
DO $$
BEGIN
    -- Enable RLS only on actual tables that need it
    -- Skip views (like active_mentor_assignments, comprehensive_user_analytics, etc.)
    
    -- Check if these are tables before enabling RLS
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'staff_directory' 
        AND table_type = 'BASE TABLE'
    ) THEN
        ALTER TABLE public.staff_directory ENABLE ROW LEVEL SECURITY;
        
        -- Add policy for staff_directory
        CREATE POLICY "Authenticated users can view staff directory" 
        ON public.staff_directory 
        FOR SELECT 
        TO authenticated
        USING (true);
    END IF;

END $$;