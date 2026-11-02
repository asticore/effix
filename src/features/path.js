/* path — an element travels along an SVG path.
   <div class="efx-path" data-efx-svg="#route"><span class="efx-path__item">✈︎</span></div>      (existing <svg>/<path>)
   <div class="efx-path" data-efx-d="M0,250 C300,0 600,300 1000,50" data-efx-viewbox="0 0 1000 300">…</div>   (path drawn for you)
   Modes: scroll (container progress through viewport) · loop (data-efx-duration ms) · view (plays once when seen).
   Several items are spaced along the path by data-efx-gap (fraction of the path). */
import { onScroll, onVisible, on, motionOK } from '../core.js';

const NS = 'http://www.w3.org/2000/svg';
const clamp = v => Math.min(1, Math.max(0, v));
const ease = t => 1 - Math.pow(1 - t, 3);

export default {
  name: 'path',
  selector: '.efx-path',
  defaults: { mode: 'scroll', duration: 4000, rotate: true, showPath: true, start: 0, end: 1, svg: '', d: '', viewbox: '0 0 1000 300', gap: 0.08 },
  init(el, o) {
    const items = [...el.querySelectorAll('.efx-path__item')];
    const made = [];
    let path, ref = null, vbox = null;
    if (o.d) {
      const vb = o.viewbox.split(/[\s,]+/).map(Number);
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', o.viewbox);
      svg.setAttribute('class', 'efx-path__svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      path = document.createElementNS(NS, 'path');
      path.setAttribute('d', o.d);
      path.setAttribute('class', 'efx-path__line');
      if (!o.showPath) path.style.visibility = 'hidden';
      svg.appendChild(path);
      el.insertBefore(svg, el.firstChild);
      made.push(svg);
      ref = path;
      vbox = vb;
    } else if (o.svg) {
      const t = document.querySelector(o.svg);
      path = t && (t.matches('path') ? t : t.querySelector('path'));
      ref = path;
    }
    if (!path || !items.length || !path.getTotalLength) return;
    const len = path.getTotalLength();
    // progressive stroke: a copy of the path drawn up to the leading item
    let trail = null;
    if (o.showPath) {
      trail = path.cloneNode(false);
      trail.removeAttribute('id');
      trail.setAttribute('class', 'efx-path__trail');
      trail.style.fill = 'none';
      trail.style.strokeDasharray = len;
      trail.style.strokeDashoffset = len;
      path.after(trail);
      made.push(trail);
    }
    const saved = items.map(i => i.style.cssText), savedEl = el.style.cssText;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.classList.add('is-pathing');
    // no height of its own (items are absolute now): borrow the viewBox aspect ratio
    if (vbox && vbox[2] > 0 && vbox[3] > 0 && el.offsetHeight < 20) el.style.aspectRatio = vbox[2] + ' / ' + vbox[3];
    const toScreen = (t, m) => { const p = path.getPointAtLength(len * clamp(t)); return new DOMPoint(p.x, p.y).matrixTransform(m); };
    const n = items.length;
    // phase(p) -> t of item i. Item 0 leads; the last one reaches the end exactly when p = 1.
    const spread = (p, i) => clamp(p * (1 + (n - 1) * o.gap) - i * o.gap);
    let last = 0;

    // read phase: measure. returns the write function.
    const measure = p => {
      last = p;
      const r = el.getBoundingClientRect(), m = path.getScreenCTM();
      if (!m) return;
      const ox = r.left + el.clientLeft, oy = r.top + el.clientTop, e = 0.5 / len;
      const pos = items.map((_, i) => {
        const tt = o.start + (o.end - o.start) * spread(p, i);
        const a = toScreen(tt, m);
        let ang = 0;
        if (o.rotate) { const b = toScreen(tt - e, m), c = toScreen(tt + e, m); ang = Math.atan2(c.y - b.y, c.x - b.x) * 180 / Math.PI; }
        return [a.x - ox, a.y - oy, ang];
      });
      const lead = o.start + (o.end - o.start) * spread(p, 0);
      return () => {
        items.forEach((it, i) => {
          it.style.translate = `calc(${pos[i][0].toFixed(1)}px - 50%) calc(${pos[i][1].toFixed(1)}px - 50%)`;
          if (o.rotate) it.style.rotate = pos[i][2].toFixed(1) + 'deg';
        });
        if (trail) trail.style.strokeDashoffset = len * (1 - clamp(lead));
      };
    };
    const render = p => { const w = measure(p); if (w) w(); };

    const offs = [];
    if (!motionOK()) {
      render(1); // static end state
      offs.push(on(window, 'resize', () => render(1)));
    } else if (o.mode === 'scroll') {
      let stop = null;
      offs.push(onVisible(el, v => {
        if (v && !stop) stop = onScroll((y, h) => measure(clamp((h - el.getBoundingClientRect().top) / (h + el.offsetHeight))));
        else if (!v && stop) { stop(); stop = null; }
      }, '100px'));
      offs.push(() => stop && stop());
    } else {
      let raf = 0, acc = 0, t0 = 0, done = false;
      const frame = now => {
        acc += now - t0; t0 = now;
        const x = acc / o.duration;
        if (o.mode === 'view') { render(ease(clamp(x))); if (x >= 1) { done = true; return; } }
        else render(x % 1);
        raf = requestAnimationFrame(frame);
      };
      offs.push(onVisible(el, v => {
        cancelAnimationFrame(raf);
        if (v && !done) { t0 = performance.now(); raf = requestAnimationFrame(frame); }
      }));
      offs.push(() => cancelAnimationFrame(raf));
      offs.push(on(window, 'resize', () => render(last)));
      render(0);
    }
    return () => {
      offs.forEach(f => f());
      made.forEach(n => n.remove());
      items.forEach((it, i) => { it.style.cssText = saved[i]; });
      el.style.cssText = savedEl;
      el.classList.remove('is-pathing');
    };
  },
};
