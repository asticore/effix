/* reveal — animate elements in when they scroll into view.
   <div class="efx-reveal" data-efx-reveal="fade-up">…</div>
   Wrap siblings in .efx-stagger (data-efx-stagger="80") to cascade their delays. */
import { onVisible, motionOK } from '../core.js';

export default {
  name: 'reveal',
  selector: '.efx-reveal',
  defaults: { reveal: 'fade-up', delay: 0, once: true, threshold: 0.15 },
  init(el, o) {
    el.setAttribute('data-efx-anim', o.reveal);
    const group = el.parentElement && el.parentElement.closest('.efx-stagger');
    let delay = o.delay;
    if (group) {
      const step = parseFloat(group.dataset.efxStagger) || 80;
      const items = [...group.querySelectorAll('.efx-reveal')];
      delay += items.indexOf(el) * step;
    }
    if (delay) el.style.setProperty('--efx-delay', delay + 'ms');
    if (!motionOK()) { el.classList.add('is-in'); return; }
    el.classList.add('efx-reveal-pending');
    return onVisible(el, (vis, e) => {
      if (vis) el.classList.add('is-in');
      else if (!o.once && !vis) el.classList.remove('is-in');
    }, `0px 0px -${Math.round(o.threshold * 100)}% 0px`);
  },
};
