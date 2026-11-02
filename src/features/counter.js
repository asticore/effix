/* counter — count up to the number in the element's text when it scrolls into view.
   <span class="efx-counter" data-efx-suffix="+">12840</span> */
import { onVisible, motionOK } from '../core.js';
import { ease } from './_easing.js';

export default {
  name: 'counter',
  selector: '.efx-counter',
  defaults: { from: 0, to: NaN, duration: 1600, decimals: -1, separator: ',', ease: 'ease-out-cubic', prefix: '', suffix: '', once: true },
  init(el, o) {
    const orig = el.textContent, hadHidden = el.getAttribute('aria-hidden');
    const to = Number.isFinite(o.to) ? o.to : parseFloat(orig.replace(/[^0-9.\-]/g, ''));
    if (!Number.isFinite(to)) return;
    const dec = o.decimals >= 0 ? o.decimals : Math.max((String(Number.isFinite(o.to) ? o.to : orig.replace(/[^0-9.]/g, '')).split('.')[1] || '').length, (String(o.from).split('.')[1] || '').length);
    const fmt = n => {
      const [i, d] = Math.abs(n).toFixed(dec).split('.');
      return o.prefix + (n < 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, o.separator) + (d ? '.' + d : '') + o.suffix;
    };
    const final = () => { el.textContent = fmt(to); };
    let raf = 0;
    const e = ease(o.ease);
    const run = () => {
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const step = t => {
        const p = Math.min(1, (t - t0) / o.duration);
        el.textContent = fmt(o.from + (to - o.from) * e(p));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (!motionOK()) { final(); return () => { el.textContent = orig; }; }
    // aria-label on a span is ignored: expose the final value in an sr-only sibling, hide the animated text
    const sr = document.createElement('span');
    sr.className = 'efx-counter__sr';
    sr.textContent = fmt(to);
    el.after(sr);
    el.setAttribute('aria-hidden', 'true');
    el.textContent = fmt(o.from);
    let stop = () => {};
    stop = onVisible(el, v => {
      if (v) { run(); if (o.once) stop(); }
      else if (!o.once) { cancelAnimationFrame(raf); el.textContent = fmt(o.from); }
    });
    return () => {
      stop(); cancelAnimationFrame(raf);
      el.textContent = orig;
      sr.remove();
      hadHidden === null ? el.removeAttribute('aria-hidden') : el.setAttribute('aria-hidden', hadHidden);
    };
  },
};
