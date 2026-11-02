/* ambient — animated canvas backgrounds behind an element's content.
   <section class="efx-ambient" data-efx-mode="orbs" data-efx-color="#6366f1|#ec4899">…</section>
   mode: stars | warp | orbs | waves | snow | leaves | bubbles. color: one value or a '|' list (commas outside parentheses ok). */
import { onVisible, motionOK, finePointer, themeColor, on } from '../core.js';

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
/* auto count per mode: [pixels per particle, max] */
const AUTO = { stars: [5e3, 200], warp: [8e3, 160], orbs: [1e5, 6], waves: [1e9, 3], snow: [9e3, 120], leaves: [3e4, 25], bubbles: [16e3, 40] };

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
    const mode = AUTO[o.mode] ? o.mode : 'stars';
    const motion = motionOK();
    const colors = o.color ? split(o.color) : [];
    if (!colors.length) colors.push(themeColor(el));
    const sp = o.speed;
    let w = 0, h = 0, ps = [], raf = 0, vis = true, hidden = document.hidden, t = 0;
    const ptr = { x: 0, y: 0, on: 0 };
    const rnd = (a, b) => a + Math.random() * (b - a);
    const spawn = (p, first) => {
      p.c = colors[(Math.random() * colors.length) | 0];
      p.a = rnd(0, 6.28);
      p.x = rnd(0, w); p.y = first ? rnd(0, h) : mode === 'bubbles' ? h + 20 : -20;
      p.r = mode === 'orbs' ? rnd(.25, .45) * Math.max(w, h) : mode === 'leaves' ? rnd(5, 11) : mode === 'bubbles' ? rnd(3, 14) : rnd(.6, 2.4);
      p.v = rnd(.4, 1.2);
      if (mode === 'warp') { p.x = rnd(-1, 1); p.y = rnd(-1, 1); p.z = first ? rnd(.05, 1) : 1; }
      if (mode === 'orbs') { p.y = rnd(0, h); p.vx = rnd(-.3, .3); p.vy = rnd(-.3, .3); }
      return p;
    };
    const seed = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = el.clientWidth; h = el.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const [div, max] = AUTO[mode];
      const n = o.count ? Math.min(600, Math.max(0, o.count | 0)) : Math.max(3, Math.min(max, (w * h / div) | 0));
      ps = Array.from({ length: n }, (_, i) => spawn({ i }, 1));
      draw();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = mode === 'orbs' ? 'lighter' : 'source-over';
      ctx.globalAlpha = o.opacity;
      const px = ptr.on ? (ptr.x - w / 2) / w : 0, py = ptr.on ? (ptr.y - h / 2) / h : 0;
      if (mode === 'waves') {
        ps.forEach((p, i) => {
          ctx.globalAlpha = o.opacity * (.22 + i * .08); ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.moveTo(0, h);
          const base = h * (.55 + i * .12), amp = h * .06 * (1 + p.v * .5);
          for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, base + Math.sin(x / w * (3 + i) * 2 + t * p.v + p.a) * amp + Math.sin(x / w * 7 - t * .7 * p.v) * amp * .3);
          ctx.lineTo(w, h); ctx.fill();
        });
      } else for (const p of ps) {
        ctx.fillStyle = ctx.strokeStyle = p.c;
        ctx.beginPath();
        if (mode === 'orbs') {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, p.c); g.addColorStop(1, 'transparent');
          ctx.globalAlpha = o.opacity * .55; ctx.fillStyle = g;
          ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        } else if (mode === 'warp') {
          const f = w * .3, cx = w / 2 + px * w * .3, cy = h / 2 + py * h * .3, z2 = Math.min(1, p.z + .04 * sp);
          ctx.globalAlpha = o.opacity * (1 - p.z);
          ctx.lineWidth = Math.max(.5, 1.6 * (1 - p.z)); ctx.lineCap = 'round';
          ctx.moveTo(cx + p.x / z2 * f, cy + p.y / z2 * f); ctx.lineTo(cx + p.x / p.z * f, cy + p.y / p.z * f);
          ctx.stroke(); continue;
        } else if (mode === 'stars') {
          ctx.globalAlpha = o.opacity * (.55 + .45 * Math.sin(t * 2 * p.v + p.a));
          ctx.arc(p.x - px * p.r * 12, p.y - py * p.r * 12, p.r, 0, 6.2832);
        } else if (mode === 'bubbles') {
          ctx.globalAlpha = o.opacity * .5; ctx.lineWidth = 1;
          ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.stroke();
          ctx.globalAlpha = o.opacity * .6; ctx.beginPath();
          ctx.arc(p.x - p.r * .35, p.y - p.r * .35, p.r * .2, 0, 6.2832);
        } else if (mode === 'leaves') {
          ctx.globalAlpha = o.opacity * .85;
          ctx.ellipse(p.x, p.y, p.r, p.r * .45, p.a, 0, 6.2832);
        } else ctx.arc(p.x, p.y, p.r, 0, 6.2832); /* snow */
        ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    };
    const step = () => {
      raf = 0; t += .016 * sp;
      for (const p of ps) {
        if (mode === 'warp') { p.z -= .006 * sp * p.v; if (p.z < .03) spawn(p); continue; }
        if (mode === 'orbs') {
          if (ptr.on) { p.vx += (ptr.x - p.x) * 2e-6; p.vy += (ptr.y - p.y) * 2e-6; }
          p.vx *= .998; p.vy *= .998;
          p.x += p.vx * sp; p.y += p.vy * sp;
          if (p.x < -p.r * .3 || p.x > w + p.r * .3) p.vx *= -1;
          if (p.y < -p.r * .3 || p.y > h + p.r * .3) p.vy *= -1;
          continue;
        }
        if (mode === 'stars') continue;
        const up = mode === 'bubbles';
        p.y += (up ? -p.v * 1.2 : p.v * (mode === 'leaves' ? 1 : p.r * .4 + .3)) * sp;
        p.x += Math.sin(t * p.v + p.a) * (mode === 'leaves' ? 1 : .4) * sp;
        if (mode === 'leaves') p.a += .02 * p.v * sp;
        if (up ? p.y < -p.r * 2 : p.y > h + 20) spawn(p);
      }
      draw(); go();
    };
    const go = () => { if (motion && vis && !hidden && !raf) raf = requestAnimationFrame(step); };

    const offs = [];
    seed();
    if (motion) {
      offs.push(onVisible(el, v => { vis = v; if (v) go(); else { cancelAnimationFrame(raf); raf = 0; } }));
      offs.push(subVis(hd => { hidden = hd; if (hd) { cancelAnimationFrame(raf); raf = 0; } else go(); }));
      if (o.interact && finePointer() && (mode === 'orbs' || mode === 'stars' || mode === 'warp')) {
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
