/* shared stagger math (not a feature). Used by reveal and animate for .spark-stagger containers.
   Container options: data-spark-stagger (ms/step, 80) · data-spark-from first|last|center|edges|random|<index>
   data-spark-grid "cols,rows" | "auto" · data-spark-axis x|y · data-spark-ease <easing> · data-spark-total <ms across all>. */
import { ease } from './_easing.js';

const cache = new WeakMap(); // group -> Map(selector -> { sig, items, delays })

// cluster pixel offsets (4px tolerance) into column/row indexes
const bucket = vals => {
  const u = [];
  [...vals].sort((a, b) => a - b).forEach(v => { if (!u.length || v - u[u.length - 1] > 4) u.push(v); });
  return v => { let k = 0; u.forEach((c, i) => { if (v >= c - 4) k = i; }); return k; };
};

function compute(g, items) {
  const ds = g.dataset, n = items.length;
  const step = parseFloat(ds.sparkStagger) || 80, total = parseFloat(ds.sparkTotal) || 0;
  const from = (ds.sparkFrom || 'first').trim(), grid = (ds.sparkGrid || '').trim(), axis = grid && ds.sparkAxis;
  let pos;
  if (grid === 'auto') {
    const bx = bucket(items.map(e => e.offsetLeft)), by = bucket(items.map(e => e.offsetTop));
    pos = items.map(e => [bx(e.offsetLeft), by(e.offsetTop)]);
  } else if (parseInt(grid) > 0) {
    const c = parseInt(grid);
    pos = items.map((_, i) => [i % c, Math.floor(i / c)]);
  } else pos = items.map((_, i) => [i, 0]);
  const mx = Math.max(...pos.map(p => p[0])), my = Math.max(...pos.map(p => p[1]));
  const dist = (p, o) => {
    const dx = p[0] - o[0], dy = p[1] - o[1];
    return axis === 'x' ? Math.abs(dx) : axis === 'y' ? Math.abs(dy) : Math.hypot(dx, dy);
  };
  const mid = [mx / 2, my / 2];
  let d;
  if (from === 'random') {
    d = items.map((_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  } else if (from === 'edges') {
    d = pos.map(p => dist(p, mid));
    const m = Math.max(...d);
    d = d.map(v => m - v);
  } else {
    const o = from === 'center' ? mid : from === 'last' ? pos[n - 1] : /^\d+$/.test(from) ? pos[Math.min(+from, n - 1)] : pos[0];
    d = pos.map(p => dist(p, o));
  }
  const max = Math.max(...d), fn = ds.sparkEase ? ease(ds.sparkEase) : null;
  return d.map(v => {
    let t = max ? v / max : 0;
    if (fn) t = fn(t);
    return total > 0 ? t * total : t * max * step;
  });
}

/** The `.spark-stagger` container above `el`, if any. */
export const staggerGroup = el => el.parentElement && el.parentElement.closest('.spark-stagger');

/** Delay in ms for `el` among `group.querySelectorAll(sel)`. Computed once per group (and option set). */
export function stagger(group, sel, el) {
  let m = cache.get(group);
  if (!m) cache.set(group, m = new Map());
  const sig = JSON.stringify(group.dataset);
  let c = m.get(sel);
  if (!c || c.sig !== sig || !c.items.includes(el)) {
    const items = [...group.querySelectorAll(sel)];
    m.set(sel, c = { sig, items, delays: compute(group, items) });
  }
  return c.delays[c.items.indexOf(el)] || 0;
}
