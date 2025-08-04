-- Create enum for assignment modes
CREATE TYPE assignment_mode AS ENUM ('app_managed', 'upstream_managed');

-- Create enum for mentor roles in assignments
CREATE TYPE mentor_role AS ENUM ('primary', 'co_mentor');

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_external_id TEXT NOT NULL,
  student_external_id TEXT NOT NULL,
  role mentor_role NOT NULL DEFAULT 'primary',
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  effective_to TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_assignments_mentor ON public.assignments(mentor_external_id);
CREATE INDEX idx_assignments_student ON public.assignments(student_external_id);
CREATE INDEX idx_assignments_status ON public.assignments(status);
CREATE INDEX idx_assignments_effective_dates ON public.assignments(effective_from, effective_to);

-- Create unique constraint for active primary mentors
CREATE UNIQUE INDEX unique_active_primary_mentor 
ON public.assignments(student_external_id) 
WHERE role = 'primary' AND status = 'active' AND effective_to IS NULL;

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'assign', 'unassign')),
  actor_id UUID REFERENCES auth.users(id),
  actor_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_values JSONB,
  new_values JSONB,
  details JSONB
);

-- Create index on audit logs
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);

-- Create system_settings table for configuration
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default assignment mode setting
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES ('assignment_mode', '"app_managed"', 'Controls whether assignments are managed by the app or synced from upstream');

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments
CREATE POLICY "Users can view assignments" 
ON public.assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create assignments" 
ON public.assignments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their created assignments" 
ON public.assignments 
FOR UPDATE 
USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- RLS Policies for audit logs  
CREATE POLICY "Users can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for system settings
CREATE POLICY "Users can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assignments
CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for system settings
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();