/* glitch — RGB-split glitch text. <h1 class="efx-glitch" data-efx-trigger="hover">Signal lost</h1>
   Copies the text into data-efx-text (shown by ::before/::after). trigger: always | hover. */
import { motionOK } from '../core.js';

export default {
  name: 'glitch',
  selector: '.efx-glitch',
  defaults: { trigger: 'always', text: '' },
  init(el, o) {
    const hadText = el.hasAttribute('data-efx-text'), prev = el.getAttribute('data-efx-text');
    el.setAttribute('data-efx-text', o.text || (el.textContent || '').replace(/\s+/g, ' ').trim());
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    if (motionOK()) el.classList.add('efx-glitch-on');
    return () => {
      el.classList.remove('efx-glitch-on');
      if (restorePos) el.style.position = '';
      if (hadText) el.setAttribute('data-efx-text', prev); else el.removeAttribute('data-efx-text');
    };
  },
};
