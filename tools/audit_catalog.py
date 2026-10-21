#!/usr/bin/env python3
"""
فحص بيانات المنتجات — بيطلّع تقرير بالمشاكل والمرشّحين للتجميع (ألوان/مقاسات).
مش بيعدّل أي حاجة ومش بيخترع قيم: اللي مش معروف بيتحدد في التقرير.

  python tools/audit_catalog.py                      يفحص الكتالوج الاحتياطي (site/js/catalog.js)
  python tools/audit_catalog.py --live               يفحص المنتجات الحقيقية من Supabase (محتاج إنترنت)
  python tools/audit_catalog.py --file products.json يفحص ملف JSON (تصدير جدول products)
  python tools/audit_catalog.py --csv products.csv   يفحص ملف CSV (تصدير من Supabase)
  ... --out docs/DATA-AUDIT.md                       يحفظ التقرير

بعد ما تراجعي المرشّحين وتأكدي منهم، اكتبي ملف groups.json:
  [{"group": "gold-royal", "by": "color", "members": ["g1", "g2", "g3"]}]
وشغّلي:  python tools/audit_catalog.py --groups groups.json
بيطبع أوامر SQL جاهزة (للصقها في Supabase SQL Editor) — مش بيتنفّذ أي حاجة تلقائيًا.
"""
import argparse, collections, csv, json, re, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
GENERIC = {"gold": "ذهبي", "crystal": "شفاف", "acrylic": "شفاف"}
COLOR_WORDS = ["ذهبي", "فضي", "أسود", "اسود", "أبيض", "ابيض", "أزرق", "ازرق", "كحلي", "أحمر", "احمر", "أخضر", "اخضر", "بنفسجي",
               "بني", "وردي", "برتقالي", "رمادي", "بيج", "نحاسي", "برونزي", "شفاف", "خشبي"]
SIZE_WORDS = ["صغير", "كبير", "وسط", "متوسط", "ميني", "مقاس"]
DIM = re.compile(r"\d+(?:[.,٫]\d+)?\s*[×xX*]\s*\d+(?:[.,٫]\d+)?")


def load_rows(a):
    if a.live:
        cfg = (SITE / "js" / "config.js").read_text(encoding="utf-8")
        url = re.search(r'SUPABASE_URL\s*=\s*"([^"]+)"', cfg).group(1)
        key = re.search(r'SUPABASE_KEY\s*=\s*"([^"]+)"', cfg).group(1)
        q = "/rest/v1/products?select=*&order=sort_order.asc.nullslast,created_at.asc&limit=1000"
        req = urllib.request.Request(url + q, headers={"apikey": key, "Authorization": "Bearer " + key})
        with urllib.request.urlopen(req, timeout=25) as r:
            return json.load(r), "Supabase (المنتجات الحقيقية)"
    if a.file:
        return json.loads(Path(a.file).read_text(encoding="utf-8")), a.file
    if a.csv:
        with open(a.csv, encoding="utf-8-sig", newline="") as f:
            return list(csv.DictReader(f)), a.csv
    src = (SITE / "js" / "catalog.js").read_text(encoding="utf-8")
    fams = json.loads(re.search(r"/\*FAMILIES-START\*/(.*?)/\*FAMILIES-END\*/", src, re.S).group(1))
    rows = []
    for f in fams:
        vs = f.get("variants") or [{}]
        for i, v in enumerate(vs):
            rows.append({"id": v.get("id") or (f["id"] if i == 0 else f'{f["id"]}-{i+1}'), "code": v.get("code", ""),
                         "name": f["name"], "cat": f["cat"], "era": f["era"], "color": v.get("color", ""),
                         "size": v.get("size", ""), "image": v.get("image") or f.get("image", ""),
                         "group_id": f["id"] if len(vs) > 1 else None})
    return rows, "الكتالوج الاحتياطي (site/js/catalog.js)"


def norm_name(name):
    n = name
    for w in COLOR_WORDS + SIZE_WORDS:
        n = re.sub(rf"(?<![\u0600-\u06FF]){w}(?![\u0600-\u06FF])", " ", n)
    n = DIM.sub(" ", n)
    n = re.sub(r"\d+\s*(سم|مم|cm|mm)", " ", n)
    return re.sub(r"[\s\-–—_/|·.,()]+", " ", n).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--live", action="store_true"); ap.add_argument("--file"); ap.add_argument("--csv")
    ap.add_argument("--out"); ap.add_argument("--groups")
    a = ap.parse_args()

    if a.groups:
        for g in json.loads(Path(a.groups).read_text(encoding="utf-8")):
            ids = ", ".join("'" + m.replace("'", "''") + "'" for m in g["members"])
            by = g.get("by", "both")
            if by not in ("color", "size", "both"): sys.exit(f"by لازم يكون color أو size أو both ({g})")
            print(f"update public.products set group_id = '{g['group']}', variant_by = '{by}' where id in ({ids});")
        return

    rows, source = load_rows(a)
    out = []
    P = out.append
    P(f"# تقرير فحص بيانات المنتجات\n\nالمصدر: **{source}** — عدد الصفوف: **{len(rows)}**\n")

    # ---- 1) حقول ناقصة وتكرار
    issues = []
    for r in rows:
        miss = [k for k in ("id", "code", "name", "cat", "era") if not str(r.get(k) or "").strip()]
        if miss: issues.append(f"- `{r.get('code') or r.get('id')}`: حقول ناقصة: {', '.join(miss)}")
        if not str(r.get("image") or "").strip() and not r.get("group_id"):
            issues.append(f"- `{r.get('code')}`: من غير صورة وليس نسخة من منتج أساسي")
    for key in ("id", "code"):
        for v, n in collections.Counter(str(r.get(key, "")).strip().upper() for r in rows).items():
            if v and n > 1: issues.append(f"- **{key} مكرر**: `{v}` ظهر {n} مرات")
    for v, n in collections.Counter(str(r.get("image") or "") for r in rows if r.get("image")).items():
        if n > 1: issues.append(f"- **نفس مسار الصورة** `{v}` مستخدم في {n} صفوف (ممكن تكون نسخ من نفس الدرع)")
    prefix = {"gold": "GO", "crystal": "CR", "acrylic": "AC"}
    for r in rows:
        p = prefix.get(r.get("cat"))
        if p and r.get("code") and not str(r["code"]).upper().startswith(p):
            issues.append(f"- كود `{r['code']}` مش على نمط الخامة `{r['cat']}` (المتوقع {p}-…) — **تعارض، محتاج مراجعة**")
    P("## ١) أخطاء بنيوية\n" + ("\n".join(issues) if issues else "لا يوجد ✅") + "\n")

    # ---- 2) نظافة النصوص
    txt = []
    for r in rows:
        e = str(r.get("era") or "")
        if re.search(r"\s{2,}", e) or re.search(r"·\s*$", e) or e != e.strip():
            txt.append(f"- `{r.get('code')}`: الوصف فيه مسافات زايدة أو علامة · في الآخر: «{e}»")
    for e, n in collections.Counter(str(r.get("era") or "").strip() for r in rows).items():
        if n >= 4: txt.append(f"- الوصف «{e}» مكرر حرفيًا في **{n}** منتج — غالبًا وصف عام مش خاص بكل تصميم")
    letters = [r.get("code") for r in rows if re.search(r"·\s*[A-Za-z]\s*$", str(r.get("era") or ""))]
    if letters:
        txt.append(f"- حرف لاتيني منفرد في آخر الوصف (مثل «· L») في {len(letters)} منتج: **غير معروف معناه** (مقاس؟ فئة؟) — محتاج تحديد منك")
    P("## ٢) نظافة النصوص (الوصف)\n" + ("\n".join(txt) if txt else "نظيفة ✅") + "\n")

    # ---- 3) الألوان
    generic = [r for r in rows if str(r.get("color") or "").strip() in ("", GENERIC.get(r.get("cat"), "#"))]
    real = [r for r in rows if r not in generic]
    P("## ٣) الألوان\n"
      f"- صفوف لونها فاضي أو **اللون العام التلقائي حسب الخامة** (ذهبي للذهبي، شفاف للكريستال/الأكريليك): **{len(generic)}** من {len(rows)}.\n"
      "  دي **مش بيانات مؤكدة** عن لون المنتج، والموقع بقى مش بيعرضها كلون.\n"
      f"- صفوف بلون محدد فعلًا: **{len(real)}**" + (": " + "، ".join(f"`{r.get('code')}`={r.get('color')}" for r in real[:30]) if real else "") + "\n")

    # ---- 4) المقاسات
    sizes = collections.Counter((r.get("cat"), str(r.get("size") or "").strip()) for r in rows)
    no_unit = [s for (c, s) in sizes if s and DIM.fullmatch(s)]
    P("## ٤) المقاسات\n" + "\n".join(f"- {c} · «{s or '— (فاضي)'}» × {n}" for (c, s), n in sorted(sizes.items(), key=lambda x: str(x))) + "\n")
    if no_unit:
        P("⚠️ **مقاسات من غير وحدة** (سم؟ مم؟): " + "، ".join(f"«{s}»" for s in no_unit) + " — لازم تحدّدي الوحدة، أنا مش هخمّنها.\n")
    P("ℹ️ الأرقام بتتعرض في الموقع بنفس ترتيبها المخزّن (٢٢٠×٢٨٠ تفضل ٢٢٠×٢٨٠).\n")

    # ---- 5) مرشّحو التجميع
    P("## ٥) مرشّحون لتجميعهم كنسخ من نفس الدرع\n"
      "التجميع **مش تلقائي**: لازم تأكدي كل مجموعة. الفحص هنا بس بيقارن الاسم بعد شيل كلمات اللون والمقاس.\n")
    explicit = collections.defaultdict(list)
    for r in rows:
        if r.get("group_id"): explicit[r["group_id"]].append(r)
    if explicit:
        P("### مجموعات متجمّعة فعلًا في البيانات")
        for gid, ms in explicit.items():
            colors = {m.get("color") for m in ms if m.get("color")}; sz = {m.get("size") for m in ms if m.get("size")}
            axis = "لون ومقاس" if len(colors) > 1 and len(sz) > 1 else "لون" if len(colors) > 1 else "مقاس" if len(sz) > 1 else "—"
            P(f"- `{gid}` ({axis}): " + "، ".join(f"`{m.get('code')}`" for m in ms))
        P("")
    buckets = collections.defaultdict(list)
    for r in rows:
        if not r.get("group_id"):
            buckets[(r.get("cat"), norm_name(str(r.get("name") or "")))].append(r)
    cands = {k: v for k, v in buckets.items() if len(v) > 1}
    if cands:
        P("### مرشّحون (تحتاج تأكيد منك)")
        for (cat, nm), ms in cands.items():
            colors = {m.get("color") for m in ms}; sz = {m.get("size") for m in ms}
            diff = "لون ومقاس" if len(colors) > 1 and len(sz) > 1 else "لون" if len(colors) > 1 else "مقاس" if len(sz) > 1 else "لا يوجد فرق ظاهر في اللون/المقاس"
            P(f"- **{nm}** ({cat}) — الفرق: {diff}: " + "، ".join(f"`{m.get('code')}` [{m.get('color') or '—'} / {m.get('size') or '—'}]" for m in ms))
    else:
        P("لا يوجد: كل اسم منتج مختلف بعد شيل اللون والمقاس. يعني **مفيش دروع في هذه البيانات تثبت إنها نفس الدرع بلون أو مقاس تاني** — "
          "فاتسابت كلها منتجات مستقلة ولم يتم دمج أي منتجين.\n")

    text = "\n".join(out)
    if a.out: Path(a.out).write_text(text + "\n", encoding="utf-8"); print("تم حفظ التقرير في", a.out)
    else: print(text)


if __name__ == "__main__":
    main()
