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
    image: "images/gold-1.jpg",
  },
  {
    id: "g2",
    code: "GO-002",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-2.jpg",
  },

  {
    id: "g3",
    code: "GO-003",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-3.jpg",
  },

  {
    id: "g4",
    code: "GO-004",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-4.jpg",
  },
  {
    id: "g5",
    code: "GO-005",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-5.jpg",
  },
  {
    id: "g6",
    code: "GO-006",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-6.jpg",
  },
  {
    id: "g7",
    code: "GO-007",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-7.jpg",
  },
  {
    id: "g8",
    code: "GO-008",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-8.jpg",
  },
  {
    id: "g9",
    code: "GO-009",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-9.jpg",
  },
  {
    id: "g10",
    code: "GO-010",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-10.jpg",
  },
  {
    id: "g11",
    code: "GO-011",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-11.jpg",
  },
  {
    id: "g12",
    code: "GO-012",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-12.jpg",
  },
  {
    id: "g13",
    code: "GO-013",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-13.jpg",
  },

  // {id:'l1', cat:'leather', name:'الإطار الأسود الأنيق', era:'جلد طبيعي · دبل فريم', size:'قياس مزدوج', image:'images/leather-1.jpg'},
  // {id:'l2', cat:'leather', name:'الإطار الكريمي الفاخر', era:'جلد فاخر · دبل فريم', size:'قياس مزدوج', image:'images/leather-2.jpg'},

  {
    id: "c1",
    code: "CR-001",
    cat: "crystal",
    name: "المسلة الكريستالية",
    era: "كريستال شفاف · قاعدة خشبية",
    size: "ارتفاع 25سم",
    image: "images/crystal-1.jpg",
  },
  {
    id: "c2",
    code: "CR-002",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-2.jpg",
  },
  {
    id: "c3",
    code: "CR-003",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-3.jpg",
  },
  {
    id: "c4",
    code: "CR-004",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-4.jpg",
  },
  {
    id: "c5",
    code: "CR-005",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-5.jpg",
  },
  {
    id: "c6",
    code: "CR-006",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-6.jpg",
  },

  {
    id: "c7",
    code: "CR-007",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-7.jpg",
  },
  {
    id: "c8",
    code: "CR-008",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-8.jpg",
  },
  {
    id: "c9",
    code: "CR-009",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-9.jpg",
  },
  {
    id: "c10",
    code: "CR-010",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-10.jpg",
  },
  {
    id: "c11",
    code: "CR-011",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-11.jpg",
  },
  {
    id: "c12",
    code: "CR-012",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-12.jpg",
  },
  {
    id: "c13",
    code: "CR-013",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-13.jpg",
  },
  {
    id: "c14",
    code: "CR-014",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-14.jpg",
  },
  {
    id: "c15",
    code: "CR-015",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-15.jpg",
  },
  {
    id: "c16",
    code: "CR-016",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-16.jpg",
  },
{
    id: "c17",
    code: "CR-017",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-17.jpg",
  },
{
    id: "c18",
    code: "CR-018",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-18.jpg",
  },
{
    id: "c19",
    code: "CR-019",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-19.jpg",
  },
{
    id: "c20",
    code: "CR-020",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-20.jpg",
  },


  {
    id: "a1",
    code: "AC-001",
    cat: "acrylic",
    name: "لوحة الشكر",
    era: "أكريليك فاتح · حفر ليزر",
    size: "أفقي 30×22سم",
    image: "images/acrylic-1.jpg",
  },
  {
    id: "a2",
    code: "AC-002",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-2.jpg",
  },
  {
    id: "a3",
    code: "AC-003",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-3.jpg",
  },
  {
    id: "a4",
    code: "AC-004",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-4.jpg",
  },
  {
    id: "a5",
    code: "AC-005",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-5.jpg",
  },

  // {id:'m1', cat:'metal', name:'العرش الفضي', era:'معدن مصقول · أعمدة ملكية', size:'ارتفاع 28سم', image:'images/metal-1.jpg'},
  // {id:'m2', cat:'metal', name:'الصولجان الملكي', era:'معدن مصقول · نقش متعرج', size:'ارتفاع 30سم', image:'images/metal-2.jpg'},
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
const productModal = document.getElementById("product-modal");
const modalImage = document.getElementById("modal-product-image");
const modalMaterial = document.getElementById("modal-product-material");
const modalName = document.getElementById("modal-product-name");
const modalCode = document.getElementById("modal-product-code");
const modalWhatsapp = document.getElementById("modal-product-whatsapp");
let active = "all";
let currentCount = 0;

const cameraIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/>
  <circle cx="12" cy="13" r="3.5"/>
</svg>`;

function catLabel(id) {
  return CATS.find((c) => c.id === id).label;
}

function whatsappUrl(product) {
  const message = `👋 مرحبًا، أريد الاستفسار عن هذا المنتج:

🏆 اسم المنتج: ${product.name}
📌 كود المنتج: ${product.code}
✨ الخامة: ${catLabel(product.cat)}

أريد معرفة السعر والتفاصيل المتاحة.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function openProductModal(product) {
  modalImage.src = product.image;
  modalImage.alt = product.name;
  modalMaterial.textContent = `الخامة: ${catLabel(product.cat)}`;
  modalName.textContent = product.name;
  modalCode.textContent = `كود المنتج: ${product.code}`;
  modalWhatsapp.href = whatsappUrl(product);
  productModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeProductModal() {
  productModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function renderGrid() {
  grid.innerHTML = SHIELDS.map(
    (s, i) => `
    <div class="card" data-cat="${s.cat}" style="--d:${(i % 8) * 0.06}s">
      <div class="thumb">
        <div class="placeholder">
          ${cameraIcon}
          <span>ضيف صورة "${s.image.split("/").pop()}" في فولدر images</span>
        </div>
        <img class="product-image" src="${s.image}" alt="${s.name}" loading="lazy"
             data-product-id="${s.id}" tabindex="0" role="button"
             onerror="this.remove()">
        <span class="product-code-badge">${s.code}</span>
        <div class="shine"></div>
      </div>
      <p class="era">${s.era}</p>
      <h3>${s.name}</h3>
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

/* sticky bar shadow once scrolled */
window.addEventListener(
  "scroll",
  () => {
    filterBar.classList.toggle("stuck", window.scrollY > 40);
  },
  { passive: true },
);

productModal.querySelectorAll("[data-modal-close]").forEach((element) => {
  element.addEventListener("click", closeProductModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !productModal.hidden) closeProductModal();
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

renderGrid();
renderFilters();
applyFilter();
