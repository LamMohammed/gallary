initialSettings();
let SHIELDS = initialCatalog();

/* ---------- نسخ المنتج (ألوان / مقاسات) ---------- */
let GROUPS = [];
const GROUP_BY_KEY = new Map();
const GROUP_BY_VARIANT = new Map();
const activeVariant = new Map(); // مفتاح المجموعة -> id النسخة المعروضة

function indexGroups() {
  GROUPS = buildGroups(SHIELDS);
  GROUP_BY_KEY.clear();
  GROUP_BY_VARIANT.clear();
  GROUPS.forEach((group) => {
    GROUP_BY_KEY.set(group.key, group);
    group.variants.forEach((variant) => GROUP_BY_VARIANT.set(variant.id, group));
  });
  [...activeVariant.keys()].forEach((key) => {
    const group = GROUP_BY_KEY.get(key);
    if (!group || !group.variants.some((variant) => variant.id === activeVariant.get(key))) activeVariant.delete(key);
  });
}
const groupOfVariant = (id) => GROUP_BY_VARIANT.get(id) || null;
function currentVariant(group) {
  return group.variants.find((variant) => variant.id === activeVariant.get(group.key)) || group.variants[0];
}
indexGroups();

const grid = document.getElementById("grid");
const filtersEl = document.getElementById("filters");
const countEl = document.getElementById("count");
const filterBar = document.querySelector(".filter-bar");
const filterBarSlot = document.querySelector(".filter-bar-slot");
const productModal = document.getElementById("product-modal");
const modalImage = document.getElementById("modal-product-image");
const modalMaterial = document.getElementById("modal-product-material");
const modalColor = document.getElementById("modal-product-color");
const modalSize = document.getElementById("modal-product-size");
const modalName = document.getElementById("modal-product-name");
const modalCode = document.getElementById("modal-product-code");
const modalCounter = document.getElementById("modal-product-counter");
const modalWhatsapp = document.getElementById("modal-product-whatsapp");
const modalQuantityControl = document.getElementById("modal-quantity-control");
const modalPrevBtn = document.getElementById("modal-prev");
const modalNextBtn = document.getElementById("modal-next");
const modalSelectToggle = document.getElementById("modal-select-toggle");
let modalGroups = [];
let modalIndex = -1;
const scrollTopButton = document.getElementById("scroll-top");
let active = "all";
let currentCount = 0;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

const cameraIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/>
  <circle cx="12" cy="13" r="3.5"/>
</svg>`;

function catLabel(id) {
  return CATS.find((c) => c.id === id).label;
}

/* اللون بيتعرض بس لو لون حقيقي للنسخة (مش اللون العام التلقائي حسب الخامة) */
function colorShown(product) {
  const color = (product.color || "").trim();
  if (!color) return false;
  const group = groupOfVariant(product.id);
  if (group && (group.by === "color" || group.by === "both")) return true;
  return color !== (GENERIC_COLORS[product.cat] || "") && color !== catLabel(product.cat);
}

function productMessageLines(product) {
  const lines = [`🏆 اسم المنتج: ${product.name}`, `📌 كود المنتج: ${product.code}`, `✨ الخامة: ${catLabel(product.cat)}`];
  if (colorShown(product)) lines.push(`🎨 اللون: ${product.color}`);
  if (product.size) lines.push(`📐 المقاس: ${isoSize(product.size)}`);
  return lines;
}

function whatsappUrl(product, quantity = 1) {
  const lines = [...productMessageLines(product), `🔢 الكمية: ${toArabicNumber(quantity)}`];
  const message = `👋 مرحبًا، أريد الاستفسار عن هذا المنتج:\n\n${lines.join("\n")}\n\nأريد معرفة السعر والتفاصيل المتاحة.`;
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
  const productName = escapeHtml(product.name);
  const productId = escapeHtml(product.id);
  return `
    <div class="quantity-control" aria-label="تحديد كمية ${productName}">
      <span class="quantity-control__label">الكمية</span>
      <div class="quantity-control__stepper">
        <button class="quantity-control__button" type="button" data-quantity-change="-1" data-product-id="${productId}" aria-label="تقليل كمية ${productName}">−</button>
        <input class="quantity-control__value" type="text" inputmode="numeric" pattern="[0-9٠-٩۰-۹]*" autocomplete="off" aria-label="الكمية: ${productName}" data-quantity-value="${productId}" value="${toArabicNumber(productQuantities.get(product.id) ?? 1)}">
        <button class="quantity-control__button" type="button" data-quantity-change="1" data-product-id="${productId}" aria-label="زيادة كمية ${productName}">+</button>
      </div>
    </div>`;
}

function parseQuantity(value) {
  const normalized = String(value)
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
  if (!/^\d+$/.test(normalized)) return null;

  const quantity = Number(normalized);
  return Number.isSafeInteger(quantity) ? Math.max(1, quantity) : null;
}

function updateProductQuantity(id, quantity, sourceInput = null) {
  if (!Number.isSafeInteger(quantity)) return;
  quantity = Math.max(1, quantity);
  productQuantities.set(id, quantity);
  document.querySelectorAll(`[data-quantity-value="${id}"]`).forEach((input) => {
    if (input !== sourceInput) input.value = toArabicNumber(quantity);
  });

  const product = SHIELDS.find((item) => item.id === id);
  if (product) {
    const whatsappButton = grid.querySelector(`.wa-button[data-product-id="${id}"]`);
    if (whatsappButton) whatsappButton.href = whatsappUrl(product, quantity);
  }

  if (modalSelectToggle.dataset.productId === id) {
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

  const lines = items.map((p, i) =>
    `${toArabicNumber(i + 1)}-\n${[...productMessageLines(p), `🔢 الكمية: ${toArabicNumber(productQuantities.get(p.id) ?? 1)}`].join("\n")}`,
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

function visibleGroups() {
  return active === "all" ? GROUPS : GROUPS.filter((group) => group.variants[0].cat === active);
}

function openProductModal(product) {
  const group = groupOfVariant(product.id) || { key: product.id, by: null, variants: [product] };
  if (GROUP_BY_KEY.has(group.key) && currentVariant(group).id !== product.id) setActiveVariant(group.key, product.id);
  modalGroups = visibleGroups();
  modalIndex = modalGroups.indexOf(group);
  if (modalIndex === -1) {
    modalGroups = [group];
    modalIndex = 0;
  }
  renderModalProduct();
  productModal.hidden = false;
  document.body.classList.add("modal-open");
}

function renderModalProduct() {
  const group = modalGroups[modalIndex];
  if (!group) return;
  const product = currentVariant(group);

  modalImage.classList.add("is-loading");
  modalImage.onload = () => modalImage.classList.remove("is-loading");
  modalImage.onerror = () => modalImage.classList.remove("is-loading");
  modalImage.src = product.image;
  modalImage.alt = product.name;

  modalMaterial.textContent = `الخامة: ${catLabel(product.cat)}`;
  modalColor.textContent = `اللون: ${product.color}`;
  modalColor.hidden = !colorShown(product);
  modalSize.textContent = `المقاس: ${isoSize(product.size)}`;
  modalSize.hidden = !product.size;
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

  const showNav = modalGroups.length > 1;
  modalPrevBtn.style.display = showNav ? "flex" : "none";
  modalNextBtn.style.display = showNav ? "flex" : "none";
  modalCounter.textContent = showNav ? `${modalIndex + 1} / ${modalGroups.length}` : "";
  renderModalVariants(group, product);
  renderModalGallery(group, product);
}

function stepModal(delta) {
  if (modalGroups.length === 0) return;
  modalIndex = (modalIndex + delta + modalGroups.length) % modalGroups.length;
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
  const currentQuantity = productQuantities.get(button.dataset.productId);
  if (currentQuantity !== undefined) {
    updateProductQuantity(
      button.dataset.productId,
      currentQuantity + Number(button.dataset.quantityChange),
    );
  }
});

modalQuantityControl.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity-change]");
  if (!button) return;
  const currentQuantity = productQuantities.get(button.dataset.productId);
  if (currentQuantity !== undefined) {
    updateProductQuantity(
      button.dataset.productId,
      currentQuantity + Number(button.dataset.quantityChange),
    );
  }
});

function handleQuantityInput(event) {
  const input = event.target.closest("[data-quantity-value]");
  if (!input) return;

  const quantity = parseQuantity(input.value);
  if (quantity === null) {
    if (event.type === "change") {
      const currentQuantity = productQuantities.get(input.dataset.quantityValue);
      if (currentQuantity !== undefined) input.value = toArabicNumber(currentQuantity);
    }
    return;
  }

  updateProductQuantity(input.dataset.quantityValue, quantity, input);
  if (event.type === "change") input.value = toArabicNumber(quantity);
}

grid.addEventListener("input", handleQuantityInput);
grid.addEventListener("change", handleQuantityInput);
modalQuantityControl.addEventListener("input", handleQuantityInput);
modalQuantityControl.addEventListener("change", handleQuantityInput);

function swatchStyle(variant) {
  const color = swatchColor(variant);
  return color ? ` style="--sw:${color}"` : "";
}

function variantPickerMarkup(group, current) {
  if (!group.by) return "";
  const key = escapeHtml(group.key);
  const hasColors = group.colors.length > 1;
  const hasSizes = group.sizes.length > 1;
  let html = "";
  if (hasColors) {
    const buttons = group.colors.map((color) => {
      const rep = pickVariant(group, current, "color", color);
      const isActive = color === current.color;
      const clear = !swatchColor(rep) && /شفاف|زجاج/.test(color) ? " swatch--clear" : "";
      return `<button class="swatch${clear}${isActive ? " is-active" : ""}" type="button" role="radio" aria-checked="${isActive}" aria-label="اللون: ${escapeHtml(color)}" title="${escapeHtml(color)}" data-group-key="${key}" data-axis="color" data-value="${escapeHtml(color)}"${swatchStyle(rep)}></button>`;
    }).join("");
    html += `<div class="variant-picker"><span class="variant-picker__label">اللون</span><div class="swatches" role="radiogroup" aria-label="اختيار اللون">${buttons}</div></div>`;
  }
  if (hasSizes) {
    const buttons = group.sizes.map((size) => {
      const isActive = size === current.size;
      return `<button class="size-option${isActive ? " is-active" : ""}" type="button" role="radio" aria-checked="${isActive}" data-group-key="${key}" data-axis="size" data-value="${escapeHtml(size)}">${escapeHtml(isoSize(size))}</button>`;
    }).join("");
    html += `<div class="variant-picker"><span class="variant-picker__label">المقاس</span><div class="size-options" role="radiogroup" aria-label="اختيار المقاس">${buttons}</div></div>`;
  }
  if (!hasColors && !hasSizes) {
    /* نسخ من غير لون ولا مقاس مختلفين: نعرضها بالكود عشان ما نخفيش أي منتج */
    const buttons = group.variants.map((variant) => {
      const isActive = variant.id === current.id;
      return `<button class="swatch swatch--code${isActive ? " is-active" : ""}" type="button" role="radio" aria-checked="${isActive}" aria-label="${escapeHtml(variant.code)}" title="${escapeHtml(variant.code)}" data-group-key="${key}" data-variant-id="${escapeHtml(variant.id)}"></button>`;
    }).join("");
    html += `<div class="variant-picker"><span class="variant-picker__label">النسخة</span><div class="swatches" role="radiogroup" aria-label="اختيار النسخة">${buttons}</div></div>`;
  }
  return html;
}

function cardMarkup(group, i) {
  const s = currentVariant(group);
  const name = escapeHtml(s.name);
  const code = escapeHtml(s.code);
  const image = escapeHtml(thumbOf(s.image));
  const isSelected = selectedIds.has(s.id);
  return `
    <div class="card${isSelected ? " is-selected" : ""}" data-cat="${escapeHtml(s.cat)}" data-product-id="${escapeHtml(s.id)}" data-group-key="${escapeHtml(group.key)}" style="--d:${(i % 8) * 0.06}s">
      <div class="thumb">
        <div class="placeholder">
          ${cameraIcon}
          <span>جاري تحميل الصورة</span>
        </div>
        <img class="product-image" src="${image}" alt="${name}" loading="lazy" decoding="async"
             data-product-id="${escapeHtml(s.id)}" tabindex="0" role="button">
        <span class="product-code-badge">${code}</span>
        <button class="select-toggle${isSelected ? " is-selected" : ""}" type="button" data-product-id="${escapeHtml(s.id)}" aria-label="تحديد ${name} للإرسال">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
        <div class="shine"></div>
      </div>
      <p class="era">${escapeHtml(s.era)}</p>
      <h3>${name}</h3>
      <div class="card-specs" aria-label="مواصفات المنتج">
        <span class="card-specs__material">${escapeHtml(catLabel(s.cat))}</span>
        ${colorShown(s) ? `<span class="card-specs__color">${escapeHtml(s.color)}</span>` : ""}
        ${s.size ? `<span class="card-specs__size">${escapeHtml(isoSize(s.size))}</span>` : ""}
      </div>
      ${variantPickerMarkup(group, s)}
      ${quantityControlMarkup(s)}
      <div class="card-meta">
        <a
          class="wa-button"
          href="${whatsappUrl(s, productQuantities.get(s.id) ?? 1)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل عبر واتساب: ${name}"
          title="WhatsApp"
          data-product-id="${escapeHtml(s.id)}"
          data-product-code="${code}"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20.52 3.48A11.92 11.92 0 0 0 12.09 0C5.5 0 .12 5.38.12 12.02c0 2.12.55 4.18 1.6 5.99L0 24l6.15-1.61a11.98 11.98 0 0 0 5.94 1.8h.01c6.58 0 11.97-5.38 11.97-12.02 0-3.2-1.24-6.21-3.48-8.49Zm-8.43 18.46h-.01c-1.91 0-3.78-.51-5.41-1.48l-.39-.23-3.65.96.98-3.55-.25-.39A9.48 9.48 0 0 1 2.1 12.02c0-5.23 4.26-9.48 9.49-9.48a9.42 9.42 0 0 1 6.7 2.78 9.46 9.46 0 0 1 2.78 6.7c0 5.24-4.26 9.48-9.49 9.48Zm5.21-7.1c-.28-.14-1.67-.82-1.93-.92-.26-.1-.45-.14-.63.14-.18.28-.71.92-.87 1.11-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.63-1.52-.86-2.08-.22-.55-.45-.47-.63-.48l-.54-.01c-.18 0-.48.07-.73.36-.25.29-1 1-1 2.45s1.03 2.84 1.17 3.04c.14.2 2.02 3.08 4.9 4.32.68.29 1.22.46 1.64.59.69.22 1.32.19 1.81.11.55-.08 1.67-.68 1.9-1.34.23-.66.23-1.23.16-1.35-.07-.12-.26-.2-.54-.34Z" fill="currentColor"/>
          </svg>
          <span>واتساب</span>
        </a>
      </div>
    </div>
  `;
}

function renderGrid() {
  grid.innerHTML = GROUPS.map((group, i) => cardMarkup(group, i)).join("");
  observeCards();
}

/* تبديل النسخة المعروضة (لون/مقاس) في البطاقة وفي المودال */
function setActiveVariant(key, variantId) {
  const group = GROUP_BY_KEY.get(key);
  if (!group || !group.variants.some((variant) => variant.id === variantId)) return;
  activeVariant.set(key, variantId);

  const old = grid.querySelector(`.card[data-group-key="${CSS.escape(key)}"]`);
  if (old) {
    const holder = document.createElement("div");
    holder.innerHTML = cardMarkup(group, GROUPS.indexOf(group)).trim();
    const fresh = holder.firstElementChild;
    fresh.classList.add("in-view");
    if (old.classList.contains("hidden")) fresh.classList.add("hidden");
    const focused = old.contains(document.activeElement) ? document.activeElement : null;
    old.replaceWith(fresh);
    if (focused) {
      (focused.dataset.axis
        ? fresh.querySelector(`[data-axis="${focused.dataset.axis}"][data-value="${CSS.escape(focused.dataset.value)}"]`)
        : focused.dataset.value !== undefined
          ? fresh.querySelector(`.swatch[data-axis="color"][data-value="${CSS.escape(focused.dataset.value)}"]`)
          : fresh.querySelector(`[data-variant-id="${CSS.escape(variantId)}"]`))?.focus();
    }
  }
  if (!productModal.hidden && modalGroups[modalIndex] && modalGroups[modalIndex].key === key) renderModalProduct();
}

/* العميل غيّر لون أو مقاس: نجيب النسخة المطابقة ونحافظ على المحور التاني لو متاح */
function selectAxis(key, axis, value) {
  const group = GROUP_BY_KEY.get(key);
  if (!group) return;
  setActiveVariant(key, pickVariant(group, currentVariant(group), axis, value).id);
}

function renderModalVariants(group, current) {
  const host = document.getElementById("modal-variants");
  if (!host) return;
  if (!group.by) {
    host.innerHTML = "";
    return;
  }
  let html = "";
  if (group.colors.length > 1) {
    html += `<p class="modal-variants__title">الألوان المتاحة</p><div class="modal-thumbs" role="radiogroup" aria-label="اختيار اللون">${
      group.colors.map((color) => {
        const rep = pickVariant(group, current, "color", color);
        const isActive = color === current.color;
        return `<button class="modal-thumb${isActive ? " is-active" : ""}" type="button" role="radio" aria-checked="${isActive}" data-axis="color" data-value="${escapeHtml(color)}"><img src="${escapeHtml(thumbOf(rep.image))}" alt="${escapeHtml(color)}" loading="lazy"><span>${escapeHtml(color)}</span></button>`;
      }).join("")}</div>`;
  }
  if (group.sizes.length > 1) {
    const buttons = group.sizes.map((size) => {
      const isActive = size === current.size;
      return `<button class="size-option${isActive ? " is-active" : ""}" type="button" role="radio" aria-checked="${isActive}" data-axis="size" data-value="${escapeHtml(size)}">${escapeHtml(isoSize(size))}</button>`;
    }).join("");
    html += `<div class="variant-picker"><span class="variant-picker__label">المقاس</span><div class="size-options" role="radiogroup" aria-label="اختيار المقاس">${buttons}</div></div>`;
  }
  if (group.colors.length < 2 && group.sizes.length < 2) {
    html += `<p class="modal-variants__title">النسخ المتاحة</p><div class="modal-thumbs" role="radiogroup" aria-label="اختيار النسخة">${
      group.variants.map((variant) => {
        const isActive = variant.id === current.id;
        return `<button class="modal-thumb${isActive ? " is-active" : ""}" type="button" role="radio" aria-checked="${isActive}" data-variant-id="${escapeHtml(variant.id)}"><img src="${escapeHtml(thumbOf(variant.image))}" alt="${escapeHtml(variant.code)}" loading="lazy"><span>${escapeHtml(variant.code)}</span></button>`;
      }).join("")}</div>`;
  }
  host.innerHTML = html;
}

function renderModalGallery(group, current) {
  const host = document.getElementById("modal-gallery-thumbs");
  if (!host) return;
  const imageVariants = group.variants.filter((variant, index, variants) =>
    variant.image && variants.findIndex((candidate) => candidate.image === variant.image) === index,
  );
  host.innerHTML = imageVariants.length > 1
    ? imageVariants.map((variant) => {
      const isActive = variant.image === current.image;
      return `<button class="product-modal__gallery-thumb${isActive ? " is-active" : ""}" type="button" data-gallery-variant="${escapeHtml(variant.id)}" aria-label="عرض صورة ${escapeHtml(variant.code)}" aria-pressed="${isActive}"><img src="${escapeHtml(thumbOf(variant.image))}" alt="" loading="lazy"></button>`;
    }).join("")
    : "";
}

(function bindVariantEvents() {
  const host = document.getElementById("modal-variants");
  host?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-axis], [data-variant-id]");
    const group = modalGroups[modalIndex];
    if (!button || !group) return;
    if (button.dataset.axis === "color") selectAxis(group.key, "color", button.dataset.value);
    else if (button.dataset.axis === "size") selectAxis(group.key, "size", button.dataset.value);
    else if (button.dataset.variantId) setActiveVariant(group.key, button.dataset.variantId);
    const again = button.dataset.axis === "color"
      ? host.querySelector(`[data-axis="color"][data-value="${CSS.escape(button.dataset.value)}"]`)
      : button.dataset.axis === "size"
        ? host.querySelector(`[data-axis="size"][data-value="${CSS.escape(button.dataset.value)}"]`)
      : host.querySelector(`[data-variant-id="${CSS.escape(button.dataset.variantId)}"]`);
    again?.focus();
  });
  document.getElementById("modal-gallery-thumbs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-variant]");
    const group = modalGroups[modalIndex];
    if (button && group) {
      setActiveVariant(group.key, button.dataset.galleryVariant);
      document.getElementById("modal-gallery-thumbs")
        ?.querySelector(`[data-gallery-variant="${CSS.escape(button.dataset.galleryVariant)}"]`)
        ?.focus();
    }
  });

  /* أحداث الشبكة (delegation) — بتفضل شغالة حتى لو البطاقة اتبدّلت */
  grid.addEventListener("click", (event) => {
    const image = event.target.closest(".product-image");
    if (image) {
      const product = SHIELDS.find((item) => item.id === image.dataset.productId);
      if (product) openProductModal(product);
      return;
    }
    const toggle = event.target.closest(".select-toggle");
    if (toggle) {
      toggleSelect(toggle.dataset.productId);
      return;
    }
    const swatch = event.target.closest(".swatch");
    const size = event.target.closest(".size-option");
    if (swatch) {
      if (swatch.dataset.axis === "color") selectAxis(swatch.dataset.groupKey, "color", swatch.dataset.value);
      else if (swatch.dataset.variantId) setActiveVariant(swatch.dataset.groupKey, swatch.dataset.variantId);
    } else if (size) {
      selectAxis(size.dataset.groupKey, "size", size.dataset.value);
    }
  });
  grid.addEventListener("keydown", (event) => {
    const image = event.target.closest(".product-image");
    if (!image || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    const product = SHIELDS.find((item) => item.id === image.dataset.productId);
    if (product) openProductModal(product);
  });
  grid.addEventListener("mousemove", (event) => {
    const card = event.target.closest(".card");
    const thumb = card && card.querySelector(".thumb");
    if (!thumb) return;
    const r = card.getBoundingClientRect();
    thumb.style.setProperty("--mx", ((event.clientX - r.left) / r.width) * 100 + "%");
    thumb.style.setProperty("--my", ((event.clientY - r.top) / r.height) * 100 + "%");
  });
})();

function updateCatalogSummary() {
  const categories = new Set(SHIELDS.map((product) => product.cat)).size;
  const countEl = document.getElementById("hero-product-count");
  const catEl = document.getElementById("hero-category-count");
  if (countEl) countEl.textContent = toArabicNumber(GROUPS.length);
  if (catEl) catEl.textContent = toArabicNumber(categories);
}

function updateCatalogView() {
  if (active !== "all" && !SHIELDS.some((product) => product.cat === active)) {
    active = "all";
  }
  const liveIds = new Set(SHIELDS.map((product) => product.id));
  [...productQuantities.keys()].forEach((id) => {
    if (!liveIds.has(id)) productQuantities.delete(id);
  });
  [...selectedIds].forEach((id) => {
    if (!liveIds.has(id)) selectedIds.delete(id);
  });
  SHIELDS.forEach((product) => {
    if (!productQuantities.has(product.id)) productQuantities.set(product.id, 1);
  });

  indexGroups();
  renderGrid();
  renderFilters();
  applyFilter();
  updateCatalogSummary();
  updateBulkBar();
}

function renderFilters() {
  const availableCategories = CATS.filter((category) =>
    category.id === "all" || SHIELDS.some((product) => product.cat === category.id),
  );
  filtersEl.innerHTML = availableCategories.map(
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
    countEl.innerHTML = `عرض <b>${val}</b> من أصل <b>${GROUPS.length}</b> درعًا`;
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

/* رقم التواصل واسمه: بيتقرأوا من الإعدادات (لوحة الإدارة) ويتحدّثوا في كل مكان */
function formatPhone(number) {
  const sa = /^966(\d{2})(\d{3})(\d{4})$/.exec(number);
  if (sa) return `+966 ${sa[1]} ${sa[2]} ${sa[3]}`;
  const eg = /^20(1\d)(\d{4})(\d{4})$/.exec(number);
  if (eg) return `+20 ${eg[1]} ${eg[2]} ${eg[3]}`;
  return `+${number}`;
}

function refreshContactLinks() {
  const nameEl = document.getElementById("header-contact-name");
  const phoneEl = document.getElementById("header-contact-phone");
  const link = document.getElementById("header-contact");
  if (nameEl) nameEl.textContent = CONTACT_NAME;
  if (phoneEl) {
    phoneEl.textContent = formatPhone(WHATSAPP_NUMBER);
    phoneEl.setAttribute("dir", "ltr");
  }
  if (link) link.href = `tel:+${WHATSAPP_NUMBER}`;

  const footerLink = document.getElementById("footer-whatsapp");
  if (footerLink) {
    footerLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحبًا، أود الاستفسار عن دروع التكريم.")}`;
  }
  grid.querySelectorAll(".wa-button").forEach((anchor) => {
    const product = SHIELDS.find((item) => item.id === anchor.dataset.productId);
    if (product) anchor.href = whatsappUrl(product, productQuantities.get(product.id) ?? 1);
  });
  if (!productModal.hidden) renderModalProduct();
}
refreshContactLinks();

/* قائمة التصنيفات في الموبايل (drawer) */
(function initMobileFilterDrawer() {
  const toggle = document.getElementById("mobileFilterToggle");
  const drawer = document.getElementById("mobileFilterDrawer");
  if (!toggle || !drawer) return;
  const panel = drawer.querySelector(".mobile-filter-panel");
  const mobile = window.matchMedia("(max-width: 600px)");

  function setOpen(open, restoreFocus = true) {
    drawer.classList.toggle("is-open", open);
    document.body.classList.toggle("filters-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (mobile.matches) panel.setAttribute("aria-hidden", String(!open));
    if (open) panel.focus();
    else if (restoreFocus && mobile.matches) toggle.focus();
  }
  function sync() {
    if (mobile.matches) {
      panel.setAttribute("aria-hidden", String(!drawer.classList.contains("is-open")));
    } else {
      panel.removeAttribute("aria-hidden"); // على الديسكتوب التصنيفات ظاهرة دايمًا
      setOpen(false, false);
    }
  }
  toggle.addEventListener("click", () => setOpen(true));
  drawer.addEventListener("click", (event) => {
    if (event.target.closest("[data-filter-close]")) setOpen(false);
  });
  filtersEl.addEventListener("click", (event) => {
    if (mobile.matches && event.target.closest(".chip")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) setOpen(false);
  });
  mobile.addEventListener("change", sync);
  sync();
})();

/* لو صورة المصغّر فشلت نجرّب الأصلية، ولو فشلت برضه نشيلها (بدون inline handler عشان الـ CSP) */
grid.addEventListener("error", (e) => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.classList.contains("product-image")) return;
  const product = SHIELDS.find((item) => item.id === img.dataset.productId);
  if (product && !img.dataset.retried && img.getAttribute("src") !== product.image) {
    img.dataset.retried = "1";
    img.src = product.image;
  } else {
    img.remove();
  }
}, true);

renderGrid();
renderFilters();
applyFilter();
updateCatalogSummary();
initDeepLink();

/* تحديث الكتالوج من قاعدة البيانات */
loadRemoteCatalog().then(({ products }) => {
  SHIELDS = products;
  updateCatalogView();
}).catch((err) => console.warn("تعذر تحميل الكتالوج من الخادم:", err.message));

/* تحديث الاسم والرقم من لوحة الإدارة */
loadSettings().then((settings) => {
  if (applySettingsObject(settings)) refreshContactLinks();
}).catch(() => {});

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

/* Expose gallery data and modal behavior to gallery-features.js. */
window.openProductModal = openProductModal;
window.groupOfVariant = groupOfVariant;
window.setActiveVariant = setActiveVariant;
Object.defineProperty(window, "SHIELDS", {
  get: () => SHIELDS,
  configurable: true,
});