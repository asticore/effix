/* chart-line — multi-series line chart with optional gradient area / stacked area.
   <div class="efx-chart-line" data-efx-data="3,5,4,8|2,4,6,5" data-efx-labels="Mon|Tue|Wed|Thu" data-efx-area></div>
   data-efx-stream = streamgraph (stacked, wiggle baseline centred on zero, smooth). */
import { COMMON, chart, nice, linear, linePath, axes, s, esc } from './_lib.js';

const safeColor = c => { try { return typeof c === 'string' && CSS.supports('color', c) && !/[;{}"'<>]/.test(c) ? c : '#6366f1'; } catch (e) { return '#6366f1'; } };

let uid = 0;
export default {
  name: 'chart-line',
  selector: '.efx-chart-line',
  lazy: true,
  defaults: { ...COMMON, area: false, smooth: true, dots: true, stacked: false, stream: false, grid: true, min: '' },
  init(el, o) {
    const draw = ({ g, w, h, data, visible, colors, fmt, deco }) => {
      const n = data.labels.length;
      if (!n || !visible.length) return [];
      const pad = deco ? { t: 6, r: 0, b: 6, l: 0 } : { t: 12, r: 16, b: 28, l: o.stream ? 8 : 44 };
      const sk = o.stream, stack = o.stacked || sk, area = o.area || stack;
      let acc = Array(n).fill(0);
      if (sk) { // wiggle offset (Byron & Wattenberg), then centred on zero
        let y0 = 0;
        acc = acc.map((_, j) => {
          if (j) {
            let s1 = 0, s2 = 0, c = 0;
            visible.forEach(sr => { const v = sr.values[j] || 0; s1 += v; s2 += (v / 2 + c) * (v - (sr.values[j - 1] || 0)); c += v; });
            if (s1) y0 -= s2 / s1;
          }
          return y0;
        });
        const tot = acc.map((a, j) => a + visible.reduce((q, sr) => q + (sr.values[j] || 0), 0)), mid = (Math.min(...acc) + Math.max(...tot)) / 2;
        acc = acc.map(a => a - mid);
      }
      const rows = visible.map(sr => {
        const lo = acc, hi = sr.values.map((_, i) => 0);
        for (let i = 0; i < n; i++) hi[i] = (stack ? lo[i] : 0) + (sr.values[i] || 0);
        if (stack) acc = hi;
        return { sr, lo, hi, c: colors[sr.index] };
      });
      const vals = rows.flatMap(r => r.hi).concat(sk ? rows[0].lo : area ? 0 : []);
      const lo0 = o.min === '' || o.min == null ? NaN : +o.min;
      const sc = sk ? { min: Math.min(...vals), max: Math.max(...vals), ticks: [] } : nice(Number.isFinite(lo0) ? lo0 : Math.min(...vals), Math.max(...vals), Math.max(2, Math.floor(h / 50)));
      const y = linear([sc.min, sc.max], [h - pad.b, pad.t]);
      const x = i => n > 1 ? pad.l + i * (w - pad.l - pad.r) / (n - 1) : (pad.l + w - pad.r) / 2;
      if (!deco) axes(g, { w, h, pad, y, ticks: sc.ticks, labels: data.labels, x, fmt, grid: o.grid });
      const P = a => a.map((v, i) => [x(i), y(v)]);
      const base = y(Math.max(sc.min, 0));
      if (area) {
        const defs = s('defs', {}, g);
        rows.forEach((r, k) => {
          const id = 'efx-lg' + ++uid;
          const lg = s('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
          s('stop', { offset: 0, 'stop-color': r.c, 'stop-opacity': sk ? .85 : .35 }, lg);
          s('stop', { offset: 1, 'stop-color': r.c, 'stop-opacity': sk ? .85 : 0 }, lg);
          const tail = stack ? 'L' + linePath(P(r.lo).reverse(), o.smooth).slice(1) : `L${x(n - 1)},${base}L${x(0)},${base}`;
          s('path', { d: linePath(P(r.hi), o.smooth) + tail + 'Z', fill: `url(#${id})`, class: 'efx-chart__fade', style: `--i:${k}` }, g);
        });
      }
      if (!sk) rows.forEach(r => s('path', { d: linePath(P(r.hi), o.smooth), pathLength: 1, fill: 'none', stroke: r.c, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'efx-chart__draw' }, g));
      if (deco) return [];
      const step = Math.min(1, 16 / n);
      return data.labels.map((label, i) => {
        const node = s('g', { class: 'efx-chart__mark efx-chart-line__pt' }, g);
        s('line', { x1: x(i), x2: x(i), y1: pad.t, y2: h - pad.b, class: 'efx-chart-line__x' }, node);
        rows.forEach(r => s('circle', { cx: x(i), cy: y(sk ? (r.lo[i] + r.hi[i]) / 2 : r.hi[i]), r: 4, fill: r.c, class: 'efx-chart-line__dot ' + (o.dots ? 'efx-chart__fade' : 'efx-chart-line__hid'), style: `--i:${i * step}` }, node));
        const multi = rows.length > 1;
        return {
          x: x(i), y: Math.min(...rows.map(r => y(r.hi[i]))), label, node, index: i, xOnly: true, group: i,
          value: stack ? rows[rows.length - 1].hi[i] : rows[0].sr.values[i] || 0, series: multi ? '' : rows[0].sr.name,
          html: `<strong>${esc(label)}</strong>` + rows.map(r => `<span>${multi ? `<i style="color:${esc(safeColor(r.c))}">●</i> ${esc(r.sr.name)} ` : ''}<b>${esc(fmt(r.sr.values[i] || 0))}</b></span>`).join(''),
        };
      });
    };
    draw.radius = Infinity; // crosshair snaps to the nearest x from anywhere in the plot
    return chart(el, o, draw);
  },
};
