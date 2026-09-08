/* ============================================================
   EdCloud Venture Partners — site behaviour
   Progressive enhancement only: every page works with JS off.
   ============================================================ */
(function () {
  'use strict';

  /* --- Sticky header rule --- */
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
    var href = a.getAttribute('href').split('#')[0].replace(/\.html$/, '');
    if (href.length > 1) href = href.replace(/\/$/, '');
    if (href && href === path) a.setAttribute('aria-current', 'page');
  });

  /* --- Forms: POST JSON to the Worker; fall back to a plain form post without JS --- */
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  function wire(form, defaults) {
    if (!form) return;
    var status = form.querySelector('[data-status]');
    var submit = form.querySelector('button[type="submit"]');
    var show = function (ok, msg) {
      if (!status) return;
      status.textContent = msg;
      status.className = status.getAttribute('data-status') + ' ' + (ok ? 'is-ok' : 'is-err');
      if (status.focus) status.focus();
    };
    var validate = function () {
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (el) {
        var err = el.parentElement.querySelector('.field__error');
        var bad = el.type === 'checkbox' ? !el.checked : (!el.value.trim() || (el.type === 'email' && !EMAIL_RE.test(el.value)));
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (err) err.textContent = bad ? (el.type === 'email' ? 'Please enter a valid email address.' : el.type === 'checkbox' ? 'Please confirm.' : 'This field is required.') : '';
        if (bad) ok = false;
      });
      return ok;
    };
    // No-JS fallback: the Worker redirects back with ?sent=1 or ?error=… and a hash naming the form
    var q = new URLSearchParams(location.search);
    if (location.hash === '#' + form.id || (form.id === 'contact-form' && location.hash === '#contact')) {
      if (q.get('sent')) show(true, defaults.ok);
      else if (q.get('error')) show(false, q.get('error'));
    }
    form.addEventListener('submit', function (e) {
      if (!window.fetch) return;
      e.preventDefault();
      if (status) status.className = status.getAttribute('data-status');
      if (!validate()) { show(false, 'Please fix the highlighted fields.'); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      submit.disabled = true; var label = submit.textContent; submit.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, msg: j.message }; }); })
        .then(function (r) { show(r.ok, r.msg || (r.ok ? defaults.ok : defaults.err)); if (r.ok) form.reset(); })
        .catch(function () { show(false, defaults.err); })
        .then(function () { submit.disabled = false; submit.textContent = label; });
    });
  }
  wire(document.getElementById('contact-form'), { ok: 'Thanks — we got your message and will be in touch shortly.', err: 'We couldn’t send that. Please try again, or email info@edcloud.org.' });
  wire(document.getElementById('subscribe-form'), { ok: 'Thanks — you’re on the list.', err: 'We couldn’t save that right now. Please try again later.' });

  /* --- Footer year --- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
