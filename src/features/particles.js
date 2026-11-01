/* particles — drifting canvas particles behind an element's content.
   <section class="efx-particles" data-efx-links data-efx-interact="connect">…</section>
   color accepts one color or a list separated by '|' (or commas outside parentheses, so rgb()/hsl() work); interact: none | repel | attract | connect. */
import { onVisible, motionOK, finePointer, themeColor, on } from '../core.js';

/* split a color list on '|' or on commas that are not inside parentheses */
const splitColors = s => {
  const out = []; let depth = 0, cur = '';
  for (const ch of String(s)) {
    if (ch === '(') depth++; else if (ch === ')') depth = Math.max(0, depth - 1);
    if ((ch === '|' || ch === ',') && !depth) { out.push(cur); cur = ''; } else cur += ch;
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

export default {
  name: 'particles',
  selector: '.efx-particles',
  lazy: true,
  defaults: {
    count: 50, color: '', sizeMin: 1, sizeMax: 2.8, speed: 100, opacity: 1, links: false,
    linkDistance: 110, interact: 'repel', interactRadius: 120, shape: 'circle',
  },
  init(el, o) {
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    const cv = document.createElement('canvas');
    cv.className = 'efx-particles__canvas';
    cv.setAttribute('aria-hidden', 'true');
    el.insertBefore(cv, el.firstChild);
    const ctx = cv.getContext('2d');
    const motion = motionOK();
    const colors = o.color ? splitColors(o.color) : [];
    if (!colors.length) colors.push(themeColor(el));
    const sp = o.speed / 100;
    let w = 0, h = 0, dpr = 1, ps = [], raf = 0, vis = true, hidden = document.hidden;
    const ptr = { x: -1e4, y: -1e4 };
    const rnd = (a, b) => a + Math.random() * (b - a);

    const seed = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = el.clientWidth; h = el.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(o.count, Math.round(w * h / 14000));
      ps = Array.from({ length: n }, () => ({
        x: rnd(0, w), y: rnd(0, h), vx: rnd(-.5, .5) * sp, vy: rnd(-.5, .5) * sp,
        r: rnd(o.sizeMin, o.sizeMax), c: colors[(Math.random() * colors.length) | 0],
      }));
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = o.opacity;
      for (const p of ps) {
        ctx.fillStyle = p.c;
        ctx.beginPath();
        if (o.shape === 'square') ctx.rect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
        else if (o.shape === 'triangle') { ctx.moveTo(p.x, p.y - p.r * 1.3); ctx.lineTo(p.x + p.r * 1.2, p.y + p.r); ctx.lineTo(p.x - p.r * 1.2, p.y + p.r); ctx.closePath(); }
        else ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
      if (o.links || o.interact === 'connect') {
        const L = o.linkDistance, nodes = o.interact === 'connect' && ptr.x > -1e3 ? ps.concat({ x: ptr.x, y: ptr.y, c: colors[0] }) : ps;
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < L && (o.links || j === ps.length)) {
            ctx.globalAlpha = (1 - d / L) * .6 * o.opacity;
            ctx.strokeStyle = a.c;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      raf = 0;
      const R = o.interactRadius, push = o.interact === 'repel' ? 1 : o.interact === 'attract' ? -1 : 0;
      for (const p of ps) {
        p.vx = (p.vx + rnd(-.02, .02) * sp) * .99; p.vy = (p.vy + rnd(-.02, .02) * sp) * .99;
        if (push) {
          const dx = p.x - ptr.x, dy = p.y - ptr.y, d = Math.hypot(dx, dy);
          if (d < R && d > 1) { const f = (1 - d / R) * .6 * push; p.vx += dx / d * f; p.vy += dy / d * f; }
        }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
      }
      draw();
      go();
    };
    const go = () => { if (motion && vis && !hidden && !raf) raf = requestAnimationFrame(step); };

    const offs = [];
    seed();
    if (motion) {
      offs.push(onVisible(el, v => { vis = v; if (v) go(); else { cancelAnimationFrame(raf); raf = 0; } }));
      offs.push(subVis(h => { hidden = h; if (hidden) { cancelAnimationFrame(raf); raf = 0; } else go(); }));
      if (o.interact !== 'none' && finePointer()) {
        let rect = null;
        const stale = () => { rect = null; };
        offs.push(on(el, 'pointerenter', () => { rect = el.getBoundingClientRect(); }));
        offs.push(on(el, 'pointermove', e => {
          const r = rect || (rect = el.getBoundingClientRect());
          ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
        }));
        offs.push(on(window, 'scroll', stale, { passive: true, capture: true }), on(window, 'resize', stale, { passive: true }));
        offs.push(on(el, 'pointerleave', () => { ptr.x = ptr.y = -1e4; rect = null; }));
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
