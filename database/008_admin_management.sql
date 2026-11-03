-- ============================================================
-- 008_admin_management.sql — إدارة المسؤولين من لوحة الإدارة
-- شغّله بعد 004_security.sql (بيستخدم is_admin()).
-- الجدول admins مقفول على الـ API، فالإضافة/الحذف بتتم عبر دوال محمية.
-- ============================================================

create or replace function public.list_admins()
returns table (user_id uuid, email text, created_at timestamptz)
language plpgsql stable security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  return query
    select a.user_id, coalesce(a.email, u.email)::text, a.created_at
    from public.admins a left join auth.users u on u.id = a.user_id
    order by a.created_at nulls first;
end $$;

create or replace function public.add_admin(p_email text)
returns void
language plpgsql security definer
set search_path = public, auth
as $$
declare v_id uuid;
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if v_id is null then raise exception 'USER_NOT_FOUND'; end if;
  insert into public.admins (user_id, email) values (v_id, lower(trim(p_email)))
  on conflict (user_id) do nothing;
end $$;

create or replace function public.remove_admin(p_user_id uuid)
returns void
language plpgsql security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  if p_user_id = auth.uid() then raise exception 'CANNOT_REMOVE_SELF'; end if;
  delete from public.admins where user_id = p_user_id;
end $$;

revoke all on function public.list_admins()        from public, anon;
revoke all on function public.add_admin(text)      from public, anon;
revoke all on function public.remove_admin(uuid)   from public, anon;
grant execute on function public.list_admins()      to authenticated;
grant execute on function public.add_admin(text)    to authenticated;
grant execute on function public.remove_admin(uuid) to authenticated;
