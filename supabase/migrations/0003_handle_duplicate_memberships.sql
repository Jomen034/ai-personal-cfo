create or replace function create_household(household_name text, member_name text, new_invite_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_membership household_members;
  new_household households;
begin
  if auth.uid() is null then
    raise exception 'Anda harus masuk terlebih dahulu';
  end if;

  select * into existing_membership
  from household_members
  where auth_user_id = auth.uid() and is_active = true
  order by created_at desc
  limit 1;

  if found then
    return json_build_object('household_id', existing_membership.household_id, 'already_exists', true);
  end if;

  insert into households (name, invite_code)
  values (trim(household_name), upper(trim(new_invite_code)))
  returning * into new_household;

  insert into household_members (household_id, auth_user_id, display_name, role)
  values (new_household.id, auth.uid(), trim(member_name), 'admin');

  return json_build_object('household_id', new_household.id, 'invite_code', new_household.invite_code, 'already_exists', false);
end;
$$;