/* beam — animated SVG connector beams between elements (integration diagrams).
   <div class="efx-beam" data-efx-links="#a>#hub|#b>#hub|#hub>#c">…nodes…</div>
   Selectors are scoped to the container. Options: curvature, speed (s), width, color, reverse. */
import { onVisible, motionOK, on, rafThrottle } from '../core.js';

const NS = 'http://www.w3.org/2000/svg';
const mk = (t, a, p) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); p && p.appendChild(n); return n; };
let uid = 0;

export default {
  name: 'beam',
  selector: '.efx-beam',
  defaults: { links: '', curvature: 40, speed: 3, width: 2, color: '', reverse: false },
  init(el, o) {
    const q = s => { try { return el.querySelector(s); } catch (e) { return null; } };
    const L = o.links.split('|').map(s => s.split('>').map(x => x.trim())).filter(l => l.length === 2 && l[0] && l[1])
      .map(([a, b]) => [q(a), q(b)]).filter(l => l[0] && l[1]);
    if (!L.length) return;
    let restore = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restore = true; }
    const motion = motionOK(), id = 'efx-beam-' + ++uid;
    const svg = mk('svg', { class: 'efx-beam__svg', 'aria-hidden': 'true' });
    svg.style.setProperty('--efx-beam-s', o.speed + 's');
    const parts = L.map((l, i) => {
      const g = mk('linearGradient', { id: id + i, gradientUnits: 'userSpaceOnUse' }, svg);
      const stops = o.color ? [o.color, o.color] : ['var(--sh-primary,#6366f1)', 'var(--sh-accent,#ec4899)'];
      stops.forEach((c, k) => mk('stop', { offset: k, style: 'stop-color:' + c }, g));
      const at = { class: 'efx-beam__path', stroke: `url(#${id + i})`, 'stroke-width': o.width, pathLength: 100 };
      const base = mk('path', { ...at, opacity: motion ? .18 : .6 }, svg);
      const run = motion && mk('path', { ...at, class: 'efx-beam__path efx-beam__run' + (o.reverse ? ' efx-beam__rev' : ''), 'stroke-dasharray': '25 200' }, svg);
      if (run) run.style.animationDelay = -(i * o.speed / 3) + 's';
      return { g, base, run };
    });
    el.appendChild(svg);

    const layout = () => {
      const r = el.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      L.forEach(([a, b], i) => {
        const pt = n => { const t = n.getBoundingClientRect(); return [t.left - r.left + t.width / 2, t.top - r.top + t.height / 2]; };
        const [ax, ay] = pt(a), [bx, by] = pt(b), p = parts[i];
        const d = `M${ax},${ay} Q${(ax + bx) / 2},${(ay + by) / 2 - o.curvature} ${bx},${by}`;
        p.base.setAttribute('d', d); p.run && p.run.setAttribute('d', d);
        [['x1', ax], ['y1', ay], ['x2', bx], ['y2', by]].forEach(([k, v]) => p.g.setAttribute(k, v));
      });
    };
    const lay = rafThrottle(layout);
    layout();
    const offs = [on(window, 'resize', lay), onVisible(el, v => svg.classList.toggle('is-paused', !v))];
    let ro;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(lay); ro.observe(el); L.forEach(l => l.forEach(n => ro.observe(n))); }
    return () => { lay.cancel(); ro && ro.disconnect(); offs.forEach(f => f()); svg.remove(); if (restore) el.style.position = ''; };
  },
};
