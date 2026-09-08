/* ============================================================
   EdCloud Venture Partners — site behaviour
   Progressive enhancement only: every page works with JS off.
   ============================================================ */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  /* --- Sticky header shadow --- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Mobile nav --- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      links.classList.toggle('is-open', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    window.matchMedia('(min-width: 56.01rem)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
  }

  /* --- Mark the current page in the nav --- */
  var path = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (path.length > 1) path = path.replace(/\/$/, '');
  document.querySelectorAll('.nav__links a[href]').forEach(function (a) {
    var href = a.getAttribute('href').replace(/\.html$/, '');
    if (href.length > 1) href = href.replace(/\/$/, '');
    if (href === path) a.setAttribute('aria-current', 'page');
  });

  /* --- Reveal on scroll --- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --- Contact form (POSTs JSON to /api/contact; falls back to a plain form post) --- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form__status');
    var submit = form.querySelector('button[type="submit"]');
    var show = function (ok, msg) {
      status.textContent = msg;
      status.className = 'form__status ' + (ok ? 'is-ok' : 'is-err');
      status.focus && status.focus();
    };
    var validate = function () {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (el) {
        var err = el.parentElement.querySelector('.field__error');
        var bad = !el.value.trim() || (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (err) err.textContent = bad ? (el.type === 'email' ? 'Please enter a valid email address.' : 'This field is required.') : '';
        if (bad) ok = false;
      });
      return ok;
    };
    // No-JS fallback: the Worker redirects back here with ?sent=1 or ?error=…
    var q = new URLSearchParams(location.search);
    if (q.get('sent')) show(true, 'Thanks — we got your message and will be in touch shortly.');
    else if (q.get('error')) show(false, q.get('error'));
    form.addEventListener('submit', function (e) {
      if (!window.fetch) return; // plain post fallback
      e.preventDefault();
      status.className = 'form__status';
      if (!validate()) { show(false, 'Please fix the highlighted fields.'); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      submit.disabled = true; var label = submit.textContent; submit.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, msg: j.message }; }); })
        .then(function (r) { show(r.ok, r.msg || (r.ok ? 'Thanks — we got your message and will be in touch shortly.' : 'Something went wrong. Please try again or email us directly.')); if (r.ok) form.reset(); })
        .catch(function () { show(false, 'We couldn’t send that. Please try again, or email us directly.'); })
        .then(function () { submit.disabled = false; submit.textContent = label; });
    });
  }

  /* --- Footer year --- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
