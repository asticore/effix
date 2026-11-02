/* direction — direction-aware hover: sets data-efx-from="top|right|bottom|left" and .is-hover so a fill slides in from the entry edge and out toward the exit edge.
   <a class="btn efx-direction">Hover me</a>   data-efx-fill="false" = only set the attributes for your own CSS. Keyboard focus fills from the left. */
import { on } from '../core.js';

export default {
  name: 'direction',
  selector: '.efx-direction',
  defaults: { fill: true },
  init(el, o) {
    let restorePos = false;
    if (o.fill) {
      if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
      el.classList.add('efx-direction-fill');
    }
    const edge = e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left) / (r.width || 1) - .5, dy = (e.clientY - r.top) / (r.height || 1) - .5;
      return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'top' : 'bottom');
    };
    const enter = from => {
      el.setAttribute('data-efx-from', from);
      el.classList.add('efx-direction-snap'); void el.offsetWidth; el.classList.remove('efx-direction-snap');
      el.classList.add('is-hover');
    };
    const leave = from => { el.setAttribute('data-efx-from', from); el.classList.remove('is-hover'); };
    const mouse = e => e.pointerType !== 'touch';
    const offs = [
      on(el, 'pointerenter', e => mouse(e) && enter(edge(e))),
      on(el, 'pointerleave', e => mouse(e) && leave(edge(e))),
      on(el, 'focusin', e => { try { if (e.target.matches(':focus-visible')) enter('left'); } catch (_) {} }),
      on(el, 'focusout', () => leave('left')),
    ];
    return () => {
      offs.forEach(f => f());
      el.classList.remove('is-hover', 'efx-direction-fill', 'efx-direction-snap');
      el.removeAttribute('data-efx-from');
      if (restorePos) el.style.position = '';
    };
  },
};
