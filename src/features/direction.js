/* direction — direction-aware hover: sets data-spark-from="top|right|bottom|left" and .is-hover so a fill slides in from the entry edge and out toward the exit edge.
   <a class="btn spark-direction">Hover me</a>   data-spark-fill="false" = only set the attributes for your own CSS; "circle" = fill floods as a circle from the pointer entry point (sets --spark-x/--spark-y). Keyboard focus fills from the left. */
import { on } from '../core.js';

export default {
  name: 'direction',
  selector: '.spark-direction',
  defaults: { fill: 'edge' },
  init(el, o) {
    let restorePos = false;
    const fill = !/^(false|off|0|none)$/.test(o.fill), circle = o.fill === 'circle';
    if (fill) {
      if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
      el.classList.add('spark-direction-fill');
    }
    const edge = e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left) / (r.width || 1) - .5, dy = (e.clientY - r.top) / (r.height || 1) - .5;
      return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'top' : 'bottom');
    };
    const at = e => {
      if (!circle) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--spark-x', (e ? (e.clientX - r.left) / (r.width || 1) * 100 : 50).toFixed(1) + '%');
      el.style.setProperty('--spark-y', (e ? (e.clientY - r.top) / (r.height || 1) * 100 : 50).toFixed(1) + '%');
    };
    const enter = (from, e) => {
      at(e);
      el.setAttribute('data-spark-from', from);
      el.classList.add('spark-direction-snap'); void el.offsetWidth; el.classList.remove('spark-direction-snap');
      el.classList.add('is-hover');
    };
    const leave = (from, e) => { at(e); el.setAttribute('data-spark-from', from); el.classList.remove('is-hover'); };
    const mouse = e => e.pointerType !== 'touch';
    const offs = [
      on(el, 'pointerenter', e => mouse(e) && enter(edge(e), e)),
      on(el, 'pointerleave', e => mouse(e) && leave(edge(e), e)),
      on(el, 'focusin', e => { try { if (e.target.matches(':focus-visible')) enter('left'); } catch (_) {} }),
      on(el, 'focusout', e => { if (el.matches(':hover') || (e.relatedTarget && el.contains(e.relatedTarget))) return; leave('left'); }),
    ];
    return () => {
      offs.forEach(f => f());
      el.classList.remove('is-hover', 'spark-direction-fill', 'spark-direction-snap');
      el.removeAttribute('data-spark-from');
      el.style.removeProperty('--spark-x'); el.style.removeProperty('--spark-y');
      if (restorePos) el.style.position = '';
    };
  },
};
