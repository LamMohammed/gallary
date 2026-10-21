-- 005 — تنظيف المحتوى + مسارات الصور الجديدة (آمن للتشغيل أكتر من مرة)

-- المسافات الزايدة في الوصف + النقطة الوسطى اللي في آخر النص
update public.products
   set era = btrim(regexp_replace(regexp_replace(era, '\s+', ' ', 'g'), '\s*·\s*$', ''))
 where era ~ '\s{2,}' or era ~ '·\s*$' or era <> btrim(era);

-- مسارات الصور القديمة images/gold-1.webp → images/products/gold/gold-1.webp
-- (الموقع الجديد بيحوّلها تلقائيًا في الواجهة، فده اختياري بس أنضف)
update public.products
   set image = regexp_replace(image, '^images/(gold|crystal|acrylic)-(\d+)\.webp$', 'images/products/\1/\1-\2.webp')
 where image ~ '^images/(gold|crystal|acrylic)-\d+\.webp$';
