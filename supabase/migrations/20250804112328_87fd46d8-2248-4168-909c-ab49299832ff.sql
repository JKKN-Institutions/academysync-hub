-- Fix function search path security warnings
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.get_current_user_role() SET search_path = '';