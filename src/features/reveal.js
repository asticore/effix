/* reveal — animate elements in when they scroll into view.
   <div class="efx-reveal" data-efx-reveal="fade-up">…</div>
   Wrap siblings in .efx-stagger (data-efx-stagger="80") to cascade their delays;
   data-efx-from / -grid / -axis / -ease / -total shape the cascade (see _stagger.js). */
import { onVisible, motionOK, on } from '../core.js';
import { stagger, staggerGroup } from './_stagger.js';

export default {
  name: 'reveal',
  selector: '.efx-reveal',
  defaults: { reveal: 'fade-up', delay: 0, once: true, threshold: 0.15 },
  init(el, o) {
    if (!motionOK()) return;
    const group = staggerGroup(el);
    let delay = o.delay;
    if (group) delay += stagger(group, '.efx-reveal', el);
    const prevDelay = el.style.getPropertyValue('--efx-delay');
    if (delay) el.style.setProperty('--efx-delay', delay + 'ms');
    el.setAttribute('data-efx-anim', o.reveal);
    el.classList.add('efx-reveal-pending');

    // Once the entrance transition ends, drop the pending class so the element's own
    // hover transforms/transitions (Shine .card, .btn) work normally again.
    const offEnd = on(el, 'transitionend', e => {
      if (e.target === el && el.classList.contains('is-in') && o.once) el.classList.remove('efx-reveal-pending');
    });
    // Ratio threshold, plus a fallback for elements taller than the viewport.
    let stop = () => {};
    stop = onVisible(el, (vis, e) => {
      const enough = vis && (e.intersectionRatio >= o.threshold || e.intersectionRect.height >= innerHeight * 0.25);
      if (enough) {
        el.classList.add('is-in');
        if (o.once) stop();
      } else if (!o.once && !vis) el.classList.remove('is-in');
    }, '0px', [0, o.threshold, 0.5, 1]);

    return () => {
      stop();
      offEnd();
      el.classList.remove('efx-reveal-pending', 'is-in');
      el.removeAttribute('data-efx-anim');
      if (prevDelay) el.style.setProperty('--efx-delay', prevDelay); else el.style.removeProperty('--efx-delay');
    };
  },
};
