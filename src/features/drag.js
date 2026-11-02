/* drag — mouse drag-to-scroll with inertia for any overflowing container (works with Shine .carousel).
   <div class="efx-drag" style="overflow-x:auto">…</div>   axis: x | y | both. Touch keeps scrolling natively. */
import { on, motionOK } from '../core.js';

export default {
  name: 'drag',
  selector: '.efx-drag',
  defaults: { inertia: true, axis: 'x' },
  init(el, o) {
    const ax = o.axis === 'y' || o.axis === 'both' ? o.axis : 'x';
    const inertia = o.inertia && motionOK();
    const st = el.style, saved = [st.scrollSnapType, st.scrollBehavior];
    let id = 0, down = null, moved = 0, block = false, vx = 0, vy = 0, offsMove = [];
    const stopInertia = () => { cancelAnimationFrame(id); id = 0; };
    const restore = () => { st.scrollSnapType = saved[0]; st.scrollBehavior = saved[1]; el.classList.remove('is-dragging'); };
    const glide = () => {
      vx *= .95; vy *= .95;
      if (Math.abs(vx) < .1 && Math.abs(vy) < .1) { id = 0; return restore(); }
      el.scrollLeft -= vx; el.scrollTop -= vy;
      id = requestAnimationFrame(glide);
    };
    const mv = e => {
      if (!down) return;
      const dx = ax === 'y' ? 0 : e.clientX - down.x, dy = ax === 'x' ? 0 : e.clientY - down.y;
      moved += Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y);
      if (!el.classList.contains('is-dragging') && moved > 5) {
        el.classList.add('is-dragging'); st.scrollSnapType = 'none'; st.scrollBehavior = 'auto';
        try { el.setPointerCapture(e.pointerId); } catch (_) {}
      }
      if (!el.classList.contains('is-dragging')) return;
      el.scrollLeft -= dx; el.scrollTop -= dy;
      vx = dx; vy = dy;
      down.x = e.clientX; down.y = e.clientY;
    };
    const up = e => {
      if (!down) return;
      const dragged = moved > 5;
      offsMove.forEach(f => f()); offsMove = [];
      try { el.releasePointerCapture(down.id); } catch (_) {}
      down = null;
      if (dragged) { block = true; setTimeout(() => { block = false; }); }
      if (dragged && inertia) id = requestAnimationFrame(glide); else restore();
    };
    const offs = [
      on(el, 'pointerdown', e => {
        if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('input,textarea,select,[contenteditable]')) return;
        stopInertia(); restore();
        down = { x: e.clientX, y: e.clientY, id: e.pointerId }; moved = vx = vy = 0;
        offsMove = [on(window, 'pointermove', mv), on(window, 'pointerup', up), on(window, 'pointercancel', up)];
      }),
      on(el, 'click', e => { if (block) { e.preventDefault(); e.stopPropagation(); } }, true),
      on(el, 'dragstart', e => e.preventDefault()),
    ];
    el.classList.add('efx-drag-on');
    return () => {
      stopInertia(); offs.forEach(f => f()); offsMove.forEach(f => f());
      restore(); el.classList.remove('efx-drag-on');
    };
  },
};
