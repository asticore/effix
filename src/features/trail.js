/* trail — images / shapes spawn along the pointer path inside an element, then fade out.
   <section class="efx-trail" data-efx-images="a.jpg|b.jpg|c.jpg">…</section>
   <ul class="efx-trail" data-efx-mode="hover"><li data-efx-image="a.jpg">Link</li></ul>   (floating preview) */
import { on, onVisible, motionOK, finePointer, add, get } from '../core.js';

/* shapes: fn(size, arg) -> DOM node shown inside the pooled item (data-efx-shape="name:arg"). dot and ring are CSS-only. */
add('trail-shape', 'emoji', (s, a) => { const e = document.createElement('span'); e.textContent = a || '✨'; e.style.fontSize = s * .5 + 'px'; return e; });

const subs = new Set();
let docOff = null;
const subscribe = fn => {
  subs.add(fn);
  if (!docOff) docOff = on(document, 'pointermove', e => subs.forEach(f => f(e)), { passive: true });
  return () => { subs.delete(fn); if (!subs.size && docOff) { docOff(); docOff = null; } };
};
/* position:static hosts get inline position:relative, refcounted across instances */
const posRef = new WeakMap();
const hold = el => {
  const n = posRef.get(el) || 0;
  if (!n && getComputedStyle(el).position === 'static') { el.style.position = 'relative'; posRef.set(el, 1); }
  else if (posRef.has(el)) posRef.set(el, n + 1);
};
const release = el => {
  const n = posRef.get(el);
  if (!n) return;
  if (n === 1) { el.style.position = ''; posRef.delete(el); } else posRef.set(el, n - 1);
};

export default {
  name: 'trail',
  selector: '.efx-trail',
  defaults: { images: [], spacing: 80, life: 900, size: 140, rotate: 12, max: 12, shape: '', mode: 'trail' },
  init(el, o) {
    if (!finePointer() || !motionOK()) return;
    hold(el);
    const layer = document.createElement('div');
    layer.className = 'efx-trail__layer';
    layer.setAttribute('aria-hidden', 'true');
    el.append(layer);
    const hover = o.mode === 'hover';
    const rnd = d => (Math.random() * 2 - 1) * d;
    const mkItem = () => {
      const n = document.createElement('div');
      n.className = 'efx-trail__item';
      n.setAttribute('aria-hidden', 'true');
      layer.append(n);
      return n;
    };
    let unsub = null, stopVis = () => {};
    let cleanupMode;

    if (hover) {
      const pv = mkItem();
      pv.classList.add('efx-trail__item--preview');
      pv.style.setProperty('--efx-trail-size', o.size + 'px');
      let on_ = false;
      const handle = e => {
        const r = el.getBoundingClientRect(), t = e.target.closest && e.target.closest('[data-efx-image]');
        const src = t && el.contains(t) ? t.dataset.efxImage : '';
        if (!src) { if (on_) { on_ = false; pv.classList.remove('is-on'); } return; }
        if (pv.dataset.src !== src) { pv.dataset.src = src; pv.style.backgroundImage = 'url("' + src.replace(/["\\]/g, '') + '")'; }
        pv.style.translate = (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px';
        if (!on_) { on_ = true; pv.classList.add('is-on'); }
      };
      const offLeave = on(el, 'pointerleave', () => { on_ = false; pv.classList.remove('is-on'); });
      stopVis = onVisible(el, v => {
        if (v && !unsub) unsub = subscribe(handle);
        else if (!v && unsub) { unsub(); unsub = null; on_ = false; pv.classList.remove('is-on'); }
      });
      cleanupMode = offLeave;
    } else {
      const imgs = o.images, pool = [], shape = imgs.length ? '' : (o.shape || 'dot');
      let k = 0, last = null;
      const spawn = (x, y) => {
        let n = pool[k];
        if (!n) { n = pool[k] = mkItem(); }
        k = (k + 1) % Math.max(1, o.max);
        if (n._a) n._a.cancel();
        n.className = 'efx-trail__item' + (shape ? ' efx-trail__item--' + shape.split(':')[0] : '');
        n.style.width = n.style.height = o.size + 'px';
        n.style.backgroundImage = '';
        n.textContent = '';
        if (imgs.length) n.style.backgroundImage = 'url("' + imgs[(Math.random() * imgs.length) | 0].replace(/["\\]/g, '') + '")';
        else if (shape) { const [k, ...a] = shape.split(':'), fn = get('trail-shape', k); if (fn) n.append(fn(o.size, a.join(':'))); }
        const t = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%) rotate(' + rnd(o.rotate).toFixed(1) + 'deg)';
        n._a = n.animate([
          { opacity: 0, transform: t + ' scale(.6)' },
          { opacity: 1, transform: t + ' scale(1)', offset: 0.2 },
          { opacity: 0, transform: t + ' scale(.3)' },
        ], { duration: o.life, easing: 'ease-out', fill: 'both' });
      };
      const handle = e => {
        const r = el.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { last = null; return; }
        const x = e.clientX - r.left, y = e.clientY - r.top;
        if (last && Math.hypot(x - last.x, y - last.y) < o.spacing) return;
        last = { x, y };
        spawn(x, y);
      };
      stopVis = onVisible(el, v => {
        if (v && !unsub) unsub = subscribe(handle);
        else if (!v && unsub) { unsub(); unsub = null; last = null; }
      });
      cleanupMode = () => pool.forEach(n => n._a && n._a.cancel());
    }
    return () => {
      stopVis(); unsub && unsub(); cleanupMode && cleanupMode();
      layer.remove(); release(el);
    };
  },
};
