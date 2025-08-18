-- Insert sample staff data for testing the sync functionality
INSERT INTO staff (staff_id, name, email, department, designation, mobile, status) VALUES
('STF001', 'Dr. Sarah Johnson', 'sarah.johnson@jkkn.ac.in', 'Computer Science', 'Professor', '+91 9876543210', 'active'),
('STF002', 'Prof. Michael Chen', 'michael.chen@jkkn.ac.in', 'Engineering', 'Associate Professor', '+91 9876543211', 'active'),
('STF003', 'Dr. Priya Sharma', 'priya.sharma@jkkn.ac.in', 'Business Administration', 'Assistant Professor', '+91 9876543212', 'active'),
('STF004', 'Mr. Rajesh Kumar', 'rajesh.kumar@jkkn.ac.in', 'Web Development', 'Faculty', '+91 9876543213', 'active'),
('STF005', 'Dr. Meera Iyer', 'meera.iyer@jkkn.ac.in', 'Computer Science', 'Head of Department', '+91 9876543214', 'active'),
('STF006', 'Ms. Kavitha Reddy', 'kavitha.reddy@jkkn.ac.in', 'Student Affairs', 'Administrator', '+91 9876543215', 'active'),
('STF007', 'Prof. Amit Gupta', 'amit.gupta@jkkn.ac.in', 'Data Science', 'Associate Professor', '+91 9876543216', 'active'),
('STF008', 'Dr. Sneha Patel', 'sneha.patel@jkkn.ac.in', 'Mathematics', 'Professor', '+91 9876543217', 'active'),
('STF009', 'Mr. Karthik Nair', 'karthik.nair@jkkn.ac.in', 'Placement Cell', 'Director', '+91 9876543218', 'active'),
('STF010', 'Ms. Deepa Krishnan', 'deepa.krishnan@jkkn.ac.in', 'Counseling', 'Faculty', '+91 9876543219', 'active')
ON CONFLICT (staff_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  department = EXCLUDED.department,
  designation = EXCLUDED.designation,
  mobile = EXCLUDED.mobile,
  status = EXCLUDED.status,
  updated_at = now();