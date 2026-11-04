/* pixelate — mosaic → sharp image. Canvas overlay, drawImage only (no pixel reads, CORS-safe).
   <img class="efx-pixelate" src="…"> or <div class="efx-pixelate"><img …></div>
   trigger: view (sharpens when scrolled into view) | hover (pixelates on hover, sharp on leave). */
import { on, onVisible, motionOK } from '../core.js';

export default {
  name: 'pixelate',
  selector: '.efx-pixelate',
  defaults: { from: 32, duration: 900, trigger: 'view' },
  init(el, o) {
    const img = el.tagName === 'IMG' ? el : el.querySelector('img');
    if (!img || !motionOK()) return;
    const host = img.parentElement;
    const restorePos = getComputedStyle(host).position === 'static';
    if (restorePos) host.style.position = 'relative';
    const hover = o.trigger === 'hover';
    const cv = document.createElement('canvas'), tiny = document.createElement('canvas');
    cv.className = 'efx-pixelate__canvas';
    cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    const prevOpacity = img.style.opacity;
    let p = hover ? 0 : 1, target = p, from = 0, raf = 0, ready = false, shown = -1, stop;
    const draw = () => {
      const W = img.offsetWidth, H = img.offsetHeight, nw = img.naturalWidth, nh = img.naturalHeight;
      if (!W || !H || !nw) return;
      const b = Math.max(1, Math.round(Math.pow(o.from, p)));
      if (b === shown && cv.width) return;
      shown = b;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.style.left = img.offsetLeft + 'px'; cv.style.top = img.offsetTop + 'px';
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      cv.width = W * dpr; cv.height = H * dpr;
      // object-fit: cover crop
      let sx = 0, sy = 0, sw = nw, sh = nh;
      if (getComputedStyle(img).objectFit === 'cover') { const r = W / H; if (nw / nh > r) { sw = nh * r; sx = (nw - sw) / 2; } else { sh = nw / r; sy = (nh - sh) / 2; } }
      const w = Math.max(1, Math.ceil(W / b)), h = Math.max(1, Math.ceil(H / b));
      tiny.width = w; tiny.height = h;
      const t = tiny.getContext('2d');
      t.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = false;
      c.drawImage(tiny, 0, 0, w, h, 0, 0, w * b * dpr, h * b * dpr);
    };
    const render = () => {
      const on_ = b => { cv.style.display = b ? '' : 'none'; img.style.opacity = b ? '0' : prevOpacity; };
      if (p <= 0.001) on_(false); else { on_(true); draw(); }
    };
    const frame = now => {
      const d = (now - from) / Math.max(1, o.duration); from = now;
      p += Math.sign(target - p) * Math.min(Math.abs(target - p), d);
      render();
      raf = p === target ? 0 : requestAnimationFrame(frame);
    };
    const go = v => { target = v; if (ready && !raf) { from = performance.now(); raf = requestAnimationFrame(frame); } };
    const start = () => {
      ready = true;
      render();
      if (hover) return;
      stop = onVisible(el, v => { if (v) { stop && stop(); go(0); } });
    };
    // initial state: hidden until loaded to avoid a sharp flash
    if (!hover) img.style.opacity = '0';
    const offs = [];
    if (hover) offs.push(on(el, 'pointerenter', e => e.pointerType !== 'touch' && go(1)), on(el, 'pointerleave', () => go(0)));
    if (img.complete && img.naturalWidth) start(); else offs.push(on(img, 'load', start, { once: true }));
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { shown = -1; ready && p > 0.001 && draw(); }) : null;
    ro && ro.observe(img);
    return () => {
      offs.forEach(f => f());
      stop && stop();
      ro && ro.disconnect();
      cancelAnimationFrame(raf);
      cv.remove();
      img.style.opacity = prevOpacity;
      if (restorePos) host.style.position = '';
    };
  },
};
