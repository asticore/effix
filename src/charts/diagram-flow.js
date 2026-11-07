/* diagram-flow — HTML-first diagrams: flowcharts, process, architecture, state machines, ER/UML.
   Nodes are real HTML children with ids; an SVG overlay draws the connectors behind them.
   <div class="efx-diagram-flow" data-efx-layout="auto" data-efx-edges="a>b|b>c:yes|c~>a">
     <div id="a" data-efx-shape="pill">Start</div> <div id="b" data-efx-shape="diamond">Ok?</div> …</div>
   Edges: a>b solid, a~>b dashed, a=>b thick, a<>b both ways; ":label"; ER cardinality ":1..n" (1, n, 0n, 01).
   Place nodes with data-efx-cell="col,row[,colspan,rowspan]" (+ data-efx-cols), or data-efx-layout="auto"
   (direction TB|LR), or swimlanes data-efx-lanes="A|B" + data-efx-lane on nodes. data-efx-group="Name" boxes nodes. */
import { on, rafThrottle, motionOK } from '../core.js';
import { s, esc, palette } from './_lib.js';

const OPS = /^([^<~=>:\s][^<~=>:]*?)\s*(<>|~>|=>|>)\s*([^:]+?)\s*(?::(.*))?$/;
const CARD = /^(1|n|m|\*|0n|01)$/i;
const NORM = { r: [1, 0], l: [-1, 0], b: [0, 1], t: [0, -1] };
const OPP = { r: 'l', l: 'r', t: 'b', b: 't' };
const f = p => p[0].toFixed(1) + ',' + p[1].toFixed(1);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
let uid = 0;

function rounded(P, rad = 10) {
  let d = 'M' + f(P[0]);
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], b = P[i], c = P[i + 1], l1 = dist(a, b), l2 = dist(b, c), r = Math.min(rad, l1 / 2, l2 / 2);
    if (!l1 || !l2) continue;
    d += 'L' + f([b[0] + (a[0] - b[0]) * r / l1, b[1] + (a[1] - b[1]) * r / l1]) + 'Q' + f(b) + ' ' + f([b[0] + (c[0] - b[0]) * r / l2, b[1] + (c[1] - b[1]) * r / l2]);
  }
  return d + 'L' + f(P[P.length - 1]);
}

/* longest-path ranks; back edges (cycles) are ignored */
function rankOf(ids, edges) {
  const out = new Map(ids.map(i => [i, []])), st = new Map(), order = [], back = new Set();
  edges.forEach(e => out.has(e.a) && out.has(e.b) && out.get(e.a).push(e.b));
  const dfs = u => {
    st.set(u, 1);
    for (const v of out.get(u)) { if (st.get(v) === 1) back.add(u + '>' + v); else if (!st.get(v)) dfs(v); }
    st.set(u, 2); order.push(u);
  };
  ids.forEach(u => st.get(u) || dfs(u));
  const r = new Map(ids.map(i => [i, 0]));
  order.reverse().forEach(u => out.get(u).forEach(v => back.has(u + '>' + v) || r.set(v, Math.max(r.get(v), r.get(u) + 1))));
  return { r, back };
}

export default {
  name: 'diagram-flow',
  selector: '.efx-diagram-flow',
  lazy: true,
  defaults: { edges: '', layout: '', direction: 'TB', cols: 0, lanes: [], route: 'orth', flow: false, colors: [], title: '' },
  init(el, o) {
    const undo = [], set = (n, k, v) => { undo.push([n, k, n.style[k]]); n.style[k] = v; };
    const find = id => { try { return el.querySelector('#' + CSS.escape(id)); } catch (e) { return null; } };
    const nameOf = n => (n.getAttribute('aria-label') || (n.querySelector(':scope > b') || n).textContent).replace(/\s+/g, ' ').trim();
    const E = String(o.edges).split('|').map(p => { const m = p.trim().match(OPS); return m && { a: m[1], b: m[3], op: m[2], label: (m[4] || '').trim() }; }).filter(Boolean);
    const byId = new Map(), nodes = new Set();
    E.forEach(e => [e.a, e.b].forEach(id => { const n = find(id); if (n) { byId.set(id, n); nodes.add(n); } }));
    el.querySelectorAll('[data-efx-shape],[data-efx-lane]').forEach(n => { nodes.add(n); if (n.id) byId.set(n.id, n); });
    const edges = E.filter(e => byId.has(e.a) && byId.has(e.b) && e.a !== e.b);

    let restore = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restore = true; }
    el.style.isolation = 'isolate';
    const added = [];
    const addCls = (n, c) => { if (!n.classList.contains(c)) { n.classList.add(c); added.push([n, c]); } };
    addCls(el, 'efx-diagram');

    /* ---------- layout */
    const gridify = (c, cols) => {
      set(c, 'display', 'grid'); set(c, 'gridTemplateColumns', `repeat(${cols},minmax(0,1fr))`);
      set(c, 'justifyItems', 'center'); set(c, 'alignItems', 'center');
    };
    const cell = (n, c, r, cs = 1, rs = 1) => { set(n, 'gridColumn', `${c} / span ${cs}`); set(n, 'gridRow', `${r} / span ${rs}`); };
    const lanes = o.lanes;
    if (lanes.length || o.layout === 'auto') {
      const ids = [...byId.keys()].filter(i => byId.get(i).parentElement === el);
      const { r, back } = rankOf(ids, edges);
      const R = Math.max(0, ...r.values());
      const layers = Array.from({ length: R + 1 }, () => []);
      ids.forEach(i => layers[r.get(i)].push(i));
      const pos = new Map(), fw = edges.filter(e => !back.has(e.a + '>' + e.b) && r.has(e.a) && r.has(e.b));
      const place = () => layers.forEach(L => L.forEach((id, k) => pos.set(id, k)));
      const order = (li, down) => {
        const L = layers[li], b = new Map(L.map(id => {
          const ns = fw.map(e => (down ? (e.b === id ? e.a : null) : (e.a === id ? e.b : null))).filter(x => x != null);
          return [id, ns.length ? ns.reduce((a, x) => a + pos.get(x), 0) / ns.length : pos.get(id)];
        }));
        L.sort((x, y) => b.get(x) - b.get(y)); L.forEach((id, k) => pos.set(id, k));
      };
      place();
      for (let i = 0; i < 3; i++) { for (let l = 1; l <= R; l++) order(l, true); for (let l = R - 1; l >= 0; l--) order(l, false); }
      if (lanes.length) {
        const laneIdx = n => { const v = n.dataset.efxLane; const i = lanes.indexOf(v); return i >= 0 ? i : Math.max(0, (parseInt(v, 10) || 1) - 1); };
        let cols = R + 1;
        byId.forEach((n, id) => {
          const m = (n.dataset.efxCell || '').split(',').map(x => parseInt(x, 10));
          const c = m[0] || (r.get(id) ?? 0) + 1; cols = Math.max(cols, c);
          cell(n, c, laneIdx(n) + 1);
        });
        gridify(el, cols); set(el, 'gridTemplateRows', `repeat(${lanes.length},minmax(var(--efx-lane-h,5.5rem),auto))`);
        addCls(el, 'efx-diagram--lanes');
      } else {
        const LR = /^l/i.test(o.direction), mx = Math.max(...layers.map(L => L.length));
        ids.forEach(id => {
          const L = layers[r.get(id)], k = pos.get(id), at = 1 + (mx - L.length) + 2 * k;
          LR ? cell(byId.get(id), r.get(id) + 1, at, 1, 2) : cell(byId.get(id), at, r.get(id) + 1, 2, 1);
        });
        gridify(el, LR ? R + 1 : mx * 2);
        if (LR) set(el, 'gridTemplateRows', `repeat(${mx * 2},auto)`);
      }
    } else {
      [el, ...el.querySelectorAll('[data-efx-group]')].forEach(c => {
        const kids = [...c.children].filter(k => k.dataset.efxCell);
        let cols = parseInt(c.dataset.efxCols, 10) || o.cols * (c === el) || 0;
        kids.forEach(k => {
          const m = k.dataset.efxCell.split(',').map(x => parseInt(x, 10));
          cell(k, m[0] || 1, m[1] || 1, m[2] || 1, m[3] || 1); cols = Math.max(cols, (m[0] || 1) + (m[2] || 1) - 1);
        });
        if (cols) gridify(c, cols);
      });
    }

    /* ---------- node semantics */
    const colors = palette(el, o, 7);
    nodes.forEach(n => {
      addCls(n, 'efx-diagram__node');
      const t = n.dataset.efxTone;
      if (t && /^[1-7]$/.test(t)) set(n, '--efx-n', colors[t - 1]);
      if (!n.hasAttribute('tabindex') && !n.matches('a[href],button,input,select,textarea,[contenteditable]')) { n.setAttribute('tabindex', '0'); undo.push([n, 'tabindex', null]); }
    });
    const attrs = [];
    const setAttr = (n, k, v) => { if (!n.hasAttribute(k)) { n.setAttribute(k, v); attrs.push([n, k]); } };
    setAttr(el, 'role', 'group');
    setAttr(el, 'aria-label', o.title || 'Diagram');

    /* ---------- svg + screen-reader list */
    const svg = s('svg', { class: 'efx-diagram__svg', 'aria-hidden': 'true' });
    const mid = 'efx-dg-' + ++uid;
    el.appendChild(svg);
    const sr = document.createElement('ul');
    sr.className = 'efx-chart__sr efx-diagram__sr';
    sr.innerHTML = edges.map(e => `<li>${esc(nameOf(byId.get(e.a)))} → ${esc(nameOf(byId.get(e.b)))}${e.label ? ' (' + esc(e.label) + ')' : ''}</li>`).join('');
    el.appendChild(sr);

    const ed = [];
    let hl = null;
    const apply = () => {
      el.classList.toggle('is-focus', !!hl);
      nodes.forEach(n => n.classList.toggle('is-hl', !!hl && hl.n.has(n)));
      ed.forEach(x => x.g.classList.toggle('is-hl', !!hl && hl.e.has(x.i)));
    };
    const focusNode = n => {
      const hn = new Set([n]), he = new Set();
      edges.forEach((e, i) => { if (byId.get(e.a) === n || byId.get(e.b) === n) { he.add(i); hn.add(byId.get(e.a)); hn.add(byId.get(e.b)); } });
      hl = { n: hn, e: he }; apply();
    };
    const clear = () => { if (hl) { hl = null; apply(); } };

    const draw = () => {
      const r = el.getBoundingClientRect(), ox = r.left + el.clientLeft, oy = r.top + el.clientTop, W = el.clientWidth, H = el.clientHeight;
      const rc = new Map();
      byId.forEach((n, id) => { const q = n.getBoundingClientRect(); rc.set(id, { l: q.left - ox, t: q.top - oy, r: q.right - ox, b: q.bottom - oy, cx: (q.left + q.right) / 2 - ox, cy: (q.top + q.bottom) / 2 - oy }); });
      const cs = getComputedStyle(el);
      const tracks = lanes.length ? cs.gridTemplateRows.split(' ').map(parseFloat) : [];
      const gap = parseFloat(cs.rowGap) || 0, pt = parseFloat(cs.paddingTop) || 0, pl = parseFloat(cs.paddingLeft) || 0;
      const tone = edges.map(e => getComputedStyle(byId.get(e.a)).getPropertyValue('--efx-n').trim());

      /* sides + port spreading */
      const sides = edges.map(e => {
        const a = rc.get(e.a), b = rc.get(e.b), gx = Math.max(b.l - a.r, a.l - b.r), gy = Math.max(b.t - a.b, a.t - b.b);
        const h = gx > 0 && gx >= gy ? true : gy > 0 ? false : Math.abs(b.cx - a.cx) > Math.abs(b.cy - a.cy);
        const sa = h ? (b.cx >= a.cx ? 'r' : 'l') : (b.cy >= a.cy ? 'b' : 't');
        return [sa, OPP[sa]];
      });
      const ports = new Map();
      edges.forEach((e, i) => [[e.a, 0, e.b], [e.b, 1, e.a]].forEach(([id, end, other]) => {
        const k = id + ':' + sides[i][end], o2 = rc.get(other), v = /[rl]/.test(sides[i][end]) ? o2.cy : o2.cx;
        (ports.get(k) || ports.set(k, []).get(k)).push([i, end, v]);
      }));
      const off = edges.map(() => [0, 0]);
      ports.forEach(L => { L.sort((x, y) => x[2] - y[2]); L.forEach(([i, end], k) => { off[i][end] = (k - (L.length - 1) / 2) * Math.min(14, 60 / L.length); }); });

      /* writes */
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.textContent = '';
      const defs = s('defs', {}, svg);
      const mk = s('marker', { id: mid, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 10, markerHeight: 10, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' }, defs);
      s('path', { d: 'M0,1 L9,5 L0,9 z', fill: 'context-stroke' }, mk);
      if (tracks.length) {
        const g = s('g', { class: 'efx-diagram__lanes' }, svg);
        let y = pt;
        tracks.forEach((h, i) => {
          const y0 = i ? y - gap / 2 : 0, y1 = i === tracks.length - 1 ? H : y + h + gap / 2;
          s('rect', { class: 'efx-diagram__lane', x: 0, y: y0, width: W, height: y1 - y0 }, g);
          const words = String(lanes[i]).split(/\s+/), lines = []; let cur = '';
          words.forEach(w => { if ((cur + ' ' + w).trim().length > 13 && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
          lines.push(cur);
          const t = s('text', { class: 'efx-diagram__lane-label', x: 14, y: (y0 + y1) / 2 - (lines.length - 1) * 8 }, g);
          lines.forEach((ln, k) => { const sp = s('tspan', { x: 14, dy: k ? 16 : 0 }, t); sp.textContent = ln; });
          y += h + gap;
        });
        s('line', { class: 'efx-diagram__lane-sep', x1: pl - 14, x2: pl - 14, y1: 0, y2: H }, g);
      }
      ed.length = 0;
      const route = String(o.route).toLowerCase();
      edges.forEach((e, i) => {
        const a = rc.get(e.a), b = rc.get(e.b), [sa, sb] = sides[i];
        const port = (n, side, d) => side === 'r' ? [n.r, n.cy + d] : side === 'l' ? [n.l, n.cy + d] : side === 'b' ? [n.cx + d, n.b] : [n.cx + d, n.t];
        const p1 = port(a, sa, off[i][0]), p2 = port(b, sb, off[i][1]), hz = /[rl]/.test(sa);
        let d;
        if (route === 'straight') d = 'M' + f(p1) + 'L' + f(p2);
        else if (route === 'curve') {
          const k = Math.max(30, dist(p1, p2) / 2), n1 = NORM[sa], n2 = NORM[sb];
          d = `M${f(p1)}C${f([p1[0] + n1[0] * k, p1[1] + n1[1] * k])} ${f([p2[0] + n2[0] * k, p2[1] + n2[1] * k])} ${f(p2)}`;
        } else if (hz ? Math.abs(p1[1] - p2[1]) < 1 : Math.abs(p1[0] - p2[0]) < 1) d = 'M' + f(p1) + 'L' + f(p2);
        else {
          const m = hz ? (p1[0] + p2[0]) / 2 : (p1[1] + p2[1]) / 2;
          d = rounded(hz ? [p1, [m, p1[1]], [m, p2[1]], p2] : [p1, [p1[0], m], [p2[0], m], p2]);
        }
        const g = s('g', { class: 'efx-diagram__edge', 'data-i': i }, svg);
        if (tone[i]) g.style.setProperty('--c', tone[i]);
        s('path', { class: 'efx-diagram__hit', d }, g);
        const er = e.label.split('..');
        const isER = er.length === 2 && CARD.test(er[0]) && CARD.test(er[1]);
        const line = s('path', { class: 'efx-diagram__line', d }, g);
        if (e.op === '~>') line.setAttribute('stroke-dasharray', '6 5');
        if (e.op === '=>') line.setAttribute('stroke-width', 3.4);
        if (!isER) { line.setAttribute('marker-end', `url(#${mid})`); if (e.op === '<>') line.setAttribute('marker-start', `url(#${mid})`); }
        else [[p1, sa, er[0]], [p2, sb, er[1]]].forEach(([p, sd, tk]) => {
          const n = NORM[sd], pp = [-n[1], n[0]], at = (u, v = 0) => [p[0] + n[0] * u + pp[0] * v, p[1] + n[1] * u + pp[1] * v];
          const t = tk.toLowerCase(), many = /[nm*]/.test(t), zero = t[0] === '0';
          let m = '';
          if (many) m += `M${f(at(11, 0))}L${f(at(0, 6))}M${f(at(11, 0))}L${f(at(0, -6))}M${f(at(11, 0))}L${f(at(0, 0))}`;
          else m += `M${f(at(8, 6))}L${f(at(8, -6))}`;
          if (t === '1') m += `M${f(at(12, 6))}L${f(at(12, -6))}`;
          s('path', { class: 'efx-diagram__er', d: m }, g);
          if (zero) { const c = at(many ? 17 : 15); s('circle', { class: 'efx-diagram__er efx-diagram__er--o', cx: c[0], cy: c[1], r: 4 }, g); }
        });
        let len = 0;
        try { len = line.getTotalLength(); } catch (x) { /* detached */ }
        if (e.label && !isER && len) {
          const m = line.getPointAtLength(len / 2), w = e.label.length * 6.4 + 14;
          const lb = s('g', { class: 'efx-diagram__lbl' }, g);
          s('rect', { x: m.x - w / 2, y: m.y - 9, width: w, height: 18, rx: 9 }, lb);
          s('text', { x: m.x, y: m.y }, lb).textContent = e.label;
        }
        if (o.flow && motionOK() && len) {
          const c = s('circle', { class: 'efx-diagram__dot', r: 3 }, g);
          const am = s('animateMotion', { dur: Math.max(1.6, len / 80) + 's', repeatCount: 'indefinite', begin: -(i * 0.7) + 's', path: d }, c);
          am.setAttribute('rotate', '0');
        }
        ed.push({ g, i });
      });
      apply();
    };
    const lay = rafThrottle(draw);
    draw();

    /* ---------- interaction */
    const nodeOf = t => { const n = t.closest && t.closest('.efx-diagram__node'); return n && el.contains(n) ? n : null; };
    const select = n => el.dispatchEvent(new CustomEvent('efx:select', { bubbles: true, detail: { id: n.id, label: nameOf(n), index: [...nodes].indexOf(n) } }));
    const offs = [
      on(el, 'pointerover', e => {
        const n = nodeOf(e.target);
        if (n) return focusNode(n);
        const g = e.target.closest && e.target.closest('.efx-diagram__edge');
        if (g) { const i = +g.dataset.i, x = edges[i]; hl = { n: new Set([byId.get(x.a), byId.get(x.b)]), e: new Set([i]) }; apply(); } else clear();
      }),
      on(el, 'pointerleave', clear),
      on(el, 'focusin', e => { const n = nodeOf(e.target); n ? focusNode(n) : clear(); }),
      on(el, 'focusout', clear),
      on(el, 'click', e => { const n = nodeOf(e.target); if (n) select(n); }),
      on(el, 'keydown', e => {
        const n = nodeOf(e.target);
        if (n && n === e.target && (e.key === 'Enter' || e.key === ' ') && !n.matches('a,button')) { e.preventDefault(); select(n); }
      }),
      on(window, 'resize', lay),
    ];
    let ro;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(lay); ro.observe(el); nodes.forEach(n => ro.observe(n)); }

    return () => {
      lay.cancel(); ro && ro.disconnect(); offs.forEach(x => x());
      svg.remove(); sr.remove();
      attrs.forEach(([n, k]) => n.removeAttribute(k));
      undo.reverse().forEach(([n, k, v]) => (k === 'tabindex' ? n.removeAttribute('tabindex') : (n.style[k] = v)));
      added.forEach(([n, c]) => n.classList.remove(c));
      nodes.forEach(n => n.classList.remove('is-hl'));
      el.classList.remove('is-focus');
      el.style.isolation = '';
      if (restore) el.style.position = '';
    };
  },
};
