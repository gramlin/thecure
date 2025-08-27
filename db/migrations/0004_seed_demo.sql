-- 0004_seed_demo.sql
-- Seed demo roles, user, entity, fields, form, workflow.

-- Roles
insert into public.roles (id, name, description)
values (gen_random_uuid(), 'Admin', 'Full access admin role')
on conflict do nothing;

insert into public.roles (id, name, description)
values (gen_random_uuid(), 'Manager', 'Manager role')
on conflict do nothing;

insert into public.roles (id, name, description)
values (gen_random_uuid(), 'Agent', 'Agent role')
on conflict do nothing;

-- Demo user (dummy UUID, replace with actual Supabase user id later if desired)
insert into public.users (id, email, display_name)
values (gen_random_uuid(), 'demo@example.com', 'Demo User')
on conflict do nothing;

-- Link demo user to Agent role
insert into public.user_roles (user_id, role_id)
select u.id, r.id from public.users u, public.roles r
where u.email = 'demo@example.com' and r.name = 'Agent'
on conflict do nothing;

-- Demo application
insert into public.applications (id, name, description)
values (gen_random_uuid(), 'Helpdesk', 'Demo helpdesk app with tickets')
on conflict do nothing;

-- Demo entity: tickets
insert into public.entities (id, application_id, name, label, description)
select gen_random_uuid(), a.id, 'tickets', 'Tickets', 'Support tickets'
from public.applications a
where a.name = 'Helpdesk'
on conflict do nothing;

-- Demo fields for tickets
insert into public.fields (id, entity_id, name, label, field_type, required)
select gen_random_uuid(), e.id, 'title', 'Title', 'string', true
from public.entities e where e.name = 'tickets'
on conflict do nothing;

insert into public.fields (id, entity_id, name, label, field_type)
select gen_random_uuid(), e.id, 'description', 'Description', 'textarea'
from public.entities e where e.name = 'tickets'
on conflict do nothing;

insert into public.fields (id, entity_id, name, label, field_type)
select gen_random_uuid(), e.id, 'status', 'Status', 'string'
from public.entities e where e.name = 'tickets'
on conflict do nothing;

insert into public.fields (id, entity_id, name, label, field_type)
select gen_random_uuid(), e.id, 'created_by', 'Created By', 'uuid'
from public.entities e where e.name = 'tickets'
on conflict do nothing;

-- Demo form layout
insert into public.forms (id, application_id, entity_id, name, label, form_type, layout_json)
select gen_random_uuid(), a.id, e.id, 'ticket_form', 'Ticket Form', 'create',
       '{
          "sections":[
            {"title":"Ticket Info","fields":["title","description","status"]}
          ]
        }'::jsonb
from public.applications a
join public.entities e on e.application_id = a.id
where a.name = 'Helpdesk' and e.name = 'tickets'
on conflict do nothing;

-- Demo workflow (on_create -> set status open)
insert into public.workflows (id, application_id, entity_id, name, description, trigger_event, condition_json, action_json)
select gen_random_uuid(), a.id, e.id, 'ticket_on_create', 'Set ticket status to open on create', 'on_create',
       null,
       '[{"action":"set_field","field":"status","value":"open"}]'::jsonb
from public.applications a
join public.entities e on e.application_id = a.id
where a.name = 'Helpdesk' and e.name = 'tickets'
on conflict do nothing;
