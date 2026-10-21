-- ============================================================
-- 007 — نسخ المنتج v2: لون ومقاس معًا + صورة النسخة اختيارية
-- شغّله بعد 006. آمن للتشغيل أكتر من مرة.
-- ============================================================

-- 1) النسخة ممكن تكون من غير صورة خاصة بيها (بتستخدم صورة المنتج الأساسي)
alter table public.products alter column image drop not null;

-- 2) variant_by بيقبل 'both' (لون ومقاس معًا).
--    ملحوظة: الموقع بيحدد محاور الاختيار (ألوان / مقاسات) من بيانات النسخ نفسها،
--    والعمود ده مجرد تلميح للأدمن.
alter table public.products drop constraint if exists products_variant_by_chk;
alter table public.products add  constraint products_variant_by_chk
  check (variant_by is null or variant_by in ('color', 'size', 'both'));

-- 3) أمان: لو في صورة لازم تكون من المسارات المسموحة (القيد بيعدّي على NULL)
--    (products_image_safe اتعمل في 004 — مفيش تغيير)
