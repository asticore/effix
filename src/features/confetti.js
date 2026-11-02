/* confetti — burst of confetti from an element (shared full-viewport canvas, created lazily).
   <button class="btn efx-confetti">Celebrate</button>
   trigger: click | view | done (listens for efx:done). Any element can dispatch a bubbling
   new CustomEvent('efx:confetti', {bubbles:true, detail:{count:120}}) to burst from itself. */
import { on, onVisible, motionOK, themeColor, cssVar, add, get } from '../core.js';

/* shapes: fn(ctx, size, piece) paints centered on 0,0 with fillStyle set (feature translates/rotates). Extend: add('confetti-shape', name, fn) */
add('confetti-shape', {
  square: (c, s) => c.fillRect(-s / 2, -s / 2, s, s),
  circle: (c, s) => { c.beginPath(); c.arc(0, 0, s / 2, 0, 7); c.fill(); },
  strip: (c, s) => c.fillRect(-s / 2, -s / 6, s, s / 3),
});

let cv = null, ctx = null, ps = [], raf = 0, dpr = 1;
const rnd = (a, b) => a + Math.random() * (b - a);
const draw = () => {
  raf = 0;
  ctx.clearRect(0, 0, cv.width, cv.height);
  ps = ps.filter(p => {
    p.vy += 0.35 * p.g; p.vx *= 0.985; p.vy *= 0.985;
    p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
    if (p.life <= 0 || p.y > innerHeight + 20) return false;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life / 25);
    ctx.translate(p.x * dpr, p.y * dpr);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    const s = p.s * dpr;
    (get('confetti-shape', p.shape) || get('confetti-shape', 'square'))(ctx, s, p);
    ctx.restore();
    return true;
  });
  if (ps.length) raf = requestAnimationFrame(draw);
  else { cv.remove(); cv = ctx = null; }
};
const burst = (x, y, o, colors) => {
  if (!cv) {
    cv = document.createElement('canvas');
    cv.className = 'efx-confetti__canvas';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483000';
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx = cv.getContext('2d');
    document.body.append(cv);
  }
  const shapes = o.shapes.length ? o.shapes : ['square'];
  const spread = o.spread * Math.PI / 180;
  const count = Math.min(500, Math.max(0, o.count | 0));
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + rnd(-spread / 2, spread / 2), v = o.velocity * rnd(0.4, 1);
    ps.push({ x, y, vx: Math.cos(a) * v / 2, vy: Math.sin(a) * v / 2, g: o.gravity, rot: rnd(0, 6.28), vr: rnd(-0.3, 0.3),
      s: rnd(6, 11), life: (rnd(70, 120)) | 0, c: colors[(Math.random() * colors.length) | 0], shape: shapes[(Math.random() * shapes.length) | 0] });
  }
  if (!raf) raf = requestAnimationFrame(draw);
};
/* one shared document listener for efx:confetti (any element, event must bubble) */
let refs = 0, docOff = null;
const DEF = { count: 80, spread: 70, velocity: 45, gravity: 1, colors: [], shapes: ['square', 'circle', 'strip'], origin: '' };
const palette = (el, o) => {
  if (o.colors.length) return o.colors;
  const c = [themeColor(el)];
  for (const [n, f] of [['--sh-accent', '#db2777'], ['--sh-success', '#15803d'], ['--sh-warning', '#b45309'], ['--sh-danger', '#dc2626']]) c.push(cssVar(el, n, f));
  return c;
};
const fire = (el, o, e) => {
  if (!motionOK()) { el.animate && el.animate({ scale: [1, 1.06, 1] }, 220); return; }
  const r = el.getBoundingClientRect();
  let x = r.left + r.width / 2, y = r.top + r.height / 2;
  if (o.origin) { const [ox, oy] = o.origin.split(/[ ,]+/).map(parseFloat); if (ox === ox && oy === oy) { x = ox / 100 * innerWidth; y = oy / 100 * innerHeight; } }
  else if (e && e.type === 'click' && e.clientX) { x = e.clientX; y = e.clientY; }
  burst(x, y, o, palette(el, o));
};
const onEvt = e => {
  const d = e.detail || {}, o = { ...DEF, ...d };
  if (typeof o.colors === 'string') o.colors = o.colors.split('|');
  const t = e.target instanceof Element ? e.target : null;
  if (t) fire(t, o);
  else if (motionOK()) burst(innerWidth / 2, innerHeight / 2, o, palette(document.documentElement, o));
};

export default {
  name: 'confetti',
  selector: '.efx-confetti',
  defaults: { trigger: 'click', count: 80, spread: 70, velocity: 45, gravity: 1, colors: [], shapes: ['square', 'circle', 'strip'], origin: '' },
  init(el, o) {
    if (!refs++) docOff = on(document, 'efx:confetti', onEvt);
    const offs = [() => { if (!--refs && docOff) { docOff(); docOff = null; } }];
    let stopVis = () => {};
    if (o.trigger === 'done') offs.push(on(el, 'efx:done', () => fire(el, o)));
    else if (o.trigger === 'view') {
      stopVis = onVisible(el, v => { if (v) { fire(el, o); stopVis(); } }, '0px', 0.5);
    } else offs.push(on(el, 'click', e => fire(el, o, e)));
    return () => { stopVis(); offs.forEach(f => f()); };
  },
};
