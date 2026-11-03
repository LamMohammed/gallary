/* ============================================================
   variants-bulk.js — إضافة ألوان / مقاسات لمنتج دفعة واحدة
   - اكتبي كل الألوان و/أو المقاسات مرة واحدة (سطر لكل واحد)
   - صورة اختيارية لكل لون ولكل مقاس (الصورة بتترفع مرة واحدة وتتشارك)
   - الموقع بيولّد كل التركيبات (لون × مقاس) وانتي بتراجعي الأكواد وتحفظي
   بيشتغل فوق window.MeemAdmin (متعرّف في dashboard.js)
   ============================================================ */
(() => {
  const $ = (id) => document.getElementById(id);
  const A = () => window.MeemAdmin;
  const norm = (v) => String(v || "").trim().toLowerCase().replace(/\s+/g, " ");
  const HEX = /#[0-9A-Fa-f]{6}\b/;
  const say = (t, type) => { $("vgMsg").textContent = t; $("vgMsg").className = "msg " + (type || "ok"); };

  let baseId = "", colors = [], sizes = [], rows = [], busy = false;
  const base = () => A().find(baseId);

  /* ---------- اختيار المنتج الأساسي ---------- */
  function fillBase() {
    const { products, groupVariants, esc } = A(), sel = $("vgBase"), cur = baseId || sel.value;
    const list = products.filter((p) => !p.group_id || groupVariants(p)[0].id === p.id);
    sel.innerHTML = `<option value="">— اختاري المنتج الأساسي —</option>` + list.map((p) =>
      `<option value="${esc(p.id)}">${esc(p.code)} — ${esc(p.name)} (${esc(p.color || "—")} / ${esc(p.size || "—")})</option>`).join("");
    if (cur && [...sel.options].some((o) => o.value === cur)) sel.value = cur;
    baseId = sel.value; renderBaseInfo();
  }
  function renderBaseInfo() {
    const b = base(), { groupVariants, imgSrc, imageOf, esc, ar } = A();
    $("vgBaseInfo").innerHTML = b
      ? `<img src="${esc(imgSrc(imageOf(b)))}" alt=""><div><b>${esc(b.name)}</b><br><small class="muted">${esc(b.code)} · ${esc(b.color || "—")} · ${esc(b.size || "—")} · ${ar(groupVariants(b).length)} نسخة حاليًا</small></div>`
      : "";
    $("vgWork").style.display = b ? "" : "none";
    buildRows();
  }
  $("vgBase").addEventListener("change", () => { baseId = $("vgBase").value; renderBaseInfo(); });
  document.addEventListener("meem:loaded", fillBase);

  /* ---------- قراءة الألوان والمقاسات من النص ---------- */
  const tokens = (txt) => String(txt).split(/[\n،;؛,]+/).map((x) => x.trim()).filter(Boolean);
  function parse() {
    const oldC = new Map(colors.map((c) => [norm(c.name), c])), oldS = new Map(sizes.map((s) => [norm(s.name), s]));
    const nc = [], ns = [], seenC = new Set(), seenS = new Set();
    tokens($("vgColors").value).forEach((t) => {
      const hex = (t.match(HEX) || [""])[0], name = t.replace(HEX, "").trim().slice(0, 50);
      if (!name || seenC.has(norm(name))) return; seenC.add(norm(name));
      const o = oldC.get(norm(name));
      nc.push(o ? { ...o, hex: hex || o.hex } : { name, hex, file: null, thumb: "" });
    });
    tokens($("vgSizes").value).forEach((t) => {
      const name = t.slice(0, 60);
      if (seenS.has(norm(name))) return; seenS.add(norm(name));
      ns.push(oldS.get(norm(name)) || { name, file: null, thumb: "" });
    });
    colors = nc; sizes = ns; renderPanels(); buildRows();
    say(colors.length || sizes.length ? `${A().ar(colors.length)} لون و ${A().ar(sizes.length)} مقاس جاهزين. ارفعي الصور (اختياري) وراجعي الأكواد تحت.` : "اكتبي لون أو مقاس واحد على الأقل.", colors.length || sizes.length ? "ok" : "err");
  }
  $("vgParse").addEventListener("click", parse);

  /* ---------- لوحات الألوان والمقاسات (صورة لكل واحد) ---------- */
  function renderPanels() {
    const { esc } = A();
    $("vgColorPanel").innerHTML = colors.map((c, i) => `
      <div class="vg-item" data-k="c" data-i="${i}">
        <span class="vg-thumb">${c.thumb ? `<img src="${esc(c.thumb)}" alt="">` : `<i class="vg-sw" style="background:${HEX.test(c.hex) ? esc(c.hex) : "transparent"}"></i>`}</span>
        <b>${esc(c.name)}</b>
        <input data-f="hex" dir="ltr" maxlength="7" placeholder="#C9A227" value="${esc(c.hex || "")}" aria-label="لون العينة">
        <label class="btn q sm">🖼️ صورة<input type="file" data-f="img" accept="image/png,image/jpeg,image/webp" hidden></label>
        ${c.file ? `<button type="button" class="btn q sm" data-f="noimg" title="شيل الصورة">✕</button>` : ""}
      </div>`).join("");
    $("vgSizePanel").innerHTML = sizes.map((s, i) => `
      <div class="vg-item" data-k="s" data-i="${i}">
        <span class="vg-thumb">${s.thumb ? `<img src="${esc(s.thumb)}" alt="">` : `<i class="vg-sw vg-sw--none"></i>`}</span>
        <b>${esc(s.name)}</b>
        <label class="btn q sm">🖼️ صورة<input type="file" data-f="img" accept="image/png,image/jpeg,image/webp" hidden></label>
        ${s.file ? `<button type="button" class="btn q sm" data-f="noimg" title="شيل الصورة">✕</button>` : ""}
      </div>`).join("");
    $("vgColorBox").style.display = colors.length ? "" : "none";
    $("vgSizeBox").style.display = sizes.length ? "" : "none";
  }
  async function onPanel(e) {
    const el = e.target.closest("[data-f]"), item = e.target.closest(".vg-item"); if (!el || !item) return;
    const arr = item.dataset.k === "c" ? colors : sizes, it = arr[+item.dataset.i];
    if (el.dataset.f === "hex" && e.type === "input") {
      it.hex = el.value.trim();
      const sw = item.querySelector(".vg-sw"); if (sw) sw.style.background = HEX.test(it.hex) ? it.hex : "transparent";
    } else if (el.dataset.f === "img" && e.type === "change" && el.files[0]) {
      it.file = el.files[0]; it.thumb = URL.createObjectURL(it.file); renderPanels(); renderRows();
    } else if (el.dataset.f === "noimg" && e.type === "click") {
      it.file = null; it.thumb = ""; renderPanels(); renderRows();
    }
  }
  ["vgColorPanel", "vgSizePanel"].forEach((id) => ["input", "change", "click"].forEach((ev) => $(id).addEventListener(ev, onPanel)));

  /* ---------- توليد التركيبات ---------- */
  function codePrefix(b) {
    const c = A().cats.find((x) => x.id === b.cat);
    return (c && c.prefix) || b.code.split("-")[0];
  }
  function buildRows() {
    const b = base(); if (!b) { rows = []; renderRows(); return; }
    const keep = new Map(rows.map((r) => [r.key, r]));
    const cs = colors.length ? colors : [null], ss = sizes.length ? sizes : [null], out = [];
    cs.forEach((c) => ss.forEach((s) => {
      if (!c && !s) return;
      const key = norm(c && c.name) + "|" + norm(s && s.name), old = keep.get(key);
      const same = norm(c ? c.name : b.color) === norm(b.color) && norm(s ? s.name : b.size) === norm(b.size);
      out.push(old ? { ...old, c, s } : { key, c, s, code: "", codeEdited: false, on: !same, dupBase: same });
    }));
    rows = out; assignCodes(); renderRows();
  }
  function assignCodes() {
    const b = base(); if (!b) return;
    const prefix = codePrefix(b).replace(/[^A-Za-z]/g, ""), used = new Set(A().products.map((p) => p.code.toLowerCase()));
    rows.forEach((r) => { if (r.codeEdited && r.code) used.add(r.code.trim().toLowerCase()); });
    let max = 0;
    A().products.forEach((p) => { const m = p.code.match(new RegExp("^" + prefix + "-(\\d+)$", "i")); if (m) max = Math.max(max, +m[1]); });
    rows.forEach((r) => {
      if (r.codeEdited) return;
      do { max++; r.code = `${prefix}-${String(max).padStart(3, "0")}`; } while (used.has(r.code.toLowerCase()));
      used.add(r.code.toLowerCase());
    });
  }
  const effThumb = (r) => (r.c && r.c.thumb) || (r.s && r.s.thumb) || "";
  const effSource = (r) => (r.c && r.c.file) ? "صورة اللون" : (r.s && r.s.file) ? "صورة المقاس" : "صورة الأساسي";
  function renderRows() {
    const b = base(), { esc, ar, imgSrc, imageOf } = A();
    if (!b) { $("vgRows").innerHTML = ""; $("vgSave").disabled = true; return; }
    $("vgRows").innerHTML = rows.length ? rows.map((r, i) => `
      <div class="vg-row ${r.on ? "" : "off"}" data-i="${i}">
        <label class="vg-on"><input type="checkbox" data-f="on" ${r.on ? "checked" : ""}></label>
        <img src="${esc(effThumb(r) || imgSrc(imageOf(b)))}" alt="">
        <div class="vg-lbl"><b>${esc(r.c ? r.c.name : b.color || "—")}</b> · <b>${esc(r.s ? r.s.name : b.size || "—")}</b>
          <small class="muted">${effSource(r)}${r.dupBase ? " · نفس لون ومقاس الأساسي (متعلّم عليه ✗ تلقائيًا)" : ""}</small></div>
        <input data-f="code" dir="ltr" maxlength="30" value="${esc(r.code)}" aria-label="الكود">
      </div>`).join("") : `<div class="empty">اكتبي ألوان أو مقاسات واضغطي «توليد».</div>`;
    const n = rows.filter((r) => r.on).length;
    $("vgCount").textContent = rows.length ? `${ar(n)} نسخة هتتضاف من ${ar(rows.length)}` : "";
    $("vgSave").disabled = busy || !n;
  }
  $("vgRows").addEventListener("input", (e) => {
    const el = e.target.closest("[data-f=code]"), row = e.target.closest(".vg-row"); if (!el || !row) return;
    const r = rows[+row.dataset.i]; r.code = el.value; r.codeEdited = true;
  });
  $("vgRows").addEventListener("change", (e) => {
    const el = e.target.closest("[data-f=on]"), row = e.target.closest(".vg-row"); if (!el || !row) return;
    rows[+row.dataset.i].on = el.checked; renderRows();
  });

  /* ---------- ضغط ورفع الصور ---------- */
  function compress(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const s = Math.min(1, 900 / Math.max(im.width, im.height)), cv = document.createElement("canvas");
        cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s);
        cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
        cv.toBlob((b) => { URL.revokeObjectURL(url); b ? res(b) : rej(new Error("الصورة غير صالحة.")); }, "image/webp", 0.82);
      };
      im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("الصورة غير صالحة.")); };
      im.src = url;
    });
  }
  async function upload(file, uploaded) {
    const blob = await compress(file), name = `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}.webp`;
    await A().api(`/storage/v1/object/product-images/${name}`, { method: "POST", body: blob, raw: true, headers: { "Content-Type": blob.type || "image/webp" } })
      .catch((e) => { throw new Error("رفع الصورة: " + e.message); });
    uploaded.push(name);
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${name}`;
  }

  /* ---------- الحفظ ---------- */
  $("vgSave").addEventListener("click", async () => {
    if (busy) return;
    const b = base(), { api, products, groupVariants, friendly, ar } = A(), todo = rows.filter((r) => r.on);
    if (!b || !todo.length) return;
    const seen = new Set(products.map((p) => p.code.toLowerCase()));
    for (const r of todo) {
      const c = r.code.trim().toLowerCase();
      if (!c) return say("فيه نسخة من غير كود.", "err");
      if (seen.has(c)) return say(`الكود ${r.code} مستخدم قبل كده (أو متكرر هنا). عدّليه.`, "err");
      seen.add(c);
    }
    for (const c of colors) if (c.hex && !HEX.test(c.hex)) return say(`لون العينة للّون «${c.name}» لازم يكون بالشكل #C9A227`, "err");
    busy = true; $("vgSave").disabled = true; say("جاري رفع الصور والحفظ…");
    const uploaded = [];
    try {
      /* كل صورة بتترفع مرة واحدة وتتشارك بين النسخ */
      const urls = new Map();
      const need = [...new Set(todo.flatMap((r) => [r.c && r.c.file, r.s && r.s.file]).filter(Boolean))];
      let k = 0;
      for (const f of need) { urls.set(f, await upload(f, uploaded)); $("vgProg").style.width = (++k / (need.length || 1)) * 60 + "%"; }

      const mode = colors.length && sizes.length ? "both" : colors.length ? "color" : "size";
      const gid = b.group_id || b.id;
      const hasSort = A().hasSort();
      let so = Math.max(0, ...products.map((x) => x.sort_order || 0));
      const payload = todo.map((r) => ({
        id: "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        code: r.code.trim(), name: b.name, cat: b.cat, era: b.era,
        color: r.c ? r.c.name : b.color, size: r.s ? r.s.name : b.size,
        image: (r.c && r.c.file && urls.get(r.c.file)) || (r.s && r.s.file && urls.get(r.s.file)) || null,
        group_id: gid, variant_by: mode, color_hex: r.c && HEX.test(r.c.hex || "") ? r.c.hex : null,
        ...(b.price ? { price: b.price } : {}),
        ...(hasSort ? { sort_order: ++so } : {}),
      }));
      /* لو الأساسي لسه مش في مجموعة، نربطه الأول. ولو اتغيّر محور الاختلاف نحدّث تلميح المجموعة */
      const prevBy = b.group_id ? b.variant_by : null;
      const groupBy = prevBy && prevBy !== mode ? "both" : mode;
      if (!b.group_id) await api(`/rest/v1/products?id=eq.${encodeURIComponent(b.id)}`, { method: "PATCH", body: { group_id: gid, variant_by: groupBy }, headers: { Prefer: "return=minimal" } });
      else if (prevBy !== groupBy) await api(`/rest/v1/products?group_id=eq.${encodeURIComponent(gid)}`, { method: "PATCH", body: { variant_by: groupBy }, headers: { Prefer: "return=minimal" } });
      if (groupBy !== mode) payload.forEach((x) => { x.variant_by = groupBy; });
      $("vgProg").style.width = "80%";
      await api("/rest/v1/products", { method: "POST", body: payload, headers: { Prefer: "return=minimal" } });   // طلب واحد: يا كلها يا ولا واحدة
      $("vgProg").style.width = "100%";
      colors = []; sizes = []; rows = [];
      $("vgColors").value = ""; $("vgSizes").value = ""; renderPanels(); renderRows();
      await A().reload();
      say(`اتضافت ${ar(payload.length)} نسخة للمنتج «${b.name}».`);
    } catch (err) {
      uploaded.forEach((n) => api(`/storage/v1/object/product-images/${n}`, { method: "DELETE" }).catch(() => {}));   // ننضّف الصور اللي اترفعت
      say(friendly(err), "err");
    }
    busy = false; $("vgProg").style.width = "0"; renderRows();
  });

  /* ---------- فتح من قايمة المنتجات ---------- */
  window.MeemVariantsBulk = {
    open(id) {
      const p = A().find(id); if (!p) return;
      baseId = A().groupVariants(p)[0].id;
      fillBase(); window.showView("vgen"); window.scrollTo({ top: 0, behavior: "smooth" });
    },
  };
  fillBase();
})();
