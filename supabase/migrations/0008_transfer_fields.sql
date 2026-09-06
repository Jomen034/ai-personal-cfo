alter table transactions
  add column if not exists destination_account_id uuid references accounts(id) on delete set null,
  add column if not exists transfer_type text check (transfer_type in ('internal','external'));

create index if not exists idx_transactions_destination_account on transactions(destination_account_id);
