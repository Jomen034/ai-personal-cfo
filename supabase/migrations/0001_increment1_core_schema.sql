create extension if not exists pgcrypto;

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji_icon text default '🏠',
  invite_code text not null unique,
  created_at timestamptz default now()
);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  auth_user_id uuid not null,
  display_name text not null,
  role text not null default 'partner' check (role in ('admin','partner')),
  is_active boolean not null default true,
  left_at timestamptz,
  created_at timestamptz default now(),
  unique (household_id, auth_user_id)
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('cash','bank_account','digital_wallet','credit_card')),
  current_balance numeric(16,2) not null default 0,
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense')),
  parent_category_id uuid references categories(id),
  icon text,
  is_default boolean not null default false
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  member_id uuid references household_members(id),
  account_id uuid references accounts(id),
  category_id uuid references categories(id),
  transaction_type text not null check (transaction_type in ('income','expense')),
  amount numeric(16,2) not null check (amount > 0),
  transaction_date date not null,
  note text,
  created_at timestamptz default now()
);

create index idx_transactions_household_date on transactions(household_id, transaction_date);

insert into categories (name, type, is_default)
values
  ('Gaji', 'income', true),
  ('Bonus', 'income', true),
  ('Hadiah', 'income', true),
  ('Lainnya', 'income', true),
  ('Makan & Minum', 'expense', true),
  ('Transportasi', 'expense', true),
  ('Tagihan', 'expense', true),
  ('Belanja', 'expense', true),
  ('Kesehatan', 'expense', true),
  ('Hiburan', 'expense', true),
  ('Pendidikan', 'expense', true),
  ('Lainnya', 'expense', true);

alter table households enable row level security;
alter table household_members enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;

create policy "select own household" on households for select
  using (id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

create policy "insert household" on households for insert
  with check (auth.uid() is not null);

create policy "select own household members" on household_members for select
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

create policy "insert self as member" on household_members for insert
  with check (auth_user_id = auth.uid());

create policy "select own household accounts" on accounts for select
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));
create policy "modify own household accounts" on accounts for all
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

create policy "select categories" on categories for select
  using (household_id is null or household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

create policy "select own household transactions" on transactions for select
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));
create policy "modify own household transactions" on transactions for all
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

create or replace function join_household_by_invite(join_code text, member_name text)
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
  if not found then
    raise exception 'Kode undangan tidak ditemukan';
  end if;

  select count(*) into active_count from household_members
  where household_id = target_household.id and is_active = true;
  if active_count >= 2 then
    raise exception 'Household ini sudah penuh (maksimal 2 pengelola)';
  end if;

  insert into household_members (household_id, auth_user_id, display_name, role)
  values (target_household.id, auth.uid(), trim(member_name), 'partner')
  returning * into new_member;

  return json_build_object('household_id', target_household.id, 'member_id', new_member.id);
exception
  when unique_violation then
    raise exception 'Akun ini sudah terhubung ke household tersebut';
end;
$$;

revoke all on function join_household_by_invite(text, text) from public;
grant execute on function join_household_by_invite(text, text) to authenticated;

create or replace function create_household(household_name text, member_name text, new_invite_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household households;
begin
  if auth.uid() is null then
    raise exception 'Anda harus masuk terlebih dahulu';
  end if;
  insert into households (name, invite_code)
  values (trim(household_name), upper(trim(new_invite_code)))
  returning * into new_household;
  insert into household_members (household_id, auth_user_id, display_name, role)
  values (new_household.id, auth.uid(), trim(member_name), 'admin');
  return json_build_object('household_id', new_household.id, 'invite_code', new_household.invite_code);
end;
$$;

revoke all on function create_household(text, text, text) from public;
grant execute on function create_household(text, text, text) to authenticated;