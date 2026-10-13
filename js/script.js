let SHIELDS = initialCatalog();

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
let modalList = [];
let modalIndex = -1;
const scrollTopButton = document.getElementById("scroll-top");
const adminPanel = document.getElementById("admin-panel");
const adminDialog = adminPanel.querySelector(".admin-panel__dialog");
const adminOpenButton = document.getElementById("admin-open");
const adminProductForm = document.getElementById("admin-product-form");
const adminProductList = document.getElementById("admin-product-list");
const adminStatus = document.getElementById("admin-status");
const adminSearch = document.getElementById("admin-search");
const adminCategoryFilter = document.getElementById("admin-category-filter");
const adminImageInput = document.getElementById("admin-product-image");
const adminImagePreview = document.getElementById("admin-image-preview");
let adminEditingId = null;
let adminImagePreviewUrl = null;
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

function setAdminStatus(message, type = "success") {
  adminStatus.textContent = message;
  adminStatus.className = `admin-status admin-status--${type}`;
  adminStatus.hidden = false;
}

function saveCatalog(products) {
  try {
    localStorage.setItem(SHIELDS_STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    setAdminStatus(
      `تعذر حفظ التغييرات في هذا المتصفح: ${error.message}. جرّب صورة أصغر أو صدّر نسخة احتياطية.`,
      "error",
    );
    return false;
  }
}

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
🎨 اللون: ${product.color}
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

  const lines = items.map(
    (p, i) =>
      `${toArabicNumber(i + 1)}-\n🏆 اسم المنتج: ${p.name}\n📌 كود المنتج: ${p.code}\n✨ الخامة: ${catLabel(p.cat)}\n🎨 اللون: ${p.color}\n🔢 الكمية: ${toArabicNumber(productQuantities.get(p.id) ?? 1)}`,
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
  modalColor.textContent = `اللون: ${product.color}`;
  modalSize.textContent = `المقاس: ${product.size}`;
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

function renderGrid() {
  grid.innerHTML = SHIELDS.map(
    (s, i) => {
      const name = escapeHtml(s.name);
      const code = escapeHtml(s.code);
      const image = escapeHtml(s.image);
      const isSelected = selectedIds.has(s.id);
      const imageLabel = /^(data:|https:)/.test(s.image)
        ? "جاري تحميل الصورة"
        : `ضيف صورة "${escapeHtml(s.image.split("/").pop())}" في فولدر images`;
      return `
    <div class="card${isSelected ? " is-selected" : ""}" data-cat="${escapeHtml(s.cat)}" data-product-id="${escapeHtml(s.id)}" style="--d:${(i % 8) * 0.06}s">
      <div class="thumb">
        <div class="placeholder">
          ${cameraIcon}
          <span>${imageLabel}</span>
        </div>
        <img class="product-image" src="${image}" alt="${name}" loading="lazy" decoding="async"
             data-product-id="${escapeHtml(s.id)}" tabindex="0" role="button"
             onerror="this.remove()">
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
        <span class="card-specs__color">${escapeHtml(s.color)}</span>
        <span class="card-specs__size">${escapeHtml(s.size)}</span>
      </div>
      ${quantityControlMarkup(s)}
      <div class="card-meta">
        <a
          class="wa-button"
          href="${whatsappUrl(s)}"
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
    },
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

function updateCatalogSummary() {
  const count = SHIELDS.length;
  const categories = new Set(SHIELDS.map((product) => product.cat)).size;
  document.getElementById("hero-product-count").textContent = toArabicNumber(count);
  document.getElementById("hero-category-count").textContent = toArabicNumber(categories);
  document.getElementById("admin-total").textContent = toArabicNumber(count);
  document.getElementById("admin-categories").textContent = toArabicNumber(categories);
}

function renderAdminProducts() {
  const query = adminSearch.value.trim().toLocaleLowerCase();
  const category = adminCategoryFilter.value;
  const products = SHIELDS.filter((product) => {
    const matchesQuery = !query ||
      `${product.name} ${product.code}`.toLocaleLowerCase().includes(query);
    return matchesQuery && (category === "all" || product.cat === category);
  });

  if (products.length === 0) {
    adminProductList.innerHTML = '<p class="admin-empty">لا توجد منتجات مطابقة للبحث.</p>';
    return;
  }

  adminProductList.innerHTML = products.map((product) => `
    <article class="admin-product" data-product-id="${escapeHtml(product.id)}">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
      <div class="admin-product__info">
        <h3>${escapeHtml(product.name)}</h3>
        <p><b>${escapeHtml(product.code)}</b> · ${escapeHtml(catLabel(product.cat))}</p>
        <p>${escapeHtml(product.color)} · ${escapeHtml(product.size)}</p>
        <small>${escapeHtml(product.era)}</small>
      </div>
      <div class="admin-product__actions">
        <button class="admin-button admin-button--quiet" type="button" data-admin-action="edit" data-product-id="${escapeHtml(product.id)}">تعديل</button>
        <button class="admin-button admin-button--danger-quiet" type="button" data-admin-action="delete" data-product-id="${escapeHtml(product.id)}">حذف</button>
      </div>
    </article>
  `).join("");
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

  renderGrid();
  renderFilters();
  applyFilter();
  updateCatalogSummary();
  renderAdminProducts();
  updateBulkBar();
}

function openAdminPanel() {
  adminPanel.hidden = false;
  document.body.classList.add("admin-open");
  renderAdminProducts();
  adminDialog.focus();
  if (catalogLoadError) setAdminStatus(catalogLoadError, "error");
}

function closeAdminPanel() {
  adminPanel.hidden = true;
  document.body.classList.remove("admin-open");
  adminOpenButton.focus();
}

function showAdminForm(product = null) {
  if (adminImagePreviewUrl) {
    URL.revokeObjectURL(adminImagePreviewUrl);
    adminImagePreviewUrl = null;
  }
  adminEditingId = product?.id ?? null;
  adminProductForm.reset();
  adminImageInput.value = "";
  adminProductForm.elements.namedItem("id").value = adminEditingId ?? "";
  adminProductForm.elements.namedItem("name").value = product?.name ?? "";
  adminProductForm.elements.namedItem("code").value = product?.code ?? "";
  adminProductForm.elements.namedItem("cat").value = product?.cat ?? "gold";
  adminProductForm.elements.namedItem("color").value =
    product?.color ?? PRODUCT_COLOR_DEFAULTS.gold;
  adminProductForm.elements.namedItem("era").value = product?.era ?? "";
  adminProductForm.elements.namedItem("size").value = product?.size ?? "";
  document.getElementById("admin-form-title").textContent =
    product ? "تعديل بيانات المنتج" : "إضافة منتج جديد";

  adminImagePreview.hidden = !product;
  adminImagePreview.src = product?.image ?? "";
  adminProductForm.hidden = false;
  adminProductForm.scrollIntoView({ behavior: "smooth", block: "start" });
  adminProductForm.elements.namedItem("name").focus({ preventScroll: true });
}

function hideAdminForm() {
  if (adminImagePreviewUrl) {
    URL.revokeObjectURL(adminImagePreviewUrl);
    adminImagePreviewUrl = null;
  }
  adminProductForm.hidden = true;
  adminProductForm.reset();
  adminImageInput.value = "";
  adminImagePreview.hidden = true;
  adminImagePreview.removeAttribute("src");
  adminEditingId = null;
}

function createProductId() {
  if (typeof crypto.randomUUID === "function") return `product-${crypto.randomUUID()}`;
  return `product-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      reject(new Error("اختر صورة بصيغة PNG أو JPG أو WebP."));
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error("حجم الصورة كبير. الحد الأقصى قبل الضغط هو ١٢ ميجابايت."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1400 / image.naturalWidth, 1400 / image.naturalHeight);
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("تعذر تجهيز الصورة في هذا المتصفح."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("تعذر ضغط الصورة."));
          return;
        }
        if (blob.size > 900 * 1024) {
          reject(new Error("الصورة ما زالت كبيرة بعد الضغط. اختر صورة أصغر."));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("تعذرت قراءة الصورة بعد ضغطها."));
        reader.readAsDataURL(blob);
      }, "image/webp", 0.8);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("تعذر فتح الصورة المختارة."));
    };
    image.src = objectUrl;
  });
}

function initAdminPanel() {
  const productCategory = adminProductForm.elements.namedItem("cat");
  productCategory.innerHTML = CATS.filter((category) => category.id !== "all")
    .map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.label)}</option>`)
    .join("");
  adminCategoryFilter.innerHTML = [
    '<option value="all">كل التصنيفات</option>',
    ...CATS.filter((category) => category.id !== "all")
      .map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.label)}</option>`),
  ].join("");

  adminOpenButton.addEventListener("click", openAdminPanel);
  adminPanel.querySelectorAll("[data-admin-close]").forEach((element) => {
    element.addEventListener("click", closeAdminPanel);
  });
  document.getElementById("admin-add").addEventListener("click", () => showAdminForm());
  document.getElementById("admin-cancel-edit").addEventListener("click", hideAdminForm);
  adminSearch.addEventListener("input", renderAdminProducts);
  adminCategoryFilter.addEventListener("change", renderAdminProducts);

  adminImageInput.addEventListener("change", () => {
    const [file] = adminImageInput.files;
    if (!file) return;
    if (adminImagePreviewUrl) URL.revokeObjectURL(adminImagePreviewUrl);
    adminImagePreviewUrl = URL.createObjectURL(file);
    adminImagePreview.src = adminImagePreviewUrl;
    adminImagePreview.hidden = false;
  });

  adminProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = adminProductForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    try {
      const formData = new FormData(adminProductForm);
      const id = String(formData.get("id") || createProductId());
      const editingProduct = SHIELDS.find((product) => product.id === id);
      const code = String(formData.get("code")).trim().toUpperCase();
      if (SHIELDS.some((product) => product.id !== id &&
          product.code.toLocaleLowerCase() === code.toLocaleLowerCase())) {
        throw new Error("كود المنتج مستخدم بالفعل. اختر كودًا مختلفًا.");
      }

      const [imageFile] = adminImageInput.files;
      let image = editingProduct?.image ?? "";
      if (imageFile) image = await compressImageFile(imageFile);
      if (!image) throw new Error("اختر صورة للمنتج.");

      const product = {
        id,
        code,
        name: String(formData.get("name")).trim(),
        cat: String(formData.get("cat")),
        color: String(formData.get("color")).trim(),
        era: String(formData.get("era")).trim(),
        size: String(formData.get("size")).trim(),
        image,
      };
      const nextCatalog = validateCatalog(editingProduct
        ? SHIELDS.map((item) => item.id === id ? product : item)
        : [...SHIELDS, product]);

      if (!saveCatalog(nextCatalog)) return;
      SHIELDS = nextCatalog;
      hideAdminForm();
      updateCatalogView();
      setAdminStatus(editingProduct ? "تم حفظ تعديلات المنتج." : "تمت إضافة المنتج.");
    } catch (error) {
      setAdminStatus(error.message, "error");
    } finally {
      submitButton.disabled = false;
    }
  });

  adminProductList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-action]");
    if (!button) return;
    const product = SHIELDS.find((item) => item.id === button.dataset.productId);
    if (!product) return;

    if (button.dataset.adminAction === "edit") {
      showAdminForm(product);
      return;
    }
    if (button.dataset.adminAction === "delete" &&
        window.confirm(`هل تريد حذف "${product.name}"؟`)) {
      const nextCatalog = SHIELDS.filter((item) => item.id !== product.id);
      if (!saveCatalog(nextCatalog)) return;
      SHIELDS = nextCatalog;
      updateCatalogView();
      setAdminStatus("تم حذف المنتج.");
    }
  });

  document.getElementById("admin-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(SHIELDS, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "meem-products-backup.json";
    link.click();
    URL.revokeObjectURL(downloadUrl);
    setAdminStatus("تم تنزيل نسخة احتياطية من المنتجات.");
  });

  const importInput = document.getElementById("admin-import-file");
  document.getElementById("admin-import").addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", async () => {
    const [file] = importInput.files;
    if (!file) return;
    try {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error("ملف النسخة الاحتياطية أكبر من الحد المسموح (٢٠ ميجابايت).");
      }
      const importedCatalog = validateCatalog(JSON.parse(await file.text()));
      if (!saveCatalog(importedCatalog)) return;
      SHIELDS = importedCatalog;
      hideAdminForm();
      updateCatalogView();
      setAdminStatus("تم استيراد النسخة الاحتياطية.");
    } catch (error) {
      setAdminStatus(`تعذر استيراد النسخة: ${error.message}`, "error");
    } finally {
      importInput.value = "";
    }
  });

  document.getElementById("admin-reset").addEventListener("click", () => {
    if (!window.confirm("سيتم حذف تعديلاتك المحلية والعودة إلى المنتجات الأصلية. هل تريد المتابعة؟")) {
      return;
    }
    try {
      localStorage.removeItem(SHIELDS_STORAGE_KEY);
      SHIELDS = [...DEFAULT_SHIELDS];
      hideAdminForm();
      updateCatalogView();
      setAdminStatus("تمت استعادة المنتجات الأصلية.");
    } catch (error) {
      setAdminStatus(`تعذرت استعادة المنتجات الأصلية: ${error.message}`, "error");
    }
  });

  renderAdminProducts();
  updateCatalogSummary();
  if (catalogLoadError) setAdminStatus(catalogLoadError, "error");
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
  if (!adminPanel.hidden) {
    if (event.key === "Escape") closeAdminPanel();
    return;
  }
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

const footerWhatsappLink = document.getElementById("footer-whatsapp");
if (footerWhatsappLink) {
  const message = "مرحبًا، أود الاستفسار عن دروع التكريم.";
  footerWhatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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

initAdminPanel();
renderGrid();
renderFilters();
applyFilter();
initDeepLink();

/* تحديث الكتالوج من قاعدة البيانات */
loadRemoteCatalog().then(({ products }) => {
  SHIELDS = products;
  updateCatalogView();
}).catch((err) => console.warn("تعذر تحميل الكتالوج من الخادم:", err.message));

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