/* chart-bar — vertical/horizontal, grouped or stacked bars.
   <div class="efx-chart-bar" data-efx-data="12,19,7,24" data-efx-labels="Q1|Q2|Q3|Q4"></div>
   <div class="efx-chart-bar" data-efx-data="[[3,5,2],[4,1,6]]" data-efx-names="2025|2026" data-efx-stacked></div> */
import { COMMON, chart, nice, linear, band, axes, s } from './_lib.js';

export default {
  name: 'chart-bar',
  selector: '.efx-chart-bar',
  lazy: true,
  defaults: { ...COMMON, horizontal: false, stacked: false, values: false, radius: 4, grid: true, min: 0 },
  init(el, o) {
    return chart(el, o, ({ g, w, h, data, visible, colors, fmt, deco }) => {
      const n = data.labels.length;
      if (!n || !visible.length) return [];
      const hz = o.horizontal;
      const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : hz ? { t: 8, r: 24, b: 24, l: 72 } : { t: 12, r: 8, b: 28, l: 44 };
      const totals = data.labels.map((_, i) => visible.reduce((a, sr) => a + Math.max(0, sr.values[i] || 0), 0));
      const vals = o.stacked ? totals : visible.flatMap(sr => sr.values);
      const sc = nice(Math.min(o.min, ...vals), Math.max(...vals, 0), hz ? Math.max(2, Math.floor(w / 90)) : Math.max(2, Math.floor(h / 50)));
      const v = linear([sc.min, sc.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
      const b = band(n, hz ? [pad.t, h - pad.b] : [pad.l, w - pad.r], 0.28);
      if (!deco) {
        if (hz) {
          const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
          sc.ticks.forEach(t => {
            s('line', { x1: v(t), x2: v(t), y1: pad.t, y2: h - pad.b, class: 'efx-chart__grid' }, ax);
            s('text', { x: v(t), y: h - pad.b + 16, 'text-anchor': 'middle' }, ax).textContent = fmt(t);
          });
          data.labels.forEach((l, i) => { s('text', { x: pad.l - 8, y: b.x(i) + b.bw / 2, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, ax).textContent = l; });
        } else axes(g, { w, h, pad, y: v, ticks: sc.ticks, labels: data.labels, x: i => b.x(i) + b.bw / 2, fmt, grid: o.grid });
      }
      const marks = [];
      const per = o.stacked ? 1 : visible.length;
      const bw = b.bw / per;
      data.labels.forEach((label, i) => {
        let acc = 0;
        visible.forEach((sr, k) => {
          const val = sr.values[i] || 0;
          const a = o.stacked ? acc : Math.min(0, Math.max(sc.min, 0));
          const z = o.stacked ? acc + val : val;
          acc += Math.max(0, val);
          const p0 = v(o.stacked ? a : Math.max(sc.min, 0)), p1 = v(z);
          const off = b.x(i) + (o.stacked ? 0 : k * bw);
          const thick = Math.max(1, (o.stacked ? b.bw : bw) - (per > 1 ? 2 : 0));
          const r = Math.min(o.radius, thick / 2);
          const attrs = hz
            ? { x: Math.min(p0, p1), y: off, width: Math.abs(p1 - p0), height: thick }
            : { x: off, y: Math.min(p0, p1), width: thick, height: Math.abs(p1 - p0) };
          const node = s('rect', { ...attrs, rx: r, fill: colors[sr.index], class: `efx-chart__mark ${hz ? 'efx-chart__grow-x' : 'efx-chart__grow'}`, style: `--i:${i}` }, g);
          if (o.values && !deco && !o.stacked) {
            const t = hz ? s('text', { x: Math.max(p0, p1) + 6, y: off + thick / 2, 'dominant-baseline': 'middle', class: 'efx-chart__value efx-chart__fade', style: `--i:${i}` }, g)
              : s('text', { x: off + thick / 2, y: Math.min(p0, p1) - 6, 'text-anchor': 'middle', class: 'efx-chart__value efx-chart__fade', style: `--i:${i}` }, g);
            t.textContent = fmt(val);
          }
          const cx = attrs.x + attrs.width / 2, cy = attrs.y + (hz ? attrs.height / 2 : 0);
          marks.push({ x: cx, y: cy, label, value: val, series: visible.length > 1 || data.series.length > 1 ? sr.name : '', node, index: i,
            hit: (px, py) => px >= attrs.x && px <= attrs.x + attrs.width && py >= attrs.y - 4 && py <= attrs.y + attrs.height });
        });
      });
      return marks;
    });
  },
};
