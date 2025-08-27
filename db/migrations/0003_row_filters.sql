-- 0003_row_filters.sql
-- Row filter evaluator + demo policies.

-- Evaluate array of JSONB filter objects against a row (as jsonb).
-- Supported:
--  ops: =, !=, in, not_in, >, <, between
--  logic: and/or with structure: {"and":[...]} or {"or":[...]}

create or replace function public.check_row_filter(row_data jsonb, filters jsonb[])
returns boolean as $$
declare
  f jsonb;
  ok boolean := true;
  val text;
  lhs text;
  op text;
begin
  if filters is null then
    return true;
  end if;

  foreach f in array filters loop
    -- Composite logic
    if f ? 'and' then
      if not public.check_row_filter(row_data, array(select jsonb_array_elements(f->'and'))) then
        return false;
      end if;
      continue;
    elsif f ? 'or' then
      -- at least one must pass
      ok := false;
      for f in select jsonb_array_elements(f->'or') loop
        if public.check_row_filter(row_data, array[f]) then
          ok := true; exit;
        end if;
      end loop;
      if not ok then return false; end if;
      continue;
    end if;

    lhs := row_data->>(f->>'field');
    op := f->>'op';

    if f->>'value' = 'auth.uid()' then
      val := auth.uid()::text;
    else
      val := f->>'value';
    end if;

    if op = '=' then
      if lhs is null or lhs <> val then return false; end if;
    elsif op = '!=' then
      if lhs = val then return false; end if;
    elsif op = 'in' then
      if not (lhs = any (select jsonb_array_elements_text(f->'values'))) then return false; end if;
    elsif op = 'not_in' then
      if (lhs = any (select jsonb_array_elements_text(f->'values'))) then return false; end if;
    elsif op = '>' then
      if lhs is null or lhs <= val then return false; end if;
    elsif op = '<' then
      if lhs is null or lhs >= val then return false; end if;
    elsif op = 'between' then
      if lhs is null or not (lhs >= (f->>'min') and lhs <= (f->>'max')) then return false; end if;
    else
      -- unknown op -> deny
      return false;
    end if;
  end loop;

  return true;
end;
$$ language plpgsql stable;

-- Demo runtime table: tickets
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'open',
  created_by uuid not null, -- should match users.supabase_uid for auth.uid() checks
  created_at timestamptz default now()
);

alter table public.tickets enable row level security;

-- Example policies using current_user_entity_permissions + check_row_filter
-- For demo we key by entity_name = 'tickets' (in your production, key by entity_id).
drop policy if exists "tickets_select_policy" on public.tickets;
create policy "tickets_select_policy" on public.tickets
for select using (
  exists (
    select 1
    from public.current_user_entity_permissions cuep
    where cuep.entity_name = 'tickets'
      and cuep.can_read = true
      and public.check_row_filter(to_jsonb(public.tickets), cuep.row_filters)
  )
);

drop policy if exists "tickets_insert_policy" on public.tickets;
create policy "tickets_insert_policy" on public.tickets
for insert with check (
  exists (
    select 1
    from public.current_user_entity_permissions cuep
    where cuep.entity_name = 'tickets'
      and cuep.can_create = true
  )
);

drop policy if exists "tickets_update_policy" on public.tickets;
create policy "tickets_update_policy" on public.tickets
for update using (
  exists (
    select 1
    from public.current_user_entity_permissions cuep
    where cuep.entity_name = 'tickets'
      and cuep.can_update = true
      and public.check_row_filter(to_jsonb(public.tickets), cuep.row_filters)
  )
);

drop policy if exists "tickets_delete_policy" on public.tickets;
create policy "tickets_delete_policy" on public.tickets
for delete using (
  exists (
    select 1
    from public.current_user_entity_permissions cuep
    where cuep.entity_name = 'tickets'
      and cuep.can_delete = true
      and public.check_row_filter(to_jsonb(public.tickets), cuep.row_filters)
  )
);
