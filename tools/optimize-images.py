#!/usr/bin/env python3
"""
تجهيز صور المنتجات الجديدة.
  1) حط الصورة الأصلية (أي حجم/امتداد) في فولدر مؤقت
  2) python tools/optimize-images.py <الفولدر> <gold|crystal|acrylic>
بيطلع لكل صورة: نسخة كاملة (≤1200px) في site/images/products/<الخامة>/
ونسخة مصغّرة (≤520px) في site/images/thumbs/<الخامة>/ — بصيغة WebP.
التسمية: <الخامة>-<رقم>.webp (بيكمّل الترقيم من آخر رقم موجود).
المتطلبات: pip install pillow
"""
import re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "site" / "images"
if len(sys.argv) != 3 or sys.argv[2] not in ("gold", "crystal", "acrylic"):
    sys.exit(__doc__)
src, cat = Path(sys.argv[1]), sys.argv[2]
full_dir, th_dir = ROOT / "products" / cat, ROOT / "thumbs" / cat
full_dir.mkdir(parents=True, exist_ok=True); th_dir.mkdir(parents=True, exist_ok=True)
nums = [int(m.group(1)) for f in full_dir.glob(f"{cat}-*.webp") if (m := re.search(r"-(\d+)\.webp$", f.name))]
n = max(nums, default=0)
for f in sorted(src.iterdir()):
    if f.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
        continue
    n += 1
    im = Image.open(f).convert("RGB")
    big = im.copy(); big.thumbnail((1200, 1200)); big.save(full_dir / f"{cat}-{n}.webp", "WEBP", quality=80, method=6)
    sm = im.copy();  sm.thumbnail((520, 520));   sm.save(th_dir / f"{cat}-{n}.webp", "WEBP", quality=76, method=6)
    print(f"✓ {f.name} → {cat}-{n}.webp")
print("بعد كده: أضف المنتج من لوحة الإدارة، وشغّل  python tools/build.py")
