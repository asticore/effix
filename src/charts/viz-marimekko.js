/* viz-marimekko — mosaic: column width ∝ column total, segment height ∝ share of the column.
   <div class="efx-viz-marimekko" data-efx-labels="Asia|EU|US" data-efx-data='[{"name":"A","data":[40,20,30]},{"name":"B","data":[10,25,5]}]'></div> */
import { COMMON, chart, s, esc } from './_lib.js';

export default {
  name: 'viz-marimekko',
  selector: '.efx-viz-marimekko',
  lazy: true,
  defaults: { ...COMMON, gap: 2, inside: 'percent', height: 320 },
  init(el, o) {
    return chart(el, o, ({ g, w, h, data, visible, colors, fmt, deco }) => {
      const n = data.labels.length;
      const tot = data.labels.map((_, i) => visible.reduce((a, sr) => a + Math.max(0, sr.values[i] || 0), 0));
      const all = tot.reduce((a, b) => a + b, 0);
      if (!n || !all) return [];
      const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : { t: 8, r: 4, b: 40, l: 36 };
      const pw = w - pad.l - pad.r - o.gap * (n - 1), ph = h - pad.t - pad.b, pct = v => (v / all * 100).toFixed(1).replace(/\.0$/, '') + '%';
      const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
      if (!deco) [0, 25, 50, 75, 100].forEach(t => { s('text', { x: pad.l - 6, y: pad.t + ph * (1 - t / 100), 'text-anchor': 'end', 'dominant-baseline': 'middle' }, ax).textContent = t + '%'; });
      const marks = [], txt = s('g', { 'pointer-events': 'none' }, g);
      let x = pad.l;
      data.labels.forEach((label, i) => {
        if (!tot[i]) return;
        const cw = tot[i] / all * pw;
        let y = pad.t + ph;
        if (!deco) {
          const c = x + cw / 2, ch = Math.floor(cw / 6.2);
          if (ch >= 3) {
            s('text', { x: c, y: h - pad.b + 16, 'text-anchor': 'middle', style: 'font-weight:600' }, ax).textContent = label.length > ch ? label.slice(0, ch - 1) + '…' : label;
            if (cw > 44) s('text', { x: c, y: h - pad.b + 30, 'text-anchor': 'middle' }, ax).textContent = fmt(tot[i]);
          }
        }
        visible.forEach(sr => {
          const v = Math.max(0, sr.values[i] || 0);
          if (!v) return;
          const sh = v / tot[i] * ph;
          y -= sh;
          const node = s('rect', { x, y: y + 0, width: cw, height: sh, fill: colors[sr.index], class: 'efx-chart__mark efx-chart__grow', style: `--i:${i};stroke:var(--sh-surface,#fff);stroke-width:1.5` }, g);
          if (!deco && o.inside !== 'none' && cw > 34 && sh > 16) {
            const big = cw > 70 && sh > 34, t = s('text', { x: x + cw / 2, y: y + sh / 2 + (big ? -6 : 0), 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: 'efx-chart__fade', style: `--i:${i};fill:#fff;stroke:rgb(0 0 0/.3);stroke-width:2.5px;paint-order:stroke;font-weight:600;font-size:11px` }, txt);
            t.textContent = o.inside === 'value' ? fmt(v) : (v / tot[i] * 100).toFixed(0) + '%';
            if (big) s('text', { x: x + cw / 2, y: y + sh / 2 + 8, 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: 'efx-chart__fade', style: `--i:${i};fill:#fff;stroke:rgb(0 0 0/.3);stroke-width:2.5px;paint-order:stroke;font-size:10px` }, txt).textContent = cw / 6 > sr.name.length ? sr.name : sr.name.slice(0, Math.floor(cw / 6) - 1) + '…';
          }
          const cy = y, sy = x, sw = cw, shh = sh;
          marks.push({ x: x + cw / 2, y: y + sh / 2, label, series: sr.name, value: v, node, index: i, group: sr.index,
            html: `<strong>${esc(label)}</strong><span>${esc(sr.name)}</span><b>${esc(fmt(v))}</b><span>${(v / tot[i] * 100).toFixed(1)}% of ${esc(label)} · ${pct(v)} of total</span>`,
            hit: (px, py) => px >= sy && px <= sy + sw && py >= cy && py <= cy + shh });
        });
        x += cw + o.gap;
      });
      g.appendChild(txt);
      return marks;
    });
  },
};
