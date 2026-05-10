(function () {

  // ── 1. Race card track — bidirecional ────────────────────
  function initTrack() {
    var path = document.querySelector('.race-card .track svg path');
    var dot  = document.querySelector('.race-card .track svg circle');
    var card = document.querySelector('.race-card');
    if (!path || !card) return;

    var len = path.getTotalLength();
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;
    if (dot) { dot.style.opacity = '0'; }

    var dotTimer = null;

    var observer = new IntersectionObserver(function (entries) {
      var isIn = entries[0].isIntersecting;
      clearTimeout(dotTimer);

      if (isIn) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1) 0.4s';
            path.style.strokeDashoffset = '0';
            if (dot) {
              dot.style.transition = 'opacity 0.5s ease';
              dotTimer = setTimeout(function () { dot.style.opacity = '1'; }, 2300);
            }
          });
        });
      } else {
        path.style.transition = 'stroke-dashoffset 0.3s ease';
        path.style.strokeDashoffset = len;
        if (dot) { dot.style.transition = 'none'; dot.style.opacity = '0'; }
      }
    }, { threshold: 0.4 });

    observer.observe(card);
  }

  // ── 2. ON scribble — bidirecional ─────────────────────────
  function initOnScribble() {
    var scribbleSvg = document.querySelector('.onoff-h.on .scribble svg');
    var section     = document.querySelector('.section-onoff');
    if (!scribbleSvg || !section) return;

    var paths   = Array.from(scribbleSvg.querySelectorAll('path'));
    var lengths = paths.map(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray  = len;
      p.style.strokeDashoffset = len;
      return len;
    });

    // sem disconnect — observer fica ativo para entrada e saída
    var observer = new IntersectionObserver(function (entries) {
      var isIn = entries[0].isIntersecting;
      paths.forEach(function (p, i) {
        var len   = lengths[i];
        var speed = Math.max(0.5, len / 100).toFixed(2);
        var delay = isIn ? (i * 0.2 + 0.15).toFixed(2) : '0';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            p.style.transition = isIn
              ? 'stroke-dashoffset ' + speed + 's cubic-bezier(0.4,0,0.2,1) ' + delay + 's'
              : 'stroke-dashoffset 0.35s ease';
            p.style.strokeDashoffset = isIn ? '0' : len;
          });
        });
      });
    }, { threshold: 0.35 });

    observer.observe(section);
  }

  // ── 3. Cockpit — EYES + corners bidirecional ──────────────
  function initCockpit() {
    var section = document.querySelector('.section-cockpit');
    var corners = Array.from(document.querySelectorAll('.cockpit-corner'));
    var caption = document.querySelector('.cockpit-caption');
    if (!section) return;

    // estado inicial dos corners
    corners.forEach(function (c) {
      c.style.opacity    = '0';
      c.style.transform  = 'translateY(8px)';
      c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    var cornerTimers = [];

    var observer = new IntersectionObserver(function (entries) {
      var isIn = entries[0].isIntersecting;

      // EYES: remove a classe, força reflow, re-adiciona para reiniciar animação CSS
      if (caption) {
        caption.classList.remove('anim-in');
        if (isIn) {
          void caption.offsetWidth; // força reflow para reiniciar keyframes
          caption.classList.add('anim-in');
        }
      }

      // cancela timers anteriores dos corners
      cornerTimers.forEach(clearTimeout);
      cornerTimers = [];

      corners.forEach(function (c, i) {
        if (isIn) {
          cornerTimers.push(setTimeout(function () {
            c.style.opacity   = '1';
            c.style.transform = 'translateY(0)';
          }, 500 + i * 150));
        } else {
          c.style.opacity   = '0';
          c.style.transform = 'translateY(8px)';
        }
      });
    // rootMargin empurra o gatilho para baixo: só dispara quando
    // a seção está bem visível (caption já entrou na tela)
    }, { threshold: 0, rootMargin: '0px 0px -38% 0px' });

    observer.observe(section);
  }

  // ── 4. Contador "07" — bidirecional ──────────────────────
  function initCounter() {
    var el      = document.querySelector('.cockpit-corner.tl .k');
    var section = document.querySelector('.section-cockpit');
    if (!el || !section) return;

    var target = 7;
    var rafId  = null;
    var timer  = null;

    function runCounter() {
      if (rafId) cancelAnimationFrame(rafId);
      var duration = 1600;
      var startTs  = null;
      function step(ts) {
        if (!startTs) startTs = ts;
        var progress = Math.min((ts - startTs) / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3);
        var value    = Math.round(eased * target);
        el.textContent = value < 10 ? '0' + value : '' + value;
        if (progress < 1) rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      var isIn = entries[0].isIntersecting;
      if (isIn) {
        timer = setTimeout(runCounter, 400);
      } else {
        clearTimeout(timer);
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        el.textContent = '00';
      }
    }, { threshold: 0, rootMargin: '0px 0px -38% 0px' });

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
