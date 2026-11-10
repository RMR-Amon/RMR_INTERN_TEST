  -- =====================================================================
  -- R_M_R TEST FOR INTERN — server-side business logic (RPC)
  -- All test / scoring / XP logic runs here so the client can never see
  -- correct answers before submitting or grant itself XP.
  -- =====================================================================

  -- ---------------------------------------------------------------------
  -- Public helpers
  -- ---------------------------------------------------------------------
  create or replace function public.is_username_available(p_username text)
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
  as $$
    select not exists (select 1 from public.profiles where username = lower(trim(p_username)));
  $$;

  grant execute on function public.is_username_available(text) to anon, authenticated;

  -- ---------------------------------------------------------------------
  -- start_test: validates config, picks balanced random questions,
  -- creates a session and empty answer rows. Returns the session id.
  -- ---------------------------------------------------------------------
  create or replace function public.start_test(
    p_technologies     text[],
    p_difficulty       text,
    p_question_count   integer,
    p_duration_minutes integer
  )
  returns uuid
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    v_uid      uuid := auth.uid();
    v_settings public.app_settings;
    v_techs    text[];
    v_ids      text[];
    v_session  uuid;
  begin
    if v_uid is null then
      raise exception 'not_authenticated';
    end if;
    if exists (select 1 from public.profiles where id = v_uid and is_blocked) then
      raise exception 'account_blocked';
    end if;

    select * into v_settings from public.app_settings where id = 1;

    if p_difficulty not in ('easy', 'medium', 'hard', 'mixed') then
      raise exception 'invalid_difficulty';
    end if;
    if p_question_count is null
      or p_question_count < v_settings.min_questions
      or p_question_count > v_settings.max_questions then
      raise exception 'invalid_question_count';
    end if;
    if p_duration_minutes is null
      or p_duration_minutes < v_settings.min_duration_minutes
      or p_duration_minutes > v_settings.max_duration_minutes then
      raise exception 'invalid_duration';
    end if;

    -- Core technologies are ALWAYS included; optional ones only if requested & active.
    select array_agg(id order by sort_order)
      into v_techs
      from public.technologies
    where is_active and (is_core or id = any (coalesce(p_technologies, '{}')));

    -- Balanced pick: round-robin across technologies, preferring the chosen
    -- difficulty and falling back to other difficulties if the pool is small.
    select array_agg(id order by random())
      into v_ids
      from (
        select id
          from (
            select q.id,
                  (p_difficulty = 'mixed' or q.difficulty = p_difficulty) as matches,
                  row_number() over (
                    partition by q.technology, (p_difficulty = 'mixed' or q.difficulty = p_difficulty)
                    order by random()
                  ) as rn
              from public.questions q
            where q.is_active and q.technology = any (v_techs)
          ) pool
        order by matches desc, rn, random()
        limit p_question_count
      ) picked;

    if coalesce(array_length(v_ids, 1), 0) < v_settings.min_questions then
      raise exception 'not_enough_questions';
    end if;

    -- Starting a new test abandons the previous unfinished one (no XP).
    update public.test_sessions
      set status = 'abandoned'
    where user_id = v_uid and status = 'in_progress';

    insert into public.test_sessions (
      user_id, technologies, difficulty, question_ids, question_count,
      duration_seconds, expires_at
    ) values (
      v_uid, v_techs, p_difficulty, v_ids, array_length(v_ids, 1),
      p_duration_minutes * 60, now() + make_interval(mins => p_duration_minutes)
    )
    returning id into v_session;

    insert into public.test_answers (session_id, question_id, position)
    select v_session, qid, ord::integer
      from unnest(v_ids) with ordinality as t(qid, ord);

    return v_session;
  end;
  $$;

  -- ---------------------------------------------------------------------
  -- get_active_session_id
  -- ---------------------------------------------------------------------
  create or replace function public.get_active_session_id()
  returns uuid
  language sql
  stable
  security definer
  set search_path = public
  as $$
    select id from public.test_sessions
    where user_id = auth.uid() and status = 'in_progress'
    limit 1;
  $$;

  -- ---------------------------------------------------------------------
  -- get_test_session: questions WITHOUT correct answers / explanations
  -- ---------------------------------------------------------------------
  create or replace function public.get_test_session(p_session_id uuid)
  returns jsonb
  language plpgsql
  stable
  security definer
  set search_path = public
  as $$
  declare
    v_s public.test_sessions;
  begin
    select * into v_s from public.test_sessions
    where id = p_session_id and user_id = auth.uid();
    if not found then
      raise exception 'session_not_found';
    end if;

    return jsonb_build_object(
      'id', v_s.id,
      'status', v_s.status,
      'technologies', to_jsonb(v_s.technologies),
      'difficulty', v_s.difficulty,
      'question_count', v_s.question_count,
      'duration_seconds', v_s.duration_seconds,
      'started_at', v_s.started_at,
      'expires_at', v_s.expires_at,
      'server_now', now(),
      'questions', coalesce((
        select jsonb_agg(jsonb_build_object(
                'id', q.id,
                'technology', q.technology,
                'difficulty', q.difficulty,
                'question', q.question,
                'code', q.code,
                'options', q.options,
                'position', a.position,
                'selected_index', a.selected_index
              ) order by a.position)
          from public.test_answers a
          join public.questions q on q.id = a.question_id
        where a.session_id = v_s.id
      ), '[]'::jsonb)
    );
  end;
  $$;

  -- ---------------------------------------------------------------------
  -- save_answer: persists a selection while the timer is running
  -- ---------------------------------------------------------------------
  create or replace function public.save_answer(
    p_session_id     uuid,
    p_question_id    text,
    p_selected_index integer
  )
  returns void
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    v_s public.test_sessions;
  begin
    select * into v_s from public.test_sessions
    where id = p_session_id and user_id = auth.uid();
    if not found then
      raise exception 'session_not_found';
    end if;
    if v_s.status <> 'in_progress' then
      raise exception 'session_closed';
    end if;
    if now() > v_s.expires_at + interval '5 seconds' then
      raise exception 'time_expired';
    end if;
    if p_selected_index is not null and (p_selected_index < 0 or p_selected_index > 3) then
      raise exception 'invalid_option';
    end if;

    update public.test_answers
      set selected_index = p_selected_index,
          answered_at = now()
    where session_id = p_session_id and question_id = p_question_id;
  end;
  $$;

  -- ---------------------------------------------------------------------
  -- award_achievements (internal)
  -- ---------------------------------------------------------------------
  create or replace function public.award_achievements(p_user_id uuid, p_session_id uuid)
  returns text[]
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    v_p         public.profiles;
    v_s         public.test_sessions;
    v_a         public.achievements;
    v_ok        boolean;
    v_all_techs integer;
    v_new       text[] := '{}';
    v_bonus     integer := 0;
  begin
    select * into v_p from public.profiles where id = p_user_id;
    select * into v_s from public.test_sessions where id = p_session_id;
    select count(*) into v_all_techs from public.technologies where is_active;

    for v_a in
      select a.* from public.achievements a
      where a.is_active
        and not exists (
          select 1 from public.student_achievements sa
            where sa.user_id = p_user_id and sa.achievement_id = a.id)
      order by a.sort_order
    loop
      v_ok := case v_a.condition_type
        when 'tests_completed'  then v_p.tests_completed >= v_a.condition_value
        when 'total_xp'         then v_p.xp >= v_a.condition_value
        when 'level'            then v_p.level >= v_a.condition_value
        when 'streak'           then v_p.current_streak >= v_a.condition_value
        when 'score_at_least'   then coalesce(v_s.score_percent, 0) >= v_a.condition_value
        when 'hard_score'       then v_s.difficulty = 'hard' and coalesce(v_s.score_percent, 0) >= v_a.condition_value
        when 'all_technologies' then cardinality(v_s.technologies) >= v_all_techs
                                    and coalesce(v_s.score_percent, 0) >= v_a.condition_value
        else false
      end;

      if v_ok then
        insert into public.student_achievements (user_id, achievement_id, session_id)
        values (p_user_id, v_a.id, p_session_id)
        on conflict do nothing;
        v_new := array_append(v_new, v_a.id);
        if v_a.xp_bonus > 0 then
          v_bonus := v_bonus + v_a.xp_bonus;
          insert into public.xp_events (user_id, amount, reason, session_id, note)
          values (p_user_id, v_a.xp_bonus, 'achievement', p_session_id, v_a.id);
        end if;
      end if;
    end loop;

    if v_bonus > 0 then
      update public.profiles
        set xp = xp + v_bonus,
            level = public.level_for_xp(xp + v_bonus)
      where id = p_user_id;
    end if;

    return v_new;
  end;
  $$;

  revoke execute on function public.award_achievements(uuid, uuid) from public, anon, authenticated;

  -- ---------------------------------------------------------------------
  -- submit_test: final, idempotent, row-locked scoring
  -- ---------------------------------------------------------------------
  create or replace function public.submit_test(p_session_id uuid, p_answers jsonb default null)
  returns uuid
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    v_uid         uuid := auth.uid();
    v_s           public.test_sessions;
    v_settings    public.app_settings;
    v_total       integer;
    v_correct     integer;
    v_score       numeric(5, 2);
    v_question_xp integer;
    v_bonus       integer := 0;
    v_today_count integer;
    v_breakdown   jsonb;
    v_spent       integer;
    v_profile     public.profiles;
    v_streak      integer;
    v_new         text[];
  begin
    if v_uid is null then
      raise exception 'not_authenticated';
    end if;

    -- Lock the session row: concurrent/duplicate submits are serialised.
    select * into v_s from public.test_sessions
    where id = p_session_id and user_id = v_uid
    for update;
    if not found then
      raise exception 'session_not_found';
    end if;

    -- Idempotent: a second submit never awards XP again.
    if v_s.status = 'submitted' then
      return v_s.id;
    end if;
    if v_s.status = 'abandoned' then
      raise exception 'session_abandoned';
    end if;

    select * into v_settings from public.app_settings where id = 1;

    -- Final answer sync (only accepted while time is not over + small grace).
    if p_answers is not null and jsonb_typeof(p_answers) = 'object'
      and now() <= v_s.expires_at + interval '10 seconds' then
      update public.test_answers ta
        set selected_index = (p_answers ->> ta.question_id)::smallint,
            answered_at = coalesce(ta.answered_at, now())
      where ta.session_id = v_s.id
        and p_answers ? ta.question_id
        and jsonb_typeof(p_answers -> ta.question_id) = 'number'
        and (p_answers ->> ta.question_id)::integer between 0 and 3;
    end if;

    -- Correctness
    update public.test_answers ta
      set is_correct = (ta.selected_index is not null and ta.selected_index = q.correct_index)
      from public.questions q
    where q.id = ta.question_id and ta.session_id = v_s.id;

    -- XP per answer. Anti-farming: full XP only the first time a student
    -- answers a question correctly; repeats give repeat_xp_percent of it.
    update public.test_answers ta
      set xp_awarded = case
            when not ta.is_correct then 0
            when exists (
              select 1
                from public.test_answers prev
                join public.test_sessions ps on ps.id = prev.session_id
                where ps.user_id = v_uid
                  and ps.status = 'submitted'
                  and prev.question_id = ta.question_id
                  and prev.is_correct
            ) then floor(q.xp_reward * v_settings.repeat_xp_percent / 100.0)::integer
            else q.xp_reward
          end
      from public.questions q
    where q.id = ta.question_id and ta.session_id = v_s.id;

    select count(*), count(*) filter (where is_correct), coalesce(sum(xp_awarded), 0)
      into v_total, v_correct, v_question_xp
      from public.test_answers
    where session_id = v_s.id;

    v_score := case when v_total > 0 then round(v_correct * 100.0 / v_total, 2) else 0 end;

    -- Bonuses (limited per day to prevent farming with many short tests)
    select count(*) into v_today_count
      from public.test_sessions
    where user_id = v_uid
      and status = 'submitted'
      and bonus_xp > 0
      and submitted_at >= date_trunc('day', now());

    if v_today_count < v_settings.daily_bonus_cap and v_score >= v_settings.completion_min_score then
      v_bonus := v_settings.completion_bonus;
      if v_score >= 90 then
        v_bonus := v_bonus + v_settings.high_score_bonus;
      end if;
      if v_score >= 100 then
        v_bonus := v_bonus + v_settings.perfect_bonus;
      end if;
    end if;

    select coalesce(jsonb_agg(jsonb_build_object(
            'technology', b.technology, 'total', b.total, 'correct', b.correct
          ) order by b.technology), '[]'::jsonb)
      into v_breakdown
      from (
        select q.technology,
              count(*)::integer as total,
              (count(*) filter (where ta.is_correct))::integer as correct
          from public.test_answers ta
          join public.questions q on q.id = ta.question_id
        where ta.session_id = v_s.id
        group by q.technology
      ) b;

    v_spent := least(greatest(extract(epoch from (now() - v_s.started_at))::integer, 0), v_s.duration_seconds);

    update public.test_sessions
      set status = 'submitted',
          submitted_at = now(),
          correct_count = v_correct,
          score_percent = v_score,
          xp_earned = v_question_xp + v_bonus,
          bonus_xp = v_bonus,
          time_spent_seconds = v_spent,
          breakdown = v_breakdown,
          auto_submitted = now() >= v_s.expires_at
    where id = v_s.id;

    if v_question_xp + v_bonus > 0 then
      insert into public.xp_events (user_id, amount, reason, session_id)
      values (v_uid, v_question_xp + v_bonus, 'test', v_s.id);
    end if;

    -- Profile statistics + streak
    select * into v_profile from public.profiles where id = v_uid for update;

    v_streak := case
      when v_profile.last_activity_date = current_date then v_profile.current_streak
      when v_profile.last_activity_date = current_date - 1 then v_profile.current_streak + 1
      else 1
    end;

    update public.profiles
      set xp = xp + v_question_xp + v_bonus,
          level = public.level_for_xp(xp + v_question_xp + v_bonus),
          tests_completed = tests_completed + 1,
          total_score = total_score + v_score,
          average_score = round((total_score + v_score) / (tests_completed + 1), 2),
          best_score = greatest(best_score, v_score),
          current_streak = v_streak,
          longest_streak = greatest(longest_streak, v_streak),
          last_activity_date = current_date
    where id = v_uid;

    v_new := public.award_achievements(v_uid, v_s.id);

    -- add achievement XP to the session total for the result screen
    update public.test_sessions
      set new_achievements = v_new,
          xp_earned = xp_earned + coalesce((
            select sum(xp_bonus) from public.achievements where id = any (v_new)), 0)
    where id = v_s.id;

    return v_s.id;
  end;
  $$;

  -- ---------------------------------------------------------------------
  -- get_test_result: full review, only AFTER submission
  -- ---------------------------------------------------------------------
  create or replace function public.get_test_result(p_session_id uuid)
  returns jsonb
  language plpgsql
  stable
  security definer
  set search_path = public
  as $$
  declare
    v_s public.test_sessions;
  begin
    select * into v_s from public.test_sessions where id = p_session_id;
    if not found or (v_s.user_id <> auth.uid() and not public.is_admin()) then
      raise exception 'session_not_found';
    end if;
    if v_s.status <> 'submitted' then
      raise exception 'session_not_submitted';
    end if;

    return jsonb_build_object(
      'id', v_s.id,
      'user_id', v_s.user_id,
      'technologies', to_jsonb(v_s.technologies),
      'difficulty', v_s.difficulty,
      'question_count', v_s.question_count,
      'duration_seconds', v_s.duration_seconds,
      'started_at', v_s.started_at,
      'submitted_at', v_s.submitted_at,
      'correct_count', v_s.correct_count,
      'score_percent', v_s.score_percent,
      'xp_earned', v_s.xp_earned,
      'bonus_xp', v_s.bonus_xp,
      'time_spent_seconds', v_s.time_spent_seconds,
      'breakdown', v_s.breakdown,
      'auto_submitted', v_s.auto_submitted,
      'new_achievements', coalesce((
        select jsonb_agg(to_jsonb(a) order by a.sort_order)
          from public.achievements a where a.id = any (v_s.new_achievements)
      ), '[]'::jsonb),
      'answers', coalesce((
        select jsonb_agg(jsonb_build_object(
                'question_id', q.id,
                'technology', q.technology,
                'difficulty', q.difficulty,
                'question', q.question,
                'code', q.code,
                'options', q.options,
                'correct_index', q.correct_index,
                'explanation', q.explanation,
                'selected_index', a.selected_index,
                'is_correct', a.is_correct,
                'xp_awarded', a.xp_awarded,
                'position', a.position
              ) order by a.position)
          from public.test_answers a
          join public.questions q on q.id = a.question_id
        where a.session_id = v_s.id
      ), '[]'::jsonb)
    );
  end;
  $$;

  -- ---------------------------------------------------------------------
  -- Leaderboards (computed from real data)
  -- ---------------------------------------------------------------------
  create or replace function public.get_leaderboard(p_period text default 'all', p_limit integer default 50)
  returns table (
    rank            bigint,
    user_id         uuid,
    username        text,
    full_name       text,
    avatar_url      text,
    level           integer,
    xp              bigint,
    total_xp        integer,
    tests_completed bigint
  )
  language plpgsql
  stable
  security definer
  set search_path = public
  as $$
  #variable_conflict use_column
  declare
    v_from timestamptz;
  begin
    if auth.uid() is null then
      raise exception 'not_authenticated';
    end if;

    if p_period = 'week' then
      v_from := date_trunc('week', now());
    elsif p_period = 'month' then
      v_from := date_trunc('month', now());
    else
      v_from := null;
    end if;

    if v_from is null then
      return query
        select rank() over (order by p.xp desc, p.tests_completed desc, p.created_at),
              p.id, p.username, p.full_name, p.avatar_url, p.level,
              p.xp::bigint, p.xp, p.tests_completed::bigint
          from public.profiles p
        where p.role = 'student' and not p.is_blocked
        order by p.xp desc, p.tests_completed desc, p.created_at
        limit least(greatest(p_limit, 1), 200);
    else
      return query
        with period_xp as (
          select e.user_id, sum(e.amount)::bigint as xp
            from public.xp_events e
          where e.created_at >= v_from
          group by e.user_id
        ),
        period_tests as (
          select s.user_id, count(*)::bigint as cnt
            from public.test_sessions s
          where s.status = 'submitted' and s.submitted_at >= v_from
          group by s.user_id
        )
        select rank() over (order by px.xp desc, coalesce(pt.cnt, 0) desc, p.created_at),
              p.id, p.username, p.full_name, p.avatar_url, p.level,
              px.xp, p.xp, coalesce(pt.cnt, 0)
          from period_xp px
          join public.profiles p on p.id = px.user_id
          left join period_tests pt on pt.user_id = p.id
        where p.role = 'student' and not p.is_blocked and px.xp > 0
        order by px.xp desc, coalesce(pt.cnt, 0) desc, p.created_at
        limit least(greatest(p_limit, 1), 200);
    end if;
  end;
  $$;

  create or replace function public.get_user_rank(p_user_id uuid default null)
  returns integer
  language sql
  stable
  security definer
  set search_path = public
  as $$
    select r.rnk::integer from (
      select p.id, rank() over (order by p.xp desc, p.tests_completed desc, p.created_at) as rnk
        from public.profiles p
      where p.role = 'student' and not p.is_blocked
    ) r
    where r.id = coalesce(p_user_id, auth.uid());
  $$;

  -- ---------------------------------------------------------------------
  -- Admin RPCs (server-side role check)
  -- ---------------------------------------------------------------------
  create or replace function public.admin_overview()
  returns jsonb
  language plpgsql
  stable
  security definer
  set search_path = public
  as $$
  begin
    if not public.is_admin() then
      raise exception 'forbidden';
    end if;
    return jsonb_build_object(
      'students', (select count(*) from public.profiles where role = 'student'),
      'blocked', (select count(*) from public.profiles where is_blocked),
      'questions', (select count(*) from public.questions),
      'active_questions', (select count(*) from public.questions where is_active),
      'tests_total', (select count(*) from public.test_sessions where status = 'submitted'),
      'tests_today', (select count(*) from public.test_sessions where status = 'submitted' and submitted_at >= date_trunc('day', now())),
      'average_score', (select coalesce(round(avg(score_percent), 1), 0) from public.test_sessions where status = 'submitted'),
      'xp_total', (select coalesce(sum(xp), 0) from public.profiles),
      'questions_by_technology', (
        select coalesce(jsonb_object_agg(t.id, (select count(*) from public.questions q where q.technology = t.id)), '{}'::jsonb)
          from public.technologies t),
      'tests_last_14_days', (
        select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'count', (
                select count(*) from public.test_sessions s
                  where s.status = 'submitted' and s.submitted_at::date = d::date)) order by d), '[]'::jsonb)
          from generate_series(current_date - 13, current_date, interval '1 day') d)
    );
  end;
  $$;

  create or replace function public.admin_update_profile(
    p_user_id    uuid,
    p_full_name  text,
    p_username   text,
    p_role       text,
    p_is_blocked boolean
  )
  returns void
  language plpgsql
  security definer
  set search_path = public
  as $$
  begin
    if not public.is_admin() then
      raise exception 'forbidden';
    end if;
    if p_user_id = auth.uid() and (p_role <> 'admin' or p_is_blocked) then
      raise exception 'cannot_demote_self';
    end if;
    update public.profiles
      set full_name = trim(p_full_name),
          username = lower(trim(p_username)),
          role = p_role,
          is_blocked = p_is_blocked
    where id = p_user_id;
  end;
  $$;

  create or replace function public.admin_adjust_xp(p_user_id uuid, p_amount integer, p_note text)
  returns integer
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    v_old integer;
    v_new integer;
  begin
    if not public.is_admin() then
      raise exception 'forbidden';
    end if;
    if p_amount = 0 or abs(p_amount) > 100000 then
      raise exception 'invalid_amount';
    end if;

    select xp into v_old from public.profiles where id = p_user_id for update;
    if not found then
      raise exception 'user_not_found';
    end if;
    v_new := greatest(v_old + p_amount, 0);

    update public.profiles set xp = v_new, level = public.level_for_xp(v_new) where id = p_user_id;
    insert into public.xp_events (user_id, amount, reason, note)
    values (p_user_id, v_new - v_old, 'admin', left(coalesce(p_note, ''), 200));
    return v_new;
  end;
  $$;

  create or replace function public.admin_reset_progress(p_user_id uuid)
  returns void
  language plpgsql
  security definer
  set search_path = public
  as $$
  begin
    if not public.is_admin() then
      raise exception 'forbidden';
    end if;
    delete from public.test_sessions where user_id = p_user_id;
    delete from public.xp_events where user_id = p_user_id;
    delete from public.student_achievements where user_id = p_user_id;
    update public.profiles
      set xp = 0, level = 1, tests_completed = 0, total_score = 0, average_score = 0,
          best_score = 0, current_streak = 0, longest_streak = 0, last_activity_date = null
    where id = p_user_id;
  end;
  $$;

  -- Function execution: signed-in users only
  revoke execute on function
    public.start_test(text[], text, integer, integer),
    public.get_active_session_id(),
    public.get_test_session(uuid),
    public.save_answer(uuid, text, integer),
    public.submit_test(uuid, jsonb),
    public.get_test_result(uuid),
    public.get_leaderboard(text, integer),
    public.get_user_rank(uuid),
    public.admin_overview(),
    public.admin_update_profile(uuid, text, text, text, boolean),
    public.admin_adjust_xp(uuid, integer, text),
    public.admin_reset_progress(uuid)
  from public, anon;

  grant execute on function
    public.start_test(text[], text, integer, integer),
    public.get_active_session_id(),
    public.get_test_session(uuid),
    public.save_answer(uuid, text, integer),
    public.submit_test(uuid, jsonb),
    public.get_test_result(uuid),
    public.get_leaderboard(text, integer),
    public.get_user_rank(uuid),
    public.admin_overview(),
    public.admin_update_profile(uuid, text, text, text, boolean),
    public.admin_adjust_xp(uuid, integer, text),
    public.admin_reset_progress(uuid)
  to authenticated;
