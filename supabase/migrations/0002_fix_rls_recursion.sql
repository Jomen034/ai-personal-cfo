create or replace function get_active_household_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id
  from household_members
  where auth_user_id = auth.uid() and is_active = true;
$$;

revoke all on function get_active_household_ids() from public;
grant execute on function get_active_household_ids() to authenticated;

drop policy if exists "select own household" on households;
drop policy if exists "select own household members" on household_members;
drop policy if exists "select own household accounts" on accounts;
drop policy if exists "modify own household accounts" on accounts;
drop policy if exists "select categories" on categories;
drop policy if exists "select own household transactions" on transactions;
drop policy if exists "modify own household transactions" on transactions;

create policy "select own household" on households for select
  using (id in (select get_active_household_ids()));

create policy "select own household members" on household_members for select
  using (household_id in (select get_active_household_ids()));

create policy "select own household accounts" on accounts for select
  using (household_id in (select get_active_household_ids()));
create policy "modify own household accounts" on accounts for all
  using (household_id in (select get_active_household_ids()))
  with check (household_id in (select get_active_household_ids()));

create policy "select categories" on categories for select
  using (household_id is null or household_id in (select get_active_household_ids()));

create policy "select own household transactions" on transactions for select
  using (household_id in (select get_active_household_ids()));
create policy "modify own household transactions" on transactions for all
  using (household_id in (select get_active_household_ids()))
  with check (household_id in (select get_active_household_ids()));