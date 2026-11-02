/* textfill — Apple-style text that lights up word by word (or letter) as you scroll.
   <p class="efx-textfill" data-efx-by="word">Long paragraph…</p>
   Fill starts when the element top reaches `start` of the viewport height and ends when its bottom reaches `end`. */
import { onScroll, motionOK } from '../core.js';

export default {
  name: 'textfill',
  selector: '.efx-textfill',
  defaults: { start: 0.8, end: 0.3, by: 'word', dim: 0.2, color: '' },
  init(el, o) {
    if (!motionOK()) return;
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    const saved = el.innerHTML, st = el.style;
    const letters = o.by === 'letter' && text.length <= 600;
    const spans = [];
    const piece = t => {
      const s = document.createElement('span');
      s.className = 'efx-textfill__p'; s.textContent = t; spans.push(s); return s;
    };
    // Wrap words inside text nodes only, so links / <em> / <strong> keep their markup.
    const wrapText = root => {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
      while (w.nextNode()) nodes.push(w.currentNode);
      for (const n of nodes) {
        const parts = n.nodeValue.split(/(\s+)/);
        if (!parts.some(p => p && !/^\s+$/.test(p))) continue;
        const frag = document.createDocumentFragment();
        for (const p of parts) {
          if (!p) continue;
          if (/^\s+$/.test(p)) { frag.append(' '); continue; }
          if (!letters) { frag.append(piece(p)); continue; }
          const wrap = document.createElement('span');
          wrap.className = 'efx-textfill__w';
          [...p].forEach(c => wrap.append(piece(c)));
          frag.append(wrap);
        }
        n.replaceWith(frag);
      }
    };
    if (el.querySelector('a,button,input,select,textarea,summary,[tabindex],[contenteditable]')) {
      wrapText(el); // interactive children: wrap in place, keep them reachable by AT and keyboard
    } else {
      const pieces = document.createElement('span');
      pieces.className = 'efx-textfill__pieces';
      pieces.setAttribute('aria-hidden', 'true');
      while (el.firstChild) pieces.appendChild(el.firstChild);
      wrapText(pieces);
      const sr = document.createElement('span');
      sr.className = 'efx-textfill__sr';
      sr.textContent = text;
      el.append(sr, pieces);
    }
    const prev = [st.getPropertyValue('--efx-textfill-dim'), st.getPropertyValue('--efx-textfill-color')];
    if (el.dataset.efxDim !== undefined) st.setProperty('--efx-textfill-dim', o.dim);
    if (o.color) st.setProperty('--efx-textfill-color', o.color);
    const n = spans.length, last = [];
    const stop = onScroll((y, vh) => {
      const r = el.getBoundingClientRect();
      const a = o.start * vh, p = (a - r.top) / ((a - o.end * vh + r.height) || 1);
      return () => spans.forEach((s, i) => {
        const f = Math.round(Math.min(1, Math.max(0, p * n - i)) * 20) / 20;
        if (last[i] !== f) { last[i] = f; s.style.setProperty('--f', f); }
      });
    });
    return () => {
      stop();
      el.innerHTML = saved;
      prev[0] ? st.setProperty('--efx-textfill-dim', prev[0]) : st.removeProperty('--efx-textfill-dim');
      prev[1] ? st.setProperty('--efx-textfill-color', prev[1]) : st.removeProperty('--efx-textfill-color');
    };
  },
};
