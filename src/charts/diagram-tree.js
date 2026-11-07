/* diagram-tree — tree / org chart / mind map from a nested list. HTML-first: the list stays real
   (and readable without JS); JS lays the nodes out and draws SVG connectors.
   <ul class="efx-diagram-tree" data-efx-direction="down" data-efx-links="elbow">
     <li data-efx-tone="primary"><span>CEO</span><ul><li>CTO</li><li>CFO</li></ul></li>
   </ul>
   data-efx-layout="mindmap" centres the root and splits children left/right.
   Click / Enter / Space toggles a branch; arrows move (↑↓ siblings, ←→ parent/child). */
import { s } from './_lib.js';
import { onVisible, motionOK, on, rafThrottle } from '../core.js';

let uid = 0;
const EASE = 'cubic-bezier(.22,1,.36,1)';

export default {
  name: 'diagram-tree',
  selector: '.efx-diagram-tree',
  lazy: true,
  defaults: { direction: 'down', layout: 'tree', links: 'elbow', collapsible: true, collapse: 0, gap: 16, levelGap: 44, animate: true, tone: '', title: '' },
  init(el, o) {
    const root = el.matches('ul,ol') ? el : el.querySelector('ul,ol');
    if (!root) return;
    const undo = [];
    const attr = (n, k, v) => { undo.push([n, k, n.getAttribute(k)]); n.setAttribute(k, v); };
    const mind = o.layout === 'mindmap';
    const dir = mind || o.direction === 'right' ? 'right' : 'down';
    const nodes = [], byChip = new Map();
    const pad = 14, play = o.animate && motionOK();

    const pick = li => [...li.childNodes].find(c => c.nodeType === 1 ? !/^[UO]L$/.test(c.tagName) : c.nodeType === 3 && c.textContent.trim());
    const walk = (ul, depth, parent) => {
      const lis = [...ul.children].filter(c => c.tagName === 'LI');
      lis.forEach((li, i) => {
        let chip = pick(li);
        if (!chip) { chip = document.createElement('span'); li.prepend(chip); undo.push([chip, 0]); }
        else if (chip.nodeType === 3) {
          const w = document.createElement('span'), tx = chip;
          li.insertBefore(w, tx); w.appendChild(tx); chip = w;
          undo.push([() => { li.insertBefore(tx, w); w.remove(); }]);
        }
        const sub = li.querySelector(':scope > ul, :scope > ol');
        const n = { li, chip, parent, depth, kids: [], sub, collapsed: false, side: '' };
        nodes.push(n); byChip.set(chip, n);
        if (parent) parent.kids.push(n);
        undo.push([chip, 'style', chip.getAttribute('style')], [chip, 'class', chip.getAttribute('class')]);
        chip.classList.add('efx-tree__node');
        attr(li, 'role', 'none');
        attr(chip, 'role', 'treeitem');
        attr(chip, 'tabindex', '-1');
        attr(chip, 'aria-level', depth + 1);
        attr(chip, 'aria-setsize', lis.length);
        attr(chip, 'aria-posinset', i + 1);
        const tone = li.getAttribute('data-efx-tone') || o.tone;
        if (tone) chip.style.setProperty('--efx-tone', `var(--sh-${tone}, ${tone})`);
        if (sub) {
          if (!sub.id) { attr(sub, 'id', 'efx-t' + ++uid); }
          attr(sub, 'role', 'group');
          attr(chip, 'aria-owns', sub.id);
          walk(sub, depth + 1, n);
        }
        if (n.kids.length && o.collapsible) {
          n.collapsed = li.hasAttribute('data-efx-collapsed') || (o.collapse > 0 && depth >= o.collapse);
          attr(chip, 'aria-expanded', String(!n.collapsed));
          chip.classList.add('is-branch');
        }
      });
    };
    attr(root, 'role', 'tree');
    const label = o.title || root.getAttribute('aria-label');
    if (label) attr(root, 'aria-label', label);
    undo.push([root, 'style', root.getAttribute('style')], [root, 'class', root.getAttribute('class')]);
    walk(root, 0, null);
    if (!nodes.length) { undo.reverse().forEach(u => u.length === 1 ? u[0]() : null); return; }
    const top = nodes[0];
    top.chip.tabIndex = 0;
    root.classList.add('efx-tree-on', 'efx-tree--' + (mind ? 'mind' : dir));
    if (play) root.classList.add('efx-tree--pending');

    const svg = s('svg', { class: 'efx-tree__links', 'aria-hidden': 'true', focusable: 'false' });
    root.prepend(svg);
    nodes.forEach(n => { if (n.parent) n.link = s('path', { class: 'efx-tree__link', fill: 'none' }, svg); });
    nodes.forEach(n => { const t = n.chip.style.getPropertyValue('--efx-tone'); if (n.link && t) n.link.style.setProperty('--efx-tone', t); });

    /* ---------------------------------------------------------- layout */
    const down = dir === 'down', gB = o.gap, gD = o.levelGap;
    const B = n => (down ? n.w : n.h), D = n => (down ? n.h : n.w);
    const kidsOf = n => (n.collapsed ? [] : n.kids);
    const sum = a => a.reduce((x, y) => x + y, 0);
    const span = new Map();
    const measure = n => {
      const k = kidsOf(n).map(measure);
      const v = Math.max(B(n), k.length ? sum(k) + gB * (k.length - 1) : 0);
      span.set(n, v); return v;
    };
    /** Lay out a forest along the breadth axis from 0; sets n.b (centre) and n.d (depth offset). Returns total breadth. */
    function forest(list) {
      const lv = [];
      const lvl = (n, d) => { lv[d] = Math.max(lv[d] || 0, D(n)); kidsOf(n).forEach(k => lvl(k, d + 1)); };
      list.forEach(n => lvl(n, 0));
      const off = [0];
      lv.forEach((m, i) => { off[i + 1] = off[i] + m + gD; });
      const assign = (n, start, d) => {
        const k = kidsOf(n), sp = span.get(n);
        let c;
        if (k.length) {
          let p = start + (sp - (sum(k.map(x => span.get(x))) + gB * (k.length - 1))) / 2;
          const cs = k.map(x => { const r = assign(x, p, d + 1); p += span.get(x) + gB; return r; });
          c = (cs[0] + cs[cs.length - 1]) / 2;
        } else c = start + sp / 2;
        n.b = c; n.d = off[d] + (lv[d] - D(n)) / 2;
        return c;
      };
      let p = 0;
      list.forEach(n => { assign(n, p, 0); p += span.get(n) + gB; });
      return Math.max(0, p - gB);
    }
    const mark = (n, side) => { n.side = side; n.kids.forEach(k => mark(k, side)); };

    let cw = 0, W = 0, H = 0;
    function place() {
      nodes.forEach(n => { n.w = n.chip.offsetWidth; n.h = n.chip.offsetHeight; });
      measure(top);
      if (mind) {
        const R = [], L = [];
        let a = 0, b = 0;
        kidsOf(top).forEach(k => { if (a <= b) { R.push(k); a += span.get(k); mark(k, 'r'); } else { L.push(k); b += span.get(k); mark(k, 'l'); } });
        const tr = forest(R), tl = forest(L);
        const sideNodes = list => { const out = []; const f = n => { out.push(n); kidsOf(n).forEach(f); }; list.forEach(f); return out; };
        const cy = Math.max(tr, tl, top.h) / 2;
        sideNodes(R).forEach(n => { n.x = top.w + gD + n.d; n.y = n.b - n.h / 2 + cy - tr / 2; });
        sideNodes(L).forEach(n => { n.x = -gD - n.d - n.w; n.y = n.b - n.h / 2 + cy - tl / 2; });
        top.x = 0; top.y = cy - top.h / 2;
      } else {
        forest([top]);
        const put = n => { if (down) { n.x = n.b - n.w / 2; n.y = n.d; } else { n.y = n.b - n.h / 2; n.x = n.d; } kidsOf(n).forEach(put); };
        put(top);
      }
      // hidden nodes collapse onto their nearest visible ancestor
      const vis = (n, px, py) => {
        n.vis = px == null; if (!n.vis) { n.x = px; n.y = py; }
        const hid = !n.vis || n.collapsed;
        n.kids.forEach(k => vis(k, hid ? n.x : null, hid ? n.y : null));
      };
      vis(top, null, null);
      const vs = nodes.filter(n => n.vis);
      const minX = Math.min(...vs.map(n => n.x)), maxX = Math.max(...vs.map(n => n.x + n.w));
      const minY = Math.min(...vs.map(n => n.y)), maxY = Math.max(...vs.map(n => n.y + n.h));
      cw = root.clientWidth;
      const ox = pad - minX + Math.max(0, (cw - (maxX - minX) - 2 * pad) / 2), oy = pad - minY;
      nodes.forEach(n => { n.x += ox; n.y += oy; });
      W = Math.max(cw, maxX - minX + 2 * pad); H = maxY - minY + 2 * pad;
    }

    const linkD = n => {
      const p = n.parent, m = o.links;
      let x1, y1, x2, y2, v = down;
      if (down) { x1 = p.x + p.w / 2; y1 = p.y + p.h; x2 = n.x + n.w / 2; y2 = n.y; }
      else if (n.side === 'l') { x1 = p.x; y1 = p.y + p.h / 2; x2 = n.x + n.w; y2 = n.y + n.h / 2; }
      else { x1 = p.x + p.w; y1 = p.y + p.h / 2; x2 = n.x; y2 = n.y + n.h / 2; }
      if (m === 'straight') return `M${x1},${y1}L${x2},${y2}`;
      const a = v ? [x1, y1, x2, y2] : [y1, x1, y2, x2]; // work in (breadth,depth) space
      const f = (b, d) => (v ? `${b},${d}` : `${d},${b}`);
      const [b1, d1, b2, d2] = a, dm = (d1 + d2) / 2;
      if (m === 'curve') return `M${f(b1, d1)}C${f(b1, dm)} ${f(b2, dm)} ${f(b2, d2)}`;
      const sg = b2 > b1 ? 1 : -1, r = Math.min(8, Math.abs(b2 - b1) / 2, Math.abs(d2 - d1) / 4);
      if (r < 1) return `M${f(b1, d1)}L${f(b1, dm)}L${f(b2, dm)}L${f(b2, d2)}`;
      const dd = Math.sign(d2 - d1) || 1;
      return `M${f(b1, d1)}L${f(b1, dm - dd * r)}Q${f(b1, dm)} ${f(b1 + sg * r, dm)}L${f(b2 - sg * r, dm)}Q${f(b2, dm)} ${f(b2, dm + dd * r)}L${f(b2, d2)}`;
    };

    function apply(anim) {
      root.style.height = H + 'px';
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      nodes.forEach(n => {
        const to = `translate(${n.x}px,${n.y}px)`;
        if (anim && n.px != null && (n.px !== n.x || n.py !== n.y || n.pv !== n.vis)) {
          n.chip.animate([
            { transform: `translate(${n.px}px,${n.py}px)`, opacity: n.pv ? 1 : 0, visibility: 'visible' },
            { transform: to, opacity: n.vis ? 1 : 0, visibility: 'visible' },
          ], { duration: 320, easing: EASE });
        }
        n.chip.style.transform = to;
        n.chip.style.opacity = n.vis ? '' : '0';
        n.chip.style.visibility = n.vis ? '' : 'hidden';
        if (n.link) {
          const d = linkD(n);
          if (anim && n.pd && n.pd !== d) { try { n.link.animate([{ d: `path("${n.pd}")` }, { d: `path("${d}")` }], { duration: 320, easing: EASE }); } catch (e) { /* d animation unsupported */ } }
          n.link.setAttribute('d', d);
          n.link.style.opacity = n.vis ? '' : '0';
          n.pd = d;
        }
        n.px = n.x; n.py = n.y; n.pv = n.vis;
      });
    }
    const layout = anim => { place(); apply(anim && play); };
    layout(false);

    /* entrance: grow out of the root once in view */
    let stopVis = () => {};
    if (play) {
      stopVis = onVisible(root, vis => {
        if (!vis) return;
        stopVis();
        root.classList.remove('efx-tree--pending');
        nodes.forEach(n => {
          n.chip.animate([{ opacity: 0, transform: `translate(${top.x}px,${top.y}px) scale(.8)` }, { opacity: 1, transform: `translate(${n.x}px,${n.y}px)` }], { duration: 520, delay: n.depth * 90, easing: EASE, fill: 'backwards' });
          if (n.link) n.link.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: n.depth * 90 + 120, fill: 'backwards' });
        });
      }, '0px', [0, 0.1]);
    }

    /* ------------------------------------------------------- behaviour */
    const hot = n => {
      nodes.forEach(k => { k.link && k.link.classList.remove('is-hot'); k.chip.classList.remove('is-hot'); });
      for (; n; n = n.parent) { n.link && n.link.classList.add('is-hot'); n.chip.classList.add('is-hot'); }
    };
    const focus = n => { nodes.forEach(k => { k.chip.tabIndex = -1; }); n.chip.tabIndex = 0; n.chip.focus(); };
    function toggle(n, v) {
      if (!n.kids.length || !o.collapsible) return;
      const c = v == null ? !n.collapsed : v;
      if (c === n.collapsed) return;
      n.collapsed = c;
      n.chip.setAttribute('aria-expanded', String(!c));
      layout(true);
      el.dispatchEvent(new CustomEvent('efx:toggle', { bubbles: true, detail: { label: n.chip.textContent.trim(), expanded: !c } }));
    }
    const text = n => n.chip.textContent.trim();
    const offs = [
      on(root, 'click', e => {
        const chip = e.target.closest('.efx-tree__node'), n = chip && byChip.get(chip);
        if (!n) return;
        el.dispatchEvent(new CustomEvent('efx:select', { bubbles: true, detail: { label: text(n), depth: n.depth } }));
        if (!e.target.closest('a,button,input')) { n.chip.focus(); toggle(n); }
      }),
      on(root, 'keydown', e => {
        const chip = e.target.closest('.efx-tree__node'), n = chip && byChip.get(chip);
        if (!n || e.altKey || e.ctrlKey || e.metaKey) return;
        const k = e.key, sibs = n.parent ? n.parent.kids : [n], i = sibs.indexOf(n);
        let t = null;
        if (k === 'ArrowDown') t = sibs[i + 1];
        else if (k === 'ArrowUp') t = sibs[i - 1];
        else if (k === 'ArrowRight' || k === 'ArrowLeft') {
          const R = k === 'ArrowRight';
          const toChild = R !== (n.side === 'l');
          if (!n.parent && mind) { const side = R ? 'r' : 'l'; if (n.collapsed) toggle(n, false); else t = n.kids.find(c => c.side === side); }
          else if (toChild) { if (n.kids.length) { if (n.collapsed) toggle(n, false); else t = n.kids[0]; } }
          else t = n.parent;
        } else if (k === 'Home') t = top;
        else if (k === 'End') { t = nodes.filter(x => x.vis).pop(); }
        else if (k === 'Enter' || k === ' ') { if (!e.target.closest('a')) { toggle(n); el.dispatchEvent(new CustomEvent('efx:select', { bubbles: true, detail: { label: text(n), depth: n.depth } })); } }
        else return;
        e.preventDefault();
        if (t) focus(t);
      }),
      on(root, 'focusin', e => { const n = byChip.get(e.target.closest('.efx-tree__node')); if (n) hot(n); }),
      on(root, 'focusout', () => hot(null)),
      on(root, 'pointerover', e => { const n = byChip.get(e.target.closest('.efx-tree__node')); if (n) hot(n); }),
      on(root, 'pointerleave', () => hot(null)),
    ];
    const rs = rafThrottle(() => { if (Math.abs(root.clientWidth - cw) > 1) layout(false); });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(rs) : null;
    if (ro) ro.observe(root);
    const fonts = document.fonts && document.fonts.ready;
    if (fonts) fonts.then(() => { if (!root.isConnected) return; const w = nodes.map(n => n.chip.offsetWidth).join(); if (w !== nodes.map(n => n.w).join()) layout(false); });

    return () => {
      offs.forEach(f => f());
      stopVis(); rs.cancel(); if (ro) ro.disconnect();
      nodes.forEach(n => n.chip.getAnimations().forEach(a => a.cancel()));
      svg.remove();
      root.classList.remove('efx-tree-on', 'efx-tree--mind', 'efx-tree--down', 'efx-tree--right', 'efx-tree--pending');
      undo.reverse().forEach(([n, k, v]) => {
        if (typeof n === 'function') return n();
        if (k === 0) return n.remove();
        if (v == null) n.removeAttribute(k); else n.setAttribute(k, v);
      });
      [root, ...nodes.map(n => n.chip)].forEach(n => { if (n.getAttribute('style') === '') n.removeAttribute('style'); });
    };
  },
};
