-- 003 — ترتيب المنتجات + جدول الزيارات
-- شغّله مرة واحدة في Supabase > SQL Editor (بعد setup.sql و seed.sql)

-- 1) ترتيب المنتجات
alter table products add column if not exists sort_order int;
update products p set sort_order = s.rn
from (select id, row_number() over (order by created_at, code) as rn from products) s
where p.id = s.id and p.sort_order is null;

-- 2) عدّاد الزيارات (لو شغّلتيه قبل كده وطلعلك خطأ إن الـ policy موجودة، تجاهليه)
create table if not exists visits (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  created_at timestamptz default now());
alter table visits enable row level security;
create policy "log visit" on visits for insert to anon, authenticated with check (length(visitor_id) between 8 and 64);
create policy "admin read visits" on visits for select to authenticated using (true);
create policy "admin delete visits" on visits for delete to authenticated using (true);
