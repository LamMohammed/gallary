#!/usr/bin/env python3
"""
أداة بناء الـ SEO لموقع ميم — بتشتغل من غير مكتبات خارجية (Python 3.8+).

  python tools/build.py                       يحدّث JSON-LD و sitemap.xml و robots.txt و <noscript>
  python tools/build.py --domain https://x.com  يغيّر الدومين في كل الملفات (canonical / OG / sitemap ...)
  python tools/build.py --live                يسحب المنتجات من Supabase بدل الكتالوج الاحتياطي

شغّلها كل مرة تغيّر فيها المنتجات أو الدومين، وقبل كل نشر.
"""
import argparse, datetime, html, json, re, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
CFG_PATH = Path(__file__).resolve().parent / "site.json"
CATS = {"gold": "ذهبي", "crystal": "كريستال", "acrylic": "أكريليك منقوش"}
COLORS = {"gold": "ذهبي", "crystal": "شفاف", "acrylic": "شفاف"}


def read(p):  return Path(p).read_text(encoding="utf-8")
def write(p, s): Path(p).write_text(s, encoding="utf-8")


def fallback_products():
    """الكتالوج الاحتياطي: JSON بين علامات FAMILIES-START/END في catalog.js (منتج أساسي + نسخ)."""
    src = read(SITE / "js" / "catalog.js")
    m = re.search(r"/\*FAMILIES-START\*/(.*?)/\*FAMILIES-END\*/", src, re.S)
    families = json.loads(m.group(1))
    rows = []
    for f in families:
        variants = f.get("variants") or [{}]
        for i, v in enumerate(variants):
            rows.append({"id": v.get("id") or (f["id"] if i == 0 else f'{f["id"]}-{i + 1}'), "code": v["code"],
                         "name": f["name"], "cat": f["cat"], "era": f["era"], "color": v.get("color", ""),
                         "size": v.get("size", ""), "image": v.get("image") or f["image"],
                         "group_id": f["id"] if len(variants) > 1 else None, "variant_by": f.get("variant_by")})
    return rows


def live_products():
    cfg = read(SITE / "js" / "config.js")
    url = re.search(r'SUPABASE_URL\s*=\s*"([^"]+)"', cfg).group(1)
    key = re.search(r'SUPABASE_KEY\s*=\s*"([^"]+)"', cfg).group(1)
    q = "/rest/v1/products?select=id,code,name,cat,color,era,size,image,group_id,variant_by&order=sort_order.asc.nullslast,created_at.asc"
    req = urllib.request.Request(url + q, headers={"apikey": key, "Authorization": "Bearer " + key})
    with urllib.request.urlopen(req, timeout=20) as r:
        rows = json.load(r)
    for p in rows:
        m = re.match(r"images/(gold|crystal|acrylic)-(\d+)\.webp$", p["image"])
        if m:
            p["image"] = f"images/products/{m.group(1)}/{m.group(1)}-{m.group(2)}.webp"
    return rows


def absolute(base, path):
    return path if path.startswith("http") else f"{base}/{path.lstrip('/')}"


def group_products(products):
    """نسخ المنتج (نفس group_id) = عنصر واحد في الكتالوج، والنسخ كـ hasVariant."""
    groups, order = {}, []
    for p in products:
        k = p.get("group_id") or p["id"]
        if k not in groups:
            groups[k] = []; order.append(k)
        groups[k].append(p)
    return [groups[k] for k in order]


def jsonld(cfg, products):
    base = cfg["siteUrl"].rstrip("/")
    org = {
        "@type": "Organization", "@id": base + "/#org", "name": cfg["name"], "legalName": cfg["legalName"],
        "url": base + "/", "logo": base + "/images/brand/icon-512.png", "image": base + "/images/brand/og-image.jpg",
        "telephone": cfg["phone"],
        "contactPoint": {"@type": "ContactPoint", "telephone": cfg["phone"], "contactType": "sales",
                         "availableLanguage": ["ar"]},
    }
    site = {"@type": "WebSite", "@id": base + "/#website", "url": base + "/", "name": cfg["name"],
            "inLanguage": "ar", "publisher": {"@id": base + "/#org"}}
    items = []
    for i, variants in enumerate(group_products(products), 1):
        p = variants[0]
        prod = {"@type": "Product", "name": p["name"], "sku": p["code"], "category": CATS.get(p["cat"], p["cat"]),
                "color": p.get("color") or "", "description": f'{p["era"]} — المقاس {p["size"]}',
                "image": absolute(base, p["image"]), "brand": {"@type": "Brand", "name": cfg["name"]}}
        if len(variants) > 1:
            prod["hasVariant"] = [{"@type": "Product", "name": v["name"], "sku": v["code"], "color": v.get("color", ""),
                                   "size": v["size"], "image": absolute(base, v["image"])} for v in variants]
        items.append({"@type": "ListItem", "position": i, "item": prod})
    lst = {"@type": "ItemList", "@id": base + "/#catalog", "name": "دروع التكريم", "numberOfItems": len(items),
           "itemListElement": items}
    data = {"@context": "https://schema.org", "@graph": [org, site, lst]}
    return '<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=1) + "\n  </script>"


def noscript(products):
    lis = "\n".join(f'      <li>{html.escape(g[0]["name"])} — {html.escape(g[0]["code"])} — '
                    f'{html.escape(CATS.get(g[0]["cat"], g[0]["cat"]))} — {html.escape(" / ".join(dict.fromkeys(v["size"] for v in g)))}</li>'
                    for g in group_products(products))
    return ('<noscript>\n    <section class="noscript-catalog">\n      <h2>دروع التكريم — شركة ميم</h2>\n'
            '      <p>فعّل JavaScript لتصفح المعرض بالصور، أو تواصل معنا مباشرة على واتساب.</p>\n'
            f'      <ul>\n{lis}\n      </ul>\n    </section>\n  </noscript>')


def sitemap(cfg, products):
    base = cfg["siteUrl"].rstrip("/")
    today = datetime.date.today().isoformat()
    imgs = "\n".join(f'    <image:image><image:loc>{html.escape(absolute(base, p["image"]))}</image:loc>'
                     f'<image:title>{html.escape(p["name"])}</image:title></image:image>' for p in products)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
            f'  <url>\n    <loc>{base}/</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n{imgs}\n  </url>\n</urlset>\n')


def replace_block(text, name, content):
    pat = re.compile(rf"(<!-- build:{name} -->).*?(<!-- /build:{name} -->)", re.S)
    if not pat.search(text):
        sys.exit(f"marker build:{name} مش موجود في index.html")
    return pat.sub(lambda m: f"{m.group(1)}\n  {content}\n  {m.group(2)}", text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--domain"); ap.add_argument("--live", action="store_true")
    a = ap.parse_args()
    cfg = json.loads(read(CFG_PATH))

    if a.domain:
        new = a.domain.rstrip("/")
        if not re.match(r"^https://[a-z0-9.-]+(:\d+)?$", new):
            sys.exit("الدومين لازم يبدأ بـ https:// ومن غير مسار (مثال: https://meem-awards.com)")
        old = cfg["siteUrl"].rstrip("/")
        p = SITE / "index.html"; write(p, read(p).replace(old, new))
        cfg["siteUrl"] = new; write(CFG_PATH, json.dumps(cfg, ensure_ascii=False, indent=2) + "\n")
        print(f"الدومين: {old} → {new}")

    try:
        products = live_products() if a.live else fallback_products()
        print(f"المنتجات: {len(products)} ({'Supabase' if a.live else 'catalog.js'})")
    except Exception as e:
        sys.exit(f"تعذّر تحميل المنتجات: {e}")

    idx = SITE / "index.html"
    t = read(idx)
    t = replace_block(t, "jsonld", jsonld(cfg, products))
    t = replace_block(t, "noscript", noscript(products))
    write(idx, t)

    base = cfg["siteUrl"].rstrip("/")
    write(SITE / "sitemap.xml", sitemap(cfg, products))
    write(SITE / "robots.txt", f"User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: {base}/sitemap.xml\n")
    if "YOUR-DOMAIN" in base:
        print("⚠️  لسه الدومين placeholder — شغّل:  python tools/build.py --domain https://دومينك.com")
    print("SEO build ✓")


if __name__ == "__main__":
    main()
