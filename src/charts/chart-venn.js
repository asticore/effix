/* chart-venn — area-proportional Venn diagram for 2 or 3 sets.
   <div class="efx-chart-venn" data-efx-data='[{"sets":["Design"],"size":12},{"sets":["Dev"],"size":10},{"sets":["Design","Dev"],"size":4}]'></div>
   A one-set entry is that set's total size; a multi-set entry is the size of the overlap. */
import { COMMON, chart, palette, s } from './_lib.js';
import { on } from '../core.js';

let uid = 0;
const norm = d => (Array.isArray(d) ? d : (d && d.items) || []).filter(q => q && typeof q === 'object').map(q => ({
  sets: [...new Set((Array.isArray(q.sets) ? q.sets : String(q.sets == null ? '' : q.sets).split(/[&,|]/)).map(v => String(v).trim()).filter(Boolean))].slice(0, 3),
  size: +q.size,
})).filter(q => q.sets.length && q.size > 0);
// area of the lens where circles (radii a, b) at distance d overlap
const lens = (a, b, d) => {
  if (d >= a + b) return 0;
  if (d <= Math.abs(a - b)) return Math.PI * Math.min(a, b) ** 2;
  return a * a * Math.acos((d * d + a * a - b * b) / (2 * d * a)) + b * b * Math.acos((d * d + b * b - a * a) / (2 * d * b)) -
    0.5 * Math.sqrt((-d + a + b) * (d + a - b) * (d - a + b) * (d + a + b));
};
const gap = (a, b, area) => { let lo = Math.abs(a - b), hi = a + b; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (lens(a, b, m) > area) lo = m; else hi = m; } return (lo + hi) / 2; };

export default {
  name: 'chart-venn',
  selector: '.efx-chart-venn',
  lazy: true,
  defaults: { ...COMMON, height: 300, legend: false, opacity: 0.4 },
  init(el, o) {
    const read = d => { try { return norm(d); } catch (e) { return []; } };
    const j = el.querySelector(':scope > script[type="application/json"]');
    let items = [];
    try { items = read(JSON.parse((o.data || '').trim() || (j ? j.textContent : '[]'))); } catch (e) { console.warn('[effix] chart data', e); }
    const jt = j && j.getAttribute('type');
    if (j) j.setAttribute('type', 'application/x-efx-json');
    o.source = '';
    o.data = '[]';
    const off = on(el, 'efx:data', e => { items = read(e.detail); });
    const draw = ({ g, w, h, fmt, deco }) => {
      const names = [];
      items.filter(q => q.sets.length === 1).forEach(q => names.includes(q.sets[0]) || names.push(q.sets[0]));
      items.forEach(q => q.sets.forEach(n => names.includes(n) || names.push(n)));
      names.splice(3);
      const sizeOf = ids => { const key = ids.map(i => names[i]).sort().join('\0'); const q = items.find(t => t.sets.slice().sort().join('\0') === key); return q ? q.size : 0; };
      const tot = names.map((n, i) => sizeOf([i]) || Math.max(...items.filter(q => q.sets.includes(n)).map(q => q.size)));
      if (!names.length) return [];
      const R = tot.map(v => Math.sqrt(v / Math.PI));
      const D = (a, b) => { const ov = Math.min(sizeOf([a, b]), tot[a], tot[b]); return ov > 0 ? gap(R[a], R[b], ov) : R[a] + R[b] + R[a] * 0.08; };
      const C = [[0, 0]];
      if (names.length > 1) C.push([D(0, 1), 0]);
      if (names.length > 2) {
        const ab = C[1][0], ac = D(0, 2), bc = D(1, 2), px = (ac * ac - bc * bc + ab * ab) / (2 * ab);
        C.push([px, -Math.sqrt(Math.max(0, ac * ac - px * px))]);
      }
      const x0 = Math.min(...C.map((c, i) => c[0] - R[i])), x1 = Math.max(...C.map((c, i) => c[0] + R[i]));
      const y0 = Math.min(...C.map((c, i) => c[1] - R[i])), y1 = Math.max(...C.map((c, i) => c[1] + R[i]));
      const pd = deco ? 6 : 14, k = Math.min((w - 2 * pd) / (x1 - x0), (h - 2 * pd) / (y1 - y0));
      const ox = (w - k * (x0 + x1)) / 2, oy = (h - k * (y0 + y1)) / 2;
      const c = C.map((p, i) => ({ x: ox + k * p[0], y: oy + k * p[1], r: k * R[i] }));
      const pal = palette(el, o, 3);
      const inside = (ids, px, py) => ids.every(i => Math.hypot(px - c[i].x, py - c[i].y) <= c[i].r);
      const regions = names.map((n, i) => ({ ids: [i], size: tot[i], name: n }));
      [[0, 1], [0, 2], [1, 2], [0, 1, 2]].forEach(ids => {
        if (ids.every(i => i < names.length) && sizeOf(ids) > 0) regions.push({ ids, size: sizeOf(ids), name: ids.map(i => names[i]).join(' ∩ ') });
      });
      const id = 'efx-v' + ++uid;
      // circles
      c.forEach((q, i) => {
        regions[i].node = s('circle', { cx: q.x, cy: q.y, r: q.r, fill: pal[i], 'fill-opacity': o.opacity, stroke: pal[i], 'stroke-width': 1.5, class: 'efx-chart__mark efx-venn__c efx-chart__fade', style: `--i:${i * 2}` }, g);
      });
      // intersection highlights: circle a clipped to b (and c)
      regions.slice(names.length).forEach((r, m) => {
        const [a, b, d] = r.ids, cp = (n, t) => { const p = s('clipPath', { id: `${id}-${m}-${n}` }, g); s('circle', { cx: c[t].x, cy: c[t].y, r: c[t].r }, p); return `url(#${id}-${m}-${n})`; };
        const host = d == null ? g : s('g', { 'clip-path': cp(1, d) }, g);
        r.node = s('circle', { cx: c[a].x, cy: c[a].y, r: c[a].r, 'clip-path': cp(0, b), class: 'efx-chart__mark efx-venn__x' }, host);
      });
      if (!deco) {
        const txt = (x, y, cls, str, i, dy) => { const t = s('text', { x, y: y + (dy || 0), 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: cls + ' efx-chart__fade', style: `--i:${i}` }, g); t.textContent = str; };
        c.forEach((q, i) => {
          const oth = c.filter((_, j) => j !== i), mx = oth.reduce((a, p) => a + p.x, 0) / (oth.length || 1), my = oth.reduce((a, p) => a + p.y, 0) / (oth.length || 1);
          const dx = q.x - mx, dy = q.y - my, l = oth.length ? Math.hypot(dx, dy) || 1 : 1, sh = oth.length ? q.r * (names.length > 2 ? 0.5 : 0.42) : 0;
          const lx = q.x + (oth.length ? dx / l : 0) * sh, ly = q.y + (oth.length ? dy / l : 0) * sh;
          txt(lx, ly, 'efx-chart__value', names[i], i + 3, -7);
          txt(lx, ly, 'efx-venn__n', fmt(tot[i]), i + 3, 9);
        });
        regions.slice(names.length).forEach((r, m) => {
          let px, py;
          if (r.ids.length === 3) { px = (c[0].x + c[1].x + c[2].x) / 3; py = (c[0].y + c[1].y + c[2].y) / 3; }
          else {
            const [a, b] = r.ids, d = Math.hypot(c[b].x - c[a].x, c[b].y - c[a].y) || 1, ux = (c[b].x - c[a].x) / d, uy = (c[b].y - c[a].y) / d;
            const t = d <= Math.abs(c[a].r - c[b].r) ? (c[a].r < c[b].r ? 0 : d) : (d - c[b].r + c[a].r) / 2;
            px = c[a].x + ux * t; py = c[a].y + uy * t;
            const third = names.length > 2 && sizeOf([0, 1, 2]) > 0 ? c[3 - a - b] : null;
            if (third) { const ex = px - third.x, ey = py - third.y, el2 = Math.hypot(ex, ey) || 1, wd = Math.max(0, Math.min(c[a].r + c[b].r - d, 2 * Math.min(c[a].r, c[b].r))); px += (ex / el2) * wd * 0.5; py += (ey / el2) * wd * 0.5; }
          }
          txt(px, py, 'efx-chart__value efx-venn__i', fmt(r.size), names.length + 3 + m);
        });
      }
      return regions.map((r, i) => ({
        x: r.ids.reduce((a, t) => a + c[t].x, 0) / r.ids.length, y: r.ids.reduce((a, t) => a + c[t].y, 0) / r.ids.length,
        label: r.name, value: r.size, node: r.node, index: i,
        hit: (px, py) => inside(r.ids, px, py) && !regions.some(q => q.ids.length > r.ids.length && q.ids.every(t => r.ids.includes(t)) && inside(q.ids, px, py)),
      }));
    };
    draw.radius = 0.001; // only the exact region under the pointer counts
    const stop = chart(el, o, draw);
    return () => { off(); stop(); if (j) { if (jt == null) j.removeAttribute('type'); else j.setAttribute('type', jt); } };
  },
};
