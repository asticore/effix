/* shape — SVG shape morph: resamples every shape to N points and interpolates the polygon.
   <svg class="efx-shape" viewBox="0 0 100 100" data-efx-d="blob|star|heart"></svg>        named shapes (Effix.add('shape', name, 'M…'))
   <svg class="efx-shape" data-efx-shapes="#s1|#s2|#s3">…<defs><path id="s1" d="…"/>…</defs></svg>   existing geometry
   <path class="efx-shape" d="M…" data-efx-to="M…"/>     or data-efx-d="d1|d2"
   Triggers: loop (cycle, duration + pause) · hover (first -> second on hover/focus) · scroll (progress). */
import { add, get, on, onScroll, onVisible, motionOK } from '../core.js';
import { ease } from './_easing.js';

const NS = 'http://www.w3.org/2000/svg';
const clamp = v => Math.min(1, Math.max(0, v));
const star = [];
for (let i = 0; i < 10; i++) { const a = Math.PI * i / 5 - Math.PI / 2, r = i % 2 ? 20 : 48; star.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (50 + r * Math.sin(a)).toFixed(1)); }
add('shape', {
  blob: 'M50,6 C72,4 94,24 94,50 C94,76 72,96 48,94 C24,92 6,74 6,50 C6,26 28,8 50,6 Z',
  circle: 'M50,5 A45,45 0 1,1 49.9,5 Z',
  star: 'M' + star.join('L') + 'Z',
  heart: 'M50,88 C10,58 4,32 22,18 C36,8 48,18 50,28 C52,18 64,8 78,18 C96,32 90,58 50,88 Z',
  square: 'M16,6 H84 Q94,6 94,16 V84 Q94,94 84,94 H16 Q6,94 6,84 V16 Q6,6 16,6 Z',
});

const isD = s => /^[Mm][\s\d.+-]/.test(s);
const closedD = d => /z\s*$/i.test(d.trim());

// token (selector | path data | registered name) -> { pts: [x0,y0,x1,y1…], closed } or null
function sample(tok, host, n) {
  tok = tok.trim();
  let node = null, tmp = null, closed = true;
  if (/^[#.[]/.test(tok)) {
    node = document.querySelector(tok);
    const d = node && node.getAttribute('d');
    if (d) closed = closedD(d);
  } else {
    const d = isD(tok) ? tok : get('shape', tok);
    if (!d) return null;
    tmp = document.createElementNS(NS, 'path');
    tmp.setAttribute('d', d);
    host.appendChild(tmp);
    node = tmp; closed = closedD(d);
  }
  try {
    const len = node.getTotalLength(), div = closed ? n : n - 1, pts = [];
    for (let i = 0; i < n; i++) { const p = node.getPointAtLength(len * i / div); pts.push(p.x, p.y); }
    return { pts, closed };
  } catch (_) { return null; } finally { if (tmp) tmp.remove(); }
}

// reorder b's points (rotate / reverse) so it lines up with a with minimum travel
function align(a, b, closed) {
  const n = a.length / 2;
  const at = (r, s, i) => (closed ? (r ? (s - i + n) % n : (i + s) % n) : (r ? n - 1 - i : i));
  let best = Infinity, bo = [0, 0];
  for (let r = 0; r < 2; r++) {
    for (let s = 0; s < (closed ? n : 1); s++) {
      let cost = 0;
      for (let i = 0; i < n && cost < best; i++) { const j = at(r, s, i); cost += (a[2 * i] - b[2 * j]) ** 2 + (a[2 * i + 1] - b[2 * j + 1]) ** 2; }
      if (cost < best) { best = cost; bo = [r, s]; }
    }
  }
  const out = [];
  for (let i = 0; i < n; i++) { const j = at(bo[0], bo[1], i); out.push(b[2 * j], b[2 * j + 1]); }
  return out;
}

export default {
  name: 'shape',
  selector: '.efx-shape',
  defaults: { shapes: '', d: '', to: '', points: 64, trigger: 'loop', duration: 1200, pause: 800, ease: 'ease-in-out', target: '' },
  init(el, o) {
    const isPath = el.localName === 'path';
    const svg = isPath ? el.ownerSVGElement : el;
    if (!svg || !svg.createSVGPoint) return;
    const own = isPath ? el.getAttribute('d') || '' : '';
    const split = s => s.split('|').map(t => t.trim()).filter(Boolean);
    const toks = o.shapes ? split(o.shapes) : o.d ? split(o.d) : o.to ? [own, ...split(o.to)].filter(Boolean) : [];
    if (!toks.length) return;
    const n = Math.max(8, Math.round(o.points) || 64);
    const shapes = toks.map(t => sample(t, svg, n)).filter(Boolean);
    if (!shapes.length) return;
    const closed = shapes.every(s => s.closed), m = shapes.length;
    const T = shapes.map((s, i) => [s.pts, align(s.pts, shapes[(i + 1) % m].pts, closed)]);

    const named = toks.some(t => !/^[#.[]/.test(t) && !isD(t));
    const addVB = !isPath && named && !svg.hasAttribute('viewBox');
    if (addVB) svg.setAttribute('viewBox', '0 0 100 100');
    let path = el;
    if (!isPath) {
      path = document.createElementNS(NS, 'path');
      path.setAttribute('class', 'efx-shape__path');
      svg.appendChild(path);
    }
    const draw = (i, t) => {
      const [a, b] = T[i];
      let s = 'M';
      for (let k = 0; k < n; k++) s += (k ? 'L' : '') + (a[2 * k] + (b[2 * k] - a[2 * k]) * t).toFixed(2) + ',' + (a[2 * k + 1] + (b[2 * k + 1] - a[2 * k + 1]) * t).toFixed(2);
      path.setAttribute('d', s + (closed ? 'Z' : ''));
    };
    const offs = [];
    const e = ease(o.ease);
    draw(0, 0);
    if (m > 1 && motionOK()) {
      let raf = 0;
      if (o.trigger === 'hover') {
        const host = (o.target && document.querySelector(o.target)) || el.closest('a,button,[tabindex]') || el;
        let prog = 0, dir = 0, last = 0;
        const tick = now => {
          prog = clamp(prog + (dir ? 1 : -1) * Math.max(0, now - last) / o.duration); last = now;
          draw(0, e(prog));
          raf = dir ? (prog < 1 ? requestAnimationFrame(tick) : 0) : (prog > 0 ? requestAnimationFrame(tick) : 0);
        };
        const go = d => () => { dir = d; if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
        offs.push(on(host, 'pointerenter', go(1)), on(host, 'pointerleave', go(0)), on(host, 'focusin', go(1)), on(host, 'focusout', go(0)));
      } else if (o.trigger === 'scroll') {
        let stop = null;
        offs.push(onVisible(el, v => {
          if (v && !stop) {
            stop = onScroll((y, h) => {
              const r = el.getBoundingClientRect();
              const q = clamp((clamp((h - r.top) / (h + r.height)) - 0.25) / 0.5) * (m - 1), i = Math.min(m - 2, Math.floor(q));
              return () => draw(i, e(q - i));
            });
          } else if (!v && stop) { stop(); stop = null; }
        }, '100px'));
        offs.push(() => stop && stop());
      } else {
        let acc = 0, t0 = 0;
        const cyc = o.pause + o.duration;
        const frame = now => {
          acc += now - t0; t0 = now;
          draw(Math.floor(acc / cyc) % m, e(clamp((acc % cyc - o.pause) / o.duration)));
          raf = requestAnimationFrame(frame);
        };
        offs.push(onVisible(el, v => { cancelAnimationFrame(raf); if (v) { t0 = performance.now(); raf = requestAnimationFrame(frame); } }));
      }
      offs.push(() => cancelAnimationFrame(raf));
    }
    el.classList.add('is-morphing');
    return () => {
      offs.forEach(f => f());
      if (isPath) { if (own) el.setAttribute('d', own); else el.removeAttribute('d'); } else path.remove();
      if (addVB) svg.removeAttribute('viewBox');
      el.classList.remove('is-morphing');
    };
  },
};
