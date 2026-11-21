-- ============================================================
-- 010_site_controls.sql — تحكم الأدمن في الأنواع والمنتجات والنصوص
--   · ترتيب الأنواع (sort_order) وإخفاء نوع (hidden)
--   · إخفاء منتج من الموقع من غير حذفه (hidden)
--   · نصوص الصفحة الرئيسية، شريط إعلان، وعرض/إخفاء الأسعار (site_settings)
-- شغّله بعد 006 و 009 (بيستخدم is_admin() و site_settings).
-- ============================================================

alter table public.categories add column if not exists sort_order int;
alter table public.categories add column if not exists hidden boolean not null default false;
alter table public.products   add column if not exists hidden boolean not null default false;

-- الترتيب الأولي = الترتيب اللي الموقع بيعرضه دلوقتي (ذهبي ثم كريستال ثم أكريليك ثم الباقي بالاسم)
update public.categories c set sort_order = x.rn
from (
  select id, row_number() over (order by case id when 'gold' then 1 when 'crystal' then 2 when 'acrylic' then 3 else 99 end, id) as rn
  from public.categories
) x
where c.id = x.id and c.sort_order is null;

-- المنتج المخفي (أو اللي نوعه مخفي) ما بيطلعش للزوار نهائيًا، مش بس في الواجهة. الأدمن بيشوف الكل.
drop policy if exists "read products" on public.products;
create policy "read products" on public.products for select to anon, authenticated
  using (not hidden and not exists (select 1 from public.categories c where c.id = products.cat and c.hidden));

-- مفاتيح الإعدادات الجديدة
alter table public.site_settings drop constraint if exists site_settings_valid;
alter table public.site_settings add constraint site_settings_valid check (
     (key = 'whatsapp_number' and value ~ '^[1-9][0-9]{7,14}$')
  or (key = 'contact_name'    and char_length(btrim(value)) between 1 and 60)
  or (key in ('hero_kicker', 'hero_title')                  and char_length(value) <= 80)
  or (key in ('hero_text', 'footer_text', 'banner_text')     and char_length(value) <= 200)
  or (key = 'show_prices'     and value in ('0', '1'))
);
