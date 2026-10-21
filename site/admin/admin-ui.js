/* ============================================================
   لوحة التحكم — واجهة المستخدم
   - تبديل الوضع الليلي/النهاري
   - التنقل بين التبويبات (sidebar)
   - فتح/إغلاق القائمة الجانبية على الجوال
   - دالة showView() للاستخدام من dashboard.js
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1) تبديل الوضع الليلي / النهاري
     ========================================================== */
  (function initThemeToggle() {
    const THEME_KEY = 'meem-theme';
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') document.body.classList.add('dark-mode');
    else if (saved === 'light') document.body.classList.add('light-mode');

    updateIcon();

    toggleBtn.addEventListener('click', function () {
      const isDark = document.body.classList.contains('dark-mode');
      document.body.classList.toggle('dark-mode', !isDark);
      document.body.classList.toggle('light-mode', isDark);
      localStorage.setItem(THEME_KEY, !isDark ? 'dark' : 'light');
      updateIcon();
    });

    function updateIcon() {
      toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }
  })();

  /* ==========================================================
     2) التنقل بين التبويبات
     ========================================================== */
  (function initNavigation() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    if (!sidebar) return;

    /* فتح/إغلاق الشريط الجانبي على الجوال */
    if (menuToggle) {
      menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
      });
    }

    /* التنقل بين العروض */
    document.querySelectorAll('.nav-item').forEach(function (item) {
      item.addEventListener('click', function () {
        activateView(item.dataset.view);
        if (window.innerWidth <= 900) sidebar.classList.remove('open');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    function activateView(name) {
      document.querySelectorAll('.nav-item').forEach(function (i) {
        i.classList.toggle('active', i.dataset.view === name);
      });
      document.querySelectorAll('.view').forEach(function (v) {
        v.classList.toggle('active', v.dataset.view === name);
      });
    }

    /* إتاحة الدالة عالميًا لاستخدام dashboard.js عند الحاجة */
    window.showView = activateView;
  })();

})();