alter table transactions
  add column if not exists raw_input text,
  add column if not exists parsed_confidence numeric(3,2),
  add column if not exists reviewed_flag boolean default false;

create index if not exists idx_transactions_raw_input on transactions(raw_input);
