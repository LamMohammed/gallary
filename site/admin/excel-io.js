/* ============================================================
   excel-io.js — تصدير واستيراد المنتجات بملف Excel (.xlsx)
   التصدير: صف لكل منتج (الكود · الاسم · الوصف · النوع · اللون · المقاس · السعر · لون العينة).
   الاستيراد: بيقرأ الملف ويعرض كل تغيير (قبل ← بعد) وما بيحفظش غير بعد ما تأكّد.
   الكود هو المفتاح (فريد في قاعدة البيانات)، فمفيش لخبطة بين النسخ.
   مكتبة ExcelJS (MIT) في vendor/ وبتتحمّل لما تضغط الزرار.
   ============================================================ */
(() => {
  const $ = (id) => document.getElementById(id);
  const A = () => window.MeemAdmin;
  const enc = encodeURIComponent;

  const COLS = [
    { key: "code", head: "الكود", w: 14 },
    { key: "name", head: "الاسم", w: 34 },
    { key: "era", head: "الوصف", w: 40 },
    { key: "cat", head: "النوع", w: 18 },
    { key: "color", head: "اللون", w: 16 },
    { key: "size", head: "المقاس", w: 18 },
    { key: "price", head: "السعر", w: 16 },
    { key: "color_hex", head: "لون العينة", w: 14 },
  ];
  const LABEL = Object.fromEntries(COLS.map((c) => [c.key, c.head]));
  const LIMITS = { name: 100, era: 120, color: 50, size: 60, price: 40 };
  const SHARED = ["name", "era", "cat"];   // مشتركة بين كل نسخ الشكل الواحد
  const MAX_BYTES = 8 * 1024 * 1024;

  let loading = null;
  const loadLib = () => loading || (loading = new Promise((res, rej) => {
    if (window.ExcelJS) return res(window.ExcelJS);
    const s = document.createElement("script");
    s.src = "vendor/exceljs.min.js";
    s.onload = () => (window.ExcelJS ? res(window.ExcelJS) : rej(new Error("مكتبة Excel ما اتحمّلتش.")));
    s.onerror = () => { loading = null; rej(new Error("مكتبة Excel ما اتحمّلتش — اتأكد من الاتصال وجرّب تاني.")); };
    document.head.appendChild(s);
  }));

  const norm = (s) => String(s ?? "").replace(/[\u200e\u200f]/g, "").trim();
  const key = (s) => norm(s).replace(/[أإآ]/g, "ا").replace(/\s+/g, "");
  const HEAD_KEYS = Object.fromEntries(COLS.map((c) => [key(c.head), c.key]));
  HEAD_KEYS[key("كود")] = "code";
  HEAD_KEYS[key("وصف مختصر")] = "era";
  HEAD_KEYS[key("الخامة")] = "cat";

  /* ================= التصدير ================= */
  async function exportXlsx(btn) {
    const { products, cats, msg } = A();
    const old = btn.textContent; btn.disabled = true; btn.textContent = "⏳ جاري التجهيز…";
    try {
      const X = await loadLib();
      const label = (id) => (cats.find((c) => c.id === id) || { label: id }).label;
      const wb = new X.Workbook(); wb.creator = "شركة ميم";
      const ws = wb.addWorksheet("المنتجات", { views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }] });
      ws.columns = COLS.map((c) => ({ header: c.head, key: c.key, width: c.w }));
      products.forEach((p) => ws.addRow({ code: p.code, name: p.name, era: p.era || "", cat: label(p.cat), color: p.color || "", size: p.size || "", price: p.price || "", color_hex: p.color_hex || "" }));

      const head = ws.getRow(1); head.height = 24;
      head.eachCell((c) => { c.font = { bold: true, color: { argb: "FFF5E3A0" }, size: 12 }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B1F3A" } }; c.alignment = { horizontal: "center", vertical: "middle" }; });
      for (let r = 2; r <= products.length + 1; r++) {
        ws.getRow(r).eachCell({ includeEmpty: true }, (c, n) => {
          c.numFmt = "@";                                   // نص دايمًا: ما يتحوّلش لتاريخ أو رقم
          c.alignment = { horizontal: "right", vertical: "middle", wrapText: true };
          if (n === 1) { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEAE0" } }; c.font = { color: { argb: "FF64748B" }, bold: true }; }
        });
      }
      /* قايمة منسدلة للنوع */
      const lists = wb.addWorksheet("القوائم", { state: "hidden" });
      cats.forEach((c, i) => { lists.getCell(i + 1, 1).value = c.label; });
      for (let r = 2; r <= products.length + 1; r++) {
        ws.getCell(r, 4).dataValidation = { type: "list", allowBlank: false, formulae: [`'القوائم'!$A$1:$A$${Math.max(cats.length, 1)}`], showErrorMessage: true, errorTitle: "نوع غير موجود", error: "اختار نوع من القايمة." };
      }
      const help = wb.addWorksheet("تعليمات", { views: [{ rightToLeft: true }] });
      help.getColumn(1).width = 100;
      ["طريقة التعديل:",
       "1) عدّل أي خانة في ورقة «المنتجات» — ما عدا عمود «الكود» (هو اللي بيحدد أنهي منتج).",
       "2) الاسم والوصف والنوع بيتطبّقوا على كل نسخ الشكل الواحد (كل المقاسات والألوان). اللون والمقاس والسعر ولون العينة لكل نسخة لوحدها.",
       "3) النوع لازم يكون واحد من القايمة المنسدلة.",
       "4) الصفوف المحذوفة أو الأكواد الجديدة بتتجاهل: الإضافة من صفحة «إضافة منتج»، والحذف من صفحة المنتجات.",
       "5) ارفع الملف من لوحة الإدارة (استيراد Excel) وراجع التغييرات قبل التأكيد.",
      ].forEach((t, i) => { const c = help.getCell(i + 1, 1); c.value = t; c.alignment = { horizontal: "right", wrapText: true }; if (!i) c.font = { bold: true, size: 13 }; });

      const buf = await wb.xlsx.writeBuffer();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      a.download = "meem-products-" + new Date().toISOString().slice(0, 10) + ".xlsx";
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (err) { msg(err.message, "err"); alert(err.message); }
    btn.disabled = false; btn.textContent = old;
  }

  /* ================= الاستيراد: قراءة + خطة التغييرات ================= */
  async function readSheet(file) {
    if (file.size > MAX_BYTES) throw new Error("الملف كبير أوي (أكتر من ٨ ميجا).");
    const X = await loadLib(), wb = new X.Workbook();
    try { await wb.xlsx.load(await file.arrayBuffer()); } catch (e) { throw new Error("الملف مش Excel (.xlsx) صالح."); }
    const ws = wb.getWorksheet("المنتجات") || wb.worksheets[0];
    if (!ws) throw new Error("الملف فاضي.");
    const cols = {};
    ws.getRow(1).eachCell({ includeEmpty: false }, (c, n) => { const k = HEAD_KEYS[key(c.text)]; if (k && !cols[k]) cols[k] = n; });
    if (!cols.code) throw new Error("مش لاقي عمود «الكود» في أول صف. استخدم الملف اللي نزّلته من «تصدير Excel».");
    const rows = [];
    ws.eachRow({ includeEmpty: false }, (row, line) => {
      if (line === 1) return;
      const code = norm(row.getCell(cols.code).text);
      if (!code) return;
      const fields = {};
      Object.keys(cols).forEach((k) => { if (k !== "code") fields[k] = norm(row.getCell(cols[k]).text); });
      rows.push({ line, code, fields });
    });
    return { rows, has: Object.keys(cols).filter((k) => k !== "code") };
  }

  function buildPlan(rows) {
    const { products, cats } = A();
    const byCode = new Map(products.map((p) => [norm(p.code), p]));
    const byCodeLc = new Map(products.map((p) => [norm(p.code).toLowerCase(), p]));
    const catId = new Map(cats.map((c) => [norm(c.label), c.id]));
    const catLabel = (id) => (cats.find((c) => c.id === id) || { label: id }).label;
    const errors = [], items = new Map(), shared = new Map(), seen = new Set();
    const addChange = (p, field, to, via) => {
      const it = items.get(p.id) || { p, changes: [] };
      if (!it.changes.some((c) => c.field === field)) it.changes.push({ field, to, via });
      items.set(p.id, it);
    };
    let unchanged = 0;

    rows.forEach((r) => {
      const p = byCode.get(r.code) || byCodeLc.get(r.code.toLowerCase());
      if (!p) return errors.push({ code: r.code, msg: "الكود مش موجود — الإضافة من صفحة «إضافة منتج»." });
      if (seen.has(p.id)) return errors.push({ code: r.code, msg: "الكود متكرر في الملف — اتأخد أول صف بس." });
      seen.add(p.id);
      const want = {}, bad = [];
      for (const [k, v] of Object.entries(r.fields)) {
        if (k === "name") { if (!v) bad.push("الاسم مطلوب"); else if (v.length > LIMITS.name) bad.push("الاسم أطول من ١٠٠ حرف"); else want.name = v; }
        else if (k === "era") { if (!v && (p.era || "")) bad.push("الوصف مطلوب"); else if (v.length > LIMITS.era) bad.push("الوصف أطول من ١٢٠ حرف"); else want.era = v; }
        else if (k === "cat") { if (!catId.has(v)) bad.push(`النوع «${v}» مش موجود`); else want.cat = catId.get(v); }
        else if (k === "color_hex") { const h = v ? (v.startsWith("#") ? v : "#" + v).toUpperCase() : ""; if (h && !/^#[0-9A-F]{6}$/.test(h)) bad.push("لون العينة لازم يكون زي #C9A227"); else want.color_hex = h || null; }
        else if (v.length > LIMITS[k]) bad.push(`${LABEL[k]} أطول من ${A().ar(LIMITS[k])} حرف`);
        else want[k] = k === "price" ? (v || null) : v;
      }
      if (bad.length) return errors.push({ code: r.code, msg: bad.join(" · ") });
      let changed = false;
      for (const [k, to] of Object.entries(want)) {
        const from = k === "color_hex" || k === "price" ? (p[k] ?? null) : (p[k] ?? "");
        if ((from ?? "") === (to ?? "")) continue;
        changed = true;
        if (SHARED.includes(k)) {
          const g = p.group_id || p.id, kk = g + "|" + k;
          if (!shared.has(kk)) shared.set(kk, new Map());
          const m = shared.get(kk); if (!m.has(to)) m.set(to, []); m.get(to).push(p.code);
        } else addChange(p, k, to, null);
      }
      if (!changed) unchanged++;
    });

    /* الاسم والوصف والنوع: بتتطبّق على كل نسخ المجموعة */
    shared.forEach((vals, kk) => {
      const [g, field] = [kk.slice(0, kk.lastIndexOf("|")), kk.slice(kk.lastIndexOf("|") + 1)];
      if (vals.size > 1) return errors.push({ code: [...vals.values()].flat().join("، "), msg: `${LABEL[field]} متعارض بين نسخ نفس المنتج — اتجاهل.` });
      const [[to, codes]] = [...vals.entries()];
      products.filter((x) => (x.group_id || x.id) === g).forEach((x) => {
        if ((x[field] ?? "") !== to) addChange(x, field, to, codes.includes(x.code) ? null : codes[0]);
      });
    });

    const order = new Map(products.map((p, i) => [p.id, i]));
    const list = [...items.values()].sort((a, b) => order.get(a.p.id) - order.get(b.p.id));
    list.forEach((it) => it.changes.forEach((c) => {
      c.from = c.field === "cat" ? catLabel(it.p.cat) : (it.p[c.field] ?? "");
      c.show = c.field === "cat" ? catLabel(c.to) : (c.to ?? "");
    }));
    return { list, errors, unchanged, total: list.reduce((n, it) => n + it.changes.length, 0) };
  }

  /* ================= نافذة المراجعة + التطبيق ================= */
  let current = null;
  function renderReview(plan, fileName) {
    const { esc, ar } = A();
    current = plan;
    const rows = []; let shown = 0;
    plan.list.forEach((it) => it.changes.forEach((c) => {
      if (shown >= 300) return; shown++;
      rows.push(`<tr><td dir="ltr"><b>${esc(it.p.code)}</b></td><td>${esc(LABEL[c.field])}${c.via ? `<div class="imp-note">تلقائي — نفس مجموعة ${esc(c.via)}</div>` : ""}</td><td class="imp-from">${esc(String(c.from)) || "—"}</td><td class="imp-to">${esc(String(c.show)) || "—"}</td></tr>`);
    }));
    $("impSum").innerHTML = plan.list.length
      ? `<b>${ar(plan.list.length)}</b> منتج هيتغيّر (<b>${ar(plan.total)}</b> تغيير) من الملف <span dir="ltr">${esc(fileName)}</span>.${plan.unchanged ? ` ${ar(plan.unchanged)} صف من غير تغيير.` : ""}`
      : `مفيش أي تغيير في الملف${plan.unchanged ? ` (${ar(plan.unchanged)} صف مطابق للموجود)` : ""}.`;
    $("impTable").innerHTML = rows.length
      ? `<table><thead><tr><th>الكود</th><th>الحقل</th><th>قبل</th><th>بعد</th></tr></thead><tbody>${rows.join("")}</tbody></table>${plan.total > 300 ? `<p class="imp-note" style="padding:8px 10px">وفيه ${ar(plan.total - 300)} تغيير تاني مش معروض هنا، وهيتطبّق مع الباقي.</p>` : ""}`
      : "";
    $("impErrs").innerHTML = plan.errors.length
      ? `<div class="imp-errs"><b>${ar(plan.errors.length)} صف مش هيتطبّق:</b><ul>${plan.errors.slice(0, 30).map((e) => `<li><b dir="ltr">${esc(e.code)}</b> — ${esc(e.msg)}</li>`).join("")}</ul>${plan.errors.length > 30 ? `<div class="imp-note">وغيرهم ${ar(plan.errors.length - 30)}.</div>` : ""}</div>`
      : "";
    $("impMsg").className = "msg";
    $("impApply").disabled = !plan.list.length;
    $("impApply").textContent = "💾 تطبيق " + (plan.list.length ? ar(plan.list.length) + " منتج" : "التغييرات");
    $("imp").showModal();
  }

  async function handleFile(file) {
    const { msg } = A();
    try {
      const { rows } = await readSheet(file);
      renderReview(buildPlan(rows), file.name);
    } catch (err) { msg(err.message, "err"); alert(err.message); }
  }

  async function applyPlan() {
    const { api, friendly, msg, ar } = A();
    if (!current || !current.list.length) return;
    const btn = $("impApply"), todo = current.list.slice(); let done = 0; const failed = [];
    btn.disabled = true; $("impCancel").disabled = true;
    const worker = async () => {
      while (todo.length) {
        const it = todo.shift(), body = Object.fromEntries(it.changes.map((c) => [c.field, c.to]));
        try {
          await api(`/rest/v1/products?id=eq.${enc(it.p.id)}`, { method: "PATCH", body, headers: { Prefer: "return=minimal" } });
          Object.assign(it.p, body); done++;
        } catch (err) { failed.push({ code: it.p.code, err }); }
        btn.textContent = "⏳ " + ar(done + failed.length) + "/" + ar(current.list.length);
      }
    };
    await Promise.all(Array.from({ length: 5 }, worker));
    A().refreshList();
    $("impCancel").disabled = false;
    if (!failed.length) { $("imp").close(); msg(`اتحدّث ${ar(done)} منتج.`, "ok"); return; }
    $("impMsg").className = "msg err";
    $("impMsg").textContent = `اتحدّث ${ar(done)} وفشل ${ar(failed.length)} (${failed.slice(0, 5).map((f) => f.code).join("، ")}): ${friendly(failed[0].err)}`;
    current = { ...current, list: current.list.filter((it) => failed.some((f) => f.code === it.p.code)) };
    btn.disabled = false; btn.textContent = "إعادة محاولة الفاشل";
  }

  document.querySelectorAll(".js-xlsx-export").forEach((b) => b.addEventListener("click", (e) => exportXlsx(e.currentTarget)));
  document.querySelectorAll(".js-xlsx-import").forEach((b) => b.addEventListener("click", () => { $("impFile").value = ""; $("impFile").click(); }));
  $("impFile").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) handleFile(f); });
  $("impApply").addEventListener("click", applyPlan);
  $("impCancel").addEventListener("click", () => $("imp").close());
  $("impClose").addEventListener("click", () => $("imp").close());
  $("imp").addEventListener("click", (e) => { if (e.target === $("imp")) $("imp").close(); });
  window.MeemExcel = { exportXlsx, buildPlan, readSheet };
})();
