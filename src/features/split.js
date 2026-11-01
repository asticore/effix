/* split — split text into words/letters for staggered entrance.
   <h2 class="efx-split" data-efx-by="letter" data-efx-effect="fade-up">Hello world</h2>
   Effects: fade · fade-up · blur · slide · wave (looping). Inline markup inside is flattened to text. */
import { onVisible, motionOK } from '../core.js';

export default {
  name: 'split',
  selector: '.efx-split',
  defaults: { by: 'word', effect: 'fade-up', stagger: 40, duration: 600, once: true, max: 200 },
  init(el, o) {
    if (!motionOK()) return;
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    const saved = el.innerHTML, prevLabel = el.getAttribute('aria-label');
    const words = text.split(' ');
    const letters = o.by === 'letter' && text.replace(/ /g, '').length <= o.max;
    const wave = o.effect === 'wave', st = el.style;
    const frag = document.createDocumentFragment();
    let i = 0;
    const piece = t => {
      const s = document.createElement('span');
      s.className = 'efx-split__p'; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i++); s.textContent = t; return s;
    };
    words.forEach((w, k) => {
      if (k) frag.append(' ');
      if (!letters) return frag.append(piece(w));
      const wrap = document.createElement('span');
      wrap.className = 'efx-split__w'; wrap.setAttribute('aria-hidden', 'true');
      [...w].forEach(c => wrap.append(piece(c)));
      frag.append(wrap);
    });
    el.setAttribute('aria-label', text);
    el.textContent = '';
    el.append(frag);
    el.setAttribute('data-efx-effect', o.effect);
    st.setProperty('--efx-split-stagger', o.stagger + 'ms');
    st.setProperty('--efx-split-dur', o.duration + 'ms');
    el.classList.add(wave ? 'efx-split-wave' : 'efx-split-pending');
    const stop = onVisible(el, v => {
      if (v) el.classList.add('is-in');
      else if (wave || !o.once) el.classList.remove('is-in');
    }, '0px 0px -10% 0px');
    return () => {
      stop();
      el.innerHTML = saved;
      prevLabel === null ? el.removeAttribute('aria-label') : el.setAttribute('aria-label', prevLabel);
      el.removeAttribute('data-efx-effect');
      el.classList.remove('efx-split-pending', 'efx-split-wave', 'is-in');
      st.removeProperty('--efx-split-stagger'); st.removeProperty('--efx-split-dur');
    };
  },
};
