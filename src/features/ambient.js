/* ambient — animated canvas backgrounds behind an element's content.
   <section class="efx-ambient" data-efx-mode="orbs" data-efx-color="#6366f1|#ec4899">…</section>
   mode: stars | warp | orbs | waves | snow | leaves | bubbles | grid | flicker | meteors. color: one value or a '|' list (commas outside parentheses ok). */
import { onVisible, motionOK, finePointer, themeColor, on, add, get } from '../core.js';

const split = s => {
  const out = []; let d = 0, cur = '';
  for (const ch of String(s)) {
    if (ch === '(') d++; else if (ch === ')') d = Math.max(0, d - 1);
    if ((ch === '|' || ch === ',') && !d) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map(c => c.trim()).filter(Boolean);
};
/* one shared document visibilitychange listener for every instance */
const visSubs = new Set();
let visOff = null;
const onDocVis = () => visSubs.forEach(fn => fn(document.hidden));
const subVis = fn => {
  visSubs.add(fn);
  if (!visOff) visOff = on(document, 'visibilitychange', onDocVis);
  return () => { visSubs.delete(fn); if (!visSubs.size && visOff) { visOff(); visOff = null; } };
};
/* Modes: add('ambient-mode', name, { count(area) -> n, spawn(p, S, first), step(p, S) -> alive?, draw(ctx, p, S), blend?, ptr? })
   p = your particle (feature sets p.c color, p.i index); S = { w, h, t, sp, op, px, py, ptr:{x,y,on}, rnd(a,b) }. step false = respawn. */
const cnt = (div, max) => a => Math.max(3, Math.min(max, (a / div) | 0));
const fx = (r0, r1, bot, rf) => (p, S, first) => {
  p.a = S.rnd(0, 6.28); p.x = S.rnd(0, S.w); p.y = first ? S.rnd(0, S.h) : bot ? S.h + 20 : -20;
  p.r = rf ? S.rnd(r0, r1) * Math.max(S.w, S.h) : S.rnd(r0, r1); p.v = S.rnd(.4, 1.2);
};
const dot = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 6.2832); };
const fall = (up, leaf) => (p, S) => {
  p.y += (up ? -p.v * 1.2 : p.v * (leaf ? 1 : p.r * .4 + .3)) * S.sp;
  p.x += Math.sin(S.t * p.v + p.a) * (leaf ? 1 : .4) * S.sp;
  if (leaf) p.a += .02 * p.v * S.sp;
  return up ? p.y > -p.r * 2 : p.y < S.h + 20;
};
add('ambient-mode', {
  stars: {
    count: cnt(5e3, 200), ptr: 1, spawn: fx(.6, 2.4), step: () => 1,
    draw: (c, p, S) => { c.globalAlpha = S.op * (.55 + .45 * Math.sin(S.t * 2 * p.v + p.a)); dot(c, p.x - S.px * p.r * 12, p.y - S.py * p.r * 12, p.r); c.fill(); },
  },
  warp: {
    count: cnt(8e3, 160), ptr: 1,
    spawn: (p, S, first) => { fx(.6, 2.4)(p, S, first); p.x = S.rnd(-1, 1); p.y = S.rnd(-1, 1); p.z = first ? S.rnd(.05, 1) : 1; },
    step: (p, S) => (p.z -= .006 * S.sp * p.v) >= .03,
    draw: (c, p, S) => {
      const f = S.w * .3, cx = S.w / 2 + S.px * S.w * .3, cy = S.h / 2 + S.py * S.h * .3, z2 = Math.min(1, p.z + .04 * S.sp);
      c.globalAlpha = S.op * (1 - p.z); c.lineWidth = Math.max(.5, 1.6 * (1 - p.z)); c.lineCap = 'round';
      c.beginPath(); c.moveTo(cx + p.x / z2 * f, cy + p.y / z2 * f); c.lineTo(cx + p.x / p.z * f, cy + p.y / p.z * f); c.stroke();
    },
  },
  orbs: {
    count: cnt(1e5, 6), ptr: 1, blend: 'lighter',
    spawn: (p, S, first) => { fx(.25, .45, 0, 1)(p, S, first); p.y = S.rnd(0, S.h); p.vx = S.rnd(-.3, .3); p.vy = S.rnd(-.3, .3); },
    step: (p, S) => {
      if (S.ptr.on) { p.vx += (S.ptr.x - p.x) * 2e-6; p.vy += (S.ptr.y - p.y) * 2e-6; }
      p.vx *= .998; p.vy *= .998; p.x += p.vx * S.sp; p.y += p.vy * S.sp;
      if (p.x < -p.r * .3 || p.x > S.w + p.r * .3) p.vx *= -1;
      if (p.y < -p.r * .3 || p.y > S.h + p.r * .3) p.vy *= -1;
      return 1;
    },
    draw: (c, p, S) => {
      const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, p.c); g.addColorStop(1, 'transparent');
      c.globalAlpha = S.op * .55; c.fillStyle = g; dot(c, p.x, p.y, p.r); c.fill();
    },
  },
  waves: {
    count: () => 3, step: () => 1, spawn: fx(0, 1),
    draw: (c, p, S) => {
      const { w, h } = S, i = p.i, base = h * (.55 + i * .12), amp = h * .06 * (1 + p.v * .5);
      c.globalAlpha = S.op * (.22 + i * .08); c.beginPath(); c.moveTo(0, h);
      for (let x = 0; x <= w + 8; x += 8) c.lineTo(x, base + Math.sin(x / w * (3 + i) * 2 + S.t * p.v + p.a) * amp + Math.sin(x / w * 7 - S.t * .7 * p.v) * amp * .3);
      c.lineTo(w, h); c.fill();
    },
  },
  snow: { count: cnt(9e3, 120), spawn: fx(.6, 2.4), step: fall(), draw: (c, p, S) => { c.globalAlpha = S.op; dot(c, p.x, p.y, p.r); c.fill(); } },
  leaves: {
    count: cnt(3e4, 25), spawn: fx(5, 11), step: fall(0, 1),
    draw: (c, p, S) => { c.globalAlpha = S.op * .85; c.beginPath(); c.ellipse(p.x, p.y, p.r, p.r * .45, p.a, 0, 6.2832); c.fill(); },
  },
  bubbles: {
    count: cnt(16e3, 40), spawn: fx(3, 14, 1), step: fall(1),
    draw: (c, p, S) => {
      c.globalAlpha = S.op * .5; c.lineWidth = 1; dot(c, p.x, p.y, p.r); c.stroke();
      c.globalAlpha = S.op * .6; dot(c, p.x - p.r * .35, p.y - p.r * .35, p.r * .2); c.fill();
    },
  },
});

/* grid / flicker: a field of cells sized to the area; meteors: diagonal streaks */
const cell = a => Math.max(14, Math.sqrt(a / 1200));
const cells = a => { const c = cell(a); return Math.ceil(a / (c * c) + 2 * Math.sqrt(a) / c + 2); };
const place = (p, S) => { const c = cell(S.w * S.h), n = Math.ceil(S.w / c) || 1; p.s = c; p.x = (p.i % n) * c; p.y = ((p.i / n) | 0) * c; p.l = 0; p.k = S.rnd(0, 1); };
add('ambient-mode', {
  grid: {
    count: cells, ptr: 1, spawn: place,
    step: (p, S) => { const q = S.ptr, d = Math.hypot(q.x - p.x - p.s / 2, q.y - p.y - p.s / 2); p.l = q.on && d < 110 ? Math.max(p.l, 1 - d / 110) : p.l * .93; return 1; },
    draw: (c, p, S) => { if (p.y > S.h) return; c.globalAlpha = S.op * .12; c.lineWidth = 1; c.strokeRect(p.x + .5, p.y + .5, p.s - 1, p.s - 1); if (p.l > .02) { c.globalAlpha = S.op * p.l * .7; c.fillRect(p.x + 1, p.y + 1, p.s - 2, p.s - 2); } },
  },
  flicker: {
    count: cells, spawn: place,
    step: (p, S) => { if (Math.random() < .012 * S.sp) p.k = Math.random() < .35 ? S.rnd(.4, 1) : 0; p.l += (p.k - p.l) * .15; return 1; },
    draw: (c, p, S) => { if (p.y > S.h) return; c.globalAlpha = S.op * (.04 + p.l * .8); c.fillRect(p.x + 1, p.y + 1, p.s - 2, p.s - 2); },
  },
  meteors: {
    count: cnt(2e4, 14), step: (p, S) => { p.x -= p.v * .7 * S.sp; p.y += p.v * .7 * S.sp; return p.y < S.h + 60 && p.x > -60; },
    spawn: (p, S, first) => { p.v = S.rnd(4, 9); p.l = S.rnd(60, 140); p.x = S.rnd(0, S.w + S.h); p.y = first ? S.rnd(-S.h, S.h) : -S.rnd(20, 400); },
    draw: (c, p, S) => {
      const t = p.l * .7, g = c.createLinearGradient(p.x, p.y, p.x + t, p.y - t);
      g.addColorStop(0, p.c); g.addColorStop(1, 'transparent');
      c.globalAlpha = S.op; c.strokeStyle = g; c.lineWidth = 1.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + t, p.y - t); c.stroke();
    },
  },
});

export default {
  name: 'ambient',
  selector: '.efx-ambient',
  lazy: true,
  defaults: { mode: 'stars', count: 0, color: '', speed: 1, opacity: 1, interact: true },
  init(el, o) {
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    const cv = document.createElement('canvas');
    cv.className = 'efx-ambient__canvas';
    cv.setAttribute('aria-hidden', 'true');
    el.insertBefore(cv, el.firstChild);
    const ctx = cv.getContext('2d');
    const M = get('ambient-mode', o.mode) || get('ambient-mode', 'stars');
    const motion = motionOK();
    const colors = o.color ? split(o.color) : [];
    if (!colors.length) colors.push(themeColor(el));
    let w = 0, h = 0, ps = [], raf = 0, vis = true, hidden = document.hidden;
    const S = { w: 0, h: 0, t: 0, sp: o.speed, op: o.opacity, px: 0, py: 0, ptr: { x: 0, y: 0, on: 0 }, rnd: (a, b) => a + Math.random() * (b - a) };
    const ptr = S.ptr;
    const spawn = (p, first) => { p.c = colors[(Math.random() * colors.length) | 0]; M.spawn(p, S, first); return p; };
    const seed = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = S.w = el.clientWidth; h = S.h = el.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = o.count ? Math.min(600, Math.max(0, o.count | 0)) : M.count(w * h);
      ps = Array.from({ length: n }, (_, i) => spawn({ i }, 1));
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = M.blend || 'source-over';
      S.px = ptr.on ? (ptr.x - w / 2) / w : 0; S.py = ptr.on ? (ptr.y - h / 2) / h : 0;
      for (const p of ps) { ctx.globalAlpha = o.opacity; ctx.fillStyle = ctx.strokeStyle = p.c; M.draw(ctx, p, S); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    };
    const step = () => {
      raf = 0; S.t += .016 * S.sp;
      for (const p of ps) if (!M.step(p, S)) spawn(p);
      draw(); go();
    };
    const go = () => { if (motion && vis && !hidden && !raf) raf = requestAnimationFrame(step); };

    const offs = [];
    seed();
    if (motion) {
      offs.push(onVisible(el, v => { vis = v; if (v) go(); else { cancelAnimationFrame(raf); raf = 0; } }));
      offs.push(subVis(hd => { hidden = hd; if (hd) { cancelAnimationFrame(raf); raf = 0; } else go(); }));
      if (o.interact && finePointer() && M.ptr) {
        let rect = null;
        const stale = () => { rect = null; };
        offs.push(on(el, 'pointermove', e => {
          const r = rect || (rect = el.getBoundingClientRect());
          ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = 1;
        }));
        offs.push(on(el, 'pointerleave', () => { ptr.on = 0; rect = null; }));
        offs.push(on(window, 'scroll', stale, { passive: true, capture: true }), on(window, 'resize', stale, { passive: true }));
      }
    }
    let ro;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(() => { if (el.clientWidth !== w || el.clientHeight !== h) seed(); }); ro.observe(el); }

    return () => {
      cancelAnimationFrame(raf); raf = 0; vis = false;
      offs.forEach(f => f()); ro && ro.disconnect();
      cv.remove();
      if (restorePos) el.style.position = '';
    };
  },
};
