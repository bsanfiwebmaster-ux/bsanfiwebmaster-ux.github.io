/* Bruno Sanfilippo: comportamiento de la web (sin librerías) */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var RM = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var L = { en: { send: 'Send message' } };
  var lang = root.lang === 'es' ? 'es' : 'en';

  /* ---------- menú lateral ---------- */
  var dr = $('.drawer'), bg = $('.burger');
  var lastFocus = null;
  function openMenu() {
    if (!dr) return;
    lastFocus = d.activeElement;
    dr.classList.add('on');
    bg.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { requestAnimationFrame(function () { dr.classList.add('open'); }); });
    var f = $('.x', dr); if (f) f.focus();
    d.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!dr || !dr.classList.contains('on')) return;
    dr.classList.remove('open');
    bg.setAttribute('aria-expanded', 'false');
    d.body.style.overflow = '';
    setTimeout(function () { dr.classList.remove('on'); }, RM ? 0 : 480);
    if (lastFocus) lastFocus.focus();
  }
  if (bg) bg.addEventListener('click', openMenu);
  if (dr) {
    $('.bd', dr).addEventListener('click', closeMenu);
    $('.x', dr).addEventListener('click', closeMenu);
    $$('nav a', dr).forEach(function (a) { a.addEventListener('click', closeMenu); });
  }
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); closeLb(); }
  });

  /* ---------- movimiento al hacer scroll ---------- */
  var ticking = false;
  var hid = [];
  function measure(init) {
    var y = w.scrollY || 0, vh = w.innerHeight || 800;
    var Wd = Math.max(w.innerWidth || 1440, 900);
    if (!RM) {
      var g1 = $('#sheen .g1'), g2 = $('#sheen .g2'), g3 = $('#sheen .g3');
      if (g1) g1.style.transform = 'translate3d(' + Math.round(Math.sin(y / 800) * 0.04 * Wd) + 'px,' + Math.round(y * 0.06) + 'px,0)';
      if (g2) g2.style.transform = 'translate3d(' + Math.round(Math.sin(y / 800) * 0.10 * Wd + y * 0.03) + 'px,' + Math.round(-y * 0.14) + 'px,0) rotate(' + (9 + Math.sin(y / 1000) * 3).toFixed(2) + 'deg)';
      if (g3) g3.style.transform = 'translate3d(' + Math.round(-(Math.sin(y / 900) * 0.10 * Wd + y * 0.025)) + 'px,' + Math.round(y * 0.10) + 'px,0) rotate(' + (-11 + Math.sin(y / 1200) * 3).toFixed(2) + 'deg)';
      $$('[data-px]').forEach(function (img) {
        var box = img.closest('[data-pxc]') || img.parentNode;
        var r = box.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        p = Math.max(-1, Math.min(1, p));
        img.style.transform = 'translate3d(0,' + Math.round(p * r.height * parseFloat(img.getAttribute('data-px'))) + 'px,0)';
      });
      $$('.cv').forEach(function (el) { el.style.transform = 'translate3d(0,' + (-Math.round(Math.min(y * 0.05, 70))) + 'px,0)'; });
      $$('[data-wave]').forEach(function (el) {
        var i = parseFloat(el.getAttribute('data-wave'));
        el.style.transform = 'translate3d(0,' + Math.round(Math.sin(y / 450 + i * 1.1) * 12) + 'px,0)';
      });
    }
    $$('.rv').forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      if (init) { if (top > vh * 0.92 && !RM) el.classList.add('h'); }
      else if (el.classList.contains('h') && top < vh * 0.88) el.classList.remove('h');
    });
  }
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; measure(false); });
  }
  measure(true);
  w.addEventListener('scroll', onScroll, { passive: true });
  w.addEventListener('resize', onScroll);
  w.addEventListener('load', function () { measure(false); });

  /* ---------- consentimiento de cookies y Google Analytics ---------- */
  var KEY = 'bs-consent';
  function getC() { try { return w.localStorage.getItem(KEY); } catch (e) { return null; } }
  function setC(v) { try { w.localStorage.setItem(KEY, v); } catch (e) {} }
  var ck = $('.ck');
  var gaLoaded = false;
  function loadGA() {
    var id = (d.documentElement.getAttribute('data-ga') || '').trim();
    if (gaLoaded || !id) return;
    gaLoaded = true;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () { w.dataLayer.push(arguments); };
    w.gtag('js', new Date());
    w.gtag('config', id, { anonymize_ip: true });
    var s = d.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    d.head.appendChild(s);
  }
  function hideCk() { if (!ck) return; ck.classList.remove('on'); setTimeout(function () { ck.hidden = true; }, RM ? 0 : 600); }
  function showCk() {
    if (!ck) return;
    ck.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { ck.classList.add('on'); }); });
  }
  if (ck) {
    $('[data-ck=accept]', ck).addEventListener('click', function () { setC('granted'); hideCk(); loadGA(); });
    $('[data-ck=reject]', ck).addEventListener('click', function () { setC('denied'); hideCk(); });
  }
  var c0 = getC();
  if (c0 === 'granted') loadGA();
  else if (!c0) setTimeout(showCk, RM ? 0 : 1200);
  $$('[data-ck-open]').forEach(function (b) { b.addEventListener('click', function () { showCk(); }); });

  /* ---------- correo visible solo a petición ---------- */
  $$('[data-mail]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var a = d.createElement('a');
      var addr = btn.getAttribute('data-u') + '@' + btn.getAttribute('data-d');
      a.href = 'mailto:' + addr; a.textContent = addr; a.className = 'mail-out';
      a.style.cssText = 'display:inline-flex;align-items:center;min-height:48px;margin-top:8px;border-bottom:1px solid var(--ac);font-size:clamp(19px,2.2vw,22px);overflow-wrap:anywhere';
      btn.parentNode.replaceChild(a, btn); a.focus();
    });
  });
  $$('[data-mail-inline]').forEach(function (el) {
    var addr = el.getAttribute('data-u') + '@' + el.getAttribute('data-d');
    el.innerHTML = '<a href="mailto:' + addr + '" style="border-bottom:1px solid var(--ac)">' + addr + '</a>';
  });

  /* ---------- formulario de contacto (Netlify Forms) ---------- */
  var form = $('#contact-form');
  if (form) {
    var msgs = JSON.parse(form.getAttribute('data-msgs'));
    var fields = [['name', 'f-name', function (v) { return v.trim().length > 1; }],
      ['mail', 'f-mail', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }],
      ['msg', 'f-msg', function (v) { return v.trim().length > 1; }]];
    var setErr = function (k, t) { var e = $('#e-' + k); if (e) e.textContent = t || ''; };
    $$('textarea.fld', form).forEach(function (t) {
      var fit = function () { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; };
      t.addEventListener('input', fit);
    });
    form.addEventListener('submit', function (ev) {
      var ok = true;
      fields.forEach(function (f) {
        var v = $('#' + f[1]).value;
        if (!f[2](v)) { setErr(f[0], msgs[f[0]]); ok = false; } else setErr(f[0], '');
      });
      var cs = $('#f-consent');
      if (!cs.checked) { setErr('consent', msgs.consent); ok = false; } else setErr('consent', '');
      if (!ok) { ev.preventDefault(); var first = $('.err:not(:empty)', form); if (first) { var inp = first.parentNode.querySelector('input,textarea'); if (inp) inp.focus(); } return; }
      if (!w.fetch) return; /* sin fetch: envío normal */
      ev.preventDefault();
      var btn = $('button[type=submit]', form); btn.disabled = true;
      var ep = form.getAttribute('data-endpoint');
      if (ep) { /* servicio externo de formularios (JSON) */
        w.fetch(ep, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
          .then(function (r) { return r.json(); })
          .then(function (j) { if (!j || !j.success) throw new Error('x'); w.location.href = form.getAttribute('data-sent'); })
          .catch(function () { btn.disabled = false; setErr('consent', msgs.fail); });
        return;
      }
      var body = new URLSearchParams(new FormData(form)).toString();
      w.fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) { if (!r.ok) throw new Error('x'); w.location.href = form.getAttribute('action'); })
        .catch(function () { btn.disabled = false; setErr('consent', msgs.fail); });
    });
  }

  /* ---------- galería ampliada ---------- */
  var lb = $('.lb'), items = $$('[data-lb]'), li = 0;
  var zs = 1, zx = 0, zy = 0, ptrs = {}, pd0 = 0, zs0 = 1, lastTap = 0, mv = 0, sx0 = 0, sy0 = 0;
  function lbImg() { return $('img', lb); }
  function pts() { return Object.keys(ptrs).map(function (k) { return ptrs[k]; }); }
  function clampZ() {
    var im = lbImg(), mx = Math.max(0, (im.offsetWidth * zs - lb.clientWidth) / 2), my = Math.max(0, (im.offsetHeight * zs - lb.clientHeight) / 2);
    zx = Math.min(mx, Math.max(-mx, zx)); zy = Math.min(my, Math.max(-my, zy));
    if (zs <= 1.01) { zs = 1; zx = 0; zy = 0; }
  }
  function applyZ() { clampZ(); lbImg().style.transform = zs === 1 ? '' : 'translate(' + zx + 'px,' + zy + 'px) scale(' + zs + ')'; lb.classList.toggle('zm', zs > 1); }
  function zoomAt(ns, cx, cy) {
    ns = Math.min(5, Math.max(1, ns));
    var px = cx - lb.clientWidth / 2, py = cy - lb.clientHeight / 2;
    zx = px - (px - zx) * ns / zs; zy = py - (py - zy) * ns / zs; zs = ns; applyZ();
  }
  function resetZ() { zs = 1; zx = 0; zy = 0; ptrs = {}; applyZ(); }
  function showLb(i) {
    li = (i + items.length) % items.length;
    var it = items[li];
    resetZ();
    $('img', lb).src = it.getAttribute('data-lb'); $('img', lb).alt = it.getAttribute('data-alt');
    $('.cp', lb).textContent = it.getAttribute('data-alt');
  }
  var vp = d.querySelector('meta[name=viewport]'), vp0 = vp ? vp.getAttribute('content') : '';
  function lockPage(on) { if (vp) vp.setAttribute('content', on ? vp0 + ',maximum-scale=1,user-scalable=no' : vp0); }
  function openLb(i) { lockPage(true); lb.classList.add('on'); showLb(i); d.body.style.overflow = 'hidden'; $('.cl', lb).focus(); }
  function closeLb() { if (!lb || !lb.classList.contains('on')) return; lb.classList.remove('on'); lockPage(false); resetZ(); d.body.style.overflow = ''; if (items[li]) items[li].focus(); }
  if (lb) {
    items.forEach(function (b, i) { b.addEventListener('click', function () { openLb(i); }); });
    $('.cl', lb).addEventListener('click', closeLb);
    $('.pv', lb).addEventListener('click', function () { showLb(li - 1); });
    $('.nx', lb).addEventListener('click', function () { showLb(li + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb && mv < 8) closeLb(); });
    /* zoom y desplazamiento dentro de la foto: pellizco, doble toque, rueda y arrastre */
    lb.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('button')) return;
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      var p = pts();
      if (p.length === 1) { mv = 0; sx0 = e.clientX; sy0 = e.clientY; }
      if (p.length === 2) { pd0 = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1; zs0 = zs; mv = 99; }
    });
    lb.addEventListener('pointermove', function (e) {
      var o = ptrs[e.pointerId]; if (!o) return;
      var dx = e.clientX - o.x, dy = e.clientY - o.y;
      o.x = e.clientX; o.y = e.clientY;
      var p = pts();
      if (p.length === 2) {
        var dd = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        zoomAt(zs0 * dd / pd0, (p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
      } else if (p.length === 1) {
        mv = Math.max(mv, Math.hypot(e.clientX - sx0, e.clientY - sy0));
        if (zs > 1) { zx += dx; zy += dy; applyZ(); }
      }
    });
    function up(e) {
      var o = ptrs[e.pointerId]; if (!o) return;
      delete ptrs[e.pointerId];
      if (pts().length) { var r = pts()[0]; sx0 = r.x; sy0 = r.y; mv = 99; return; }
      var dx = e.clientX - sx0, dy = e.clientY - sy0, onImg = e.target === lbImg();
      if (e.type === 'pointerup' && mv < 8 && onImg) {
        var t = Date.now();
        if (t - lastTap < 320) { if (zs > 1) { zs = 1; zx = 0; zy = 0; applyZ(); } else zoomAt(2.5, e.clientX, e.clientY); lastTap = 0; }
        else lastTap = t;
      } else if (e.type === 'pointerup' && zs === 1 && mv < 99 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        showLb(dx < 0 ? li + 1 : li - 1);
      }
    }
    lb.addEventListener('pointerup', up); lb.addEventListener('pointercancel', up);
    lb.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(zs * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY); }, { passive: false });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'ArrowLeft') showLb(li - 1); if (e.key === 'ArrowRight') showLb(li + 1);
    });
  }
})();
