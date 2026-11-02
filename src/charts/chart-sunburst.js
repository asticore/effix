/* chart-sunburst — hierarchical radial partition. Click an arc to zoom in, the center to go back up.
   <div class="efx-chart-sunburst" data-efx-data='{"name":"All","children":[{"name":"A","children":[{"name":"a1","value":4}]},{"name":"B","value":6}]}'></div> */
import { COMMON, chart, palette, polar, arcPath, s, esc } from './_lib.js';
import { on } from '../core.js';

const TAU = Math.PI * 2;
const build = raw => {
  const all = [];
  const mk = (d, parent, depth, br) => {
    d = d && typeof d === 'object' ? d : {};
    const n = { name: String(d.name ?? ''), parent, depth, br, kids: [], i: all.length };
    all.push(n);
    (Array.isArray(d.children) ? d.children : []).forEach(c => n.kids.push(mk(c, n, depth + 1, depth ? br : n.kids.length)));
    const sum = n.kids.reduce((a, k) => a + k.v, 0);
    n.v = sum > 0 ? sum : Math.max(0, +d.value || 0);
    n.kids = n.kids.filter(k => k.v > 0);
    return n;
  };
  const root = mk(Array.isArray(raw) ? { children: raw } : raw, null, 0, 0);
  root.all = all;
  return root;
};
const read = (el, o) => {
  try { return build(JSON.parse((o.data || '').trim() || el.querySelector(':scope > script[type="application/json"]').textContent)); } catch (e) { return build({}); }
};
const hgt = n => (n.kids.length ? 1 + Math.max(...n.kids.map(hgt)) : 0);
const cut = (t, px) => (t.length * 6.2 > px ? t.slice(0, Math.max(1, Math.floor(px / 6.2) - 1)) + '…' : t);

export default {
  name: 'chart-sunburst',
  selector: '.efx-chart-sunburst',
  lazy: true,
  defaults: { ...COMMON, height: 320, depth: 4, captions: true, legend: false },
  init(el, o) {
    let tree = read(el, o), focus = tree, zoomed = false, ct = null;
    // registered before chart() so it runs before the lib's own efx:data handler
    const off = on(el, 'efx:data', e => {
      const d = e.detail;
      if (d && d.zoom) return;
      if (d && (d.children || d.name != null || Array.isArray(d))) tree = build(d); else if (d && d.tree) tree = build(d.tree);
      focus = tree;
    });
    const draw = ({ g, w, h, deco, fmt }) => {
      const D = Math.min(Math.max(1, o.depth), hgt(focus));
      if (!D) return [];
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 2, rc = R * (deco ? .15 : .36), t = (R - rc) / D;
      const pal = palette(el, o, tree.kids.length), anim = zoomed || !g.classList.contains('is-in');
      zoomed = false;
      const arcs = [], pos = new Map(), marks = [];
      const walk = (n, a0, a1, d) => {
        let a = a0;
        n.kids.forEach(k => {
          const b = a + (a1 - a0) * k.v / n.v;
          if ((b - a) * (rc + d * t) >= 1.5) { arcs.push({ n: k, a0: a, a1: b, d }); if (d < D) walk(k, a, b, d + 1); }
          a = b;
        });
      };
      walk(focus, 0, TAU, 1);
      const trail = n => { const p = []; for (; n && n !== focus; n = n.parent) p.unshift(n.name); return p.join(' › '); };
      arcs.forEach(({ n, a0, a1, d }, j) => {
        const r0 = rc + (d - 1) * t, r1 = r0 + t, pct = Math.max(42, 100 - 15 * (n.depth - 1)), am = (a0 + a1) / 2;
        const cls = anim ? ' efx-sb' : '', st = `--i:${d};--o:${cx}px ${cy}px`;
        const node = s('path', { d: arcPath(cx, cy, r0, r1, a0, a1), fill: `color-mix(in oklab, ${pal[n.br]} ${pct}%, var(--sh-surface, #fff))`, stroke: 'var(--sh-surface, #fff)', 'stroke-width': 1.5, class: 'efx-chart__mark' + cls, style: st }, g);
        pos.set(n, j);
        const [x, y] = polar(cx, cy, (r0 + r1) / 2, am), arc = (a1 - a0) * (r0 + r1) / 2, deg = am * 180 / Math.PI;
        if (!deco && o.captions) {
          let tx = n.name, rot = deg + (deg > 90 && deg < 270 ? 180 : 0);
          if (arc - 8 < tx.length * 6.2 || t < 16) {
            rot = deg - 90 + (am > Math.PI ? 180 : 0);
            tx = arc >= 13 && t >= 34 ? cut(tx, t - 10) : '';
            if (tx.length < 2) tx = '';
          }
          if (tx) s('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle', transform: `rotate(${rot} ${x} ${y})`, class: 'efx-chart__value efx-sb__t' + (anim ? ' efx-sbf' : ''), style: `${st};fill:${pct < 75 ? 'var(--sh-text,#0f172a)' : '#fff'}` }, g).textContent = tx;
        }
        const rel = []; for (let p = n.parent; p && p !== focus; p = p.parent) rel.push(pos.get(p));
        marks.push({ x, y, label: n.name, value: n.v, series: '', node, index: n.i, rel,
          html: `<strong>${esc(trail(n))}</strong><b>${esc(fmt(n.v))}</b><span>${(n.v / focus.v * 100).toFixed(1)}% of ${esc(focus.name || 'total')}</span>`,
          hit: (px, py) => {
            const q = Math.hypot(px - cx, py - cy); let a = Math.atan2(px - cx, cy - py);
            if (a < 0) a += TAU;
            return q >= r0 && q < r1 && a >= a0 && a < a1;
          } });
      });
      if (!deco) {
        const up = focus.parent, T = [0, 1, 2].map(i => s('text', { x: cx, y: cy + (i - 1) * 16 - (i ? 0 : 2), 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: i === 1 ? 'efx-chart__value' : 'efx-sb__s' }, g));
        const set = (a, b, c) => { T[0].textContent = cut(a, rc * 2 - 6); T[1].textContent = cut(b, rc * 2 - 6); T[2].textContent = c; };
        const crumbs = []; for (let n = up; n; n = n.parent) crumbs.unshift(n.name || 'total');
        const reset = () => set(crumbs.join(' › '), focus.name || 'Total', fmt(focus.v));
        ct = { set: m => (m ? set('', m.label, fmt(m.value)) : reset()) };
        reset();
        if (up) {
          s('circle', { cx, cy, r: rc, fill: 'transparent', style: 'cursor:pointer' }, g);
          marks.push({ x: cx, y: cy, label: 'Back to ' + (up.name || 'total'), value: focus.v, series: '', index: -1, html: `<strong>Back to ${esc(up.name || 'total')}</strong>`, hit: (px, py) => Math.hypot(px - cx, py - cy) < rc });
        }
      }
      return marks;
    };
    draw.radius = 1;
    draw.onShow = m => { if (ct) ct.set(m && m.node ? m : null); };
    const stop = chart(el, o, draw);
    const offS = on(el, 'efx:select', e => {
      const i = e.detail.index, n = i < 0 ? focus.parent : tree.all[i];
      if (e.target !== el || !n || n === focus || !n.kids.length) return;
      focus = n; zoomed = true;
      const svg = el.querySelector('.efx-chart__svg');
      svg.dispatchEvent(new Event('pointerleave'));
      el.dispatchEvent(new CustomEvent('efx:data', { detail: { zoom: 1 } }));
    });
    return () => { off(); offS(); stop(); };
  },
};
