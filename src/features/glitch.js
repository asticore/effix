/* glitch — RGB-split glitch text. <h1 class="spark-glitch" data-spark-trigger="hover">Signal lost</h1>
   Copies the text into data-spark-text (shown by ::before/::after). trigger: always | hover. */
import { motionOK } from '../core.js';

export default {
  name: 'glitch',
  selector: '.spark-glitch',
  defaults: { trigger: 'always', text: '' },
  init(el, o) {
    const hadText = el.hasAttribute('data-spark-text'), prev = el.getAttribute('data-spark-text');
    el.setAttribute('data-spark-text', o.text || (el.textContent || '').replace(/\s+/g, ' ').trim());
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    if (motionOK()) el.classList.add('spark-glitch-on');
    return () => {
      el.classList.remove('spark-glitch-on');
      if (restorePos) el.style.position = '';
      if (hadText) el.setAttribute('data-spark-text', prev); else el.removeAttribute('data-spark-text');
    };
  },
};
