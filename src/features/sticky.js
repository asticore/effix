/* sticky — is-stuck / is-hidden (hide on scroll down) / is-shrunk state classes.
   <header class="efx-sticky" data-efx-hide data-efx-shrink>…</header> */
import { onVisible, onScroll, motionOK, on } from '../core.js';

export default {
  name: 'sticky',
  selector: '.efx-sticky',
  defaults: { offset: 0, hide: false, shrink: false, shrinkAt: 80 },
  init(el, o) {
    const top = el.style.top;
    if (o.offset) el.style.top = o.offset + 'px';
    // Stuck = the element's top edge sits at `offset` and its first pixel row is clipped by the shrunken root.
    const stopV = onVisible(el, (v, e) => {
      const r = e.boundingClientRect;
      el.classList.toggle('is-stuck', !!r && e.intersectionRatio < 1 && r.top <= o.offset + 1);
    }, `-${o.offset + 1}px 0px 0px 0px`, 1);
    const hide = o.hide && motionOK(), shrink = o.shrink;
    const anim = hide || shrink;
    if (anim) el.classList.add('efx-sticky-anim');
    let h = el.offsetHeight, last = scrollY;
    const ro = hide && typeof ResizeObserver !== 'undefined' && new ResizeObserver(() => { h = el.offsetHeight; });
    ro && ro.observe(el);
    const offF = hide && on(el, 'focusin', () => el.classList.remove('is-hidden'));
    const stopS = anim && onScroll(y => {
      const down = y > last, moved = y !== last, focused = el.contains(document.activeElement);
      last = y;
      return () => {
        if (shrink) el.classList.toggle('is-shrunk', y > o.shrinkAt);
        if (hide && moved) el.classList.toggle('is-hidden', down && y > h && !focused);
      };
    });
    return () => {
      stopV(); stopS && stopS(); ro && ro.disconnect(); offF && offF();
      el.classList.remove('is-stuck', 'is-hidden', 'is-shrunk', 'efx-sticky-anim');
      el.style.top = top;
    };
  },
};
