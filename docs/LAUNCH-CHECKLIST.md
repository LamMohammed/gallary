# قائمة الإطلاق (SEO + نشر)

## قبل النشر
- [ ] شغّل `database/004_security.sql` ثم `005_content_cleanup.sql` ثم `006_variants_and_settings.sql` (ولو القاعدة جديدة 001 → 003 قبلهم)
- [ ] نفّذ خطوات `docs/SECURITY.md` اليدوية
- [ ] `python tools/build.py --domain https://دومينك.com` (بيحدّث canonical / OG / JSON-LD / sitemap / robots)
- [ ] `python tools/build.py --live` لو المنتجات في القاعدة اتغيّرت عن الكتالوج الاحتياطي
- [ ] غيّري `CACHE_VERSION` في `site/service-worker.js` (مثلًا `meem-v5`)
- [ ] اختبري صورة المشاركة: ارسلي الرابط لنفسك على واتساب وتأكدي إن الصورة والعنوان بيظهروا

## بعد النشر
- [ ] سجّلي الموقع في **Google Search Console** وأرسلي `sitemap.xml`
- [ ] أنشئي **Google Business Profile** (فيه مكان البيزنس + واتساب + صور) — أقوى خطوة للبحث المحلي
- [ ] اختبري بـ Rich Results Test و PageSpeed Insights
- [ ] اربطي الرابط في بروفايلات السوشيال وفي توقيع الواتساب Business

## تحسينات SEO أكبر (المرحلة الجاية)
- صفحات مستقلة لكل خامة (`/gold` `/crystal` `/acrylic`) بنصوص وصور — دي اللي بتجيب بحث حقيقي.
- صفحة «اتصل بنا» فيها العنوان ومواعيد العمل (يتحوّل لـ LocalBusiness schema).
- صفحة أعمال سابقة / عملاء بصور تسليم فعلية.
- مدونة قصيرة: «كيف تختار درع تكريم؟»، «الفرق بين الكريستال والأكريليك».
