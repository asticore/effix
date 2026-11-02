/* media — smart video: plays in view, pauses off-screen, hover mode, lazy source, reduced-motion friendly.
   <video class="efx-media" muted playsinline loop data-efx-src="clip.mp4" poster="p.jpg"></video>
   Or a container with videos: <div class="efx-media" data-efx-play="hover">…<video>…</div>
   play: view (default) | hover (also data-efx-hover) | none. Reduced motion: no autoplay, poster + play control. */
import { on, onVisible, motionOK } from '../core.js';

export default {
  name: 'media',
  selector: '.efx-media',
  defaults: { play: 'view', threshold: 0.4, reset: false },
  init(el, o) {
    const vids = el.matches('video') ? [el] : [...el.querySelectorAll('video')];
    if (!vids.length) return;
    const hover = o.play === 'hover' || el.hasAttribute('data-efx-hover');
    const reduce = !motionOK();
    const offs = [], undo = [];
    const play = () => vids.forEach(v => { const p = v.play(); p && p.catch(() => {}); });
    const stop = () => vids.forEach(v => { v.pause(); if (o.reset) v.currentTime = 0; });
    // lazy sources: only set when near the viewport
    const lazy = [el, ...el.querySelectorAll('[data-efx-src]')].filter(n => n.dataset.efxSrc);
    if (lazy.length) {
      const s = onVisible(el, v => {
        if (!v) return;
        s();
        lazy.forEach(n => { n.src = n.dataset.efxSrc; });
        vids.forEach(x => x.load());
      }, '300px');
      offs.push(s);
    }
    if (reduce) {
      vids.forEach(v => {
        const was = [v.autoplay, v.controls];
        v.autoplay = false; v.pause();
        if (el === v) v.controls = true; // native play control; container hosts get a button below
        undo.push(() => { v.autoplay = was[0]; v.controls = was[1]; });
      });
      if (el !== vids[0]) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'efx-media__play'; b.setAttribute('aria-label', 'Play video');
        b.addEventListener('click', () => { play(); b.hidden = true; });
        let restore = false;
        if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restore = true; }
        el.appendChild(b);
        undo.push(() => { b.remove(); if (restore) el.style.position = ''; });
      }
    } else if (hover) {
      vids.forEach(v => v.pause());
      offs.push(on(el, 'pointerenter', play), on(el, 'pointerleave', stop), on(el, 'focusin', play), on(el, 'focusout', stop));
    } else if (o.play === 'view') {
      offs.push(onVisible(el, v => (v ? play() : stop()), '0px', o.threshold));
    }
    return () => { offs.forEach(f => f()); undo.forEach(f => f()); };
  },
};
