/* ============================================================
   manage.js — الأنواع · التعديل السريع · المسؤولين
   بيشتغل فوق window.MeemAdmin (متعرّف في dashboard.js)
   ============================================================ */
(() => {
  const $ = (id) => document.getElementById(id);
  const A = () => window.MeemAdmin;
  const say = (el, text, type = "ok") => { el.textContent = text; el.className = "msg " + type; };
  const enc = encodeURIComponent;

  /* ================= 1) الأنواع: تعديل الاسم اللي بيظهر ================= */
  function renderCats() {
    const { cats, products, esc, ar } = A();
    $("catManage").innerHTML = cats.map((c) => {
      const n = products.filter((p) => p.cat === c.id).length;
      return `<div class="rowline" data-id="${esc(c.id)}">
        <label class="rowline__main">الاسم اللي بيظهر<input maxlength="40" value="${esc(c.label)}" data-orig="${esc(c.label)}"></label>
        <span class="rowline__meta"><b dir="ltr">${esc(c.prefix || "—")}</b> بادئة الكود<br>${ar(n)} منتج</span>
        <button class="btn" type="button" disabled>حفظ</button></div>`;
    }).join("") || '<div class="empty">لا توجد أنواع.</div>';
  }
  $("catManage").addEventListener("input", (e) => {
    const inp = e.target.closest("input"); if (!inp) return;
    inp.closest(".rowline").querySelector("button").disabled = !inp.value.trim() || inp.value.trim() === inp.dataset.orig;
  });
  $("catManage").addEventListener("click", async (e) => {
    const btn = e.target.closest("button"); if (!btn) return;
    const row = btn.closest(".rowline"), inp = row.querySelector("input"), label = inp.value.trim();
    const { api, cats, friendly } = A();
    if (cats.some((c) => c.label === label && c.id !== row.dataset.id)) return say($("catMsg"), "فيه نوع تاني بنفس الاسم.", "err");
    btn.disabled = true;
    try {
      await api(`/rest/v1/categories?id=eq.${enc(row.dataset.id)}`, { method: "PATCH", body: { label }, headers: { Prefer: "return=minimal" } });
      cats.find((c) => c.id === row.dataset.id).label = label;
      inp.dataset.orig = label;
      A().refreshCats();
      say($("catMsg"), `اتغيّر اسم النوع لـ "${label}" — هيظهر كده في الموقع كمان.`);
    } catch (err) { say($("catMsg"), friendly(err), "err"); btn.disabled = false; }
  });

  /* ================= 2+3) التعديل السريع (نافذة جانبية) ================= */
  let qeId = null, qeBlob = null;
  const qf = () => $("qf").elements;

  function compress(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const s = Math.min(1, 900 / Math.max(im.width, im.height)), cv = document.createElement("canvas");
        cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s);
        cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
        cv.toBlob((b) => { URL.revokeObjectURL(url); b ? res(b) : rej(new Error("الصورة غير صالحة.")); }, "image/webp", 0.82);
      };
      im.onerror = () => rej(new Error("الصورة غير صالحة."));
      im.src = url;
    });
  }

  function openQuick(id) {
    const { find, groupVariants, cats, esc, ar, imgSrc, imageOf } = A(), p = find(id); if (!p) return;
    qeId = id; qeBlob = null;
    const f = qf(), group = groupVariants(p);
    $("qCat").innerHTML = cats.map((c) => `<option value="${esc(c.id)}">${esc(c.label)}</option>`).join("");
    f.name.value = p.name; f.era.value = p.era || ""; f.cat.value = p.cat; f.code.value = p.code;
    f.color.value = p.color || ""; f.size.value = p.size || ""; f.colorHex.value = p.color_hex || "";
    $("qHexWrap").style.display = p.group_id && p.variant_by !== "size" ? "" : "none";
    $("qPrev").src = imgSrc(imageOf(p)); f.img.value = "";
    const many = group.length > 1;
    $("qSyncWrap").style.display = many ? "" : "none";
    f.sync.checked = many;
    $("qSyncTxt").textContent = `طبّق الاسم والوصف والنوع على كل النسخ (${ar(group.length)}) مرة واحدة`;
    $("qTitle").textContent = "تعديل: " + p.name;
    $("qMsg").className = "msg";
    $("qe").showModal(); f.name.focus(); f.name.select();
  }
  $("qImg").addEventListener("change", async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { qeBlob = await compress(file); $("qPrev").src = URL.createObjectURL(qeBlob); } catch (err) { say($("qMsg"), err.message, "err"); }
  });
  $("qCancel").addEventListener("click", () => $("qe").close());
  $("qFull").addEventListener("click", () => { $("qe").close(); A().openFull(qeId); });
  $("qe").addEventListener("click", (e) => { if (e.target === $("qe")) $("qe").close(); });   // ضغطة على الخلفية

  $("qf").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { api, find, products, friendly, esc } = A(), p = find(qeId), f = qf(), btn = e.submitter || $("qSave");
    const hex = f.colorHex.value.trim();
    if (hex && !/^#[0-9A-Fa-f]{6}$/.test(hex)) return say($("qMsg"), "لون العينة لازم يكون بالشكل #C9A227", "err");
    const shared = { name: f.name.value.trim(), era: f.era.value.trim(), cat: f.cat.value };
    const own = { code: f.code.value.trim(), color: f.color.value.trim(), size: f.size.value.trim() };
    if (p.group_id && p.variant_by !== "size") own.color_hex = hex || null;
    const sync = !!p.group_id && f.sync.checked;
    btn.disabled = true; say($("qMsg"), "جاري الحفظ…", "ok");
    try {
      if (qeBlob) {
        const name = `${p.id}-${Date.now().toString(36)}.webp`;
        await api(`/storage/v1/object/product-images/${name}`, { method: "POST", body: qeBlob, raw: true, headers: { "Content-Type": qeBlob.type } });
        own.image = `${SUPABASE_URL}/storage/v1/object/public/product-images/${name}`;
      }
      const changed = (o, src) => Object.fromEntries(Object.entries(o).filter(([k, v]) => (src[k] ?? "") !== (v ?? "")));
      const mine = changed({ ...own, ...(sync ? {} : shared) }, p), grp = sync ? changed(shared, p) : {};
      const calls = [];
      if (Object.keys(mine).length) calls.push(api(`/rest/v1/products?id=eq.${enc(p.id)}`, { method: "PATCH", body: mine, headers: { Prefer: "return=minimal" } }));
      /* الاسم والوصف والنوع لكل النسخ في طلب واحد */
      const others = sync ? products.filter((x) => x.group_id === p.group_id) : [];
      const grpAll = sync ? Object.fromEntries(Object.entries(shared).filter(([k, v]) => others.some((x) => (x[k] ?? "") !== v))) : {};
      if (Object.keys(grpAll).length) calls.push(api(`/rest/v1/products?group_id=eq.${enc(p.group_id)}`, { method: "PATCH", body: grpAll, headers: { Prefer: "return=minimal" } }));
      if (!calls.length) { $("qe").close(); return; }
      await Promise.all(calls);
      Object.assign(p, mine); others.forEach((x) => Object.assign(x, grpAll));
      A().refreshList();
      $("qe").close();
      A().msg(sync && others.length > 1 ? `اتحدّث ${A().ar(others.length)} نسخ.` : "اتحدّث المنتج.", "ok");
    } catch (err) { say($("qMsg"), friendly(err), "err"); }
    btn.disabled = false;
  });

  /* ================= 4) المسؤولين ================= */
  const adminErr = (m) =>
    /NOT_ADMIN/.test(m) ? "الحساب ده مش أدمن."
    : /USER_NOT_FOUND/.test(m) ? "الإيميل ده مالوش حساب لسه. اكتب له كلمة سر مؤقتة (٨ حروف على الأقل) عشان نعمل له الحساب، أو اعمله من Supabase ← Authentication ← Users."
    : /CANNOT_REMOVE_SELF/.test(m) ? "ما ينفعش تشيل نفسك."
    : /could not find the function|list_admins|add_admin|remove_admin/i.test(m) ? "شغّل database/008_admin_management.sql في Supabase (SQL Editor) الأول."
    : /signups? (are )?disabled|not allowed/i.test(m) ? "التسجيل الجديد مقفول في Supabase. اعمل الحساب من Authentication ← Users وبعدين اكتب الإيميل هنا بس."
    : m;
  const myId = () => { try { return JSON.parse(atob(A().session.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).sub; } catch (e) { return null; } };

  async function loadAdmins() {
    const { api, esc } = A();
    try {
      const rows = await api("/rest/v1/rpc/list_admins", { method: "POST", body: {} }), me = myId();
      $("adminList").innerHTML = rows.map((r) => `<div class="rowline"><span class="rowline__main" dir="ltr">${esc(r.email || r.user_id)}${r.user_id === me ? " <small class='muted'>(أنت)</small>" : ""}</span>
        ${r.user_id === me || rows.length < 2 ? "" : `<button class="btn d" type="button" data-id="${esc(r.user_id)}" data-email="${esc(r.email || "")}">إزالة</button>`}</div>`).join("");
    } catch (err) { $("adminList").innerHTML = ""; say($("adMsg"), adminErr(err.message), "err"); }
  }
  $("adminList").addEventListener("click", async (e) => {
    const b = e.target.closest("button[data-id]"); if (!b) return;
    if (!confirm(`إزالة صلاحية الأدمن من ${b.dataset.email}؟ (الحساب نفسه مش هيتحذف)`)) return;
    try { await A().api("/rest/v1/rpc/remove_admin", { method: "POST", body: { p_user_id: b.dataset.id } }); say($("adMsg"), "اتشالت الصلاحية."); loadAdmins(); }
    catch (err) { say($("adMsg"), adminErr(err.message), "err"); }
  });
  $("adf").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = $("adf").elements, email = f.email.value.trim().toLowerCase(), pass = f.password.value, btn = e.submitter;
    if (pass && pass.length < 8) return say($("adMsg"), "كلمة السر لازم تكون ٨ حروف على الأقل.", "err");
    btn.disabled = true; say($("adMsg"), "جاري الإضافة…");
    try {
      if (pass) {
        try { await sbFetch("/auth/v1/signup", { method: "POST", body: { email, password: pass } }); }
        catch (err) { if (!/already|registered|exists/i.test(err.message)) throw err; }
      }
      await A().api("/rest/v1/rpc/add_admin", { method: "POST", body: { p_email: email } });
      f.email.value = ""; f.password.value = "";
      say($("adMsg"), pass ? `اتضاف ${email} كأدمن. لو Supabase مفعّل تأكيد الإيميل، لازم يأكّده الأول قبل أول دخول.` : `اتضاف ${email} كأدمن.`);
      loadAdmins();
    } catch (err) { say($("adMsg"), adminErr(err.message), "err"); }
    btn.disabled = false;
  });

  /* لما الصفحة تتفتح: نحدّث الأنواع/المسؤولين */
  document.querySelectorAll('.nav-item[data-view="cats"]').forEach((b) => b.addEventListener("click", renderCats));
  document.querySelectorAll('.nav-item[data-view="admins"]').forEach((b) => b.addEventListener("click", loadAdmins));
  window.MeemManage = { openQuick, renderCats, loadAdmins };
})();
