/* chart-radar — radar / spider chart: series = polygons, labels = axes.
   <div class="efx-chart-radar" data-efx-data="[[8,6,7,5,9],[5,8,4,7,6]]" data-efx-names="A|B" data-efx-labels="Speed|Power|Range|Cost|Style"></div> */
import { COMMON, chart, nice, s } from './_lib.js';

const TAU = Math.PI * 2;

export default {
  name: 'chart-radar',
  selector: '.efx-chart-radar',
  lazy: true,
  defaults: { ...COMMON, height: 320, levels: 4, area: true, dots: true, max: '' },
  init(el, o) {
    return chart(el, o, ({ g, w, h, data, visible, colors, fmt, deco }) => {
      const n = data.labels.length;
      if (n < 3 || !visible.length) return [];
      const all = visible.flatMap(sr => sr.values), top = Math.max(...all, 0);
      const nt = nice(0, top || 1, o.levels), fixed = Number.isFinite(parseFloat(o.max)) && parseFloat(o.max) > 0, lv = fixed ? Math.max(1, o.levels) : nt.ticks.length - 1, mx = fixed ? parseFloat(o.max) : nt.max;
      const long = Math.max(...data.labels.map(l => l.length));
      const R = deco ? Math.min(w, h) / 2 - 2 : Math.max(20, Math.min(w / 2 - Math.min(w * 0.3, long * 6.2 + 16), h / 2 - 24));
      const cx = w / 2, cy = h / 2, ang = k => (k * TAU) / n;
      const pt = (k, r) => [cx + r * Math.sin(ang(k)), cy - r * Math.cos(ang(k))];
      const poly = r => 'M' + data.labels.map((_, k) => pt(k, r).join(',')).join('L') + 'Z';
      const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
      for (let j = 1; j <= lv; j++) {
        s('path', { d: poly((R * j) / lv), class: 'efx-chart__grid', fill: 'none' }, ax);
        if (!deco && j < lv) s('text', { x: cx + 4, y: cy - (R * j) / lv, class: 'efx-rd-tick', 'dominant-baseline': 'central' }, ax).textContent = fmt((mx * j) / lv);
      }
      data.labels.forEach((l, k) => {
        const [x, y] = pt(k, R);
        s('line', { x1: cx, y1: cy, x2: x, y2: y, class: 'efx-chart__grid' }, ax);
        if (deco) return;
        const sn = Math.sin(ang(k)), cs = Math.cos(ang(k)), [lx, ly] = pt(k, R + 12);
        const room = Math.max(4, Math.floor((w / 2 - R * Math.abs(sn) - 12) / 6.2));
        const t = s('text', { x: lx, y: ly + cs * -3 + (cs < -0.3 ? 4 : 0), 'text-anchor': Math.abs(sn) < 0.25 ? 'middle' : sn > 0 ? 'start' : 'end', 'dominant-baseline': 'central' }, ax);
        t.textContent = Math.abs(sn) < 0.25 ? l : l.length > room ? l.slice(0, Math.max(2, room - 1)) + '…' : l;
      });
      const marks = [];
      visible.forEach((sr, si) => {
        const col = colors[sr.index], pts = data.labels.map((_, k) => pt(k, (R * Math.min(1, Math.max(0, sr.values[k] || 0) / mx))));
        const d = 'M' + pts.map(p => p.join(',')).join('L') + 'Z';
        s('path', { d, fill: o.area ? col : 'none', 'fill-opacity': o.area ? 0.18 : null, stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round', class: 'efx-rd-poly', style: `--i:${si};transform-origin:${cx}px ${cy}px` }, g);
        data.labels.forEach((l, k) => {
          const node = s('circle', { cx: pts[k][0], cy: pts[k][1], r: 4, fill: col, stroke: 'var(--sh-surface, #fff)', 'stroke-width': 1.5, class: 'efx-chart__mark efx-rd-dot' + (o.dots || deco ? '' : ' efx-rd-h'), style: `--i:${k + si}` }, g);
          marks.push({ x: pts[k][0], y: pts[k][1], label: l, value: sr.values[k] || 0, series: data.series.length > 1 ? sr.name : '', node, index: k, group: sr.index + 1 });
        });
      });
      return marks;
    });
  },
};
