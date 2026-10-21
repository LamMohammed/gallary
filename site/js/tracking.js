/* ============================================================
   tracking.js — تسجيل الاستفسارات والزيارات (عبر دوال RPC محمية بحد معدّل)
   لازم database/004_security.sql يكون اتشغّل في Supabase.
   ============================================================ */
function sbRpc(name, args) {
  try {
    fetch(SUPABASE_URL + "/rest/v1/rpc/" + name, {
      method: "POST", keepalive: true,
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    }).catch(() => {});
  } catch (e) {}
}

function trackInquiry(items, source) {
  sbRpc("log_inquiry", {
    p_items: items.map((it) => ({ product_id: it.id, qty: it.q || 1 })),
    p_source: source,
  });
}

function trackVisit() {
  try {
    if (sessionStorage.getItem("meem-visit")) return;      // زيارة واحدة لكل جلسة
    if (localStorage.getItem("meem-sb-session")) return;   // زيارات الأدمن ما بتتحسبش
    sessionStorage.setItem("meem-visit", "1");
    let v = localStorage.getItem("meem-visitor");
    if (!v) {
      v = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
      localStorage.setItem("meem-visitor", v);
    }
    sbRpc("log_visit", { p_visitor: v });
  } catch (e) {}
}

/* تتبع ضغطات واتساب (كارت / مودال / إرسال متعدد) */
document.addEventListener("click", (e) => {
  const find = (id) => SHIELDS.find((s) => s.id === id);
  const qty = (id) => (typeof productQuantities !== "undefined" && productQuantities.get(id)) || 1;
  const card = e.target.closest(".wa-button");
  if (card) {
    const p = find(card.dataset.productId);
    if (p) trackInquiry([{ id: p.id, q: qty(p.id) }], "card");
    return;
  }
  if (e.target.closest("#modal-product-whatsapp")) {
    const p = find(document.getElementById("modal-select-toggle").dataset.productId);
    if (p) trackInquiry([{ id: p.id, q: qty(p.id) }], "modal");
    return;
  }
  if (e.target.closest("#bulk-bar-send")) {
    const items = SHIELDS.filter((s) => selectedIds.has(s.id)).map((s) => ({ id: s.id, q: qty(s.id) }));
    if (items.length) trackInquiry(items, "bulk");
  }
}, true);

trackVisit();
