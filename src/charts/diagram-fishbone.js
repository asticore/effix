/* diagram-fishbone — Ishikawa / cause-and-effect diagram.
   <div class="efx-diagram-fishbone" data-efx-problem="Late deliveries">
     <ul><li>People<ul><li>Training</li><li>Turnover</li></ul></li><li>Process<ul>…</ul></li></ul></div>
   or data-efx-data='{"problem":"Late deliveries","causes":[{"name":"People","items":["Training"]}]}'
   (or an inline <script type="application/json">). Categories alternate above/below the spine. */
import { on, rafThrottle } from '../core.js';
import { s, esc, palette } from './_lib.js';

const own = li => [...li.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
const norm = d => {
  d = d && typeof d === 'object' ? d : {};
  return { problem: d.problem != null ? String(d.problem) : '', causes: (Array.isArray(d.causes) ? d.causes : []).map(c => ({ name: String(c && c.name != null ? c.name : c || ''), items: ((c && c.items) || []).map(String) })) };
};
const wrap = (t, n) => { const out = []; let cur = ''; String(t).split(/\s+/).forEach(w => { if (cur && (cur + ' ' + w).length > n) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); out.push(cur); return out.slice(0, 3); };

export default {
  name: 'diagram-fishbone',
  selector: '.efx-diagram-fishbone',
  lazy: true,
  defaults: { problem: '', data: '', colors: [], title: '' },
  init(el, o) {
    const ul = el.querySelector(':scope > ul');
    const read = () => {
      try {
        const j = el.querySelector(':scope > script[type="application/json"]');
        if (o.data.trim() || j) return norm(JSON.parse(o.data.trim() || j.textContent));
      } catch (e) { console.warn('[effix] fishbone data', e); }
      return { problem: '', causes: ul ? [...ul.children].map(li => ({ name: own(li), items: [...li.querySelectorAll('li')].map(own).filter(Boolean) })) : [] };
    };
    let d = read();
    if (o.problem) d.problem = o.problem;
    let hidden = false;
    if (ul && !ul.hidden) { ul.hidden = true; hidden = true; }
    const prevRole = el.getAttribute('role'), prevLabel = el.getAttribute('aria-label');
    if (prevRole == null) el.setAttribute('role', 'group');
    if (prevLabel == null) el.setAttribute('aria-label', o.title || 'Cause and effect diagram: ' + d.problem);
    el.classList.add('efx-diagram');
    const svg = s('svg', { class: 'efx-diagram__fish' });
    const sr = document.createElement('ul');
    sr.className = 'efx-chart__sr efx-diagram__sr';
    el.append(svg, sr);

    let lastW = 0;
    const render = () => {
      const { problem, causes } = d, n = causes.length, k = Math.max(1, Math.ceil(n / 2)), HW = 150;
      lastW = el.clientWidth || 720;
      const LW = Math.max(lastW, 40 + HW + k * 165), slot = (LW - HW - 50) / k;
      const M = Math.max(2, ...causes.map(c => c.items.length)), bh = Math.max(120, M * 25 + 46), dx = bh * 0.42, sy = bh + 46, H = sy * 2;
      const colors = palette(el, o, Math.max(n, 1)), maxC = Math.max(8, Math.floor((slot - 34) / 6.3));
      svg.setAttribute('viewBox', `0 0 ${LW} ${H}`);
      svg.textContent = '';
      s('line', { class: 'efx-diagram__spine', x1: 16, y1: sy, x2: LW - HW, y2: sy }, svg);
      const head = s('g', { class: 'efx-diagram__head' }, svg);
      s('rect', { x: LW - HW, y: sy - 36, width: HW, height: 72, rx: 14 }, head);
      const lines = wrap(problem, 17), t = s('text', { x: LW - HW / 2, y: sy - (lines.length - 1) * 8 }, head);
      lines.forEach((ln, i) => { const sp = s('tspan', { x: LW - HW / 2, dy: i ? 16 : 0 }, t); sp.textContent = ln; });
      causes.forEach((c, i) => {
        const top = i % 2 === 0, j = i >> 1, sg = top ? -1 : 1, xa = LW - HW - 14 - j * slot, xe = xa - dx, ye = sy + sg * bh;
        const g = s('g', { class: 'efx-diagram__bone', 'data-i': i, tabindex: 0, role: 'img', 'aria-label': `${c.name}: ${c.items.join(', ')}`, style: `--c:${colors[i]};--i:${i}` }, svg);
        s('path', { class: 'efx-diagram__hit', d: `M${xa},${sy}L${xe},${ye}` }, g);
        s('path', { class: 'efx-diagram__bone-line', d: `M${xa},${sy}L${xe},${ye}` }, g);
        c.items.forEach((it, m) => {
          const tt = (m + 1) / (c.items.length + 1), bx = xa - dx * tt, by = sy + sg * bh * tt;
          s('line', { class: 'efx-diagram__tick', x1: bx - 9, y1: by, x2: bx, y2: by }, g);
          const tx = s('text', { class: 'efx-diagram__item', x: bx - 12, y: by }, g);
          tx.textContent = it.length > maxC ? it.slice(0, maxC - 1) + '…' : it;
          if (it.length > maxC) s('title', {}, tx).textContent = it;
        });
        const w = Math.min(slot - 12, c.name.length * 7.6 + 26);
        const lb = s('g', { class: 'efx-diagram__cat' }, g);
        s('rect', { x: xe - w / 2, y: ye - 14 + sg * 14, width: w, height: 28, rx: 14 }, lb);
        const ct = s('text', { x: xe, y: ye + sg * 14 }, lb); ct.textContent = c.name;
      });
      sr.innerHTML = `<li>${esc(problem)}</li>` + causes.map(c => `<li>${esc(c.name)}: ${esc(c.items.join(', '))}</li>`).join('');
    };
    render();

    const nodeOf = t => t.closest && t.closest('.efx-diagram__bone');
    const hl = g => { svg.classList.toggle('is-focus', !!g); svg.querySelectorAll('.efx-diagram__bone').forEach(b => b.classList.toggle('is-hl', b === g)); };
    const select = g => { const c = d.causes[+g.dataset.i]; el.dispatchEvent(new CustomEvent('efx:select', { bubbles: true, detail: { index: +g.dataset.i, label: c.name, items: c.items, problem: d.problem } })); };
    const resize = rafThrottle(() => { if (Math.abs(el.clientWidth - lastW) > 1) render(); });
    const offs = [
      on(svg, 'pointerover', e => hl(nodeOf(e.target))),
      on(svg, 'pointerleave', () => hl(null)),
      on(svg, 'focusin', e => hl(nodeOf(e.target))),
      on(svg, 'focusout', () => hl(null)),
      on(svg, 'click', e => { const g = nodeOf(e.target); g && select(g); }),
      on(svg, 'keydown', e => { const g = nodeOf(e.target); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(g); } }),
      on(el, 'efx:data', e => { d = norm(e.detail); render(); }),
    ];
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro && ro.observe(el);
    return () => {
      resize.cancel(); ro && ro.disconnect(); offs.forEach(f => f());
      svg.remove(); sr.remove();
      if (hidden) ul.hidden = false;
      if (prevRole == null) el.removeAttribute('role');
      if (prevLabel == null) el.removeAttribute('aria-label');
      el.classList.remove('efx-diagram');
    };
  },
};
