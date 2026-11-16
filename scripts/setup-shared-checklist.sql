-- Run once in the dedicated travel project with the Data API enabled.
-- Public clients can read the listed rows and change only their checked flag.
begin;

create table public.trip_checklist (
  task_id text primary key,
  checked boolean not null
);
alter table public.trip_checklist enable row level security;
revoke all on table public.trip_checklist from public, anon, authenticated;
grant select on table public.trip_checklist to anon;
grant update (checked) on table public.trip_checklist to anon;
create policy trip_checklist_public_read on public.trip_checklist for select to anon using (true);
create policy trip_checklist_public_update on public.trip_checklist for update to anon using (true) with check (true);

insert into public.trip_checklist (task_id, checked) values
  ('bookings', true), ('k5', true), ('sunrise', true), ('orchids', true),
  ('esta', false), ('transfer', false), ('molokini', true), ('jeep', true),
  ('maunakea', false), ('oahu-day-rental', true), ('diamond-head-entry', false),
  ('hanauma', false), ('photo', true), ('diamond', true), ('email', true),
  ('email-kalai', false), ('credit', false), ('entry', false), ('taxi', false),
  ('insurance', false), ('license', false), ('sim', false), ('gear', false),
  ('offline', false), ('cancel', false);

create function public.save_trip_checklist(changes jsonb)
returns setof public.trip_checklist
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item_count integer;
  applied integer;
begin
  item_count := jsonb_array_length(changes);
  if item_count is null or item_count < 1 or item_count > 100 then
    raise exception 'Invalid checklist changes' using errcode = '22023';
  end if;
  update public.trip_checklist as item
    set checked = patch.checked
    from jsonb_to_recordset(changes) as patch(task_id text, checked boolean)
    where item.task_id = patch.task_id and patch.checked is not null;
  get diagnostics applied = row_count;
  if applied <> item_count then
    raise exception 'Invalid or duplicate checklist item' using errcode = '22023';
  end if;
  return query select * from public.trip_checklist;
end;
$$;
revoke all on function public.save_trip_checklist(jsonb) from public, anon, authenticated;
grant execute on function public.save_trip_checklist(jsonb) to anon;

commit;
