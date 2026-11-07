/* chart-pyramid — layered pyramid (tiers top → bottom), optionally inverted, optional side notes.
   <div class="efx-chart-pyramid" data-efx-labels="Vision|Strategy|Tactics|Tasks" data-efx-notes="Why we exist|Where we play|How we win|What we do"></div>
   With data-efx-data="1,3,6,12" the tier heights follow the values. */
import { COMMON, chart, palette, s, esc } from './_lib.js';

const wrap = (t, n) => { const out = []; let l = ''; String(t).split(/\s+/).forEach(wd => { if (l && (l + ' ' + wd).length > n) { out.push(l); l = wd; } else l = l ? l + ' ' + wd : wd; }); if (l) out.push(l); return out.slice(0, 3); };

export default {
  name: 'chart-pyramid',
  selector: '.efx-chart-pyramid',
  lazy: true,
  defaults: { ...COMMON, height: 320, inverted: false, equal: false, notes: [], gap: 3 },
  init(el, o) {
    const draw = ({ g, w, h, data, hidden, fmt, deco }) => {
      const idx = data.labels.map((_, i) => i).filter(i => !hidden.has(i)), n = idx.length;
      if (!n) return [];
      const vals = (data.series[0] && data.series[0].values) || [];
      const has = !o.equal && idx.some(i => vals[i] > 0);
      const pal = palette(el, o, data.labels.length), inv = o.inverted, gp = deco ? 0 : o.gap;
      const pad = deco ? 0 : 6, nw = o.notes.length && !deco ? Math.min(230, (w - 12) * 0.38) : 0;
      const tw = w - 2 * pad - (nw ? nw + 14 : 0), H = h - 2 * pad, cx = pad + tw / 2;
      const mean = has ? idx.reduce((a, i) => a + Math.max(0, vals[i] || 0), 0) / n : 1;
      const wt = idx.map(i => (has ? Math.max(0, vals[i] || 0) + mean * 0.35 : 1)), sum = wt.reduce((a, b) => a + b);
      const av = Math.max(n, H - gp * (n - 1));
      const hw = y => ((inv ? 1 - (y - pad) / H : (y - pad) / H) * tw) / 2; // half width at y
      let y = pad;
      const marks = [];
      idx.forEach((i, k) => {
        const bh = (wt[k] / sum) * av, y0 = y, y1 = y + bh, ym = (y0 + y1) / 2;
        y = y1 + gp;
        const a = Math.max(0, hw(y0)), b = Math.max(0, hw(y1));
        const node = s('polygon', { points: `${cx - a},${y0} ${cx + a},${y0} ${cx + b},${y1} ${cx - b},${y1}`, fill: pal[i], class: 'efx-chart__mark efx-pyr__b', style: `--i:${inv ? n - 1 - k : k}` }, g);
        const note = o.notes[k];
        if (!deco) {
          const label = data.labels[i], val = has ? fmt(vals[i] || 0) : '', mid = hw(ym) * 2, fit = mid >= label.length * 6.8 + 14;
          const two = val && fit && bh >= 38 && mid >= val.length * 6.4 + 14;
          const t = (x, yy, cls, str, anchor) => { const e = s('text', { x, y: yy, 'text-anchor': anchor || 'middle', 'dominant-baseline': 'middle', class: cls + ' efx-chart__fade', style: `--i:${(inv ? n - 1 - k : k) * 2 + 2}` }, g); e.textContent = str; };
          if (fit) { t(cx, ym - (two ? 7 : 0), 'efx-pyr__t', label); if (two) t(cx, ym + 8, 'efx-pyr__t efx-pyr__t2', val); }
          else t(cx + Math.max(a, b) + 8, ym, 'efx-pyr__o', label + (val ? ' · ' + val : ''), 'start');
          if (note) {
            const nx = pad + tw + 14, ex = cx + Math.max(hw(ym), 0) + (fit ? 4 : 0);
            if (fit) s('line', { x1: ex, x2: nx - 6, y1: ym, y2: ym, class: 'efx-chart__grid efx-chart__fade', style: `--i:${k}` }, g);
            const lines = wrap(note, Math.max(8, Math.floor(nw / 6.4))), e = s('text', { x: nx, y: ym - ((lines.length - 1) * 7), class: 'efx-pyr__n efx-chart__fade', style: `--i:${k * 2 + 2}` }, g);
            lines.forEach((l, q) => { const sp = s('tspan', { x: nx, dy: q ? 14 : 0, 'dominant-baseline': 'middle' }, e); sp.textContent = l; });
          }
        }
        marks.push({
          x: cx, y: ym, label: data.labels[i], value: has ? vals[i] || 0 : k + 1, valueText: has ? fmt(vals[i] || 0) : `Tier ${k + 1} of ${n}`, node, index: i,
          hit: (px, py) => py >= y0 - gp / 2 && py <= y1 + gp / 2,
          html: `<strong>${esc(data.labels[i])}</strong>` + (note ? `<span>${esc(note)}</span>` : '') + `<b>${esc(has ? fmt(vals[i] || 0) : `Tier ${k + 1} of ${n}`)}</b>`,
        });
      });
      return marks;
    };
    draw.legendByLabel = true;
    draw.radius = 0.001;
    return chart(el, o, draw);
  },
};
