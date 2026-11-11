/* viz-parallel — parallel coordinates with axis brushing.
   <div class="efx-viz-parallel" data-efx-data='[{"name":"A","group":"x","mpg":30,"hp":90},{"name":"B","group":"y","mpg":18,"hp":180}]'></div>
   Or labels = dimensions, series = rows. Drag an axis to filter, double-click it to clear. */
import { COMMON, chart, palette, nice, linear, s, esc } from './_lib.js';
import { on } from '../core.js';

const rowsOf = d => { d = Array.isArray(d) ? d : d && d.rows; return Array.isArray(d) && d.length && d.every(r => r && typeof r === 'object' && !Array.isArray(r) && !('data' in r) && !('values' in r)) ? d : null; };
const parse = r => { try { return rowsOf(typeof r === 'string' ? JSON.parse(r) : r); } catch (e) { return null; } };
const prep = (R, o) => {
  const dims = (o.dims.length ? o.dims : [...new Set(R.flatMap(r => Object.keys(r)))].filter(k => k !== 'name' && k !== o.group)).filter(k => R.some(r => Number.isFinite(parseFloat(r[k]))));
  const groups = [...new Set(R.map(r => String(r[o.group] ?? '')))];
  return { dims, groups, rows: R.map((r, i) => ({ name: String(r.name ?? i + 1), grp: groups.indexOf(String(r[o.group] ?? '')), vals: dims.map(k => parseFloat(r[k])) })) };
};
const dseg = (px, py, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
};
const stub = P => ({ labels: P.groups, series: [{ name: '', values: P.groups.map(() => 0) }] });

export default {
  name: 'viz-parallel',
  selector: '.efx-viz-parallel',
  lazy: true,
  defaults: { ...COMMON, dims: [], group: 'group', height: 340, opacity: 0.65 },
  init(el, o) {
    const j = el.querySelector(':scope > script[type="application/json"]');
    let P = null, R = parse(o.data || (j && j.textContent));
    const mk = () => { P = R && prep(R, o); if (draw) draw.legendByLabel = !!P && P.groups.length > 1; };
    let draw;
    mk();
    const o2 = { ...o, source: '', data: P ? JSON.stringify(stub(P)) : o.data };
    const brush = {};
    const offData = on(el, 'efx:data', e => {
      const r = rowsOf(e.detail);
      if (r && Array.isArray(e.detail)) { e.stopImmediatePropagation(); P = prep(r, o); R = r; draw.legendByLabel = P.groups.length > 1; el.dispatchEvent(new CustomEvent('efx:data', { detail: { ...stub(P), rows: r } })); return; }
      R = r; mk();
    });
    draw = ({ g, svg, w, h, data, hidden, visible, colors, deco, fmt }) => {
      let D, rows;
      if (P) {
        D = P.dims; const cols = palette(el, o, P.groups.length);
        rows = P.rows.filter(r => !(draw.legendByLabel && hidden.has(r.grp))).map(r => ({ ...r, color: cols[r.grp] }));
      } else { D = data.labels; rows = visible.map(x => ({ name: x.name, vals: x.values, color: colors[x.index], grp: x.index })); }
      const nd = D.length;
      if (!nd || !rows.length) return [];
      const pad = deco ? { t: 4, r: 4, b: 4, l: 4 } : { t: 30, r: 16, b: 12, l: 38 };
      const X = i => nd > 1 ? pad.l + i * (w - pad.l - pad.r) / (nd - 1) : w / 2;
      const ys = D.map((_, i) => { const a = rows.map(r => r.vals[i]).filter(Number.isFinite), sc = nice(Math.min(...a), Math.max(...a), 4); return { sc, y: linear([sc.min, sc.max], [h - pad.b, pad.t]) }; });
      const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
      if (!deco) D.forEach((d, i) => {
        s('line', { x1: X(i), x2: X(i), y1: pad.t, y2: h - pad.b, stroke: 'var(--efx-chart-text)', 'stroke-opacity': 0.5 }, ax);
        s('text', { x: X(i), y: pad.t - 12, 'text-anchor': i === 0 && nd > 1 ? 'start' : i === nd - 1 && nd > 1 ? 'end' : 'middle', style: 'font-weight:600' }, ax).textContent = d;
        ys[i].sc.ticks.forEach(t => {
          s('line', { x1: X(i) - 3, x2: X(i), y1: ys[i].y(t), y2: ys[i].y(t), stroke: 'var(--efx-chart-text)', 'stroke-opacity': 0.5 }, ax);
          s('text', { x: X(i) - 6, y: ys[i].y(t), 'text-anchor': 'end', 'dominant-baseline': 'middle', style: 'font-size:10px' }, ax).textContent = fmt(t);
        });
      });
      const marks = [];
      const nodes = rows.map((r, k) => {
        const pts = r.vals.map((v, i) => [X(i), ys[i].y(Number.isFinite(v) ? v : ys[i].sc.min)]);
        const node = s('path', { d: 'M' + pts.map(p => p.join(',')).join('L'), fill: 'none', stroke: r.color, 'stroke-width': deco ? 1.5 : 1.6, 'stroke-opacity': o.opacity, 'stroke-linejoin': 'round', pathLength: 1, class: 'efx-chart__mark efx-chart__draw efx-pc__line', style: `--i:${k * Math.min(1, 12 / rows.length)}` }, g);
        const mid = Math.floor((nd - 1) / 2);
        marks.push({ x: pts[mid][0], y: pts[mid][1], label: r.name, value: 0, node, index: k, group: undefined,
          html: `<strong>${esc(r.name)}</strong>` + D.map((d, i) => `<span>${esc(d)} <b>${esc(fmt(r.vals[i]))}</b></span>`).join(''),
          hit: (px, py) => !node.classList.contains('is-off') && pts.slice(1).some((p, i) => dseg(px, py, pts[i], p) < 6) });
        return node;
      });
      draw.onShow = m => { if (m) g.appendChild(m.node); };
      const sels = [];
      const apply = () => {
        rows.forEach((r, k) => nodes[k].classList.toggle('is-off', D.some((d, i) => brush[d] && !(r.vals[i] >= brush[d][0] && r.vals[i] <= brush[d][1]))));
        sels.forEach((r, i) => { const b = brush[D[i]]; r.setAttribute('visibility', b ? 'visible' : 'hidden'); if (b) { r.setAttribute('y', ys[i].y(b[1])); r.setAttribute('height', ys[i].y(b[0]) - ys[i].y(b[1])); } });
      };
      if (!deco) D.forEach((d, i) => {
        const sel = s('rect', { x: X(i) - 5, width: 10, rx: 2, class: 'efx-pc__sel', visibility: 'hidden' }, g); sels.push(sel);
        const ov = s('rect', { x: X(i) - 12, y: pad.t, width: 24, height: h - pad.t - pad.b, fill: 'transparent', class: 'efx-pc__ov' }, g);
        on(ov, 'click', e => e.stopPropagation());
        on(ov, 'dblclick', () => { delete brush[d]; apply(); });
        on(ov, 'pointerdown', e => {
          e.preventDefault();
          const r = svg.getBoundingClientRect(), py = ev => Math.max(pad.t, Math.min(h - pad.b, (ev.clientY - r.top) * (h / r.height))), y0 = py(e);
          const mv = ev => { const y1 = py(ev); if (Math.abs(y1 - y0) > 2) { brush[d] = [ys[i].y.invert(Math.max(y0, y1)), ys[i].y.invert(Math.min(y0, y1))]; apply(); } };
          const o1 = on(window, 'pointermove', mv), o2 = on(window, 'pointerup', () => { o1(); o2(); });
        });
      });
      apply();
      return marks;
    };
    draw.legendByLabel = !!P && P.groups.length > 1;
    const off = chart(el, o2, draw);
    return () => { offData(); off(); };
  },
};
