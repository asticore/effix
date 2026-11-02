/* chart-heatmap — grid (labels = columns, series = rows) or GitHub-style calendar.
   <div class="efx-chart-heatmap" data-efx-data="[[1,4,2],[3,0,5]]" data-efx-labels="A|B|C" data-efx-names="Row 1|Row 2"></div>
   <div class="efx-chart-heatmap" data-efx-calendar data-efx-data='[{"date":"2026-01-03","value":4}]'></div> */
import { COMMON, chart, palette, parseData, s } from './_lib.js';
import { on } from '../core.js';

const DAY = 864e5;
const utc = d => { const m = String(d).match(/\d+/g) || []; return Date.UTC(m[0], m[1] - 1, m[2]); };
const rd = (el, t) => { try { const j = el.querySelector(':scope > script[type="application/json"]'); let r = JSON.parse(j ? j.textContent : t); r = Array.isArray(r) ? r : r.data || []; return r.filter(d => d && d.date).map(d => ({ t: utc(d.date), v: +d.value || 0 })); } catch (e) { return []; } };

export default {
  name: 'chart-heatmap',
  selector: '.efx-chart-heatmap',
  lazy: true,
  defaults: { ...COMMON, height: 0, legend: false, calendar: false, scheme: '', gap: 2, radius: 2 },
  init(el, o) {
    const H0 = o.height, cal = o.calendar;
    let days = cal ? rd(el, o.data) : [], rows = cal ? 0 : parseData(el, o).series.length;
    if (cal) o.data = '{"series":[]}';
    const geo = w => { // calendar geometry: weeks × 7
      const t0 = Math.min(...days.map(d => d.t)), n = Math.round((Math.max(...days.map(d => d.t)) - t0) / DAY) + 1, d0 = new Date(t0).getUTCDay(), wk = Math.ceil((n + d0) / 7);
      return { t0, n, d0, wk, cell: Math.min(20, (w - 30) / wk) };
    };
    if (!o.background && !H0) Object.defineProperty(o, 'height', { get: () => cal ? (days.length ? 18 + 7 * geo(Math.max(40, el.clientWidth)).cell : 60) : 22 + 30 * Math.max(1, rows) });
    const off = on(el, 'efx:data', e => { const d = e.detail; if (cal) days = rd(el, JSON.stringify(d)); else rows = (d && d.series || []).length || rows; });
    const fmtDate = t => new Date(t).toLocaleDateString(undefined, { dateStyle: 'medium', timeZone: 'UTC' });
    const draw = ({ g, w, h, data, visible, fmt, deco }) => {
      const pal = palette(el, o, 7), c0 = pal[0], c1 = o.colors.length ? pal[1] : pal[5], gap = o.gap, cells = [];
      const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
      const text = (a, t) => (s('text', a, ax).textContent = t);
      let cw, ch, ox = 0, oy = 0;
      if (cal) {
        if (!days.length) return [];
        const q = geo(w), by = new Map(days.map(d => [d.t, d.v]));
        ox = deco ? 0 : 30; oy = deco ? 0 : 18;
        cw = deco ? w / q.wk : q.cell; ch = deco ? h / 7 : q.cell;
        let last = -9;
        for (let c = 0; c < q.wk; c++) {
          for (let r = 0; r < 7; r++) {
            const i = c * 7 + r - q.d0;
            if (i < 0 || i >= q.n) continue;
            const t = q.t0 + i * DAY;
            cells.push({ c, r, v: by.has(t) ? by.get(t) : null, label: fmtDate(t), series: '' });
            if (!deco && r === 0 && (c === 0 || new Date(t).getUTCDate() <= 7 && new Date(t - 7 * DAY).getUTCMonth() !== new Date(t).getUTCMonth()) && c - last >= 3) {
              last = c; text({ x: ox + c * cw, y: 11 }, new Date(t).toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' }));
            }
          }
        }
        if (!deco && ch >= 11) [1, 3, 5].forEach(r => text({ x: ox - 6, y: oy + (r + .5) * ch, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, new Date(Date.UTC(2023, 0, 1 + r)).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })));
      } else {
        const nc = data.labels.length;
        if (!nc || !visible.length) return [];
        ox = deco ? 0 : Math.min(120, 12 + 6.5 * Math.max(...visible.map(v => v.name.length)));
        oy = deco ? 0 : 22;
        cw = (w - ox) / nc; ch = (h - oy) / visible.length;
        const every = Math.ceil(nc / Math.max(1, Math.floor((w - ox) / 48)));
        if (!deco) data.labels.forEach((l, c) => c % every || text({ x: ox + (c + .5) * cw, y: 14, 'text-anchor': 'middle' }, l));
        visible.forEach((sr, r) => {
          if (!deco) text({ x: ox - 8, y: oy + (r + .5) * ch, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, sr.name);
          data.labels.forEach((l, c) => cells.push({ c, r, v: sr.values[c] == null ? null : sr.values[c], label: l, series: sr.name }));
        });
      }
      const vs = cells.filter(k => k.v != null).map(k => k.v), lo = Math.min(...vs), hi = Math.max(...vs), div = o.scheme === 'diverging', m = Math.max(Math.abs(lo), Math.abs(hi)) || 1;
      const step = Math.min(1, 16 / Math.max(1, cal ? cells.length / 7 : cells.length / (visible.length || 1)));
      const marks = [];
      cells.forEach(k => {
        const t = div ? Math.abs(k.v) / m : (k.v - lo) / (hi - lo || 1), x = ox + k.c * cw, y = oy + k.r * ch, rw = Math.max(1, cw - gap), rh = Math.max(1, ch - gap);
        const fill = k.v == null ? 'var(--efx-chart-text) 10%' : `${div && k.v < 0 ? c1 : c0} ${Math.round(8 + 92 * t)}%`;
        const node = s('rect', { x, y, width: rw, height: rh, rx: o.radius, style: `fill:color-mix(in oklab, ${fill}, transparent);--i:${k.c * step}`, class: (k.v == null ? '' : 'efx-chart__mark ') + 'efx-chart__fade' }, g);
        if (k.v != null) marks.push({ x: x + rw / 2, y: y + rh / 2, label: k.label, value: k.v, series: k.series, node, index: marks.length, hit: (px, py) => px >= x - gap / 2 && px <= x + rw + gap / 2 && py >= y - gap / 2 && py <= y + rh + gap / 2 });
      });
      return marks;
    };
    draw.radius = 1; // only the cell under the pointer counts
    const stop = chart(el, o, draw);
    return () => { off(); stop(); };
  },
};
