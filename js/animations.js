(function () {

  // ── 1. Race card track draw ───────────────────────────────
  function initTrack() {
    var path = document.querySelector('.race-card .track svg path');
    var dot  = document.querySelector('.race-card .track svg circle');
    if (!path) return;

    var len = path.getTotalLength();
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;
    if (dot) { dot.style.opacity = '0'; dot.style.transition = 'opacity 0.5s ease'; }

    // double rAF ensures the initial dashoffset is painted before transitioning
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1) 0.6s';
        path.style.strokeDashoffset = '0';
        if (dot) setTimeout(function () { dot.style.opacity = '1'; }, 2500);
      });
    });
  }

  // ── 2. ON scribble draw-in on scroll ─────────────────────
  function initOnScribble() {
    var scribbleSvg = document.querySelector('.onoff-h.on .scribble svg');
    var section     = document.querySelector('.section-onoff');
    if (!scribbleSvg || !section) return;

    var paths = Array.from(scribbleSvg.querySelectorAll('path'));
    paths.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray  = len;
      p.style.strokeDashoffset = len;
    });

    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      paths.forEach(function (p, i) {
        var len   = p.getTotalLength();
        var speed = Math.max(0.5, len / 100).toFixed(2);
        var delay = (i * 0.2 + 0.15).toFixed(2);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            p.style.transition = 'stroke-dashoffset ' + speed + 's cubic-bezier(0.4,0,0.2,1) ' + delay + 's';
            p.style.strokeDashoffset = '0';
          });
        });
      });
    }, { threshold: 0.35 });

    observer.observe(section);
  }

  // ── 3. Cockpit — scroll-driven reveal ────────────────────
  // Chrome/Edge 115+: CSS animation-timeline handles this natively (see main.css).
  // Safari fallback: manual rAF scroll listener with identical math.
  function initCockpitScrollFallback() {
    if (CSS.supports('animation-timeline', 'view()')) return;

    var section = document.querySelector('.section-cockpit');
    var img     = document.querySelector('.cockpit-img');
    var corners = Array.from(document.querySelectorAll('.cockpit-corner'));
    var caption = document.querySelector('.cockpit-caption');
    if (!section || !img) return;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    // set initial state
    Object.assign(img.style, {
      clipPath: 'inset(42% 0 42% 0)', filter: 'brightness(0.04) saturate(0)',
      transform: 'scale(1.12)', willChange: 'clip-path, filter, transform',
    });
    corners.forEach(function (c) { c.style.opacity = '0'; c.style.transform = 'translateY(10px)'; });
    if (caption) { caption.style.opacity = '0'; caption.style.transform = 'translateY(12px)'; }

    var cornersShown = false;
    var ticking      = false;

    function update() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var vh   = window.innerHeight;
      // 0 when section top hits viewport bottom → 1 when section top is 35% from top
      var p = easeOut(clamp((vh - rect.top) / (vh * 0.65), 0, 1));

      var clip = lerp(42, 0, p);
      img.style.clipPath  = 'inset(' + clip.toFixed(2) + '% 0 ' + clip.toFixed(2) + '% 0)';
      img.style.filter    = 'brightness(' + lerp(0.04, 1, p).toFixed(3) + ') saturate(' + p.toFixed(3) + ')';
      img.style.transform = 'scale(' + lerp(1.12, 1, p).toFixed(4) + ')';

      if (p > 0.55 && !cornersShown) {
        cornersShown = true;
        corners.forEach(function (c, i) {
          setTimeout(function () {
            c.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            c.style.opacity    = '1';
            c.style.transform  = 'translateY(0)';
          }, i * 130);
        });
        if (caption) setTimeout(function () {
          caption.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
          caption.style.opacity    = '1';
          caption.style.transform  = 'translateY(0)';
        }, 220);
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ── 4. "07" counter ──────────────────────────────────────
  function initCounter() {
    var el      = document.querySelector('.cockpit-corner.tl .k');
    var section = document.querySelector('.section-cockpit');
    if (!el || !section) return;

    var target  = 7;
    var started = false;

    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || started) return;
      started = true;
      observer.disconnect();

      var duration = 1600;
      var startTs  = null;
      function step(ts) {
        if (!startTs) startTs = ts;
        var progress = Math.min((ts - startTs) / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var value    = Math.round(eased * target);
        el.textContent = value < 10 ? '0' + value : '' + value;
        if (progress < 1) requestAnimationFrame(step);
      }
      // start slightly after section enters view
      setTimeout(function () { requestAnimationFrame(step); }, 400);
    }, { threshold: 0.15 });

    observer.observe(section);
  }

  // ── Run ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initTrack();
    initOnScribble();
    initCockpitScrollFallback();
    initCounter();
  });

})();
