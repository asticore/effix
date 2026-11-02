/* chart-combo — bars + lines on one plot, optional second (right) y-axis.
   <div class="efx-chart-combo" data-efx-data='[{"name":"Revenue","data":[4,6,5],"type":"bar"},{"name":"Margin %","data":[20,30,25],"type":"line","axis":"right"}]' data-efx-labels="Jan|Feb|Mar"></div>
   Or plain data + data-efx-types="bar|line" data-efx-axes="left|right". */
import { COMMON, chart, nice, linear, band, linePath, axes, formatter, s, esc } from './_lib.js';
import { on } from '../core.js';

const safeColor = c => { try { return typeof c === 'string' && CSS.supports('color', c) && !/[;{}"'<>]/.test(c) ? c : '#6366f1'; } catch (e) { return '#6366f1'; } };
const metaOf = r => (Array.isArray(r) ? r : r && (r.series || r.datasets)) || [];
let uid = 0;

export default {
  name: 'chart-combo',
  selector: '.efx-chart-combo',
  lazy: true,
  defaults: { ...COMMON, types: [], axes: [], smooth: true, dots: true, area: false, grid: true, radius: 4, prefix2: '', suffix2: '' },
  init(el, o) {
    // per-series type/axis live in the raw JSON (parseData drops them); keep them in step with efx:data
    let meta = [];
    try {
      const j = el.querySelector(':scope > script[type="application/json"]');
      const raw = !o.source && o.data && /^\s*[[{]/.test(o.data) ? o.data : j && j.textContent;
      if (raw) meta = metaOf(JSON.parse(raw));
    } catch (e) {}
    const offData = on(el, 'efx:data', e => { if (e.detail && e.detail.series) meta = metaOf(e.detail); }); // before chart(): runs first
    const fmt2 = formatter({ ...o, prefix: o.prefix2, suffix: o.suffix2 });
    const kind = i => { const t = (meta[i] && meta[i].type) || o.types[i] || (i ? 'line' : 'bar'); return t === 'line' ? 'line' : 'bar'; };
    const side = i => ((meta[i] && meta[i].axis) || o.axes[i]) === 'right' ? 1 : 0;

    const draw = ({ g, w, h, data, visible, colors, fmt, deco }) => {
      const n = data.labels.length;
      if (!n || !visible.length) return [];
      const rows = visible.map(sr => ({ sr, k: kind(sr.index), a: side(sr.index), c: colors[sr.index] }));
      const right = !deco && rows.some(r => r.a);
      const pad = deco ? { t: 6, r: 0, b: 6, l: 0 } : { t: 12, r: right ? 48 : 16, b: 28, l: 44 };
      const cnt = Math.max(2, Math.floor(h / 50));
      const sc = [0, 1].map(a => {
        const rr = rows.filter(r => r.a === a);
        if (!rr.length) return null;
        const vals = rr.flatMap(r => r.sr.values.map(v => v || 0)).concat(rr.some(r => r.k === 'bar') ? 0 : []);
        const nc = nice(Math.min(...vals), Math.max(...vals), cnt);
        return { ...nc, f: linear([nc.min, nc.max], [h - pad.b, pad.t]) };
      });
      const L = sc[0] || sc[1], Y = r => sc[r.a].f;
      const b = band(n, [pad.l, w - pad.r], 0.3);
      const cx = i => b.x(i) + b.bw / 2;
      if (!deco) {
        axes(g, { w, h, pad, y: L.f, ticks: L.ticks, labels: data.labels, x: cx, fmt: sc[0] ? fmt : fmt2, grid: o.grid });
        if (right) {
          const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
          const R = sc[1];
          R.ticks.forEach(t => { s('text', { x: w - pad.r + 8, y: R.f(t), 'dominant-baseline': 'middle' }, ax).textContent = fmt2(t); });
        }
      }
      const bars = rows.filter(r => r.k === 'bar'), bw = b.bw / Math.max(1, bars.length);
      bars.forEach((r, k) => {
        const f = Y(r), z = f(0);
        r.sr.values.forEach((v, i) => {
          if (i >= n) return;
          const y1 = f(v || 0), thick = Math.max(1, bw - (bars.length > 1 ? 2 : 0));
          s('rect', { x: b.x(i) + k * bw, y: Math.min(z, y1), width: thick, height: Math.abs(y1 - z), rx: Math.min(o.radius, thick / 2), fill: r.c, class: 'efx-chart__grow', style: `--i:${i}` }, g);
        });
      });
      const base = h - pad.b;
      rows.filter(r => r.k === 'line').forEach((r, k) => {
        const pts = r.sr.values.slice(0, n).map((v, i) => [cx(i), Y(r)(v || 0)]);
        if (o.area && pts.length > 1) {
          const id = 'efx-cg' + ++uid, defs = s('defs', {}, g), lg = s('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
          s('stop', { offset: 0, 'stop-color': r.c, 'stop-opacity': .3 }, lg);
          s('stop', { offset: 1, 'stop-color': r.c, 'stop-opacity': 0 }, lg);
          s('path', { d: linePath(pts, o.smooth) + `L${pts[pts.length - 1][0]},${base}L${pts[0][0]},${base}Z`, fill: `url(#${id})`, class: 'efx-chart__fade', style: `--i:${k}` }, g);
        }
        s('path', { d: linePath(pts, o.smooth), pathLength: 1, fill: 'none', stroke: r.c, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'efx-chart__draw' }, g);
      });
      if (deco) return [];
      const step = Math.min(1, 16 / n);
      return data.labels.map((label, i) => {
        const node = s('g', { class: 'efx-chart__mark efx-combo__pt' }, g);
        s('rect', { x: b.x(i) - (b.step - b.bw) / 2, y: pad.t, width: b.step, height: base - pad.t, class: 'efx-combo__band' }, node);
        rows.filter(r => r.k === 'line').forEach(r => s('circle', { cx: cx(i), cy: Y(r)(r.sr.values[i] || 0), r: 4, fill: r.c, class: 'efx-combo__dot ' + (o.dots ? 'efx-chart__fade' : 'efx-combo__hid'), style: `--i:${i * step}` }, node));
        const F = r => (r.a ? fmt2 : fmt);
        return {
          x: cx(i), y: Math.min(...rows.map(r => Y(r)(r.sr.values[i] || 0))), label, node, index: i, xOnly: true, group: i,
          value: rows[0].sr.values[i] || 0, series: rows.length > 1 ? '' : rows[0].sr.name,
          html: `<strong>${esc(label)}</strong>` + rows.map(r => `<span><i style="color:${esc(safeColor(r.c))}">●</i> ${esc(r.sr.name)} <b>${esc(F(r)(r.sr.values[i] || 0))}</b></span>`).join(''),
        };
      });
    };
    draw.radius = Infinity;
    const off = chart(el, o, draw);
    return () => { offData(); off(); };
  },
};
