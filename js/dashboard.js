(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ar = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
  const NEW = "__new__", SKEY = "meem-sb-session";

  let cats = [], products = [], inquiries = [], visits = [];
  let days = 0, editingId = null, imageBlob = null, session = null;
  try { session = JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) {}

  const label = (id) => (cats.find((c) => c.id === id) || { label: id }).label;
  const find = (id) => products.find((p) => p.id === id);
  const say = (el, text, type = "ok") => { el.textContent = text; el.className = "msg " + type; };
  const msg = (t, type) => { say($("msg"), t, type); $("msg").scrollIntoView({ behavior: "smooth", block: "nearest" }); };
  const friendly = (e) => /duplicate|unique/i.test(e.message) ? "الكود ده مستخدم قبل كده، اختار كود تاني." : e.message;

  /* ---------- الدخول ---------- */
  function setSession(r) {
    session = { access_token: r.access_token, refresh_token: r.refresh_token, exp: Math.floor(Date.now() / 1000) + (r.expires_in || 3600) };
    localStorage.setItem(SKEY, JSON.stringify(session));
  }
  async function token() {
    if (!session) throw new Error("سجّل الدخول الأول.");
    if (session.exp - Date.now() / 1000 < 60) {
      try { setSession(await sbFetch("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: session.refresh_token } })); }
      catch (e) { logout(); throw new Error("انتهت الجلسة، سجّل الدخول تاني."); }
    }
    return session.access_token;
  }
  const api = async (path, opts = {}) => sbFetch(path, { ...opts, token: await token() });
  function logout() {
    session = null; localStorage.removeItem(SKEY);
    $("app").style.display = "none"; $("login").style.display = ""; $("logout").style.display = "none";
  }
  $("logout").addEventListener("click", logout);
  $("lf").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = $("lf").elements;
    try {
      setSession(await sbFetch("/auth/v1/token?grant_type=password", { method: "POST", body: { email: f.email.value.trim(), password: f.password.value } }));
      f.password.value = "";
      start();
    } catch (err) { say($("lmsg"), /invalid/i.test(err.message) ? "الإيميل أو كلمة السر غلط." : err.message, "err"); }
  });

  /* ---------- تحميل البيانات ---------- */
  const ORDER = "order=sort_order.asc.nullslast,created_at.asc,code.asc";
  let hasSort = true;
  async function loadAll() {
    cats = await api("/rest/v1/categories?select=id,label,prefix");
    try { products = await api("/rest/v1/products?select=*&" + ORDER); hasSort = true; }
    catch (e) { hasSort = false; products = await api("/rest/v1/products?select=*&order=created_at.asc,code.asc"); }
    fillCatSelect(); renderList(); renderStats();
    loadInquiries(); loadVisits();
  }
  async function loadVisits() {
    const since = days ? "&created_at=gte." + new Date(Date.now() - days * 864e5).toISOString() : "";
    let all = [];
    try {
      for (let off = 0; off < 50000; off += 1000) {
        const page = await api(`/rest/v1/visits?select=visitor_id,created_at${since}&order=id.asc&limit=1000&offset=${off}`);
        all = all.concat(page);
        if (page.length < 1000) break;
      }
      visits = all;
    } catch (e) { msg("تعذر تحميل الزيارات (شغّلتي ملف update-1.sql؟): " + e.message, "err"); }
    renderVisits();
  }
  async function loadInquiries() {
    const since = days ? "&created_at=gte." + new Date(Date.now() - days * 864e5).toISOString() : "";
    let all = [];
    try {
      for (let off = 0; off < 50000; off += 1000) {
        const page = await api(`/rest/v1/inquiries?select=product_id,qty,created_at${since}&order=id.asc&limit=1000&offset=${off}`);
        all = all.concat(page);
        if (page.length < 1000) break;
      }
      inquiries = all;
    } catch (e) { msg("تعذر تحميل الاستفسارات: " + e.message, "err"); }
    renderStats();
  }
  async function start() {
    $("login").style.display = "none"; $("app").style.display = ""; $("logout").style.display = "";
    try { resetForm(); await loadAll(); }
    catch (e) { if (session) msg("تعذر تحميل البيانات: " + e.message, "err"); }
  }

  /* ---------- الإحصائيات ---------- */
  function bars(items, empty) {
    if (!items.length) return `<div class="empty">${empty}</div>`;
    const max = Math.max(...items.map((i) => i.n));
    return items.map((i, idx) => `
      <div class="rank-item"><span class="n">${ar(idx + 1)}</span>
        ${i.img ? `<img src="${esc(i.img)}" alt="">` : "<span></span>"}
        <div><b>${esc(i.title)}</b> <small>${esc(i.sub || "")}</small>
          <div class="bar"><i style="width:${Math.max(4, (i.n / max) * 100)}%"></i></div>
          <small>${ar(i.n)} استفسار${i.qty ? " · كمية مطلوبة " + ar(i.qty) : ""}</small></div></div>`).join("");
  }
  function renderStats() {
    const by = new Map();
    inquiries.forEach((r) => { const o = by.get(r.product_id) || { n: 0, qty: 0 }; o.n++; o.qty += Number(r.qty) || 1; by.set(r.product_id, o); });
    const top = [...by.entries()].map(([id, v]) => ({ p: find(id), ...v })).filter((x) => x.p).sort((a, b) => b.n - a.n || b.qty - a.qty);
    $("kProducts").textContent = ar(products.length);
    $("kCats").textContent = ar(new Set(products.map((p) => p.cat)).size);
    $("kInq").textContent = ar(inquiries.length);
    $("kTop").textContent = top[0] ? top[0].p.code : "—";
    $("topList").innerHTML = bars(top.slice(0, 10).map((x) => ({ title: x.p.name, sub: x.p.code, img: x.p.image, n: x.n, qty: x.qty })), "لسه مفيش استفسارات مسجلة في الفترة دي.");
    const byCat = new Map();
    top.forEach((x) => byCat.set(x.p.cat, (byCat.get(x.p.cat) || 0) + x.n));
    $("catList").innerHTML = bars([...byCat.entries()].sort((a, b) => b[1] - a[1]).map(([c, n]) => ({ title: label(c), n })), "لسه مفيش بيانات.");
  }
  const dayKey = (d) => new Date(d).toLocaleDateString("en-CA");
  function renderVisits() {
    const today = dayKey(Date.now());
    $("kVisits").textContent = ar(visits.length);
    $("kVisitors").textContent = ar(new Set(visits.map((v) => v.visitor_id)).size);
    $("kToday").textContent = ar(new Set(visits.filter((v) => dayKey(v.created_at) === today).map((v) => v.visitor_id)).size);
    const n = Math.min(days || 30, 30), counts = new Map(), cols = [];
    for (let i = n - 1; i >= 0; i--) { const k = dayKey(Date.now() - i * 864e5); counts.set(k, 0); cols.push(k); }
    visits.forEach((v) => { const k = dayKey(v.created_at); if (counts.has(k)) counts.set(k, counts.get(k) + 1); });
    const max = Math.max(1, ...counts.values());
    $("chart").innerHTML = cols.map((k) => `<div title="${k}: ${counts.get(k)} زيارة"><i style="height:${(counts.get(k) / max) * 100}%"></i><small>${Number(k.slice(8))}</small></div>`).join("");
  }
  $("period").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    days = Number(b.dataset.d);
    document.querySelectorAll("#period button").forEach((x) => x.classList.toggle("on", x === b));
    loadInquiries(); loadVisits();
  });

  /* ---------- النموذج ---------- */
  const syncNew = () => $("newCat").classList.toggle("show", $("catSel").value === NEW);
  function fillCatSelect() {
    const cur = $("catSel").value;
    $("catSel").innerHTML = cats.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join("") + `<option value="${NEW}">+ نوع جديد…</option>`;
    if (cur && [...$("catSel").options].some((o) => o.value === cur)) $("catSel").value = cur;
    const fv = $("f").value;
    $("f").innerHTML = `<option value="all">كل الأنواع</option>` + cats.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join("");
    $("f").value = fv || "all";
    syncNew(); suggest();
  }
  function prefixFor(id) {
    const c = cats.find((x) => x.id === id);
    if (c && c.prefix) return c.prefix;
    const any = products.find((p) => p.cat === id);
    return any ? any.code.split("-")[0] : "";
  }
  function nextCode(prefix) {
    if (!prefix) return "";
    let max = 0;
    products.forEach((p) => { const m = p.code.match(new RegExp("^" + prefix + "-(\\d+)$", "i")); if (m) max = Math.max(max, Number(m[1])); });
    return `${prefix}-${String(max + 1).padStart(3, "0")}`;
  }
  function suggest() {
    if (editingId) return;
    const v = $("catSel").value;
    $("pf").elements.code.value = nextCode(v === NEW ? $("ncPrefix").value.trim().toUpperCase() : prefixFor(v));
  }
  function resetForm() {
    editingId = null; imageBlob = null;
    $("pf").reset(); $("prev").style.display = "none"; syncNew();
    $("formTitle").textContent = "إضافة منتج"; suggest();
  }
  $("catSel").addEventListener("change", () => { syncNew(); suggest(); });
  window.addEventListener("pageshow", syncNew);
  $("ncPrefix").addEventListener("input", suggest);
  $("cancel").addEventListener("click", () => { resetForm(); $("msg").className = "msg"; });

  $("img").addEventListener("change", (e) => {
    const file = e.target.files[0]; if (!file) return;
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const s = Math.min(1, 900 / Math.max(im.width, im.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s);
      cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
      cv.toBlob((b) => {
        imageBlob = b; $("prev").src = URL.createObjectURL(b); $("prev").style.display = "block";
      }, "image/webp", 0.82);
      URL.revokeObjectURL(url);
    };
    im.onerror = () => msg("الصورة غير صالحة.", "err");
    im.src = url;
  });

  async function uploadImage(id) {
    const ext = imageBlob.type === "image/webp" ? "webp" : "png";
    const name = `${id}-${Date.now().toString(36)}.${ext}`;
    await api(`/storage/v1/object/product-images/${name}`, { method: "POST", body: imageBlob, raw: true, headers: { "Content-Type": imageBlob.type, "x-upsert": "true" } });
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${name}`;
  }

  $("pf").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = $("pf").elements, btn = e.submitter;
    const old = editingId ? find(editingId) : null;
    if (!imageBlob && !old) return msg("لازم تضيف صورة للمنتج.", "err");
    let catId = f.cat.value, newCat = null;
    if (catId === NEW) {
      const lbl = $("ncLabel").value.trim(), prefix = $("ncPrefix").value.trim().toUpperCase();
      if (!lbl || !/^[A-Z]{1,4}$/.test(prefix)) return msg("اكتب اسم النوع الجديد وبادئة كود بحروف إنجليزية (مثال: MR).", "err");
      if (cats.some((c) => c.label === lbl)) return msg("النوع ده موجود بالفعل، اختاره من القايمة.", "err");
      newCat = { id: "c" + Date.now().toString(36), label: lbl, prefix }; catId = newCat.id;
    }
    btn.disabled = true; msg("جاري الحفظ…");
    try {
      if (newCat) await api("/rest/v1/categories", { method: "POST", body: newCat, headers: { Prefer: "return=minimal" } });
      const id = old ? old.id : "p" + Date.now().toString(36);
      const image = imageBlob ? await uploadImage(id) : old.image;
      const row = { code: f.code.value.trim(), name: f.name.value.trim(), cat: catId, color: f.color.value.trim(), size: f.size.value.trim(), era: f.era.value.trim(), image };
      if (old) await api(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: row, headers: { Prefer: "return=minimal" } });
      else {
        const so = hasSort ? { sort_order: Math.max(0, ...products.map((x) => x.sort_order || 0)) + 1 } : {};
        await api("/rest/v1/products", { method: "POST", body: { id, ...row, ...so }, headers: { Prefer: "return=minimal" } });
      }
      const wasNew = !!newCat;
      resetForm(); await loadAll();
      msg(old ? "اتحدّث المنتج." : wasNew ? `اتضاف النوع "${newCat.label}" والمنتج ${row.code}.` : `اتضاف المنتج ${row.code}.`);
    } catch (err) { msg(friendly(err), "err"); if (newCat) loadAll().catch(() => {}); }
    btn.disabled = false;
  });

  /* ---------- قايمة المنتجات ---------- */
  function visibleList() {
    const q = $("q").value.trim().toLowerCase(), c = $("f").value;
    return products.filter((p) => (c === "all" || p.cat === c) && (!q || (p.name + " " + p.code).toLowerCase().includes(q)));
  }
  function renderList() {
    const list = visibleList();
    $("plist").innerHTML = list.length ? list.map((p, i) => `
      <div class="p"><img src="${esc(p.image)}" alt="" loading="lazy">
        <div><b>${esc(p.name)}</b><br><small class="muted">${esc(p.code)} · ${esc(label(p.cat))} · ${esc(p.color)} · ${esc(p.size)}</small></div>
        <div class="acts">
          <button class="btn q" data-a="top" data-id="${esc(p.id)}" title="نقل لأول الصفحة" ${i === 0 ? "disabled" : ""}>⤒</button>
          <button class="btn q" data-a="up" data-id="${esc(p.id)}" title="لفوق" ${i === 0 ? "disabled" : ""}>▲</button>
          <button class="btn q" data-a="down" data-id="${esc(p.id)}" title="لتحت" ${i === list.length - 1 ? "disabled" : ""}>▼</button>
          <button class="btn q" data-a="edit" data-id="${esc(p.id)}">تعديل</button><button class="btn d" data-a="del" data-id="${esc(p.id)}">حذف</button></div></div>`).join("") : `<div class="empty">لا توجد منتجات مطابقة.</div>`;
  }
  async function move(id, dir) {
    if (!hasSort) return msg("لازم تشغّل ملف update-1.sql في Supabase الأول عشان الترتيب يشتغل.", "err");
    const shown = visibleList(), i = shown.findIndex((p) => p.id === id);
    const order = [...products], from = order.findIndex((p) => p.id === id);
    let to = 0;
    if (dir !== 0) { const nb = shown[i + dir]; if (!nb) return; to = order.findIndex((p) => p.id === nb.id); }
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    const next = order.map((p, k) => ({ ...p, sort_order: k + 1 }));
    const changed = next.filter((p, k) => products.find((x) => x.id === p.id).sort_order !== p.sort_order);
    try {
      if (changed.length) await api("/rest/v1/products?on_conflict=id", { method: "POST", body: changed, headers: { Prefer: "resolution=merge-duplicates,return=minimal" } });
      products = next; renderList();
    } catch (err) { msg(err.message, "err"); }
  }
  $("q").addEventListener("input", renderList);
  $("f").addEventListener("change", renderList);
  $("plist").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const p = find(b.dataset.id); if (!p) return;
    if (["up", "down", "top"].includes(b.dataset.a)) return move(p.id, { up: -1, down: 1, top: 0 }[b.dataset.a]);
    if (b.dataset.a === "del") {
      if (!confirm(`حذف "${p.name}" نهائيًا؟ (سجل استفساراته هيتحذف معاه)`)) return;
      try {
        await api(`/rest/v1/products?id=eq.${encodeURIComponent(p.id)}`, { method: "DELETE" });
        const m = p.image.match(/product-images\/([A-Za-z0-9_.-]+)$/);
        if (m) api(`/storage/v1/object/product-images/${m[1]}`, { method: "DELETE" }).catch(() => {});
        await loadAll(); msg("اتحذف المنتج.");
      } catch (err) { msg(err.message, "err"); }
    } else {
      editingId = p.id; imageBlob = null;
      const f = $("pf").elements;
      $("catSel").value = p.cat; syncNew();
      f.code.value = p.code; f.name.value = p.name; f.color.value = p.color; f.size.value = p.size; f.era.value = p.era;
      $("prev").src = p.image; $("prev").style.display = "block";
      $("formTitle").textContent = "تعديل: " + p.name;
      $("pf").scrollIntoView({ behavior: "smooth" });
    }
  });

  /* ---------- نسخة احتياطية ---------- */
  $("exp").addEventListener("click", async () => {
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify({ categories: cats, products }, null, 1)], { type: "application/json" }));
      a.download = "meem-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
    } catch (err) { msg(err.message, "err"); }
  });
  $("clr").addEventListener("click", async () => {
    if (!confirm("مسح كل الاستفسارات المسجلة نهائيًا؟")) return;
    try { await api("/rest/v1/inquiries?id=gt.0", { method: "DELETE" }); inquiries = []; renderStats(); msg("اتمسحت الاستفسارات."); }
    catch (err) { msg(err.message, "err"); }
  });

  $("clrv").addEventListener("click", async () => {
    if (!confirm("مسح سجل الزيارات نهائيًا؟")) return;
    try { await api("/rest/v1/visits?id=gt.0", { method: "DELETE" }); visits = []; renderVisits(); msg("اتمسح سجل الزيارات."); }
    catch (err) { msg(err.message, "err"); }
  });

  if (session) start();
})();
