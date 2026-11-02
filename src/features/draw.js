/* draw — SVG stroke drawing, scrubbed by scroll or played once when visible.
   <svg class="efx-draw" data-efx-mode="scroll">…paths…</svg>   or a container holding an <svg>.
   Only elements marked [data-efx-draw-item] are drawn if any exist. Reduced motion = fully drawn. */
import { onScroll, onVisible, motionOK } from '../core.js';

const SHAPES = 'path,line,polyline,polygon,circle,ellipse,rect';
const clamp = v => Math.min(1, Math.max(0, v));

export default {
  name: 'draw',
  selector: '.efx-draw',
  defaults: { mode: 'scroll', duration: 1500, start: 0, end: 0.7, stagger: 0, fill: false },
  init(el, o) {
    if (!motionOK()) return;
    const root = el.matches('svg') ? el : el.querySelector('svg');
    if (!root) return;
    const marked = root.querySelectorAll('[data-efx-draw-item]');
    const items = [...(marked.length ? marked : root.querySelectorAll(SHAPES))].filter(n => n.getTotalLength);
    const parts = items.map(n => {
      let len = 0;
      try { len = n.getTotalLength(); } catch (e) { /* not rendered */ }
      const s = n.style;
      const p = { n, len, saved: [s.strokeDasharray, s.strokeDashoffset, s.fill, s.fillOpacity] };
      if (o.fill && getComputedStyle(n).fill === 'none') s.fill = getComputedStyle(n).stroke;
      return p;
    }).filter(p => p.len > 0);
    if (!parts.length) return;
    const n = parts.length, st = o.stagger;
    const set = (p, q) => {
      p.n.style.strokeDashoffset = (p.len * (1 - q)).toFixed(2);
      if (o.fill) p.n.style.fillOpacity = clamp((q - 0.8) / 0.2).toFixed(2);
    };
    parts.forEach(p => { p.n.style.strokeDasharray = p.len; set(p, 0); });
    let stop = () => {}, anims = [];
    if (o.mode === 'view') {
      stop = onVisible(el, v => {
        if (!v) return;
        stop();
        parts.forEach((p, i) => {
          const a = p.n.animate({ strokeDashoffset: [p.len, 0] }, { duration: o.duration, delay: i * st, easing: 'ease-in-out', fill: 'both' });
          anims.push(a);
          if (o.fill) anims.push(p.n.animate({ fillOpacity: [0, 1] }, { duration: o.duration * 0.3, delay: i * st + o.duration * 0.7, fill: 'both' }));
        });
      });
    } else {
      const span = (o.end - o.start) || 1, tail = Math.max(0.05, 1 - (n - 1) * st);
      stop = onScroll((y, vh) => {
        const r = el.getBoundingClientRect();
        const q = clamp(((vh - r.top) / (vh + r.height) - o.start) / span);
        return () => parts.forEach((p, i) => set(p, clamp((q - i * st) / tail)));
      });
    }
    return () => {
      stop();
      anims.forEach(a => a.cancel());
      parts.forEach(p => {
        const s = p.n.style;
        [s.strokeDasharray, s.strokeDashoffset, s.fill, s.fillOpacity] = p.saved;
      });
    };
  },
};
