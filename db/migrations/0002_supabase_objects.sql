-- 0002_supabase_objects.sql
-- Supabase wiring: auth sync, RLS-enabled permission views and stubs.

create extension if not exists pgcrypto;

-- Link auth.users to public.users
alter table public.users
  add column if not exists supabase_uid uuid unique;

create or replace function public.handle_new_supabase_user()
returns trigger as $$
begin
  insert into public.users (id, supabase_uid, email, display_name)
  values (gen_random_uuid(), new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (supabase_uid) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_supabase_user();

-- Expanded roles for CURRENT user (via auth.uid())
create or replace view public.current_user_roles as
with recursive role_hierarchy as (
  select ur.user_id, r.id as role_id, r.parent_role_id
  from public.user_roles ur
  join public.users u on ur.user_id = u.id
  join public.roles r on ur.role_id = r.id
  where u.supabase_uid = auth.uid()
  union
  select rh.user_id, pr.id as role_id, pr.parent_role_id
  from role_hierarchy rh
  join public.roles pr on rh.parent_role_id = pr.id
)
select distinct user_id, role_id from role_hierarchy;

-- Effective entity permissions for CURRENT user
create or replace view public.current_user_entity_permissions as
select
  ure.user_id,
  e.id   as entity_id,
  e.name as entity_name,
  bool_or(ep.can_create) as can_create,
  bool_or(ep.can_read)   as can_read,
  bool_or(ep.can_update) as can_update,
  bool_or(ep.can_delete) as can_delete,
  array_remove(array_agg(ep.row_filter_json), null)::jsonb[] as row_filters
from public.current_user_roles ure
join public.entity_permissions ep on ure.role_id = ep.role_id
join public.entities e on ep.entity_id = e.id
group by ure.user_id, e.id, e.name;

-- Effective field permissions for CURRENT user
create or replace view public.current_user_field_permissions as
select
  ure.user_id,
  f.id   as field_id,
  f.name as field_name,
  e.id   as entity_id,
  e.name as entity_name,
  bool_or(fp.can_read)   as can_read,
  bool_or(fp.can_update) as can_update
from public.current_user_roles ure
join public.field_permissions fp on ure.role_id = fp.role_id
join public.fields f on fp.field_id = f.id
join public.entities e on f.entity_id = e.id
group by ure.user_id, f.id, f.name, e.id, e.name;

-- Enable RLS on core security tables
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.entity_permissions enable row level security;
alter table public.field_permissions enable row level security;

-- Basic policies
drop policy if exists "users see their user_roles" on public.user_roles;
create policy "users see their user_roles"
on public.user_roles
for select
using (
  exists (
    select 1 from public.users u
    where u.id = public.user_roles.user_id
      and u.supabase_uid = auth.uid()
  )
);

-- Example admin policy (adjust as needed)
drop policy if exists "admins manage roles" on public.roles;
create policy "admins manage roles"
on public.roles
for all
using (
  exists (
    select 1
    from public.current_user_roles cur
    join public.roles r on cur.role_id = r.id
    where r.name = 'Admin'
  )
);
