-- =====================================================================
-- R_M_R TEST FOR INTERN — database schema
-- Tables, indexes, triggers and Row Level Security policies.
-- Run in Supabase SQL Editor (or `supabase db push`) BEFORE 0002 and seed.
-- =====================================================================

-- gen_random_uuid() is built into PostgreSQL 13+ (no extension needed)

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.level_for_xp(p_xp integer)
returns integer
language sql
immutable
as $$
  -- Level L starts at 50 * (L - 1)^2 XP  (0, 50, 200, 450, 800, ...)
  select floor(sqrt(greatest(p_xp, 0) / 50.0))::integer + 1;
$$;

-- ---------------------------------------------------------------------
-- technologies (question categories)
-- ---------------------------------------------------------------------
create table if not exists public.technologies (
  id          text primary key check (id ~ '^[a-z0-9-]{2,24}$'),
  name        text not null check (char_length(name) between 1 and 40),
  is_core     boolean not null default false,
  is_active   boolean not null default true,
  color       text not null default '#22d3ee' check (color ~ '^#[0-9a-fA-F]{6}$'),
  sort_order  integer not null default 0,
  description jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint core_is_active check (not is_core or is_active)
);

create trigger technologies_updated_at
  before update on public.technologies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  username           text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  full_name          text not null check (char_length(full_name) between 2 and 60),
  avatar_url         text,
  role               text not null default 'student' check (role in ('student', 'admin')),
  is_blocked         boolean not null default false,
  xp                 integer not null default 0 check (xp >= 0),
  level              integer not null default 1,
  tests_completed    integer not null default 0,
  total_score        numeric(12, 2) not null default 0,
  average_score      numeric(5, 2) not null default 0,
  best_score         numeric(5, 2) not null default 0,
  current_streak     integer not null default 0,
  longest_streak     integer not null default 0,
  last_activity_date date,
  language           text not null default 'uz' check (language in ('uz', 'ru', 'en')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists profiles_xp_idx on public.profiles (xp desc) where role = 'student';

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- questions (correct_index is NEVER readable by students)
-- ---------------------------------------------------------------------
create table if not exists public.questions (
  id            text primary key default ('q-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  technology    text not null references public.technologies (id) on update cascade on delete restrict,
  difficulty    text not null check (difficulty in ('easy', 'medium', 'hard')),
  question      jsonb not null,
  code          text,
  options       jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  correct_index smallint not null check (correct_index between 0 and 3),
  explanation   jsonb not null,
  xp_reward     integer not null default 10 check (xp_reward between 0 and 100),
  is_active     boolean not null default true,
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists questions_pool_idx on public.questions (technology, difficulty) where is_active;

create trigger questions_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- app_settings (singleton row id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  id                    integer primary key default 1 check (id = 1),
  min_questions         integer not null default 5 check (min_questions >= 1),
  max_questions         integer not null default 40,
  default_questions     integer not null default 15,
  min_duration_minutes  integer not null default 5 check (min_duration_minutes >= 1),
  max_duration_minutes  integer not null default 60,
  default_duration_minutes integer not null default 20,
  easy_xp               integer not null default 10,
  medium_xp             integer not null default 15,
  hard_xp               integer not null default 20,
  completion_bonus      integer not null default 20,
  high_score_bonus      integer not null default 30,
  perfect_bonus         integer not null default 50,
  completion_min_score  integer not null default 50 check (completion_min_score between 0 and 100),
  repeat_xp_percent     integer not null default 20 check (repeat_xp_percent between 0 and 100),
  daily_bonus_cap       integer not null default 5 check (daily_bonus_cap >= 0),
  updated_at            timestamptz not null default now(),
  constraint question_range check (min_questions <= default_questions and default_questions <= max_questions),
  constraint duration_range check (min_duration_minutes <= default_duration_minutes and default_duration_minutes <= max_duration_minutes)
);

create trigger app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- test_sessions
-- ---------------------------------------------------------------------
create table if not exists public.test_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  technologies       text[] not null,
  difficulty         text not null check (difficulty in ('easy', 'medium', 'hard', 'mixed')),
  question_ids       text[] not null,
  question_count     integer not null check (question_count > 0),
  duration_seconds   integer not null check (duration_seconds > 0),
  status             text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'abandoned')),
  started_at         timestamptz not null default now(),
  expires_at         timestamptz not null,
  submitted_at       timestamptz,
  correct_count      integer,
  score_percent      numeric(5, 2),
  xp_earned          integer not null default 0,
  bonus_xp           integer not null default 0,
  time_spent_seconds integer,
  breakdown          jsonb,
  new_achievements   text[] not null default '{}',
  auto_submitted     boolean not null default false,
  created_at         timestamptz not null default now()
);

-- Only one running test per student
create unique index if not exists test_sessions_one_active
  on public.test_sessions (user_id) where status = 'in_progress';
create index if not exists test_sessions_user_idx on public.test_sessions (user_id, submitted_at desc);
create index if not exists test_sessions_submitted_idx on public.test_sessions (submitted_at desc) where status = 'submitted';

-- ---------------------------------------------------------------------
-- test_answers
-- ---------------------------------------------------------------------
create table if not exists public.test_answers (
  id             bigint generated always as identity primary key,
  session_id     uuid not null references public.test_sessions (id) on delete cascade,
  question_id    text not null references public.questions (id) on delete cascade,
  position       integer not null,
  selected_index smallint check (selected_index between 0 and 3),
  is_correct     boolean,
  xp_awarded     integer not null default 0,
  answered_at    timestamptz,
  unique (session_id, question_id)
);

create index if not exists test_answers_question_idx on public.test_answers (question_id);

-- ---------------------------------------------------------------------
-- xp_events (ledger used for weekly / monthly leaderboards)
-- ---------------------------------------------------------------------
create table if not exists public.xp_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  amount     integer not null,
  reason     text not null check (reason in ('test', 'achievement', 'admin')),
  session_id uuid references public.test_sessions (id) on delete set null,
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists xp_events_user_idx on public.xp_events (user_id, created_at desc);
create index if not exists xp_events_created_idx on public.xp_events (created_at desc);

-- ---------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------
create table if not exists public.achievements (
  id              text primary key check (id ~ '^[a-z0-9_]{2,40}$'),
  title           jsonb not null,
  description     jsonb not null,
  icon            text not null default 'award',
  tier            text not null default 'bronze' check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  xp_bonus        integer not null default 0 check (xp_bonus >= 0),
  condition_type  text not null check (condition_type in (
                    'tests_completed', 'total_xp', 'level', 'streak',
                    'score_at_least', 'hard_score', 'all_technologies')),
  condition_value integer not null default 1,
  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger achievements_updated_at
  before update on public.achievements
  for each row execute function public.set_updated_at();

create table if not exists public.student_achievements (
  user_id        uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  session_id     uuid references public.test_sessions (id) on delete set null,
  earned_at      timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists student_achievements_user_idx on public.student_achievements (user_id, earned_at desc);

-- ---------------------------------------------------------------------
-- Role helper (security definer → bypasses RLS, no recursion)
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------
-- New user → profile
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base     text;
  v_username text;
  v_name     text;
  v_lang     text;
  v_i        integer := 0;
begin
  v_base := lower(regexp_replace(
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    '[^a-zA-Z0-9_]', '', 'g'));
  if char_length(v_base) < 3 then
    v_base := v_base || 'student';
  end if;
  v_base := left(v_base, 16);
  v_username := v_base;
  while exists (select 1 from public.profiles where username = v_username) loop
    v_i := v_i + 1;
    v_username := v_base || v_i::text;
  end loop;

  v_name := left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 60);
  if char_length(v_name) < 2 then
    v_name := v_username;
  end if;

  v_lang := coalesce(new.raw_user_meta_data ->> 'language', 'uz');
  if v_lang not in ('uz', 'ru', 'en') then
    v_lang := 'uz';
  end if;

  insert into public.profiles (id, username, full_name, language)
  values (new.id, v_username, v_name, v_lang);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- Default Supabase grants are revoked and re-granted explicitly so that
-- students can only touch what they must. All scoring happens inside
-- SECURITY DEFINER functions (see 0002_functions.sql).
-- =====================================================================

alter table public.technologies         enable row level security;
alter table public.profiles             enable row level security;
alter table public.questions            enable row level security;
alter table public.app_settings         enable row level security;
alter table public.test_sessions        enable row level security;
alter table public.test_answers         enable row level security;
alter table public.xp_events            enable row level security;
alter table public.achievements         enable row level security;
alter table public.student_achievements enable row level security;

revoke all on public.technologies, public.profiles, public.questions, public.app_settings,
              public.test_sessions, public.test_answers, public.xp_events,
              public.achievements, public.student_achievements
  from anon, authenticated;

-- technologies: public read, admin write
grant select on public.technologies to anon, authenticated;
grant insert, update, delete on public.technologies to authenticated;
create policy technologies_read on public.technologies for select using (true);
create policy technologies_admin_insert on public.technologies for insert to authenticated with check (public.is_admin());
create policy technologies_admin_update on public.technologies for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy technologies_admin_delete on public.technologies for delete to authenticated using (public.is_admin() and not is_core);

-- profiles: everyone signed in can read public profile data (leaderboard);
-- a student may only edit their own name / username / avatar / language.
grant select on public.profiles to authenticated;
grant update (full_name, username, avatar_url, language) on public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- questions: admins only. Students receive questions exclusively through
-- get_test_session() which strips correct answers.
grant select, insert, update, delete on public.questions to authenticated;
create policy questions_admin_select on public.questions for select to authenticated using (public.is_admin());
create policy questions_admin_insert on public.questions for insert to authenticated with check (public.is_admin());
create policy questions_admin_update on public.questions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy questions_admin_delete on public.questions for delete to authenticated using (public.is_admin());

-- app_settings: read for signed in users, admin update
grant select, update on public.app_settings to authenticated;
create policy app_settings_read on public.app_settings for select to authenticated using (true);
create policy app_settings_admin_update on public.app_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- test_sessions: own rows (read only) or admin. Writes only via RPC.
grant select on public.test_sessions to authenticated;
create policy test_sessions_read on public.test_sessions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- test_answers: own rows (read only) or admin. is_correct is NULL until submit.
grant select on public.test_answers to authenticated;
create policy test_answers_read on public.test_answers for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.test_sessions s where s.id = session_id and s.user_id = auth.uid())
  );

-- xp_events: own or admin
grant select on public.xp_events to authenticated;
create policy xp_events_read on public.xp_events for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- achievements: public catalogue, admin write
grant select on public.achievements to authenticated;
grant insert, update, delete on public.achievements to authenticated;
create policy achievements_read on public.achievements for select to authenticated using (true);
create policy achievements_admin_insert on public.achievements for insert to authenticated with check (public.is_admin());
create policy achievements_admin_update on public.achievements for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy achievements_admin_delete on public.achievements for delete to authenticated using (public.is_admin());

-- student_achievements: readable by everyone signed in (profiles), admin can grant / revoke
grant select, insert, delete on public.student_achievements to authenticated;
create policy student_achievements_read on public.student_achievements for select to authenticated using (true);
create policy student_achievements_admin_insert on public.student_achievements for insert to authenticated with check (public.is_admin());
create policy student_achievements_admin_delete on public.student_achievements for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage: avatars bucket (public read, owner write into "<uid>/...")
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "rmr_avatars_read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "rmr_avatars_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rmr_avatars_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rmr_avatars_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
