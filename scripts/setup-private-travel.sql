begin;
create schema if not exists travel_private;
revoke all on schema travel_private from public, anon;
grant usage on schema travel_private to authenticated;

-- auth.identities is maintained by Supabase Auth, never by browser metadata.
create or replace function travel_private.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from auth.identities
    where user_id = auth.uid() and provider = 'github' and provider_id = '330951298'
  );
$$;
revoke all on function travel_private.is_owner() from public, anon;
grant execute on function travel_private.is_owner() to authenticated;
create or replace function public.travel_owner() returns boolean
language sql stable security invoker set search_path = '' as $$
  select travel_private.is_owner();
$$;
revoke all on function public.travel_owner() from public, anon;
grant execute on function public.travel_owner() to authenticated;

create table public.travel_expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null default '',
  subcategory text not null check (length(trim(subcategory)) between 1 and 200),
  vendor text not null default '',
  direction text not null default '지출' check (direction in ('지출','수입')),
  amount numeric(15,2) check (amount >= 0),
  currency text not null default 'KRW' check (currency in ('KRW','USD')),
  payer text not null default '',
  payment_method text not null default '',
  payment_plan text not null default '확인 필요' check (payment_plan in ('확인 필요','현지 현금','현지 카드','현지 결제 · 수단 확인','사전·온라인 결제')),
  payment_date text not null default '',
  status text not null default '예정' check (status in ('예정','결제 완료','취소')),
  memo text not null default '',
  sort_order integer not null default 1000,
  source_key text unique,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create table public.travel_documents (
  id uuid primary key default gen_random_uuid(),
  booking_key text not null check (length(booking_key) between 1 and 100),
  title text not null check (length(trim(title)) between 1 and 200),
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp','application/pdf')),
  file_size integer not null check (file_size > 0 and file_size <= 20971520),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
alter table public.travel_expenses enable row level security;
alter table public.travel_documents enable row level security;
revoke all on public.travel_expenses, public.travel_documents from public, anon, authenticated;
grant select, insert, update on public.travel_expenses, public.travel_documents to authenticated;
create policy owner_expenses_select on public.travel_expenses for select to authenticated using ((select travel_private.is_owner()));
create policy owner_expenses_insert on public.travel_expenses for insert to authenticated with check ((select travel_private.is_owner()));
create policy owner_expenses_update on public.travel_expenses for update to authenticated using ((select travel_private.is_owner())) with check ((select travel_private.is_owner()));
create policy owner_documents_select on public.travel_documents for select to authenticated using ((select travel_private.is_owner()));
create policy owner_documents_insert on public.travel_documents for insert to authenticated with check ((select travel_private.is_owner()));
create policy owner_documents_update on public.travel_documents for update to authenticated using ((select travel_private.is_owner())) with check ((select travel_private.is_owner()));

create function travel_private.expense_revision() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function travel_private.expense_revision() from public, anon;
create trigger expense_revision before update on public.travel_expenses
for each row execute function travel_private.expense_revision();

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('travel-private','travel-private',false,20971520,array['image/png','image/jpeg','image/webp','application/pdf']);
create policy travel_owner_files_select on storage.objects for select to authenticated using (bucket_id='travel-private' and (select travel_private.is_owner()));
create policy travel_owner_files_insert on storage.objects for insert to authenticated with check (bucket_id='travel-private' and (select travel_private.is_owner()));
create policy travel_owner_files_update on storage.objects for update to authenticated using (bucket_id='travel-private' and (select travel_private.is_owner())) with check (bucket_id='travel-private' and (select travel_private.is_owner()));
create policy travel_owner_files_delete on storage.objects for delete to authenticated using (bucket_id='travel-private' and (select travel_private.is_owner()));
commit;
