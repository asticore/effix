/* cursor — custom cursor (ring / dot / dot-ring) that eases toward the pointer.
   <body class="efx-cursor" data-efx-style="dot-ring" data-efx-blend> */
import { on, motionOK, finePointer, themeColor } from '../core.js';

export default {
  name: 'cursor',
  selector: '.efx-cursor',
  defaults: {
    style: 'ring', size: 32, color: '', hideNative: false, blend: false,
    hover: 'a,button,[role=button],input,select,textarea,label,summary,.efx-cursor-hover',
  },
  init(el, o) {
    if (!finePointer() || !motionOK()) return;
    const mk = k => {
      const d = document.createElement('div');
      d.className = 'efx-cursor__' + k;
      d.setAttribute('aria-hidden', 'true');
      d.style.cssText = 'opacity:0;--efx-cursor-size:' + (k === 'ring' ? o.size : Math.max(6, o.size / 5)) + 'px';
      if (o.color) d.style.setProperty('--efx-cursor-color', o.color);
      else d.style.setProperty('--efx-cursor-color', themeColor(el));
      if (o.blend) d.classList.add('efx-cursor--blend');
      document.body.appendChild(d);
      return d;
    };
    const ring = o.style !== 'dot' ? mk('ring') : null;
    const dot = o.style !== 'ring' ? mk('dot') : null;
    const parts = [ring, dot].filter(Boolean);
    if (o.hideNative) el.classList.add('efx-cursor-hide');
    let tx = 0, ty = 0, rx = 0, ry = 0, raf = 0, seen = false;
    const put = (n, x, y) => { n.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)'; };
    const tick = () => {
      raf = 0;
      rx += (tx - rx) * .2; ry += (ty - ry) * .2;
      if (Math.abs(tx - rx) < .3 && Math.abs(ty - ry) < .3) { rx = tx; ry = ty; } else raf = requestAnimationFrame(tick);
      put(ring, rx, ry);
    };
    const show = v => parts.forEach(n => { n.style.opacity = v ? '' : '0'; });
    const offs = [
      on(document, 'pointermove', e => {
        if (e.pointerType === 'touch') return;
        tx = e.clientX; ty = e.clientY;
        if (dot) put(dot, tx, ty);
        if (ring) { if (!seen) { rx = tx; ry = ty; put(ring, rx, ry); } else if (!raf) raf = requestAnimationFrame(tick); }
        seen = true; show(true);
        const h = !!(e.target.closest && e.target.closest(o.hover));
        parts.forEach(n => n.toggleAttribute('data-hover', h));
      }, { passive: true }),
      on(document, 'pointerdown', () => parts.forEach(n => n.setAttribute('data-down', ''))),
      on(document, 'pointerup', () => parts.forEach(n => n.removeAttribute('data-down'))),
      on(document.documentElement, 'pointerleave', () => { seen = false; show(false); }),
      on(window, 'blur', () => { seen = false; show(false); }),
    ];
    return () => {
      offs.forEach(f => f()); cancelAnimationFrame(raf);
      parts.forEach(n => n.remove());
      el.classList.remove('efx-cursor-hide');
    };
  },
};
