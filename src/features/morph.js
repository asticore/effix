/* morph — gooey text morphing between words.
   <h1>We <span class="efx-morph" data-efx-words="Design|Build|Ship"></span></h1>
   Visual text is aria-hidden; screen readers get the current word. */
import { onVisible, motionOK } from '../core.js';

let defs = null, refs = 0;
const needFilter = () => {
  if (!refs++) {
    defs = document.createElement('div');
    defs.className = 'efx-morph__defs';
    defs.setAttribute('aria-hidden', 'true');
    defs.innerHTML = '<svg width="0" height="0"><filter id="efx-morph-f"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140"/></filter></svg>';
    document.body.appendChild(defs);
  }
  return () => { if (!--refs) defs.remove(); };
};
const span = (c, t) => { const s = document.createElement('span'); s.className = 'efx-morph__' + c; if (t != null) s.textContent = t; return s; };

export default {
  name: 'morph',
  selector: '.efx-morph',
  defaults: { words: [], duration: 1200, pause: 1800 },
  init(el, o) {
    const W = o.words.length ? o.words : [el.textContent.trim()];
    if (!W[0]) return;
    const saved = el.innerHTML;
    if (!motionOK() || W.length < 2) { el.textContent = W[0]; return () => { el.innerHTML = saved; }; }
    const free = needFilter();
    const sr = span('sr', W[0]), vis = span('vis'), a = span('a', W[0]), b = span('b');
    vis.setAttribute('aria-hidden', 'true');
    W.forEach(w => vis.appendChild(span('g', w))); // invisible ghosts reserve the widest word's width
    vis.append(a, b);
    el.textContent = '';
    el.append(sr, vis);
    let i = 0, timer = 0, raf = 0;
    const set = (s, blur, op) => { s.style.filter = blur > .1 ? `blur(${blur}px)` : ''; s.style.opacity = op; };
    const settle = () => { vis.classList.remove('is-morphing'); a.textContent = W[i]; b.textContent = ''; set(a, 0, 1); set(b, 0, 0); };
    const next = () => {
      timer = 0;
      const j = (i + 1) % W.length, t0 = performance.now();
      b.textContent = W[j];
      vis.classList.add('is-morphing');
      const tick = now => {
        const f = Math.min(1, (now - t0) / o.duration);
        set(b, Math.min(8 / f - 8, 100), f ** .4);
        set(a, Math.min(8 / (1 - f) - 8, 100), (1 - f) ** .4);
        if (f < 1) raf = requestAnimationFrame(tick);
        else { raf = 0; i = j; sr.textContent = W[i]; settle(); timer = setTimeout(next, o.pause); }
      };
      raf = requestAnimationFrame(tick);
    };
    const stop = onVisible(el, v => {
      if (v) { if (!timer && !raf) timer = setTimeout(next, o.pause); }
      else { clearTimeout(timer); cancelAnimationFrame(raf); timer = raf = 0; settle(); }
    });
    return () => { stop(); clearTimeout(timer); cancelAnimationFrame(raf); free(); el.innerHTML = saved; };
  },
};
