/* viz-arc — arc diagram: nodes on a line, links as arcs above (width = value).
   <div class="efx-viz-arc" data-efx-data='{"nodes":[{"id":"a","group":"x"},{"id":"b"}],"links":[{"source":"a","target":"b","value":3}]}'></div>
   Same graph JSON as viz-network. data-efx-sort="group|degree" reorders nodes. */
import { COMMON, chart, palette, s, esc } from './_lib.js';
import { on } from '../core.js';

const arr = v => (Array.isArray(v) ? v : []);
const norm = (d, sort) => {
  d = d && typeof d === 'object' ? d : {};
  let N = arr(d.nodes).map(n => (n && typeof n === 'object' ? { ...n } : { id: n })).filter(n => n.id != null).map(n => ({ ...n, id: String(n.id), deg: 0 }));
  const id = v => String(v && typeof v === 'object' ? v.id : v);
  const L = arr(d.links).filter(l => l && N.some(n => n.id === id(l.source)) && N.some(n => n.id === id(l.target)) && id(l.source) !== id(l.target)).map(l => ({ s: id(l.source), t: id(l.target), v: +l.value || 1 }));
  L.forEach(l => N.forEach(n => { if (n.id === l.s || n.id === l.t) n.deg++; }));
  if (sort === 'group') N = N.map((n, i) => [n, i]).sort((a, b) => String(a[0].group).localeCompare(String(b[0].group)) || a[1] - b[1]).map(x => x[0]);
  else if (sort === 'degree') N = N.map((n, i) => [n, i]).sort((a, b) => b[0].deg - a[0].deg || a[1] - b[1]).map(x => x[0]);
  return { N, L };
};

export default {
  name: 'viz-arc',
  selector: '.efx-viz-arc',
  lazy: true,
  defaults: { ...COMMON, height: 280, legend: false, sort: '', radius: 5 },
  init(el, o) {
    const read = r => { try { return norm(typeof r === 'string' ? JSON.parse(r) : r, o.sort); } catch (e) { return norm(null); } };
    const j = el.querySelector(':scope > script[type="application/json"]');
    let d = read((o.data || '').trim() || (j && j.textContent));
    const offData = on(el, 'efx:data', e => { d = e.detail ? read(e.detail) : d; });
    const draw = ({ g, w, h, deco }) => {
      const { N, L } = d, n = N.length;
      if (!n) return [];
      const groups = [...new Set(N.map(x => x.group))], pal = palette(el, o, groups.length);
      const col = x => pal[groups.indexOf(x.group)];
      const pad = deco ? { t: 4, b: 4, l: 8, r: 8 } : { t: 8, b: 56, l: 16, r: 16 };
      const step = n > 1 ? (w - pad.l - pad.r) / (n - 1) : 0, y0 = h - pad.b;
      const X = i => (n > 1 ? pad.l + i * step : w / 2);
      const ix = new Map(N.map((x, i) => [x.id, i]));
      const ratio = Math.min(1, (y0 - pad.t) / Math.max(1, (n - 1) * step / 2));
      const maxV = Math.max(...L.map(l => l.v), 1);
      const marks = N.map((x, i) => ({ x: X(i), y: y0, label: x.label ?? x.id, series: x.group != null ? String(x.group) : '', value: x.deg, valueText: `${x.deg} link${x.deg === 1 ? '' : 's'}`, index: i, rel: [] }));
      L.forEach((l, k) => {
        const a = ix.get(l.s), b = ix.get(l.t), x1 = X(Math.min(a, b)), x2 = X(Math.max(a, b)), rx = (x2 - x1) / 2;
        const node = s('path', { d: `M${x1},${y0}A${rx},${rx * ratio} 0 0 1 ${x2},${y0}`, fill: 'none', stroke: col(N[a]), 'stroke-opacity': 0.4, 'stroke-width': +(1 + 4 * Math.sqrt(l.v / maxV)).toFixed(2), pathLength: 1, class: 'efx-chart__mark efx-chart__draw efx-viz__arc', style: `--i:${k % 20}` }, g);
        const m = marks.length;
        marks[a].rel.push(m); marks[b].rel.push(m);
        marks.push({ x: (x1 + x2) / 2, y: y0 - rx * ratio, label: `${N[a].label ?? N[a].id} → ${N[b].label ?? N[b].id}`, value: l.v, node, index: m, rel: [a, b], hit: (px, py) => py < y0 - 9 && node.isPointInStroke(new DOMPoint(px, py)) });
      });
      N.forEach((x, i) => {
        const r = o.radius * (1 + Math.min(1, x.deg / 8)) * (deco ? 0.7 : 1);
        marks[i].node = s('circle', { cx: X(i), cy: y0, r, fill: col(x), class: 'efx-chart__mark efx-chart__fade', style: `--i:${i % 20}` }, g);
        marks[i].hit = (px, py) => Math.hypot(px - X(i), py - y0) <= r + 4;
        if (!deco && step > 11) {
          const t = s('text', { x: X(i), y: y0 + r + 8, class: 'efx-viz__label efx-chart__fade', 'text-anchor': step < 40 ? 'end' : 'middle', 'dominant-baseline': 'hanging', style: `--i:${i % 20}` }, g);
          if (step < 40) t.setAttribute('transform', `rotate(-60 ${X(i)} ${y0 + r + 8})`);
          t.textContent = x.label ?? x.id;
        }
      });
      return marks;
    };
    draw.radius = 1;
    const stop = chart(el, o, draw);
    return () => { offData(); stop(); };
  },
};
