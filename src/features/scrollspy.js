/* scrollspy — highlight the nav link whose section is in view.
   <nav class="efx-scrollspy"><a href="#intro">Intro</a><a href="#usage">Usage</a></nav> */
import { onVisible, motionOK, on } from '../core.js';

export default {
  name: 'scrollspy',
  selector: '.efx-scrollspy',
  defaults: { offset: 80, activeClass: 'is-active', smooth: true },
  init(el, o) {
    const links = [...el.querySelectorAll('a[href^="#"]')];
    const items = links.map(a => [a, a.hash.length > 1 && document.getElementById(decodeURIComponent(a.hash.slice(1)))]).filter(i => i[1]);
    const seen = new Set();
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
    const off = o.smooth && on(el, 'click', e => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      const it = a && items.find(i => i[0] === a);
      if (!it || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      scrollTo({ top: it[1].getBoundingClientRect().top + scrollY - o.offset + 1, behavior: motionOK() ? 'smooth' : 'auto' });
      history.pushState(null, '', a.hash);
    });
    return () => {
      stops.forEach(s => s()); off && off();
      links.forEach(l => { l.classList.remove(o.activeClass); l.removeAttribute('aria-current'); });
    };
  },
};
