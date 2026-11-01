/* counter — count up to the number in the element's text when it scrolls into view.
   <span class="efx-counter" data-efx-suffix="+">12840</span> */
import { onVisible, motionOK } from '../core.js';

export default {
  name: 'counter',
  selector: '.efx-counter',
  defaults: { from: 0, to: NaN, duration: 1600, decimals: -1, separator: ',', prefix: '', suffix: '', once: true },
  init(el, o) {
    const orig = el.textContent, had = el.getAttribute('aria-label');
    const to = Number.isFinite(o.to) ? o.to : parseFloat(orig.replace(/[^0-9.\-]/g, ''));
    if (!Number.isFinite(to)) return;
    const dec = o.decimals >= 0 ? o.decimals : Math.max((String(Number.isFinite(o.to) ? o.to : orig.replace(/[^0-9.]/g, '')).split('.')[1] || '').length, (String(o.from).split('.')[1] || '').length);
    const fmt = n => {
      const [i, d] = Math.abs(n).toFixed(dec).split('.');
      return o.prefix + (n < 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, o.separator) + (d ? '.' + d : '') + o.suffix;
    };
    el.setAttribute('aria-label', fmt(to));
    const final = () => { el.textContent = fmt(to); };
    let raf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      const t0 = performance.now();
      const step = t => {
        const p = Math.min(1, (t - t0) / o.duration);
        el.textContent = fmt(o.from + (to - o.from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (!motionOK()) { final(); return () => { el.textContent = orig; had === null ? el.removeAttribute('aria-label') : el.setAttribute('aria-label', had); }; }
    el.textContent = fmt(o.from);
    let stop = () => {};
    stop = onVisible(el, v => {
      if (v) { run(); if (o.once) stop(); }
      else if (!o.once) { cancelAnimationFrame(raf); el.textContent = fmt(o.from); }
    });
    return () => {
      stop(); cancelAnimationFrame(raf);
      el.textContent = orig;
      had === null ? el.removeAttribute('aria-label') : el.setAttribute('aria-label', had);
    };
  },
};
