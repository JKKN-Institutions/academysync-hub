-- Create an enum for application roles
create type public.app_role as enum ('admin', 'mentor', 'mentee', 'dept_lead', 'super_admin');

-- Create the user_roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique (user_id, role)
);

-- Enable Row-Level Security
alter table public.user_roles enable row level security;

-- Create a security definer function to check roles (bypasses RLS)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Function to get user roles
create or replace function public.get_user_roles(_user_id uuid)
returns table(role app_role)
language sql
stable
security definer
set search_path = public
as $$
  select ur.role
  from public.user_roles ur
  where ur.user_id = _user_id
$$;

-- RLS Policies for user_roles table
create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'super_admin'));

create policy "Super admins can manage all roles"
on public.user_roles
for all
to authenticated
using (public.has_role(auth.uid(), 'super_admin'));

create policy "Admins can manage non-admin roles"
on public.user_roles
for all
to authenticated
using (
  public.has_role(auth.uid(), 'admin') 
  and role != 'super_admin'
  and role != 'admin'
);

-- Create trigger for updated_at
create trigger update_user_roles_updated_at
before update on public.user_roles
for each row
execute function public.update_updated_at_column();

-- Create indexes for performance
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role);