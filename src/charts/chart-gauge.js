/* chart-gauge — gauge (240° arc), progress ring, or concentric radial bars.
   <div class="efx-chart-gauge" data-efx-value="72" data-efx-label="Uptime" data-efx-suffix="%"></div>
   <div class="efx-chart-gauge" data-efx-type="radial" data-efx-data="80,60,35" data-efx-labels="Move|Exercise|Stand"></div> */
import { COMMON, chart, palette, s, esc, polar } from './_lib.js';

const TAU = Math.PI * 2;

export default {
  name: 'chart-gauge',
  selector: '.efx-chart-gauge',
  lazy: true,
  defaults: { ...COMMON, legend: false, type: 'gauge', value: NaN, min: 0, max: 100, thick: 0.18, needle: false, target: NaN, label: '' },
  init(el, o) {
    return chart(el, o, ({ g, w, h, data, fmt, deco }) => {
      const ty = o.type, rad = ty === 'radial', gauge = ty === 'gauge', S = data.series[0] || { values: [] };
      const pal = palette(el, o, Math.max(1, data.labels.length));
      if (rad && !S.values.length) return [];
      const vals = rad ? S.values : [Number.isFinite(o.value) ? o.value : S.values[0] || 0];
      const span = o.max - o.min || 1, p = v => Math.min(1, Math.max(0, (v - o.min) / span));
      const a0 = gauge ? (-2 * Math.PI) / 3 : 0, sw = rad ? 1.5 * Math.PI : gauge ? (4 * Math.PI) / 3 : TAU;
      const m = deco ? 2 : 6;
      const R = gauge ? Math.min((w - 2 * m) / 2, (h - 2 * m) / 1.5) : Math.min(w, h) / 2 - m;
      const cx = w / 2, cy = gauge ? (h - 1.5 * R) / 2 + R : h / 2;
      const n = vals.length, ring = Math.max(2, rad ? Math.min(o.thick * R, ((R * 0.78) / n) - 3) : o.thick * R);
      const arc = (r, a, b) => {
        b = Math.min(b, a + TAU - 1e-3);
        const [x0, y0] = polar(cx, cy, r, a), [x1, y1] = polar(cx, cy, r, b);
        return `M${x0},${y0}A${r},${r} 0 ${b - a > Math.PI ? 1 : 0} 1 ${x1},${y1}`;
      };
      const marks = [];
      const text = !deco && Math.min(w, h) >= 90;
      vals.forEach((v, i) => {
        const r = rad ? R - ring / 2 - i * (((R * 0.78) / n)) : R - ring / 2, a1 = a0 + sw * p(v), name = rad ? data.labels[i] : o.label || (data.labels[0] !== '1' ? data.labels[0] : 'Value');
        s('path', { d: arc(r, a0, a0 + sw), class: 'efx-gauge-track', 'stroke-width': ring, 'stroke-linecap': 'round', fill: 'none' }, g);
        const node = s('path', { d: arc(r, a0, a1 || a0 + 1e-3), pathLength: 1, class: 'efx-chart__mark efx-gauge-sweep', style: `--i:${i * 3}`, stroke: pal[rad ? i : 0], 'stroke-width': ring, 'stroke-linecap': 'round', fill: 'none', visibility: p(v) > 0 ? null : 'hidden' }, g);
        const [x, y] = polar(cx, cy, r, a1);
        marks.push({
          x, y, label: name, value: v, node, index: i, series: '',
          html: `<strong>${esc(name)}</strong><b>${esc(fmt(v))}</b><span>${Math.round(p(v) * 100)}% of ${esc(fmt(o.max))}</span>`,
          hit: (px, py) => {
            const d = Math.hypot(px - cx, py - cy), an = (((Math.atan2(px - cx, cy - py) - a0) % TAU) + TAU) % TAU;
            return Math.abs(d - r) <= ring / 2 + 4 && an <= sw + 0.05;
          },
        });
        if (rad && text) {
          const t = s('text', { x: cx - 10, y: cy - r, 'text-anchor': 'end', 'dominant-baseline': 'central', class: 'efx-gauge-lab efx-chart__fade', style: `--i:${i}` }, g);
          t.textContent = name;
        }
      });
      const v = vals[0], ri = R - ring;
      if (Number.isFinite(o.target) && !rad) {
        const at = a0 + sw * p(o.target), [x1, y1] = polar(cx, cy, R - ring - 3, at), [x2, y2] = polar(cx, cy, R + 3, at);
        s('line', { x1, y1, x2, y2, class: 'efx-gauge-target' }, g);
      }
      if (deco || rad) return marks;
      if (gauge && o.needle) {
        const len = R - ring - 4;
        s('path', { d: `M${cx - 3.5},${cy}L${cx},${cy - len}L${cx + 3.5},${cy}Z`, class: 'efx-gauge-needle', style: `transform-origin:${cx}px ${cy}px;--a:${a0 + sw * p(v)}rad` }, g);
        s('circle', { cx, cy, r: 6, class: 'efx-gauge-hub' }, g);
      }
      if (text) {
        const str = fmt(v), cap = o.label || (data.labels[0] !== '1' ? data.labels[0] : '');
        const f = Math.min(ri * (gauge ? (o.needle ? 0.36 : 0.5) : 0.5), (ri * 1.6) / (str.length * 0.58)), ty0 = gauge ? (o.needle ? cy + ri * 0.4 : cy + ri * 0.02) : cy - (cap ? f * 0.3 : 0);
        const big = s('text', { x: cx, y: ty0, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'efx-chart__value efx-chart__fade', style: `font-size:${f}px` }, g);
        big.textContent = str;
        if (cap) s('text', { x: cx, y: ty0 + f * 0.8, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'efx-gauge-lab efx-chart__fade' }, g).textContent = cap;
      }
      return marks;
    });
  },
};
