/* progress — scroll progress bar (page, or an article via data-efx-target).
   <div class="efx-progress"></div>   fixed to the top by default */
import { onScroll } from '../core.js';

export default {
  name: 'progress',
  selector: '.efx-progress',
  defaults: { target: '', position: 'top', height: 4 },
  init(el, o) {
    const t = o.target && document.querySelector(o.target);
    const pos = o.position === 'bottom' ? 'bottom' : o.position === 'none' ? '' : 'top';
    const attrs = ['role', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow'];
    const had = attrs.map(a => el.getAttribute(a));
    if (pos) el.classList.add('efx-progress--' + pos);
    el.style.setProperty('--efx-progress-height', o.height + 'px');
    el.setAttribute('role', 'progressbar');
    el.setAttribute('aria-valuemin', '0');
    el.setAttribute('aria-valuemax', '100');
    if (!el.hasAttribute('aria-label')) { el.setAttribute('aria-label', 'Reading progress'); el.dataset.efxAl = ''; }
    const stop = onScroll((y, h) => {
      let p;
      if (t) { const r = t.getBoundingClientRect(); p = -r.top / ((r.height - h) || 1); }
      else p = y / ((document.documentElement.scrollHeight - h) || 1);
      p = Math.min(1, Math.max(0, p));
      return () => {
        el.style.setProperty('--efx-progress', p.toFixed(4));
        el.setAttribute('aria-valuenow', Math.round(p * 100));
      };
    });
    return () => {
      stop();
      el.classList.remove('efx-progress--top', 'efx-progress--bottom');
      el.style.removeProperty('--efx-progress');
      el.style.removeProperty('--efx-progress-height');
      attrs.forEach((a, i) => had[i] === null ? el.removeAttribute(a) : el.setAttribute(a, had[i]));
      if (el.dataset.efxAl !== undefined) { el.removeAttribute('aria-label'); delete el.dataset.efxAl; }
    };
  },
};
