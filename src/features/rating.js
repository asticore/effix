/* rating — star rating, read-only or input, optional half stars.
   <div class="efx-rating" data-efx-value="3.5"></div>                      read-only (a plain number inside works too)
   <div class="efx-rating" data-efx-readonly="false" data-efx-half data-efx-name="score"></div>
   Fires `change` (detail.value) on user input; sets a hidden input when data-efx-name is given. */
import { on, finePointer } from '../core.js';

export default {
  name: 'rating',
  selector: '.efx-rating',
  defaults: { value: -1, count: 5, half: false, readonly: true, name: '', label: 'Rating' },
  init(el, o) {
    const saved = el.innerHTML, attrs = ['role', 'tabindex', 'aria-label', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext', 'aria-readonly'].map(a => [a, el.getAttribute(a)]);
    const count = Math.max(1, Math.min(20, Math.round(o.count))), step = o.half ? 0.5 : 1;
    const clamp = v => Math.max(0, Math.min(count, Math.round(v / step) * step));
    let value = clamp(o.value >= 0 ? o.value : parseFloat(el.textContent) || 0), preview = null;
    const stars = [], offs = [];
    const input = o.name ? Object.assign(document.createElement('input'), { type: 'hidden', name: o.name }) : null;
    el.textContent = '';
    for (let i = 0; i < count; i++) {
      const st = document.createElement('span');
      st.className = 'efx-rating__star'; st.setAttribute('aria-hidden', 'true'); st.textContent = '★';
      el.append(st); stars.push(st);
    }
    if (input) el.append(input);
    const text = v => `${v} of ${count}`;
    const paint = v => stars.forEach((st, i) => st.style.setProperty('--efx-fill', Math.max(0, Math.min(1, v - i))));
    const set = (v, fire) => {
      v = clamp(v);
      const changed = v !== value;
      value = v; preview = null; paint(v);
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuetext', text(v));
      if (input) input.value = v;
      if (fire && changed) el.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: v } }));
    };
    el.classList.toggle('is-readonly', o.readonly);
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
      el.innerHTML = saved; el.classList.remove('is-readonly');
      attrs.forEach(([a, v]) => v === null ? el.removeAttribute(a) : el.setAttribute(a, v));
    };
  },
};
