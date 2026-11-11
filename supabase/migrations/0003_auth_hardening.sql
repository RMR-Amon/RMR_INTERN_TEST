-- =====================================================================
-- R_M_R TEST FOR INTERN — auth hardening
--   * relaxed usernames (any characters except whitespace and "@")
--   * login by username OR email (password is verified before the email
--     is revealed, with brute-force throttling)
--   * 6-digit email verification codes for sign-up (stored as bcrypt
--     hashes, keyed by a SHA-256 hash of the email — no plaintext)
-- Run after 0001 and 0002.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Usernames: 3–30 chars, anything except whitespace and "@"
-- ("@" is reserved so the login field can tell a username from an email)
-- ---------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_username_check;
alter table public.profiles
  add constraint profiles_username_check check (username ~ '^[^[:space:]@]{3,30}$');

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
    '[[:space:]@]', '', 'g'));
  if char_length(v_base) < 3 then
    v_base := v_base || 'student';
  end if;
  v_base := left(v_base, 26);
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

-- ---------------------------------------------------------------------
-- Hash helper: SHA-256 of a normalised identifier (email / username)
-- ---------------------------------------------------------------------
create or replace function public.identifier_hash(p_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(extensions.digest(lower(trim(p_value)), 'sha256'), 'hex');
$$;

revoke execute on function public.identifier_hash(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Sign-up verification codes (service_role only)
-- ---------------------------------------------------------------------
create table if not exists public.signup_verifications (
  email_hash        text primary key,
  code_hash         text not null,
  attempts          integer not null default 0,
  expires_at        timestamptz not null,
  last_sent_at      timestamptz not null default now(),
  window_started_at timestamptz not null default now(),
  sends_in_window   integer not null default 1
);

alter table public.signup_verifications enable row level security;
revoke all on public.signup_verifications from anon, authenticated;

/** True when an account with this email already exists. */
create or replace function public.email_registered(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from auth.users where lower(email) = lower(trim(p_email)));
$$;

/**
 * Store a new code for this email. Raises:
 *   email_taken     — the email already has an account
 *   code_cooldown   — a code was sent less than 60 s ago
 *   too_many_codes  — 5 codes already sent within the last hour
 */
create or replace function public.signup_issue_code(p_email text, p_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text := public.identifier_hash(p_email);
  v_row  public.signup_verifications;
begin
  if p_code !~ '^[0-9]{6}$' then
    raise exception 'invalid_code_format';
  end if;
  if public.email_registered(p_email) then
    raise exception 'email_taken';
  end if;

  select * into v_row from public.signup_verifications where email_hash = v_hash for update;

  if found then
    if v_row.last_sent_at > now() - interval '60 seconds' then
      raise exception 'code_cooldown';
    end if;
    if v_row.window_started_at > now() - interval '1 hour' and v_row.sends_in_window >= 5 then
      raise exception 'too_many_codes';
    end if;
    update public.signup_verifications
      set code_hash = extensions.crypt(p_code, extensions.gen_salt('bf', 8)),
          attempts = 0,
          expires_at = now() + interval '10 minutes',
          last_sent_at = now(),
          window_started_at = case when window_started_at > now() - interval '1 hour'
                                   then window_started_at else now() end,
          sends_in_window = case when window_started_at > now() - interval '1 hour'
                                 then sends_in_window + 1 else 1 end
    where email_hash = v_hash;
  else
    insert into public.signup_verifications (email_hash, code_hash, expires_at)
    values (v_hash, extensions.crypt(p_code, extensions.gen_salt('bf', 8)), now() + interval '10 minutes');
  end if;
end;
$$;

/** Undo a just-issued code (used when the email could not be delivered). */
create or replace function public.signup_cancel_code(p_email text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.signup_verifications where email_hash = public.identifier_hash(p_email);
$$;

/**
 * Check a code. Returns a status instead of raising so the attempt
 * counter is persisted: ok | invalid | expired | attempts | missing.
 * A code allows at most 5 wrong attempts.
 */
create or replace function public.signup_check_code(p_email text, p_code text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text := public.identifier_hash(p_email);
  v_row  public.signup_verifications;
begin
  select * into v_row from public.signup_verifications where email_hash = v_hash for update;
  if not found then
    return 'missing';
  end if;
  if v_row.expires_at < now() then
    return 'expired';
  end if;
  if v_row.attempts >= 5 then
    return 'attempts';
  end if;
  if extensions.crypt(coalesce(p_code, ''), v_row.code_hash) = v_row.code_hash then
    return 'ok';
  end if;
  update public.signup_verifications set attempts = attempts + 1 where email_hash = v_hash;
  return case when v_row.attempts + 1 >= 5 then 'attempts' else 'invalid' end;
end;
$$;

/** Delete the code once the account has been created. */
create or replace function public.signup_consume_code(p_email text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.signup_verifications where email_hash = public.identifier_hash(p_email);
$$;

revoke execute on function public.email_registered(text) from public, anon, authenticated;
revoke execute on function public.signup_issue_code(text, text) from public, anon, authenticated;
revoke execute on function public.signup_cancel_code(text) from public, anon, authenticated;
revoke execute on function public.signup_check_code(text, text) from public, anon, authenticated;
revoke execute on function public.signup_consume_code(text) from public, anon, authenticated;
grant execute on function public.email_registered(text) to service_role;
grant execute on function public.signup_issue_code(text, text) to service_role;
grant execute on function public.signup_cancel_code(text) to service_role;
grant execute on function public.signup_check_code(text, text) to service_role;
grant execute on function public.signup_consume_code(text) to service_role;

-- ---------------------------------------------------------------------
-- Login by username
-- The email is returned ONLY when the password matches the account's
-- bcrypt hash, so usernames (public on the leaderboard) never leak emails.
-- 10 wrong passwords per username lock username-login for 15 minutes.
-- ---------------------------------------------------------------------
create table if not exists public.login_throttle (
  key_hash          text primary key,
  failures          integer not null default 0,
  window_started_at timestamptz not null default now()
);

alter table public.login_throttle enable row level security;
revoke all on public.login_throttle from anon, authenticated;

create or replace function public.resolve_login_email(p_username text, p_password text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_key   text := public.identifier_hash(p_username);
  v_email text;
  v_hash  text;
begin
  if exists (
    select 1 from public.login_throttle
    where key_hash = v_key and failures >= 10 and window_started_at > now() - interval '15 minutes'
  ) then
    raise exception 'too_many_attempts';
  end if;

  select u.email, u.encrypted_password into v_email, v_hash
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.username = lower(trim(p_username));

  if v_hash is not null and v_hash <> ''
     and extensions.crypt(coalesce(p_password, ''), v_hash) = v_hash then
    delete from public.login_throttle where key_hash = v_key;
    return v_email;
  end if;

  insert into public.login_throttle as t (key_hash, failures, window_started_at)
  values (v_key, 1, now())
  on conflict (key_hash) do update
    set failures = case when t.window_started_at > now() - interval '15 minutes' then t.failures + 1 else 1 end,
        window_started_at = case when t.window_started_at > now() - interval '15 minutes'
                                 then t.window_started_at else now() end;
  return null;
end;
$$;

revoke execute on function public.resolve_login_email(text, text) from public;
grant execute on function public.resolve_login_email(text, text) to anon, authenticated;
