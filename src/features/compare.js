/* compare — before/after image slider.
   <div class="efx-compare"><img src="before.jpg" alt="Before"><img src="after.jpg" alt="After"></div>
   Drag anywhere; keyboard and screen readers use a hidden range input. */
import { on, finePointer } from '../core.js';

export default {
  name: 'compare',
  selector: '.efx-compare',
  defaults: { start: 50, vertical: false, hover: false },
  init(el, o) {
    const after = el.querySelectorAll(':scope > img')[1];
    if (!after) return;
    const mk = (tag, cls) => { const n = document.createElement(tag); n.className = 'efx-compare__' + cls; return n; };
    const clip = mk('div', 'clip'), handle = mk('div', 'handle'), knob = mk('span', 'knob'), input = mk('input', 'range');
    handle.setAttribute('aria-hidden', 'true');
    handle.appendChild(knob);
    Object.assign(input, { type: 'range', min: 0, max: 100, step: 1 });
    input.setAttribute('aria-label', 'Comparison position');
    if (o.vertical) { el.classList.add('efx-compare-vertical'); input.setAttribute('aria-orientation', 'vertical'); }
    const pos = el.style.position, setPos = getComputedStyle(el).position === 'static';
    if (setPos) el.style.position = 'relative';
    after.before(clip);
    clip.appendChild(after);
    el.append(input, handle);

    const set = p => {
      p = Math.max(0, Math.min(100, p));
      el.style.setProperty('--efx-pos', p + '%');
      input.value = p;
      input.setAttribute('aria-valuetext', Math.round(p) + '%');
    };
    const fromEvent = e => {
      const r = el.getBoundingClientRect();
      set(o.vertical ? (e.clientY - r.top) / r.height * 100 : (e.clientX - r.left) / r.width * 100);
    };
    let drag = false;
    const offs = [
      on(el, 'pointerdown', e => {
        if (e.button) return;
        drag = true; el.setPointerCapture(e.pointerId); el.classList.add('is-dragging'); fromEvent(e);
      }),
      on(el, 'pointermove', e => { if (drag || (o.hover && finePointer() && e.pointerType === 'mouse')) fromEvent(e); }),
      on(el, 'pointerup', () => { drag = false; el.classList.remove('is-dragging'); }),
      on(el, 'pointercancel', () => { drag = false; el.classList.remove('is-dragging'); }),
      on(input, 'input', () => set(+input.value)),
    ];
    set(o.start);
    return () => {
      offs.forEach(f => f());
      clip.replaceWith(after);
      input.remove(); handle.remove();
      el.classList.remove('efx-compare-vertical', 'is-dragging');
      el.style.removeProperty('--efx-pos');
      if (setPos) el.style.position = pos;
    };
  },
};
