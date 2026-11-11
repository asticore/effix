/* viz-pack — circle packing for a hierarchy. Click a circle to zoom in, click the background (or the focused circle) to zoom out.
   <div class="efx-viz-pack" data-efx-data='{"name":"root","children":[{"name":"a","value":3},{"name":"b","children":[{"name":"c","value":2}]}]}'></div> */
import { COMMON, chart, palette, s, esc } from './_lib.js';
import { on, motionOK } from '../core.js';

const place = (b, a, c) => {
  const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
  if (!d2) { c.x = a.x + c.r; c.y = a.y; return; }
  const a2 = (a.r + c.r) ** 2, b2 = (b.r + c.r) ** 2;
  if (a2 > b2) {
    const x = (d2 + b2 - a2) / (2 * d2), y = Math.sqrt(Math.max(0, b2 / d2 - x * x));
    c.x = b.x - x * dx - y * dy; c.y = b.y - x * dy + y * dx;
  } else {
    const x = (d2 + a2 - b2) / (2 * d2), y = Math.sqrt(Math.max(0, a2 / d2 - x * x));
    c.x = a.x + x * dx - y * dy; c.y = a.y + x * dy + y * dx;
  }
};
const hits = (a, b) => { const dr = a.r + b.r - 1e-6, dx = b.x - a.x, dy = b.y - a.y; return dr > 0 && dr * dr > dx * dx + dy * dy; };
const score = n => { const a = n._, b = n.next._, ab = a.r + b.r, dx = (a.x * b.r + b.x * a.r) / ab, dy = (a.y * b.r + b.y * a.r) / ab; return dx * dx + dy * dy; };

/* Enclosing circle by iterative shrinking (Badoiu-Clarkson); r is exact for the centre found, so containment is guaranteed. */
const enclose = C => {
  let x = 0, y = 0, W = 0;
  C.forEach(c => { x += c.x * c.r; y += c.y * c.r; W += c.r; });
  x /= W; y /= W;
  for (let i = 1; i < 80; i++) {
    let f, m = -1;
    C.forEach(c => { const q = Math.hypot(c.x - x, c.y - y) + c.r; if (q > m) { m = q; f = c; } });
    const d = Math.hypot(f.x - x, f.y - y) || 1, t = (d - f.r) / (i + 1) / d; // move toward the farthest circle's far side
    x += (f.x - x) * t; y += (f.y - y) * t;
  }
  return { x, y, r: Math.max(...C.map(c => Math.hypot(c.x - x, c.y - y) + c.r)) };
};

/* Front-chain sibling packing (d3.packSiblings): circles get x/y relative to their common centre; returns the enclosing radius. */
const packSiblings = C => {
  const n = C.length;
  let a = C[0], b, c, i, j, k, sj, sk, aa, ca;
  a.x = a.y = 0;
  if (n < 2) return a.r;
  b = C[1]; a.x = -b.r; b.x = a.r; b.y = 0;
  if (n < 3) return a.r + b.r;
  place(b, a, C[2]);
  const node = _ => ({ _, next: null, previous: null });
  a = node(a); b = node(b); c = node(C[2]);
  a.next = c.previous = b; b.next = a.previous = c; c.next = b.previous = a;
  pack: for (i = 3; i < n; ++i) {
    place(a._, b._, C[i]); c = node(C[i]);
    j = b.next; k = a.previous; sj = b._.r; sk = a._.r;
    do {
      if (sj <= sk) {
        if (hits(j._, c._)) { b = j; a.next = b; b.previous = a; --i; continue pack; }
        sj += j._.r; j = j.next;
      } else {
        if (hits(k._, c._)) { a = k; a.next = b; b.previous = a; --i; continue pack; }
        sk += k._.r; k = k.previous;
      }
    } while (j !== k.next);
    c.previous = a; c.next = b; a.next = b.previous = b = c;
    aa = score(a);
    while ((c = c.next) !== b) if ((ca = score(c)) < aa) { a = c; aa = ca; }
    b = a.next;
  }
  const ring = [b._]; for (c = b.next; c !== b; c = c.next) ring.push(c._);
  const E = enclose(ring);
  C.forEach(q => { q.x -= E.x; q.y -= E.y; });
  return E.r;
};

const build = (d, padding) => {
  let pad = 0;
  const nodes = [];
  const rec = (src, parent, depth) => {
    const kids = (Array.isArray(src && src.children) ? src.children : []).filter(k => k && typeof k === 'object');
    const n = { name: String((src && src.name) ?? ''), depth, parent, kids: [], value: kids.length ? 0 : src && src.value != null ? Math.max(0, +src.value) || 0 : 1, index: nodes.length, x: 0, y: 0 };
    nodes.push(n);
    n.kids = kids.map(k => rec(k, n, depth + 1));
    if (n.kids.length) n.value = n.kids.reduce((a, k) => a + k.value, 0);
    return n;
  };
  const root = rec(d, null, 0);
  const size = n => {
    if (!n.kids.length) { n.r = Math.sqrt(n.value); return; }
    n.kids.forEach(size);
    const C = n.kids.filter(k => k.r > 0).map(k => (k.p = { x: 0, y: 0, r: k.r + pad, k }));
    n.r = C.length ? packSiblings(C) + pad : 0;
    C.forEach(q => { q.k.x = q.x; q.k.y = q.y; });
  };
  const lv = nodes.filter(n => !n.kids.length && n.value > 0);
  pad = padding * lv.reduce((a, n) => a + Math.sqrt(n.value), 0) / (lv.length || 1);
  size(root);
  const abs = n => n.kids.forEach(k => { k.x += n.x; k.y += n.y; abs(k); });
  abs(root);
  return { nodes: nodes.filter(n => n.r > 0), root };
};

export default {
  name: 'viz-pack',
  selector: '.efx-viz-pack',
  lazy: true,
  defaults: { ...COMMON, height: 420, legend: false, padding: 0.15 },
  init(el, o) {
    const read = r => { try { return typeof r === 'string' ? JSON.parse(r) : r; } catch (e) { return null; } };
    const j = el.querySelector(':scope > script[type="application/json"]');
    let src = read((o.data || '').trim() || (j && j.textContent)), T, focus, raf = 0;
    const offData = on(el, 'efx:data', e => { src = e.detail || src; T = focus = null; });
    const draw = ({ g, w, h, deco, fmt }) => {
      cancelAnimationFrame(raf);
      if (!T) { T = build(src && typeof src === 'object' ? src : {}, o.padding); focus = null; }
      const { nodes, root } = T;
      if (!root.r) return [];
      const top = root.kids.filter(k => k.r > 0), pal = palette(el, o, top.length);
      const colorOf = n => { while (n.depth > 1) n = n.parent; return pal[top.indexOf(n)] || pal[0]; };
      const zg = s('g', {}, g), lg = s('g', { class: 'efx-viz__labels' }, g);
      const marks = nodes.map((n, i) => {
        const leaf = !n.kids.length, root0 = !n.depth, c = colorOf(n);
        const node = s('circle', { cx: n.x, cy: n.y, r: n.r, fill: root0 ? 'none' : c, 'fill-opacity': leaf ? 0.8 : 0.06 + 0.05 * n.depth, stroke: root0 ? 'var(--efx-chart-grid)' : c, 'stroke-opacity': 0.55, 'vector-effect': 'non-scaling-stroke', class: 'efx-chart__mark efx-chart__fade', style: `--i:${Math.min(n.depth * 4 + (i % 8), 30)}` }, zg);
        const path = []; for (let q = n; q; q = q.parent) path.unshift(q.name);
        return { x: 0, y: 0, label: n.name || 'Root', series: n.depth > 1 ? path.slice(1, -1).join(' › ') : '', value: n.value, node, index: i, n, rel: [],
          html: `<strong>${esc(path.slice(1).join(' › ') || n.name)}</strong><b>${esc(fmt(n.value))}</b>`,
          hit: (px, py) => Math.hypot(px - marks[i].x, py - marks[i].y) <= n.r * K() };
      });
      const labels = deco ? [] : marks.filter(m => !m.n.kids.length).map(m => { const t = s('text', { class: 'efx-viz__label', 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, lg); t.textContent = m.label; return [m, t]; });
      let f = focus ? { x: focus.x, y: focus.y, r: focus.r } : { x: root.x, y: root.y, r: root.r };
      const m0 = deco ? 0 : 6, K = () => Math.min(w, h) / 2 / f.r * (1 - m0 / 100);
      const apply = () => {
        const k = K(), tx = w / 2 - f.x * k, ty = h / 2 - f.y * k;
        zg.setAttribute('transform', `translate(${tx} ${ty}) scale(${k})`);
        marks.forEach(m => { m.x = m.n.x * k + tx; m.y = m.n.y * k + ty; m.node.classList.toggle('efx-viz__out', !!focus && !inside(m.n)); });
        labels.forEach(([m, t]) => {
          const show = m.n.r * k * 1.7 > m.label.length * 6 + 6 && m.n.r * k > 9 && inside(m.n);
          t.style.display = show ? '' : 'none';
          if (show) { t.setAttribute('x', m.x); t.setAttribute('y', m.y); }
        });
      };
      const inside = n => { for (let q = n; q; q = q.parent) if (q === (focus || root)) return true; return false; };
      const zoom = n => {
        if (deco || n === (focus || root)) return;
        const to = { x: n.x, y: n.y, r: n.r }, from = { ...f }, t0 = performance.now();
        focus = n === root ? null : n;
        const step = t => {
          const u = Math.min(1, (t - t0) / 600), e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
          f = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, r: from.r + (to.r - from.r) * e };
          apply();
          raf = u < 1 ? requestAnimationFrame(step) : 0;
        };
        if (motionOK() && o.animate) raf = requestAnimationFrame(step); else { f = to; apply(); }
      };
      apply();
      draw.zoom = zoom;
      draw.cur = () => ({ root, focus });
      return marks;
    };
    draw.radius = 1;
    // click: circle -> zoom to the child of the focus that contains it; focus itself / background / outside -> zoom out
    const pick = (n, svgClick) => {
      const { root, focus } = draw.cur ? draw.cur() : {};
      if (!root) return;
      const cur = focus || root;
      if (n) { let q = n; while (q && q.parent !== cur) q = q.parent; if (q && q.kids.length) return draw.zoom(q); if (q) return; }
      if (svgClick || n) draw.zoom(cur.parent || root);
    };
    let nodesOf = () => (T ? T.nodes : []);
    const offSel = on(el, 'efx:select', e => pick(nodesOf()[e.detail.index]));
    const stop = chart(el, o, draw);
    const svg = el.querySelector('.efx-chart__svg');
    const offBg = !o.background && svg ? on(svg, 'click', e => { if (!e.target.closest('.efx-chart__mark')) pick(null, true); }) : () => {};
    return () => { cancelAnimationFrame(raf); offSel(); offBg(); offData(); stop(); };
  },
};
