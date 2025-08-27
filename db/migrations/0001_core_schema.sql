-- 0001_core_schema.sql
-- Portable Postgres core schema (no Supabase-specific RLS).

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- =======================================
-- APPLICATIONS
-- =======================================
create table if not exists public.applications (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    owner_user_id uuid,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- =======================================
-- ENTITIES
-- =======================================
create table if not exists public.entities (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.applications(id) on delete cascade,
    name text not null,
    label text,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (application_id, name)
);

-- =======================================
-- FIELDS
-- =======================================
create table if not exists public.fields (
    id uuid primary key default gen_random_uuid(),
    entity_id uuid not null references public.entities(id) on delete cascade,
    name text not null,
    label text,
    field_type text not null,          -- string, number, boolean, date, relation, etc.
    required boolean default false,
    default_value text,
    relation_entity uuid references public.entities(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (entity_id, name)
);

-- =======================================
-- FORMS
-- =======================================
create table if not exists public.forms (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.applications(id) on delete cascade,
    entity_id uuid not null references public.entities(id) on delete cascade,
    name text not null,
    label text,
    form_type text not null,           -- create, edit, view, list
    layout_json jsonb not null,        -- UI layout structure
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (entity_id, name)
);

-- =======================================
-- WORKFLOWS
-- =======================================
create table if not exists public.workflows (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.applications(id) on delete cascade,
    entity_id uuid not null references public.entities(id) on delete cascade,
    name text not null,
    description text,
    trigger_event text not null,       -- on_create, on_update, on_delete
    condition_json jsonb,
    action_json jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (entity_id, name)
);

-- =======================================
-- SECURITY: ROLES / USERS / PERMISSIONS
-- =======================================
create table if not exists public.roles (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    parent_role_id uuid references public.roles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    email text unique,
    display_name text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    role_id uuid not null references public.roles(id) on delete cascade,
    created_at timestamptz default now(),
    unique (user_id, role_id)
);

create table if not exists public.entity_permissions (
    id uuid primary key default gen_random_uuid(),
    role_id uuid not null references public.roles(id) on delete cascade,
    entity_id uuid not null references public.entities(id) on delete cascade,
    can_create boolean default false,
    can_read boolean default false,
    can_update boolean default false,
    can_delete boolean default false,
    row_filter_json jsonb,             -- e.g. {"field":"owner_id","op":"=","value":"auth.uid()"}
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (role_id, entity_id)
);

create table if not exists public.field_permissions (
    id uuid primary key default gen_random_uuid(),
    role_id uuid not null references public.roles(id) on delete cascade,
    field_id uuid not null references public.fields(id) on delete cascade,
    can_read boolean default false,
    can_update boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (role_id, field_id)
);

-- =======================================
-- TIMESTAMP TRIGGER
-- =======================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_updated_at_applications before update on public.applications
for each row execute procedure public.set_updated_at();
create trigger trg_updated_at_entities before update on public.entities
for each row execute procedure public.set_updated_at();
create trigger trg_updated_at_fields before update on public.fields
for each row execute procedure public.set_updated_at();
create trigger trg_updated_at_forms before update on public.forms
for each row execute procedure public.set_updated_at();
create trigger trg_updated_at_workflows before update on public.workflows
for each row execute procedure public.set_updated_at();
create trigger trg_updated_at_roles before update on public.roles
for each row execute procedure public.set_updated_at();
create trigger trg_updated_at_users before update on public.users
for each row execute procedure public.set_updated_at();
create trigger trg_updated_at_entity_permissions before update on public.entity_permissions
for each row execute procedure public.set_updated_at();
create trigger trg_updated_at_field_permissions before update on public.field_permissions
for each row execute procedure public.set_updated_at();
