/* collapse — smooth open/close for native <details> (Shine accordions).
   <details class="efx-collapse">…</details>   or a container: every <details> inside is animated.
   Exclusive groups (name="x") animate the closing panel too. Reduced motion = native instant toggle. */
import { on, motionOK } from '../core.js';

const names = new Map(); // details -> name attribute removed during an exclusive swap

export default {
  name: 'collapse',
  selector: '.efx-collapse',
  defaults: { duration: 300, easing: 'ease' },
  init(el, o) {
    const list = el.matches('details') ? [el] : [...el.querySelectorAll('details')];
    const anim = new Map(); // details -> { a, to, saved }
    const closedH = d => {
      const cs = getComputedStyle(d), s = d.querySelector(':scope > summary');
      return (s ? s.getBoundingClientRect().bottom : d.getBoundingClientRect().top) - d.getBoundingClientRect().top + parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth);
    };
    const run = (d, to) => {
      const h0 = d.offsetHeight, prev = anim.get(d);
      if (prev) prev.a.cancel();
      if (to) d.open = true;
      const h1 = to ? d.offsetHeight : closedH(d), s = d.style;
      const saved = prev ? prev.saved : [s.overflow, s.boxSizing];
      s.overflow = 'hidden'; s.boxSizing = 'border-box';
      const a = d.animate({ height: [h0 + 'px', h1 + 'px'] }, { duration: o.duration, easing: o.easing });
      const rec = { a, to, saved };
      anim.set(d, rec);
      return a.finished.then(() => {
        if (anim.get(d) !== rec) return 0;
        anim.delete(d);
        [s.overflow, s.boxSizing] = saved;
        if (!to) d.open = false;
        return 1;
      }, () => 0);
    };
    const click = e => {
      const d = e.currentTarget.parentElement;
      if (!motionOK() || e.target.closest('a[href]')) return;
      e.preventDefault();
      const to = anim.has(d) ? !anim.get(d).to : !d.open, jobs = [];
      const name = d.getAttribute('name');
      const others = to && name ? [...document.querySelectorAll(`details[name="${CSS.escape(name)}"][open]`)].filter(x => x !== d) : [];
      if (others.length) {
        // Browser auto-closes group siblings instantly: lift the name while both panels animate.
        [d, ...others].forEach(x => { names.set(x, name); x.removeAttribute('name'); });
        others.forEach(x => jobs.push(run(x, false)));
      }
      jobs.push(run(d, to));
      if (others.length) Promise.all(jobs).then(() => [d, ...others].forEach(x => { if (names.has(x)) { x.setAttribute('name', names.get(x)); names.delete(x); } }));
    };
    // Programmatic toggles mid-animation win: drop our animation so state and height agree.
    const toggled = e => {
      const rec = anim.get(e.target);
      if (rec && e.target.open !== rec.to && !(rec.to === false && e.target.open)) { rec.a.cancel(); anim.delete(e.target); }
    };
    const offs = list.map(d => {
      const s = d.querySelector(':scope > summary');
      return [s && on(s, 'click', click), on(d, 'toggle', toggled)];
    }).flat().filter(Boolean);
    return () => {
      offs.forEach(f => f());
      anim.forEach((rec, d) => { rec.a.cancel(); d.open = rec.to; [d.style.overflow, d.style.boxSizing] = rec.saved; });
      anim.clear();
      names.forEach((n, d) => d.setAttribute('name', n));
      names.clear();
    };
  },
};
