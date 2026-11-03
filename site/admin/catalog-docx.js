/* ============================================================
   catalog-docx.js — تصدير الكتالوج كملف Word (من لوحة الإدارة)
   بيتحمّل لوحده لما الأدمن يضغط الزرار، ومكتبة docx متحمّلة من vendor/ (CSP: 'self').
   كل منتج: الصورة · الاسم · الكود · المقاس · الألوان. وفي الآخر لينك الموقع وجملة الطلب.
   ============================================================ */
(() => {
  const NAVY = "0B1F3A", GOLD = "A8841C", GOLD_LT = "E2C25A", IVORY = "F6F3EC", STONE = "475569", FONT = "Arial";
  const GENERIC = { gold: "ذهبي", crystal: "شفاف", acrylic: "شفاف" };
  const ORDER_LINE = "لطلب طلبية: حدّد من الموقع الكمية والشكل والمقاس والألوان المطلوبة، وابعتهم في رسالة واحدة على واتساب.";

  /* أرقام المقاس (220×280) تفضل بترتيبها جوه النص العربي */
  const DIM = /\d+(?:[.,٫]\d+)?(?:\s*[×xX*]\s*\d+(?:[.,٫]\d+)?)+/g;
  const iso = (s) => String(s || "").replace(DIM, (m) => "\u2066" + m + "\u2069");

  let loading = null;
  const loadLib = () => loading || (loading = new Promise((res, rej) => {
    if (window.docx) return res(window.docx);
    const s = document.createElement("script");
    s.src = "vendor/docx.iife.js";
    s.onload = () => (window.docx ? res(window.docx) : rej(new Error("مكتبة Word ما اتحمّلتش.")));
    s.onerror = () => rej(new Error("مكتبة Word ما اتحمّلتش — اتأكد من الاتصال وجرّب تاني."));
    document.head.appendChild(s);
  }));

  /* الصورة → JPEG مصغّر (Word ما بيقرأش WebP كويس) */
  async function jpegOf(src, maxSide = 560) {
    try {
      const blob = await (await fetch(src)).blob();
      const bmp = await createImageBitmap(blob);
      const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
      const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bmp, 0, 0, w, h);
      const out = await new Promise((r) => cv.toBlob(r, "image/jpeg", 0.85));
      return { data: await out.arrayBuffer(), w, h };
    } catch (e) { return null; }
  }

  /* غلاف الكتالوج: صورة خلفية بحجم الصفحة (النص فوقها يفضل نص عادي قابل للتعديل) */
  async function coverJpeg(logoUrl) {
    const W = 1588, H = 2246, cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    const g = c.createRadialGradient(W / 2, H * 0.3, 80, W / 2, H * 0.4, H * 0.75);
    g.addColorStop(0, "#1B3F73"); g.addColorStop(1, "#08172E");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = "#C9A227";
    c.lineWidth = 5; c.strokeRect(70, 70, W - 140, H - 140);
    c.lineWidth = 2; c.strokeRect(100, 100, W - 200, H - 200);
    c.fillStyle = "#C9A227";
    [[70, 70], [W - 70, 70], [70, H - 70], [W - 70, H - 70]].forEach(([x, y]) => {
      c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillRect(-16, -16, 32, 32); c.restore();
    });
    c.fillRect(W / 2 - 150, H - 260, 300, 3);
    if (logoUrl) {
      try {
        const im = new Image(); im.src = logoUrl; await im.decode();
        const s = 330, r = im.naturalWidth / (im.naturalHeight || 1) || 1;
        c.drawImage(im, W / 2 - (s * r) / 2, 330, s * r, s);
      } catch (e) { /* من غير شعار */ }
    }
    const out = await new Promise((r) => cv.toBlob(r, "image/jpeg", 0.9));
    return out.arrayBuffer();
  }

  /* المنتجات → عائلات (نفس منطق الموقع: نفس group_id = شكل واحد) */
  function families(products, cats) {
    const label = (id) => (cats.find((c) => c.id === id) || { label: id }).label;
    const map = new Map();
    products.forEach((p) => {
      const k = p.group_id || p.id;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p);
    });
    return [...map.values()].map((list) => {
      const base = list[0];
      const sizes = [...new Set(list.map((p) => (p.size || "").trim()).filter(Boolean))];
      const colors = [];
      list.forEach((p) => {
        const c = (p.color || "").trim();
        if (!c) return;
        const real = p.variant_by === "color" || p.variant_by === "both" || (c !== (GENERIC[p.cat] || "") && c !== label(p.cat));
        if (real && !colors.some((x) => x.name === c)) colors.push({ name: c, hex: /^#[0-9A-Fa-f]{6}$/.test(p.color_hex || "") ? p.color_hex.slice(1).toUpperCase() : null });
      });
      const prices = list.map((p) => ({ size: (p.size || "").trim(), price: (p.price || "").trim() })).filter((x) => x.price);
      return { base, list, prices, name: base.name, codes: list.map((p) => p.code), material: label(base.cat), sizes, colors };
    });
  }

  async function build({ products, cats, imgUrl, siteUrl, logoUrl, onProgress }) {
    const D = await loadLib();
    const fams = families(products, cats);
    const run = (text, o = {}) => new D.TextRun({ text, font: FONT, rightToLeft: true, ...o });
    const para = (children, o = {}) => new D.Paragraph({ bidirectional: true, alignment: D.AlignmentType.START, ...o, children });

    const cells = [];
    for (let i = 0; i < fams.length; i++) {
      const f = fams[i];
      onProgress && onProgress(i + 1, fams.length);
      const img = await jpegOf(imgUrl(f.base));
      const kids = [];
      if (img) {
        const k = Math.min(250 / img.w, 250 / img.h);
        kids.push(new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 120 },
          children: [new D.ImageRun({ type: "jpg", data: img.data, transformation: { width: Math.round(img.w * k), height: Math.round(img.h * k) } })] }));
      } else kids.push(para([run("(بدون صورة)", { color: STONE })], { spacing: { after: 120 } }));
      kids.push(para([run(f.name, { bold: true, size: 30, color: NAVY })], { spacing: { after: 60 } }));
      const line = (k, v) => para([run(k + ": ", { color: STONE, size: 22 }), run(v, { size: 22 })], { spacing: { after: 30 } });
      kids.push(line("الكود", f.codes.join(" ، ")));
      kids.push(line("الخامة", f.material));
      if (f.sizes.length) kids.push(line("المقاس", f.sizes.map(iso).join(" ، ")));
      if (f.colors.length) {
        const parts = [run("الألوان: ", { color: STONE, size: 22 })];
        f.colors.forEach((c, j) => {
          if (j) parts.push(run("  ", { size: 22 }));
          if (c.hex) parts.push(run("■ ", { color: c.hex, size: 22 }));
          parts.push(run(c.name, { size: 22 }));
        });
        kids.push(para(parts, { spacing: { after: 30 } }));
      }
      if (f.prices.length) {
        const same = f.prices.every((x) => x.price === f.prices[0].price) && f.prices.length === f.list.length;
        if (same || f.prices.length === 1) kids.push(para([run("السعر: ", { color: STONE, size: 24 }), run(f.prices[0].price, { bold: true, size: 26, color: GOLD })], { spacing: { before: 60, after: 30 } }));
        else f.prices.forEach((x) => kids.push(para([run("\u200F" + (iso(x.size) || "السعر"), { color: STONE, size: 22 }), run(" :", { color: STONE, size: 22 }), run("  " + x.price, { bold: true, size: 24, color: GOLD })], { spacing: { after: 20 } })));
      }
      cells.push(kids);
    }

    const W = 5053, line = { style: D.BorderStyle.SINGLE, size: 4, color: "E6DFD0" };
    const borders = { top: line, bottom: line, left: line, right: line };
    const rows = [];
    for (let i = 0; i < cells.length; i += 2) {
      const mk = (kids) => new D.TableCell({ width: { size: W, type: D.WidthType.DXA }, borders, margins: { top: 140, bottom: 140, left: 160, right: 160 }, children: kids || [new D.Paragraph("")] });
      rows.push(new D.TableRow({ cantSplit: true, children: [mk(cells[i]), mk(cells[i + 1])] }));
    }

    const date = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    const center = (children, o = {}) => new D.Paragraph({ alignment: D.AlignmentType.CENTER, bidirectional: true, ...o, children });
    const coverData = await coverJpeg(logoUrl);
    const cover = [
      center([
        new D.ImageRun({ type: "jpg", data: coverData, transformation: { width: 795, height: 1124 },
          floating: { horizontalPosition: { relative: D.HorizontalPositionRelativeFrom.PAGE, offset: 0 }, verticalPosition: { relative: D.VerticalPositionRelativeFrom.PAGE, offset: 0 }, behindDocument: true, allowOverlap: true, wrap: { type: D.TextWrappingType.NONE } } }),
        run("كتالوج", { size: 40, color: GOLD_LT }),
      ], { spacing: { before: 5600, after: 120 } }),
      center([run("دروع التكريم", { bold: true, size: 120, color: IVORY })], { spacing: { after: 240 } }),
      center([run(" ", { size: 8 })], { indent: { left: 3300, right: 3300 }, border: { bottom: { style: D.BorderStyle.SINGLE, size: 12, color: "C9A227", space: 1 } }, spacing: { after: 360 } }),
      center([run("شركة ميم", { bold: true, size: 56, color: IVORY })], { spacing: { after: 200 } }),
      center([run(cats.map((c) => c.label).join("  ·  "), { size: 28, color: "C9D3E3" })], { spacing: { after: 1700 } }),
      center([run(date, { size: 26, color: GOLD_LT })]),
    ];
    const children = [
      para([run("منتجاتنا", { bold: true, size: 44, color: NAVY })], { spacing: { after: 200 }, border: { bottom: { style: D.BorderStyle.SINGLE, size: 12, color: "C9A227", space: 6 } } }),
      new D.Table({ width: { size: W * 2, type: D.WidthType.DXA }, columnWidths: [W, W], layout: D.TableLayoutType.FIXED, visuallyRightToLeft: true, rows }),
      new D.Paragraph({ spacing: { before: 360, after: 120 }, border: { top: { style: D.BorderStyle.SINGLE, size: 12, color: "C9A227", space: 10 } }, bidirectional: true, alignment: D.AlignmentType.CENTER, children: [run(ORDER_LINE, { bold: true, size: 26, color: NAVY })] }),
      new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
        new D.ExternalHyperlink({ link: siteUrl, children: [new D.TextRun({ text: siteUrl, font: FONT, size: 26, color: "0563C1", underline: {} })] }),
      ] }),
    ];
    const pageSz = { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 900, right: 900 } };
    const footer = new D.Footer({ children: [center([new D.TextRun({ children: ["شركة ميم  |  ", D.PageNumber.CURRENT], font: FONT, size: 18, color: STONE })])] });

    const doc = new D.Document({
      creator: "شركة ميم", title: "كتالوج دروع التكريم",
      styles: { default: { document: { run: { font: FONT, size: 22 } } } },
      sections: [
        { properties: { page: pageSz }, children: cover },
        { properties: { page: pageSz }, footers: { default: footer }, children },
      ],
    });
    return D.Packer.toBlob(doc);
  }

  window.MeemCatalogDocx = { build, families };
})();
