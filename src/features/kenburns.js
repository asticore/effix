/* kenburns — slow pan/zoom. On an <img>, or a wrapper with several <img> = crossfading slideshow.
   <div class="efx-kenburns"><img src="a.jpg" alt=""><img src="b.jpg" alt=""></div>
   Random origin/direction per image (CSS vars --efx-kb-*). Pauses off-screen; reduced motion = static first image. */
import { onVisible, motionOK } from '../core.js';

const rnd = m => ((Math.random() * 2 - 1) * m).toFixed(2) + '%';
export default {
  name: 'kenburns',
  selector: '.efx-kenburns',
  defaults: { duration: 12000, zoom: 1.15 },
  init(el, o) {
    let host = el, frame = null;
    const single = el.tagName === 'IMG';
    if (single) {
      frame = document.createElement('span');
      frame.className = 'efx-kenburns__frame';
      el.parentNode.insertBefore(frame, el);
      frame.appendChild(el);
      host = frame;
    }
    const imgs = single ? [el] : [...el.querySelectorAll('img')];
    if (!imgs.length) return;
    const live = motionOK(), multi = imgs.length > 1;
    const m = Math.max(0, (o.zoom - 1) / (2 * o.zoom) * 100);
    host.classList.add('efx-kenburns-on');
    if (!live) host.classList.add('is-static');
    host.style.setProperty('--efx-kb-duration', o.duration + (multi ? 1000 : 0) + 'ms');
    host.style.setProperty('--efx-kb-zoom', String(o.zoom));
    if (multi) host.classList.add('is-slides');
    imgs.forEach(im => { im.classList.add('efx-kenburns__img'); ['x0', 'y0', 'x1', 'y1'].forEach(k => im.style.setProperty('--efx-kb-' + k, rnd(m))); });
    let i = 0, timer = 0;
    const show = n => {
      imgs.forEach((im, j) => { im.classList.toggle('is-active', j === n); im.classList.toggle('is-leaving', j === i && j !== n); });
      if (multi) imgs.forEach(im => { if (im.classList.contains('is-active')) { ['x0', 'y0', 'x1', 'y1'].forEach(k => im.style.setProperty('--efx-kb-' + k, rnd(m))); } });
      i = n;
    };
    show(0);
    const tick = () => { timer = setTimeout(() => { show((i + 1) % imgs.length); tick(); }, o.duration); };
    const stop = live ? onVisible(host, v => {
      host.classList.toggle('is-paused', !v);
      clearTimeout(timer);
      if (v && multi) tick();
    }) : () => {};
    return () => {
      stop();
      clearTimeout(timer);
      host.classList.remove('efx-kenburns-on', 'is-static', 'is-slides', 'is-paused');
      ['--efx-kb-duration', '--efx-kb-zoom'].forEach(v => host.style.removeProperty(v));
      imgs.forEach(im => { im.classList.remove('efx-kenburns__img', 'is-active', 'is-leaving'); ['x0', 'y0', 'x1', 'y1'].forEach(k => im.style.removeProperty('--efx-kb-' + k)); });
      if (frame) { frame.parentNode.insertBefore(el, frame); frame.remove(); }
    };
  },
};
