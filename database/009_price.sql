-- ============================================================
-- 009_price.sql — خانة السعر لكل منتج (اختيارية، نص حر: "120 ريال" أو "يبدأ من 90")
-- ============================================================
alter table public.products add column if not exists price text;
alter table public.products drop constraint if exists products_price_len;
alter table public.products add constraint products_price_len check (price is null or length(price) <= 40);
