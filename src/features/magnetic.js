/* magnetic — element is pulled toward the pointer when it comes close.
   <button class="btn efx-magnetic" data-efx-strength="0.4">Hover near me</button> */
import { on, onVisible, rafThrottle, motionOK, finePointer } from '../core.js';

/* One shared document pointermove listener for every visible instance. */
const subs = new Set();
let docOff = null;
const dispatch = rafThrottle(e => subs.forEach(fn => fn(e)));
const subscribe = fn => {
  subs.add(fn);
  if (!docOff) docOff = on(document, 'pointermove', dispatch, { passive: true });
  return () => {
    subs.delete(fn);
    if (!subs.size && docOff) { docOff(); docOff = null; dispatch.cancel(); }
  };
};

export default {
  name: 'magnetic',
  selector: '.efx-magnetic',
  defaults: { strength: 0.3, radius: 120, max: 24 },
  init(el, o) {
    if (!finePointer() || !motionOK()) return;
    let unsub = null, pulled = false, settle = 0;
    const clamp = v => Math.max(-o.max, Math.min(o.max, v));
    const set = (x, y) => { el.style.setProperty('--efx-mx', x + 'px'); el.style.setProperty('--efx-my', y + 'px'); };
    /* .is-magnetic carries the translate + transition; it is dropped once the return-to-0 has settled,
       so Shine's own .btn/.card transitions are untouched whenever the effect is idle. */
    const release = () => {
      if (!pulled) return;
      pulled = false;
      set(0, 0); el.classList.remove('is-pulled');
      clearTimeout(settle);
      settle = setTimeout(() => el.classList.remove('is-magnetic'), 350);
    };
    const handle = e => {
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right), dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) > o.radius) { release(); return; }
      clearTimeout(settle);
      pulled = true;
      el.classList.add('is-magnetic', 'is-pulled');
      set(clamp((e.clientX - cx) * o.strength).toFixed(1), clamp((e.clientY - cy) * o.strength).toFixed(1));
    };
    const stopVis = onVisible(el, v => {
      if (v && !unsub) unsub = subscribe(handle);
      else if (!v && unsub) { unsub(); unsub = null; release(); }
    });
    return () => {
      stopVis(); unsub && unsub(); clearTimeout(settle);
      el.style.removeProperty('--efx-mx'); el.style.removeProperty('--efx-my');
      el.classList.remove('is-pulled', 'is-magnetic');
    };
  },
};
