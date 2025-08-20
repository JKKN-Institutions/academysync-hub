-- Update the audit_logs action check constraint to include 'role_change'
ALTER TABLE public.audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_action_check;

ALTER TABLE public.audit_logs 
ADD CONSTRAINT audit_logs_action_check 
CHECK (action = ANY (ARRAY['create'::text, 'update'::text, 'delete'::text, 'assign'::text, 'unassign'::text, 'role_change'::text]));