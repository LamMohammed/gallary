/* ============================================================
   بيانات الدروع — عشان تضيف درع جديد:
   1) ضيف صورة المنتج جوه فولدر images/
   2) انسخ سطر من اللي تحت وغيّر: id (فريد)، cat (خامة)،
      name (اسم الدرع)، era (وصف قصير)، size (المقاس)،
      image (مسار الصورة جوه images/)
   الخامات المتاحة (cat): wood, leather, crystal, acrylic, metal
   ============================================================ */
const ACCOUNT_NAME = "اسم الحساب";

const SHIELDS = [
  {
    id: "g1",
    cat: "gold",
    name: " `ذهبي `",
    era: "  ذهبي ملكي  بتصميم  عصري ·  ",
    size: "176×230",
    image: "images/gold-1.jpg",
  },
  {
    id: "g2",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-2.jpg",
  },

  {
    id: "g3",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-3.jpg",
  },

  {
    id: "g4",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-4.jpg",
  },
  {
    id: "g5",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-5.jpg",
  },
  {
    id: "g6",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-6.jpg",
  },
  {
    id: "g7",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-7.jpg",
  },
  {
    id: "g8",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-8.jpg",
  },
  {
    id: "g9",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-9.jpg",
  },
  {
    id: "g10",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-10.jpg",
  },
  {
    id: "g11",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-11.jpg",
  },
  {
    id: "g12",
    cat: "gold",
    name: "ذهبي ",
    era: "  ذهبي ملكي  بتصميم  عصري ·  L",
    size: "220×280",
    image: "images/gold-12.jpg",
  },
  {
    id: "g13",
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
    cat: "crystal",
    name: "المسلة الكريستالية",
    era: "كريستال شفاف · قاعدة خشبية",
    size: "ارتفاع 25سم",
    image: "images/crystal-1.jpg",
  },
  {
    id: "c2",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-2.jpg",
  },
  {
    id: "c3",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-3.jpg",
  },
  {
    id: "c4",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-4.jpg",
  },
  {
    id: "c5",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-5.jpg",
  },
  {
    id: "c6",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-6.jpg",
  },

  {
    id: "c7",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-7.jpg",
  },
  {
    id: "c8",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-8.jpg",
  },
  {
    id: "c9",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-9.jpg",
  },
  {
    id: "c10",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-10.jpg",
  },
  {
    id: "c11",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-11.jpg",
  },
  {
    id: "c12",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-12.jpg",
  },
  {
    id: "c13",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-13.jpg",
  },
  {
    id: "c14",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-14.jpg",
  },
  {
    id: "c15",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-15.jpg",
  },
  {
    id: "c16",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-16.jpg",
  },
{
    id: "c17",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-17.jpg",
  },
{
    id: "c18",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-18.jpg",
  },
{
    id: "c19",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-19.jpg",
  },
{
    id: "c20",
    cat: "crystal",
    name: "الشفرة الزجاجية",
    era: "زجاج مقصوص · خشب زان",
    size: "ارتفاع 18سم",
    image: "images/crystal-20.jpg",
  },


  {
    id: "a1",
    cat: "acrylic",
    name: "لوحة الشكر",
    era: "أكريليك فاتح · حفر ليزر",
    size: "أفقي 30×22سم",
    image: "images/acrylic-1.jpg",
  },
  {
    id: "a2",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-2.jpg",
  },
  {
    id: "a3",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-3.jpg",
  },
  {
    id: "a4",
    cat: "acrylic",
    name: "لوحة التقدير",
    era: "أكريليك فاتح · نجمة محفورة",
    size: "أفقي 30×22سم",
    image: "images/acrylic-4.jpg",
  },
  {
    id: "a5",
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
let active = "all";
let currentCount = 0;

const cameraIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/>
  <circle cx="12" cy="13" r="3.5"/>
</svg>`;

function catLabel(id) {
  return CATS.find((c) => c.id === id).label;
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
        <img src="${s.image}" alt="${s.name}" loading="lazy"
             onerror="this.remove()">
        <div class="shine"></div>
      </div>
      <p class="era">${s.era}</p>
      <h3>${s.name}</h3>
      <p class="cat">${catLabel(s.cat)} · ${s.size}</p>
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
    card.classList.toggle("hidden", !match);
    if (match) visible++;
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
