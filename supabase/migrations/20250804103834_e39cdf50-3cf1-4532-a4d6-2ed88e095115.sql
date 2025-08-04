-- Create meeting_logs table for session minutes
CREATE TABLE public.meeting_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    focus_of_meeting TEXT NOT NULL,
    updates_from_previous TEXT,
    problems_encountered TEXT,
    resolutions_discussed TEXT,
    next_steps TEXT,
    expected_outcome_next TEXT,
    next_session_datetime TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create counseling_sessions table (referenced by goals but missing)
CREATE TABLE public.counseling_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    description TEXT,
    session_type TEXT NOT NULL DEFAULT 'one_on_one' CHECK (session_type IN ('one_on_one', 'group')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'rejected')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    rejection_reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_participants table for students in sessions
CREATE TABLE public.session_participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.counseling_sessions(id) ON DELETE CASCADE,
    student_external_id TEXT NOT NULL,
    participation_status TEXT DEFAULT 'invited' CHECK (participation_status IN ('invited', 'confirmed', 'attended', 'absent')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraint to meeting_logs after sessions table exists
ALTER TABLE public.meeting_logs 
ADD CONSTRAINT fk_meeting_logs_session 
FOREIGN KEY (session_id) REFERENCES public.counseling_sessions(id) ON DELETE CASCADE;

-- Now add foreign key constraint to goals table
ALTER TABLE public.goals 
ADD CONSTRAINT fk_goals_session 
FOREIGN KEY (session_id) REFERENCES public.counseling_sessions(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_meeting_logs_session_id ON public.meeting_logs(session_id);
CREATE INDEX idx_counseling_sessions_date ON public.counseling_sessions(session_date);
CREATE INDEX idx_counseling_sessions_status ON public.counseling_sessions(status);
CREATE INDEX idx_counseling_sessions_created_by ON public.counseling_sessions(created_by);
CREATE INDEX idx_session_participants_session_id ON public.session_participants(session_id);
CREATE INDEX idx_session_participants_student_id ON public.session_participants(student_external_id);

-- Enable RLS
ALTER TABLE public.meeting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meeting_logs
CREATE POLICY "Users can view meeting logs" ON public.meeting_logs
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create meeting logs" ON public.meeting_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update meeting logs" ON public.meeting_logs
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete meeting logs" ON public.meeting_logs
    FOR DELETE USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- RLS Policies for counseling_sessions
CREATE POLICY "Users can view counseling sessions" ON public.counseling_sessions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create counseling sessions" ON public.counseling_sessions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update counseling sessions" ON public.counseling_sessions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete counseling sessions" ON public.counseling_sessions
    FOR DELETE USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- RLS Policies for session_participants
CREATE POLICY "Users can view session participants" ON public.session_participants
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage session participants" ON public.session_participants
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Create triggers for updated_at
CREATE TRIGGER update_meeting_logs_updated_at
    BEFORE UPDATE ON public.meeting_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counseling_sessions_updated_at
    BEFORE UPDATE ON public.counseling_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();