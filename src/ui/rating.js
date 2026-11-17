/* rating — star rating, read-only or input, optional half stars.
   <div class="spark-rating" data-spark-value="3.5"></div>                      read-only (a plain number inside works too)
   <div class="spark-rating" data-spark-readonly="false" data-spark-half data-spark-name="score"></div>
   Fires `change` (detail.value) on user input; sets a hidden input when data-spark-name is given. */
import { on, finePointer } from '../core.js';
import { shineWidgets } from './_shine.js';

let uid = 0;

export default {
  name: 'rating',
  selector: '.spark-rating',
  defaults: { value: -1, count: 5, half: false, readonly: true, name: '', label: 'Rating' },
  init(el, o) {
    const saved = el.innerHTML, attrs = ['role', 'tabindex', 'aria-label', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'aria-readonly'].map(a => [a, el.getAttribute(a)]);
    const count = Math.max(1, Math.min(20, Math.round(o.count))), step = o.half ? 0.5 : 1;
    const clamp = v => Math.max(0, Math.min(count, Math.round(v / step) * step));
    let value = clamp(o.value >= 0 ? o.value : parseFloat(el.textContent) || 0), preview = null;
    const stars = [], offs = [];
    if (shineWidgets() && count === 5) { // Shine's .rating (display) / .rating-input (radios) when its widgets CSS is loaded
      const cls0 = el.getAttribute('class'), style0 = el.getAttribute('style');
      el.textContent = '';
      el.setAttribute('aria-label', o.label);
      if (o.readonly) {
        el.classList.add('rating', 'is-readonly');
        el.style.setProperty('--sh-rating', value);
        el.setAttribute('role', 'img'); el.setAttribute('aria-label', `${o.label}: ${value} of 5`);
      } else {
        const id = 'spark-rt' + ++uid, nm = o.name || id;
        el.classList.add('rating-input'); if (o.half) el.classList.add('rating-half');
        el.setAttribute('role', 'radiogroup');
        for (let k = 1; k <= 5 / step; k++) {
          const v = k * step, r = document.createElement('input'), l = document.createElement('label');
          r.type = 'radio'; r.name = nm; r.id = `${id}-${k}`; r.value = v; r.checked = v === value;
          l.htmlFor = r.id; l.textContent = v; l.title = `${v} of 5`;
          el.append(r, l);
        }
        offs.push(on(el, 'change', e => {
          if (e.target === el) return;
          e.stopPropagation(); // re-announce as one change event carrying the value
          value = parseFloat(e.target.value);
          el.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value } }));
        }));
      }
      return () => {
        offs.forEach(f => f());
        el.innerHTML = saved;
        cls0 === null ? el.removeAttribute('class') : el.setAttribute('class', cls0);
        style0 === null ? el.removeAttribute('style') : el.setAttribute('style', style0);
        attrs.forEach(([a, v]) => v === null ? el.removeAttribute(a) : el.setAttribute(a, v));
      };
    }
    const input = o.name ? Object.assign(document.createElement('input'), { type: 'hidden', name: o.name }) : null;
    el.textContent = '';
    for (let i = 0; i < count; i++) {
      const st = document.createElement('span');
      st.className = 'spark-rating__star'; st.setAttribute('aria-hidden', 'true'); st.textContent = '★';
      el.append(st); stars.push(st);
    }
    if (input) el.append(input);
    const text = v => `${v} of ${count}`;
    const paint = v => stars.forEach((st, i) => st.style.setProperty('--spark-fill', Math.max(0, Math.min(1, v - i))));
    const set = (v, fire) => {
      v = clamp(v);
      const changed = v !== value;
      value = v; preview = null; paint(v);
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuetext', text(v));
      if (input) input.value = v;
      if (fire && changed) el.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: v } }));
    };
    el.classList.add('spark-rating--own'); el.classList.toggle('is-readonly', o.readonly);
    el.setAttribute('aria-label', o.label);
    if (o.readonly) {
      el.setAttribute('role', 'img'); el.setAttribute('aria-label', `${o.label}: ${text(value)}`); paint(value);
      if (input) input.value = value;
    } else {
      el.setAttribute('role', 'slider'); el.tabIndex = 0;
      el.setAttribute('aria-valuemin', 0); el.setAttribute('aria-valuemax', count);
      set(value);
      const at = e => {
        const i = Math.max(0, Math.min(count - 1, stars.findIndex(s => s.contains(e.target))));
        if (!stars.some(s => s.contains(e.target))) return null;
        if (!o.half) return i + 1;
        const r = stars[i].getBoundingClientRect(), rtl = getComputedStyle(el).direction === 'rtl';
        const left = rtl ? e.clientX > r.left + r.width / 2 : e.clientX < r.left + r.width / 2;
        return i + (left ? 0.5 : 1);
      };
      if (finePointer()) {
        offs.push(on(el, 'pointermove', e => { const v = at(e); if (v != null && v !== preview) { preview = v; paint(v); } }));
        offs.push(on(el, 'pointerleave', () => { preview = null; paint(value); }));
      }
      offs.push(on(el, 'click', e => { const v = at(e); if (v != null) set(v === value ? 0 : v, true); })); // click the current value again to clear
      offs.push(on(el, 'keydown', e => {
        const k = e.key, d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[k];
        if (d != null) set(value + d, true); else if (k === 'Home') set(0, true); else if (k === 'End') set(count, true); else return;
        e.preventDefault();
      }));
    }
    return () => {
      offs.forEach(f => f());
      el.innerHTML = saved; el.classList.remove('is-readonly', 'spark-rating--own');
      attrs.forEach(([a, v]) => v === null ? el.removeAttribute(a) : el.setAttribute(a, v));
    };
  },
};
