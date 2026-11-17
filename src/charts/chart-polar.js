/* chart-polar — polar area chart: equal-angle sectors, radius = value, on concentric grid rings.
   <div class="spark-chart-polar" data-spark-data="12,19,7,15,9" data-spark-labels="A|B|C|D|E"></div> */
import { COMMON, chart, palette, nice, s, esc, arcPath, polar } from './_lib.js';

const TAU = Math.PI * 2;

export default {
  name: 'chart-polar',
  selector: '.spark-chart-polar',
  lazy: true,
  defaults: { ...COMMON, height: 320, levels: 4, pad: 0.02, max: '' },
  init(el, o) {
    const draw = ({ g, w, h, data, hidden, fmt, deco }) => {
      const vals = data.series[0] ? data.series[0].values : [];
      const idx = data.labels.map((_, i) => i).filter(i => !hidden.has(i));
      if (!idx.length) return [];
      const top = Math.max(0, ...idx.map(i => vals[i] || 0)), fixed = parseFloat(o.max) > 0;
      const nt = nice(0, top || 1, o.levels), mx = fixed ? parseFloat(o.max) : nt.max;
      const R = deco ? Math.min(w, h) / 2 : Math.max(20, Math.min(w, h) / 2 - 14), cx = w / 2, cy = h / 2;
      const pal = palette(el, o, data.labels.length), span = TAU / idx.length, gap = Math.min(o.pad, span / 2);
      if (!deco) {
        const ax = s('g', { class: 'spark-chart__axis', 'aria-hidden': 'true' }, g);
        const lv = fixed ? Math.max(1, o.levels) : nt.ticks.length - 1;
        for (let j = 1; j <= lv; j++) {
          const r = (R * j) / lv;
          s('circle', { cx, cy, r, class: 'spark-chart__grid', fill: 'none' }, ax);
          s('text', { x: cx + 3, y: cy - r + 9, class: 'spark-polar-tick' }, ax).textContent = fmt((mx * j) / lv);
        }
      }
      const marks = [];
      idx.forEach((i, k) => {
        const a0 = k * span, a1 = a0 + span, v = Math.max(0, vals[i] || 0), r = R * Math.min(1, v / mx), m = (a0 + a1) / 2;
        const [dx, dy] = polar(0, 0, 6, m);
        const node = s('path', { d: arcPath(cx, cy, 0, Math.max(0.5, r), a0 + gap / 2, a1 - gap / 2), fill: pal[i], 'fill-opacity': 0.85, class: 'spark-chart__mark spark-polar-arc', style: `--i:${k};--dx:${dx}px;--dy:${dy}px;transform-origin:${cx}px ${cy}px` }, g);
        const [mx2, my2] = polar(cx, cy, r * 0.7, m);
        marks.push({
          x: mx2, y: my2, label: data.labels[i], value: vals[i] || 0, node, index: i, group: k,
          html: `<strong>${esc(data.labels[i])}</strong><b>${esc(fmt(vals[i] || 0))}</b>`,
          hit: (px, py) => {
            const d = Math.hypot(px - cx, py - cy);
            if (d > r + 6) return false;
            const an = ((Math.atan2(px - cx, cy - py) % TAU) + TAU) % TAU;
            return an >= a0 && an <= a1;
          },
        });
      });
      return marks;
    };
    draw.legendByLabel = true;
    draw.radius = 1;
    return chart(el, o, draw);
  },
};
