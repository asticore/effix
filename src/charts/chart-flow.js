/* chart-flow — lightweight Sankey for funnels and journeys.
   <div class="efx-chart-flow" data-efx-data='{"nodes":[{"name":"Visit"},{"name":"Signup"}],"links":[{"source":0,"target":1,"value":120}]}'></div> */
import { COMMON, chart, palette, s, esc } from './_lib.js';
import { on } from '../core.js';

const safe = v => {
  const d = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  return { nodes: Array.isArray(d.nodes) ? d.nodes : [], links: Array.isArray(d.links) ? d.links.filter(l => l && typeof l === 'object') : [] };
};
const read = (el, o) => {
  try {
    const j = el.querySelector(':scope > script[type="application/json"]');
    return safe(JSON.parse((o.data || '').trim() || j.textContent));
  } catch (e) { return safe(null); }
};

export default {
  name: 'chart-flow',
  selector: '.efx-chart-flow',
  lazy: true,
  defaults: { ...COMMON, nodeWidth: 12, nodePad: 12, align: 'justify', legend: false },
  init(el, o) {
    let d = read(el, o);
    // registered before chart() so it runs before the lib's own efx:data handler
    const off = on(el, 'efx:data', e => { d = e.detail ? safe(e.detail) : d; });
    const draw = ({ g, w, h, deco, fmt }) => {
      const names = (d.nodes || []).map(n => String(n && n.name != null ? n.name : n == null ? '' : n));
      const id = v => { if (typeof v === 'number' && names[v] != null) return v; const k = String(v), i = names.indexOf(k); return i < 0 ? names.push(k) - 1 : i; };
      const L = (d.links || []).map(l => ({ s: id(l.source), t: id(l.target), v: +l.value || 0 })).filter(l => l.v > 0 && l.s !== l.t);
      const all = names.map((name, i) => ({ i, name, in: 0, out: 0, col: 0, a: [], b: [] }));
      L.forEach(l => { all[l.s].out += l.v; all[l.s].a.push(l); all[l.t].in += l.v; all[l.t].b.push(l); });
      const N = all.filter(n => n.in + n.out);
      if (!N.length) return [];
      N.forEach((n, k) => { n.v = Math.max(n.in, n.out); n.mi = L.length + k; });
      for (let k = 0, c = 1; c && k < N.length; k++) { c = 0; L.forEach(l => { const t = all[l.t]; if (t.col < Math.min(N.length - 1, all[l.s].col + 1)) { t.col = all[l.s].col + 1; c = 1; } }); }
      const C = Math.max(...N.map(n => n.col)) + 1;
      if (o.align === 'justify') N.forEach(n => { if (!n.a.length) n.col = C - 1; });
      const pad = deco ? 0 : 6, H = h - 2 * pad, nw = o.nodeWidth, gap = o.nodePad;
      const cols = Array.from({ length: C }, (_, c) => N.filter(n => n.col === c));
      const ky = Math.max(0.01, Math.min(...cols.filter(c => c.length).map(c => (H - (c.length - 1) * gap) / c.reduce((a, n) => a + n.v, 0))));
      cols.forEach((c, ci) => {
        const bar = n => { const q = n.b.filter(l => all[l.s].col < ci); return q.length ? q.reduce((a, l) => a + l.v * (all[l.s].y + all[l.s].h / 2), 0) / q.reduce((a, l) => a + l.v, 0) : 0; };
        if (ci) c.sort((a, b) => bar(a) - bar(b));
        let y = pad + (H - c.reduce((a, n) => a + n.v * ky + gap, -gap)) / 2;
        c.forEach(n => { n.x = pad / 2 + (C > 1 ? ci * (w - pad - nw) / (C - 1) : 0); n.y = y; n.h = Math.max(1, n.v * ky); y += n.h + gap; });
      });
      N.forEach(n => {
        let y = n.y; n.a.sort((p, q) => all[p.t].y - all[q.t].y).forEach(l => { l.sy = y + l.v * ky / 2; y += l.v * ky; });
        y = n.y; n.b.sort((p, q) => all[p.s].y - all[q.s].y).forEach(l => { l.ty = y + l.v * ky / 2; y += l.v * ky; });
      });
      const pal = palette(el, o, names.length), marks = [];
      L.forEach((l, i) => {
        const A = all[l.s], B = all[l.t], x0 = A.x + nw, x1 = B.x, xm = (x0 + x1) / 2, lw = l.v * ky;
        const node = s('path', { d: `M${x0},${l.sy}C${xm},${l.sy} ${xm},${l.ty} ${x1},${l.ty}`, fill: 'none', stroke: pal[A.i], 'stroke-opacity': .35, 'stroke-width': lw, pathLength: 1, class: 'efx-chart__mark efx-chart__draw', style: `--i:${i}` }, g);
        marks.push({ x: xm, y: (l.sy + l.ty) / 2, label: `${A.name} → ${B.name}`, value: l.v, node, index: i, rel: [A.mi, B.mi],
          html: `<strong>${esc(A.name)} → ${esc(B.name)}</strong><b>${esc(fmt(l.v))} (${Math.round(l.v / A.v * 100)}% of ${esc(A.name)})</b>`,
          hit(px, py) {
            if (px < x0 || px > x1) return false;
            let a = 0, b = 1, t = .5;
            for (let k = 0; k < 14; k++) { t = (a + b) / 2; x0 + (x1 - x0) * (1.5 * t - 1.5 * t * t + t * t * t) < px ? a = t : b = t; }
            return Math.abs(py - (l.sy + (l.ty - l.sy) * t * t * (3 - 2 * t))) <= lw / 2 + 2;
          } });
      });
      N.forEach((n, i) => {
        const node = s('rect', { x: n.x, y: n.y, width: nw, height: n.h, rx: 2, fill: pal[n.i], class: 'efx-chart__mark efx-chart__fade', style: `--i:${i}` }, g);
        marks.push({ x: n.x + nw / 2, y: n.y + n.h / 2, label: n.name, value: n.v, node, index: L.length + i, rel: n.a.concat(n.b).map(l => L.indexOf(l)),
          hit: (px, py) => px >= n.x - 2 && px <= n.x + nw + 2 && py >= n.y && py <= n.y + n.h });
      });
      if (!deco) N.forEach((n, i) => {
        const right = n.x < w / 2;
        s('text', { x: right ? n.x + nw + 6 : n.x - 6, y: n.y + n.h / 2, 'text-anchor': right ? 'start' : 'end', 'dominant-baseline': 'middle', class: 'efx-chart__value efx-flow__label efx-chart__fade', style: `--i:${i}` }, g).textContent = n.name;
      });
      return marks;
    };
    draw.radius = 1;
    const stop = chart(el, o, draw);
    return () => { off(); stop(); };
  },
};
