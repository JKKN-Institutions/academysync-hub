-- Enable Row Level Security on audit_logs table
-- This table has policies but RLS was not enabled, creating a security vulnerability

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;