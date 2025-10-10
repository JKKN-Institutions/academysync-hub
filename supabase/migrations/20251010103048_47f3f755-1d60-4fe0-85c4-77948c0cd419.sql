-- =====================================================
-- MENTOR-MENTEE ASSIGNMENT CYCLE MANAGEMENT SYSTEM
-- This creates a comprehensive yearly assignment system
-- with super admin controls and audit trails
-- =====================================================

-- 1. CREATE ASSIGNMENT CYCLES TABLE
-- Tracks yearly assignment periods with lock mechanisms
CREATE TABLE IF NOT EXISTS public.assignment_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year TEXT NOT NULL UNIQUE, -- e.g., "2024-2025"
  cycle_name TEXT NOT NULL, -- e.g., "Academic Year 2024-2025 Assignment Cycle"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, locked, archived
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_at TIMESTAMP WITH TIME ZONE,
  locked_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_cycle_status CHECK (status IN ('draft', 'active', 'locked', 'archived')),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- 2. CREATE ASSIGNMENT HISTORY TABLE
-- Tracks all changes to assignments for audit trail
CREATE TABLE IF NOT EXISTS public.assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  cycle_id UUID REFERENCES public.assignment_cycles(id),
  action_type TEXT NOT NULL, -- created, updated, reassigned, ended, locked
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_action_type CHECK (action_type IN ('created', 'updated', 'reassigned', 'ended', 'locked', 'unlocked'))
);

-- 3. ADD CYCLE TRACKING TO ASSIGNMENTS TABLE
-- Add columns to track cycle and lock status
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES public.assignment_cycles(id),
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS program TEXT;

-- 4. CREATE VALIDATION FUNCTION FOR SAME INSTITUTION/DEPARTMENT/PROGRAM
CREATE OR REPLACE FUNCTION public.validate_assignment_constraints(
  p_mentor_external_id TEXT,
  p_student_external_id TEXT,
  p_cycle_id UUID
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT,
  mentor_institution TEXT,
  mentor_department TEXT,
  student_institution TEXT,
  student_department TEXT,
  student_program TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mentor_record RECORD;
  v_student_record RECORD;
  v_cycle_locked BOOLEAN;
  v_existing_assignment UUID;
BEGIN
  -- Check if cycle is locked
  SELECT is_locked INTO v_cycle_locked
  FROM assignment_cycles
  WHERE id = p_cycle_id;
  
  IF v_cycle_locked THEN
    RETURN QUERY SELECT false, 'Assignment cycle is locked. No changes allowed.'::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Get mentor details
  SELECT department INTO v_mentor_record
  FROM staff
  WHERE staff_id = p_mentor_external_id
  LIMIT 1;
  
  -- Get student details
  SELECT department, program INTO v_student_record
  FROM students
  WHERE student_id = p_student_external_id
  LIMIT 1;
  
  -- Check if student already has assignment in this cycle
  SELECT id INTO v_existing_assignment
  FROM assignments
  WHERE student_external_id = p_student_external_id
    AND cycle_id = p_cycle_id
    AND status = 'active'
  LIMIT 1;
  
  IF v_existing_assignment IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Student already has an active assignment in this cycle.'::TEXT, 
                  NULL::TEXT, v_mentor_record.department, NULL::TEXT, 
                  v_student_record.department, v_student_record.program;
    RETURN;
  END IF;
  
  -- Validate same department (using department as institution proxy)
  IF v_mentor_record.department IS NULL OR v_student_record.department IS NULL THEN
    RETURN QUERY SELECT false, 'Mentor or student department information is missing.'::TEXT,
                  NULL::TEXT, v_mentor_record.department, NULL::TEXT, 
                  v_student_record.department, v_student_record.program;
    RETURN;
  END IF;
  
  IF v_mentor_record.department != v_student_record.department THEN
    RETURN QUERY SELECT false, 'Mentor and student must be from the same department/institution.'::TEXT,
                  NULL::TEXT, v_mentor_record.department, NULL::TEXT, 
                  v_student_record.department, v_student_record.program;
    RETURN;
  END IF;
  
  -- All validations passed
  RETURN QUERY SELECT true, NULL::TEXT,
                NULL::TEXT, v_mentor_record.department, NULL::TEXT, 
                v_student_record.department, v_student_record.program;
END;
$$;

-- 5. CREATE FUNCTION TO CHECK IF USER IS SUPER ADMIN
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_id = user_uuid
      AND role = 'super_admin'
  );
$$;

-- 6. CREATE FUNCTION TO LOG ASSIGNMENT CHANGES
CREATE OR REPLACE FUNCTION public.log_assignment_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO assignment_history (
      assignment_id,
      cycle_id,
      action_type,
      changed_by,
      new_values,
      change_reason
    ) VALUES (
      NEW.id,
      NEW.cycle_id,
      'created',
      auth.uid(),
      to_jsonb(NEW),
      'New assignment created'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO assignment_history (
      assignment_id,
      cycle_id,
      action_type,
      changed_by,
      old_values,
      new_values,
      change_reason
    ) VALUES (
      NEW.id,
      NEW.cycle_id,
      CASE 
        WHEN OLD.mentor_external_id != NEW.mentor_external_id THEN 'reassigned'
        WHEN OLD.status != NEW.status THEN 'updated'
        WHEN OLD.is_locked != NEW.is_locked AND NEW.is_locked THEN 'locked'
        WHEN OLD.is_locked != NEW.is_locked AND NOT NEW.is_locked THEN 'unlocked'
        ELSE 'updated'
      END,
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW),
      CASE 
        WHEN OLD.mentor_external_id != NEW.mentor_external_id THEN 'Mentor reassigned'
        WHEN OLD.status != NEW.status THEN 'Status changed from ' || OLD.status || ' to ' || NEW.status
        WHEN OLD.is_locked != NEW.is_locked THEN 'Lock status changed'
        ELSE 'Assignment updated'
      END
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO assignment_history (
      assignment_id,
      cycle_id,
      action_type,
      changed_by,
      old_values,
      change_reason
    ) VALUES (
      OLD.id,
      OLD.cycle_id,
      'ended',
      auth.uid(),
      to_jsonb(OLD),
      'Assignment deleted'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. CREATE TRIGGER FOR ASSIGNMENT AUDIT LOGGING
DROP TRIGGER IF EXISTS assignment_audit_trigger ON public.assignments;
CREATE TRIGGER assignment_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_assignment_change();

-- 8. ENABLE RLS ON NEW TABLES
ALTER TABLE public.assignment_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_history ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES FOR ASSIGNMENT CYCLES
-- Only super admins can manage cycles
CREATE POLICY "Super admins can manage assignment cycles"
  ON public.assignment_cycles
  FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- All authenticated users can view cycles
CREATE POLICY "Authenticated users can view assignment cycles"
  ON public.assignment_cycles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 10. RLS POLICIES FOR ASSIGNMENT HISTORY
-- Super admins can view all history
CREATE POLICY "Super admins can view all assignment history"
  ON public.assignment_history
  FOR SELECT
  USING (is_super_admin(auth.uid()));

-- Mentors can view history for their assignments
CREATE POLICY "Mentors can view their assignment history"
  ON public.assignment_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM assignments a
      JOIN staff s ON s.staff_id = a.mentor_external_id
      JOIN user_profiles up ON up.staff_id = s.staff_id
      WHERE a.id = assignment_history.assignment_id
        AND up.user_id = auth.uid()
    )
  );

-- System can insert history
CREATE POLICY "System can insert assignment history"
  ON public.assignment_history
  FOR INSERT
  WITH CHECK (true);

-- 11. UPDATE ASSIGNMENTS RLS POLICIES
-- Drop existing policies that conflict
DROP POLICY IF EXISTS "Authenticated users can create assignments" ON public.assignments;
DROP POLICY IF EXISTS "Only admins can insert assignments" ON public.assignments;

-- Only super admins can create assignments
CREATE POLICY "Only super admins can create assignments"
  ON public.assignments
  FOR INSERT
  WITH CHECK (is_super_admin(auth.uid()));

-- Only super admins can update unlocked assignments
CREATE POLICY "Only super admins can update unlocked assignments"
  ON public.assignments
  FOR UPDATE
  USING (
    is_super_admin(auth.uid()) AND 
    NOT is_locked
  );

-- 12. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_assignments_cycle_id ON public.assignments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_locked ON public.assignments(is_locked);
CREATE INDEX IF NOT EXISTS idx_assignment_history_assignment_id ON public.assignment_history(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_cycle_id ON public.assignment_history(cycle_id);
CREATE INDEX IF NOT EXISTS idx_assignment_cycles_status ON public.assignment_cycles(status);
CREATE INDEX IF NOT EXISTS idx_assignment_cycles_academic_year ON public.assignment_cycles(academic_year);

-- 13. CREATE VIEW FOR ACTIVE ASSIGNMENTS WITH VALIDATION
CREATE OR REPLACE VIEW public.assignments_with_validation AS
SELECT 
  a.*,
  ac.academic_year,
  ac.cycle_name,
  ac.is_locked as cycle_locked,
  s.name as student_name,
  s.department as student_department,
  s.program as student_program,
  st.name as mentor_name,
  st.department as mentor_department,
  st.designation as mentor_designation,
  CASE 
    WHEN a.is_locked THEN 'Locked - No changes allowed'
    WHEN ac.is_locked THEN 'Cycle locked - No changes allowed'
    WHEN st.department != s.department THEN 'Warning: Different departments'
    ELSE 'Valid'
  END as validation_status
FROM assignments a
LEFT JOIN assignment_cycles ac ON ac.id = a.cycle_id
LEFT JOIN students s ON s.student_id = a.student_external_id
LEFT JOIN staff st ON st.staff_id = a.mentor_external_id;

-- 14. GRANT PERMISSIONS
GRANT SELECT ON public.assignments_with_validation TO authenticated;

COMMENT ON TABLE public.assignment_cycles IS 'Tracks yearly assignment cycles with lock mechanisms to prevent changes during academic year';
COMMENT ON TABLE public.assignment_history IS 'Comprehensive audit trail for all assignment changes';
COMMENT ON FUNCTION public.validate_assignment_constraints IS 'Validates that mentor and student are from same institution, department, and program';
COMMENT ON FUNCTION public.is_super_admin IS 'Checks if user has super_admin role for assignment management';