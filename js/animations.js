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

  // ── 3. Cockpit — EYES drop + corners fade ────────────────
  function initCockpit() {
    var section = document.querySelector('.section-cockpit');
    var corners = Array.from(document.querySelectorAll('.cockpit-corner'));
    var caption = document.querySelector('.cockpit-caption');
    if (!section) return;

    corners.forEach(function (c) {
      c.style.opacity   = '0';
      c.style.transform = 'translateY(8px)';
    });

    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();

      // CSS animations on EYES letters — just add the class
      if (caption) caption.classList.add('anim-in');

      // corners stagger after letters finish (~550ms)
      corners.forEach(function (c, i) {
        setTimeout(function () {
          c.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
          c.style.opacity    = '1';
          c.style.transform  = 'translateY(0)';
        }, 500 + i * 150);
      });
    }, { threshold: 0.2 });

    observer.observe(section);
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
    initCockpit();
    initCounter();
  });

})();
