/* chart-bullet — Stephen Few bullet chart: qualitative bands, measure bar, target tick.
   <div class="efx-chart-bullet" data-efx-data='[{"label":"Revenue","value":270,"target":300,"ranges":[150,225,300]}]'></div>
   <div class="efx-chart-bullet" data-efx-data="270,45" data-efx-labels="Revenue|Profit" data-efx-targets="300|50" data-efx-ranges="150,225,300"></div> */
import { COMMON, chart, nice, linear, s, esc } from './_lib.js';
import { on } from '../core.js';

const nums = a => (Array.isArray(a) ? a : []).map(Number).filter(Number.isFinite).sort((x, y) => x - y);
const rowsOf = (a, o) => (Array.isArray(a) ? a : []).filter(r => r && typeof r === 'object').map(r => ({ label: String(r.label ?? r.name ?? ''), value: +r.value || 0, target: r.target == null ? null : +r.target, ranges: nums(r.ranges || o.ranges), max: +r.max || 0, color: r.color }));
const read = (el, o) => {
  try { return rowsOf(JSON.parse((o.data || '').trim() || el.querySelector(':scope > script[type="application/json"]').textContent), o); } catch (e) { return null; }
};
const cut = (t, px) => (t.length * 6.2 > px ? t.slice(0, Math.max(1, Math.floor(px / 6.2) - 1)) + '…' : t);

export default {
  name: 'chart-bullet',
  selector: '.efx-chart-bullet',
  lazy: true,
  defaults: { ...COMMON, vertical: false, barHeight: 18, values: true, shared: false, targets: [], ranges: [], legend: false },
  init(el, o) {
    let own = read(el, o);
    // registered before chart() so it runs before the lib's own efx:data handler
    const off = on(el, 'efx:data', e => { own = Array.isArray(e.detail) ? rowsOf(e.detail, o) : null; });
    const rows = data => {
      if (own && own.length) return own;
      const tg = o.targets;
      return (data.series[0] ? data.series[0].values : []).map((value, i) => {
        const x = tg.length ? parseFloat(tg[tg.length === 1 ? 0 : i]) : NaN;
        return { label: data.labels[i], value, target: Number.isFinite(x) ? x : null, ranges: nums(o.ranges), max: 0 };
      });
    };
    const draw = ({ g, w, h, data, colors, fmt, deco }) => {
      const R = rows(data), n = R.length;
      if (!n) return [];
      const hz = !o.vertical, bh = o.barHeight, lab = R.some(r => r.label);
      const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : hz ? { t: 2, r: o.values ? 60 : 8, b: o.shared ? 22 : 2, l: lab ? 92 : 8 } : { t: o.values ? 18 : 6, r: 4, b: 24, l: 4 };
      const top = r => r.max || Math.max(r.value, r.target || 0, ...r.ranges, 0) || 1;
      const gmax = nice(0, Math.max(...R.map(top))), step = (hz ? h - pad.t - pad.b : w - pad.l - pad.r) / n;
      const marks = [];
      if (o.shared && !deco) {
        const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g), sx = linear([0, gmax.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
        gmax.ticks.forEach(t => s('text', hz ? { x: sx(t), y: h - 6, 'text-anchor': 'middle' } : { x: w - 2, y: sx(t), 'text-anchor': 'end', 'dominant-baseline': 'middle' }, ax).textContent = fmt(t));
      }
      R.forEach((r, i) => {
        const max = o.shared ? gmax.max : top(r), c0 = (hz ? pad.t : pad.l) + i * step, th = Math.min(bh, step - 4) || bh, cc = c0 + (step - th) / 2;
        const sc = linear([0, max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
        const box = (c, t, a, b, fill, cls, extra) => {
          const [p, q] = [sc(a), sc(b)];
          return s('rect', { ...(hz ? { x: Math.min(p, q), y: c, width: Math.abs(q - p), height: t } : { x: c, y: Math.min(p, q), width: t, height: Math.abs(q - p) }), fill, class: cls, style: `--i:${i}`, ...extra }, gr);
        };
        const gr = s('g', { class: 'efx-chart__mark' }, g), bd = r.ranges.length ? r.ranges.concat(r.ranges[r.ranges.length - 1] < max ? [max] : []) : [max];
        bd.forEach((b, j) => box(cc, th, j ? bd[j - 1] : 0, Math.min(b, max), `color-mix(in oklab, var(--sh-text, #0f172a) ${Math.max(5, 8 * (bd.length - j))}%, var(--sh-surface, #fff))`, 'efx-chart__fade'));
        const mt = Math.max(3, th / 3);
        box(cc + (th - mt) / 2, mt, 0, Math.min(r.value, max), r.color || colors[0], hz ? 'efx-chart__grow-x' : 'efx-chart__grow', { rx: 1.5 });
        if (r.target != null) {
          const tv = sc(Math.min(r.target, max)), a = cc + th * .15, b = cc + th * .85;
          s('line', hz ? { x1: tv, x2: tv, y1: a, y2: b } : { x1: a, x2: b, y1: tv, y2: tv }, gr).setAttribute('style', 'stroke:var(--sh-text,#0f172a);stroke-width:2.5;stroke-linecap:round');
        }
        if (!deco) {
          if (r.label) {
          const lbl = s('text', hz ? { x: pad.l - 8, y: cc + th / 2, 'text-anchor': 'end', 'dominant-baseline': 'middle' } : { x: c0 + step / 2, y: h - 8, 'text-anchor': 'middle' }, g);
          lbl.textContent = cut(r.label, hz ? pad.l - 12 : step - 4);
          lbl.setAttribute('class', 'efx-chart__axis-t');
          }
          if (o.values) {
            const v = s('text', hz ? { x: w - pad.r + 8, y: cc + th / 2, 'dominant-baseline': 'middle' } : { x: c0 + step / 2, y: pad.t - 6, 'text-anchor': 'middle' }, g);
            v.setAttribute('class', 'efx-chart__value efx-chart__fade');
            v.textContent = fmt(r.value);
          }
        }
        const [ex, ey] = hz ? [sc(Math.min(r.value, max)), cc + th / 2] : [cc + th / 2, sc(Math.min(r.value, max))];
        marks.push({ x: ex, y: ey, label: r.label, value: r.value, series: '', node: gr, index: i,
          html: `<strong>${esc(r.label)}</strong><b>${esc(fmt(r.value))}</b>${r.target != null ? `<span>Target ${esc(fmt(r.target))}${r.target ? ` · ${Math.round(r.value / r.target * 100)}%` : ''}</span>` : ''}`,
          hit: (px, py) => (hz ? py >= c0 && py < c0 + step && px >= pad.l - 4 : px >= c0 && px < c0 + step && py <= h - pad.b + 4) });
      });
      return marks;
    };
    draw.radius = 1;
    draw.height = (w, data) => (o.vertical ? o.height || 220 : rows(data).length * (o.barHeight + 12) + (o.shared ? 22 : 0) + 4);
    const stop = chart(el, o, draw);
    return () => { off(); stop(); };
  },
};
