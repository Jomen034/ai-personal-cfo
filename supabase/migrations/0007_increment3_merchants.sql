create table merchants (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  default_category_id uuid references categories(id),
  aliases text[],
  created_at timestamptz default now()
);

create index idx_merchants_household on merchants(household_id);
create index idx_merchants_name on merchants(name);

alter table merchants enable row level security;

create policy "select merchants" on merchants for select
  using (household_id is null or household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

create policy "modify own household merchants" on merchants for all
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

-- Seed global merchant dictionary (Indonesian market)
insert into merchants (name, default_category_id, aliases, household_id)
values
  ('Indomaret', (select id from categories where name = 'Belanja' and household_id is null limit 1), array['indomaret','indo mart'], null),
  ('Alfamart', (select id from categories where name = 'Belanja' and household_id is null limit 1), array['alfamart','alfa mart'], null),
  ('GoFood', (select id from categories where name = 'Makan & Minum' and household_id is null limit 1), array['gofood','gojek food'], null),
  ('GrabFood', (select id from categories where name = 'Makan & Minum' and household_id is null limit 1), array['grabfood','grab food'], null),
  ('ShopeeFood', (select id from categories where name = 'Makan & Minum' and household_id is null limit 1), array['shopee food','shopeefood'], null),
  ('PLN', (select id from categories where name = 'Tagihan' and household_id is null limit 1), array['pln','listrik'], null),
  ('PDAM', (select id from categories where name = 'Tagihan' and household_id is null limit 1), array['pdam','air'], null),
  ('Indihome', (select id from categories where name = 'Tagihan' and household_id is null limit 1), array['indihome','wifi','internet'], null),
  ('Telkomsel', (select id from categories where name = 'Tagihan' and household_id is null limit 1), array['telkomsel','pulsa','telpon'], null),
  ('Gojek', (select id from categories where name = 'Transportasi' and household_id is null limit 1), array['gojek','ojol'], null),
  ('Grab', (select id from categories where name = 'Transportasi' and household_id is null limit 1), array['grab','taxi'], null),
  ('Tokopedia', (select id from categories where name = 'Belanja' and household_id is null limit 1), array['tokopedia','toped'], null),
  ('Shopee', (select id from categories where name = 'Belanja' and household_id is null limit 1), array['shopee'], null),
  ('Lazada', (select id from categories where name = 'Belanja' and household_id is null limit 1), array['lazada'], null),
  ('Starbucks', (select id from categories where name = 'Makan & Minum' and household_id is null limit 1), array['starbucks'], null),
  ('Kopi Kenangan', (select id from categories where name = 'Makan & Minum' and household_id is null limit 1), array['kopi kenangan','kopikenangan'], null),
  ('McDonalds', (select id from categories where name = 'Makan & Minum' and household_id is null limit 1), array['mcdonalds','mcd','burger'], null),
  ('KFC', (select id from categories where name = 'Makan & Minum' and household_id is null limit 1), array['kfc'], null),
  ('Pizza Hut', (select id from categories where name = 'Makan & Minum' and household_id is null limit 1), array['pizza hut'], null),
  ('BPJS', (select id from categories where name = 'Asuransi' and household_id is null limit 1), array['bpjs','asuransi'], null);
