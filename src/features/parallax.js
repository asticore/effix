/* parallax — shift an element at a different speed than the page scroll.
   <div class="efx-parallax" data-efx-speed="0.3">…</div>
   <section class="efx-parallax" data-efx-bg style="background-image:url(…)">…</section>  (bg layer) */
import { onScroll, onVisible, motionOK } from '../core.js';

export default {
  name: 'parallax',
  selector: '.efx-parallax',
  defaults: { speed: 0.3, axis: 'y', bg: false },
  init(el, o) {
    if (!motionOK()) return;
    const x = o.axis === 'x';
    let target = el, layer, saved, vis = true, last = 0;
    if (o.bg) {
      const cs = getComputedStyle(el);
      saved = [el.style.backgroundImage, el.style.position, el.style.overflow, el.style.isolation];
      layer = document.createElement('div');
      layer.className = 'efx-parallax__bg';
      layer.setAttribute('aria-hidden', 'true');
      layer.style.cssText = `background-image:${cs.backgroundImage};background-size:${cs.backgroundSize === 'auto' ? 'cover' : cs.backgroundSize};background-position:${cs.backgroundPosition};background-repeat:${cs.backgroundRepeat}`;
      if (cs.position === 'static') el.style.position = 'relative';
      el.style.overflow = 'hidden';
      el.style.isolation = 'isolate';
      el.style.backgroundImage = 'none';
      el.insertBefore(layer, el.firstChild);
      target = layer;
    }
    target.style.willChange = 'transform';
    const stopVis = onVisible(el, v => { vis = v; }, '100px');
    const stop = onScroll(() => {
      if (!vis) return;
      const r = el.getBoundingClientRect();
      const c = o.bg ? (x ? r.left + r.width / 2 : r.top + r.height / 2) : (x ? r.left + r.width / 2 - last : r.top + r.height / 2 - last);
      const v = (x ? innerWidth : innerHeight) / 2;
      last = o.bg ? 0 : (c - v) * -o.speed;
      const d = o.bg ? (c - v) * -o.speed : last;
      target.style.transform = x ? `translate3d(${d.toFixed(1)}px,0,0)` : `translate3d(0,${d.toFixed(1)}px,0)`;
    });
    return () => {
      stop(); stopVis();
      target.style.transform = target.style.willChange = '';
      if (layer) {
        layer.remove();
        [el.style.backgroundImage, el.style.position, el.style.overflow, el.style.isolation] = saved;
      }
    };
  },
};
