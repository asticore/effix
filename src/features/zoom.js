/* zoom — hover magnifier lens for images (fine pointer only).
   <div class="efx-zoom"><img src="a.jpg" data-efx-full="a-large.jpg" alt="…"></div>
   shape: circle | square | inner (the whole image zooms in place and follows the pointer). */
import { on, finePointer } from '../core.js';

export default {
  name: 'zoom',
  selector: '.efx-zoom',
  defaults: { scale: 2.5, size: 160, shape: 'circle' },
  init(el, o) {
    const img = el.querySelector('img');
    if (!img || !finePointer()) return;
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    const inner = o.shape === 'inner';
    const lens = document.createElement('div');
    lens.className = 'efx-zoom__lens';
    lens.setAttribute('aria-hidden', 'true');
    lens.dataset.shape = o.shape;
    if (!inner) lens.style.width = lens.style.height = o.size + 'px';
    else lens.style.borderRadius = getComputedStyle(img).borderRadius;
    el.appendChild(lens);
    el.classList.add('efx-zoom-on');
    let loaded = false;
    const move = e => {
      const ir = img.getBoundingClientRect(), er = el.getBoundingClientRect();
      const x = e.clientX - ir.left, y = e.clientY - ir.top;
      if (x < 0 || y < 0 || x > ir.width || y > ir.height) return lens.classList.remove('is-on');
      const lw = inner ? ir.width : o.size, lh = inner ? ir.height : o.size;
      lens.style.left = ir.left - er.left + (inner ? 0 : x - lw / 2) + 'px';
      lens.style.top = ir.top - er.top + (inner ? 0 : y - lh / 2) + 'px';
      if (inner) { lens.style.width = lw + 'px'; lens.style.height = lh + 'px'; }
      lens.style.backgroundSize = ir.width * o.scale + 'px ' + ir.height * o.scale + 'px';
      lens.style.backgroundPosition = lw / 2 - x * o.scale + 'px ' + (lh / 2 - y * o.scale) + 'px';
      lens.classList.add('is-on');
    };
    const offs = [
      on(el, 'pointerenter', e => {
        if (e.pointerType === 'touch') return;
        if (!loaded) {
          loaded = true;
          const u = img.dataset.efxFull || el.dataset.efxFull || img.currentSrc || img.src;
          lens.style.backgroundImage = 'url("' + u.replace(/"/g, '%22') + '")';
        }
        move(e);
      }),
      on(el, 'pointermove', e => e.pointerType !== 'touch' && move(e)),
      on(el, 'pointerleave', () => lens.classList.remove('is-on')),
    ];
    return () => {
      offs.forEach(f => f());
      lens.remove();
      el.classList.remove('efx-zoom-on');
      if (restorePos) el.style.position = '';
    };
  },
};
