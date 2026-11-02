/* sequence — scroll-driven image sequence (canvas) or video scrub.
   <div class="efx-sequence" data-efx-src="frames/f{i}.webp" data-efx-frames="120" data-efx-pad="3"></div>
   <div class="efx-sequence" data-efx-list="a.jpg|b.jpg|c.jpg"></div>
   <video class="efx-sequence" muted playsinline preload="auto" src="clip.mp4"></video>
   The container becomes `height` vh tall; the canvas/video stays pinned while you scroll through it. */
import { onScroll, motionOK } from '../core.js';

export default {
  name: 'sequence',
  selector: '.efx-sequence',
  lazy: true,
  defaults: { src: '', list: [], frames: 0, pad: 0, start: 1, height: 300, fit: 'cover' },
  init(el, o) {
    const anim = motionOK(), video = el.tagName === 'VIDEO';
    const host = document.createElement('div'); // tall scroll track
    host.className = 'efx-sequence__track';
    let canvas, ctx, ro, parent, saved, pump = () => {}, stop;
    const prog = (r, vh) => Math.min(1, Math.max(0, -r.top / ((r.height - vh) || 1)));
    if (video) {
      parent = el.parentNode;
      saved = [el.className, el.style.cssText];
      parent.insertBefore(host, el);
      host.appendChild(el);
      el.style.objectFit = o.fit;
      el.pause();
      const seek = t => { if (el.duration && Math.abs(el.currentTime - t) > .03) el.currentTime = t; };
      if (!anim) { host.classList.add('efx-sequence-static'); el.addEventListener('loadedmetadata', () => seek(0.01), { once: true }); }
      else {
        host.style.height = o.height + 'vh'; el.classList.add('efx-sequence-on');
        let p = 0;
        const sync = () => seek(p * (el.duration || 0));
        el.addEventListener('loadedmetadata', sync);
        stop = onScroll((y, vh) => { p = prog(host.getBoundingClientRect(), vh); return sync; });
        const un = stop;
        stop = () => { un(); el.removeEventListener('loadedmetadata', sync); };
      }
    } else {
      const urls = o.list.length ? o.list : Array.from({ length: o.frames }, (_, i) => o.src.replace('{i}', String(o.start + i).padStart(o.pad, '0')));
      const n = urls.length;
      if (!n) return;
      const imgs = [], req = new Set();
      let active = 0, want = 0, drawn = -1;
      const pin = document.createElement('div');
      pin.className = 'efx-sequence__pin';
      pin.setAttribute('aria-hidden', 'true');
      canvas = document.createElement('canvas');
      pin.appendChild(canvas);
      el.appendChild(pin);
      ctx = canvas.getContext('2d');
      if (anim) { el.style.height = o.height + 'vh'; el.classList.add('efx-sequence-on'); }
      const draw = () => {
        let k = -1;
        for (let d = 0; d < n && k < 0; d++) k = imgs[want - d] ? want - d : imgs[want + d] ? want + d : -1;
        if (k < 0 || (k === drawn && canvas.dataset.w === canvas.width + 'x' + canvas.height)) return;
        const im = imgs[k], cw = canvas.width, ch = canvas.height;
        const s = (o.fit === 'contain' ? Math.min : Math.max)(cw / im.naturalWidth, ch / im.naturalHeight);
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(im, (cw - im.naturalWidth * s) / 2, (ch - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
        drawn = k; canvas.dataset.w = cw + 'x' + ch;
      };
      pump = () => {
        while (active < 6) {
          let k = -1;
          const free = i => i >= 0 && i < n && !imgs[i] && !req.has(i);
          for (let d = 0; d < n && k < 0; d++) k = free(want + d) ? want + d : free(want - d) ? want - d : -1;
          if (k < 0) return;
          req.add(k); active++;
          const im = new Image();
          im.onload = () => { imgs[k] = im; active--; draw(); pump(); };
          im.onerror = () => { active--; pump(); };
          im.src = urls[k];
        }
      };
      const size = () => {
        const d = Math.min(devicePixelRatio || 1, 2), r = pin.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(r.width * d)); canvas.height = Math.max(1, Math.round(r.height * d));
        draw();
      };
      if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(size); ro.observe(pin); } else size();
      const goto = p => { want = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1)))); pump(); draw(); };
      if (anim) stop = onScroll((y, vh) => { const p = prog(el.getBoundingClientRect(), vh); return () => goto(p); });
      else goto(0);
    }
    return () => {
      stop && stop(); ro && ro.disconnect();
      if (video) { parent.insertBefore(el, host); host.remove(); el.className = saved[0]; el.style.cssText = saved[1]; }
      else { el.querySelector(':scope > .efx-sequence__pin').remove(); el.style.height = ''; el.classList.remove('efx-sequence-on'); }
    };
  },
};
