/* chart-box — box-and-whisker plot (quartiles by linear interpolation, 1.5×IQR whiskers, outlier dots).
   <div class="efx-chart-box" data-efx-data='{"labels":["A","B"],"series":[{"data":[[1,2,3,4,9],[3,4,5,6,7]]}]}'></div>
   <div class="efx-chart-box" data-efx-data='[{"label":"A","min":1,"q1":2,"median":3,"q3":4,"max":5,"outliers":[9]}]'></div> */
import { COMMON, chart, nice, linear, band, axes, s, esc } from './_lib.js';
import { on } from '../core.js';

const Q = (a, p) => { const i = (a.length - 1) * p, l = Math.floor(i); return a[l] + (a[Math.min(l + 1, a.length - 1)] - a[l]) * (i - l); };
const stat = c => {
  if (Array.isArray(c)) {
    const a = c.map(Number).filter(Number.isFinite).sort((x, y) => x - y);
    if (!a.length) return null;
    const q1 = Q(a, .25), q3 = Q(a, .75), r = 1.5 * (q3 - q1), k = a.filter(v => v >= q1 - r && v <= q3 + r);
    return { n: a.length, min: k[0], q1, median: Q(a, .5), q3, max: k[k.length - 1], out: a.filter(v => v < q1 - r || v > q3 + r) };
  }
  if (!c || typeof c !== 'object') return null;
  const m = { min: +c.min, q1: +c.q1, median: +c.median, q3: +c.q3, max: +c.max };
  return Object.values(m).some(isNaN) ? null : { ...m, out: (c.outliers || []).map(Number).filter(Number.isFinite), l: c.label };
};
const read = (el, o, raw) => {
  try {
    if (raw === undefined) raw = JSON.parse((o.data || '').trim() || el.querySelector(':scope > script[type="application/json"]').textContent);
    const r = Array.isArray(raw) ? { series: raw[0].median != null ? [{ data: raw }] : raw } : raw || {};
    const groups = r.series.map((x, k) => ({ name: String(x.name ?? o.names[k] ?? ''), boxes: (x.data || x.values || []).map(stat) }));
    const n = Math.max(0, ...groups.map(x => x.boxes.length));
    return { groups, L: Array.from({ length: n }, (_, i) => String(o.labels[i] ?? (r.labels || [])[i] ?? (groups[0].boxes[i] || {}).l ?? i + 1)) };
  } catch (e) { return { groups: [], L: [] }; }
};

export default {
  name: 'chart-box',
  selector: '.efx-chart-box',
  lazy: true,
  defaults: { ...COMMON, horizontal: false, grid: true },
  init(el, o) {
    let m = read(el, o);
    // registered before chart() so it runs before the lib's own efx:data handler
    const off = on(el, 'efx:data', e => { m = read(el, o, e.detail || {}); });
    const draw = ({ g, w, h, visible, colors, fmt, deco }) => {
      const { groups, L } = m, n = L.length, vg = visible.filter(x => groups[x.index]);
      const all = vg.flatMap(x => groups[x.index].boxes.filter(Boolean).flatMap(b => [b.min, b.max, ...b.out]));
      if (!n || !all.length) return [];
      const hz = o.horizontal;
      const pad = deco ? { t: 6, r: 6, b: 6, l: 6 } : hz ? { t: 8, r: 24, b: 24, l: 72 } : { t: 12, r: 8, b: 28, l: 44 };
      const sc = nice(Math.min(...all), Math.max(...all), hz ? Math.max(2, Math.floor(w / 90)) : Math.max(2, Math.floor(h / 50)));
      const v = linear([sc.min, sc.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
      const b = band(n, hz ? [pad.t, h - pad.b] : [pad.l, w - pad.r], 0.3);
      const P = (c, val) => (hz ? [v(val), c] : [c, v(val)]);
      if (!deco) {
        if (hz) {
          const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
          sc.ticks.forEach(t => {
            s('line', { x1: v(t), x2: v(t), y1: pad.t, y2: h - pad.b, class: 'efx-chart__grid' }, ax);
            s('text', { x: v(t), y: h - pad.b + 16, 'text-anchor': 'middle' }, ax).textContent = fmt(t);
          });
          L.forEach((l, i) => { s('text', { x: pad.l - 8, y: b.x(i) + b.bw / 2, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, ax).textContent = l; });
        } else axes(g, { w, h, pad, y: v, ticks: sc.ticks, labels: L, x: i => b.x(i) + b.bw / 2, fmt, grid: o.grid });
      }
      const marks = [], sw = b.bw / vg.length, cw = Math.max(4, sw - (vg.length > 1 ? 4 : 0));
      L.forEach((label, i) => vg.forEach((x, k) => {
        const bx = groups[x.index].boxes[i];
        if (!bx) return;
        const col = colors[x.index], c0 = b.x(i) + k * sw + (sw - cw) / 2, cm = c0 + cw / 2;
        const gr = s('g', { class: 'efx-chart__mark efx-chart__fade', style: `--i:${i}`, stroke: col, 'stroke-width': 1.5, fill: 'none' }, g);
        const ln = (c, a, d, z, e) => { const [x1, y1] = P(c, a), [x2, y2] = P(d, z); return s('line', { x1, y1, x2, y2, ...e }, gr); };
        ln(cm, bx.min, cm, bx.q1); ln(cm, bx.q3, cm, bx.max);
        ln(cm - cw / 4, bx.min, cm + cw / 4, bx.min); ln(cm - cw / 4, bx.max, cm + cw / 4, bx.max);
        const [x1, y1] = P(c0, bx.q1), [x2, y2] = P(c0 + cw, bx.q3);
        s('rect', { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1), rx: 2, fill: col, 'fill-opacity': .28 }, gr);
        ln(c0, bx.median, c0 + cw, bx.median, { 'stroke-width': 3 });
        bx.out.forEach(z => { const [cx, cy] = P(cm, z); s('circle', { cx, cy, r: 3, fill: 'var(--sh-surface, #fff)' }, gr); });
        const lo = Math.min(bx.min, ...bx.out), hi = Math.max(bx.max, ...bx.out);
        const [ax, ay] = P(c0 - 2, lo), [bx2, by2] = P(c0 + cw + 2, hi), [mx, my] = P(cm, bx.median);
        const row = (t, z) => `<span>${t} <b>${esc(fmt(z))}</b></span>`;
        marks.push({ x: mx, y: my, label, value: bx.median, series: vg.length > 1 ? groups[x.index].name : '', node: gr, index: i,
          html: `<strong>${esc(label)}</strong>${vg.length > 1 ? `<span>${esc(groups[x.index].name)}</span>` : ''}${row('Max', bx.max)}${row('Q3', bx.q3)}${row('Median', bx.median)}${row('Q1', bx.q1)}${row('Min', bx.min)}${bx.n ? `<span>n = ${bx.n}</span>` : ''}${bx.out.length ? `<span>${bx.out.length} outlier${bx.out.length > 1 ? 's' : ''}</span>` : ''}`,
          hit: (px, py) => px >= Math.min(ax, bx2) && px <= Math.max(ax, bx2) && py >= Math.min(ay, by2) && py <= Math.max(ay, by2) });
      }));
      return marks;
    };
    draw.radius = 1;
    const stop = chart(el, o, draw);
    return () => { off(); stop(); };
  },
};
