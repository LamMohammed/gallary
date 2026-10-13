/* ============================================================
   بيانات الدروع — عشان تضيف درع جديد:
   1) ضيف صورة المنتج جوه فولدر images/
   2) انسخ سطر من اللي تحت وغيّر: id (فريد)، code (كود المنتج)، cat (خامة)،
      name (اسم الدرع)، era (وصف قصير)، size (المقاس)، color (اللون)،
      image (مسار الصورة جوه images/)
   الخامات المتاحة (cat): wood, leather, crystal, acrylic, metal
   ============================================================ */
const ACCOUNT_NAME = "شركة ميم  ";
const WHATSAPP_NUMBER = "201000082027";
// القيم الافتراضية حسب نوع المنتج، ويمكن تجاوزها بإضافة color لكل منتج.
const PRODUCT_COLOR_DEFAULTS = {
  gold: "ذهبي",
  crystal: "شفاف",
  acrylic: "شفاف",
};

const DEFAULT_SHIELDS = [
  {
    id: "g1",
    code: "GO-001",
    cat: "gold",
    name: "درع ذهبي - تصميم ١",
    era: "  ذهبي ملكي  بتصميم  عصري ·  ",
    size: "176×230",
    image: "images/gold-1.webp",
  },
  {
    id: "g2",
    code: "GO-002",
    cat: "gold",
    name: "درع ذهبي - تصميم ٢",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-2.webp",
  },

  {
    id: "g3",
    code: "GO-003",
    cat: "gold",
    name: "درع ذهبي - تصميم ٣",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-3.webp",
  },

  {
    id: "g4",
    code: "GO-004",
    cat: "gold",
    name: "درع ذهبي - تصميم ٤",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-4.webp",
  },
  {
    id: "g5",
    code: "GO-005",
    cat: "gold",
    name: "درع ذهبي - تصميم ٥",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-5.webp",
  },
  {
    id: "g6",
    code: "GO-006",
    cat: "gold",
    name: "درع ذهبي - تصميم ٦",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-6.webp",
  },
  {
    id: "g7",
    code: "GO-007",
    cat: "gold",
    name: "درع ذهبي - تصميم ٧",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-7.webp",
  },
  {
    id: "g8",
    code: "GO-008",
    cat: "gold",
    name: "درع ذهبي - تصميم ٨",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-8.webp",
  },
  {
    id: "g9",
    code: "GO-009",
    cat: "gold",
    name: "درع ذهبي - تصميم ٩",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-9.webp",
  },
  {
    id: "g10",
    code: "GO-010",
    cat: "gold",
    name: "درع ذهبي - تصميم ١٠",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-10.webp",
  },
  {
    id: "g11",
    code: "GO-011",
    cat: "gold",
    name: "درع ذهبي - تصميم ١١",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-11.webp",
  },
  {
    id: "g12",
    code: "GO-012",
    cat: "gold",
    name: "درع ذهبي - تصميم ١٢",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-12.webp",
  },
  {
    id: "g13",
    code: "GO-013",
    cat: "gold",
    name: "درع ذهبي - تصميم ١٣",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-13.webp",
  },

  // {id:'l1', cat:'leather', name:'الإطار الأسود الأنيق', era:'جلد طبيعي · دبل فريم', size:'قياس مزدوج', image:'images/leather-1.webp'},
  // {id:'l2', cat:'leather', name:'الإطار الكريمي الفاخر', era:'جلد فاخر · دبل فريم', size:'قياس مزدوج', image:'images/leather-2.webp'},

  {
    id: "c1",
    code: "CR-001",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١",
    era: "كريستال شفاف · قاعدة خشبية",
    size: "ارتفاع 25سم",
    image: "images/crystal-1.webp",
  },
  {
    id: "c2",
    code: "CR-002",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ٢",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-2.webp",
  },
  {
    id: "c3",
    code: "CR-003",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ٣",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-3.webp",
  },
  {
    id: "c4",
    code: "CR-004",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ٤",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-4.webp",
  },
  {
    id: "c5",
    code: "CR-005",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ٥",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-5.webp",
  },
  {
    id: "c6",
    code: "CR-006",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ٦",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-6.webp",
  },

  {
    id: "c7",
    code: "CR-007",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ٧",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-7.webp",
  },
  {
    id: "c8",
    code: "CR-008",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ٨",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-8.webp",
  },
  {
    id: "c9",
    code: "CR-009",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ٩",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-9.webp",
  },
  {
    id: "c10",
    code: "CR-010",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١٠",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-10.webp",
  },
  {
    id: "c11",
    code: "CR-011",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١١",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-11.webp",
  },
  {
    id: "c12",
    code: "CR-012",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١٢",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-12.webp",
  },
  {
    id: "c13",
    code: "CR-013",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١٣",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-13.webp",
  },
  {
    id: "c14",
    code: "CR-014",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١٤",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-14.webp",
  },
  {
    id: "c15",
    code: "CR-015",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١٥",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-15.webp",
  },
  {
    id: "c16",
    code: "CR-016",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١٦",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-16.webp",
  },
{
    id: "c17",
    code: "CR-017",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١٧",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-17.webp",
  },
{
    id: "c18",
    code: "CR-018",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١٨",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-18.webp",
  },
{
    id: "c19",
    code: "CR-019",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ١٩",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-19.webp",
  },
{
    id: "c20",
    code: "CR-020",
    cat: "crystal",
    name: "قطعة كريستال - تصميم ٢٠",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-20.webp",
  },


  {
    id: "a1",
    code: "AC-001",
    cat: "acrylic",
    name: "لوحة أكريليك - تصميم ١",
    era: "أكريليك فاتح · حفر ليزر",
    size: "أفقي 30×22سم",
    image: "images/acrylic-1.webp",
  },
  {
    id: "a2",
    code: "AC-002",
    cat: "acrylic",
    name: "لوحة أكريليك - تصميم ٢",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-2.webp",
  },
  {
    id: "a3",
    code: "AC-003",
    cat: "acrylic",
    name: "لوحة أكريليك - تصميم ٣",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-3.webp",
  },
  {
    id: "a4",
    code: "AC-004",
    cat: "acrylic",
    name: "لوحة أكريليك - تصميم ٤",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-4.webp",
  },
  {
    id: "a5",
    code: "AC-005",
    cat: "acrylic",
    name: "لوحة أكريليك - تصميم ٥",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-5.webp",
  },

  // {id:'m1', cat:'metal', name:'العرش الفضي', era:'معدن مصقول · أعمدة ملكية', size:'ارتفاع 28سم', image:'images/metal-1.webp'},
  // {id:'m2', cat:'metal', name:'الصولجان الملكي', era:'معدن مصقول · نقش متعرج', size:'ارتفاع 30سم', image:'images/metal-2.webp'},
].map((product) => ({
  ...product,
  color: product.color ?? PRODUCT_COLOR_DEFAULTS[product.cat],
}));

const CATS = [
  { id: "all", label: "الكل" },
  { id: "gold", label: "ذهبي" },
  // {id:'leather', label:'جلدي'},
  { id: "crystal", label: "كريستال" },
  { id: "acrylic", label: "أكريليك منقوش" },
  // {id:'metal', label:'معدني فضي'},
];

const SHIELDS_STORAGE_KEY = "meem-shields-catalog-v1";
let catalogLoadError = "";

function validateCatalog(products) {
  if (!Array.isArray(products) || products.length > 500) {
    throw new Error("ملف المنتجات غير صالح أو يتجاوز الحد المسموح.");
  }

  const ids = new Set();
  const codes = new Set();
  const allowedImagePath = /^images\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.(?:webp|png|jpe?g)$/i;
  const allowedImageUrl = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/product-images\/[A-Za-z0-9_.-]+$/;
  const allowedImageData = /^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/;

  products.forEach((product) => {
    if (!product || typeof product !== "object") {
      throw new Error("يوجد منتج ببيانات غير صالحة.");
    }

    const fields = ["id", "code", "name", "cat", "color", "era", "size", "image"];
    if (fields.some((field) => typeof product[field] !== "string" || !product[field].trim())) {
      throw new Error("تأكد من اكتمال اسم وكود وتصنيف ولون ووصف ومقاس وصورة كل منتج.");
    }
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(product.id)) {
      throw new Error("معرّف المنتج يجب أن يتكون من حروف إنجليزية أو أرقام أو شرطة فقط.");
    }
    if (product.code.length > 30 || product.name.length > 100 || product.color.length > 50 ||
        product.era.length > 120 || product.size.length > 60) {
      throw new Error("أحد حقول المنتج أطول من الحد المسموح.");
    }
    if (!CATS.some((category) => category.id !== "all" && category.id === product.cat)) {
      throw new Error(`تصنيف غير معروف في المنتج ${product.code}.`);
    }
    if (
      !(allowedImagePath.test(product.image) && !product.image.split("/").includes("..")) &&
      !(product.image.length <= 1_300_000 && allowedImageData.test(product.image)) &&
      !allowedImageUrl.test(product.image)
    ) {
      throw new Error(`مسار الصورة غير مسموح في المنتج ${product.code}.`);
    }

    const normalizedCode = product.code.trim().toUpperCase();
    if (ids.has(product.id) || codes.has(normalizedCode)) {
      throw new Error("معرّف المنتج وكوده يجب أن يكونا فريدين.");
    }
    ids.add(product.id);
    codes.add(normalizedCode);
  });

  return products.map((product) => ({
    ...product,
    id: product.id.trim(),
    code: product.code.trim(),
    name: product.name.trim(),
    cat: product.cat.trim(),
    color: product.color.trim(),
    era: product.era.trim(),
    size: product.size.trim(),
    image: product.image.trim(),
  }));
}

function loadCatalog() {
  try {
    const savedCatalog = localStorage.getItem(SHIELDS_STORAGE_KEY);
    return savedCatalog === null
      ? [...DEFAULT_SHIELDS]
      : validateCatalog(JSON.parse(savedCatalog));
  } catch (error) {
    catalogLoadError = `تعذر تحميل الكتالوج المحفوظ: ${error.message}`;
    return [...DEFAULT_SHIELDS];
  }
}


/* ---------- الاتصال بقاعدة البيانات (Supabase) ---------- */
const SUPABASE_URL = "https://kxoeyhvkkbzzplnjjrux.supabase.co";
const SUPABASE_KEY = "sb_publishable_7fG645Sb7-BDxZ_d_v3t5A_zOmVJ8Jy"; // مفتاح عام، آمن في الموقع
const CACHE_KEY = "meem-remote-cache-v1";

async function sbFetch(path, { method = "GET", body, token, headers = {}, raw = false } = {}) {
  const h = { apikey: SUPABASE_KEY, Authorization: "Bearer " + (token || SUPABASE_KEY), ...headers };
  if (body !== undefined && !raw) h["Content-Type"] = "application/json";
  const res = await fetch(SUPABASE_URL + path, {
    method, headers: h, body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) {
    const m = (data && (data.message || data.msg || data.error_description || data.error)) || res.statusText;
    throw new Error(m);
  }
  return data;
}

const BASE_CAT_ORDER = ["gold", "crystal", "acrylic"];
function applyRemoteCategories(rows) {
  const all = CATS.find((c) => c.id === "all") || { id: "all", label: "الكل" };
  const sorted = [...rows].sort((a, b) => {
    const ia = BASE_CAT_ORDER.indexOf(a.id), ib = BASE_CAT_ORDER.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.id.localeCompare(b.id);
  });
  CATS.length = 0;
  CATS.push(all, ...sorted.map((c) => ({ id: c.id, label: c.label, prefix: c.prefix })));
}
async function loadRemoteCatalog() {
  const cols = "/rest/v1/products?select=id,code,name,cat,color,era,size,image&order=";
  const [cats, products] = await Promise.all([
    sbFetch("/rest/v1/categories?select=id,label,prefix"),
    sbFetch(cols + "sort_order.asc.nullslast,created_at.asc,code.asc")
      .catch(() => sbFetch(cols + "created_at.asc,code.asc")),
  ]);
  if (!Array.isArray(cats) || !cats.length) throw new Error("قاعدة البيانات فاضية");
  applyRemoteCategories(cats);
  const valid = validateCatalog(products);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ cats, products: valid })); } catch (e) {}
  return { cats, products: valid };
}
/* آخر نسخة نجحت: بتظهر فورًا لحد ما النسخة الجديدة توصل */
function initialCatalog() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (c && c.cats && c.cats.length) {
      applyRemoteCategories(c.cats);
      return validateCatalog(c.products);
    }
  } catch (e) {}
  return validateCatalog(DEFAULT_SHIELDS);
}

/* ---------- تسجيل الاستفسارات (ضغطات واتساب) ---------- */
function trackInquiry(items, source) {
  const rows = items.map((it) => ({ product_id: it.id, qty: it.q || 1, source }));
  try {
    fetch(SUPABASE_URL + "/rest/v1/inquiries", {
      method: "POST", keepalive: true,
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(rows),
    }).catch(() => {});
  } catch (e) {}
}
if (document.getElementById("grid")) {
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
}

/* ---------- عدّاد الزيارات ---------- */
function trackVisit() {
  try {
    if (sessionStorage.getItem("meem-visit")) return;      // زيارة واحدة لكل جلسة
    if (localStorage.getItem("meem-sb-session")) return;   // زيارات الأدمن (وهو مسجل دخول) ما بتتحسبش
    sessionStorage.setItem("meem-visit", "1");
    let v = localStorage.getItem("meem-visitor");
    if (!v) {
      v = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
      localStorage.setItem("meem-visitor", v);
    }
    fetch(SUPABASE_URL + "/rest/v1/visits", {
      method: "POST", keepalive: true,
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ visitor_id: v }),
    }).catch(() => {});
  } catch (e) {}
}
if (document.getElementById("grid")) trackVisit();
