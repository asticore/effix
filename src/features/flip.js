/* flip — 3D flip card, height = tallest face.
   <div class="efx-flip"><div class="efx-flip__front">…</div><div class="efx-flip__back">…</div></div>
   Hover by default; data-efx-trigger="click" = button (click/Enter/Space, aria-pressed). data-efx-axis="x|y". */
import { on, motionOK, finePointer } from '../core.js';

export default {
  name: 'flip',
  selector: '.efx-flip',
  defaults: { trigger: 'hover', axis: 'y', duration: 600 },
  init(el, o) {
    const front = el.querySelector(':scope > .efx-flip__front'), back = el.querySelector(':scope > .efx-flip__back');
    if (!front || !back) return;
    const click = o.trigger === 'click' || !finePointer();
    const prev = { role: el.getAttribute('role'), tab: el.getAttribute('tabindex'), pressed: el.getAttribute('aria-pressed') };
    const cls = ['efx-flip-on', o.axis === 'x' ? 'efx-flip-x' : 'efx-flip-y'];
    if (!motionOK()) cls.push('efx-flip-fade');
    el.classList.add(...cls);
    el.style.setProperty('--efx-flip-duration', o.duration + 'ms');
    const set = v => {
      el.classList.toggle('is-flipped', v);
      back.setAttribute('aria-hidden', String(!v));
      if (click) el.setAttribute('aria-pressed', String(v));
    };
    set(false);
    const flipped = () => el.classList.contains('is-flipped');
    const offs = [];
    if (click) {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      offs.push(on(el, 'click', () => set(!flipped())),
        on(el, 'keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === el) { e.preventDefault(); set(!flipped()); } }));
    } else {
      offs.push(on(el, 'pointerenter', e => e.pointerType !== 'touch' && set(true)), on(el, 'pointerleave', () => set(false)),
        on(el, 'focusin', () => set(true)), on(el, 'focusout', e => !el.contains(e.relatedTarget) && set(false)));
    }
    return () => {
      offs.forEach(f => f());
      el.classList.remove(...cls, 'is-flipped');
      el.style.removeProperty('--efx-flip-duration');
      back.removeAttribute('aria-hidden');
      ['role', 'tabindex', 'aria-pressed'].forEach((a, i) => { const v = [prev.role, prev.tab, prev.pressed][i]; v == null ? el.removeAttribute(a) : el.setAttribute(a, v); });
    };
  },
};
