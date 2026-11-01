/* spotlight — soft glow that follows the pointer inside an element.
   <div class="card efx-spotlight" data-efx-border>…</div> */
import { on, rafThrottle, finePointer } from '../core.js';

export default {
  name: 'spotlight',
  selector: '.efx-spotlight',
  defaults: { size: 240, color: '', opacity: 0.18, border: false },
  init(el, o) {
    if (!finePointer()) return;
    el.style.setProperty('--efx-size', o.size + 'px');
    el.style.setProperty('--efx-spot-o', o.opacity);
    if (o.color) el.style.setProperty('--efx-spot', o.color);
    if (o.border) el.classList.add('efx-spotlight--border');
    const move = rafThrottle(e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--efx-x', e.clientX - r.left + 'px');
      el.style.setProperty('--efx-y', e.clientY - r.top + 'px');
      el.classList.add('is-lit');
    });
    const offs = [on(el, 'pointermove', move), on(el, 'pointerleave', () => { move.cancel(); el.classList.remove('is-lit'); })];
    return () => {
      offs.forEach(f => f()); move.cancel();
      ['--efx-x', '--efx-y', '--efx-size', '--efx-spot-o', '--efx-spot'].forEach(v => el.style.removeProperty(v));
      el.classList.remove('is-lit', 'efx-spotlight--border');
    };
  },
};
