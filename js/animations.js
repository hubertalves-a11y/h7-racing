(function () {

  // ── 1. Race card track — bidirecional ────────────────────
  // Sequência: ponto vermelho aparece → path desenha a partir dele
  function initTrack() {
    var path = document.querySelector('.race-card .track svg path');
    var dot  = document.querySelector('.race-card .track svg circle');
    var card = document.querySelector('.race-card');
    if (!path || !card) return;

    var len = path.getTotalLength();
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;
    path.style.transition = 'none';
    if (dot) { dot.style.opacity = '0'; dot.style.transition = 'none'; }

    var pathTimer = null;

    var observer = new IntersectionObserver(function (entries) {
      var isIn = entries[0].isIntersecting;
      clearTimeout(pathTimer);

      if (isIn) {
        // 1. ponto aparece primeiro
        if (dot) {
          dot.style.transition = 'opacity 0.35s ease';
          dot.style.opacity = '1';
        }
        // 2. path começa a desenhar após o ponto estar visível
        pathTimer = setTimeout(function () {
          path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';
          path.style.strokeDashoffset = '0';
        }, 450);
      } else {
        path.style.transition = 'stroke-dashoffset 0.25s ease';
        path.style.strokeDashoffset = len;
        if (dot) { dot.style.transition = 'opacity 0.2s ease'; dot.style.opacity = '0'; }
      }
    }, { threshold: 0.5 });

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

    corners.forEach(function (c) {
      c.style.opacity    = '0';
      c.style.transform  = 'translateY(8px)';
      c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    var cornerTimers = [];

    // Observer 1: caption — dispara quando o próprio caption é 60% visível
    if (caption) {
      var capObserver = new IntersectionObserver(function (entries) {
        var isIn = entries[0].isIntersecting;
        caption.classList.remove('anim-in');
        if (isIn) {
          void caption.offsetWidth;
          caption.classList.add('anim-in');
        }
      }, { threshold: 0.6 });
      capObserver.observe(caption);
    }

    // Observer 2: corners — dispara quando 40% da seção está visível
    var cornObserver = new IntersectionObserver(function (entries) {
      var isIn = entries[0].isIntersecting;
      cornerTimers.forEach(clearTimeout);
      cornerTimers = [];
      corners.forEach(function (c, i) {
        if (isIn) {
          cornerTimers.push(setTimeout(function () {
            c.style.opacity   = '1';
            c.style.transform = 'translateY(0)';
          }, 300 + i * 150));
        } else {
          c.style.opacity   = '0';
          c.style.transform = 'translateY(8px)';
        }
      });
    }, { threshold: 0.4 });
    cornObserver.observe(section);
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
    }, { threshold: 0.4 });

    observer.observe(section);
  }

  // ── 5. Career Milestones cards — stagger fade-in ─────────
  function initMilestones() {
    var cards = Array.from(document.querySelectorAll('.ms-card'));
    if (!cards.length) return;

    var observer = new IntersectionObserver(function (obs) {
      obs.forEach(function (ob, i) {
        if (ob.isIntersecting) {
          var delay = (Array.from(cards).indexOf(ob.target) % 4) * 80;
          setTimeout(function () { ob.target.classList.add('ms-in'); }, delay);
          observer.unobserve(ob.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach(function (c) { observer.observe(c); });
  }

  // ── 6. Lang toggle PT / EN ────────────────────────────────
  function initLang() {
    var btn = document.getElementById('langToggle');
    if (!btn) return;

    var lang = 'en';
    var els  = Array.from(document.querySelectorAll('[data-pt]'));

    // cache English markup on first run
    els.forEach(function (el) {
      el.setAttribute('data-en', el.innerHTML.trim());
    });

    function apply(l) {
      els.forEach(function (el) {
        el.innerHTML = l === 'pt' ? el.getAttribute('data-pt') : el.getAttribute('data-en');
      });
      btn.textContent = l === 'pt' ? 'EN' : 'PT';
      btn.classList.toggle('lang-pt', l === 'pt');
    }

    btn.addEventListener('click', function () {
      lang = lang === 'en' ? 'pt' : 'en';
      apply(lang);
    });
  }

  // ── Run ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initTrack();
    initOnScribble();
    initCockpit();
    initCounter();
    initMilestones();
    initLang();
  });

})();
