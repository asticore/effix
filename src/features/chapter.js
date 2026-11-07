/* chapter — current-section chip: shows the title of the section in view, text slides up on change, optional progress ring.
   <a class="efx-chapter" href="#" data-efx-sections="section[data-efx-title]"></a>   title = data-efx-title or the section's first heading.
   Links to the current section on click. aria-live="polite". data-efx-ring="false" hides the ring. */
import { onVisible, onScroll, motionOK, on } from '../core.js';

const NS = 'http://www.w3.org/2000/svg';
const titleOf = s => s.dataset.efxTitle || (s.querySelector('h1,h2,h3,h4,h5,h6') || {}).textContent || '';

export default {
  name: 'chapter',
  selector: '.efx-chapter',
  defaults: { sections: 'section[data-efx-title]', ring: true },
  init(el, o) {
    const secs = [...document.querySelectorAll(o.sections)];
    if (!secs.length) return;
    const prevLive = el.getAttribute('aria-live'), prevHref = el.getAttribute('href');
    if (!prevLive) el.setAttribute('aria-live', 'polite');
    el.classList.add('efx-chapter-on', 'is-empty');
    const nodes = [];
    const add = (tag, cls, ns) => { const n = ns ? document.createElementNS(NS, tag) : document.createElement(tag); n.setAttribute('class', cls); nodes.push(n); return n; };
    const text = add('span', 'efx-chapter__text');
    let circle = null;
    if (o.ring) {
      const svg = add('svg', 'efx-chapter__ring', 1);
      svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
      const bg = add('circle', 'efx-chapter__track', 1); circle = add('circle', 'efx-chapter__bar', 1);
      [bg, circle].forEach(c => { c.setAttribute('cx', 12); c.setAttribute('cy', 12); c.setAttribute('r', 9); c.setAttribute('pathLength', 100); svg.append(c); });
      el.append(svg);
    }
    el.append(text);
    const seen = new Set();
    let cur = null, label = null;
    const set = s => {
      if (s === cur) return;
      cur = s;
      el.classList.toggle('is-empty', !s);
      if (!s) return;
      const t = titleOf(s).trim();
      if (s.id && el.tagName === 'A') el.setAttribute('href', '#' + s.id);
      if (t === (label && label.textContent)) return;
      const n = document.createElement('span');
      n.textContent = t;
      const old = label;
      label = n; text.append(n);
      if (old && motionOK()) {
        const o2 = { duration: 400, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' };
        n.animate([{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], o2);
        old.style.position = 'absolute';
        old.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }], o2).onfinish = () => old.remove();
      } else if (old) old.remove();
    };
    const pick = () => set(secs.filter(s => seen.has(s)).pop() || null);
    const stops = secs.map(s => onVisible(s, v => { v ? seen.add(s) : seen.delete(s); pick(); }, '-45% 0px -45% 0px'));
    const stopScroll = circle && onScroll((y, vh) => {
      if (!cur) return;
      const r = cur.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh / 2 - r.top) / (r.height || 1)));
      return () => circle.setAttribute('stroke-dashoffset', (100 - p * 100).toFixed(1));
    });
    const offClick = on(el, 'click', e => {
      if (!cur || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      cur.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
    });
    return () => {
      stops.forEach(f => f()); stopScroll && stopScroll(); offClick();
      nodes.forEach(n => n.remove());
      [...text.children].forEach(n => n.remove());
      el.classList.remove('efx-chapter-on', 'is-empty');
      prevLive === null ? el.removeAttribute('aria-live') : el.setAttribute('aria-live', prevLive);
      prevHref === null ? el.removeAttribute('href') : el.setAttribute('href', prevHref);
    };
  },
};
