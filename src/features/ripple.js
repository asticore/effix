/* ripple — material-style click ripple.
   <button class="btn efx-ripple">Click</button>  (Enter/Space ripple from the centre) */
import { on, motionOK } from '../core.js';

export default {
  name: 'ripple',
  selector: '.efx-ripple',
  defaults: { color: '', duration: 600, center: false },
  init(el, o) {
    if (!motionOK()) return;
    if (o.color) el.style.setProperty('--efx-ripple-color', o.color);
    el.style.setProperty('--efx-ripple-dur', o.duration + 'ms');
    let restorePos = false, clip = null;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    const getClip = () => {
      if (!clip) {
        clip = document.createElement('span');
        clip.className = 'efx-ripple__clip';
        clip.setAttribute('aria-hidden', 'true');
        el.appendChild(clip);
      }
      return clip;
    };
    const wave = (x, y) => {
      const r = el.getBoundingClientRect();
      const s = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) * 2;
      const w = document.createElement('span');
      w.className = 'efx-ripple__wave';
      w.setAttribute('aria-hidden', 'true');
      w.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + x + 'px;top:' + y + 'px';
      w.addEventListener('animationend', () => w.remove(), { once: true });
      getClip().appendChild(w);
    };
    const offs = [
      on(el, 'pointerdown', e => {
        if (e.button) return;
        const r = el.getBoundingClientRect();
        o.center ? wave(r.width / 2, r.height / 2) : wave(e.clientX - r.left, e.clientY - r.top);
      }),
      on(el, 'keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { const r = el.getBoundingClientRect(); wave(r.width / 2, r.height / 2); }
      }),
    ];
    return () => {
      offs.forEach(f => f());
      clip && clip.remove(); clip = null;
      if (restorePos) el.style.position = '';
      el.style.removeProperty('--efx-ripple-color'); el.style.removeProperty('--efx-ripple-dur');
    };
  },
};
