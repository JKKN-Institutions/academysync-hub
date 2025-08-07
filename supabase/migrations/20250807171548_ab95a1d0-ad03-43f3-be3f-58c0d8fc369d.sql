-- Enable realtime for counseling_sessions table
ALTER TABLE public.counseling_sessions REPLICA IDENTITY FULL;

-- Add counseling_sessions to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.counseling_sessions;