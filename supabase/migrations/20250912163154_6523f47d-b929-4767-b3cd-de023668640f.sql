-- Fix search path security for the functions we just created
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create or replace function public.get_user_roles(_user_id uuid)
returns table(role app_role)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select ur.role
  from public.user_roles ur
  where ur.user_id = _user_id
$$;