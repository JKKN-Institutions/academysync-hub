-- Create session feedback table
CREATE TABLE IF NOT EXISTS public.session_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.counseling_sessions(id) ON DELETE CASCADE,
  mentee_external_id TEXT NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  mentor_helpfulness INTEGER NOT NULL CHECK (mentor_helpfulness >= 1 AND mentor_helpfulness <= 5),
  session_effectiveness INTEGER NOT NULL CHECK (session_effectiveness >= 1 AND session_effectiveness <= 5),
  would_recommend BOOLEAN NOT NULL DEFAULT true,
  comments TEXT,
  improvement_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can create feedback" 
ON public.session_feedback 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view feedback" 
ON public.session_feedback 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own feedback" 
ON public.session_feedback 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for updating updated_at
CREATE TRIGGER update_session_feedback_updated_at
BEFORE UPDATE ON public.session_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();