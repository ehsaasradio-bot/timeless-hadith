-- ─────────────────────────────────────────────────────────────
-- Timeless Hadith — Reading Dashboard Tables
-- Run in Supabase SQL Editor. Idempotent.
-- ─────────────────────────────────────────────────────────────

-- 1. reading_log ------------------------------------------------
create table if not exists public.reading_log (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  hadith_id  bigint not null,
  read_at    timestamptz not null default now()
);

create index if not exists reading_log_user_idx    on public.reading_log (user_id);
create index if not exists reading_log_date_idx    on public.reading_log (user_id, read_at desc);
create index if not exists reading_log_hadith_idx  on public.reading_log (hadith_id);

-- 2. reading_goals ---------------------------------------------
create table if not exists public.reading_goals (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  daily_target int not null default 5 check (daily_target between 1 and 100),
  updated_at   timestamptz not null default now()
);

-- 3. RLS — users can only touch their own rows -----------------
alter table public.reading_log   enable row level security;
alter table public.reading_goals enable row level security;

drop policy if exists "own reading_log"   on public.reading_log;
drop policy if exists "own reading_goals" on public.reading_goals;

create policy "own reading_log"
  on public.reading_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own reading_goals"
  on public.reading_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
