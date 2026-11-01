/* tilt — 3D tilt toward the pointer.
   <div class="card efx-tilt" data-efx-glare data-efx-max="12">…</div> */
import { on, rafThrottle, motionOK, finePointer } from '../core.js';

export default {
  name: 'tilt',
  selector: '.efx-tilt',
  defaults: { max: 10, perspective: 900, scale: 1.02, glare: false, reset: true },
  init(el, o) {
    if (!finePointer() || !motionOK()) return;
    el.style.setProperty('--efx-persp', o.perspective + 'px');
    el.style.setProperty('--efx-tscale', o.scale);
    let g = null;
    if (o.glare) {
      g = document.createElement('span');
      g.className = 'efx-tilt__glare';
      g.setAttribute('aria-hidden', 'true');
      el.appendChild(g);
    }
    const move = rafThrottle(e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--efx-ry', ((x - .5) * 2 * o.max).toFixed(2) + 'deg');
      el.style.setProperty('--efx-rx', ((.5 - y) * 2 * o.max).toFixed(2) + 'deg');
      el.classList.add('is-tilting');
      if (g) { g.style.setProperty('--efx-gx', x * 100 + '%'); g.style.setProperty('--efx-gy', y * 100 + '%'); }
    });
    const reset = () => {
      move.cancel();
      el.classList.remove('is-tilting');
      if (o.reset) { el.style.removeProperty('--efx-rx'); el.style.removeProperty('--efx-ry'); }
    };
    const offs = [on(el, 'pointermove', move), on(el, 'pointerleave', reset)];
    return () => {
      offs.forEach(f => f()); move.cancel();
      ['--efx-rx', '--efx-ry', '--efx-persp', '--efx-tscale'].forEach(v => el.style.removeProperty(v));
      el.classList.remove('is-tilting');
      g && g.remove();
    };
  },
};
