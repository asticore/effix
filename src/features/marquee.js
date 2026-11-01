/* marquee — infinite scrolling ticker.
   <div class="efx-marquee" data-efx-speed="60"><span>One</span><span>Two</span>…</div> */
import { onVisible, motionOK } from '../core.js';

export default {
  name: 'marquee',
  selector: '.efx-marquee',
  defaults: { speed: 60, direction: 'left', pause: true, gap: 32 },
  init(el, o) {
    const kids = [...el.childNodes];
    el.style.setProperty('--efx-gap', o.gap + 'px');
    if (!motionOK()) { el.classList.add('efx-marquee--static'); return () => { el.classList.remove('efx-marquee--static'); el.style.removeProperty('--efx-gap'); }; }
    const track = document.createElement('div');
    const g = document.createElement('div');
    track.className = 'efx-marquee__track';
    g.className = 'efx-marquee__group';
    kids.forEach(k => g.appendChild(k));
    track.appendChild(g);
    el.appendChild(track);
    el.classList.add('efx-marquee--on');
    el.classList.toggle('efx-marquee--pause', o.pause);
    if (o.direction === 'right') track.style.animationDirection = 'reverse';
    let n = 0;
    const build = () => {
      const w = g.offsetWidth;
      if (!w) return;
      const k = Math.max(2, Math.ceil((el.clientWidth * 2) / w));
      if (k !== n) {
        while (track.children.length > 1) track.lastChild.remove();
        for (let i = 1; i < k; i++) {
          const c = g.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');
          c.setAttribute('data-efx-skip', '');
          c.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
          track.appendChild(c);
        }
        n = k;
      }
      track.style.setProperty('--efx-shift', `-${100 / k}%`);
      track.style.animationDuration = Math.max(1, w / Math.max(1, o.speed)) + 's';
    };
    build();
    const ro = typeof ResizeObserver !== 'undefined' && new ResizeObserver(build);
    ro && ro.observe(el);
    const stop = onVisible(el, v => el.classList.toggle('is-paused', !v));
    return () => {
      ro && ro.disconnect(); stop();
      kids.forEach(k => el.insertBefore(k, track));
      track.remove();
      el.classList.remove('efx-marquee--on', 'efx-marquee--pause', 'is-paused');
      el.style.removeProperty('--efx-gap');
    };
  },
};
