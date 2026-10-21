-- ============================================================
-- 004 — تقوية الأمان (شغّله مرة واحدة بعد 001 و 002 و 003)
-- ============================================================
-- بيعمل:
--  1) جدول admins + دالة is_admin(): الصلاحيات للمسؤولين المحددين فقط
--     (بدل "أي مستخدم مسجّل" = أدمن)
--  2) يقفل الإدخال المباشر في inquiries/visits، ويستبدله بدوال RPC
--     عليها حد معدّل (Rate limit) لكل IP + تحقق من المدخلات
--  3) قيود على الصور في جدول products (بتمنع روابط غريبة)
--  4) تقييد مخزن الصور (النوع والحجم) وصلاحية الرفع للأدمن فقط
--
-- ⚠️ قبل التشغيل: تأكد إن حساب الأدمن موجود في Authentication > Users.
--    السكربت بيضيف كل المستخدمين الحاليين كأدمن — لو عندك أكتر من حساب
--    وعايز واحد بس، احذف الباقي من admins بعد التشغيل.
-- ============================================================

-- 1) الأدمن ---------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email   text,
  created_at timestamptz default now()
);
alter table public.admins enable row level security;
-- مفيش policies عمدًا: الجدول مقفول على الـ API ومقروء بس من داخل is_admin()

insert into public.admins (user_id, email)
select id, email from auth.users
on conflict (user_id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2) إعادة كتابة سياسات الأدمن --------------------------------
drop policy if exists "admin categories"        on public.categories;
drop policy if exists "admin products"          on public.products;
drop policy if exists "admin read inquiries"    on public.inquiries;
drop policy if exists "admin delete inquiries"  on public.inquiries;
drop policy if exists "admin read visits"       on public.visits;
drop policy if exists "admin delete visits"     on public.visits;

create policy "admin categories" on public.categories for all    to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin products"   on public.products   for all    to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin read inquiries"   on public.inquiries for select to authenticated using (public.is_admin());
create policy "admin delete inquiries" on public.inquiries for delete to authenticated using (public.is_admin());
create policy "admin read visits"      on public.visits    for select to authenticated using (public.is_admin());
create policy "admin delete visits"    on public.visits    for delete to authenticated using (public.is_admin());

-- 3) قفل الإدخال المباشر + دوال محمية بحد معدّل ---------------
drop policy if exists "log inquiry" on public.inquiries;
drop policy if exists "log visit"   on public.visits;

create table if not exists public.rate_events (
  id bigint generated always as identity primary key,
  ip text not null,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_events_lookup on public.rate_events (kind, ip, created_at desc);
alter table public.rate_events enable row level security;   -- بدون policies = مقفول على الـ API

create or replace function public._client_ip()
returns text language sql stable
as $$
  select coalesce(
    nullif(split_part(coalesce(current_setting('request.headers', true)::json ->> 'cf-connecting-ip',
                               current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1), ''),
    'unknown');
$$;

create or replace function public._rate_ok(p_kind text, p_limit int, p_window interval)
returns boolean
language plpgsql security definer
set search_path = public
as $$
declare v_ip text := public._client_ip(); v_count int;
begin
  if random() < 0.02 then delete from public.rate_events where created_at < now() - interval '2 days'; end if;
  select count(*) into v_count from public.rate_events
   where kind = p_kind and ip = v_ip and created_at > now() - p_window;
  if v_count >= p_limit then return false; end if;
  insert into public.rate_events (ip, kind) values (v_ip, p_kind);
  return true;
end;
$$;
revoke all on function public._rate_ok(text, int, interval) from public, anon, authenticated;

-- تسجيل زيارة: حد أقصى 10 في الساعة لكل IP
create or replace function public.log_visit(p_visitor text)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if p_visitor is null or length(p_visitor) not between 8 and 64 then return; end if;
  if not public._rate_ok('visit', 10, interval '1 hour') then return; end if;
  insert into public.visits (visitor_id) values (p_visitor);
end;
$$;

-- تسجيل استفسار (واحد أو أكتر): حد أقصى 30 طلب في الساعة لكل IP
create or replace function public.log_inquiry(p_items jsonb, p_source text default null)
returns void
language plpgsql security definer
set search_path = public
as $$
declare it jsonb; v_qty int; v_pid text;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then return; end if;
  if not public._rate_ok('inquiry', 30, interval '1 hour') then return; end if;
  if p_source is not null and p_source not in ('card', 'modal', 'bulk') then p_source := null; end if;
  for it in select * from jsonb_array_elements(p_items) loop
    v_pid := it ->> 'product_id';
    v_qty := least(greatest(coalesce((it ->> 'qty')::int, 1), 1), 10000);
    if v_pid is not null and exists (select 1 from public.products where id = v_pid) then
      insert into public.inquiries (product_id, qty, source) values (v_pid, v_qty, p_source);
    end if;
  end loop;
exception when others then
  return;  -- أي مدخل غريب يتجاهل بهدوء
end;
$$;

grant execute on function public.log_visit(text)           to anon, authenticated;
grant execute on function public.log_inquiry(jsonb, text)  to anon, authenticated;

-- 4) قيود على بيانات المنتجات ---------------------------------
-- (NOT VALID: بتتطبق على أي إضافة/تعديل جديد من غير ما تفشل على الصفوف القديمة)
alter table public.products drop constraint if exists products_image_safe;
alter table public.products add constraint products_image_safe
  check (image ~ '^(images/[A-Za-z0-9_/-]+\.(webp|png|jpe?g)|https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/product-images/[A-Za-z0-9_.-]+)$') not valid;
alter table public.products drop constraint if exists products_lengths;
alter table public.products add constraint products_lengths
  check (length(name) <= 100 and length(code) <= 30 and length(color) <= 50 and length(era) <= 120 and length(size) <= 60) not valid;

-- 5) مخزن الصور -----------------------------------------------
update storage.buckets
   set file_size_limit = 2097152,                                     -- 2MB
       allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png']
 where id = 'product-images';

drop policy if exists "admin upload images" on storage.objects;
drop policy if exists "admin update images" on storage.objects;
drop policy if exists "admin delete images" on storage.objects;
create policy "admin upload images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin update images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "admin delete images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- ============================================================
-- بعد التشغيل (من لوحة Supabase):
--  • Authentication > Sign In / Providers > Email → اقفل "Allow new users to sign up"
--  • Authentication > Attack Protection → فعّل CAPTCHA و Leaked password protection
--  • استخدم كلمة سر قوية فريدة لحساب الأدمن
-- ============================================================
