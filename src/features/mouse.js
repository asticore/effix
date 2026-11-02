/* mouse — layered depth parallax that follows the pointer (Elementor-style mouse track).
   <section class="efx-mouse" data-efx-strength="30"><img data-efx-depth="0.3"><h2 data-efx-depth="0.8">Hi</h2></section>
   Layers = descendants with [data-efx-depth]; with none, the container itself moves. scope: self | page. */
import { on, onVisible, motionOK, finePointer } from '../core.js';

/* One shared document pointermove listener for every visible instance. */
const subs = new Set();
let docOff = null;
const subscribe = fn => {
  subs.add(fn);
  if (!docOff) docOff = on(document, 'pointermove', e => subs.forEach(f => f(e)), { passive: true });
  return () => { subs.delete(fn); if (!subs.size && docOff) { docOff(); docOff = null; } };
};

export default {
  name: 'mouse',
  selector: '.efx-mouse',
  defaults: { strength: 20, scope: 'self', invert: false, rotate: 0, ease: 0.12, gyro: false },
  init(el, o) {
    const fine = finePointer(), gy = o.gyro && !fine && 'DeviceOrientationEvent' in window;
    if (!(fine || gy) || !motionOK()) return;
    const found = [...el.querySelectorAll('[data-efx-depth]')];
    const layers = (found.length ? found : [el]).map(n => ({
      n, d: found.length ? parseFloat(n.dataset.efxDepth) || 0 : 1, x: 0, y: 0, r: 0,
      pt: n.style.translate, pr: n.style.rotate,
    }));
    const sign = o.invert ? 1 : -1, page = o.scope === 'page', ease = Math.min(1, Math.max(0.01, o.ease));
    let tx = 0, ty = 0, raf = 0, unsub = null, rect = null;
    const frame = () => {
      raf = 0;
      let moving = false;
      for (const l of layers) {
        const gx = tx * l.d * o.strength * sign, gy = ty * l.d * o.strength * sign, gr = tx * l.d * o.rotate * sign;
        l.x += (gx - l.x) * ease; l.y += (gy - l.y) * ease; l.r += (gr - l.r) * ease;
        const settled = Math.abs(gx - l.x) < 0.05 && Math.abs(gy - l.y) < 0.05 && Math.abs(gr - l.r) < 0.05;
        if (settled) { l.x = gx; l.y = gy; l.r = gr; } else moving = true;
        l.n.style.translate = l.x.toFixed(2) + 'px ' + l.y.toFixed(2) + 'px';
        if (o.rotate) l.n.style.rotate = l.r.toFixed(2) + 'deg';
      }
      if (moving) raf = requestAnimationFrame(frame);
    };
    const go = (x, y) => { if (!Number.isFinite(x) || !Number.isFinite(y)) x = y = 0; tx = x; ty = y; if (!raf) raf = requestAnimationFrame(frame); };
    const handle = e => {
      if (page) return go(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return go(0, 0);
      go((e.clientX - r.left) / (r.width || 1) * 2 - 1, (e.clientY - r.top) / (r.height || 1) * 2 - 1);
    };
    // gyro (touch): device tilt drives the same -1..1 range. Never prompts; iOS needs page-level permission.
    const orient = e => { if (e.beta != null) go(Math.max(-1, Math.min(1, e.gamma / 40)), Math.max(-1, Math.min(1, (e.beta - 45) / 40))); };
    const stopVis = onVisible(el, v => {
      if (v && !unsub) unsub = fine ? subscribe(handle) : on(window, 'deviceorientation', orient, { passive: true });
      else if (!v && unsub) { unsub(); unsub = null; go(0, 0); }
    });
    return () => {
      stopVis(); unsub && unsub(); cancelAnimationFrame(raf);
      for (const l of layers) { l.n.style.translate = l.pt; l.n.style.rotate = l.pr; }
    };
  },
};
