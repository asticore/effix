/* reveal — animate elements in when they scroll into view.
   <div class="spark-reveal" data-spark-reveal="fade-up">…</div>
   Wrap siblings in .spark-stagger (data-spark-stagger="80") to cascade their delays;
   data-spark-from / -grid / -axis / -ease / -total shape the cascade (see _stagger.js). */
import { onVisible, motionOK, on } from '../core.js';
import { stagger, staggerGroup } from './_stagger.js';

export default {
  name: 'reveal',
  selector: '.spark-reveal',
  defaults: { reveal: 'fade-up', delay: 0, once: true, threshold: 0.15 },
  init(el, o) {
    if (!motionOK()) return;
    const group = staggerGroup(el);
    let delay = o.delay;
    if (group) delay += stagger(group, '.spark-reveal', el);
    const prevDelay = el.style.getPropertyValue('--spark-delay');
    if (delay) el.style.setProperty('--spark-delay', delay + 'ms');
    el.setAttribute('data-spark-anim', o.reveal);
    el.classList.add('spark-reveal-pending');

    // Once the entrance transition ends, drop the pending class so the element's own
    // hover transforms/transitions (Shine .card, .btn) work normally again.
    const offEnd = on(el, 'transitionend', e => {
      if (e.target === el && el.classList.contains('is-in') && o.once) el.classList.remove('spark-reveal-pending');
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
      el.classList.remove('spark-reveal-pending', 'is-in');
      el.removeAttribute('data-spark-anim');
      if (prevDelay) el.style.setProperty('--spark-delay', prevDelay); else el.style.removeProperty('--spark-delay');
    };
  },
};
