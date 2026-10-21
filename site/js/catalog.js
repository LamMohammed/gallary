/* ============================================================
   catalog.js — بيانات الكتالوج + التحقق + نسخ المنتج (ألوان / مقاسات)
   ------------------------------------------------------------
   بنية البيانات:
     منتج أساسي (family)  ← له نسخ (variants)
       family : id, cat, name, era, image (الصورة الأساسية)
       variant: code  (إلزامي، فريد)
                color (اختياري)  size (اختياري)
                image (اختيارية — لو ناقصة بتاخد صورة المنتج الأساسي)
   - الكتالوج الأساسي بيتحمّل من Supabase، وده الاحتياطي لو القاعدة مش متاحة.
   - لإضافة/تعديل منتجات استخدم لوحة الإدارة (admin/).
   - مفيش لون أو مقاس بيتخمّن: اللي مش معروف بيتساب فاضي ومش بيتعرض.
   ============================================================ */

/* اللون العام اللي القاعدة القديمة كانت بتحطه تلقائيًا حسب الخامة (مش لون حقيقي للمنتج) */
const GENERIC_COLORS = { gold: "ذهبي", crystal: "شفاف", acrylic: "شفاف" };

const CATS = [
  { id: "all", label: "الكل" },
  { id: "gold", label: "ذهبي" },
  { id: "crystal", label: "كريستال" },
  { id: "acrylic", label: "أكريليك منقوش" },
];

/* ⬇⬇ الكتالوج الاحتياطي — JSON صارم (tools/build.py و tools/audit_catalog.py بيقروه) ⬇⬇ */
const CATALOG_FAMILIES = /*FAMILIES-START*/[
  {"id": "g1", "cat": "gold", "name": "درع ذهبي - تصميم ١", "era": "ذهبي ملكي بتصميم عصري", "image": "images/products/gold/gold-1.webp", "variants": [{"code": "GO-001", "size": "176×230"}]},
  {"id": "g2", "cat": "gold", "name": "درع ذهبي - تصميم ٢", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-2.webp", "variants": [{"code": "GO-002", "size": "220×280"}]},
  {"id": "g3", "cat": "gold", "name": "درع ذهبي - تصميم ٣", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-3.webp", "variants": [{"code": "GO-003", "size": "220×280"}]},
  {"id": "g4", "cat": "gold", "name": "درع ذهبي - تصميم ٤", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-4.webp", "variants": [{"code": "GO-004", "size": "220×280"}]},
  {"id": "g5", "cat": "gold", "name": "درع ذهبي - تصميم ٥", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-5.webp", "variants": [{"code": "GO-005", "size": "220×280"}]},
  {"id": "g6", "cat": "gold", "name": "درع ذهبي - تصميم ٦", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-6.webp", "variants": [{"code": "GO-006", "size": "220×280"}]},
  {"id": "g7", "cat": "gold", "name": "درع ذهبي - تصميم ٧", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-7.webp", "variants": [{"code": "GO-007", "size": "220×280"}]},
  {"id": "g8", "cat": "gold", "name": "درع ذهبي - تصميم ٨", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-8.webp", "variants": [{"code": "GO-008", "size": "220×280"}]},
  {"id": "g9", "cat": "gold", "name": "درع ذهبي - تصميم ٩", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-9.webp", "variants": [{"code": "GO-009", "size": "220×280"}]},
  {"id": "g10", "cat": "gold", "name": "درع ذهبي - تصميم ١٠", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-10.webp", "variants": [{"code": "GO-010", "size": "220×280"}]},
  {"id": "g11", "cat": "gold", "name": "درع ذهبي - تصميم ١١", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-11.webp", "variants": [{"code": "GO-011", "size": "220×280"}]},
  {"id": "g12", "cat": "gold", "name": "درع ذهبي - تصميم ١٢", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-12.webp", "variants": [{"code": "GO-012", "size": "220×280"}]},
  {"id": "g13", "cat": "gold", "name": "درع ذهبي - تصميم ١٣", "era": "ذهبي ملكي بتصميم عصري · L", "image": "images/products/gold/gold-13.webp", "variants": [{"code": "GO-013", "size": "220×280"}]},
  {"id": "c1", "cat": "crystal", "name": "قطعة كريستال - تصميم ١", "era": "كريستال شفاف · قاعدة خشبية", "image": "images/products/crystal/crystal-1.webp", "variants": [{"code": "CR-001", "size": "ارتفاع 25سم"}]},
  {"id": "c2", "cat": "crystal", "name": "قطعة كريستال - تصميم ٢", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-2.webp", "variants": [{"code": "CR-002", "size": "ارتفاع 18سم"}]},
  {"id": "c3", "cat": "crystal", "name": "قطعة كريستال - تصميم ٣", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-3.webp", "variants": [{"code": "CR-003", "size": "ارتفاع 18سم"}]},
  {"id": "c4", "cat": "crystal", "name": "قطعة كريستال - تصميم ٤", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-4.webp", "variants": [{"code": "CR-004", "size": "ارتفاع 18سم"}]},
  {"id": "c5", "cat": "crystal", "name": "قطعة كريستال - تصميم ٥", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-5.webp", "variants": [{"code": "CR-005", "size": "ارتفاع 18سم"}]},
  {"id": "c6", "cat": "crystal", "name": "قطعة كريستال - تصميم ٦", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-6.webp", "variants": [{"code": "CR-006", "size": "ارتفاع 18سم"}]},
  {"id": "c7", "cat": "crystal", "name": "قطعة كريستال - تصميم ٧", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-7.webp", "variants": [{"code": "CR-007", "size": "ارتفاع 18سم"}]},
  {"id": "c8", "cat": "crystal", "name": "قطعة كريستال - تصميم ٨", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-8.webp", "variants": [{"code": "CR-008", "size": "ارتفاع 18سم"}]},
  {"id": "c9", "cat": "crystal", "name": "قطعة كريستال - تصميم ٩", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-9.webp", "variants": [{"code": "CR-009", "size": "ارتفاع 18سم"}]},
  {"id": "c10", "cat": "crystal", "name": "قطعة كريستال - تصميم ١٠", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-10.webp", "variants": [{"code": "CR-010", "size": "ارتفاع 18سم"}]},
  {"id": "c11", "cat": "crystal", "name": "قطعة كريستال - تصميم ١١", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-11.webp", "variants": [{"code": "CR-011", "size": "ارتفاع 18سم"}]},
  {"id": "c12", "cat": "crystal", "name": "قطعة كريستال - تصميم ١٢", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-12.webp", "variants": [{"code": "CR-012", "size": "ارتفاع 18سم"}]},
  {"id": "c13", "cat": "crystal", "name": "قطعة كريستال - تصميم ١٣", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-13.webp", "variants": [{"code": "CR-013", "size": "ارتفاع 18سم"}]},
  {"id": "c14", "cat": "crystal", "name": "قطعة كريستال - تصميم ١٤", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-14.webp", "variants": [{"code": "CR-014", "size": "ارتفاع 18سم"}]},
  {"id": "c15", "cat": "crystal", "name": "قطعة كريستال - تصميم ١٥", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-15.webp", "variants": [{"code": "CR-015", "size": "ارتفاع 18سم"}]},
  {"id": "c16", "cat": "crystal", "name": "قطعة كريستال - تصميم ١٦", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-16.webp", "variants": [{"code": "CR-016", "size": "ارتفاع 18سم"}]},
  {"id": "c17", "cat": "crystal", "name": "قطعة كريستال - تصميم ١٧", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-17.webp", "variants": [{"code": "CR-017", "size": "ارتفاع 18سم"}]},
  {"id": "c18", "cat": "crystal", "name": "قطعة كريستال - تصميم ١٨", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-18.webp", "variants": [{"code": "CR-018", "size": "ارتفاع 18سم"}]},
  {"id": "c19", "cat": "crystal", "name": "قطعة كريستال - تصميم ١٩", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-19.webp", "variants": [{"code": "CR-019", "size": "ارتفاع 18سم"}]},
  {"id": "c20", "cat": "crystal", "name": "قطعة كريستال - تصميم ٢٠", "era": "زجاج مقصوص · خشب زان", "image": "images/products/crystal/crystal-20.webp", "variants": [{"code": "CR-020", "size": "ارتفاع 18سم"}]},
  {"id": "a1", "cat": "acrylic", "name": "لوحة أكريليك - تصميم ١", "era": "أكريليك فاتح · حفر ليزر", "image": "images/products/acrylic/acrylic-1.webp", "variants": [{"code": "AC-001", "size": "أفقي 30×22سم"}]},
  {"id": "a2", "cat": "acrylic", "name": "لوحة أكريليك - تصميم ٢", "era": "أكريليك فاتح · نجمة محفورة", "image": "images/products/acrylic/acrylic-2.webp", "variants": [{"code": "AC-002", "size": "أفقي 30×22سم"}]},
  {"id": "a3", "cat": "acrylic", "name": "لوحة أكريليك - تصميم ٣", "era": "أكريليك فاتح · نجمة محفورة", "image": "images/products/acrylic/acrylic-3.webp", "variants": [{"code": "AC-003", "size": "أفقي 30×22سم"}]},
  {"id": "a4", "cat": "acrylic", "name": "لوحة أكريليك - تصميم ٤", "era": "أكريليك فاتح · نجمة محفورة", "image": "images/products/acrylic/acrylic-4.webp", "variants": [{"code": "AC-004", "size": "أفقي 30×22سم"}]},
  {"id": "a5", "cat": "acrylic", "name": "لوحة أكريليك - تصميم ٥", "era": "أكريليك فاتح · نجمة محفورة", "image": "images/products/acrylic/acrylic-5.webp", "variants": [{"code": "AC-005", "size": "أفقي 30×22سم"}]}
]/*FAMILIES-END*/;

/* تحويل (منتج أساسي + نسخ) إلى صفوف مسطّحة، نفس شكل جدول products في القاعدة */
function flattenFamilies(families) {
  const rows = [];
  families.forEach((family) => {
    const list = family.variants && family.variants.length ? family.variants : [{}];
    list.forEach((variant, i) => rows.push({
      id: variant.id || (i === 0 ? family.id : `${family.id}-${i + 1}`),
      code: variant.code, name: family.name, cat: family.cat, era: family.era,
      color: variant.color || "", size: variant.size || "",
      image: variant.image || family.image || "",
      group_id: list.length > 1 ? family.id : null,
      variant_by: list.length > 1 ? family.variant_by || null : null,
      color_hex: variant.color_hex || null,
    }));
  });
  return rows;
}
const DEFAULT_SHIELDS = flattenFamilies(CATALOG_FAMILIES);

/* مسارات الصور القديمة (images/gold-1.webp) → الهيكل الجديد (images/products/gold/...) */
function normalizeImagePath(path) {
  const m = /^images\/(gold|crystal|acrylic)-(\d+)\.webp$/.exec(path);
  return m ? `images/products/${m[1]}/${m[1]}-${m[2]}.webp` : path;
}

/* صورة مصغّرة للشبكة: images/products/x/y.webp → images/thumbs/x/y.webp */
function thumbOf(path) {
  if (!path) return "";
  return path.startsWith("images/products/") ? path.replace("images/products/", "images/thumbs/") : path;
}

/* المقاسات بالأرقام (220×280) لازم تتعرض بنفس ترتيبها في صفحة عربية RTL، وإلا بتتعكس (280×220).
   بنحط كل مقاس رقمي داخل عزل LTR (LRI … PDI). */
const DIM_RE = /\d+(?:[.,٫]\d+)?(?:\s*[×xX*]\s*\d+(?:[.,٫]\d+)?)+/g;
function isoSize(size) {
  return String(size || "").replace(DIM_RE, (m) => "\u2066" + m + "\u2069");
}

function validateCatalog(products) {
  if (!Array.isArray(products) || products.length > 500) {
    throw new Error("بيانات المنتجات غير صالحة أو تتجاوز الحد المسموح.");
  }
  const ids = new Set();
  const codes = new Set();
  const allowedImagePath = /^images\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.(?:webp|png|jpe?g)$/i;
  const allowedImageUrl = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/product-images\/[A-Za-z0-9_.-]+$/;
  const text = (v) => (v == null ? "" : String(v));

  return products.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("يوجد منتج ببيانات غير صالحة.");
    const product = {
      id: text(raw.id).trim(), code: text(raw.code).trim(), name: text(raw.name).trim(), cat: text(raw.cat).trim(),
      color: text(raw.color).trim(), era: text(raw.era).replace(/\s+/g, " ").replace(/\s*·\s*$/, "").trim(),
      size: text(raw.size).trim(), image: normalizeImagePath(text(raw.image).trim()),
    };
    /* حقول النسخ (اختيارية): أي قيمة غير صالحة بتتحول null بدل ما تبوّظ الكتالوج كله */
    const groupId = /^[A-Za-z0-9_-]{1,100}$/.test(text(raw.group_id)) ? text(raw.group_id) : null;
    const variantBy = ["color", "size", "both"].includes(raw.variant_by) ? raw.variant_by : null;
    const colorHex = /^#[0-9a-fA-F]{6}$/.test(text(raw.color_hex)) ? text(raw.color_hex) : null;

    if (!product.id || !product.code || !product.name || !product.cat || !product.era) {
      throw new Error("بيانات منتج ناقصة (اسم/كود/تصنيف/وصف).");
    }
    if (!product.image && !groupId) throw new Error(`المنتج ${product.code} من غير صورة.`);
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(product.id)) throw new Error("معرّف المنتج غير صالح.");
    if (product.code.length > 30 || product.name.length > 100 || product.color.length > 50 ||
        product.era.length > 120 || product.size.length > 60) {
      throw new Error("أحد حقول المنتج أطول من الحد المسموح.");
    }
    if (!CATS.some((c) => c.id !== "all" && c.id === product.cat)) {
      throw new Error(`تصنيف غير معروف في المنتج ${product.code}.`);
    }
    if (product.image) {
      const okImage = (allowedImagePath.test(product.image) && !product.image.split("/").includes("..")) ||
        allowedImageUrl.test(product.image);
      if (!okImage) throw new Error(`مسار الصورة غير مسموح في المنتج ${product.code}.`);
    }
    const code = product.code.toUpperCase();
    if (ids.has(product.id) || codes.has(code)) throw new Error("معرّف المنتج وكوده يجب أن يكونا فريدين.");
    ids.add(product.id);
    codes.add(code);
    return { ...product, group_id: groupId, variant_by: variantBy, color_hex: colorHex };
  });
}

/* ---------- التحميل من قاعدة البيانات ---------- */
const CACHE_KEY = "meem-remote-cache-v3";
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
  const base = "id,code,name,cat,color,era,size,image";
  const ext = base + ",group_id,variant_by,color_hex";
  const url = (cols, order) => `/rest/v1/products?select=${cols}&order=${order}`;
  const sorted = "sort_order.asc.nullslast,created_at.asc,code.asc";
  const [cats, products] = await Promise.all([
    sbFetch("/rest/v1/categories?select=id,label,prefix"),
    // الأعمدة الجديدة (نسخ المنتج) → لو migration 006 لسه ما اتشغلتش نرجع للقديم
    sbFetch(url(ext, sorted))
      .catch(() => sbFetch(url(base, sorted)))
      .catch(() => sbFetch(url(base, "created_at.asc,code.asc"))),
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

/* ============================================================
   نسخ المنتج: نفس الدرع بألوان أو مقاسات مختلفة = بطاقة واحدة
   - variant_by = "color": الاختيار بالألوان (كل لون له صورته)
   - variant_by = "size" : الاختيار بقائمة مقاسات (الصور اختيارية)
   ============================================================ */
const COLOR_SWATCHES = {
  "ذهبي": "#C9A227", "فضي": "#C0C4CC", "أسود": "#111827", "أبيض": "#FFFFFF", "أزرق": "#1E4FA3",
  "كحلي": "#0B1F3A", "أحمر": "#B91C1C", "أخضر": "#15803D", "بنفسجي": "#6D28D9", "بني": "#6B4423",
  "وردي": "#EC7FA9", "برتقالي": "#EA7A1A", "رمادي": "#6B7280", "بيج": "#D9C7A0", "نحاسي": "#B87333",
  "برونزي": "#8C6A3F", "روز جولد": "#B76E79", "خشبي": "#B98A5A",
};

/* لون العينة: الكود المحدد في المنتج، وإلا من جدول الأسماء. بيرجّع HEX صالح أو null */
function swatchColor(variant) {
  if (variant.color_hex && /^#[0-9a-fA-F]{6}$/.test(variant.color_hex)) return variant.color_hex;
  return COLOR_SWATCHES[(variant.color || "").trim()] || null;
}

/* مجموعات النسخ: النسخ اللي ليها نفس group_id = منتج واحد (التجميع صريح، مش بالاسم).
   محاور الاختيار بتتحدد من البيانات الفعلية:
     ألوان مختلفة  → دوائر ألوان     |  مقاسات مختلفة → قائمة مقاسات     |  الاتنين → الاتنين مع بعض */
function buildGroups(products) {
  const map = new Map();
  const order = [];
  products.forEach((p) => {
    const key = p.group_id || p.id;
    let group = map.get(key);
    if (!group) {
      group = { key, by: null, colors: [], sizes: [], variants: [] };
      map.set(key, group);
      order.push(group);
    }
    group.variants.push(p);
  });
  order.forEach((g) => {
    /* النسخة اللي من غير صورة بتاخد صورة المنتج الأساسي */
    const base = g.variants.find((v) => v.image);
    g.variants.forEach((v) => { v.own_image = !!v.image; if (!v.image && base) v.image = base.image; });
    if (g.variants.length < 2) return;                       // نسخة واحدة = منتج عادي
    g.colors = [...new Set(g.variants.map((v) => v.color).filter(Boolean))];
    g.sizes = [...new Set(g.variants.map((v) => v.size).filter(Boolean))];
    const byColor = g.colors.length > 1, bySize = g.sizes.length > 1;
    g.by = byColor && bySize ? "both" : byColor ? "color" : bySize ? "size"
      : (g.variants.find((v) => v.variant_by) || {}).variant_by || "color";
  });
  return order;
}

/* اختيار النسخة المناسبة لما العميل يغيّر لون أو مقاس:
   بنحافظ على المحور التاني لو متاح، وإلا بناخد أول نسخة مطابقة */
function pickVariant(group, current, axis, value) {
  const pool = group.variants.filter((v) => (axis === "color" ? v.color : v.size) === value);
  if (!pool.length) return current;
  const other = axis === "color" ? "size" : "color";
  return pool.find((v) => v[other] === current[other]) || pool[0];
}

/* ============================================================
   إعدادات الموقع (اسم التواصل + رقم واتساب) — بيعدّلها الأدمن
   ============================================================ */
const SETTINGS_KEY = "meem-settings-v1";

function applySettingsObject(s) {
  if (!s) return false;
  let changed = false;
  const phone = String(s.whatsapp_number || "");
  if (/^[1-9][0-9]{7,14}$/.test(phone) && phone !== WHATSAPP_NUMBER) { WHATSAPP_NUMBER = phone; changed = true; }
  const name = String(s.contact_name || "").trim();
  if (name && name.length <= 60 && name !== CONTACT_NAME) { CONTACT_NAME = name; changed = true; }
  return changed;
}

function initialSettings() {
  try { applySettingsObject(JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null")); } catch (e) {}
}

async function loadSettings() {
  const rows = await sbFetch("/rest/v1/site_settings?select=key,value");
  const s = {};
  (rows || []).forEach((r) => { s[r.key] = r.value; });
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch (e) {}
  return s;
}
