/* =========================================================
   nav.js — left "sandwich" sidebar behaviour, shared by every page.
   Handles: mobile off-canvas open/close, backdrop click-to-close,
   Escape-to-close, and marking the current page's link active.
   ========================================================= */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var sidebar   = document.querySelector('.sidebar');
    var backdrop  = document.querySelector('.backdrop');
    var openBtns  = document.querySelectorAll('[data-nav-toggle]');

    function openNav() {
      sidebar.classList.add('open');
      backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function closeNav() {
      sidebar.classList.remove('open');
      backdrop.classList.remove('show');
      document.body.style.overflow = '';
    }
    function toggleNav() {
      sidebar.classList.contains('open') ? closeNav() : openNav();
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener('click', toggleNav);
    });
    if (backdrop) backdrop.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    // close the drawer automatically after a nav link is tapped (mobile)
    document.querySelectorAll('.sidebar-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 760) closeNav();
      });
    });

    // highlight the current page in the sidebar
    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-nav a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === current) link.classList.add('active');
    });
  });
})();
