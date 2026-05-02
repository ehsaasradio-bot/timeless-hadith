-- ─────────────────────────────────────────────────────────────
-- Timeless Hadith — Progress, Dashboard & Competition Schema
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── 1. user_profiles ──────────────────────────────────────────
create table if not exists public.user_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  company_name text,
  team_name    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── 2. hadith_progress ───────────────────────────────────────
create table if not exists public.hadith_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  hadith_id       text not null,
  collection_name text,
  book_name       text,
  chapter_name    text,
  hadith_number   text,
  read_at         timestamptz default now(),
  points_earned   int default 10,
  created_at      timestamptz default now(),
  constraint unique_user_hadith_read unique (user_id, hadith_id)
);

create index if not exists idx_hadith_progress_user_id
  on public.hadith_progress(user_id);
create index if not exists idx_hadith_progress_read_at
  on public.hadith_progress(read_at);
create index if not exists idx_hadith_progress_collection
  on public.hadith_progress(collection_name);

-- ── 3. user_stats ─────────────────────────────────────────────
create table if not exists public.user_stats (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  total_hadith_read int default 0,
  total_points    int default 0,
  virtual_coins   int default 0,
  trophies_count  int default 0,
  current_level   int default 1,
  current_streak  int default 0,
  longest_streak  int default 0,
  last_read_at    timestamptz,
  daily_goal      int default 20,
  updated_at      timestamptz default now()
);

-- ── 4. achievements ───────────────────────────────────────────
create table if not exists public.achievements (
  id               uuid primary key default gen_random_uuid(),
  badge_key        text unique not null,
  badge_name       text not null,
  badge_description text,
  required_type    text not null,
  required_value   int not null,
  icon             text,
  sort_order       int default 0,
  created_at       timestamptz default now()
);

-- ── 5. user_achievements ──────────────────────────────────────
create table if not exists public.user_achievements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  badge_key   text not null references public.achievements(badge_key) on delete cascade,
  unlocked_at timestamptz default now(),
  constraint unique_user_badge unique (user_id, badge_key)
);

-- ── 6. reading_groups ─────────────────────────────────────────
create table if not exists public.reading_groups (
  id            uuid primary key default gen_random_uuid(),
  group_name    text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  is_private    boolean default true,
  created_at    timestamptz default now()
);

-- ── 7. reading_group_members ──────────────────────────────────
create table if not exists public.reading_group_members (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.reading_groups(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text default 'member',
  joined_at  timestamptz default now(),
  constraint unique_group_member unique (group_id, user_id)
);

-- ── 8. hadith_bookmarks ───────────────────────────────────────
create table if not exists public.hadith_bookmarks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  hadith_id       text not null,
  collection_name text,
  book_name       text,
  created_at      timestamptz default now(),
  constraint unique_user_bookmark unique (user_id, hadith_id)
);

-- ── 9. hadith_notes ───────────────────────────────────────────
create table if not exists public.hadith_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  hadith_id  text not null,
  note       text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── 10. Views ─────────────────────────────────────────────────

create or replace view public.user_daily_reading_activity as
select
  user_id,
  date(read_at)       as reading_date,
  count(*)            as hadith_read_count,
  sum(points_earned)  as points_earned
from public.hadith_progress
group by user_id, date(read_at);

create or replace view public.user_collection_progress as
select
  user_id,
  collection_name,
  count(*) as read_count
from public.hadith_progress
group by user_id, collection_name;

create or replace view public.user_leaderboard as
select
  us.user_id,
  up.display_name,
  up.avatar_url,
  up.company_name,
  up.team_name,
  us.total_hadith_read,
  us.total_points,
  us.virtual_coins,
  us.trophies_count,
  us.current_level,
  us.current_streak,
  rank() over (
    order by us.total_points desc, us.total_hadith_read desc
  ) as rank
from public.user_stats us
left join public.user_profiles up on up.id = us.user_id;

create or replace view public.company_leaderboard as
select
  up.company_name,
  count(distinct up.id)                                   as total_users,
  coalesce(sum(us.total_hadith_read), 0)                  as total_hadith_read,
  coalesce(sum(us.total_points), 0)                       as total_points,
  coalesce(sum(us.virtual_coins), 0)                      as virtual_coins,
  coalesce(sum(us.trophies_count), 0)                     as trophies_count,
  rank() over (
    order by coalesce(sum(us.total_points), 0) desc,
             coalesce(sum(us.total_hadith_read), 0) desc
  ) as rank
from public.user_profiles up
left join public.user_stats us on us.user_id = up.id
where up.company_name is not null
group by up.company_name;

-- ── 11. Row Level Security ────────────────────────────────────

alter table public.user_profiles         enable row level security;
alter table public.hadith_progress       enable row level security;
alter table public.user_stats            enable row level security;
alter table public.achievements          enable row level security;
alter table public.user_achievements     enable row level security;
alter table public.reading_groups        enable row level security;
alter table public.reading_group_members enable row level security;
alter table public.hadith_bookmarks      enable row level security;
alter table public.hadith_notes          enable row level security;

-- user_profiles
drop policy if exists "Users can view own profile"   on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can view own profile"   on public.user_profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);

-- hadith_progress
drop policy if exists "Users can view own progress"   on public.hadith_progress;
drop policy if exists "Users can insert own progress" on public.hadith_progress;
create policy "Users can view own progress"   on public.hadith_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.hadith_progress for insert with check (auth.uid() = user_id);

-- user_stats
drop policy if exists "Users can view own stats"   on public.user_stats;
drop policy if exists "Users can insert own stats" on public.user_stats;
drop policy if exists "Users can update own stats" on public.user_stats;
create policy "Users can view own stats"   on public.user_stats for select using (auth.uid() = user_id);
create policy "Users can insert own stats" on public.user_stats for insert with check (auth.uid() = user_id);
create policy "Users can update own stats" on public.user_stats for update using (auth.uid() = user_id);

-- achievements (read-only for authenticated users)
drop policy if exists "Authenticated users can view achievements" on public.achievements;
create policy "Authenticated users can view achievements"
  on public.achievements for select to authenticated using (true);

-- user_achievements
drop policy if exists "Users can view own achievements"   on public.user_achievements;
drop policy if exists "Users can insert own achievements" on public.user_achievements;
create policy "Users can view own achievements"   on public.user_achievements for select using (auth.uid() = user_id);
create policy "Users can insert own achievements" on public.user_achievements for insert with check (auth.uid() = user_id);

-- hadith_bookmarks
drop policy if exists "Users can manage own bookmarks" on public.hadith_bookmarks;
create policy "Users can manage own bookmarks"
  on public.hadith_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- hadith_notes
drop policy if exists "Users can manage own notes" on public.hadith_notes;
create policy "Users can manage own notes"
  on public.hadith_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 12. Seed achievements ─────────────────────────────────────
insert into public.achievements
  (badge_key, badge_name, badge_description, required_type, required_value, icon, sort_order)
values
  ('first_step',         'First Step',         'Read your first Hadith',             'total_read',  1,    'book-open',  1),
  ('ten_hadith',         '10 Hadith Milestone','Read 10 Hadith',                     'total_read',  10,   'star',       2),
  ('hundred_hadith',     '100 Hadith Milestone','Read 100 Hadith',                   'total_read',  100,  'award',      3),
  ('five_hundred_hadith','Dedicated Reader',   'Read 500 Hadith',                    'total_read',  500,  'trophy',     4),
  ('thousand_hadith',    'Knowledge Seeker',   'Read 1,000 Hadith',                  'total_read',  1000, 'crown',      5),
  ('seven_day_streak',   '7-Day Streak',       'Read consistently for 7 days',       'streak',      7,    'flame',      6),
  ('thirty_day_streak',  '30-Day Streak',      'Read consistently for 30 days',      'streak',      30,   'sparkles',   7),
  ('ten_lessons',        '10 Lessons Medal',   'Complete 10 lessons or chapters',    'lesson_count',10,   'medal',      8)
on conflict (badge_key) do nothing;

-- ── 13. mark_hadith_as_read RPC ───────────────────────────────
create or replace function public.mark_hadith_as_read(
  p_user_id        uuid,
  p_hadith_id      text,
  p_collection_name text default null,
  p_book_name      text default null,
  p_chapter_name   text default null,
  p_hadith_number  text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  already_read    boolean;
  v_total_read    int;
  v_total_points  int;
  v_current_level int;
  v_virtual_coins int;
  v_trophies      int;
  v_points        int := 10;
  v_coins         int := 2;
begin
  -- Duplicate check
  select exists (
    select 1 from public.hadith_progress
    where user_id = p_user_id and hadith_id = p_hadith_id
  ) into already_read;

  if already_read then
    return jsonb_build_object(
      'success', true,
      'alreadyRead', true,
      'message', 'Hadith already marked as read'
    );
  end if;

  -- Insert progress record
  insert into public.hadith_progress (
    user_id, hadith_id, collection_name, book_name,
    chapter_name, hadith_number, points_earned
  ) values (
    p_user_id, p_hadith_id, p_collection_name, p_book_name,
    p_chapter_name, p_hadith_number, v_points
  );

  -- Upsert user_stats
  insert into public.user_stats (
    user_id, total_hadith_read, total_points, virtual_coins,
    trophies_count, current_level, current_streak, longest_streak, last_read_at
  ) values (
    p_user_id, 1, v_points, v_coins, 0, 1, 1, 1, now()
  )
  on conflict (user_id) do update set
    total_hadith_read = public.user_stats.total_hadith_read + 1,
    total_points      = public.user_stats.total_points + v_points,
    virtual_coins     = public.user_stats.virtual_coins + v_coins,
    last_read_at      = now(),
    updated_at        = now();

  -- Read back updated stats
  select total_hadith_read, total_points, virtual_coins, trophies_count
  into v_total_read, v_total_points, v_virtual_coins, v_trophies
  from public.user_stats where user_id = p_user_id;

  -- Level = floor(points / 1000) + 1
  v_current_level := greatest(1, floor(v_total_points / 1000)::int + 1);

  update public.user_stats
  set current_level = v_current_level
  where user_id = p_user_id;

  -- Unlock achievements
  insert into public.user_achievements (user_id, badge_key)
  select p_user_id, badge_key
  from public.achievements
  where required_type = 'total_read' and required_value <= v_total_read
  on conflict do nothing;

  -- Update trophy count
  update public.user_stats
  set trophies_count = (
    select count(*) from public.user_achievements where user_id = p_user_id
  )
  where user_id = p_user_id;

  select trophies_count into v_trophies
  from public.user_stats where user_id = p_user_id;

  return jsonb_build_object(
    'success',          true,
    'alreadyRead',      false,
    'pointsEarned',     v_points,
    'coinsEarned',      v_coins,
    'totalHadithRead',  v_total_read,
    'totalPoints',      v_total_points,
    'virtualCoins',     v_virtual_coins,
    'trophiesCount',    v_trophies,
    'currentLevel',     v_current_level
  );
end;
$$;
