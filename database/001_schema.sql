-- 001 — الجداول الأساسية + سياسات القراءة + مخزن الصور
-- شغّله مرة واحدة في Supabase > SQL Editor (لو شغّلته قبل كده، تخطاه)
create table if not exists categories (id text primary key, label text not null, prefix text not null default '');
create table if not exists products (
  id text primary key, code text unique not null, name text not null,
  cat text not null references categories(id), color text not null, size text not null,
  era text not null, image text not null, created_at timestamptz default now());
create table if not exists inquiries (
  id bigint generated always as identity primary key,
  product_id text not null references products(id) on delete cascade,
  qty int not null default 1, source text, created_at timestamptz default now());
alter table categories enable row level security;
alter table products enable row level security;
alter table inquiries enable row level security;
create policy "read categories" on categories for select using (true);
create policy "read products" on products for select using (true);
create policy "log inquiry" on inquiries for insert to anon, authenticated with check (qty between 1 and 10000);
create policy "admin categories" on categories for all to authenticated using (true) with check (true);
create policy "admin products" on products for all to authenticated using (true) with check (true);
create policy "admin read inquiries" on inquiries for select to authenticated using (true);
create policy "admin delete inquiries" on inquiries for delete to authenticated using (true);
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
create policy "admin upload images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "admin update images" on storage.objects for update to authenticated using (bucket_id = 'product-images');
create policy "admin delete images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');
