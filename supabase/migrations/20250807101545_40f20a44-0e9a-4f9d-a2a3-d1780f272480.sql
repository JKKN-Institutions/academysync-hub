-- Create staff table to store staff information locally
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id VARCHAR(50) UNIQUE NOT NULL, -- External staff ID from API
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(255),
  designation VARCHAR(255),
  mobile VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now() -- Last sync from external API
);

-- Enable RLS for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policies for staff table
CREATE POLICY "Staff records are viewable by authenticated users" 
ON public.staff 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage staff records" 
ON public.staff 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Create mentor-student assignment table to track relationships
CREATE TABLE IF NOT EXISTS public.mentor_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL, -- References staff.id
  student_id VARCHAR(50) NOT NULL, -- External student ID from API
  student_name VARCHAR(255), -- Cached for performance
  assignment_type VARCHAR(20) DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'co_mentor')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  assigned_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  assigned_by UUID, -- References user_profiles.user_id
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Foreign key constraints
  FOREIGN KEY (mentor_id) REFERENCES public.staff(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES auth.users(id),
  
  -- Ensure one primary mentor per student at a time
  UNIQUE(student_id, assignment_type, status) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS for mentor assignments
ALTER TABLE public.mentor_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for mentor assignments
CREATE POLICY "Mentor assignments are viewable by authenticated users" 
ON public.mentor_assignments 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Mentors can view their own assignments" 
ON public.mentor_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.staff s
    WHERE s.id = mentor_assignments.mentor_id 
    AND s.email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Admins and dept leads can manage assignments" 
ON public.mentor_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'dept_lead')
  )
);

-- Create indexes for better performance
CREATE INDEX idx_staff_status ON public.staff(status);
CREATE INDEX idx_staff_department ON public.staff(department);
CREATE INDEX idx_staff_email ON public.staff(email);
CREATE INDEX idx_mentor_assignments_mentor ON public.mentor_assignments(mentor_id);
CREATE INDEX idx_mentor_assignments_student ON public.mentor_assignments(student_id);
CREATE INDEX idx_mentor_assignments_status ON public.mentor_assignments(status);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_assignments_updated_at
  BEFORE UPDATE ON public.mentor_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for active mentor-student relationships
CREATE OR REPLACE VIEW public.active_mentor_assignments AS
SELECT 
  ma.*,
  s.name as mentor_name,
  s.email as mentor_email,
  s.department as mentor_department,
  s.designation as mentor_designation
FROM public.mentor_assignments ma
JOIN public.staff s ON ma.mentor_id = s.id
WHERE ma.status = 'active' AND s.status = 'active';

-- Grant permissions on the view
GRANT SELECT ON public.active_mentor_assignments TO authenticated;