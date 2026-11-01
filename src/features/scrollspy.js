/* scrollspy — highlight the nav link whose section is in view.
   <nav class="efx-scrollspy"><a href="#intro">Intro</a><a href="#usage">Usage</a></nav> */
import { onVisible, motionOK, on } from '../core.js';

const byHash = h => {
  let id = h.slice(1);
  try { id = decodeURIComponent(id); } catch (e) { /* keep raw id */ }
  return h.length > 1 && document.getElementById(id);
};

export default {
  name: 'scrollspy',
  selector: '.efx-scrollspy',
  defaults: { offset: 80, activeClass: 'is-active', smooth: true },
  init(el, o) {
    const links = [...el.querySelectorAll('a[href^="#"]')];
    const items = links.map(a => [a, byHash(a.hash)]).filter(i => i[1]);
    const seen = new Set();
    const tabbed = new Map(); // targets we gave tabindex=-1 -> previous attribute (or null)
    let cur;
    const set = a => {
      if (a === cur) return;
      links.forEach(l => { l.classList.toggle(o.activeClass, l === a); l === a ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current'); });
      cur = a;
    };
    const stops = items.map(([a, sec]) => onVisible(sec, v => {
      v ? seen.add(a) : seen.delete(a);
      const hit = items.find(i => seen.has(i[0]));
      if (hit) set(hit[0]);
    }, `-${o.offset}px 0px -55% 0px`));
    const restore = t => { if (!tabbed.has(t)) return; const p = tabbed.get(t); tabbed.delete(t); p === null ? t.removeAttribute('tabindex') : t.setAttribute('tabindex', p); };
    const off = o.smooth && on(el, 'click', e => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      const it = a && items.find(i => i[0] === a);
      if (!it || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      const t = it[1];
      scrollTo({ top: t.getBoundingClientRect().top + scrollY - o.offset + 1, behavior: motionOK() ? 'smooth' : 'auto' });
      history.replaceState(null, '', a.hash);
      if (!t.matches('a[href],button,input,select,textarea,[tabindex]') && !tabbed.has(t)) {
        tabbed.set(t, t.getAttribute('tabindex'));
        t.setAttribute('tabindex', '-1');
        t.addEventListener('blur', () => restore(t), { once: true });
      }
      t.focus({ preventScroll: true });
    });
    return () => {
      stops.forEach(s => s()); off && off();
      [...tabbed.keys()].forEach(restore);
      links.forEach(l => { l.classList.remove(o.activeClass); l.removeAttribute('aria-current'); });
    };
  },
};
