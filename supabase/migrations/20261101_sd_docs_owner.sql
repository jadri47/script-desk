-- (Adrian, 2026-11-01: "B") Team review: every member reads every document; only its author writes or deletes it.
-- Adrian reads Juan's episodes and leaves notes (collection `notas`, his own rows); Juan's script is never written by Adrian.
-- Applied to project vuvwoxjlmoegstpalngx with the Supabase tool when sd_docs had 0 rows (no data moved).

alter table public.sd_docs add column if not exists owner uuid;
alter table public.sd_docs add column if not exists owner_email text;

-- The owner comes from the signed-in session, never from the client body.
create or replace function public.sd_docs_stamp() returns trigger
language plpgsql set search_path to '' as $$
begin
  if tg_op = 'INSERT' then
    new.owner := auth.uid();
    new.owner_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  else
    new.owner := old.owner;
    new.owner_email := old.owner_email;
  end if;
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists sd_docs_stamp on public.sd_docs;
create trigger sd_docs_stamp before insert or update on public.sd_docs
  for each row execute function public.sd_docs_stamp();

drop policy if exists "sd_docs: members insert" on public.sd_docs;
drop policy if exists "sd_docs: members update" on public.sd_docs;
drop policy if exists "sd_docs: members delete" on public.sd_docs;

create policy "sd_docs: members insert own" on public.sd_docs for insert to authenticated
  with check ((select public.sd_is_member()) and owner = (select auth.uid()));
create policy "sd_docs: author update" on public.sd_docs for update to authenticated
  using ((select public.sd_is_member()) and owner = (select auth.uid()))
  with check ((select public.sd_is_member()) and owner = (select auth.uid()));
create policy "sd_docs: author delete" on public.sd_docs for delete to authenticated
  using ((select public.sd_is_member()) and owner = (select auth.uid()));
-- "sd_docs: members read" (select, any member) is unchanged.
