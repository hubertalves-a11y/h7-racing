/**
 * Hero background video — smooth loop fade.
 * Reads the video to LOOP_AT seconds, then fades to black and loops back.
 * Driven by both timeupdate and rAF for maximum smoothness.
 */
(function () {
  var v    = document.getElementById('bgVideo');
  var fade = document.getElementById('bgFade');
  if (!v || !fade) return;

  var LOOP_AT  = 5;    // loop point in seconds
  var FADE_IN  = 1.2;  // fade-in duration after each loop
  var FADE_OUT = 1.6;  // fade-out duration before loop
  var MAX_OP   = 0.55; // never fully black — keeps motion visible

  function easeInOut(x) { return x * x * (3 - 2 * x); }

  function tick() {
    var t = v.currentTime;
    var op = 0;

    if (t < FADE_IN) {
      var k = 1 - (t / FADE_IN);
      op = easeInOut(Math.max(0, Math.min(1, k))) * MAX_OP;
    } else if (t > LOOP_AT - FADE_OUT) {
      var k2 = (t - (LOOP_AT - FADE_OUT)) / FADE_OUT;
      op = easeInOut(Math.max(0, Math.min(1, k2))) * MAX_OP;
    }

    fade.style.opacity = op.toFixed(3);

    if (t >= LOOP_AT) {
      v.currentTime = 0;
      v.play().catch(function () {});
    }
  }

  v.addEventListener('timeupdate', tick);

  // rAF loop for smoother fade between timeupdate events
  function loop() { tick(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);

  // ── Sound toggle ──────────────────────────────────────────
  var btn = document.getElementById('soundBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      var on = v.muted;        // if currently muted, we're turning sound ON
      v.muted = !on;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.querySelector('.icon-muted').style.display = on ? 'none' : '';
      btn.querySelector('.icon-sound').style.display = on ? '' : 'none';
    });
  }
})();
