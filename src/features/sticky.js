/* sticky — is-stuck / is-hidden (hide on scroll down) / is-shrunk state classes.
   <header class="efx-sticky" data-efx-hide data-efx-shrink>…</header> */
import { onVisible, onScroll } from '../core.js';

export default {
  name: 'sticky',
  selector: '.efx-sticky',
  defaults: { offset: 0, hide: false, shrink: false, shrinkAt: 80 },
  init(el, o) {
    const top = el.style.top;
    if (o.offset) el.style.top = o.offset + 'px';
    const s = document.createElement('div');
    s.className = 'efx-sticky__sentinel';
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('data-efx-skip', '');
    s.style.cssText = 'height:0;width:0;pointer-events:none;visibility:hidden;position:absolute';
    el.parentNode.insertBefore(s, el);
    const stopV = onVisible(s, (v, e) => {
      el.classList.toggle('is-stuck', !v && e.boundingClientRect.top < o.offset + 1);
    }, `-${o.offset}px 0px 0px 0px`);
    let last = 0;
    const stopS = (o.hide || o.shrink) && onScroll(y => {
      if (o.shrink) el.classList.toggle('is-shrunk', y > o.shrinkAt);
      if (o.hide) {
        const hide = y > last && y > el.offsetHeight && !el.contains(document.activeElement);
        if (y !== last) el.classList.toggle('is-hidden', hide);
      }
      last = y;
    });
    return () => {
      stopV(); stopS && stopS(); s.remove();
      el.classList.remove('is-stuck', 'is-hidden', 'is-shrunk');
      el.style.top = top;
    };
  },
};
