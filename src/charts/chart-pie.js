/* chart-pie — pie & donut (semicircle with data-efx-half).
   <div class="efx-chart-pie" data-efx-data="40,30,20,10" data-efx-labels="A|B|C|D"></div> */
import { COMMON, chart, palette, s, esc, arcPath, polar } from './_lib.js';

const TAU = Math.PI * 2;
const pc = x => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10) + '%';

export default {
  name: 'chart-pie',
  selector: '.efx-chart-pie',
  lazy: true,
  defaults: { ...COMMON, height: 300, donut: 0.6, pad: 0.01, sort: false, center: '', show: 'auto', half: false },
  init(el, o) {
    let center = () => {};
    const draw = ({ g, w, h, data, hidden, fmt, deco }) => {
      const vals = data.series[0] ? data.series[0].values : [];
      let idx = data.labels.map((_, i) => i).filter(i => !hidden.has(i) && vals[i] > 0);
      if (o.sort) idx.sort((a, b) => vals[b] - vals[a]);
      const total = idx.reduce((a, i) => a + vals[i], 0);
      if (!total) return [];
      const pal = palette(el, o, data.labels.length), half = o.half;
      const auto = !deco && o.show === 'auto', inner = !deco && o.show === 'percent';
      const rv = half ? h - 22 : h / 2 - 20;
      let R = Math.min(rv, w / 2 - (auto ? 78 : 8)), lab = auto;
      if (R < 40) { R = Math.max(10, Math.min(rv, w / 2 - 8)); lab = false; }
      if (deco) R = Math.min(half ? h : h / 2, w / 2);
      const r0 = R * Math.min(0.95, Math.max(0, o.donut)), cx = w / 2, cy = half ? (deco ? h : h - 6) : h / 2;
      const span = half ? Math.PI : TAU, start = half ? -Math.PI / 2 : 0;
      const gap = Math.min(o.pad, span / idx.length / 2);
      let acc = start;
      const marks = [], arcs = [], labs = [];
      idx.forEach((i, k) => {
        const a0 = acc, a1 = acc + (vals[i] / total) * span, m = (a0 + a1) / 2;
        acc = a1;
        const d = idx.length > 1 ? gap / 2 : 0;
        const [dx, dy] = polar(0, 0, 7, m);
        const node = s('path', { d: arcPath(cx, cy, r0, R, a0 + d, a1 - d), fill: pal[i], class: 'efx-chart__mark efx-pie-arc', style: `--i:${k};--dx:${dx}px;--dy:${dy}px;transform-origin:${cx}px ${cy}px` }, g);
        arcs.push({ node, i });
        const [mx, my] = polar(cx, cy, (r0 + R) / 2, m), pct = (vals[i] / total) * 100;
        marks.push({
          x: mx, y: my, label: data.labels[i], value: vals[i], node, index: i, group: k,
          html: `<strong>${esc(data.labels[i])}</strong><b>${esc(fmt(vals[i]))}</b><span>${pc(pct)}</span>`,
          hit: (px, py) => {
            const r = Math.hypot(px - cx, py - cy);
            if (r < r0 - 2 || r > R + 8) return false;
            const an = (((Math.atan2(px - cx, cy - py) - start) % TAU) + TAU) % TAU + start;
            return an >= a0 && an <= a1;
          },
        });
        if (inner && (a1 - a0) * (r0 + R) / 2 >= 28 && R - r0 > 14) {
          const t = s('text', { x: mx, y: my, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'efx-pie-t efx-chart__fade', style: `--i:${k}` }, g);
          t.textContent = pc(pct);
        }
        if (lab) labs.push({ m, sd: Math.sin(m) >= 0 ? 1 : -1, t: `${data.labels[i]}  ${pc(pct)}`, k });
      });
      // outside labels with leader lines, nudged apart per side
      [-1, 1].forEach(sd => {
        const L = labs.filter(l => l.sd === sd).map(l => ({ ...l, y: polar(cx, cy, R + 14, l.m)[1] })).sort((a, b) => a.y - b.y);
        L.forEach((l, j) => { if (j) l.y = Math.max(l.y, L[j - 1].y + 15); });
        for (let j = L.length - 1; j >= 0; j--) { if (j < L.length - 1 && L[j].y > L[j + 1].y - 15) L[j].y = L[j + 1].y - 15; }
        L.forEach(l => {
          const [x1, y1] = polar(cx, cy, R + 2, l.m), [x2, y2] = polar(cx, cy, R + 12, l.m), xl = cx + sd * (R + 22);
          s('path', { d: `M${x1},${y1}L${x2},${y2}L${xl},${l.y}`, class: 'efx-pie-l efx-chart__fade', style: `--i:${l.k}` }, g);
          const mc = Math.floor((w / 2 - R - 30) / 6.2), t = s('text', { x: xl + sd * 4, y: l.y, 'text-anchor': sd > 0 ? 'start' : 'end', 'dominant-baseline': 'central', class: 'efx-chart__value efx-pie-lt efx-chart__fade', style: `--i:${l.k}` }, g);
          t.textContent = l.t.length > mc ? l.t.slice(0, Math.max(3, mc - 1)) + '…' : l.t;
        });
      });
      // donut hole: total (or custom text); shows hovered slice instead
      if (!deco && r0 >= 28) {
        const tot = fmt(total), custom = o.center.replace('{total}', tot);
        const fs = Math.max(12, Math.min(28, r0 * 0.42)), cyy = half ? cy - r0 * 0.3 : cy;
        const big = s('text', { x: cx, y: cyy - (custom ? 0 : 6), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'efx-chart__value efx-pie-c' }, g);
        const cap = s('text', { x: cx, y: cyy + fs * 0.7, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'efx-pie-s' }, g);
        const set = a => {
          const v = a ? fmt(vals[a.i]) : custom || tot, c = a ? data.labels[a.i] : custom ? '' : 'Total';
          const f = Math.min(fs, (r0 * 1.7) / (Math.max(v.length, c.length * 0.6) * 0.58));
          big.style.fontSize = f + 'px'; big.textContent = v; cap.textContent = c;
          big.setAttribute('y', cyy - (c ? f * 0.35 : 0)); cap.setAttribute('y', cyy + f * 0.6);
        };
        set();
        center = m => set(m ? arcs.find(a => a.node === m.node) : undefined);
      }
      return marks;
    };
    draw.legendByLabel = true;
    draw.onShow = m => center(m); // donut centre shows the hovered slice
    draw.radius = 1;
    const off = chart(el, o, draw);
    return off;
  },
};
