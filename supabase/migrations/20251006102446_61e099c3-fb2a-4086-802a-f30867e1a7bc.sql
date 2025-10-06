-- Update counseling sessions insert policy to restrict to admin, mentor, and super_admin only
DROP POLICY IF EXISTS "Super admins and institution users can create sessions" ON public.counseling_sessions;

CREATE POLICY "Only admins, mentors, and super_admins can create sessions" 
ON public.counseling_sessions
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) 
  = ANY (ARRAY['admin'::text, 'mentor'::text, 'super_admin'::text])
);