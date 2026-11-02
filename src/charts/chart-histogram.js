/* chart-histogram — auto-binned distribution of raw values (Sturges, fixed bin count or step).
   <div class="efx-chart-histogram" data-efx-data="1.2,3.4,2.2,5.1,3.3,4.8,2.9" data-efx-curve></div> */
import { COMMON, chart, nice, linear, linePath, tickStep, axes, s, esc } from './_lib.js';

export default {
  name: 'chart-histogram',
  selector: '.efx-chart-histogram',
  lazy: true,
  defaults: { ...COMMON, bins: 0, step: 0, curve: false, grid: true },
  init(el, o) {
    const draw = ({ g, w, h, data, colors, fmt, deco }) => {
      const xs = ((data.series[0] || {}).values || []).filter(Number.isFinite), n = xs.length;
      if (!n) return [];
      let lo = Math.min(...xs), hi = Math.max(...xs), st = o.step;
      if (lo === hi) { lo -= .5; hi += .5; }
      if (st > 0) { lo = Math.floor(lo / st) * st; hi = Math.ceil(hi / st) * st; }
      else {
        const k = o.bins > 0 ? Math.round(o.bins) : Math.ceil(Math.log2(n) + 1);
        if (o.bins > 0) st = (hi - lo) / k;
        else { st = tickStep(lo, hi, k); lo = Math.floor(lo / st) * st; hi = Math.ceil(hi / st) * st; }
      }
      const nb = Math.max(1, Math.min(200, Math.round((hi - lo) / st)));
      st = (hi - lo) / nb;
      const edges = Array.from({ length: nb + 1 }, (_, i) => +(lo + i * st).toFixed(10)), cnt = Array(nb).fill(0);
      xs.forEach(x => { cnt[Math.min(nb - 1, Math.floor((x - lo) / st + 1e-9))]++; });
      const mean = xs.reduce((a, x) => a + x, 0) / n, sd = Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / n);
      const pdf = x => n * st * Math.exp(-((x - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
      const curve = o.curve && sd > 0;
      const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : { t: 12, r: 12, b: 28, l: 36 };
      const sc = nice(0, Math.max(...cnt, curve ? pdf(mean) : 0), Math.max(2, Math.floor(h / 50)));
      const X = linear([lo, hi], [pad.l, w - pad.r]), Y = linear([sc.min, sc.max], [h - pad.b, pad.t]);
      if (!deco) axes(g, { w, h, pad, y: Y, ticks: sc.ticks, labels: edges.map(fmt), x: i => X(edges[i]), fmt: String, grid: o.grid });
      const marks = cnt.map((c, i) => {
        const x0 = X(edges[i]), x1 = X(edges[i + 1]), y = Y(c), label = `[${fmt(edges[i])}, ${fmt(edges[i + 1])}${i === nb - 1 ? ']' : ')'}`;
        const node = s('rect', { x: x0, y, width: x1 - x0, height: Y(0) - y, fill: colors[0], stroke: 'var(--sh-surface, #fff)', 'stroke-width': deco ? 0 : 1, class: 'efx-chart__mark efx-chart__grow', style: `--i:${Math.min(i, 12)}` }, g);
        return { x: (x0 + x1) / 2, y, label, value: c, series: '', node, index: i,
          html: `<strong>${esc(label)}</strong><b>${c} value${c === 1 ? '' : 's'}</b>`,
          hit: (px, py) => px >= x0 && px <= x1 && py >= pad.t && py <= h - pad.b };
      });
      if (curve) s('path', { d: linePath(Array.from({ length: 65 }, (_, i) => { const x = lo + (hi - lo) * i / 64; return [X(x), Y(pdf(x))]; }), false), fill: 'none', stroke: colors[1] || colors[0], 'stroke-width': 2, pathLength: 1, class: 'efx-chart__draw', style: 'pointer-events:none' }, g);
      return marks;
    };
    draw.radius = 1;
    return chart(el, o, draw);
  },
};
