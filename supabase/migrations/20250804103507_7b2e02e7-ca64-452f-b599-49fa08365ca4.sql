-- Create enum for goal status
CREATE TYPE public.goal_status AS ENUM ('proposed', 'in_progress', 'completed', 'archived');

-- Create goals table (without counseling_sessions FK for now)
CREATE TABLE public.goals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_external_id TEXT NOT NULL,
    session_id UUID,
    area_of_focus TEXT NOT NULL,
    smart_goal_text TEXT NOT NULL,
    knowledge_what TEXT,
    knowledge_how TEXT,
    skills_what TEXT,
    skills_how TEXT,
    action_plan TEXT,
    target_date DATE,
    status public.goal_status NOT NULL DEFAULT 'proposed',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    version_number INTEGER NOT NULL DEFAULT 1
);

-- Create goal versions table for history tracking
CREATE TABLE public.goal_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    area_of_focus TEXT NOT NULL,
    smart_goal_text TEXT NOT NULL,
    knowledge_what TEXT,
    knowledge_how TEXT,
    skills_what TEXT,
    skills_how TEXT,
    action_plan TEXT,
    target_date DATE,
    status public.goal_status NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    change_summary TEXT,
    previous_values JSONB
);

-- Create indexes
CREATE INDEX idx_goals_student_external_id ON public.goals(student_external_id);
CREATE INDEX idx_goals_session_id ON public.goals(session_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_goals_target_date ON public.goals(target_date);
CREATE INDEX idx_goal_versions_goal_id ON public.goal_versions(goal_id);
CREATE INDEX idx_goal_versions_version_number ON public.goal_versions(version_number);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goals
CREATE POLICY "Users can view goals" ON public.goals
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update goals" ON public.goals
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete goals" ON public.goals
    FOR DELETE USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- RLS Policies for goal_versions
CREATE POLICY "Users can view goal versions" ON public.goal_versions
    FOR SELECT USING (true);

CREATE POLICY "System can create goal versions" ON public.goal_versions
    FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create goal version on update
CREATE OR REPLACE FUNCTION public.create_goal_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert version record for the OLD values
    INSERT INTO public.goal_versions (
        goal_id,
        version_number,
        area_of_focus,
        smart_goal_text,
        knowledge_what,
        knowledge_how,
        skills_what,
        skills_how,
        action_plan,
        target_date,
        status,
        changed_by,
        change_summary,
        previous_values
    ) VALUES (
        OLD.id,
        OLD.version_number,
        OLD.area_of_focus,
        OLD.smart_goal_text,
        OLD.knowledge_what,
        OLD.knowledge_how,
        OLD.skills_what,
        OLD.skills_how,
        OLD.action_plan,
        OLD.target_date,
        OLD.status,
        NEW.created_by,
        CASE 
            WHEN OLD.status != NEW.status THEN 'Status changed from ' || OLD.status || ' to ' || NEW.status
            ELSE 'Goal updated'
        END,
        row_to_json(OLD)
    );
    
    -- Increment version number
    NEW.version_number = OLD.version_number + 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for goal versioning
CREATE TRIGGER create_goal_version_trigger
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.create_goal_version();

-- Create audit trigger for goals
CREATE TRIGGER audit_goals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.create_audit_log();