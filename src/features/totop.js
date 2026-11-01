/* totop — back-to-top button that appears after scrolling.
   <button class="btn efx-totop" aria-label="Back to top">↑</button> */
import { onScroll, motionOK, on } from '../core.js';

export default {
  name: 'totop',
  selector: '.efx-totop',
  defaults: { show: 400, fixed: true },
  init(el, o) {
    const type = el.getAttribute('type'), label = el.hasAttribute('aria-label');
    if (el.tagName === 'BUTTON' && !type) el.type = 'button';
    if (!label && !el.textContent.trim().replace(/[↑^▲]/g, '')) el.setAttribute('aria-label', 'Back to top');
    const stop = onScroll(y => el.classList.toggle('is-shown', y > o.show));
    const off = on(el, 'click', e => {
      if (el.tagName === 'A') e.preventDefault();
      scrollTo({ top: 0, behavior: motionOK() ? 'smooth' : 'auto' });
    });
    return () => {
      stop(); off();
      el.classList.remove('is-shown');
      if (!label) el.removeAttribute('aria-label');
      if (!type) el.removeAttribute('type');
    };
  },
};
