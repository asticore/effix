/* viz-distribution — density / violin / ridgeline / beeswarm from raw samples.
   <div class="efx-viz-distribution" data-efx-mode="violin" data-efx-data='{"labels":["A","B"],"series":[{"data":[[1,2,2,3],[4,5,5,9]]}]}'></div> */
import { COMMON, chart, palette, nice, linear, band, axes, linePath, s, esc } from './_lib.js';
import { on } from '../core.js';

const fin = a => a.map(Number).filter(Number.isFinite);
const arr = a => (Array.isArray(a) ? a : []);
function norm(raw, o) {
  let d = raw;
  try { if (typeof d === 'string') d = JSON.parse(d); } catch (e) { d = null; }
  if (Array.isArray(d)) d = d.length && d.every(x => x && typeof x === 'object' && !Array.isArray(x)) ? { series: d } : { series: [{ data: d }] };
  d = d && typeof d === 'object' ? d : {};
  const series = arr(d.series).map((sr, i) => {
    sr = Array.isArray(sr) ? { data: sr } : sr || {};
    let v = arr(sr.data || sr.values);
    if (!v.some(Array.isArray)) v = [v];
    return { name: String(sr.name ?? o.names[i] ?? ''), groups: v.map(x => fin(arr(x))) };
  });
  const ng = Math.max(1, ...series.map(x => x.groups.length)), L = o.labels.length ? o.labels : arr(d.labels);
  series.forEach((x, i) => { if (!x.name && series.length > 1) x.name = 'Series ' + (i + 1); });
  return { series, glabels: Array.from({ length: ng }, (_, i) => String(L[i] ?? (ng > 1 ? 'Group ' + (i + 1) : ''))) };
}
const q = (a, p) => { const i = (a.length - 1) * p, f = Math.floor(i); return a[f] + (a[Math.ceil(i)] - a[f]) * (i - f); };
const bwOf = (a, o) => {
  if (o.bandwidth > 0) return o.bandwidth;
  const n = a.length, m = a.reduce((x, y) => x + y, 0) / n, sd = Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / Math.max(1, n - 1));
  return 0.9 * (Math.min(sd, (q(a, 0.75) - q(a, 0.25)) / 1.34 || sd) || 1) * Math.pow(n, -0.2);
};
const dummy = N => JSON.stringify({ labels: N.glabels, series: N.series.map(x => ({ name: x.name, values: N.glabels.map((_, i) => (x.groups[i] || []).length) })) });

export default {
  name: 'viz-distribution',
  selector: '.efx-viz-distribution',
  lazy: true,
  defaults: { ...COMMON, mode: 'density', bandwidth: 0, overlap: 0.8, grid: true, height: 0 },
  init(el, o) {
    const j = el.querySelector(':scope > script[type="application/json"]');
    let N = norm(o.data || (j && j.textContent), o);
    const byG = () => N.series.length < 2 && N.glabels.length > 1;
    const o2 = { ...o, data: dummy(N), labels: N.glabels, source: '' };
    const offData = on(el, 'efx:data', e => { N = norm(e.detail, o); draw.legendByLabel = byG(); });
    const draw = ({ g, w, h, data, hidden, visible, deco, fmt }) => {
      const mode = o.mode, hz = mode === 'density' || mode === 'ridgeline', ridge = mode === 'ridgeline', bg = draw.legendByLabel;
      const sIdx = bg ? [0] : visible.map(x => x.index);
      const gIdx = N.glabels.map((_, i) => i).filter(i => !(bg && hidden.has(i)));
      const cols = palette(el, o, bg ? N.glabels.length : N.series.length), items = [];
      gIdx.forEach((gi, gx) => sIdx.forEach((si, sx) => {
        const sr = N.series[si], a = arr(sr && sr.groups[gi]).slice().sort((x, y) => x - y);
        if (!a.length) return;
        const gl = N.glabels[gi], sn = sr.name;
        items.push({ a, gx, sx, color: cols[bg ? gi : si], bw: bwOf(a, o), name: N.series.length > 1 ? (gl && N.glabels.length > 1 ? gl + ' · ' + sn : sn || gl) : gl || sn || 'Samples' });
      }));
      if (!items.length) return [];
      const ext = mode === 'beeswarm' ? 0 : mode === 'violin' ? 2 : 3;
      const lo = Math.min(...items.map(t => t.a[0] - ext * t.bw)), hi = Math.max(...items.map(t => t.a[t.a.length - 1] + ext * t.bw));
      const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : ridge ? { t: 10, r: 12, b: 28, l: 84 } : hz ? { t: 10, r: 12, b: 28, l: 12 } : { t: 12, r: 8, b: 28, l: 44 };
      const sc = nice(lo, hi, Math.max(2, Math.floor((hz ? w : h) / 70)));
      const v = linear([sc.min, sc.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
      const NP = hz ? 80 : 48;
      if (mode !== 'beeswarm') items.forEach(t => {
        t.xs = []; t.ys = [];
        for (let i = 0; i < NP; i++) {
          const x = sc.min + (sc.max - sc.min) * i / (NP - 1);
          let sum = 0;
          for (const a of t.a) sum += Math.exp(-0.5 * ((x - a) / t.bw) ** 2);
          t.xs.push(x); t.ys.push(sum / (t.a.length * t.bw * 2.5066));
        }
      });
      const dmax = Math.max(...items.map(t => Math.max(...(t.ys || [0]))), 1e-9);
      const b = band(gIdx.length, [pad.l, w - pad.r], 0.2), sw = b.bw / sIdx.length;
      if (!deco) {
        if (hz) {
          const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
          sc.ticks.forEach(t => {
            if (o.grid) s('line', { x1: v(t), x2: v(t), y1: pad.t, y2: h - pad.b, class: 'efx-chart__grid' }, ax);
            s('text', { x: v(t), y: h - pad.b + 16, 'text-anchor': 'middle' }, ax).textContent = fmt(t);
          });
        } else axes(g, { w, h, pad, y: v, ticks: sc.ticks, labels: gIdx.map(i => N.glabels[i]), x: i => b.x(i) + b.bw / 2, fmt, grid: o.grid });
      }
      const m = items.length, rh = ridge ? (h - pad.t - pad.b) / (m + o.overlap) : 0, amp = rh * (1 + o.overlap);
      const base = h - pad.b, yd = linear([0, dmax], [base, deco ? pad.t : pad.t]);
      const marks = [];
      const info = t => {
        const n = t.a.length;
        return `<strong>${esc(t.name)}</strong><span>n <b>${n}</b> · median <b>${esc(fmt(q(t.a, 0.5)))}</b></span><span>Q1–Q3 <b>${esc(fmt(q(t.a, 0.25)))} – ${esc(fmt(q(t.a, 0.75)))}</b></span><span>min–max <b>${esc(fmt(t.a[0]))} – ${esc(fmt(t.a[n - 1]))}</b></span>`;
      };
      items.forEach((t, k) => {
        const f = s('g', { class: 'efx-chart__fade', style: `--i:${k}` }, g);
        const med = q(t.a, 0.5), n = t.a.length;
        if (hz) {
          const y0 = ridge ? pad.t + amp + k * rh : base, sy = ridge ? rh * (1 + o.overlap) / dmax : (base - pad.t) / dmax;
          const pts = t.xs.map((x, i) => [v(x), y0 - t.ys[i] * sy]), d = linePath(pts, false);
          if (ridge) {
            s('line', { x1: pad.l, x2: w - pad.r, y1: y0, y2: y0, class: 'efx-chart__grid' }, f);
            if (!deco) s('text', { x: pad.l - 8, y: y0 - 3, 'text-anchor': 'end', class: 'efx-chart__axis', 'aria-hidden': 'true', style: 'fill:var(--efx-chart-text)' }, f).textContent = t.name;
          }
          const node = s('g', { class: 'efx-chart__mark' }, f);
          s('path', { d: d + `L${pts[NP - 1][0]},${y0}L${pts[0][0]},${y0}Z`, fill: t.color, 'fill-opacity': ridge ? 0.7 : 0.22, stroke: 'none' }, node);
          s('path', { d, fill: 'none', stroke: t.color, 'stroke-width': 2, 'stroke-linejoin': 'round' }, node);
          const pk = t.ys.indexOf(Math.max(...t.ys));
          marks.push({ x: pts[pk][0], y: pts[pk][1], label: t.name, value: med, valueText: 'median ' + fmt(med), html: info(t), node, index: k, group: k,
            hit: (px, py) => ridge ? py <= y0 && (k === 0 || py > y0 - rh) : px >= pts[0][0] && px <= pts[NP - 1][0] && Math.abs(py - pts[Math.max(0, Math.min(NP - 1, Math.round((px - pts[0][0]) / (pts[NP - 1][0] - pts[0][0]) * (NP - 1))))][1]) < 10 });
          return;
        }
        const cx = b.x(t.gx) + sw * (t.sx + 0.5);
        if (mode === 'violin') {
          const hw = sw / 2 * 0.95, R = t.xs.map((x, i) => [cx + t.ys[i] / dmax * hw, v(x)]), L = t.xs.map((x, i) => [cx - t.ys[i] / dmax * hw, v(x)]).reverse();
          const node = s('g', { class: 'efx-chart__mark' }, f);
          s('path', { d: linePath(R.concat(L), false) + 'Z', fill: t.color, 'fill-opacity': 0.35, stroke: t.color, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, node);
          s('line', { x1: cx, x2: cx, y1: v(q(t.a, 0.25)), y2: v(q(t.a, 0.75)), stroke: t.color, 'stroke-width': 5, 'stroke-linecap': 'round' }, node);
          s('circle', { cx, cy: v(med), r: 3, style: 'fill:var(--sh-surface,#fff)' }, node);
          marks.push({ x: cx, y: v(med), label: t.name, value: med, valueText: 'median ' + fmt(med), html: info(t), node, index: k, group: k, hit: px => Math.abs(px - cx) <= sw / 2 });
          return;
        }
        const r = n > 200 ? 2.2 : 3.3, placed = [], lim = sw / 2 - r;
        const dots = t.a.map(val => {
          const y = v(val);
          let x = 0;
          for (let i = 0; i < 400; i++) {
            x = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * r * 0.6;
            if (!placed.some(p => (p[0] - x) ** 2 + (p[1] - y) ** 2 < (2 * r) ** 2)) break;
          }
          placed.push([x, y]);
          return [x, y, val];
        });
        const mx = Math.max(...dots.map(p => Math.abs(p[0]))), kx = mx > lim && lim > 0 ? lim / mx : 1;
        s('line', { x1: cx - sw * 0.35, x2: cx + sw * 0.35, y1: v(med), y2: v(med), stroke: t.color, 'stroke-width': 2 }, f);
        dots.forEach(([dx, y, val], i) => {
          const node = s('circle', { cx: cx + dx * kx, cy: y, r, fill: t.color, 'fill-opacity': 0.8, class: 'efx-chart__mark' }, f);
          marks.push({ x: cx + dx * kx, y, label: t.name, value: val, node, index: i, group: k,
            html: `<strong>${esc(t.name)}</strong><b>${esc(fmt(val))}</b><span>median ${esc(fmt(med))} · n ${n}</span>` });
        });
      });
      return marks;
    };
    draw.legendByLabel = byG();
    draw.height = () => o.height || (o.mode === 'ridgeline' ? N.glabels.length * Math.max(1, N.series.length) * 40 + 40 : 280);
    const off = chart(el, o2, draw);
    return () => { offData(); off(); };
  },
};
