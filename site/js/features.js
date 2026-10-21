/* ============================================================
   ميزات الجاليري الإضافية — تُحمّل بعد script.js
   - البحث الفوري
   - الترتيب (Sort)
   - المفضلة (Wishlist)
   - شوهد مؤخرًا (Recently Viewed)
   - الوضع الليلي/النهاري
   - Quick View tooltip
   - شارة "جديد"
   - Skeleton loading
   - Toast notifications
   - زر المشاركة
   - PWA registration
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     أدوات مساعدة
     ========================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const ar = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(message, type = 'ok') {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.className = 'toast show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('show');
    }, 2400);
  }
  window.meemToast = toast; // متاح للاستخدام العام

  /* ==========================================================
     1) الوضع الليلي / النهاري
     ========================================================== */
  (function initTheme() {
    const KEY = 'meem-theme';
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark') document.documentElement.dataset.theme = 'dark';
    else if (saved === 'light') document.documentElement.dataset.theme = 'light';

    const btn = $('#themeToggle');
    if (!btn) return;

    updateIcon();
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
      localStorage.setItem(KEY, isDark ? 'light' : 'dark');
      updateIcon();
    });

    function updateIcon() {
      const isDark = document.documentElement.dataset.theme === 'dark';
      btn.innerHTML = isDark
        ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  })();

  /* ==========================================================
     2) المفضلة (Wishlist)
     ========================================================== */
  const FAV_KEY = 'meem-favorites';
  const favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));

  function saveFavs() {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    updateFavCount();
    renderFavDrawer();
  }

  function updateFavCount() {
    const el = $('#favCount');
    if (!el) return;
    if (favs.size === 0) {
      el.hidden = true;
    } else {
      el.hidden = false;
      el.textContent = ar(favs.size);
    }
  }

  function toggleFav(id) {
    const product = (window.SHIELDS || []).find((p) => p.id === id);
    if (!product) return;
    if (favs.has(id)) {
      favs.delete(id);
      toast('أُزيل من المفضلة', 'ok');
    } else {
      favs.add(id);
      toast('أُضيف للمفضلة ❤️', 'ok');
    }
    saveFavs();
    syncFavButtons();
    syncModalFavButton();
  }
  window.meemToggleFav = toggleFav;

  function syncFavButtons() {
    $$('.fav-btn').forEach((btn) => {
      btn.classList.toggle('is-fav', favs.has(btn.dataset.id));
    });
  }

  function syncModalFavButton() {
    const btn = $('#modal-fav');
    if (!btn) return;
    const id = $('#modal-select-toggle')?.dataset.productId;
    if (!id) return;
    btn.classList.toggle('is-fav', favs.has(id));
  }

  function renderFavDrawer() {
    const body = $('#favBody');
    if (!body) return;
    const products = (window.SHIELDS || []).filter((p) => favs.has(p.id));
    if (products.length === 0) {
      body.innerHTML = '<p style="text-align:center;color:var(--muted);padding:30px 0">لا توجد منتجات مفضلة بعد.<br>اضغط ❤️ على أي منتج لإضافته.</p>';
      return;
    }
    body.innerHTML = products.map((p) => `
      <div class="fav-item" data-id="${esc(p.id)}">
        <img src="${esc(thumbOf(p.image))}" alt="${esc(p.name)}" loading="lazy">
        <div>
          <b>${esc(p.name)}</b>
          <small>${esc([p.code, (typeof colorShown === 'function' && colorShown(p)) ? p.color : '', typeof isoSize === 'function' ? isoSize(p.size) : p.size].filter(Boolean).join(' · '))}</small>
        </div>
        <div class="fav-item__actions">
          <button type="button" data-fav-open="${esc(p.id)}" aria-label="عرض">👁</button>
          <button type="button" class="del" data-fav-del="${esc(p.id)}" aria-label="إزالة">✕</button>
        </div>
      </div>
    `).join('');
  }

  function openFavDrawer() {
    const drawer = $('#favDrawer');
    if (!drawer) return;
    renderFavDrawer();
    drawer.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeFavDrawer() {
    const drawer = $('#favDrawer');
    if (!drawer) return;
    drawer.hidden = true;
    document.body.style.overflow = '';
  }

  /* ---------- ربط أزرار المفضلة ---------- */
  $('#favToggle')?.addEventListener('click', openFavDrawer);
  $$('[data-fav-close]').forEach((el) => el.addEventListener('click', closeFavDrawer));

  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-fav-open]');
    if (openBtn) {
      const id = openBtn.dataset.favOpen;
      const product = (window.SHIELDS || []).find((p) => p.id === id);
      if (product && typeof window.openProductModal === 'function') {
        closeFavDrawer();
        setTimeout(() => window.openProductModal(product), 200);
      }
      return;
    }
    const delBtn = e.target.closest('[data-fav-del]');
    if (delBtn) {
      toggleFav(delBtn.dataset.favDel);
    }
  });

  /* ==========================================================
     3) البحث الفوري
     ========================================================== */
  let searchQuery = '';

  function applySearch() {
    const q = searchQuery.trim().toLowerCase();
    const countEl = $('#searchCount');
    const clearBtn = $('#clearSearch');
    let visible = 0;
    const hit = (v) =>
      v.name.toLowerCase().includes(q) ||
      v.code.toLowerCase().includes(q) ||
      (v.color || '').toLowerCase().includes(q) ||
      (v.size || '').toLowerCase().includes(q);

    // لو النتيجة في لون/مقاس تاني غير المعروض، نعرض النسخة المطابقة
    if (q && typeof window.groupOfVariant === 'function') {
      $$('#grid .card').forEach((card) => {
        const group = window.groupOfVariant(card.dataset.productId);
        if (!group || group.variants.length < 2) return;
        const current = group.variants.find((v) => v.id === card.dataset.productId);
        if (current && hit(current)) return;
        const alt = group.variants.find(hit);
        if (alt) window.setActiveVariant(group.key, alt.id);
      });
    }

    $$('#grid .card').forEach((card) => {
      const product = (window.SHIELDS || []).find((p) => p.id === card.dataset.productId);
      if (!product) return;
      const group = typeof window.groupOfVariant === 'function' ? window.groupOfVariant(product.id) : null;
      const variants = group ? group.variants : [product];
      const match = !q || variants.some(hit);
      card.classList.toggle('hidden', !match);
      if (match) visible++;
    });

    if (clearBtn) clearBtn.hidden = !q;
    if (countEl) {
      if (q) {
        countEl.hidden = false;
        countEl.textContent = visible === 0
          ? 'لا توجد نتائج مطابقة'
          : `${ar(visible)} نتيجة`;
      } else {
        countEl.hidden = true;
      }
    }
  }

  const searchInput = $('#searchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value;
        applySearch();
      }, 120);
    });
  }

  $('#clearSearch')?.addEventListener('click', () => {
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    applySearch();
    searchInput?.focus();
  });

  /* ==========================================================
     4) الترتيب (Sort)
     ========================================================== */
  const sortSelect = $('#sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const mode = sortSelect.value;
      const grid = $('#grid');
      if (!grid) return;
      const cards = [...grid.querySelectorAll('.card')];

      cards.sort((a, b) => {
        const pa = (window.SHIELDS || []).find((p) => p.id === a.dataset.productId);
        const pb = (window.SHIELDS || []).find((p) => p.id === b.dataset.productId);
        if (!pa || !pb) return 0;
        switch (mode) {
          case 'name': return pa.name.localeCompare(pb.name, 'ar');
          case 'code': return pa.code.localeCompare(pb.code, 'en');
          case 'newest':
            // الأحدث = آخر ما أُضيف إلى الكتالوج (بترتيب المصفوفة)
            return (window.SHIELDS || []).indexOf(pb) - (window.SHIELDS || []).indexOf(pa);
          default: return 0;
        }
      });

      cards.forEach((c) => grid.appendChild(c));
    });
  }

  /* ==========================================================
     5) شوهد مؤخرًا (Recently Viewed)
     ========================================================== */
  const VIEWED_KEY = 'meem-viewed';
  const MAX_VIEWED = 6;

  function pushViewed(id) {
    try {
      let arr = JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]');
      arr = [id, ...arr.filter((x) => x !== id)].slice(0, MAX_VIEWED);
      localStorage.setItem(VIEWED_KEY, JSON.stringify(arr));
      renderRecentlyViewed();
    } catch (e) {}
  }
  window.meemPushViewed = pushViewed;

  function renderRecentlyViewed() {
    const track = $('#recentlyTrack');
    const section = $('#recentlyViewed');
    if (!track || !section) return;
    let arr = [];
    try {
      arr = JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]');
    } catch (e) {}

    const products = arr
      .map((id) => (window.SHIELDS || []).find((p) => p.id === id))
      .filter(Boolean);

    if (products.length === 0) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    track.innerHTML = products.map((p) => `
      <button class="recently-viewed__item" type="button" data-viewed-id="${esc(p.id)}" aria-label="${esc(p.name)}" title="${esc(p.name)}">
        <img src="${esc(thumbOf(p.image))}" alt="${esc(p.name)}" loading="lazy">
      </button>
    `).join('');
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-viewed-id]');
    if (!btn) return;
    const product = (window.SHIELDS || []).find((p) => p.id === btn.dataset.viewedId);
    if (product && typeof window.openProductModal === 'function') {
      window.openProductModal(product);
    }
  });

  /* ==========================================================
     6) تحسينات الكارت (Skeleton + Quick View + Fav + New)
        نطبّقها بعد ما script.js يبني الشبكة
     ========================================================== */
  function enhanceCards() {
    const now = Date.now();
    const WEEK = 7 * 24 * 60 * 60 * 1000;

    $$('#grid .card').forEach((card) => {
      const id = card.dataset.productId;
      const product = (window.SHIELDS || []).find((p) => p.id === id);
      if (!product) return;

      /* Skeleton + تحميل الصورة */
      const thumb = card.querySelector('.thumb');
      const img = card.querySelector('.thumb img');
      if (thumb && img) {
        // Quick View tooltip
        const g = typeof window.groupOfVariant === 'function' ? window.groupOfVariant(product.id) : null;
        const bits = [product.name, product.code];
        if (product.color && g && (g.by === 'color' || g.by === 'both')) bits.push(product.color);
        if (product.size) bits.push(typeof isoSize === 'function' ? isoSize(product.size) : product.size);
        thumb.dataset.preview = bits.join(' · ');
        // خلفية حسب التصنيف
        thumb.dataset.cat = product.cat || '';

        // Skeleton
        if (!thumb.querySelector('.skeleton')) {
          const sk = document.createElement('span');
          sk.className = 'skeleton';
          img.parentNode.insertBefore(sk, img);
        }
        if (img.complete && img.naturalWidth > 0) {
          img.classList.add('is-loaded');
        } else {
          img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
          img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
        }
      }

      /* زر المفضلة */
      if (!card.querySelector('.fav-btn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fav-btn' + (favs.has(id) ? ' is-fav' : '');
        btn.dataset.id = id;
        btn.setAttribute('aria-label', 'أضف للمفضلة');
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFav(id);
        });
        thumb.appendChild(btn);
      }

      /* شارة "جديد" — على المنتجات التي لها sort_order عالي (آخر إضافات) */
      // ملاحظة: عندنا فقط sort_order في حال تحميلها من السيرفر، نستخدم آخر 3 في القائمة
      const allIds = (window.SHIELDS || []).map((p) => p.id);
      const lastThree = allIds.slice(-3);
      if (lastThree.includes(id)) {
        card.dataset.new = 'true';
      }
    });
  }

  /* ==========================================================
     7) ربط المودال: مشاركة + مفضلة + تسجيل المشاهدة
     ========================================================== */
  function enhanceModal() {
    // زر المشاركة
    const shareBtn = $('#modal-share');
    if (shareBtn && !shareBtn.dataset.bound) {
      shareBtn.dataset.bound = '1';
      shareBtn.addEventListener('click', async () => {
        const id = $('#modal-select-toggle')?.dataset.productId;
        if (!id) return;
        const url = `${location.origin}${location.pathname}?product=${encodeURIComponent(id)}`;
        try {
          if (navigator.share) {
            await navigator.share({ title: 'منتج من شركة ميم', url });
            toast('تمت المشاركة', 'ok');
          } else {
            await navigator.clipboard.writeText(url);
            toast('📋 تم نسخ رابط المنتج', 'ok');
          }
        } catch (e) {
          toast('تعذر المشاركة', 'err');
        }
      });
    }

    // زر المفضلة في المودال
    const favBtn = $('#modal-fav');
    if (favBtn && !favBtn.dataset.bound) {
      favBtn.dataset.bound = '1';
      favBtn.addEventListener('click', () => {
        const id = $('#modal-select-toggle')?.dataset.productId;
        if (id) toggleFav(id);
      });
    }
  }

  // نراقب فتح المودال لتسجيل المشاهدة + تحديث زر المفضلة
  const modal = $('#product-modal');
  if (modal) {
    const observer = new MutationObserver(() => {
      if (!modal.hidden) {
        const id = $('#modal-select-toggle')?.dataset.productId;
        if (id) {
          pushViewed(id);
          syncModalFavButton();
        }
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ==========================================================
     8) كشف التغييرات في الشبكة (بعد تحديث SHIELDS من السيرفر)
     ========================================================== */
  const grid = $('#grid');
  if (grid) {
    const gridObserver = new MutationObserver(() => {
      enhanceCards();
      // أعد تطبيق البحث لو فيه نص
      if (searchQuery.trim()) applySearch();
    });
    gridObserver.observe(grid, { childList: true });
  }

  /* ==========================================================
     9) PWA — service worker
     ========================================================== */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }

  /* ==========================================================
     10) مفتاح Escape لإغلاق الـ drawer
     ========================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFavDrawer();
  });

  /* ==========================================================
     التشغيل الأولي
     ========================================================== */
  function boot() {
    updateFavCount();
    renderRecentlyViewed();
    enhanceCards();
    enhanceModal();
    syncModalFavButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // إعادة المحاولة بعد تحميل البيانات من السيرفر
  setTimeout(boot, 1500);
  setTimeout(boot, 3000);

})();