/* feed — animated list: children appear one by one (notifications / activity).
   <div class="efx-feed stack" data-efx-max="4" data-efx-interval="1500">…items…</div>
   order newest = new item enters at the top and pushes the rest down; append = enters at the bottom. */
import { onVisible, motionOK, on } from '../core.js';

const TR = ['height', 'opacity', 'margin', 'padding', 'border-width'].map(p => p + ' .45s ease').join(',');

export default {
  name: 'feed',
  selector: '.efx-feed',
  defaults: { interval: 1500, max: 4, loop: true, order: 'newest' },
  init(el, o) {
    const items = [...el.children], n = items.length;
    const css = items.map(i => i.getAttribute('style'));
    const reset = (it, k = items.indexOf(it)) => { it.hidden = false; css[k] == null ? it.removeAttribute('style') : it.setAttribute('style', css[k]); };
    const restore = () => { items.forEach(it => reset(it)); el.append(...items); };
    if (!n) return;
    const max = Math.max(1, o.max | 0);
    if (!motionOK() || n < 2) { items.forEach((it, k) => { it.hidden = k >= max; }); return restore; }

    const newest = o.order !== 'append', lim = Math.min(max, n - 1);
    const shown = [], timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    const collapse = s => { s.overflow = 'hidden'; s.height = '0'; s.opacity = '0'; s.marginBlock = s.paddingBlock = s.borderBlockWidth = '0'; };
    const enter = it => {
      it.remove(); reset(it);
      newest ? el.prepend(it) : el.append(it);
      const h = it.offsetHeight, s = it.style;
      s.transition = 'none'; collapse(s); it.offsetHeight;
      s.transition = TR; s.height = h + 'px'; s.opacity = s.marginBlock = s.paddingBlock = s.borderBlockWidth = '';
      later(() => shown.includes(it) && reset(it), 500);
    };
    const leave = it => {
      const s = it.style;
      s.overflow = 'hidden'; s.height = it.offsetHeight + 'px'; s.transition = 'none'; it.offsetHeight;
      s.transition = TR; collapse(s);
      later(() => { if (!shown.includes(it)) { it.remove(); reset(it); } }, 500);
    };
    items.forEach(it => it.remove());
    el.append(items[0]); shown.push(items[0]);
    let idx = 1, timer = 0, vis = true, hid = document.hidden;
    const tick = () => {
      timer = 0;
      if (idx >= n) { if (!o.loop) return; idx = 0; }
      const it = items[idx++];
      newest ? shown.unshift(it) : shown.push(it);
      enter(it);
      while (shown.length > lim) leave(newest ? shown.pop() : shown.shift());
      run();
    };
    const run = () => { if (vis && !hid && !timer) timer = setTimeout(tick, o.interval); };
    const halt = () => { clearTimeout(timer); timer = 0; };
    const offs = [
      onVisible(el, v => { vis = v; v ? run() : halt(); }),
      on(document, 'visibilitychange', () => { hid = document.hidden; hid ? halt() : run(); }),
    ];
    run();
    return () => { halt(); timers.forEach(clearTimeout); offs.forEach(f => f()); restore(); };
  },
};
