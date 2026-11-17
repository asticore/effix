/* marquee — infinite scrolling ticker.
   <div class="spark-marquee" data-spark-speed="60"><span>One</span><span>Two</span>…</div> */
import { onVisible, motionOK } from '../core.js';

export default {
  name: 'marquee',
  selector: '.spark-marquee',
  defaults: { speed: 60, direction: 'left', pause: true, gap: 32 },
  init(el, o) {
    const kids = [...el.childNodes];
    el.style.setProperty('--spark-gap', o.gap + 'px');
    if (!motionOK()) { el.classList.add('spark-marquee--static'); return () => { el.classList.remove('spark-marquee--static'); el.style.removeProperty('--spark-gap'); }; }
    const track = document.createElement('div');
    const g = document.createElement('div');
    track.className = 'spark-marquee__track';
    g.className = 'spark-marquee__group';
    kids.forEach(k => g.appendChild(k));
    track.appendChild(g);
    el.appendChild(track);
    el.classList.add('spark-marquee--on');
    el.classList.toggle('spark-marquee--pause', o.pause);
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
          c.setAttribute('data-spark-skip', '');
          c.setAttribute('inert', '');
          [c, ...c.querySelectorAll('[data-spark-ready],[data-spark-lazy]')].forEach(x => { x.removeAttribute('data-spark-ready'); x.removeAttribute('data-spark-lazy'); });
          c.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
          track.appendChild(c);
        }
        n = k;
      }
      track.style.setProperty('--spark-shift', `-${100 / k}%`);
      track.style.animationDuration = Math.max(1, w / Math.max(1, o.speed)) + 's';
    };
    build();
    const ro = typeof ResizeObserver !== 'undefined' && new ResizeObserver(build);
    ro && (ro.observe(el), ro.observe(g));
    const stop = onVisible(el, v => el.classList.toggle('is-paused', !v));
    return () => {
      ro && ro.disconnect(); stop();
      kids.forEach(k => el.insertBefore(k, track));
      track.remove();
      el.classList.remove('spark-marquee--on', 'spark-marquee--pause', 'is-paused');
      el.style.removeProperty('--spark-gap');
    };
  },
};
