/* odometer — rolling digit counter. Text is the final value (no JS = final).
   <span class="efx-odometer">$12,840</span>   Update live: el.dispatchEvent(new CustomEvent('efx:data', { detail: { value: 13002 } })) */
import { onVisible, on, motionOK } from '../core.js';

const DIGITS = '0\n1\n2\n3\n4\n5\n6\n7\n8\n9';

export default {
  name: 'odometer',
  selector: '.efx-odometer',
  defaults: { duration: 1800, from: '', stagger: 60, once: true },
  init(el, o) {
    const orig = el.innerHTML;
    let target = (el.textContent || '').trim();
    if (!target) return;
    const grouped = target.includes(',');
    const fmt = v => (typeof v === 'number' ? (grouped ? v.toLocaleString('en-US', { maximumFractionDigits: 6 }) : String(v)) : String(v));
    if (!motionOK()) {
      const off = on(el, 'efx:data', e => { el.textContent = fmt(e.detail && e.detail.value); });
      return () => { off(); el.innerHTML = orig; };
    }
    let strips = [], shown = false;
    const build = (text, fromText) => {
      const n = (text.match(/\d/g) || []).length;
      const src = (fromText.match(/\d/g) || []).join('').padStart(n, '0').slice(-n || 0);
      const sr = document.createElement('span');
      sr.className = 'efx-odometer__sr'; sr.textContent = text;
      const vis = document.createElement('span');
      vis.className = 'efx-odometer__v'; vis.setAttribute('aria-hidden', 'true');
      strips = [];
      let k = 0;
      for (const c of text) {
        const cell = document.createElement('span');
        if (/\d/.test(c)) {
          const strip = document.createElement('span');
          strip.className = 'efx-odometer__s'; strip.textContent = DIGITS;
          strip.dataset.to = c; strip.style.setProperty('--n', src[k++] || 0);
          strip.style.transitionDelay = strips.length * o.stagger + 'ms';
          cell.className = 'efx-odometer__d'; cell.append(strip); strips.push(strip);
        } else { cell.className = 'efx-odometer__c'; cell.textContent = c; }
        vis.append(cell);
      }
      el.textContent = '';
      el.append(sr, vis);
    };
    const roll = () => { void el.offsetWidth; strips.forEach(s => s.style.setProperty('--n', s.dataset.to)); shown = true; };
    const reset = () => { build(target, o.from); shown = false; };
    el.style.setProperty('--efx-odo-duration', o.duration + 'ms');
    build(target, o.from);
    let stop = () => {};
    stop = onVisible(el, v => {
      if (v) { if (!shown) { roll(); if (o.once) stop(); } }
      else if (!o.once && shown) reset();
    });
    const offData = on(el, 'efx:data', e => {
      const next = fmt(e.detail && e.detail.value).trim();
      if (!next || next === target) return;
      const prev = target;
      target = next;
      build(next, shown ? prev : o.from);
      if (shown) roll();
    });
    return () => {
      stop(); offData();
      el.innerHTML = orig;
      el.style.removeProperty('--efx-odo-duration');
    };
  },
};
