/* ============================================================
   site-controls.js — نصوص الصفحة الرئيسية، شريط الإعلان، عرض الأسعار
   بتتخزّن في site_settings، والموقع بيقراها عند التحميل (catalog.js → applySettingsObject).
   النص الفاضي = الموقع بيعرض نصه الأصلي من index.html.
   ============================================================ */
(() => {
  const $ = (id) => document.getElementById(id);
  const A = () => window.MeemAdmin;
  const FIELD = { hero_kicker: "scKicker", hero_title: "scTitle", hero_text: "scText", footer_text: "scFooter", banner_text: "scBanner" };
  const LIMIT = { hero_kicker: 80, hero_title: 80, hero_text: 200, footer_text: 200, banner_text: 200 };
  const LABEL = { hero_kicker: "السطر الصغير", hero_title: "العنوان الرئيسي", hero_text: "الوصف", footer_text: "جملة الفوتر", banner_text: "شريط الإعلان" };
  /* النصوص الأصلية في index.html: بتظهر كـ placeholder عشان تعرف إيه اللي هيظهر لو سيبت الخانة فاضية */
  const ORIGINAL = {
    hero_kicker: "تفاصيل تليق بلحظة الإنجاز",
    hero_title: "نحتفي\nبكل إنجاز",
    hero_text: "دروع تكريم من الذهبي والكريستال والأكريليك المنقوش، بكود لكل تصميم.",
    footer_text: "اختر التصميم وأرسل لنا كوده والكمية عبر واتساب.",
    banner_text: "مثال: مواعيد العمل خلال الإجازة",
  };
  const say = (text, type = "ok") => { const el = $("scMsg"); el.textContent = text; el.className = "msg " + type; };

  Object.entries(ORIGINAL).forEach(([k, v]) => { $(FIELD[k]).placeholder = v; });

  async function load() {
    try {
      const rows = await A().api("/rest/v1/site_settings?select=key,value");
      const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      Object.keys(FIELD).forEach((k) => { $(FIELD[k]).value = s[k] || ""; });
      $("scPrices").checked = s.show_prices !== "0";
    } catch (e) { /* الجدول لسه ما اتعملش: الخانات تفضل فاضية */ }
  }

  async function save(resetTexts) {
    const vals = {};
    for (const k of Object.keys(FIELD)) {
      const v = resetTexts ? "" : $(FIELD[k]).value.trim();
      if (v.length > LIMIT[k]) return say(`${LABEL[k]} أطول من ${A().ar(LIMIT[k])} حرف.`, "err");
      vals[k] = v;
    }
    const body = [...Object.entries(vals).map(([key, value]) => ({ key, value })), { key: "show_prices", value: $("scPrices").checked ? "1" : "0" }];
    const btns = $("sc").querySelectorAll("button"); btns.forEach((b) => { b.disabled = true; });
    say("جاري الحفظ…");
    try {
      await A().api("/rest/v1/site_settings?on_conflict=key", { method: "POST", body, headers: { Prefer: "resolution=merge-duplicates,return=minimal" } });
      if (resetTexts) Object.keys(FIELD).forEach((k) => { $(FIELD[k]).value = ""; });
      say(resetTexts ? "رجعت النصوص الأصلية. الموقع بيتحدّث عند أي زائر خلال لحظات." : "اتحفظ. الموقع بيعرض التغيير عند أي زائر خلال لحظات.");
    } catch (err) {
      say(/site_settings_valid|violates|check constraint/i.test(err.message) ? "شغّل database/010_site_controls.sql في Supabase (SQL Editor) الأول، وبعدين جرّب تاني." : A().friendly(err), "err");
    }
    btns.forEach((b) => { b.disabled = false; });
  }

  $("sc").addEventListener("submit", (e) => { e.preventDefault(); save(false); });
  $("scReset").addEventListener("click", () => { if (confirm("ترجّع كل النصوص للأصلية؟ (عرض الأسعار مش هيتغيّر)")) save(true); });
  document.addEventListener("meem:loaded", load);
})();
