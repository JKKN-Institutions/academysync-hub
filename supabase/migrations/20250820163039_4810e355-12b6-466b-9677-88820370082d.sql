-- Fix audit_logs action constraint issue
-- First, let's check what constraint exists and remove/update it

-- Drop the existing constraint if it exists
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;

-- Create a more flexible constraint that allows the actions we need
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_action_check 
CHECK (action IN ('create', 'update', 'delete', 'insert', 'role_change', 'login', 'logout', 'signin', 'signup', 'password_change', 'profile_update', 'data_sync', 'assignment_create', 'assignment_update', 'session_create', 'session_update', 'goal_create', 'goal_update'));