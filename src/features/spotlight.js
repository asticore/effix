/* spotlight — soft glow that follows the pointer inside an element.
   <div class="card spark-spotlight" data-spark-border>…</div> */
import { on, rafThrottle, finePointer } from '../core.js';

export default {
  name: 'spotlight',
  selector: '.spark-spotlight',
  defaults: { size: 240, color: '', opacity: 0.18, border: false },
  init(el, o) {
    if (!finePointer()) return;
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    el.classList.add('is-spot');
    el.style.setProperty('--spark-size', o.size + 'px');
    el.style.setProperty('--spark-spot-o', o.opacity);
    if (o.color) el.style.setProperty('--spark-spot', o.color);
    if (o.border) el.classList.add('spark-spotlight--border');
    const move = rafThrottle(e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--spark-x', e.clientX - r.left + 'px');
      el.style.setProperty('--spark-y', e.clientY - r.top + 'px');
      el.classList.add('is-lit');
    });
    const offs = [on(el, 'pointermove', move), on(el, 'pointerleave', () => { move.cancel(); el.classList.remove('is-lit'); })];
    return () => {
      offs.forEach(f => f()); move.cancel();
      ['--spark-x', '--spark-y', '--spark-size', '--spark-spot-o', '--spark-spot'].forEach(v => el.style.removeProperty(v));
      el.classList.remove('is-lit', 'is-spot', 'spark-spotlight--border');
      if (restorePos) el.style.position = '';
    };
  },
};
