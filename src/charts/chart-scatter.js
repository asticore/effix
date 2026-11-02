/* chart-scatter — scatter / bubble chart.
   <div class="efx-chart-scatter" data-efx-data='[{"x":1,"y":4},{"x":3,"y":7,"r":5,"label":"A"}]' data-efx-bubble></div>
   Series: [[{x,y}…],[…]] or [{"name":"A","points":[…]}] */
import { COMMON, chart, nice, linear, axes, s, esc } from './_lib.js';
import { on } from '../core.js';

const norm = r => {
  r = Array.isArray(r) ? r : r.series || r.datasets || [r];
  if (r[0] && r[0].x != null) r = [r];
  return r.map(q => ({ n: q.name, p: (Array.isArray(q) ? q : q.points || q.data || []).map(d => ({ ...d, x: +d.x, y: +d.y, r: +d.r || 1 })).filter(d => isFinite(d.x) && isFinite(d.y)) }));
};
const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export default {
  name: 'chart-scatter',
  selector: '.efx-chart-scatter',
  lazy: true,
  defaults: { ...COMMON, xLabel: '', yLabel: '', bubble: false },
  init(el, o) {
    const read = d => { try { return norm(d); } catch (e) { return []; } };
    const j = el.querySelector(':scope > script[type="application/json"]');
    let sets = [];
    try { sets = read(JSON.parse(j ? j.textContent : o.data)); } catch (e) { console.warn('[effix] chart data', e); }
    o.data = JSON.stringify({ series: sets.map(q => ({ name: q.n, values: [] })) }); // lib only needs series names
    const off = on(el, 'efx:data', e => { sets = read(e.detail || {}); });
    const draw = ({ g, w, h, data, visible, colors, fmt, deco }) => {
      const all = visible.flatMap(v => (sets[v.index] ? sets[v.index].p : []));
      if (!all.length) return [];
      const rmax = Math.max(...all.map(p => Math.abs(p.r)));
      const R = p => o.bubble ? Math.max(3, 24 * Math.sqrt(Math.abs(p.r) / rmax)) : 5;
      const m = deco ? (o.bubble ? 24 : 8) : 0;
      const pad = deco ? { t: m, r: m, b: m, l: m } : { t: 12, r: 24, b: o.xLabel ? 46 : 30, l: o.yLabel ? 60 : 46 };
      const X = nice(Math.min(...all.map(p => p.x)), Math.max(...all.map(p => p.x)), Math.max(2, Math.floor(w / 80)));
      const Y = nice(Math.min(...all.map(p => p.y)), Math.max(...all.map(p => p.y)), Math.max(2, Math.floor(h / 50)));
      const x = linear([X.min, X.max], [pad.l, w - pad.r]), y = linear([Y.min, Y.max], [h - pad.b, pad.t]);
      if (!deco) {
        axes(g, { w, h, pad, y, ticks: Y.ticks, fmt });
        const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
        X.ticks.forEach(t => {
          s('line', { x1: x(t), x2: x(t), y1: pad.t, y2: h - pad.b, class: 'efx-chart__grid' }, ax);
          s('text', { x: x(t), y: h - pad.b + 18, 'text-anchor': 'middle' }, ax).textContent = nf.format(t);
        });
        if (o.xLabel) s('text', { x: (pad.l + w - pad.r) / 2, y: h - 4, 'text-anchor': 'middle' }, ax).textContent = o.xLabel;
        if (o.yLabel) s('text', { x: 12, y: (pad.t + h - pad.b) / 2, 'text-anchor': 'middle', transform: `rotate(-90 12 ${(pad.t + h - pad.b) / 2})` }, ax).textContent = o.yLabel;
      }
      const multi = data.series.length > 1, items = [];
      visible.forEach(v => (sets[v.index] ? sets[v.index].p : []).forEach(p => items.push({ p, v, cx: x(p.x), cy: y(p.y), r: R(p) })));
      const step = Math.min(1, 24 / items.length);
      [...items].sort((a, b) => b.r - a.r).forEach((t, k) => {
        t.node = s('circle', { cx: t.cx, cy: t.cy, r: t.r, fill: colors[t.v.index], 'fill-opacity': o.bubble ? .55 : .85, stroke: o.bubble ? colors[t.v.index] : null, 'stroke-width': 1.5, class: 'efx-chart__mark efx-chart__fade', style: `--i:${k * step}` }, g);
      });
      return items.sort((a, b) => a.cx - b.cx).map((t, i) => ({
        x: t.cx, y: t.cy, value: t.p.y, series: multi ? t.v.name : '', node: t.node, index: i,
        label: t.p.label || `${nf.format(t.p.x)}, ${nf.format(t.p.y)}`,
        hit: (px, py) => Math.hypot(px - t.cx, py - t.cy) <= t.r + 3,
        html: (t.p.label ? `<strong>${esc(t.p.label)}</strong>` : '') + (multi ? `<span>${esc(t.v.name)}</span>` : '') +
          `<span>${esc(o.xLabel || 'x')} <b>${nf.format(t.p.x)}</b></span><span>${esc(o.yLabel || 'y')} <b>${esc(fmt(t.p.y))}</b></span>` + (o.bubble ? `<span>size <b>${nf.format(t.p.r)}</b></span>` : ''),
      }));
    };
    const stop = chart(el, o, draw);
    return () => { off(); stop(); };
  },
};
