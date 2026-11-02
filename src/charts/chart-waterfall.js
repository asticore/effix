/* chart-waterfall — running-total bars: values are deltas, data-efx-totals marks which bars are totals.
   <div class="efx-chart-waterfall" data-efx-data="100,30,-20,15,-10,0" data-efx-labels="Start|Sales|Refunds|Upsell|Costs|End" data-efx-totals="0|5"></div> */
import { COMMON, chart, nice, linear, band, axes, s, esc } from './_lib.js';
import { cssVar } from '../core.js';

export default {
  name: 'chart-waterfall',
  selector: '.efx-chart-waterfall',
  lazy: true,
  defaults: { ...COMMON, totals: [], values: true, connectors: true, grid: true, radius: 3 },
  init(el, o) {
    return chart(el, o, ({ g, w, h, data, colors, fmt, deco }) => {
      const vals = data.series[0] ? data.series[0].values : [];
      const n = vals.length;
      if (!n) return [];
      const tot = new Set(o.totals.map(t => { const k = parseInt(t, 10); return k < 0 ? n + k : k; }));
      // up = success, down = danger, total = primary (custom data-efx-colors = total|up|down)
      const sg = v => (v < 0 ? '−' : v > 0 ? '+' : '') + fmt(Math.abs(v)); // signed delta: −$32k
      const [cT, cU, cD] = o.colors.length ? [o.colors[0], o.colors[1] || o.colors[0], o.colors[2] || o.colors[0]]
        : [colors[0], cssVar(el, '--sh-success', '#10b981'), cssVar(el, '--sh-danger', '#ef4444')];
      let run = 0;
      const bars = vals.map((v, i) => {
        const isT = tot.has(i), from = isT ? 0 : run;
        // a total bar shows the running total; a non-zero value on it resets the total to that figure
        if (isT) run = v || run; else run += v;
        return { v, isT, from, to: run, d: isT ? run : v, run };
      });
      const all = bars.flatMap(b => [b.from, b.to]).concat(0);
      const pad = deco ? { t: 4, r: 0, b: 4, l: 0 } : { t: 18, r: 8, b: 28, l: 44 };
      const sc = nice(Math.min(...all), Math.max(...all), Math.max(2, Math.floor(h / 50)));
      const y = linear([sc.min, sc.max], [h - pad.b, pad.t]);
      const b = band(n, [pad.l, w - pad.r], 0.3);
      if (!deco) axes(g, { w, h, pad, y, ticks: sc.ticks, labels: data.labels, x: i => b.x(i) + b.bw / 2, fmt, grid: o.grid, rotate: b.step < 44 });
      if (o.connectors && !deco) bars.slice(1).forEach((k, i) => s('line', { x1: b.x(i) + b.bw, x2: b.x(i + 1), y1: y(bars[i].to), y2: y(bars[i].to), class: 'efx-chart__fade efx-wf__c', style: `--i:${i}` }, g));
      return bars.map((k, i) => {
        const col = k.isT ? cT : k.v < 0 ? cD : cU, y0 = y(k.from), y1 = y(k.to), top = Math.min(y0, y1), bh = Math.max(1, Math.abs(y1 - y0));
        const node = s('rect', { x: b.x(i), y: top, width: b.bw, height: bh, rx: Math.min(o.radius, b.bw / 2, bh / 2), fill: col, class: 'efx-chart__mark efx-chart__grow', style: `--i:${i}` }, g);
        if (o.values && !deco && b.bw > 18) {
          const up = k.isT || k.v >= 0;
          s('text', { x: b.x(i) + b.bw / 2, y: up ? top - 6 : top + bh + 13, 'text-anchor': 'middle', class: 'efx-chart__value efx-chart__fade', style: `--i:${i}` }, g).textContent = k.isT ? fmt(k.d) : sg(k.v);
        }
        return {
          x: b.x(i) + b.bw / 2, y: top, label: data.labels[i], value: k.d, node, index: i,
          html: `<strong>${esc(data.labels[i])}</strong>` + (k.isT ? '' : `<span>Change <b>${esc(sg(k.v))}</b></span>`) + `<span>Total <b>${esc(fmt(k.run))}</b></span>`,
          hit: (px, py) => px >= b.x(i) && px <= b.x(i) + b.bw && py >= pad.t && py <= h - pad.b,
        };
      });
    });
  },
};
