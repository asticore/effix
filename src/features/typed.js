/* typed — typewriter / rotating words.
   <span class="efx-typed" data-efx-words="fast|light|accessible">fast</span>
   modes: type (default) · fade · slide. Reduced motion: static first word. */
import { onVisible, motionOK } from '../core.js';

export default {
  name: 'typed',
  selector: '.efx-typed',
  defaults: { words: [], speed: 60, back: 30, pause: 1600, loop: true, cursor: true, mode: 'type' },
  init(el, o) {
    const saved = el.innerHTML;
    const words = o.words.length ? o.words : [el.textContent.trim()];
    if (words.length < 2 || !motionOK()) { if (o.words.length) el.textContent = words[0]; return () => { el.innerHTML = saved; }; }
    const mk = (c, t) => { const s = document.createElement('span'); s.className = c; if (t) s.textContent = t; return s; };
    const sr = mk('efx-typed__sr', words[0]), vis = mk('efx-typed__v'), txt = mk('efx-typed__t'), type = o.mode === 'type';
    vis.setAttribute('aria-hidden', 'true');
    vis.append(txt);
    if (o.cursor) vis.append(mk('efx-typed__cursor'));
    el.textContent = '';
    el.append(sr, vis);
    el.setAttribute('data-efx-mode', o.mode);
    let i = 0, n = 0, dir = 1, tm = 0, seen = true;
    const later = (ms, fn) => { clearTimeout(tm); tm = setTimeout(fn, ms); };
    const swap = () => {
      txt.classList.add('is-out');
      later(280, () => {
        i = (i + 1) % words.length; txt.textContent = words[i];
        txt.classList.add('is-pre'); void txt.offsetWidth;
        txt.classList.remove('is-pre', 'is-out');
        later(o.pause, tick);
      });
    };
    const tick = () => {
      if (!seen) return;
      if (!type) { if (!o.loop && i === words.length - 1) return; return swap(); }
      const w = words[i];
      n += dir; txt.textContent = w.slice(0, n);
      if (dir > 0 && n >= w.length) {
        if (!o.loop && i === words.length - 1) return;
        return later(o.pause, () => { dir = -1; tick(); });
      }
      if (dir < 0 && n <= 0) { dir = 1; i = (i + 1) % words.length; }
      later(dir > 0 ? o.speed : o.back, tick);
    };
    txt.textContent = words[0];
    if (type) n = words[0].length;
    later(o.pause, () => { if (type) { dir = -1; } tick(); });
    const stop = onVisible(el, v => { const was = seen; seen = v; if (!v) clearTimeout(tm); else if (!was) later(o.pause, () => { if (type && dir > 0 && n >= words[i].length) dir = -1; tick(); }); });
    return () => { stop(); clearTimeout(tm); el.removeAttribute('data-efx-mode'); el.innerHTML = saved; };
  },
};
