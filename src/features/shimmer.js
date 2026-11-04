/* shimmer — reveal real content once it is ready; skeleton shimmer until then.
   <div class="efx-shimmer" data-efx-until="#photo" style="min-height:8rem"><img id="photo" src="…"></div>
   <div class="efx-shimmer" data-efx-for="2000">…content…</div>   (until + for: whichever comes first)
   Pure-CSS skeletons need no JS: .efx-shimmer, .efx-shimmer-text, .efx-shimmer-btn, .efx-skeleton-line|circle|rect */
import { on, motionOK } from '../core.js';

export default {
  name: 'shimmer',
  selector: '.efx-shimmer[data-efx-until],.efx-shimmer[data-efx-for]',
  defaults: { until: '', for: 0 },
  init(el, o) {
    const offs = [];
    let timer = 0, done = false;
    const prevBusy = el.getAttribute('aria-busy');
    el.classList.add('is-loading');
    el.setAttribute('aria-busy', 'true');
    const ready = () => {
      if (done) return;
      done = true;
      clearTimeout(timer); offs.forEach(f => f()); offs.length = 0;
      el.classList.remove('is-loading');
      el.classList.add('is-ready');
      if (motionOK()) {
        el.classList.add('is-fading');
        const end = () => el.classList.remove('is-fading');
        offs.push(on(el, 'animationend', end, { once: true }));
      }
      el.setAttribute('aria-busy', 'false');
    };
    const targets = o.until ? [...document.querySelectorAll(o.until)] : [];
    const pending = targets.filter(t => !(t.tagName === 'IMG' ? t.complete : t.readyState === 4 || t.readyState === 'complete'));
    if (o.until && !pending.length && targets.length) ready();
    else {
      let left = pending.length;
      pending.forEach(t => ['load', 'error', 'loadeddata', 'efx:ready'].forEach(ev => offs.push(on(t, ev, () => { if (--left <= 0) ready(); }, { once: true }))));
      if (o.for > 0) timer = setTimeout(ready, o.for);
      else if (!pending.length) timer = setTimeout(ready, 0); // nothing to wait for
    }
    return () => {
      done = true; clearTimeout(timer); offs.forEach(f => f());
      el.classList.remove('is-loading', 'is-ready', 'is-fading');
      if (prevBusy === null) el.removeAttribute('aria-busy'); else el.setAttribute('aria-busy', prevBusy);
    };
  },
};
