 (function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- theme toggle ---------- */
  function readTheme() { try { return localStorage.getItem('ua-theme'); } catch (e) { return null; } }
  function saveTheme(v) { try { localStorage.setItem('ua-theme', v); } catch (e) { /* storage unavailable */ } }
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  var saved = readTheme();
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      saveTheme(next);
    });
  }

  /* ---------- mobile menu ---------- */
  var header = document.querySelector('.site-header');
  var menuBtn = document.getElementById('menu-btn');
  function setMenu(open) {
    header.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('open')); });

  /* ---------- smooth anchor scrolling ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = id === 'top' ? document.body : document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      if (id === 'top') { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }
      else { target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
    });
  });

  /* ---------- scroll progress ---------- */
  var bar = document.getElementById('progress');
  var ticking = false;
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
          el.style.transitionDelay = Math.min(idx, 6) * 70 + 'ms';
          el.classList.add('in');
          setTimeout(function () { el.style.transitionDelay = ''; }, 1400);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- active nav link ---------- */
  var links = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && links[entry.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          links[entry.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['about', 'skills', 'work', 'education', 'contact'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) navIO.observe(s);
    });
  }

  /* ---------- count-up numbers ---------- */
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(end) || reduceMotion) return;
    var start = null;
    var dur = 1100;
    el.textContent = '0';
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(end * eased));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- typewriter ---------- */
  var typed = document.getElementById('typed');
  var phrases = ['responsive websites', 'mobile applications', 'REST-powered interfaces', 'efficient C++ solutions'];
  if (typed && !reduceMotion) {
    var pi = 0, ci = phrases[0].length, deleting = true;
    var tick = function () {
      var word = phrases[pi];
      typed.textContent = word.slice(0, ci);
      var delay = deleting ? 38 : 85;
      if (!deleting && ci === word.length) { deleting = true; delay = 1700; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 300; }
      else { ci += deleting ? -1 : 1; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2000);
  }

  /* ---------- hero spotlight + portrait tilt ---------- */
  var hero = document.getElementById('hero');
  var portrait = document.getElementById('portrait');
  if (finePointer && !reduceMotion && hero) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (portrait) {
        var pr = portrait.getBoundingClientRect();
        var dx = (e.clientX - (pr.left + pr.width / 2)) / (pr.width * 1.5);
        var dy = (e.clientY - (pr.top + pr.height / 2)) / (pr.height * 1.5);
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));
        portrait.style.transform = 'rotateY(' + (dx * 7).toFixed(2) + 'deg) rotateX(' + (-dy * 7).toFixed(2) + 'deg)';
      }
    });
    hero.addEventListener('pointerleave', function () { if (portrait) portrait.style.transform = ''; });
  }

  /* ---------- copy phone number ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  var copyBtn = document.getElementById('copy-phone');
  var phoneText = document.getElementById('phone-text');
  if (copyBtn && phoneText) {
    copyBtn.addEventListener('click', function () {
      var number = '03175302266';
      function fallback() {
        var range = document.createRange();
        range.selectNodeContents(phoneText);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        showToast('Number selected, press copy');
      }
      try {
        navigator.clipboard.writeText(number).then(function () { showToast('Number copied'); }, fallback);
      } catch (e) { fallback(); }
    });
  }

  /* ---------- footer year ---------- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
