/* chart-treemap — squarified treemap (Bruls et al., as d3.treemapSquarify) of labels/values.
   <div class="efx-chart-treemap" data-efx-data="40,25,15,10,6,4" data-efx-labels="A|B|C|D|E|F"></div> */
import { COMMON, chart, palette, s, esc } from './_lib.js';

const PHI = (1 + Math.sqrt(5)) / 2;

export default {
  name: 'chart-treemap',
  selector: '.efx-chart-treemap',
  lazy: true,
  defaults: { ...COMMON, gap: 2, radius: 4, captions: true, sort: true },
  init(el, o) {
    const draw = ({ g, w, h, data, fmt, deco }) => {
      const sr = data.series[0];
      const items = sr ? data.labels.map((l, i) => ({ l, i, v: sr.values[i] || 0 })).filter(d => d.v > 0) : [];
      if (!items.length) return [];
      if (o.sort) items.sort((a, b) => b.v - a.v);
      const n = items.length, tot = items.reduce((a, d) => a + d.v, 0);
      const pal = palette(el, o, data.labels.length), ramp = o.colors.length === 1;
      const fresh = !g.classList.contains('is-in');
      let x0 = 0, y0 = 0, val = tot, i0 = 0;
      const rects = [];
      while (i0 < n) {
        const dx = w - x0, dy = h - y0;
        let i1 = i0, sum = items[i1++].v, min = sum, max = sum;
        const k = Math.max(dy / dx, dx / dy) / (val * PHI);
        let beta = sum * sum * k, best = Math.max(max / beta, beta / min);
        for (; i1 < n; i1++) {
          const v = items[i1].v;
          sum += v; min = Math.min(min, v); max = Math.max(max, v);
          beta = sum * sum * k;
          const r = Math.max(max / beta, beta / min);
          if (r > best) { sum -= v; break; }
          best = r;
        }
        if (dx < dy) { // row across the top
          const yy = y0 + dy * sum / val; let x = x0;
          for (let j = i0; j < i1; j++) { rects[j] = [x, y0, x += items[j].v * dx / sum, yy]; }
          y0 = yy;
        } else { // column down the left
          const xx = x0 + dx * sum / val; let y = y0;
          for (let j = i0; j < i1; j++) { rects[j] = [x0, y, xx, y += items[j].v * dy / sum]; }
          x0 = xx;
        }
        val -= sum; i0 = i1;
      }
      return items.map((d, j) => {
        const q = o.gap / 2, [a, b, c, e] = rects[j];
        const x = a + q, y = b + q, tw = Math.max(0, c - a - o.gap), th = Math.max(0, e - b - o.gap);
        const pct = ramp ? 100 - 55 * items.filter(z => z.v > d.v).length / Math.max(1, n - 1) : 100;
        const fill = ramp ? `color-mix(in oklab, ${pal[0]} ${pct}%, var(--sh-surface, #fff))` : pal[d.i];
        const node = s('rect', { x, y, width: tw, height: th, rx: Math.min(o.radius, tw / 2, th / 2), fill, class: 'efx-chart__mark' + (fresh ? ' efx-tm' : ''), style: `--i:${j}` }, g);
        if (o.captions && !deco && tw >= 44 && th >= 26) {
          const st = `pointer-events:none;fill:${pct < 70 ? 'var(--sh-text,#0f172a)' : '#fff'}`;
          const t = s('text', { x: x + 7, y: y + 17, class: 'efx-chart__value' + (fresh ? ' efx-tm' : ''), style: `${st};--i:${j}` }, g);
          t.textContent = d.l.length * 6.6 > tw - 12 ? d.l.slice(0, Math.max(1, Math.floor((tw - 12) / 6.6) - 1)) + '…' : d.l;
          if (th >= 44) {
            const u = s('text', { x: x + 7, y: y + 33, class: fresh ? 'efx-tm' : '', style: `${st};opacity:.85;--i:${j}` }, g);
            u.textContent = fmt(d.v);
          }
        }
        return { x: x + tw / 2, y: y + th / 2, label: d.l, value: d.v, series: '', node, index: d.i,
          html: `<strong>${esc(d.l)}</strong><b>${esc(fmt(d.v))}</b><span>${(d.v / tot * 100).toFixed(1)}%</span>`,
          hit: (px, py) => px >= x && px <= x + tw && py >= y && py <= y + th };
      });
    };
    draw.radius = 1;
    return chart(el, o, draw);
  },
};
