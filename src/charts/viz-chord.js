/* viz-chord — chord diagram from a square flow matrix (row = source, column = target).
   <div class="efx-viz-chord" data-efx-labels="A|B|C" data-efx-data="[[0,5,2],[3,0,4],[1,2,0]]"></div>
   or data-efx-data='{"labels":["A","B"],"matrix":[[0,5],[3,0]]}' */
import { COMMON, chart, palette, polar, s, esc } from './_lib.js';
import { on } from '../core.js';

const TAU = Math.PI * 2;
const norm = (d, o) => {
  if (Array.isArray(d)) d = { matrix: d };
  d = d && typeof d === 'object' ? d : {};
  const M = (Array.isArray(d.matrix) ? d.matrix : []).map(r => (Array.isArray(r) ? r : []).map(v => Math.max(0, +v || 0)));
  const n = M.length, L = o.labels.length ? o.labels : Array.isArray(d.labels) ? d.labels : [];
  return { M: M.map(r => Array.from({ length: n }, (_, i) => r[i] || 0)), L: M.map((_, i) => String(L[i] ?? i + 1)) };
};

export default {
  name: 'viz-chord',
  selector: '.efx-viz-chord',
  lazy: true,
  defaults: { ...COMMON, height: 380, legend: false, gap: 0.04 },
  init(el, o) {
    const read = r => { try { return norm(typeof r === 'string' ? JSON.parse(r) : r, o); } catch (e) { return norm(null, o); } };
    const j = el.querySelector(':scope > script[type="application/json"]');
    let d = read((o.data || '').trim() || (j && j.textContent));
    const offData = on(el, 'efx:data', e => { d = e.detail ? read(e.detail) : d; });
    const draw = ({ g, w, h, colors, fmt, deco }) => {
      const { M, L } = d, n = M.length;
      const tot = M.map((r, i) => r.reduce((a, v) => a + v, 0) + M.reduce((a, q) => a + q[i], 0) - M[i][i]);
      const sum = M.reduce((a, r) => a + r.reduce((x, v) => x + v, 0), 0);
      if (!n || !sum) return [];
      const pal = palette(el, o, n);
      const out = M.map(r => r.reduce((a, v) => a + v, 0)), inn = M.map((_, i) => M.reduce((a, r) => a + r[i], 0)), k = (TAU - n * o.gap) / tot.reduce((a, v) => a + v, 0);
      let a = 0;
      // group i spans (row + column - diagonal); inside it, slot toward j is M[i][j] + M[j][i] (diagonal once), ordered by j
      const A = tot.map(t => { const r = [a, a + t * k]; a += t * k + o.gap; return r; });
      const sub = M.map((_, i) => { let p = A[i][0]; return M.map((__, j) => { const q = [p, p + (i === j ? M[i][i] : M[i][j] + M[j][i]) * k]; p = q[1]; return q; }); });
      const pad = deco ? 4 : 18 + Math.min(90, Math.max(...L.map(l => l.length)) * 6);
      const R = Math.max(30, Math.min(w - 2 * pad, h - 2 * (deco ? 4 : 24)) / 2), cx = w / 2, cy = h / 2, ri = R - (deco ? R * 0.1 : 12);
      const P = (r, an) => polar(cx, cy, r, an).join(',');
      const arc = (r, a0, a1, sw = 1) => `A${r},${r} 0 ${Math.abs(a1 - a0) > Math.PI ? 1 : 0} ${sw} ${P(r, a1)}`;
      const hit = node => (px, py) => node.isPointInFill(new DOMPoint(px, py));
      const marks = [];
      M.forEach((_, i) => {
        const [a0, a1] = A[i], m = (a0 + a1) / 2, e = Math.min(a1, a0 + TAU - 1e-4), c = polar(cx, cy, (R + ri) / 2, m);
        const node = s('path', { d: `M${P(R, a0)}${arc(R, a0, e)}L${P(ri, e)}${arc(ri, e, a0, 0)}Z`, fill: pal[i], class: 'efx-chart__mark efx-chart__fade', style: `--i:${i}` }, g);
        marks.push({ x: c[0], y: c[1], label: L[i], value: tot[i], node, index: i, rel: [], hit: hit(node),
          html: `<strong>${esc(L[i])}</strong><span>out ${esc(fmt(out[i]))} · in ${esc(fmt(inn[i]))}</span>` });
        if (!deco) {
          const [x, y] = polar(cx, cy, R + 8, m), sn = Math.sin(m), cs = Math.cos(m);
          s('text', { x, y, 'text-anchor': sn > 0.1 ? 'start' : sn < -0.1 ? 'end' : 'middle', 'dominant-baseline': cs > 0.3 ? 'auto' : cs < -0.3 ? 'hanging' : 'middle', class: 'efx-chart__value efx-viz__label efx-chart__fade', style: `--i:${i}` }, g).textContent = L[i];
        }
      });
      M.forEach((_, i) => M.forEach((__, j) => {
        if (j < i || M[i][j] + M[j][i] <= 0) return;
        const [s0, s1] = sub[i][j], [t0, t1] = sub[j][i], rib = marks.length, same = i === j;
        const node = s('path', { d: `M${P(ri, s0)}${arc(ri, s0, s1)}` + (same ? '' : `Q${cx},${cy} ${P(ri, t0)}${arc(ri, t0, t1)}`) + `Q${cx},${cy} ${P(ri, s0)}Z`,
          fill: pal[M[i][j] >= M[j][i] ? i : j], 'fill-opacity': 0.6, class: 'efx-chart__mark efx-chart__fade', style: `--i:${rib}` }, g);
        const c = polar(cx, cy, ri * 0.6, same ? (s0 + s1) / 2 : (s0 + s1 + t0 + t1) / 4), f = v => esc(fmt(v));
        marks[i].rel.push(rib); if (!same) marks[j].rel.push(rib);
        marks.push({ x: c[0], y: c[1], label: same ? L[i] : `${L[i]} → ${L[j]}`, value: M[i][j] + M[j][i], node, index: rib, rel: same ? [i] : [i, j], hit: hit(node),
          html: same ? `<strong>${esc(L[i])} → ${esc(L[i])}: ${f(M[i][i])}</strong>` : `<strong>${esc(L[i])} → ${esc(L[j])}: ${f(M[i][j])}, ${esc(L[j])} → ${esc(L[i])}: ${f(M[j][i])}</strong>` });
      }));
      return marks;
    };
    draw.radius = 1;
    const stop = chart(el, o, draw);
    return () => { offData(); stop(); };
  },
};
