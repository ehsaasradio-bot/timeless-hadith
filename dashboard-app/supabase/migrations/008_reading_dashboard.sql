-- 008_reading_dashboard.sql
-- Reading dashboard schema: profiles, progress, sessions, bookmarks, notes,
-- daily goals, achievements, and AI recommendations.
--
-- IMPORTANT: This migration uses `dashboard_*` namespacing for the tables
-- that commonly collide with public-site tables (bookmarks, notes,
-- daily_goals). This keeps the existing `public.bookmarks` and other
-- legacy tables untouched.
--
-- Properties of this migration:
--   * UUID primary keys (gen_random_uuid)
--   * references auth.users(id) on cascade delete
--   * created_at / updated_at (timestamptz, default now())
--   * RLS enabled on every table
--   * per-row policies restricted to the owning user (auth.uid() = user_id)
--   * Idempotent: safe to re-run. Uses CREATE … IF NOT EXISTS and
--     "DROP POLICY IF EXISTS" before each CREATE POLICY.
--   * Does NOT modify or weaken any existing RLS or grants.
--   * Does NOT grant service_role anything new.

-- ---------------------------------------------------------------------------
-- Optional cleanup of a half-applied previous run of this migration.
-- Safe because these table names are dashboard-specific and were introduced
-- by this migration. The CASCADE drops dependent indexes / policies.
-- Comment this block out if you have already populated dashboard_* tables.
-- ---------------------------------------------------------------------------
do $$
begin
  -- Only drop if the previous attempt left these in a partial state.
  -- These three were the ones that hit the "column collection does not exist"
  -- error, so they may have been created without all columns/indexes.
  if exists (select 1 from pg_class where relname = 'dashboard_bookmarks') then
    execute 'drop table if exists public.dashboard_bookmarks cascade';
  end if;
  if exists (select 1 from pg_class where relname = 'dashboard_notes') then
    execute 'drop table if exists public.dashboard_notes cascade';
  end if;
  if exists (select 1 from pg_class where relname = 'dashboard_daily_goals') then
    execute 'drop table if exists public.dashboard_daily_goals cascade';
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Required extension
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1) reading_profiles — one row per user, settings & preferences
-- ---------------------------------------------------------------------------
create table if not exists public.reading_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  display_name    text,
  avatar_url      text,
  preferred_topics text[] not null default '{}',
  daily_goal_minutes integer not null default 15 check (daily_goal_minutes >= 0),
  theme           text not null default 'light' check (theme in ('light', 'dark', 'system')),
  language        text not null default 'en',
  timezone        text not null default 'UTC',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Defensive: if the table existed already without these columns, add them.
alter table public.reading_profiles add column if not exists display_name text;
alter table public.reading_profiles add column if not exists avatar_url text;
alter table public.reading_profiles add column if not exists preferred_topics text[] not null default '{}';
alter table public.reading_profiles add column if not exists daily_goal_minutes integer not null default 15;
alter table public.reading_profiles add column if not exists theme text not null default 'light';
alter table public.reading_profiles add column if not exists language text not null default 'en';
alter table public.reading_profiles add column if not exists timezone text not null default 'UTC';
alter table public.reading_profiles add column if not exists created_at timestamptz not null default now();
alter table public.reading_profiles add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_reading_profiles_user_id
  on public.reading_profiles(user_id);

drop trigger if exists trg_reading_profiles_updated_at on public.reading_profiles;
create trigger trg_reading_profiles_updated_at
  before update on public.reading_profiles
  for each row execute function public.tg_set_updated_at();

alter table public.reading_profiles enable row level security;

drop policy if exists "reading_profiles select own" on public.reading_profiles;
create policy "reading_profiles select own"
  on public.reading_profiles for select using (auth.uid() = user_id);
drop policy if exists "reading_profiles insert own" on public.reading_profiles;
create policy "reading_profiles insert own"
  on public.reading_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "reading_profiles update own" on public.reading_profiles;
create policy "reading_profiles update own"
  on public.reading_profiles for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "reading_profiles delete own" on public.reading_profiles;
create policy "reading_profiles delete own"
  on public.reading_profiles for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2) reading_progress — per (user, collection) progress
-- ---------------------------------------------------------------------------
create table if not exists public.reading_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  collection      text not null,
  hadith_id       text,
  hadith_number   integer,
  status          text not null default 'in_progress'
                    check (status in ('not_started', 'in_progress', 'completed')),
  progress_pct    integer not null default 0 check (progress_pct between 0 and 100),
  last_read_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.reading_progress add column if not exists collection text;
alter table public.reading_progress add column if not exists hadith_id text;
alter table public.reading_progress add column if not exists hadith_number integer;
alter table public.reading_progress add column if not exists status text not null default 'in_progress';
alter table public.reading_progress add column if not exists progress_pct integer not null default 0;
alter table public.reading_progress add column if not exists last_read_at timestamptz;
alter table public.reading_progress add column if not exists created_at timestamptz not null default now();
alter table public.reading_progress add column if not exists updated_at timestamptz not null default now();

-- Add unique (user_id, collection) only when both columns exist and the
-- constraint isn't already there.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reading_progress_user_id_collection_key'
  ) then
    alter table public.reading_progress
      add constraint reading_progress_user_id_collection_key unique (user_id, collection);
  end if;
end$$;

create index if not exists idx_reading_progress_user_id        on public.reading_progress(user_id);
create index if not exists idx_reading_progress_collection     on public.reading_progress(collection);
create index if not exists idx_reading_progress_hadith_id      on public.reading_progress(hadith_id);
create index if not exists idx_reading_progress_user_collection on public.reading_progress(user_id, collection);

drop trigger if exists trg_reading_progress_updated_at on public.reading_progress;
create trigger trg_reading_progress_updated_at
  before update on public.reading_progress
  for each row execute function public.tg_set_updated_at();

alter table public.reading_progress enable row level security;

drop policy if exists "reading_progress select own" on public.reading_progress;
create policy "reading_progress select own"
  on public.reading_progress for select using (auth.uid() = user_id);
drop policy if exists "reading_progress insert own" on public.reading_progress;
create policy "reading_progress insert own"
  on public.reading_progress for insert with check (auth.uid() = user_id);
drop policy if exists "reading_progress update own" on public.reading_progress;
create policy "reading_progress update own"
  on public.reading_progress for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "reading_progress delete own" on public.reading_progress;
create policy "reading_progress delete own"
  on public.reading_progress for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3) reading_sessions — append-only session log, used for analytics charts
-- ---------------------------------------------------------------------------
create table if not exists public.reading_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  collection      text,
  hadith_id       text,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  hadith_count    integer not null default 0 check (hadith_count >= 0),
  created_at      timestamptz not null default now()
);

alter table public.reading_sessions add column if not exists collection text;
alter table public.reading_sessions add column if not exists hadith_id text;
alter table public.reading_sessions add column if not exists started_at timestamptz not null default now();
alter table public.reading_sessions add column if not exists ended_at timestamptz;
alter table public.reading_sessions add column if not exists duration_seconds integer not null default 0;
alter table public.reading_sessions add column if not exists hadith_count integer not null default 0;
alter table public.reading_sessions add column if not exists created_at timestamptz not null default now();

create index if not exists idx_reading_sessions_user_id    on public.reading_sessions(user_id);
create index if not exists idx_reading_sessions_collection on public.reading_sessions(collection);
create index if not exists idx_reading_sessions_hadith_id  on public.reading_sessions(hadith_id);
create index if not exists idx_reading_sessions_started_at on public.reading_sessions(started_at desc);

alter table public.reading_sessions enable row level security;

drop policy if exists "reading_sessions select own" on public.reading_sessions;
create policy "reading_sessions select own"
  on public.reading_sessions for select using (auth.uid() = user_id);
drop policy if exists "reading_sessions insert own" on public.reading_sessions;
create policy "reading_sessions insert own"
  on public.reading_sessions for insert with check (auth.uid() = user_id);
drop policy if exists "reading_sessions update own" on public.reading_sessions;
create policy "reading_sessions update own"
  on public.reading_sessions for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "reading_sessions delete own" on public.reading_sessions;
create policy "reading_sessions delete own"
  on public.reading_sessions for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4) dashboard_bookmarks — RENAMED to avoid collision with the existing
--    public.bookmarks table used by the legacy site/Firebase flow.
-- ---------------------------------------------------------------------------
create table if not exists public.dashboard_bookmarks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  hadith_id       text not null,
  collection      text,
  topic           text,
  notes_excerpt   text,
  created_at      timestamptz not null default now(),
  unique (user_id, hadith_id)
);

create index if not exists idx_dashboard_bookmarks_user_id        on public.dashboard_bookmarks(user_id);
create index if not exists idx_dashboard_bookmarks_hadith_id      on public.dashboard_bookmarks(hadith_id);
create index if not exists idx_dashboard_bookmarks_collection     on public.dashboard_bookmarks(collection);
create index if not exists idx_dashboard_bookmarks_user_collection on public.dashboard_bookmarks(user_id, collection);

alter table public.dashboard_bookmarks enable row level security;

drop policy if exists "dashboard_bookmarks select own" on public.dashboard_bookmarks;
create policy "dashboard_bookmarks select own"
  on public.dashboard_bookmarks for select using (auth.uid() = user_id);
drop policy if exists "dashboard_bookmarks insert own" on public.dashboard_bookmarks;
create policy "dashboard_bookmarks insert own"
  on public.dashboard_bookmarks for insert with check (auth.uid() = user_id);
drop policy if exists "dashboard_bookmarks update own" on public.dashboard_bookmarks;
create policy "dashboard_bookmarks update own"
  on public.dashboard_bookmarks for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "dashboard_bookmarks delete own" on public.dashboard_bookmarks;
create policy "dashboard_bookmarks delete own"
  on public.dashboard_bookmarks for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5) dashboard_notes — RENAMED to avoid collision with any existing notes table
-- ---------------------------------------------------------------------------
create table if not exists public.dashboard_notes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  hadith_id       text,
  collection      text,
  title           text,
  body            text not null default '',
  topic           text,
  tags            text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_dashboard_notes_user_id        on public.dashboard_notes(user_id);
create index if not exists idx_dashboard_notes_hadith_id      on public.dashboard_notes(hadith_id);
create index if not exists idx_dashboard_notes_collection     on public.dashboard_notes(collection);
create index if not exists idx_dashboard_notes_user_collection on public.dashboard_notes(user_id, collection);

drop trigger if exists trg_dashboard_notes_updated_at on public.dashboard_notes;
create trigger trg_dashboard_notes_updated_at
  before update on public.dashboard_notes
  for each row execute function public.tg_set_updated_at();

alter table public.dashboard_notes enable row level security;

drop policy if exists "dashboard_notes select own" on public.dashboard_notes;
create policy "dashboard_notes select own"
  on public.dashboard_notes for select using (auth.uid() = user_id);
drop policy if exists "dashboard_notes insert own" on public.dashboard_notes;
create policy "dashboard_notes insert own"
  on public.dashboard_notes for insert with check (auth.uid() = user_id);
drop policy if exists "dashboard_notes update own" on public.dashboard_notes;
create policy "dashboard_notes update own"
  on public.dashboard_notes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "dashboard_notes delete own" on public.dashboard_notes;
create policy "dashboard_notes delete own"
  on public.dashboard_notes for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 6) dashboard_daily_goals — RENAMED for consistency / safety
-- ---------------------------------------------------------------------------
create table if not exists public.dashboard_daily_goals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  goal_date       date not null,
  target_minutes  integer not null default 15 check (target_minutes >= 0),
  target_hadith   integer not null default 0 check (target_hadith >= 0),
  achieved_minutes integer not null default 0 check (achieved_minutes >= 0),
  achieved_hadith integer not null default 0 check (achieved_hadith >= 0),
  completed       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, goal_date)
);

create index if not exists idx_dashboard_daily_goals_user_id on public.dashboard_daily_goals(user_id);
create index if not exists idx_dashboard_daily_goals_date    on public.dashboard_daily_goals(goal_date);

drop trigger if exists trg_dashboard_daily_goals_updated_at on public.dashboard_daily_goals;
create trigger trg_dashboard_daily_goals_updated_at
  before update on public.dashboard_daily_goals
  for each row execute function public.tg_set_updated_at();

alter table public.dashboard_daily_goals enable row level security;

drop policy if exists "dashboard_daily_goals select own" on public.dashboard_daily_goals;
create policy "dashboard_daily_goals select own"
  on public.dashboard_daily_goals for select using (auth.uid() = user_id);
drop policy if exists "dashboard_daily_goals insert own" on public.dashboard_daily_goals;
create policy "dashboard_daily_goals insert own"
  on public.dashboard_daily_goals for insert with check (auth.uid() = user_id);
drop policy if exists "dashboard_daily_goals update own" on public.dashboard_daily_goals;
create policy "dashboard_daily_goals update own"
  on public.dashboard_daily_goals for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "dashboard_daily_goals delete own" on public.dashboard_daily_goals;
create policy "dashboard_daily_goals delete own"
  on public.dashboard_daily_goals for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 7) reading_achievements — earned badges
-- ---------------------------------------------------------------------------
create table if not exists public.reading_achievements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  title           text not null,
  description     text,
  awarded_at      timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  unique (user_id, achievement_key)
);

alter table public.reading_achievements add column if not exists achievement_key text;
alter table public.reading_achievements add column if not exists title text;
alter table public.reading_achievements add column if not exists description text;
alter table public.reading_achievements add column if not exists awarded_at timestamptz not null default now();
alter table public.reading_achievements add column if not exists created_at timestamptz not null default now();

create index if not exists idx_reading_achievements_user_id on public.reading_achievements(user_id);

alter table public.reading_achievements enable row level security;

drop policy if exists "reading_achievements select own" on public.reading_achievements;
create policy "reading_achievements select own"
  on public.reading_achievements for select using (auth.uid() = user_id);
drop policy if exists "reading_achievements insert own" on public.reading_achievements;
create policy "reading_achievements insert own"
  on public.reading_achievements for insert with check (auth.uid() = user_id);
drop policy if exists "reading_achievements delete own" on public.reading_achievements;
create policy "reading_achievements delete own"
  on public.reading_achievements for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 8) ai_recommendations — cached AI/scored recommendations per user
-- ---------------------------------------------------------------------------
create table if not exists public.ai_recommendations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  hadith_id       text not null,
  collection      text,
  topic           text,
  score           integer not null default 0 check (score between 0 and 100),
  reason          text,
  source          text not null default 'rule_based'
                    check (source in ('rule_based', 'embedding', 'hybrid')),
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, hadith_id)
);

alter table public.ai_recommendations add column if not exists collection text;
alter table public.ai_recommendations add column if not exists topic text;
alter table public.ai_recommendations add column if not exists score integer not null default 0;
alter table public.ai_recommendations add column if not exists reason text;
alter table public.ai_recommendations add column if not exists source text not null default 'rule_based';
alter table public.ai_recommendations add column if not exists expires_at timestamptz;
alter table public.ai_recommendations add column if not exists created_at timestamptz not null default now();
alter table public.ai_recommendations add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_ai_recommendations_user_id    on public.ai_recommendations(user_id);
create index if not exists idx_ai_recommendations_hadith_id  on public.ai_recommendations(hadith_id);
create index if not exists idx_ai_recommendations_user_score on public.ai_recommendations(user_id, score desc);

drop trigger if exists trg_ai_recommendations_updated_at on public.ai_recommendations;
create trigger trg_ai_recommendations_updated_at
  before update on public.ai_recommendations
  for each row execute function public.tg_set_updated_at();

alter table public.ai_recommendations enable row level security;

drop policy if exists "ai_recommendations select own" on public.ai_recommendations;
create policy "ai_recommendations select own"
  on public.ai_recommendations for select using (auth.uid() = user_id);
drop policy if exists "ai_recommendations insert own" on public.ai_recommendations;
create policy "ai_recommendations insert own"
  on public.ai_recommendations for insert with check (auth.uid() = user_id);
drop policy if exists "ai_recommendations update own" on public.ai_recommendations;
create policy "ai_recommendations update own"
  on public.ai_recommendations for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "ai_recommendations delete own" on public.ai_recommendations;
create policy "ai_recommendations delete own"
  on public.ai_recommendations for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Done. Service role keys must NEVER be exposed to the client. All write
-- paths above are scoped to the authenticated user via auth.uid().
-- ---------------------------------------------------------------------------
