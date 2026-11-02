/* globe — lightweight rotating dot globe (canvas, no deps).
   <div class="efx-globe" data-efx-markers="51.5,-0.12|40.7,-74" style="max-width:360px"></div> */
import { onVisible, motionOK, themeColor, on } from '../core.js';

export default {
  name: 'globe',
  selector: '.efx-globe',
  lazy: true,
  defaults: { dots: 1200, speed: 0.2, markers: [], color: '', tilt: 0.3, drag: true },
  init(el, o) {
    let restore = 0;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restore = 1; }
    const cv = document.createElement('canvas'), c = cv.getContext('2d'), col = o.color || themeColor(el);
    cv.className = 'efx-globe__canvas';
    cv.setAttribute('aria-hidden', 'true');
    el.appendChild(cv);
    const N = Math.min(6e3, o.dots), P = [];
    for (let i = 0, y, r, a; i < N; i++) { y = 1 - 2 * (i + .5) / N; r = Math.sqrt(1 - y * y); a = i * 2.39996; P.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
    const M = (el.dataset.efxMarkers || '').split('|').map(s => s.split(',').map(parseFloat)).filter(m => m.length > 1 && m.every(isFinite))
      .map(([la, lo]) => { la *= Math.PI / 180; lo *= Math.PI / 180; return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)]; });
    let w = 0, h = 0, R = 0, rot = 0, tilt = o.tilt, raf = 0, last = 0, vis = true, dx = null, dy = 0;
    const draw = t => {
      c.clearRect(0, 0, w, h);
      const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
      const pr = ([x, y, z]) => { const X = x * cr + z * sr, Z = z * cr - x * sr; return [w / 2 + X * R, h / 2 - (y * ct - Z * st) * R, y * st + Z * ct]; };
      c.fillStyle = c.strokeStyle = col;
      for (const p of P) { const [x, y, z] = pr(p); c.globalAlpha = z > 0 ? .3 + .7 * z : .07; c.fillRect(x - .8, y - .8, 1.6, 1.6); }
      const ph = (t / 1500) % 1;
      for (const m of M) {
        const [x, y, z] = pr(m);
        if (z <= 0) continue;
        c.globalAlpha = 1; c.beginPath(); c.arc(x, y, 3, 0, 6.3); c.fill();
        c.globalAlpha = 1 - ph; c.beginPath(); c.arc(x, y, 3 + 10 * ph, 0, 6.3); c.stroke();
      }
    };
    const step = t => { raf = 0; rot += o.speed * Math.min(50, t - last) / 1000; last = t; draw(t); go(); };
    const go = () => { if (motion && vis && !raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
    const motion = motionOK();
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); w = el.clientWidth; h = el.clientHeight; R = Math.min(w, h) * .45; cv.width = w * d; cv.height = h * d; c.setTransform(d, 0, 0, d, 0, 0); draw(performance.now()); };
    size();
    const offs = [];
    if (motion) offs.push(onVisible(el, v => { vis = v; if (v) go(); else { cancelAnimationFrame(raf); raf = 0; } }));
    if (o.drag) {
      cv.style.cursor = 'grab'; cv.style.touchAction = 'pan-y'; cv.style.pointerEvents = 'auto';
      offs.push(on(cv, 'pointerdown', e => { dx = e.clientX; dy = e.clientY; cv.setPointerCapture(e.pointerId); }));
      offs.push(on(cv, 'pointermove', e => {
        if (dx == null) return;
        rot += (e.clientX - dx) * .008; tilt = Math.max(-1.2, Math.min(1.2, tilt + (e.clientY - dy) * .005)); dx = e.clientX; dy = e.clientY;
        if (!raf) draw(performance.now());
      }));
      const up = () => { dx = null; };
      offs.push(on(cv, 'pointerup', up), on(cv, 'pointercancel', up));
    }
    let ro;
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(() => { if (el.clientWidth !== w || el.clientHeight !== h) size(); }); ro.observe(el); }
    go();
    return () => { cancelAnimationFrame(raf); raf = 0; vis = false; offs.forEach(f => f()); ro && ro.disconnect(); cv.remove(); if (restore) el.style.position = ''; };
  },
};
