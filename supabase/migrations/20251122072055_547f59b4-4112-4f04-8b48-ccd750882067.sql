-- Update handle_new_user function to capture game UID and type from signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, mobile_number, game_uid, game_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', new.phone),
    new.raw_user_meta_data->>'game_uid',
    new.raw_user_meta_data->>'game_type'
  );
  
  -- Assign default 'user' role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;
  
  return new;
end;
$$;

-- Create function to assign admin role to specific email
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