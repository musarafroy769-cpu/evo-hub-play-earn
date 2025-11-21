-- Create enum for user roles
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create user_roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone default now(),
    unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
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

-- RLS Policies for user_roles table
create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage all roles"
on public.user_roles
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Function to assign admin role to specific email
create or replace function public.assign_admin_role()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_user_id uuid;
begin
  -- Get user ID for the admin email
  select id into admin_user_id
  from auth.users
  where email = 'musarafroy769@gmail.com';
  
  -- Insert admin role if user exists and doesn't already have it
  if admin_user_id is not null then
    insert into public.user_roles (user_id, role)
    values (admin_user_id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
end;
$$;

-- Execute the function to assign admin role
select public.assign_admin_role();