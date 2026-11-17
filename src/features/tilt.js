/* tilt — 3D tilt toward the pointer.
   <div class="card spark-tilt" data-spark-glare data-spark-max="12">…</div> */
import { on, rafThrottle, motionOK, finePointer } from '../core.js';

export default {
  name: 'tilt',
  selector: '.spark-tilt',
  defaults: { max: 10, perspective: 900, scale: 1.02, glare: false, reset: true, gyro: false },
  init(el, o) {
    const fine = finePointer(), gy = o.gyro && !fine && 'DeviceOrientationEvent' in window;
    if (!(fine || gy) || !motionOK()) return;
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    el.style.setProperty('--spark-persp', o.perspective + 'px');
    el.style.setProperty('--spark-tscale', o.scale);
    let g = null;
    if (o.glare) {
      g = document.createElement('span');
      g.className = 'spark-tilt__glare';
      g.setAttribute('aria-hidden', 'true');
      el.appendChild(g);
    }
    let rect = null, settle = 0;
    const enter = () => {
      clearTimeout(settle);
      rect = el.getBoundingClientRect(); // measured before any transform is applied, so no jitter
      el.style.willChange = 'transform';
      el.classList.add('is-tilt-active');
    };
    const move = rafThrottle(e => {
      if (!rect) enter();
      const r = rect;
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--spark-ry', ((x - .5) * 2 * o.max).toFixed(2) + 'deg');
      el.style.setProperty('--spark-rx', ((.5 - y) * 2 * o.max).toFixed(2) + 'deg');
      el.classList.add('is-tilting');
      if (g) { g.style.setProperty('--spark-gx', x * 100 + '%'); g.style.setProperty('--spark-gy', y * 100 + '%'); }
    });
    const reset = () => {
      move.cancel();
      el.classList.remove('is-tilting');
      rect = null;
      if (o.reset) {
        el.style.removeProperty('--spark-rx'); el.style.removeProperty('--spark-ry');
        clearTimeout(settle);
        settle = setTimeout(() => { el.classList.remove('is-tilt-active'); el.style.willChange = ''; }, 300);
      }
    };
    const offs = fine ? [on(el, 'pointerenter', enter), on(el, 'pointermove', move), on(el, 'pointerleave', reset)] : [];
    // gyro (touch): same vars from device tilt. Never prompts; on iOS events only flow once the page itself got permission.
    if (gy) offs.push(on(window, 'deviceorientation', e => {
      if (e.beta == null) return;
      const k = v => Math.max(-1, Math.min(1, v / 40));
      el.classList.add('is-tilt-active', 'is-tilting');
      el.style.setProperty('--spark-ry', (k(e.gamma) * o.max).toFixed(2) + 'deg');
      el.style.setProperty('--spark-rx', (-k(e.beta - 45) * o.max).toFixed(2) + 'deg');
    }, { passive: true }));
    return () => {
      offs.forEach(f => f()); move.cancel();
      ['--spark-rx', '--spark-ry', '--spark-persp', '--spark-tscale'].forEach(v => el.style.removeProperty(v));
      clearTimeout(settle); el.style.willChange = '';
      el.classList.remove('is-tilting', 'is-tilt-active');
      if (restorePos) el.style.position = '';
      g && g.remove();
    };
  },
};
