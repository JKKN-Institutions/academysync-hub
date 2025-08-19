-- Insert Dr. Deepak as a staff member
INSERT INTO public.staff (staff_id, name, email, department, designation, status)
VALUES ('DR001', 'Dr. Deepak', 'drerdeepak@jkkn.ac.in', 'General', 'Doctor', 'active');

-- Get the staff record ID for the user profile
INSERT INTO public.user_profiles (
  user_id, 
  display_name, 
  role, 
  external_id, 
  staff_id, 
  department, 
  designation,
  institution
)
SELECT 
  gen_random_uuid(),
  'Dr. Deepak',
  'mentor',
  'DR001',
  'DR001',
  'General',
  'Doctor',
  'JKKN'
FROM public.staff 
WHERE email = 'drerdeepak@jkkn.ac.in'
LIMIT 1;