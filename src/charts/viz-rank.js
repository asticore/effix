/* viz-rank — bump chart (rank over periods) or slope chart (two periods).
   <div class="efx-viz-rank" data-efx-mode="bump" data-efx-labels="2022|2023|2024" data-efx-data='[{"name":"A","data":[10,30,50]},{"name":"B","data":[20,25,30]}]'></div> */
import { COMMON, chart, linear, nice, s, esc } from './_lib.js';

const dseg = (px, py, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
};
const cut = (t, m) => (t.length > m ? t.slice(0, Math.max(1, m - 1)) + '…' : t);
/** Push label positions apart (min gap) while keeping order, within [lo, hi]. */
const spread = (ys, gap, lo, hi) => {
  const ord = ys.map((_, i) => i).sort((a, b) => ys[a] - ys[b]), out = ys.slice();
  ord.forEach((k, i) => { if (i) out[k] = Math.max(out[k], out[ord[i - 1]] + gap); });
  for (let i = ord.length - 1; i >= 0; i--) { const k = ord[i], lim = i < ord.length - 1 ? out[ord[i + 1]] - gap : hi; if (out[k] > lim) out[k] = lim; }
  if (out[ord[0]] < lo) { const d = lo - out[ord[0]]; ord.forEach(k => { out[k] += d; }); }
  return out;
};

export default {
  name: 'viz-rank',
  selector: '.efx-viz-rank',
  lazy: true,
  defaults: { ...COMMON, mode: 'bump', ranks: false, smooth: true, legend: false, height: 0 },
  init(el, o) {
    const draw = ({ g, w, h, data, visible, colors, fmt, deco }) => {
      const slope = o.mode === 'slope', P = data.labels, items = visible, m = items.length;
      if (P.length < (slope ? 2 : 1) || !m) return [];
      const ps = slope ? [0, P.length - 1] : P.map((_, i) => i), n = ps.length;
      const rank = ps.map(p => {
        if (o.ranks) return items.map(it => it.values[p]);
        const ord = items.map((_, k) => k).sort((a, b) => items[b].values[p] - items[a].values[p] || a - b), r = [];
        ord.forEach((k, i) => { r[k] = i + 1; });
        return r;
      });
      const val = (k, j) => (slope && !o.ranks ? items[k].values[ps[j]] : rank[j][k]);
      const all = items.flatMap((_, k) => ps.map((_, j) => val(k, j)));
      const sc = slope ? nice(Math.min(...all), Math.max(...all), 4) : { min: Math.min(...all), max: Math.max(...all) };
      const txt = items.map((it, k) => slope ? [it.name + ' ' + fmt(it.values[ps[0]]), fmt(it.values[ps[1]]) + ' ' + it.name] : [it.name, it.name]);
      const lw = deco ? 0 : Math.min(w * 0.3, Math.max(...txt.flat().map(t => t.length)) * 6.4 + 16);
      const pad = deco ? { t: 8, r: 8, b: 8, l: 8 } : { t: 30, r: lw, b: 14, l: lw };
      const X = j => (n > 1 ? pad.l + j * (w - pad.l - pad.r) / (n - 1) : w / 2);
      const flip = slope ? !o.ranks : false;
      const top = deco ? pad.t : pad.t + 6, bot = h - pad.b - 6;
      const Y = sc.max === sc.min ? () => (top + bot) / 2 : linear(flip ? [sc.min, sc.max] : [sc.min, sc.max], flip ? [bot, top] : [top, bot]);
      const mc = Math.max(4, Math.floor(lw / 6.4) - 2);
      if (!deco) {
        const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
        ps.forEach((p, j) => {
          s('line', { x1: X(j), x2: X(j), y1: pad.t - 6, y2: h - pad.b, class: 'efx-chart__grid' }, ax);
          s('text', { x: X(j), y: 12, 'text-anchor': slope ? (j ? 'end' : 'start') : 'middle', style: 'font-weight:600' }, ax).textContent = P[p];
        });
      }
      const ly = slope && !deco ? [0, 1].map(j => spread(items.map((_, k) => Y(val(k, j))), 14, top, bot)) : null;
      return items.map((it, k) => {
        const pts = ps.map((_, j) => [X(j), Y(val(k, j))]);
        const f = s('g', { class: 'efx-chart__mark efx-vr__item' }, g);
        const d = pts.reduce((a, [x, y], i) => a + (i ? (o.smooth ? `C${(pts[i - 1][0] + x) / 2},${pts[i - 1][1]} ${(pts[i - 1][0] + x) / 2},${y} ${x},${y}` : `L${x},${y}`) : `M${x},${y}`), '');
        s('path', { d, fill: 'none', stroke: colors[it.index], 'stroke-width': 3, 'stroke-linecap': 'round', pathLength: 1, class: 'efx-chart__draw', style: `--i:${k}` }, f);
        const fd = s('g', { class: 'efx-chart__fade', style: `--i:${k}` }, f);
        pts.forEach(p => s('circle', { cx: p[0], cy: p[1], r: deco ? 3 : 4.5, fill: colors[it.index], style: 'stroke:var(--sh-surface,#fff);stroke-width:2' }, fd));
        if (!deco) [0, n - 1].forEach((j, e) => {
          if (n < 2 && e) return;
          s('text', { x: X(j) + (e ? 10 : -10), y: ly ? ly[e][k] : pts[j][1], 'text-anchor': e ? 'start' : 'end', 'dominant-baseline': 'middle', class: 'efx-chart__value' }, fd).textContent = cut(txt[k][e], mc);
        });
        const dl = slope ? it.values[ps[1]] - it.values[ps[0]] : 0;
        return {
          x: pts[n - 1][0], y: pts[n - 1][1], label: it.name, value: it.values[ps[n - 1]], node: f, index: it.index, series: '',
          html: `<strong>${esc(it.name)}</strong>` + (slope
            ? `<span>${esc(P[ps[0]])} <b>${esc(fmt(it.values[ps[0]]))}</b> → ${esc(P[ps[1]])} <b>${esc(fmt(it.values[ps[1]]))}</b></span>` + (o.ranks ? '' : `<span>${dl >= 0 ? '+' : ''}${esc(fmt(dl))}</span>`)
            : ps.map((p, j) => `<span>${esc(P[p])} <b>#${rank[j][k]}${o.ranks ? '' : ' · ' + esc(fmt(it.values[p]))}</b></span>`).join('')),
          hit: (px, py) => n > 1 ? pts.slice(1).some((q, i) => dseg(px, py, pts[i], q) < 8) : Math.hypot(px - pts[0][0], py - pts[0][1]) < 10,
        };
      });
    };
    draw.height = () => o.height || (o.mode === 'slope' ? 320 : 300);
    return chart(el, o, draw);
  },
};
