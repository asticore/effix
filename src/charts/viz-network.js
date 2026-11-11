/* viz-network — force-directed graph (own velocity-Verlet simulation, no deps).
   <div class="efx-viz-network" data-efx-data='{"nodes":[{"id":"a","group":"x"},{"id":"b"}],"links":[{"source":"a","target":"b"}]}'></div>
   Drag nodes, wheel/drag background to zoom/pan, hover highlights neighbours, arrows move between nodes. */
import { COMMON, chart, palette, s, esc } from './_lib.js';
import { on, motionOK } from '../core.js';

const arr = v => (Array.isArray(v) ? v : []);
const norm = d => {
  d = d && typeof d === 'object' ? d : {};
  const ix = new Map();
  const N = arr(d.nodes).map(n => (n && typeof n === 'object' ? { ...n } : { id: n })).filter(n => n.id != null).map((n, i) => (ix.set(String(n.id), i), { ...n, id: String(n.id), i }));
  const id = v => ix.get(String(v && typeof v === 'object' ? v.id : v));
  const L = arr(d.links).map(l => l && { s: id(l.source), t: id(l.target), v: +l.value || 1 }).filter(l => l && l.s != null && l.t != null && l.s !== l.t);
  return { N, L };
};

export default {
  name: 'viz-network',
  selector: '.efx-viz-network',
  lazy: true,
  defaults: { ...COMMON, height: 420, legend: false, label: false, zoom: true, linkDistance: 70, charge: 60, radius: 5 },
  init(el, o) {
    const read = r => { try { return norm(typeof r === 'string' ? JSON.parse(r) : r); } catch (e) { return norm(); } };
    const j = el.querySelector(':scope > script[type="application/json"]');
    let d = read((o.data || '').trim() || (j && j.textContent));
    const offData = on(el, 'efx:data', e => { d = e.detail ? norm(e.detail) : d; }); // before chart(): runs first
    let S, raf = 0, view = { k: 1, x: 0, y: 0 }, bound = 0, cur;
    const cancel = () => { cancelAnimationFrame(raf); raf = 0; };

    const tick = () => {
      const { N, L } = S, a = (S.a += (S.t - S.a) * S.dec), n = N.length;
      L.forEach(l => {
        const A = N[l.s], B = N[l.t];
        let dx = B.x + B.vx - A.x - A.vx || 1e-6, dy = B.y + B.vy - A.y - A.vy || 1e-6;
        const k = (Math.hypot(dx, dy) - o.linkDistance) / Math.hypot(dx, dy) * a * l.k;
        dx *= k; dy *= k;
        B.vx -= dx * l.b; B.vy -= dy * l.b; A.vx += dx * (1 - l.b); A.vy += dy * (1 - l.b);
      });
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const A = N[i], B = N[j];
        let dx = B.x - A.x || Math.random() * 1e-3, dy = B.y - A.y || Math.random() * 1e-3, d2 = dx * dx + dy * dy;
        if (d2 < 4e4) { const f = o.charge * a / Math.max(d2, 1); A.vx -= dx * f; A.vy -= dy * f; B.vx += dx * f; B.vy += dy * f; }
        const rr = A.r + B.r + 1, dd = Math.sqrt(d2);
        if (dd < rr) { const m = (rr - dd) / dd * 0.35; A.vx -= dx * m; A.vy -= dy * m; B.vx += dx * m; B.vy += dy * m; }
      }
      let sx = 0, sy = 0;
      N.forEach(p => { p.vx += (S.cx - p.x) * 0.03 * a; p.vy += (S.cy - p.y) * 0.03 * a; sx += p.x; sy += p.y; });
      sx = sx / n - S.cx; sy = sy / n - S.cy;
      N.forEach(p => {
        if (p.fx != null) { p.x = p.fx; p.y = p.fy; p.vx = p.vy = 0; } else { p.x += (p.vx *= 0.6) - sx; p.y += (p.vy *= 0.6) - sy; }
      });
    };

    const draw = ({ svg, g, w, h, deco }) => {
      cancel();
      if (!d.N.length) return [];
      const { N, L } = d;
      if (!S || S.src !== d) {
        const deg = N.map(() => 0);
        L.forEach(l => { deg[l.s]++; deg[l.t]++; });
        L.forEach(l => { l.k = 1 / Math.min(deg[l.s], deg[l.t]); l.b = deg[l.s] / (deg[l.s] + deg[l.t]); });
        const mean = N.reduce((a, n) => a + (+n.size || 1), 0) / N.length;
        N.forEach((n, i) => { const q = 10 * Math.sqrt(0.5 + i), t = i * 2.4; Object.assign(n, { x: w / 2 + q * Math.cos(t), y: h / 2 + q * Math.sin(t), vx: 0, vy: 0, fx: null, fy: null, r: o.radius * Math.sqrt((+n.size || 1) / mean), deg: deg[i] }); });
        S = { src: d, N, L, a: 1, t: 0, dec: 1 - Math.pow(0.001, 1 / 300), cx: w / 2, cy: h / 2 };
      } else {
        N.forEach(n => { n.x += w / 2 - S.cx; n.y += h / 2 - S.cy; });
        Object.assign(S, { cx: w / 2, cy: h / 2, a: Math.max(S.a, 0.3) });
      }
      const groups = [...new Set(N.map(n => n.group))], pal = palette(el, o, groups.length);
      const zg = s('g', { class: 'efx-viz__zoom', transform: `translate(${view.x} ${view.y}) scale(${view.k})` }, g);
      const lines = L.map(l => s('line', { class: 'efx-viz__link', 'stroke-width': Math.min(4, 0.6 + Math.sqrt(l.v)) }, zg));
      const circles = N.map((n, i) => s('circle', { r: n.r, fill: pal[groups.indexOf(n.group)], class: 'efx-chart__mark efx-chart__fade efx-viz__node', 'data-i': i, style: `--i:${i % 20}` }, zg));
      const texts = o.label && !deco ? N.map(n => { const t = s('text', { class: 'efx-viz__label', 'text-anchor': 'middle' }, zg); t.textContent = n.label ?? n.id; return t; }) : [];
      const marks = N.map((n, i) => ({
        label: String(n.label ?? n.id), series: n.group != null ? String(n.group) : '', value: n.size ?? n.deg, valueText: `${n.deg} link${n.deg === 1 ? '' : 's'}`, node: circles[i], index: i,
        rel: L.filter(l => l.s === i || l.t === i).map(l => (l.s === i ? l.t : l.s)),
        hit: (px, py) => Math.hypot(px - marks[i].x, py - marks[i].y) <= n.r * view.k + 3,
      }));
      const paint = () => {
        N.forEach((n, i) => {
          circles[i].setAttribute('cx', n.x); circles[i].setAttribute('cy', n.y);
          if (texts[i]) { texts[i].setAttribute('x', n.x); texts[i].setAttribute('y', n.y - n.r - 4); }
          marks[i].x = n.x * view.k + view.x; marks[i].y = n.y * view.k + view.y;
        });
        L.forEach((l, i) => { const A = N[l.s], B = N[l.t]; lines[i].setAttribute('x1', A.x); lines[i].setAttribute('y1', A.y); lines[i].setAttribute('x2', B.x); lines[i].setAttribute('y2', B.y); });
      };
      const still = () => !motionOK() || !o.animate;
      const frame = () => { raf = 0; tick(); paint(); if (S.a > 0.001 || S.t) raf = requestAnimationFrame(frame); };
      const go = () => {
        if (!still()) { if (!raf) raf = requestAnimationFrame(frame); return; }
        for (let i = 0; i < 300 && (S.a > 0.001 || (S.t && i < 20)); i++) tick();
        paint();
      };
      draw.onShow = m => lines.forEach((ln, i) => ln.classList.toggle('is-dim', !!m && L[i].s !== m.index && L[i].t !== m.index));
      go();
      if (deco) return marks;

      // pointer: drag a node (reheat) or pan the background; wheel zooms around the pointer
      cur = { go, paint, zg };
      if (!bound++) {
        const P = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) * (svg.viewBox.baseVal.width / r.width), (e.clientY - r.top) * (svg.viewBox.baseVal.height / r.height)]; };
        const apply = () => { cur.zg.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.k})`); cur.paint(); };
        let drag, pan;
        svg.addEventListener('pointerdown', e => {
          const i = e.target.getAttribute && e.target.getAttribute('data-i');
          if (i != null) { drag = S.N[i]; S.t = 0.3; svg.setPointerCapture(e.pointerId); cur.go(); }
          else if (o.zoom && e.pointerType !== 'touch') { pan = [e.clientX - view.x, e.clientY - view.y]; svg.setPointerCapture(e.pointerId); }
        });
        svg.addEventListener('pointermove', e => {
          if (drag) { const [x, y] = P(e); drag.fx = (x - view.x) / view.k; drag.fy = (y - view.y) / view.k; cur.go(); }
          else if (pan) { view.x = e.clientX - pan[0]; view.y = e.clientY - pan[1]; apply(); }
        });
        const up = () => { if (drag) { drag.fx = drag.fy = null; S.t = 0; cur.go(); } drag = pan = null; };
        svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
        if (o.zoom) svg.addEventListener('wheel', e => {
          e.preventDefault();
          const [x, y] = P(e), k = Math.max(0.3, Math.min(8, view.k * Math.exp(-e.deltaY * 0.0015))), q = k / view.k;
          view = { k, x: x - (x - view.x) * q, y: y - (y - view.y) * q };
          apply();
        }, { passive: false });
      }
      return marks;
    };
    draw.radius = 1;
    const stop = chart(el, o, draw);
    return () => { cancel(); offData(); stop(); };
  },
};
