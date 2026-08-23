drop function if exists create_household(text, text, text);
drop function if exists join_household_by_invite(text, text);

create or replace function account_display_name()
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select split_part(email, '@', 1)
  from auth.users
  where id = auth.uid();
$$;

revoke all on function account_display_name() from public;
grant execute on function account_display_name() to authenticated;

create or replace function join_household_by_invite(join_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household households;
  active_count integer;
  new_member household_members;
begin
  if auth.uid() is null then
    raise exception 'Anda harus masuk terlebih dahulu';
  end if;
  select * into target_household from households where invite_code = upper(trim(join_code));
  if not found then raise exception 'Kode undangan tidak ditemukan'; end if;
  select count(*) into active_count from household_members where household_id = target_household.id and is_active = true;
  if active_count >= 2 then raise exception 'Household ini sudah penuh (maksimal 2 pengelola)'; end if;
  insert into household_members (household_id, auth_user_id, display_name, role)
  values (target_household.id, auth.uid(), account_display_name(), 'partner') returning * into new_member;
  return json_build_object('household_id', target_household.id, 'member_id', new_member.id);
exception when unique_violation then
  raise exception 'Akun ini sudah terhubung ke household tersebut';
end;
$$;

revoke all on function join_household_by_invite(text) from public;
grant execute on function join_household_by_invite(text) to authenticated;

create or replace function create_household(household_name text, new_invite_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_membership household_members;
  new_household households;
begin
  if auth.uid() is null then raise exception 'Anda harus masuk terlebih dahulu'; end if;
  select * into existing_membership from household_members
  where auth_user_id = auth.uid() and is_active = true order by created_at desc limit 1;
  if found then return json_build_object('household_id', existing_membership.household_id, 'already_exists', true); end if;
  insert into households (name, invite_code) values (trim(household_name), upper(trim(new_invite_code))) returning * into new_household;
  insert into household_members (household_id, auth_user_id, display_name, role)
  values (new_household.id, auth.uid(), account_display_name(), 'admin');
  return json_build_object('household_id', new_household.id, 'invite_code', new_household.invite_code, 'already_exists', false);
end;
$$;

revoke all on function create_household(text, text) from public;
grant execute on function create_household(text, text) to authenticated;