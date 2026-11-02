/* chart-spark — sparkline for inline use (text, badges, buttons, stat cards) or as a card background.
   Revenue <span class="efx-chart-spark" data-efx-data="3,5,4,8,6,9"></span> */
import { COMMON, chart, linear, linePath, palette, s } from './_lib.js';

let uid = 0;
export default {
  name: 'chart-spark',
  selector: '.efx-chart-spark',
  lazy: true,
  defaults: { ...COMMON, height: 0, legend: false, area: true, type: 'line', last: true, smooth: true },
  init(el, o) {
    const cs = getComputedStyle(el), keep = [el.style.display, el.style.width, el.style.verticalAlign];
    const inl = (cs.display.startsWith('inline') || /^inline/.test(getComputedStyle(el.parentElement || el).display)) && !o.background;
    if (inl) { // inline: ~6em wide, 1.2em tall, sits on the text baseline
      if (cs.display === 'inline') el.style.display = 'inline-block';
      if (!el.style.width && el.clientWidth < 8) el.style.width = '6em';
      el.style.verticalAlign = '-.25em';
      if (!o.height) o.height = Math.round(parseFloat(cs.fontSize) * 12) / 10;
    } else if (!o.height && !el.clientHeight) o.height = 40;
    const draw = ({ g, w, h, data, visible, colors, fmt, deco }) => {
      const sr = visible[0], v = sr ? sr.values : [], n = v.length;
      if (!n) return [];
      const c = colors[sr.index], T = o.type, lo = Math.min(...v), hi = Math.max(...v), pal = palette(el, o, 7);
      const px = deco ? 0 : 3, py = deco ? 4 : 3, slot = (w - 2 * px) / n, step = Math.min(1, 12 / n);
      const x = i => n > 1 ? px + i * (w - 2 * px) / (n - 1) : w / 2;
      const mk = (i, node, mx, my) => ({ x: mx, y: my, label: data.labels[i], value: v[i], series: '', node, index: i, xOnly: true });
      if (T === 'line') {
        const y = linear(lo === hi ? [lo - 1, hi + 1] : [lo, hi], [h - py, py]);
        const pts = v.map((a, i) => [x(i), y(a)]), d = linePath(pts, o.smooth);
        if (o.area) {
          const id = 'efx-sg' + ++uid, lg = s('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, s('defs', {}, g));
          s('stop', { offset: 0, 'stop-color': c, 'stop-opacity': .35 }, lg);
          s('stop', { offset: 1, 'stop-color': c, 'stop-opacity': 0 }, lg);
          s('path', { d: `${d}L${x(n - 1)},${h}L${x(0)},${h}Z`, fill: `url(#${id})`, class: 'efx-chart__fade' }, g);
        }
        s('path', { d, pathLength: 1, fill: 'none', stroke: c, 'stroke-width': 1.75, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'efx-chart__draw' }, g);
        if (o.last) s('circle', { cx: x(n - 1), cy: y(v[n - 1]), r: 2.5, fill: c, class: 'efx-chart__fade', style: '--i:12' }, g);
        if (deco) return [];
        return pts.map((p, i) => mk(i, s('circle', { cx: p[0], cy: p[1], r: 3.5, fill: c, class: 'efx-chart__mark efx-chart-spark__pt' }, g), p[0], p[1]));
      }
      const wl = T === 'win-loss', y = linear([Math.min(0, lo), Math.max(0, hi) || 1], [h - py, py]), base = wl ? h / 2 : y(0);
      return v.map((a, i) => {
        const top = wl ? (a > 0 ? py : base + 1) : Math.min(y(a), base), ht = wl ? (a ? (h - 2 * py) / 2 - 1 : 1) : Math.max(1, Math.abs(y(a) - base));
        const node = s('rect', { x: px + i * slot + slot * .15, y: wl && !a ? base - .5 : top, width: Math.max(1, slot * .7), height: ht, rx: Math.min(2, slot * .35), fill: wl ? (a >= 0 ? (o.colors.length ? pal[0] : pal[2]) : (o.colors.length > 1 ? pal[1] : pal[5])) : c, class: 'efx-chart__mark efx-chart__grow', style: `--i:${i * step}` }, g);
        return mk(i, node, px + (i + .5) * slot, top);
      });
    };
    draw.radius = Infinity;
    const stop = chart(el, o, draw);
    return () => { stop(); if (inl) [el.style.display, el.style.width, el.style.verticalAlign] = keep; };
  },
};
