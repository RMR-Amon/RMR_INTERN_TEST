-- =====================================================================
-- R_M_R TEST FOR INTERN — extra admin tools
--   * admin_get_email   — admins can see a user's email
--   * admin_delete_user — admins can permanently delete an account
-- Run after 0003.
-- =====================================================================

create or replace function public.admin_get_email(p_user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  return (select email from auth.users where id = p_user_id);
end;
$$;

/**
 * Deletes the auth user; profile, sessions, answers, XP log and earned
 * achievements are removed by ON DELETE CASCADE.
 */
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'cannot_delete_self';
  end if;
  delete from auth.users where id = p_user_id;
  if not found then
    raise exception 'user_not_found';
  end if;
end;
$$;

revoke execute on function public.admin_get_email(uuid) from public, anon;
revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_get_email(uuid) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
