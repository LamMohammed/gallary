/* ============================================================
   بيانات الدروع — عشان تضيف درع جديد:
   1) ضيف صورة المنتج جوه فولدر images/
   2) انسخ سطر من اللي تحت وغيّر: id (فريد)، code (كود المنتج)، cat (خامة)،
      name (اسم الدرع)، era (وصف قصير)، size (المقاس)،
      image (مسار الصورة جوه images/)
   الخامات المتاحة (cat): wood, leather, crystal, acrylic, metal
   ============================================================ */
const ACCOUNT_NAME = "شركة ميم  ";
const WHATSAPP_NUMBER = "201000082027";

const SHIELDS = [
  {
    id: "g1",
    code: "GO-001",
    cat: "gold",
    name: " `ذهبي `",
    era: "  ذهبي ملكي  بتصميم  عصري ·  ",
    size: "176×230",
    image: "images/gold-1.webp",
  },
  {
    id: "g2",
    code: "GO-002",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-2.webp",
  },

  {
    id: "g3",
    code: "GO-003",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-3.webp",
  },

  {
    id: "g4",
    code: "GO-004",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-4.webp",
  },
  {
    id: "g5",
    code: "GO-005",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-5.webp",
  },
  {
    id: "g6",
    code: "GO-006",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-6.webp",
  },
  {
    id: "g7",
    code: "GO-007",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-7.webp",
  },
  {
    id: "g8",
    code: "GO-008",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-8.webp",
  },
  {
    id: "g9",
    code: "GO-009",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-9.webp",
  },
  {
    id: "g10",
    code: "GO-010",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-10.webp",
  },
  {
    id: "g11",
    code: "GO-011",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-11.webp",
  },
  {
    id: "g12",
    code: "GO-012",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-12.webp",
  },
  {
    id: "g13",
    code: "GO-013",
    cat: "gold",
    name: "ذهبي ",
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
    name: "المسلة الكريستالية",
    era: "كريستال شفاف · قاعدة خشبية",
    size: "ارتفاع 25سم",
    image: "images/crystal-1.webp",
  },
  {
    id: "c2",
    code: "CR-002",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-2.webp",
  },
  {
    id: "c3",
    code: "CR-003",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-3.webp",
  },
  {
    id: "c4",
    code: "CR-004",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-4.webp",
  },
  {
    id: "c5",
    code: "CR-005",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-5.webp",
  },
  {
    id: "c6",
    code: "CR-006",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-6.webp",
  },

  {
    id: "c7",
    code: "CR-007",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-7.webp",
  },
  {
    id: "c8",
    code: "CR-008",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-8.webp",
  },
  {
    id: "c9",
    code: "CR-009",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-9.webp",
  },
  {
    id: "c10",
    code: "CR-010",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-10.webp",
  },
  {
    id: "c11",
    code: "CR-011",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-11.webp",
  },
  {
    id: "c12",
    code: "CR-012",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-12.webp",
  },
  {
    id: "c13",
    code: "CR-013",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-13.webp",
  },
  {
    id: "c14",
    code: "CR-014",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-14.webp",
  },
  {
    id: "c15",
    code: "CR-015",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-15.webp",
  },
  {
    id: "c16",
    code: "CR-016",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-16.webp",
  },
{
    id: "c17",
    code: "CR-017",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-17.webp",
  },
{
    id: "c18",
    code: "CR-018",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-18.webp",
  },
{
    id: "c19",
    code: "CR-019",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-19.webp",
  },
{
    id: "c20",
    code: "CR-020",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-20.webp",
  },


  {
    id: "a1",
    code: "AC-001",
    cat: "acrylic",
    name: "لوحة الشكر",
    era: "أكريليك فاتح · حفر ليزر",
    size: "أفقي 30×22سم",
    image: "images/acrylic-1.webp",
  },
  {
    id: "a2",
    code: "AC-002",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-2.webp",
  },
  {
    id: "a3",
    code: "AC-003",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-3.webp",
  },
  {
    id: "a4",
    code: "AC-004",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-4.webp",
  },
  {
    id: "a5",
    code: "AC-005",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-5.webp",
  },

  // {id:'m1', cat:'metal', name:'العرش الفضي', era:'معدن مصقول · أعمدة ملكية', size:'ارتفاع 28سم', image:'images/metal-1.webp'},
  // {id:'m2', cat:'metal', name:'الصولجان الملكي', era:'معدن مصقول · نقش متعرج', size:'ارتفاع 30سم', image:'images/metal-2.webp'},
];

const CATS = [
  { id: "all", label: "الكل" },
  { id: "gold", label: "ذهبي" },
  // {id:'leather', label:'جلدي'},
  { id: "crystal", label: "كريستال" },
  { id: "acrylic", label: "أكريليك منقوش" },
  // {id:'metal', label:'معدني فضي'},
];

const grid = document.getElementById("grid");
const filtersEl = document.getElementById("filters");
const countEl = document.getElementById("count");
const filterBar = document.querySelector(".filter-bar");
const filterBarSlot = document.querySelector(".filter-bar-slot");
const productModal = document.getElementById("product-modal");
const modalImage = document.getElementById("modal-product-image");
const modalMaterial = document.getElementById("modal-product-material");
const modalName = document.getElementById("modal-product-name");
const modalCode = document.getElementById("modal-product-code");
const modalCounter = document.getElementById("modal-product-counter");
const modalWhatsapp = document.getElementById("modal-product-whatsapp");
const modalQuantityControl = document.getElementById("modal-quantity-control");
const modalPrevBtn = document.getElementById("modal-prev");
const modalNextBtn = document.getElementById("modal-next");
const modalSelectToggle = document.getElementById("modal-select-toggle");
let modalList = [];
let modalIndex = -1;
const scrollTopButton = document.getElementById("scroll-top");
let active = "all";
let currentCount = 0;

const cameraIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/>
  <circle cx="12" cy="13" r="3.5"/>
</svg>`;

function catLabel(id) {
  return CATS.find((c) => c.id === id).label;
}

function whatsappUrl(product, quantity = 1) {
  const message = `👋 مرحبًا، أريد الاستفسار عن هذا المنتج:

🏆 اسم المنتج: ${product.name}
📌 كود المنتج: ${product.code}
✨ الخامة: ${catLabel(product.cat)}
🔢 الكمية: ${toArabicNumber(quantity)}

أريد معرفة السعر والتفاصيل المتاحة.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ---------- bulk selection + multi-product WhatsApp send ---------- */
const selectedIds = new Set();
const productQuantities = new Map(SHIELDS.map((product) => [product.id, 1]));
const bulkBar = document.getElementById("bulk-bar");
const bulkCount = document.getElementById("bulk-bar-count");
const bulkSend = document.getElementById("bulk-bar-send");
const bulkClear = document.getElementById("bulk-bar-clear");

const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNumber(n) {
  return String(n)
    .split("")
    .map((d) => arabicDigits[d] ?? d)
    .join("");
}

function quantityControlMarkup(product) {
  return `
    <div class="quantity-control" aria-label="تحديد كمية ${product.name}">
      <span class="quantity-control__label">الكمية</span>
      <div class="quantity-control__stepper">
        <button class="quantity-control__button" type="button" data-quantity-change="-1" data-product-id="${product.id}" aria-label="تقليل كمية ${product.name}">−</button>
        <output class="quantity-control__value" data-quantity-value="${product.id}" aria-live="polite">${toArabicNumber(productQuantities.get(product.id) ?? 1)}</output>
        <button class="quantity-control__button" type="button" data-quantity-change="1" data-product-id="${product.id}" aria-label="زيادة كمية ${product.name}">+</button>
      </div>
    </div>`;
}

function updateProductQuantity(id, change) {
  const currentQuantity = productQuantities.get(id);
  if (currentQuantity === undefined) return;

  const quantity = Math.max(1, currentQuantity + change);
  productQuantities.set(id, quantity);
  grid.querySelectorAll(`[data-quantity-value="${id}"]`).forEach((output) => {
    output.textContent = toArabicNumber(quantity);
  });

  const product = SHIELDS.find((item) => item.id === id);
  if (product) {
    const whatsappButton = grid.querySelector(`.wa-button[data-product-id="${id}"]`);
    if (whatsappButton) whatsappButton.href = whatsappUrl(product, quantity);
  }

  if (modalSelectToggle.dataset.productId === id) {
    const modalValue = modalQuantityControl.querySelector("[data-quantity-value]");
    if (modalValue) modalValue.textContent = toArabicNumber(quantity);
    if (product) modalWhatsapp.href = whatsappUrl(product, quantity);
  }
}

function updateBulkBar() {
  const count = selectedIds.size;
  if (count === 0) {
    bulkBar.classList.remove("is-visible");
    document.body.classList.remove("has-bulk-bar");
    setTimeout(() => {
      if (selectedIds.size === 0) bulkBar.hidden = true;
    }, 300);
    return;
  }
  bulkBar.hidden = false;
  document.body.classList.add("has-bulk-bar");
  requestAnimationFrame(() => bulkBar.classList.add("is-visible"));
  bulkCount.textContent = count === 1 ? "منتج واحد محدد" : `${toArabicNumber(count)} منتجات محددة`;
}

function toggleSelect(id) {
  const toggleBtn = grid.querySelector(`.select-toggle[data-product-id="${id}"]`);
  const card = grid.querySelector(`.card[data-product-id="${id}"]`);
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
    toggleBtn?.classList.remove("is-selected");
    card?.classList.remove("is-selected");
  } else {
    selectedIds.add(id);
    toggleBtn?.classList.add("is-selected");
    card?.classList.add("is-selected");
  }
  if (modalSelectToggle.dataset.productId === id) {
    modalSelectToggle.classList.toggle("is-selected", selectedIds.has(id));
  }
  updateBulkBar();
}

function clearSelection() {
  selectedIds.forEach((id) => {
    grid.querySelector(`.select-toggle[data-product-id="${id}"]`)?.classList.remove("is-selected");
    grid.querySelector(`.card[data-product-id="${id}"]`)?.classList.remove("is-selected");
  });
  selectedIds.clear();
  modalSelectToggle.classList.remove("is-selected");
  updateBulkBar();
}

bulkSend.addEventListener("click", () => {
  const items = SHIELDS.filter((s) => selectedIds.has(s.id));
  if (items.length === 0) return;

  const lines = items.map(
    (p, i) =>
      `${toArabicNumber(i + 1)}-\n🏆 اسم المنتج: ${p.name}\n📌 كود المنتج: ${p.code}\n✨ الخامة: ${catLabel(p.cat)}\n🔢 الكمية: ${toArabicNumber(productQuantities.get(p.id) ?? 1)}`,
  );
  const message = `👋 مرحبًا، أريد الاستفسار عن هذه المنتجات:\n\n${lines.join("\n\n")}\n\nأريد معرفة السعر والتفاصيل المتاحة.`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  clearSelection();
});

bulkClear.addEventListener("click", clearSelection);

/* open a product's modal directly if the page was opened with ?product=<id> */
function initDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("product");
  if (!id) return;
  const product = SHIELDS.find((s) => s.id === id);
  if (product) {
    setTimeout(() => openProductModal(product), 400);
  }
}

function visibleShields() {
  return active === "all" ? SHIELDS : SHIELDS.filter((s) => s.cat === active);
}

function openProductModal(product, list) {
  modalList = list || visibleShields();
  modalIndex = modalList.findIndex((s) => s.id === product.id);
  if (modalIndex === -1) {
    modalList = [product];
    modalIndex = 0;
  }
  renderModalProduct();
  productModal.hidden = false;
  document.body.classList.add("modal-open");
}

function renderModalProduct() {
  const product = modalList[modalIndex];
  if (!product) return;

  modalImage.classList.add("is-loading");
  modalImage.onload = () => modalImage.classList.remove("is-loading");
  modalImage.onerror = () => modalImage.classList.remove("is-loading");
  modalImage.src = product.image;
  modalImage.alt = product.name;

  modalMaterial.textContent = `الخامة: ${catLabel(product.cat)}`;
  modalName.textContent = product.name;
  modalCode.textContent = `كود المنتج: ${product.code}`;
  const quantity = productQuantities.get(product.id) ?? 1;
  modalWhatsapp.href = whatsappUrl(product, quantity);
  modalQuantityControl.innerHTML = quantityControlMarkup(product);

  modalSelectToggle.dataset.productId = product.id;
  modalSelectToggle.classList.toggle("is-selected", selectedIds.has(product.id));
  modalSelectToggle.setAttribute(
    "aria-label",
    selectedIds.has(product.id) ? `إلغاء تحديد ${product.name}` : `تحديد ${product.name} للإرسال`,
  );

  const showNav = modalList.length > 1;
  modalPrevBtn.style.display = showNav ? "flex" : "none";
  modalNextBtn.style.display = showNav ? "flex" : "none";
  modalCounter.textContent = showNav ? `${modalIndex + 1} / ${modalList.length}` : "";
}

function stepModal(delta) {
  if (modalList.length === 0) return;
  modalIndex = (modalIndex + delta + modalList.length) % modalList.length;
  renderModalProduct();
}

function closeProductModal() {
  productModal.hidden = true;
  document.body.classList.remove("modal-open");
}

modalPrevBtn.addEventListener("click", () => stepModal(-1));
modalNextBtn.addEventListener("click", () => stepModal(1));
modalSelectToggle.addEventListener("click", () => {
  const id = modalSelectToggle.dataset.productId;
  if (!id) return;
  toggleSelect(id);
  modalSelectToggle.classList.toggle("is-selected", selectedIds.has(id));
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity-change]");
  if (!button) return;
  event.stopPropagation();
  updateProductQuantity(button.dataset.productId, Number(button.dataset.quantityChange));
});

modalQuantityControl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity-change]");
  if (!button) return;
  updateProductQuantity(button.dataset.productId, Number(button.dataset.quantityChange));
});

function renderGrid() {
  grid.innerHTML = SHIELDS.map(
    (s, i) => `
    <div class="card" data-cat="${s.cat}" data-product-id="${s.id}" style="--d:${(i % 8) * 0.06}s">
      <div class="thumb">
        <div class="placeholder">
          ${cameraIcon}
          <span>ضيف صورة "${s.image.split("/").pop()}" في فولدر images</span>
        </div>
        <img class="product-image" src="${s.image}" alt="${s.name}" loading="lazy" decoding="async"
             data-product-id="${s.id}" tabindex="0" role="button"
             onerror="this.remove()">
        <span class="product-code-badge">${s.code}</span>
        <button class="select-toggle" type="button" data-product-id="${s.id}" aria-label="تحديد ${s.name} للإرسال">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
        <div class="shine"></div>
      </div>
      <p class="era">${s.era}</p>
      <h3>${s.name}</h3>
      ${quantityControlMarkup(s)}
      <div class="card-meta">
        <p class="cat">${catLabel(s.cat)} · ${s.size}</p>
        <a
          class="wa-button"
          href="${whatsappUrl(s)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل عبر واتساب: ${s.name}"
          title="WhatsApp"
          data-product-id="${s.id}"
          data-product-code="${s.code}"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20.52 3.48A11.92 11.92 0 0 0 12.09 0C5.5 0 .12 5.38.12 12.02c0 2.12.55 4.18 1.6 5.99L0 24l6.15-1.61a11.98 11.98 0 0 0 5.94 1.8h.01c6.58 0 11.97-5.38 11.97-12.02 0-3.2-1.24-6.21-3.48-8.49Zm-8.43 18.46h-.01c-1.91 0-3.78-.51-5.41-1.48l-.39-.23-3.65.96.98-3.55-.25-.39A9.48 9.48 0 0 1 2.1 12.02c0-5.23 4.26-9.48 9.49-9.48a9.42 9.42 0 0 1 6.7 2.78 9.46 9.46 0 0 1 2.78 6.7c0 5.24-4.26 9.48-9.49 9.48Zm5.21-7.1c-.28-.14-1.67-.82-1.93-.92-.26-.1-.45-.14-.63.14-.18.28-.71.92-.87 1.11-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.63-1.52-.86-2.08-.22-.55-.45-.47-.63-.48l-.54-.01c-.18 0-.48.07-.73.36-.25.29-1 1-1 2.45s1.03 2.84 1.17 3.04c.14.2 2.02 3.08 4.9 4.32.68.29 1.22.46 1.64.59.69.22 1.32.19 1.81.11.55-.08 1.67-.68 1.9-1.34.23-.66.23-1.23.16-1.35-.07-.12-.26-.2-.54-.34Z" fill="currentColor"/>
          </svg>
          <span>واتساب</span>
        </a>
      </div>
    </div>
  `,
  ).join("");

  // mouse-follow shine per card
  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      const thumb = card.querySelector(".thumb");
      thumb.style.setProperty("--mx", x + "%");
      thumb.style.setProperty("--my", y + "%");
    });
  });

  grid.querySelectorAll(".product-image").forEach((image) => {
    const product = SHIELDS.find((item) => item.id === image.dataset.productId);
    if (!product) return;

    image.addEventListener("click", () => openProductModal(product));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProductModal(product);
      }
    });
  });

  grid.querySelectorAll(".select-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleSelect(btn.dataset.productId);
    });
  });

  observeCards();
}

function renderFilters() {
  filtersEl.innerHTML = CATS.map(
    (c) =>
      `<button class="chip ${c.id === active ? "active" : ""}" data-cat="${c.id}">${c.label}</button>`,
  ).join("");
  filtersEl.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      active = btn.dataset.cat;
      applyFilter();
      renderFilters();
    });
  });
}

function animateCount(to) {
  const from = currentCount;
  const start = performance.now();
  const dur = 320;
  function step(now) {
    const p = Math.min(1, (now - start) / dur);
    const val = Math.round(from + (to - from) * p);
    countEl.innerHTML = `عرض <b>${val}</b> من أصل <b>${SHIELDS.length}</b> درعًا`;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  currentCount = to;
}

function applyFilter() {
  const cards = grid.querySelectorAll(".card");
  let visible = 0;
  cards.forEach((card) => {
    const match = active === "all" || card.dataset.cat === active;
    if (match) {
      card.classList.remove("hidden", "in-view");
      requestAnimationFrame(() => {
        if (!card.classList.contains("hidden") &&
            (active === "all" || card.dataset.cat === active)) {
          card.classList.add("in-view");
        }
      });
      visible++;
    } else {
      card.classList.remove("in-view");
      card.classList.add("hidden");
    }
  });
  animateCount(visible);
}

/* scroll-reveal */
function observeCards() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  grid.querySelectorAll(".card").forEach((card) => io.observe(card));
}

/* scroll-to-top button visibility */
function updateScrollControls() {
  scrollTopButton.classList.toggle("visible", window.scrollY > 360);

  const shouldFixFilterBar = window.scrollY >= 300;
  if (shouldFixFilterBar === filterBar.classList.contains("is-fixed")) return;

  if (shouldFixFilterBar) {
    filterBarSlot.style.height = `${filterBar.offsetHeight}px`;
    filterBar.classList.add("is-fixed");
  } else {
    filterBar.classList.remove("is-fixed");
    filterBarSlot.style.height = "";
  }
}

window.addEventListener("scroll", updateScrollControls, { passive: true });
updateScrollControls();

scrollTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

productModal.querySelectorAll("[data-modal-close]").forEach((element) => {
  element.addEventListener("click", closeProductModal);
});

document.addEventListener("keydown", (event) => {
  if (productModal.hidden) return;
  if (event.key === "Escape") closeProductModal();
  if (event.key === "ArrowLeft") stepModal(1);
  if (event.key === "ArrowRight") stepModal(-1);
});

/* ambient floating shapes */
(function initFloaters() {
  const host = document.getElementById("floaters");
  const n = 6;
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    const size = 120 + Math.random() * 180;
    s.style.width = size + "px";
    s.style.height = size + "px";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDuration = 14 + Math.random() * 10 + "s";
    s.style.animationDelay = Math.random() * -20 + "s";
    host.appendChild(s);
  }
})();

const accountNameEl = document.getElementById("account-name");
if (accountNameEl) {
  accountNameEl.textContent = ACCOUNT_NAME;
}

/* header contact: name + formatted phone number, built from WHATSAPP_NUMBER */
(function initHeaderContact() {
  const link = document.getElementById("header-contact");
  const phoneEl = document.getElementById("header-contact-phone");
  if (!link || !phoneEl) return;

  // "201000082027" -> local "01000082027" -> "010 0008 2027"
  const local = "0" + WHATSAPP_NUMBER.slice(2);
  const formatted = `${local.slice(0, 3)} ${local.slice(3, 7)} ${local.slice(7)}`;

  phoneEl.textContent = formatted;
  link.href = `tel:+${WHATSAPP_NUMBER}`;
})();

renderGrid();
renderFilters();
applyFilter();
initDeepLink();

/* ---------- page loader ---------- */
(function initPageLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  const minDelay = new Promise((resolve) => setTimeout(resolve, 450));
  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve, { once: true });
  });
  Promise.all([minDelay, pageLoaded]).then(() => {
    loader.classList.add("is-hidden");
    setTimeout(() => loader.remove(), 600);
  });
})();