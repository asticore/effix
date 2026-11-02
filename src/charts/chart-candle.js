/* chart-candle — candlestick / OHLC with optional volume.
   <div class="efx-chart-candle" data-efx-data='[{"label":"Mon","o":10,"h":14,"l":9,"c":13,"v":900}]'></div>
   Or series arrays named/ordered open|high|low|close|volume. */
import { COMMON, chart, nice, linear, band, axes, s, esc } from './_lib.js';
import { on, cssVar } from '../core.js';

const KEYS = ['o', 'h', 'l', 'c', 'v'];
const objRows = r => {
  r = Array.isArray(r) ? r : r && (r.rows || r.data);
  return Array.isArray(r) && r.length && r.every(d => d && typeof d === 'object' && !Array.isArray(d) && 'h' in d) ? r : null;
};

export default {
  name: 'chart-candle',
  selector: '.efx-chart-candle',
  lazy: true,
  defaults: { ...COMMON, legend: false, style: 'candle', volume: false, grid: true },
  init(el, o) {
    let rows = null; // object form, read raw because parseData only keeps numbers
    const read = r => { try { rows = objRows(typeof r === 'string' ? JSON.parse(r) : r); } catch (e) { rows = null; } };
    const j = el.querySelector(':scope > script[type="application/json"]');
    read(!o.source && o.data ? o.data : j && j.textContent);
    const offData = on(el, 'efx:data', e => read(e.detail)); // registered before chart(): runs first
    const draw = ({ g, w, h, data, colors, fmt, deco }) => {
      let R = rows && rows.map((d, i) => ({ label: String(d.label ?? i + 1), o: +d.o, h: +d.h, l: +d.l, c: +d.c, v: +d.v || 0 }));
      if (!R) { // series form: by name (open/high/low/close/volume) else by order
        const by = {};
        data.series.forEach((sr, i) => { const k = KEYS.find(k => k === sr.name.toLowerCase()[0] && !by[k]); by[k || KEYS[i]] = sr.values; });
        R = data.labels.map((label, i) => ({ label, o: by.o && by.o[i], h: by.h && by.h[i], l: by.l && by.l[i], c: by.c && by.c[i], v: (by.v && by.v[i]) || 0 }));
      }
      R = R.filter(d => [d.o, d.h, d.l, d.c].every(Number.isFinite));
      const n = R.length;
      if (!n) return [];
      const vol = o.volume && !deco && R.some(d => d.v > 0);
      const pad = deco ? { t: 4, r: 0, b: 4, l: 0 } : { t: 12, r: 8, b: 28, l: 48 };
      const vh = vol ? (h - pad.t - pad.b) * 0.2 : 0, pb = h - pad.b - (vol ? vh + 8 : 0);
      const lo = Math.min(...R.map(d => d.l)), hi = Math.max(...R.map(d => d.h)), m = (hi - lo) * 0.04 || 1;
      const sc = nice(lo - m, hi + m, Math.max(2, Math.floor((pb - pad.t) / 46)));
      const y = linear([sc.min, sc.max], [pb, pad.t]);
      const b = band(n, [pad.l, w - pad.r], 0.3);
      const cx = i => b.x(i) + b.bw / 2;
      const [up, dn] = o.colors.length >= 2 ? [o.colors[0], o.colors[1]] : [cssVar(el, '--sh-success', '#10b981'), cssVar(el, '--sh-danger', '#ef4444')];
      if (!deco) {
        axes(g, { w, h, pad, y, ticks: sc.ticks, labels: R.map(d => d.label), x: cx, fmt, grid: o.grid, rotate: b.step < 34 });
      }
      const vmax = Math.max(...R.map(d => d.v), 1), bw = Math.max(1, Math.min(b.bw, 18)), ohlc = o.style === 'ohlc';
      const step = Math.min(1, 24 / n);
      const base = h - pad.b;
      return R.map((d, i) => {
        const col = d.c >= d.o ? up : dn, x = cx(i);
        const node = s('g', { class: 'efx-chart__mark efx-cd__pt' }, g);
        s('rect', { x: b.x(i) - (b.step - b.bw) / 2, y: pad.t, width: b.step, height: base - pad.t, class: 'efx-cd__band' }, node);
        const sh = s('g', { class: 'efx-chart__fade', style: `--i:${i * step}`, stroke: col, fill: col }, node);
        if (vol && d.v > 0) s('rect', { x: x - bw / 2, y: base - Math.max(1, (d.v / vmax) * vh), width: bw, height: Math.max(1, (d.v / vmax) * vh), 'fill-opacity': .35, stroke: 'none' }, sh);
        s('line', { x1: x, x2: x, y1: y(d.h), y2: y(d.l), 'stroke-width': ohlc ? Math.max(1, Math.min(2, bw / 3)) : 1 }, sh);
        if (ohlc) {
          const t = Math.max(2, bw / 2), sw = Math.max(1, Math.min(2, bw / 3));
          s('line', { x1: x - t, x2: x, y1: y(d.o), y2: y(d.o), 'stroke-width': sw }, sh);
          s('line', { x1: x, x2: x + t, y1: y(d.c), y2: y(d.c), 'stroke-width': sw }, sh);
        } else {
          const t = Math.min(y(d.o), y(d.c));
          s('rect', { x: x - bw / 2, y: t, width: bw, height: Math.max(1, Math.abs(y(d.o) - y(d.c))), rx: bw > 6 ? 1.5 : 0, fill: col }, sh);
        }
        const chg = d.o ? ((d.c - d.o) / d.o) * 100 : 0, row = (k, v) => `<span>${k} <b>${esc(fmt(v))}</b></span>`;
        return {
          x, y: y(d.h), label: d.label, value: d.c, node, index: i, xOnly: true, group: i,
          html: `<strong>${esc(d.label)}</strong>${row('O', d.o)}${row('H', d.h)}${row('L', d.l)}${row('C', d.c)}` + (d.v ? row('Vol', d.v) : '') + `<span style="color:${col}">${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%</span>`,
        };
      });
    };
    draw.radius = Infinity;
    const off = chart(el, o, draw);
    return () => { offData(); off(); };
  },
};
