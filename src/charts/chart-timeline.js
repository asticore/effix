/* chart-timeline — Gantt / timeline. One row per item, optional group headers, date or numeric axis.
   <div class="efx-chart-timeline" data-efx-data='[{"label":"Design","start":"2026-01-05","end":"2026-02-01","progress":0.6}]'></div> */
import { COMMON, chart, nice, linear, palette, s, esc } from './_lib.js';
import { on } from '../core.js';

const DAY = 864e5, ROW = 30;
const mon = new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' });
const dfmt = (t, o) => new Intl.DateTimeFormat(undefined, { timeZone: 'UTC', ...o }).format(t);
const val = v => (typeof v === 'number' ? v : /^-?[\d.]+$/.test(String(v).trim()) ? +v : Date.parse(v));
// [unit, step] candidates, smallest first
const STEPS = [['d', 1], ['d', 2], ['w', 1], ['w', 2], ['m', 1], ['m', 2], ['m', 3], ['m', 6], ['y', 1], ['y', 2], ['y', 5], ['y', 10]];
function dateTicks(a, b, count) {
  const span = (b - a) / DAY;
  const [u, k] = STEPS.find(([u, k]) => span / (k * { d: 1, w: 7, m: 30.4, y: 365.25 }[u]) <= count) || STEPS[STEPS.length - 1];
  const d = new Date(a), out = [];
  if (u === 'd' || u === 'w') {
    let t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    if (u === 'w') t -= ((d.getUTCDay() + 6) % 7) * DAY; // Monday
    for (; t <= b; t += k * (u === 'w' ? 7 : 1) * DAY) if (t >= a) out.push(t);
  } else {
    let y = d.getUTCFullYear(), m = u === 'y' ? 0 : Math.floor(d.getUTCMonth() / k) * k;
    if (u === 'y') y = Math.floor(y / k) * k;
    for (let t = Date.UTC(y, m); t <= b; u === 'y' ? (y += k) : (m += k), t = Date.UTC(y, m)) if (t >= a) out.push(t);
  }
  const label = (t, i) => u === 'y' ? String(new Date(t).getUTCFullYear())
    : u === 'm' ? (new Date(t).getUTCMonth() === 0 || !i ? mon.format(t) + ' ' + new Date(t).getUTCFullYear() : mon.format(t))
      : dfmt(t, { month: 'short', day: 'numeric' });
  return out.map((t, i) => ({ t, text: label(t, i) }));
}
const readRows = r => { r = Array.isArray(r) ? r : r && (r.rows || r.data); return Array.isArray(r) ? r.filter(d => d && typeof d === 'object') : []; };

export default {
  name: 'chart-timeline',
  selector: '.efx-chart-timeline',
  lazy: true,
  defaults: { ...COMMON, legend: false, today: true, grid: true, radius: 4 },
  init(el, o) {
    let rows = [];
    const read = r => { try { rows = readRows(typeof r === 'string' ? JSON.parse(r) : r); } catch (e) { rows = []; } };
    const j = el.querySelector(':scope > script[type="application/json"]');
    read(o.data || (j && j.textContent));
    const offData = on(el, 'efx:data', e => read(e.detail)); // before chart(): runs first
    let uid = 0;
    let items = [], lanes = [];
    const prep = () => {
      items = rows.map(d => ({ d, a: val(d.start), b: val(d.end), g: d.group == null ? '' : String(d.group) })).filter(x => Number.isFinite(x.a) && Number.isFinite(x.b));
      lanes = [...new Set(items.map(x => x.g))];
      if (lanes.length > 1 || lanes[0]) items = lanes.flatMap(l => items.filter(x => x.g === l)); // keep groups together
    };
    prep();
    const grouped = () => lanes.length > 1 || !!lanes[0];
    const draw = ({ g, w, h, fmt, deco }) => {
      prep();
      if (!items.length) return [];
      const dates = items.some(x => typeof x.d.start === 'string' && !/^-?[\d.]+$/.test(x.d.start.trim()));
      const pal = palette(el, o, 7);
      const len = Math.max(...items.map(x => String(x.d.label ?? '').length), ...lanes.map(l => l.length));
      const pad = deco ? { t: 4, r: 0, b: 4, l: 0 } : { t: 16, r: 16, b: 28, l: Math.min(Math.max(48, len * 6.5 + 16), w * 0.35) };
      let lo = Math.min(...items.map(x => x.a)), hi = Math.max(...items.map(x => x.b));
      const pd = (hi - lo) * 0.02 || (dates ? DAY : 1);
      lo -= pd; hi += pd;
      let ticks;
      if (dates) ticks = dateTicks(lo, hi, Math.max(2, Math.floor((w - pad.l - pad.r) / 80)));
      else { const nc = nice(lo, hi, Math.max(2, Math.floor((w - pad.l - pad.r) / 80))); ticks = nc.ticks.filter(t => t >= lo && t <= hi).map(t => ({ t, text: fmt(t) })); }
      const x = linear([lo, hi], [pad.l, w - pad.r]);
      // vertical positions: group headers take a half row
      const nh = grouped() ? lanes.length : 0;
      const rh = deco ? (h - pad.t - pad.b) / (items.length + nh * 0.6) : ROW;
      let yy = pad.t, last = null;
      const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
      if (!deco) ticks.forEach(k => {
        s('line', { x1: x(k.t), x2: x(k.t), y1: pad.t, y2: h - pad.b, class: 'efx-chart__grid' }, ax);
        s('text', { x: x(k.t), y: h - pad.b + 18, 'text-anchor': 'middle' }, ax).textContent = k.text;
      });
      const marks = [];
      items.forEach((it, i) => {
        if (grouped() && it.g !== last) {
          last = it.g;
          if (!deco) s('text', { x: 0, y: yy + rh * 0.35, 'dominant-baseline': 'middle', class: 'efx-tl__grp' }, ax).textContent = it.g || '—';
          yy += rh * 0.6;
        }
        const d = it.d, col = d.color || pal[Math.max(0, lanes.indexOf(it.g)) % pal.length];
        const x0 = x(it.a), bw = Math.max(3, x(it.b) - x0), bh = Math.min(rh * 0.6, 20), by = yy + (rh - bh) / 2;
        const p = d.progress == null ? null : Math.max(0, Math.min(1, +d.progress > 1 ? +d.progress / 100 : +d.progress));
        const node = s('g', { class: 'efx-chart__mark efx-chart__grow-x', style: `--i:${i}` }, g);
        const id = 'efx-tl' + ++uid + '-' + i;
        s('rect', { x: x0, y: by, width: bw, height: bh, rx: o.radius, fill: col, 'fill-opacity': p == null ? 1 : 0.28 }, node);
        if (p != null) {
          const cp = s('clipPath', { id }, node);
          s('rect', { x: x0, y: by, width: bw, height: bh, rx: o.radius }, cp);
          s('rect', { x: x0, y: by, width: bw * p, height: bh, fill: col, 'clip-path': `url(#${id})` }, node);
        }
        if (!deco) {
          const t = s('text', { x: pad.l - 8, y: by + bh / 2, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, ax);
          const mc = Math.floor((pad.l - 12) / 6.2), lb = String(d.label ?? '');
          t.textContent = lb.length > mc ? lb.slice(0, Math.max(3, mc - 1)) + '…' : lb;
        }
        const dur = (it.b - it.a) / (dates ? DAY : 1), df = t => (dates ? dfmt(t, { year: 'numeric', month: 'short', day: 'numeric' }) : fmt(t));
        const y0 = yy;
        marks.push({
          x: x0 + bw / 2, y: by, label: String(d.label ?? i + 1), value: dur, node, index: i,
          html: `<strong>${esc(d.label ?? '')}</strong><span>${esc(df(it.a))} – ${esc(df(it.b))}</span><span>Duration <b>${esc(dates ? Math.round(dur) + (Math.round(dur) === 1 ? ' day' : ' days') : fmt(dur))}</b></span>` + (p == null ? '' : `<span>Progress <b>${Math.round(p * 100)}%</b></span>`),
          hit: (px, py) => py >= y0 && py <= y0 + rh && px >= pad.l - 4,
        });
        yy += rh;
      });
      if (!deco && dates && o.today) {
        const now = Date.now();
        if (now >= lo && now <= hi) {
          s('line', { x1: x(now), x2: x(now), y1: pad.t, y2: h - pad.b, class: 'efx-tl__today', stroke: pal[5] }, g);
          s('text', { x: x(now), y: pad.t - 4, 'text-anchor': 'middle', class: 'efx-tl__tt', fill: pal[5] }, g).textContent = 'Today';
        }
      }
      return marks;
    };
    draw.height = () => { prep(); return 16 + 28 + items.length * ROW + (grouped() ? lanes.length * ROW * 0.6 : 0); };
    draw.radius = 1;
    const off = chart(el, o, draw);
    return () => { offData(); off(); };
  },
};
