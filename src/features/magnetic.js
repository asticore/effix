/* magnetic — element is pulled toward the pointer when it comes close.
   <button class="btn efx-magnetic" data-efx-strength="0.4">Hover near me</button> */
import { on, onVisible, rafThrottle, motionOK, finePointer } from '../core.js';

export default {
  name: 'magnetic',
  selector: '.efx-magnetic',
  defaults: { strength: 0.3, radius: 120, max: 24 },
  init(el, o) {
    if (!finePointer() || !motionOK()) return;
    let off = null;
    const clamp = v => Math.max(-o.max, Math.min(o.max, v));
    const set = (x, y) => { el.style.setProperty('--efx-mx', x + 'px'); el.style.setProperty('--efx-my', y + 'px'); };
    const move = rafThrottle(e => {
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right), dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) > o.radius) { set(0, 0); el.classList.remove('is-pulled'); return; }
      set(clamp((e.clientX - cx) * o.strength).toFixed(1), clamp((e.clientY - cy) * o.strength).toFixed(1));
      el.classList.add('is-pulled');
    });
    const stopVis = onVisible(el, v => {
      if (v && !off) off = on(document, 'pointermove', move, { passive: true });
      else if (!v && off) { off(); off = null; move.cancel(); set(0, 0); }
    });
    return () => {
      stopVis(); off && off(); move.cancel();
      el.style.removeProperty('--efx-mx'); el.style.removeProperty('--efx-my');
      el.classList.remove('is-pulled');
    };
  },
};
