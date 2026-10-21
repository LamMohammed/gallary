-- ============================================================
-- 006 — نسخ المنتج (ألوان / مقاسات) + إعدادات الموقع (الاسم والرقم)
-- شغّله بعد 004_security.sql (بيستخدم دالة is_admin()).
-- آمن للتشغيل أكتر من مرة.
-- ============================================================

-- 1) أعمدة النسخ في جدول المنتجات ------------------------------
--   group_id   : نفس القيمة = نفس الدرع بنسخ مختلفة (بتظهر بطاقة واحدة)
--   variant_by : 'color' (اختيار بالألوان وصورها) أو 'size' (قائمة مقاسات)
--   color_hex  : لون العينة الدائرية (اختياري، لو الاسم مش معروف تلقائيًا)
alter table public.products add column if not exists group_id   text;
alter table public.products add column if not exists variant_by text;
alter table public.products add column if not exists color_hex  text;

alter table public.products drop constraint if exists products_variant_by_chk;
alter table public.products add  constraint products_variant_by_chk
  check (variant_by is null or variant_by in ('color', 'size'));

alter table public.products drop constraint if exists products_group_id_chk;
alter table public.products add  constraint products_group_id_chk
  check (group_id is null or group_id ~ '^[A-Za-z0-9_-]{1,100}$');

alter table public.products drop constraint if exists products_color_hex_chk;
alter table public.products add  constraint products_color_hex_chk
  check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$');

create index if not exists products_group_idx on public.products (group_id);

-- 2) إعدادات الموقع ---------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now(),
  constraint site_settings_valid check (
    (key = 'whatsapp_number' and value ~ '^[1-9][0-9]{7,14}$')
    or (key = 'contact_name' and char_length(btrim(value)) between 1 and 60)
  )
);

alter table public.site_settings enable row level security;

drop policy if exists "read settings"   on public.site_settings;
drop policy if exists "admin settings"  on public.site_settings;
create policy "read settings"  on public.site_settings for select to anon, authenticated using (true);
create policy "admin settings" on public.site_settings for all    to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public._touch_settings() returns trigger
language plpgsql as $$ begin new.updated_at := now(); return new; end; $$;
drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public._touch_settings();

-- القيم الافتراضية (الرقم السعودي) — لو موجودة قبل كده مش بتتغير
insert into public.site_settings (key, value) values
  ('whatsapp_number', '966550074405'),
  ('contact_name',    'محمد رضا')
on conflict (key) do nothing;
