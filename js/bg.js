/*
  Animated background (canvas) for both pages.
  - Ambient sparkle + drifting confetti
  - Firework bursts when user activates the intro scene (listens to `hny:toggle`)
*/

(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let w = 0, h = 0, dpr = 1;

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  const palette = [
    'rgba(255,210,122,0.90)',
    'rgba(255,184,77,0.85)',
    'rgba(255,255,255,0.75)',
    'rgba(255,45,65,0.70)'
  ];

  /** Ambient particles */
  const confetti = [];
  const sparkles = [];
  const fireworks = [];

  let activeMode = false;
  window.addEventListener('hny:toggle', (e) => {
    activeMode = !!(e && e.detail && e.detail.active);
  });

  // Seed sparkles
  for (let i = 0; i < 45; i++) {
    sparkles.push({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.8, 2.2),
      a: rand(0.15, 0.6),
      s: rand(0.003, 0.012) * (Math.random() < 0.5 ? -1 : 1)
    });
  }

  function spawnConfetti(n) {
    for (let i = 0; i < n; i++) {
      confetti.push({
        x: rand(0, w),
        y: rand(-h * 0.2, h),
        vx: rand(-0.15, 0.35),
        vy: rand(0.35, 1.25),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.06, 0.06),
        size: rand(4, 10),
        w: rand(4, 12),
        h: rand(2, 7),
        life: rand(2.5, 6.5),
        color: palette[(Math.random() * palette.length) | 0]
      });
    }
  }
  spawnConfetti(24);

  function spawnFireworkBurst() {
    const cx = rand(w * 0.18, w * 0.82);
    const cy = rand(h * 0.12, h * 0.52);
    const count = (activeMode ? 46 : 28);
    const base = activeMode ? 3.2 : 2.2;
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + rand(-0.08, 0.08);
      const sp = base * rand(0.7, 1.25);
      fireworks.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        r: rand(1.0, 2.2),
        a: 1,
        fade: rand(0.012, 0.020),
        g: rand(0.008, 0.016),
        color: palette[(Math.random() * palette.length) | 0]
      });
    }
  }

  let last = performance.now();
  let t = 0;
  let burstTimer = 0;

  function step(now) {
    const dt = clamp((now - last) / 1000, 0, 0.033);
    last = now;
    t += dt;

    ctx.clearRect(0, 0, w, h);

    // sparkles
    for (const s of sparkles) {
      s.a += s.s;
      if (s.a < 0.10 || s.a > 0.75) s.s *= -1;

      ctx.globalAlpha = s.a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // confetti
    if (confetti.length < (activeMode ? 70 : 45) && Math.random() < (activeMode ? 0.35 : 0.18)) {
      spawnConfetti(activeMode ? 3 : 2);
    }

    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.x += c.vx * 60 * dt;
      c.y += c.vy * 60 * dt;
      c.vy += 0.008 * 60 * dt;
      c.rot += c.vr * 60 * dt;
      c.life -= dt;

      // slight wind
      c.vx += Math.sin(t * 0.7 + c.y * 0.004) * 0.002;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.globalAlpha = clamp(c.life / 2, 0, 1);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();

      if (c.y > h + 40 || c.life <= 0 || c.x < -60 || c.x > w + 60) {
        confetti.splice(i, 1);
      }
    }
    ctx.globalAlpha = 1;

    // fireworks bursts
    burstTimer -= dt;
    const wantBurst = document.body.classList.contains('page-intro');
    if (wantBurst && burstTimer <= 0) {
      // ambient bursts even before active, but slower
      spawnFireworkBurst();
      burstTimer = activeMode ? rand(0.65, 1.10) : rand(1.35, 2.20);
    }

    // fireworks particles
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const p = fireworks[i];
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.vy += p.g * 60 * dt;
      p.a -= p.fade * 60 * dt;

      ctx.globalAlpha = clamp(p.a, 0, 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      if (p.a <= 0) fireworks.splice(i, 1);
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
})();
