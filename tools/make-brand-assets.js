/* يولّد كل ملفات الهوية (أيقونات PWA، favicon، صورة المشاركة OG، لوحة الهوية)
   من ملفات SVG المصدرية في brand/ .
   التشغيل:  npm i sharp  ثم  node tools/make-brand-assets.js          */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const BRAND = path.join(ROOT, "brand");
const OUT = path.join(ROOT, "site", "images", "brand");
fs.mkdirSync(OUT, { recursive: true });

const read = (f) => fs.readFileSync(path.join(BRAND, f), "utf8");
const markSvg = read("logo-mark.svg");
const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const defs = inner(markSvg).match(/<defs>[\s\S]*?<\/defs>/)[0];
const markBody = inner(markSvg).replace(defs, "");
const FONT = "Tajawal, Cairo, 'DejaVu Sans', sans-serif";

const png = (svg, size, file, opts = {}) =>
  sharp(Buffer.from(svg), { density: 600 }).resize(size, opts.h || size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(path.join(OUT, file));

/* أيقونة تطبيق: خلفية كحلي + الشعار (safe = نسبة حجم الشعار داخل الأيقونة) */
const appIcon = (safe, rounded) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}
  <rect width="512" height="512" ${rounded ? 'rx="112"' : ""} fill="#0B1F3A"/>
  <g transform="translate(${256 - 48 * safe * 5.12 / 1}, ${256 - 54 * safe * 5.12 / 1}) scale(${safe * 5.12})">${markBody}</g></svg>`;

(async () => {
  fs.copyFileSync(path.join(BRAND, "logo-mark.svg"), path.join(OUT, "logo-mark.svg"));
  fs.copyFileSync(path.join(BRAND, "logo-lockup.svg"), path.join(OUT, "logo-lockup.svg"));
  fs.copyFileSync(path.join(BRAND, "logo-mark.svg"), path.join(OUT, "favicon.svg"));

  await png(appIcon(0.62, true), 192, "icon-192.png");
  await png(appIcon(0.62, true), 512, "icon-512.png");
  await png(appIcon(0.5, false), 512, "icon-maskable-512.png");   // منطقة آمنة للأيقونات الدائرية
  await png(appIcon(0.62, false), 180, "apple-touch-icon.png");
  await png(markSvg, 48, "favicon-48.png");
  await png(markSvg, 32, "favicon-32.png");

  /* ---------- صورة المشاركة OG 1200×630 ---------- */
  const W = 1200, H = 630;
  const thumbs = ["gold/gold-1", "crystal/crystal-1", "acrylic/acrylic-2"];
  const cards = [];
  const pos = [{ x: 70, y: 96, w: 230, h: 307, r: -5 }, { x: 250, y: 150, w: 250, h: 334, r: 0 }, { x: 460, y: 100, w: 250, h: 167, r: 4 }];
  const sizes = [[230, 307], [250, 334], [250, 167]];
  for (let i = 0; i < 3; i++) {
    const [w, h] = sizes[i];
    const img = await sharp(path.join(OUT, "..", "thumbs", thumbs[i] + ".webp")).resize(w, h, { fit: "cover" }).png().toBuffer();
    const frame = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w + 12}" height="${h + 12}"><rect x="1.5" y="1.5" width="${w + 9}" height="${h + 9}" rx="14" fill="#0F2038" stroke="#D4AF37" stroke-width="3"/></svg>`);
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="10"/></svg>`);
    const rounded = await sharp(img).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
    const card = await sharp(frame).composite([{ input: rounded, left: 6, top: 6 }]).png().toBuffer();
    const rotated = await sharp(card).rotate(pos[i].r, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    cards.push({ input: rotated, left: pos[i].x, top: pos[i].y });
  }
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${defs}
    <defs><radialGradient id="glow" cx="0.78" cy="0.35" r="0.7"><stop offset="0" stop-color="#1E4A8A" stop-opacity=".55"/><stop offset="1" stop-color="#0B1F3A" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="#081628"/><rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="22" fill="none" stroke="#D4AF37" stroke-opacity=".55" stroke-width="2"/>
    <g transform="translate(1000 64) scale(1.3)">${markBody}</g>
    <text x="1128" y="330" text-anchor="start" font-family="${FONT}" font-weight="800" font-size="120" fill="#FFFFFF" direction="rtl">ميم</text>
    <text x="1128" y="402" text-anchor="start" font-family="${FONT}" font-weight="700" font-size="46" fill="#D4AF37" direction="rtl">دروع التكريم</text>
    <text x="1128" y="460" text-anchor="start" font-family="${FONT}" font-weight="400" font-size="30" fill="#C9D3E3" direction="rtl">تفاصيل تليق بلحظة الإنجاز</text>
    <text x="1128" y="540" text-anchor="end" font-family="'Poppins','DejaVu Sans',sans-serif" font-weight="600" font-size="22" letter-spacing="7" fill="#8FA3C2">MEEM AWARDS</text>
  </svg>`;
  await sharp(Buffer.from(bg)).composite(cards).jpeg({ quality: 88 }).toFile(path.join(OUT, "og-image.jpg"));

  /* ---------- لوحة الهوية brand/brand-sheet.png ---------- */
  const sw = [["#0B1F3A", "Meem Navy", "#FFFFFF"], ["#14305A", "Royal Navy", "#FFFFFF"], ["#C9A227", "Meem Gold", "#0B1F3A"],
              ["#F5E3A0", "Light Gold", "#0B1F3A"], ["#A8841C", "Deep Gold", "#FFFFFF"], ["#F6F3EC", "Ivory", "#0B1F3A"]];
  const sws = sw.map((c, i) => `<g transform="translate(${60 + i * 185} 560)"><rect width="165" height="120" rx="14" fill="${c[0]}" stroke="#D9D2C0"/>
      <text x="14" y="84" font-family="'Poppins','DejaVu Sans'" font-weight="600" font-size="15" fill="${c[2]}">${c[1]}</text>
      <text x="14" y="106" font-family="'Poppins','DejaVu Sans'" font-size="13" fill="${c[2]}" opacity=".85">${c[0]}</text></g>`).join("");
  const lock = inner(read("logo-lockup.svg"));
  const sheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760">${defs}
    <rect width="1200" height="760" fill="#FBF9F4"/>
    <text x="60" y="64" font-family="'Poppins','DejaVu Sans'" font-weight="700" font-size="22" letter-spacing="5" fill="#0B1F3A">MEEM — BRAND SHEET v1</text>
    <rect x="60" y="90" width="520" height="400" rx="20" fill="#FFFFFF" stroke="#E6DFD0"/>
    <g transform="translate(70 150) scale(1.4)">${lock}</g>
    <rect x="610" y="90" width="260" height="400" rx="20" fill="#0B1F3A"/>
    <g transform="translate(675 200) scale(1.3)">${markBody}</g>
    <rect x="890" y="90" width="250" height="190" rx="20" fill="#FFFFFF" stroke="#E6DFD0"/>
    <g transform="translate(965 112) scale(1.1)">${inner(read("logo-mono-navy.svg"))}</g>
    <rect x="890" y="300" width="250" height="190" rx="20" fill="#C9A227"/>
    <g transform="translate(965 322) scale(1.1)">${inner(read("logo-mono-white.svg"))}</g>
    ${sws}
  </svg>`;
  await sharp(Buffer.from(sheetSvg), { density: 144 }).png().toFile(path.join(BRAND, "brand-sheet.png"));
  console.log("brand assets ✓");
})();
