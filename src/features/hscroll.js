/* hscroll — vertical scroll drives a pinned horizontal track.
   <section class="efx-hscroll"><div class="efx-hscroll__track"><div>panel</div><div>panel</div></div></section>
   Small screens / reduced motion: plain horizontal overflow scroll with snap, no pinning. */
import { onScroll, motionOK, on } from '../core.js';

export default {
  name: 'hscroll',
  selector: '.efx-hscroll',
  defaults: { offset: 0, snap: false },
  init(el, o) {
    const made = [];
    let track = [...el.children].find(c => c.classList.contains('efx-hscroll__track'));
    if (!track) {
      track = document.createElement('div');
      track.className = 'efx-hscroll__track';
      while (el.firstChild) track.appendChild(el.firstChild);
      el.appendChild(track);
      made.push(track);
    }
    const mq = matchMedia('(max-width: 767px)');
    const pinned = () => motionOK() && !mq.matches;
    let pin, saveH = '', off = [], timer = 0, W = 0, H = 0, dist = 0, stop = () => {};
    const teardown = () => {
      stop(); stop = () => {};
      off.forEach(f => f()); off = [];
      clearTimeout(timer);
      track.style.transform = track.style.willChange = '';
      if (pin) { el.style.height = saveH; if (pin.parentNode === el) el.insertBefore(track, pin); else el.appendChild(track); pin.remove(); pin = null; }
      el.classList.remove('efx-hscroll-on', 'efx-hscroll-native');
    };
    const measure = () => { // read phase: returns the write
      const vw = innerWidth, vh = innerHeight - o.offset;
      dist = Math.max(0, track.scrollWidth - vw);
      W = vw; H = vh;
      const h = (dist + vh) + 'px';
      return () => { el.style.height = h; };
    };
    const setup = () => {
      if (!pinned()) { el.classList.add('efx-hscroll-native'); return; }
      pin = document.createElement('div');
      pin.className = 'efx-hscroll__pin';
      pin.style.top = o.offset + 'px';
      pin.style.height = `calc(100vh - ${o.offset}px)`;
      el.insertBefore(pin, track);
      pin.appendChild(track);
      el.classList.add('efx-hscroll-on');
      track.style.willChange = 'transform';
      saveH = el.style.height;
      measure()();
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => measure()());
        ro.observe(track);
        off.push(() => ro.disconnect());
      }
      stop = onScroll((y, vh) => {
        const wm = innerWidth !== W || vh - o.offset !== H ? measure() : null;
        const top = el.getBoundingClientRect().top;
        const p = dist ? Math.min(1, Math.max(0, (o.offset - top) / dist)) : 0;
        if (o.snap) {
          clearTimeout(timer);
          if (p > 0 && p < 1) timer = setTimeout(() => {
            const kids = [...track.children], at = p * dist;
            let best = at, d = 1e9;
            kids.forEach(k => { const t = Math.min(dist, k.offsetLeft); if (Math.abs(t - at) < d) { d = Math.abs(t - at); best = t; } });
            scrollBy({ top: best - at, behavior: 'smooth' });
          }, 140);
        }
        return () => { wm && wm(); track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`; };
      });
    };
    const rebuild = () => { teardown(); setup(); };
    setup();
    const offMq = mq.addEventListener ? on(mq, 'change', rebuild) : () => {};
    return () => {
      offMq(); teardown();
      made.forEach(t => { while (t.firstChild) el.insertBefore(t.firstChild, t); t.remove(); });
    };
  },
};
