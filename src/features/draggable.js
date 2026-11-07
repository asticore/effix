/* draggable — pointer-drag any element (mouse, touch, pen) with spring snap-back, inertia, bounds and grid snap.
   <div class="efx-draggable" data-efx-bounds="parent" data-efx-release="spring">Drag me</div>
   Moves with the `translate` property. Arrow keys nudge it when focused. Emits efx:dragstart / efx:drag / efx:dragend ({x,y}). */
import { on, motionOK } from '../core.js';

const KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

export default {
  name: 'draggable',
  selector: '.efx-draggable',
  defaults: { axis: 'both', bounds: 'parent', release: 'spring', spring: '170,18', friction: 0.92, bounce: 0.5, snap: 0, step: 10, handle: '' },
  init(el, o) {
    const ax = o.axis === 'x' || o.axis === 'y' ? o.axis : 'both';
    const sp = o.spring.split(',').map(parseFloat), k = sp[0] > 0 ? sp[0] : 170, c = sp[1] >= 0 ? sp[1] : 18;
    const handle = (o.handle && el.querySelector(o.handle)) || el;
    const st = el.style, hs = handle.style;
    const saved = { tr: st.translate, ta: hs.touchAction, cu: hs.cursor, ti: el.getAttribute('tabindex'), ro: el.getAttribute('role'), rd: el.getAttribute('aria-roledescription') };
    let x = 0, y = 0, id = 0, drag = null, block = false, lim = [-Infinity, Infinity, -Infinity, Infinity], offW = [];
    const emit = n => el.dispatchEvent(new CustomEvent('efx:' + n, { bubbles: true, detail: { x, y } }));
    const put = () => { st.translate = x + 'px ' + y + 'px'; };
    const stop = () => { cancelAnimationFrame(id); id = 0; };
    const snap = v => (o.snap > 0 ? Math.round(v / o.snap) * o.snap : v);
    const fit = (v, lo, hi) => Math.min(hi, Math.max(lo, snap(v)));
    const limits = () => {
      const box = o.bounds === 'none' ? null : o.bounds === 'parent' ? el.parentElement : document.querySelector(o.bounds) || el.parentElement;
      if (!box) return [-Infinity, Infinity, -Infinity, Infinity];
      const r = el.getBoundingClientRect(), p = box.getBoundingClientRect();
      const x0 = x + p.left - r.left, y0 = y + p.top - r.top;
      return [x0, Math.max(x0, x + p.right - r.right), y0, Math.max(y0, y + p.bottom - r.bottom)];
    };
    // rAF integrator; step(dt seconds) returns false once settled
    const run = step => {
      let last = performance.now();
      const f = now => {
        const dt = Math.min(0.032, (now - last) / 1000); last = now;
        const more = step(dt);
        put();
        id = more ? requestAnimationFrame(f) : 0;
      };
      id = requestAnimationFrame(f);
    };
    const release = (vx, vy) => {
      if (o.release === 'stay') return;
      if (!motionOK()) { if (o.release === 'spring') { x = 0; y = 0; } return put(); }
      if (o.release === 'spring') {
        run(dt => { // semi-implicit Euler: update velocity first, then position with the new velocity
          vx += (-k * x - c * vx) * dt; vy += (-k * y - c * vy) * dt;
          x += vx * dt; y += vy * dt;
          if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1 && Math.abs(vx) < 2 && Math.abs(vy) < 2) { x = y = 0; return false; }
          return true;
        });
      } else {
        run(dt => {
          const f = Math.pow(o.friction, dt * 60);
          vx *= f; vy *= f; x += vx * dt; y += vy * dt;
          if (x < lim[0] || x > lim[1]) { x = x < lim[0] ? lim[0] : lim[1]; vx = -vx * o.bounce; }
          if (y < lim[2] || y > lim[3]) { y = y < lim[2] ? lim[2] : lim[3]; vy = -vy * o.bounce; }
          if (Math.hypot(vx, vy) < 8) { x = fit(x, lim[0], lim[1]); y = fit(y, lim[2], lim[3]); return false; }
          return true;
        });
      }
    };
    const mv = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
      if (!drag.on) {
        if (Math.hypot(dx, dy) < 4) return;
        drag.on = true; el.classList.add('is-dragging');
        try { handle.setPointerCapture(e.pointerId); } catch (_) {}
        emit('dragstart');
      }
      x = ax === 'y' ? x : fit(drag.sx + dx, lim[0], lim[1]);
      y = ax === 'x' ? y : fit(drag.sy + dy, lim[2], lim[3]);
      put();
      const s = drag.s; s.push([e.timeStamp, x, y]);
      while (s.length > 2 && e.timeStamp - s[0][0] > 100) s.shift();
      emit('drag');
    };
    const up = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag, s = d.s;
      drag = null; offW.forEach(f => f()); offW = [];
      try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
      el.classList.remove('is-dragging');
      if (!d.on) return;
      block = true; setTimeout(() => { block = false; });
      const a = s[0], b = s[s.length - 1], dt = a && b && b[0] > a[0] ? (b[0] - a[0]) / 1000 : 0;
      const fresh = b && e.timeStamp - b[0] < 80;
      emit('dragend');
      release(dt && fresh ? (b[1] - a[1]) / dt : 0, dt && fresh ? (b[2] - a[2]) / dt : 0);
    };
    const offs = [
      on(handle, 'pointerdown', e => {
        if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest('input,textarea,select,[contenteditable]')) return;
        stop(); lim = limits();
        drag = { id: e.pointerId, px: e.clientX, py: e.clientY, sx: x, sy: y, s: [], on: false };
        offW = [on(window, 'pointermove', mv), on(window, 'pointerup', up), on(window, 'pointercancel', up)];
      }),
      on(handle, 'dragstart', e => e.preventDefault()),
      on(el, 'click', e => { if (block) { e.preventDefault(); e.stopPropagation(); } }, true),
      on(el, 'keydown', e => {
        const m = KEYS[e.key];
        if (e.target !== el || !m || e.altKey || e.ctrlKey || e.metaKey || (ax === 'x' && m[1]) || (ax === 'y' && m[0])) return;
        e.preventDefault(); stop();
        const L = limits(), s = (o.snap > 0 ? o.snap : o.step) * (e.shiftKey ? 5 : 1);
        x = Math.min(L[1], Math.max(L[0], x + m[0] * s)); y = Math.min(L[3], Math.max(L[2], y + m[1] * s));
        put(); emit('drag');
      }),
    ];
    hs.touchAction = 'none'; hs.cursor = 'grab';
    if (saved.ti === null) el.setAttribute('tabindex', '0');
    if (saved.ro === null) el.setAttribute('role', 'group');
    el.setAttribute('aria-roledescription', 'draggable');
    el.classList.add('efx-draggable-on');
    return () => {
      stop(); offs.forEach(f => f()); offW.forEach(f => f());
      st.translate = saved.tr; hs.touchAction = saved.ta; hs.cursor = saved.cu;
      const attr = (n, v) => (v === null ? el.removeAttribute(n) : el.setAttribute(n, v));
      attr('tabindex', saved.ti); attr('role', saved.ro); attr('aria-roledescription', saved.rd);
      el.classList.remove('efx-draggable-on', 'is-dragging');
    };
  },
};
