/* chart-progress — horizontal goal bars (KPI list). labels = rows, series 1 = values, series 2 (optional) = targets.
   <div class="efx-chart-progress" data-efx-labels="Signups|Revenue" data-efx-data="820,64|1000,80"></div> */
import { COMMON, chart, palette, parseData, s, esc } from './_lib.js';
import { on } from '../core.js';

const GAP = 12;
export default {
  name: 'chart-progress',
  selector: '.efx-chart-progress',
  lazy: true,
  defaults: { ...COMMON, max: NaN, values: true, percent: true, thick: 10, radius: 999, legend: false },
  init(el, o) {
    const auto = el.dataset.efxHeight === undefined;
    const fit = n => { if (auto) o.height = Math.max(1, n) * (o.thick + 30) - GAP; };
    const rows = d => fit(d.labels.length);
    rows(parseData(el, o));
    const off = on(el, 'efx:data', e => { const x = e.detail || {}; rows(parseData(el, { ...o, source: '', data: JSON.stringify(x), labels: x.labels || [] })); });
    const draw = ({ g, w, h, data, fmt, deco }) => {
      const n = data.labels.length, [V, T] = data.series;
      if (!n || !V) return [];
      const pal = palette(el, o, n), pitch = (h + GAP) / n, th = deco ? pitch * .6 : o.thick, r = Math.min(o.radius, th / 2);
      const all = Math.max(...V.values, ...(T ? T.values : []), 1);
      return data.labels.map((label, i) => {
        const v = V.values[i] || 0, t = T ? T.values[i] || 0 : 0;
        const sc = o.max > 0 ? o.max : t ? Math.max(t, v) : all;
        const y = i * pitch + (deco ? (pitch - th) / 2 : 16), f = Math.max(0, Math.min(1, v / sc)) * w;
        const pc = Math.round(v / (t || sc) * 100);
        const txt = [o.values && fmt(v) + (t ? ' / ' + fmt(t) : ''), o.percent && pc + '%'].filter(Boolean).join(' · ');
        s('rect', { x: 0, y, width: w, height: th, rx: r, style: 'fill:var(--sh-surface-2,rgb(128 128 128/.18))' }, g);
        if (!deco) {
          const lab = s('text', { x: 0, y: i * pitch + 11, style: 'fill:var(--sh-text,#0f172a);font-size:13px' }, g);
          const room = Math.max(4, Math.floor((w - txt.length * 7.5 - 12) / 7));
          lab.textContent = label.length > room ? label.slice(0, room - 1) + '…' : label;
          s('text', { x: w, y: i * pitch + 11, 'text-anchor': 'end', class: 'efx-chart__value', style: 'font-size:13px' }, g).textContent = txt;
        }
        const node = s('rect', { x: 0, y, width: Math.max(f, f ? th : 0), height: th, rx: r, fill: pal[i], class: 'efx-chart__mark efx-chart__grow-x', style: `--i:${i}` }, g);
        if (t) { const tx = Math.min(1, t / sc) * w; s('line', { x1: tx, x2: tx, y1: y - 3, y2: y + th + 3, stroke: 'var(--sh-text,#0f172a)', 'stroke-width': 2, 'stroke-linecap': 'round', class: 'efx-chart__fade', style: `--i:${i}` }, g); }
        return { x: f, y: y + th / 2, label, value: v, node, index: i,
          html: `<strong>${esc(label)}</strong><b>${esc(fmt(v) + (t ? ' / ' + fmt(t) : ''))}</b><span>${pc}%</span>`,
          hit: (px, py) => py >= i * pitch && py <= i * pitch + pitch - GAP + 4 };
      });
    };
    draw.radius = 1;
    const stop = chart(el, o, draw);
    return () => { off(); stop(); };
  },
};
