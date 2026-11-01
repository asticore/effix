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
    let mark = false;
    const clear = () => { if (mark) { mark = false; document.body.removeAttribute('tabindex'); } };
    const stop = onScroll(y => el.classList.toggle('is-shown', y > o.show));
    const off = on(el, 'click', e => {
      if (el.tagName === 'A') e.preventDefault();
      scrollTo({ top: 0, behavior: motionOK() ? 'smooth' : 'auto' });
      // the button hides once at the top: hand focus to the page start so it isn't lost
      const b = document.body;
      if (!b.hasAttribute('tabindex')) {
        b.setAttribute('tabindex', '-1');
        mark = true;
        b.addEventListener('blur', clear, { once: true });
      }
      b.focus({ preventScroll: true });
    });
    return () => {
      stop(); off(); document.body.removeEventListener('blur', clear); clear();
      el.classList.remove('is-shown');
      if (!label) el.removeAttribute('aria-label');
      if (!type) el.removeAttribute('type');
    };
  },
};
