/* ============================================================
   catalog-docx.js — تصدير الكتالوج كملف Word (من لوحة الإدارة)
   بيتحمّل لوحده لما الأدمن يضغط الزرار، ومكتبة docx متحمّلة من vendor/ (CSP: 'self').
   كل منتج: الصورة · الاسم · الكود · المقاس · الألوان. وفي الآخر لينك الموقع وجملة الطلب.
   ============================================================ */
(() => {
  const NAVY = "14305A", GOLD = "C9A227", STONE = "64748B", FONT = "Arial";
  const GENERIC = { gold: "ذهبي", crystal: "شفاف", acrylic: "شفاف" };
  const ORDER_LINE = "لطلب طلبية: حدّد من الموقع الكمية والشكل والمقاس والألوان المطلوبة، وابعتهم في رسالة واحدة على واتساب.";

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
      return { base, list, name: base.name, codes: list.map((p) => p.code), material: label(base.cat), sizes, colors };
    });
  }

  async function build({ products, cats, imgUrl, siteUrl, onProgress }) {
    const D = await loadLib();
    const fams = families(products, cats);
    const run = (text, o = {}) => new D.TextRun({ text, font: FONT, rightToLeft: true, ...o });
    const para = (children, o = {}) => new D.Paragraph({ bidirectional: true, alignment: D.AlignmentType.RIGHT, ...o, children });

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
      kids.push(para([run(f.name, { bold: true, size: 28, color: NAVY })], { spacing: { after: 60 } }));
      const line = (k, v) => para([run(k + ": ", { color: STONE, size: 22 }), run(v, { size: 22 })], { spacing: { after: 30 } });
      kids.push(line("الكود", f.codes.join(" ، ")));
      kids.push(line("الخامة", f.material));
      if (f.sizes.length) kids.push(line("المقاس", f.sizes.join(" ، ")));
      if (f.colors.length) {
        const parts = [run("الألوان: ", { color: STONE, size: 22 })];
        f.colors.forEach((c, j) => {
          if (j) parts.push(run("  ", { size: 22 }));
          if (c.hex) parts.push(run("■ ", { color: c.hex, size: 22 }));
          parts.push(run(c.name, { size: 22 }));
        });
        kids.push(para(parts, { spacing: { after: 30 } }));
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
    const children = [
      new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 60 }, children: [run("شركة ميم", { bold: true, size: 44, color: NAVY })] }),
      new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 60 }, children: [run("كتالوج دروع التكريم", { size: 30, color: GOLD })] }),
      new D.Paragraph({ alignment: D.AlignmentType.CENTER, spacing: { after: 240 }, border: { bottom: { style: D.BorderStyle.SINGLE, size: 12, color: GOLD, space: 8 } }, children: [run(date, { size: 20, color: STONE })] }),
      new D.Table({ width: { size: W * 2, type: D.WidthType.DXA }, columnWidths: [W, W], layout: D.TableLayoutType.FIXED, visuallyRightToLeft: true, rows }),
      new D.Paragraph({ spacing: { before: 360, after: 120 }, border: { top: { style: D.BorderStyle.SINGLE, size: 12, color: GOLD, space: 10 } }, bidirectional: true, alignment: D.AlignmentType.CENTER, children: [run(ORDER_LINE, { bold: true, size: 26, color: NAVY })] }),
      new D.Paragraph({ alignment: D.AlignmentType.CENTER, children: [
        new D.ExternalHyperlink({ link: siteUrl, children: [new D.TextRun({ text: siteUrl, font: FONT, size: 26, color: "0563C1", underline: {} })] }),
      ] }),
    ];

    const doc = new D.Document({
      creator: "شركة ميم", title: "كتالوج دروع التكريم",
      styles: { default: { document: { run: { font: FONT, size: 22 } } } },
      sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 900, right: 900 } } }, children }],
    });
    return D.Packer.toBlob(doc);
  }

  window.MeemCatalogDocx = { build, families };
})();
