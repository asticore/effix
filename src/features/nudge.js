/* nudge — periodic attention animation until the user interacts.
   <button class="btn efx-nudge" data-efx-anim="ring" data-efx-dot>🔔</button>
   anim: shake | wobble | ring (built in) or any animate.css name (e.g. pulse, tada, heartbeat). */
import { onVisible, on, motionOK } from '../core.js';

const BUILTIN = ['shake', 'wobble', 'ring'];

export default {
  name: 'nudge',
  selector: '.efx-nudge',
  defaults: { every: 6000, anim: 'shake', times: 0, delay: 3000, stop: 'click', dot: false },
  init(el, o) {
    const offs = [];
    let dot, restorePos = null;
    if (o.dot) {
      if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
      dot = document.createElement('span');
      dot.className = 'efx-nudge__dot'; dot.setAttribute('aria-hidden', 'true');
      el.append(dot);
    }
    if (!motionOK()) return () => { if (dot) dot.remove(); if (restorePos) el.style.position = ''; };

    const kf = BUILTIN.includes(o.anim) ? 'efx-nudge-' + o.anim : o.anim.startsWith('efx-') ? o.anim : 'efx-' + o.anim;
    let timer = 0, count = 0, vis = false, stopped = false;
    const clear = () => { el.style.animation = ''; el.classList.remove('is-nudging'); };
    const schedule = ms => { clearTimeout(timer); timer = 0; if (!stopped && vis && !document.hidden) timer = setTimeout(play, ms); };
    const play = () => {
      timer = 0;
      if (stopped || !vis || document.hidden) return;
      clear(); void el.offsetWidth;
      el.classList.add('is-nudging');
      el.style.animation = `${kf} .9s ease both`;
      if (o.times && ++count >= o.times) { stopped = true; return; }
      schedule(o.every);
    };
    const halt = () => { stopped = true; clearTimeout(timer); clear(); if (dot) dot.classList.add('is-seen'); };

    offs.push(on(el, 'animationend', e => { if (e.target === el) clear(); }));
    offs.push(onVisible(el, v => { vis = v; if (v) { if (!timer) schedule(count ? o.every : o.delay); } else { clearTimeout(timer); timer = 0; clear(); } }));
    offs.push(on(document, 'visibilitychange', () => { if (document.hidden) { clearTimeout(timer); timer = 0; } else if (!timer) schedule(o.every); }));
    if (o.stop === 'click') offs.push(on(el, 'click', halt), on(el, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') halt(); }));
    else if (o.stop === 'hover') offs.push(on(el, 'pointerenter', halt), on(el, 'focus', halt));

    return () => {
      clearTimeout(timer); offs.forEach(f => f()); clear();
      if (dot) dot.remove();
      if (restorePos) el.style.position = '';
    };
  },
};
