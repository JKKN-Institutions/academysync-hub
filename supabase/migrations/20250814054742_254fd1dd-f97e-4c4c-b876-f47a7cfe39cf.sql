-- Create mentor feedback table for detailed feedback before session completion
CREATE TABLE public.mentor_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  mentor_external_id TEXT NOT NULL,
  -- Session assessment fields
  session_quality_rating INTEGER NOT NULL CHECK (session_quality_rating >= 1 AND session_quality_rating <= 5),
  student_engagement_rating INTEGER NOT NULL CHECK (student_engagement_rating >= 1 AND student_engagement_rating <= 5),
  goals_achieved_rating INTEGER NOT NULL CHECK (goals_achieved_rating >= 1 AND goals_achieved_rating <= 5),
  -- Progress assessment
  student_progress_notes TEXT NOT NULL,
  key_outcomes TEXT,
  challenges_faced TEXT,
  next_steps_recommended TEXT NOT NULL,
  -- Follow-up planning
  follow_up_required BOOLEAN NOT NULL DEFAULT false,
  follow_up_timeline TEXT,
  additional_support_needed TEXT,
  -- Mentor reflection
  mentor_reflection TEXT,
  improvement_areas TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add cancellation reason to counseling_sessions if not exists
ALTER TABLE public.counseling_sessions 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Enable RLS
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for mentor feedback
CREATE POLICY "Authenticated users can create mentor feedback" 
ON public.mentor_feedback 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view mentor feedback" 
ON public.mentor_feedback 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update mentor feedback" 
ON public.mentor_feedback 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_mentor_feedback_updated_at
BEFORE UPDATE ON public.mentor_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();