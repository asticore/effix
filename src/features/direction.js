/* direction — direction-aware hover: sets data-efx-from="top|right|bottom|left" and .is-hover so a fill slides in from the entry edge and out toward the exit edge.
   <a class="btn efx-direction">Hover me</a>   data-efx-fill="false" = only set the attributes for your own CSS; "circle" = fill floods as a circle from the pointer entry point (sets --efx-x/--efx-y). Keyboard focus fills from the left. */
import { on } from '../core.js';

export default {
  name: 'direction',
  selector: '.efx-direction',
  defaults: { fill: 'edge' },
  init(el, o) {
    let restorePos = false;
    const fill = !/^(false|off|0|none)$/.test(o.fill), circle = o.fill === 'circle';
    if (fill) {
      if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
      el.classList.add('efx-direction-fill');
    }
    const edge = e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left) / (r.width || 1) - .5, dy = (e.clientY - r.top) / (r.height || 1) - .5;
      return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'top' : 'bottom');
    };
    const at = e => {
      if (!circle) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--efx-x', (e ? (e.clientX - r.left) / (r.width || 1) * 100 : 50).toFixed(1) + '%');
      el.style.setProperty('--efx-y', (e ? (e.clientY - r.top) / (r.height || 1) * 100 : 50).toFixed(1) + '%');
    };
    const enter = (from, e) => {
      at(e);
      el.setAttribute('data-efx-from', from);
      el.classList.add('efx-direction-snap'); void el.offsetWidth; el.classList.remove('efx-direction-snap');
      el.classList.add('is-hover');
    };
    const leave = (from, e) => { at(e); el.setAttribute('data-efx-from', from); el.classList.remove('is-hover'); };
    const mouse = e => e.pointerType !== 'touch';
    const offs = [
      on(el, 'pointerenter', e => mouse(e) && enter(edge(e), e)),
      on(el, 'pointerleave', e => mouse(e) && leave(edge(e), e)),
      on(el, 'focusin', e => { try { if (e.target.matches(':focus-visible')) enter('left'); } catch (_) {} }),
      on(el, 'focusout', e => { if (el.matches(':hover') || (e.relatedTarget && el.contains(e.relatedTarget))) return; leave('left'); }),
    ];
    return () => {
      offs.forEach(f => f());
      el.classList.remove('is-hover', 'efx-direction-fill', 'efx-direction-snap');
      el.removeAttribute('data-efx-from');
      el.style.removeProperty('--efx-x'); el.style.removeProperty('--efx-y');
      if (restorePos) el.style.position = '';
    };
  },
};
