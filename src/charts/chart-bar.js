/* chart-bar — vertical/horizontal, grouped or stacked bars.
   <div class="efx-chart-bar" data-efx-data="12,19,7,24" data-efx-labels="Q1|Q2|Q3|Q4"></div>
   <div class="efx-chart-bar" data-efx-data="[[3,5,2],[4,1,6]]" data-efx-names="2025|2026" data-efx-stacked></div>
   Variants: data-efx-style="lollipop", data-efx-radial, data-efx-normalize (100%), data-efx-diverging (negatives, centred zero). */
import { COMMON, chart, nice, linear, band, axes, arcPath, polar, s } from './_lib.js';
import { cssVar } from '../core.js';

export default {
  name: 'chart-bar',
  selector: '.efx-chart-bar',
  lazy: true,
  defaults: { ...COMMON, horizontal: false, stacked: false, normalize: false, diverging: false, radial: false, style: 'bar', values: false, radius: 4, grid: true, min: 0 },
  init(el, o) {
    return chart(el, o, ({ g, w, h, data, visible, colors, fmt, deco }) => {
      const n = data.labels.length;
      if (!n || !visible.length) return [];
      const hz = o.horizontal;
      const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : hz ? { t: 8, r: 24, b: 24, l: 72 } : { t: 12, r: 8, b: 28, l: 44 };
      const st = o.stacked || o.normalize, lol = o.style === 'lollipop' && !st;
      const totals = data.labels.map((_, i) => visible.reduce((a, sr) => a + Math.max(0, sr.values[i] || 0), 0));
      const V = (sr, i) => { const x = sr.values[i] || 0; return o.normalize ? x / (totals[i] || 1) * 100 : x; };
      const F = o.normalize ? t => t + '%' : fmt;
      const vals = o.normalize ? [100] : st ? totals : visible.flatMap(sr => sr.values);
      const ext = o.diverging ? Math.max(...vals.map(Math.abs), 1) : 0;
      const sc = o.diverging ? nice(-ext, ext, 4) : nice(Math.min(o.min, ...vals), Math.max(...vals, 0), hz ? Math.max(2, Math.floor(w / 90)) : Math.max(2, Math.floor(h / 50)));
      if (o.radial) return radial({ g, w, h, data, visible, colors, fmt: F, deco, V, sc, st });
      const v = linear([sc.min, sc.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
      const b = band(n, hz ? [pad.t, h - pad.b] : [pad.l, w - pad.r], 0.28);
      if (!deco) {
        if (hz) {
          const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
          sc.ticks.forEach(t => {
            s('line', { x1: v(t), x2: v(t), y1: pad.t, y2: h - pad.b, class: 'efx-chart__grid' }, ax);
            s('text', { x: v(t), y: h - pad.b + 16, 'text-anchor': 'middle' }, ax).textContent = F(t);
          });
          data.labels.forEach((l, i) => { s('text', { x: pad.l - 8, y: b.x(i) + b.bw / 2, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, ax).textContent = l; });
        } else axes(g, { w, h, pad, y: v, ticks: sc.ticks, labels: data.labels, x: i => b.x(i) + b.bw / 2, fmt: F, grid: o.grid });
        if (sc.min < 0) s('line', hz ? { x1: v(0), x2: v(0), y1: pad.t, y2: h - pad.b, style: 'stroke:var(--efx-chart-text,#64748b);stroke-opacity:.7' } : { x1: pad.l, x2: w - pad.r, y1: v(0), y2: v(0), style: 'stroke:var(--efx-chart-text,#64748b);stroke-opacity:.7' }, g);
      }
      const marks = [];
      const per = st ? 1 : visible.length;
      const neg = o.diverging && visible.length === 1 ? cssVar(el, '--sh-danger', '#ef4444') : '';
      const bw = b.bw / per;
      data.labels.forEach((label, i) => {
        let acc = 0;
        visible.forEach((sr, k) => {
          const raw = sr.values[i] || 0, val = V(sr, i);
          const a = st ? acc : Math.min(0, Math.max(sc.min, 0));
          const z = st ? acc + val : val;
          acc += Math.max(0, val);
          const p0 = v(st ? a : Math.max(sc.min, 0)), p1 = v(z);
          const off = b.x(i) + (st ? 0 : k * bw);
          const thick = Math.max(1, (st ? b.bw : bw) - (per > 1 ? 2 : 0));
          const r = Math.min(o.radius, thick / 2);
          const attrs = hz
            ? { x: Math.min(p0, p1), y: off, width: Math.abs(p1 - p0), height: thick }
            : { x: off, y: Math.min(p0, p1), width: thick, height: Math.abs(p1 - p0) };
          const col = neg && val < 0 ? neg : colors[sr.index], cls = `efx-chart__mark ${hz ? 'efx-chart__grow-x' : 'efx-chart__grow'}`;
          let node;
          if (lol) { // stick + dot
            const cx0 = attrs.x + attrs.width / 2, cy0 = attrs.y + attrs.height / 2, dr = Math.max(3, Math.min(8, thick / 2));
            node = s('g', { class: cls, style: `--i:${i}`, fill: col, stroke: col }, g);
            s('line', hz ? { x1: p0, x2: p1, y1: cy0, y2: cy0, 'stroke-width': 2 } : { x1: cx0, x2: cx0, y1: p0, y2: p1, 'stroke-width': 2 }, node);
            s('circle', { cx: hz ? p1 : cx0, cy: hz ? cy0 : p1, r: dr, stroke: 'none' }, node);
          } else node = s('rect', { ...attrs, rx: r, fill: col, class: cls, style: `--i:${i}` }, g);
          if (o.values && !deco && !st) {
            const t = hz ? s('text', { x: val < 0 ? Math.min(p0, p1) - (lol ? 13 : 6) : Math.max(p0, p1) + (lol ? 13 : 6), 'text-anchor': val < 0 ? 'end' : null, y: off + thick / 2, 'dominant-baseline': 'middle', class: 'efx-chart__value efx-chart__fade', style: `--i:${i}` }, g)
              : s('text', { x: off + thick / 2, y: val < 0 ? Math.max(p0, p1) + (lol ? 20 : 14) : Math.min(p0, p1) - (lol ? 13 : 6), 'text-anchor': 'middle', class: 'efx-chart__value efx-chart__fade', style: `--i:${i}` }, g);
            t.textContent = fmt(raw);
          }
          const cx = attrs.x + attrs.width / 2, cy = attrs.y + (hz ? attrs.height / 2 : 0);
          marks.push({ x: cx, y: cy, label, value: raw, valueText: o.normalize ? `${+val.toFixed(1)}% (${fmt(raw)})` : undefined, series: visible.length > 1 || data.series.length > 1 ? sr.name : '', node, index: i,
            hit: (px, py) => px >= attrs.x && px <= attrs.x + attrs.width && py >= attrs.y - 4 && py <= attrs.y + attrs.height });
        });
      });
      return marks;
    });
  },
};

/* Circular barplot: bars radiate from an inner radius, labels sit around the ring. */
function radial({ g, w, h, data, visible, colors, fmt, deco, V, sc, st }) {
  const n = data.labels.length, cx = w / 2, cy = h / 2, m = deco ? 2 : 52;
  const R = Math.max(20, Math.min(w / 2 - m, h / 2 - (deco ? 2 : 20))), r0 = R * 0.28;
  const mx = Math.max(...(st ? data.labels.map((_, i) => visible.reduce((a, sr) => a + Math.max(0, V(sr, i)), 0)) : visible.flatMap(sr => sr.values.map((_, i) => V(sr, i)))), 1);
  const rs = nice(0, mx, 3);
  const rad = val => r0 + Math.max(0, val) * (R - r0) / (rs.max || 1);
  const marks = [];
  if (!deco) {
    const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
    rs.ticks.forEach(t => s('circle', { cx, cy, r: rad(t), fill: 'none', class: 'efx-chart__grid' }, ax));
    data.labels.forEach((l, i) => {
      const am = (i + .5) / n * Math.PI * 2, [x, y] = polar(cx, cy, R + 8, am), sn = Math.sin(am), cs = Math.cos(am);
      s('text', { x, y: y + (cs > .3 ? -2 : cs < -.3 ? 10 : 4), 'text-anchor': sn > .2 ? 'start' : sn < -.2 ? 'end' : 'middle' }, ax).textContent = l;
    });
  }
  const per = st ? 1 : visible.length, slot = Math.PI * 2 / n, gap = slot * .12;
  data.labels.forEach((label, i) => {
    let acc = 0;
    visible.forEach((sr, k) => {
      const raw = sr.values[i] || 0, val = V(sr, i), lo = st ? acc : 0;
      acc += Math.max(0, val);
      const bw = (slot - gap) / per, a0 = i * slot + gap / 2 + (st ? 0 : k * bw), a1 = a0 + bw;
      const ri = st ? rad(lo) : r0, ro = rad(lo + Math.max(0, val));
      const node = s('path', { d: arcPath(cx, cy, ri, Math.max(ro, ri + 1), a0, a1), fill: colors[sr.index], class: 'efx-chart__mark efx-chart__fade', style: `--i:${i}` }, g);
      const [x, y] = polar(cx, cy, Math.max(ro, ri + 1), (a0 + a1) / 2);
      marks.push({ x, y, label, value: raw, series: visible.length > 1 || data.series.length > 1 ? sr.name : '', node, index: i, hit: (px, py) => {
        const d = Math.hypot(px - cx, py - cy); let a = Math.atan2(px - cx, cy - py); if (a < 0) a += Math.PI * 2;
        return d >= ri && d <= Math.max(ro, ri + 1) && a >= a0 && a <= a1;
      } });
    });
  });
  return marks;
}
