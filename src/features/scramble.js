/* scramble — text decode / scramble effect.
   <h2 class="efx-scramble" data-efx-trigger="view">Decode me</h2>
   <button class="btn efx-scramble" data-efx-trigger="hover">Hover</button>
   <span class="efx-scramble" data-efx-words="one|two|three"></span>   (rotating headline) */
import { on, onVisible, motionOK } from '../core.js';

export default {
  name: 'scramble',
  selector: '.efx-scramble',
  defaults: { trigger: 'view', chars: '!<>-_\\/[]{}—=+*^?#________', speed: 30, duration: 900, once: true, words: [], pause: 2000 },
  init(el, o) {
    const saved = el.innerHTML;
    const words = o.words.length ? o.words : [el.textContent.trim()];
    const cycle = o.words.length > 1;
    if (!motionOK()) { if (o.words.length) el.textContent = words[0]; return () => { el.innerHTML = saved; }; }
    const mk = c => { const s = document.createElement('span'); s.className = c; return s; };
    const sr = mk('efx-scramble__sr'), vis = mk('efx-scramble__v');
    vis.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    el.append(sr, vis);
    const pool = [...(o.chars || '#')];
    vis.style.minWidth = Math.max(...words.map(w => w.length)) + 'ch';
    let cur = words[0], tgt = cur, tm = 0, running = false, played = false, i = 0;
    const show = t => { vis.textContent = t; };
    const set = t => { cur = t; sr.textContent = t; show(t); };
    set(cur);
    const run = (to, done) => {
      clearTimeout(tm);
      running = true; tgt = to;
      const from = cur, len = Math.max(from.length, to.length), t0 = performance.now();
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / Math.max(1, o.duration));
        let out = '';
        for (let k = 0; k < len; k++) {
          const c = to[k] || '', lock = (k + 1) / len * 0.85;
          out += p >= 1 || p >= lock ? c : (c === ' ' ? ' ' : pool[(Math.random() * pool.length) | 0]);
        }
        show(out);
        if (p < 1) tm = setTimeout(step, o.speed);
        else { running = false; set(to); done && done(); }
      };
      sr.textContent = to;
      step();
    };
    const play = () => { if (!running) run(words[0]); };
    const offs = [];
    let stopVis = () => {}, seen = true;
    if (cycle) {
      const next = () => { i = (i + 1) % words.length; run(words[i], () => { tm = setTimeout(next, o.pause); }); };
      stopVis = onVisible(el, v => { seen = v; clearTimeout(tm); if (!v && running) { running = false; set(tgt); } if (v && !running) tm = setTimeout(next, o.pause); });
    } else if (o.trigger === 'hover') offs.push(on(el, 'pointerenter', play), on(el, 'focus', play));
    else if (o.trigger === 'click') offs.push(on(el, 'click', play));
    else if (o.trigger === 'load') play();
    else {
      stopVis = onVisible(el, v => {
        if (!v) { if (!o.once) played = false; return; }
        if (played) return;
        played = true;
        play();
        if (o.once) stopVis();
      });
    }
    return () => {
      clearTimeout(tm); stopVis(); offs.forEach(f => f());
      el.innerHTML = saved;
    };
  },
};
