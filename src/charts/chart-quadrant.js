/* chart-quadrant — 2×2 priority matrix with labelled dots.
   <div class="efx-chart-quadrant" data-efx-quadrants="Quick wins|Big bets|Fill-ins|Money pits" data-efx-x-label="Effort →" data-efx-y-label="Impact →"
        data-efx-data='[{"label":"Search","x":20,"y":80},{"label":"Rewrite","x":85,"y":70,"r":8,"group":"Core"}]'></div> */
import { COMMON, chart, palette, linear, s, esc } from './_lib.js';
import { on } from '../core.js';

const norm = d => (Array.isArray(d) ? d : (d && d.items) || []).filter(q => q && typeof q === 'object')
  .map(q => ({ ...q, x: +q.x, y: +q.y })).filter(q => isFinite(q.x) && isFinite(q.y));
const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const dom = (a, k) => (a.length > 1 && a.every(v => isFinite(parseFloat(v))) ? a.map(parseFloat) : [0, 100])[k];
const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export default {
  name: 'chart-quadrant',
  selector: '.efx-chart-quadrant',
  lazy: true,
  defaults: { ...COMMON, height: 360, legend: false, quadrants: [], xLabel: '', yLabel: '', xDomain: [], yDomain: [] },
  init(el, o) {
    // The component owns its items (the lib only sees a name-less series). efx:data > inline <script> > data-efx-data.
    const read = d => { try { return norm(d); } catch (e) { return []; } };
    const j = el.querySelector(':scope > script[type="application/json"]');
    let items = [];
    try { items = read(JSON.parse((o.data || '').trim() || (j ? j.textContent : '[]'))); } catch (e) { console.warn('[effix] chart data', e); }
    const jt = j && j.getAttribute('type');
    if (j) j.setAttribute('type', 'application/x-efx-json');
    o.source = '';
    o.data = '[]';
    // registered before chart() so it runs before the lib's own efx:data handler
    const off = on(el, 'efx:data', e => { items = read(e.detail); });
    const draw = ({ g, w, h, deco }) => {
      if (!items.length) return [];
      const pal = palette(el, o, 7), Q = o.quadrants;
      const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : { t: 6, r: 6, b: o.xLabel ? 32 : 6, l: o.yLabel ? 30 : 6 };
      const X0 = pad.l, X1 = w - pad.r, Y0 = pad.t, Y1 = h - pad.b, mx = (X0 + X1) / 2, my = (Y0 + Y1) / 2, gp = deco ? 0 : 2;
      const x = linear([dom(o.xDomain, 0), dom(o.xDomain, 1)], [X0, X1]), y = linear([dom(o.yDomain, 0), dom(o.yDomain, 1)], [Y1, Y0]);
      const cl = (v, a, b) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), v));
      // quadrant order: TL, TR, BL, BR
      [[X0, Y0, 2], [mx, Y0, 0], [X0, my, 4], [mx, my, 5]].forEach(([qx, qy, c], k) => {
        const l = qx === X0 ? 0 : 1, t = qy === Y0 ? 0 : 1;
        s('rect', { x: qx + (l ? gp : 0), y: qy + (t ? gp : 0), width: mx - X0 - gp, height: my - Y0 - gp, rx: deco ? 0 : 8, fill: pal[c], 'fill-opacity': deco ? .14 : .09, class: 'efx-chart__fade', style: `--i:${k}` }, g);
        if (!deco && Q[k]) s('text', { x: l ? X1 - 12 : X0 + 12, y: t ? Y1 - 12 : Y0 + 18, 'text-anchor': l ? 'end' : 'start', class: 'efx-quad__q efx-chart__fade' }, g).textContent = Q[k];
      });
      if (!deco) {
        const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
        s('line', { x1: mx, x2: mx, y1: Y0, y2: Y1, class: 'efx-chart__grid' }, ax);
        s('line', { x1: X0, x2: X1, y1: my, y2: my, class: 'efx-chart__grid' }, ax);
        if (o.xLabel) s('text', { x: mx, y: h - 8, 'text-anchor': 'middle' }, ax).textContent = o.xLabel;
        if (o.yLabel) s('text', { x: 10, y: my, 'text-anchor': 'middle', transform: `rotate(-90 10 ${my})` }, ax).textContent = o.yLabel;
      }
      const groups = [...new Set(items.map(q => q.group).filter(v => v != null))];
      const rmax = Math.max(0, ...items.map(q => +q.r || 0));
      const dots = items.map(q => {
        const r = rmax ? 5 + 11 * Math.sqrt((+q.r || 0) / rmax) : deco ? 4 : 6;
        const cx = cl(x(q.x), X0 + r, X1 - r), cy = cl(y(q.y), Y0 + r, Y1 - r);
        return { q, r, cx, cy, col: pal[q.group == null ? 0 : groups.indexOf(q.group) % 7] };
      });
      dots.forEach((d, i) => {
        d.node = s('circle', { cx: d.cx, cy: d.cy, r: d.r, fill: d.col, 'fill-opacity': rmax ? .8 : 1, stroke: 'var(--sh-surface,#fff)', 'stroke-width': 2, class: 'efx-chart__mark efx-chart__fade', style: `--i:${i + 4}` }, g);
      });
      // labels: first free of 12 candidate spots around the dot (right, left, above, below, corners, shifted right)
      if (!deco) {
        const placed = [], box = d => ({ x: d.cx - d.r, y: d.cy - d.r, w: 2 * d.r, h: 2 * d.r });
        dots.forEach((d, i) => {
          const t = String(d.q.label == null ? '' : d.q.label), tw = t.length * 6.4 + 4, r = d.r;
          const C = [[r + 5, 0, 0], [-r - 5, 0, 1], [0, -r - 9, 2], [0, r + 10, 2], [r + 3, -r - 3, 0], [r + 3, r + 4, 0], [-r - 3, -r - 3, 1], [-r - 3, r + 4, 1], [r + 5, -14, 0], [r + 5, 14, 0], [-r - 5, -14, 1], [-r - 5, 14, 1]];
          let best, bs = 1e9;
          for (const [dx, dy, a] of C) {
            const b = { x: d.cx + dx - (a === 1 ? tw : a === 2 ? tw / 2 : 0), y: d.cy + dy - 7, w: tw, h: 14 };
            const sc = placed.filter(p => hit(b, p)).length + dots.filter((e, k) => k !== i && hit(b, box(e))).length + (b.x < X0 || b.x + b.w > X1 || b.y < Y0 || b.y + b.h > Y1 ? 4 : 0);
            if (sc < bs) { bs = sc; best = { b, dx, dy, a }; }
            if (!sc) break;
          }
          placed.push(best.b);
          s('text', { x: d.cx + best.dx, y: d.cy + best.dy, 'text-anchor': ['start', 'end', 'middle'][best.a], 'dominant-baseline': 'middle', class: 'efx-quad__l efx-chart__fade', style: `--i:${i + 6}` }, g).textContent = t;
        });
      }
      return dots.map((d, i) => {
        const q = d.q, qn = Q[(q.y >= (dom(o.yDomain, 0) + dom(o.yDomain, 1)) / 2 ? 0 : 2) + (q.x >= (dom(o.xDomain, 0) + dom(o.xDomain, 1)) / 2 ? 1 : 0)];
        return {
          x: d.cx, y: d.cy, label: String(q.label == null ? '' : q.label), value: q.y, series: q.group == null ? '' : String(q.group), node: d.node, index: i,
          valueText: `${o.xLabel || 'x'} ${nf.format(q.x)}, ${o.yLabel || 'y'} ${nf.format(q.y)}`,
          hit: (px, py) => Math.hypot(px - d.cx, py - d.cy) <= d.r + 4,
          html: `<strong>${esc(q.label == null ? '' : q.label)}</strong>` + (qn ? `<span>${esc(qn)}${q.group != null ? ' · ' + esc(q.group) : ''}</span>` : q.group != null ? `<span>${esc(q.group)}</span>` : '') +
            `<span>${esc(o.xLabel || 'x')} <b>${nf.format(q.x)}</b></span><span>${esc(o.yLabel || 'y')} <b>${nf.format(q.y)}</b></span>` + (q.r != null ? `<span>size <b>${nf.format(q.r)}</b></span>` : ''),
        };
      });
    };
    const stop = chart(el, o, draw);
    return () => { off(); stop(); if (j) { if (jt == null) j.removeAttribute('type'); else j.setAttribute('type', jt); } };
  },
};
