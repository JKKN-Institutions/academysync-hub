-- Create departments and institutions tables to store MyJKKN API data

-- Create institutions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id TEXT UNIQUE NOT NULL,
    institution_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create departments table if it doesn't exist  
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id TEXT UNIQUE NOT NULL,
    department_name TEXT NOT NULL,
    description TEXT,
    institution_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies for institutions
CREATE POLICY "Authenticated users can view institutions"
ON public.institutions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage institutions"
ON public.institutions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])
    )
);

-- Create policies for departments
CREATE POLICY "Authenticated users can view departments"
ON public.departments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage departments"
ON public.departments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])
    )
);

-- Create programs table for better data organization
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name TEXT UNIQUE NOT NULL,
    department_id TEXT,
    institution_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view programs"
ON public.programs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage programs"
ON public.programs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text])
    )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institutions_institution_id ON public.institutions(institution_id);
CREATE INDEX IF NOT EXISTS idx_departments_department_id ON public.departments(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_institution_id ON public.departments(institution_id);
CREATE INDEX IF NOT EXISTS idx_programs_department_id ON public.programs(department_id);
CREATE INDEX IF NOT EXISTS idx_students_department ON public.students(department);
CREATE INDEX IF NOT EXISTS idx_students_program ON public.students(program);
CREATE INDEX IF NOT EXISTS idx_staff_department ON public.staff(department);