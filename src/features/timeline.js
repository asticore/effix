/* timeline — content timeline (not the chart): vertical, alternating or horizontal, icons, reveal on scroll.
   <ol class="efx-timeline" data-efx-layout="alternate">
     <li class="efx-timeline__item" data-efx-icon="★"><time class="efx-timeline__time">2024</time><div class="efx-timeline__body"><h4>Launch</h4><p>…</p></div></li>
   </ol>
   Content is visible without JS; items are only hidden after JS claims the list (and never when motion is reduced). */
import { on, onVisible, onScroll, motionOK } from '../core.js';

const LAYOUTS = ['vertical', 'alternate', 'horizontal'];

export default {
  name: 'timeline',
  selector: '.efx-timeline',
  defaults: { layout: 'vertical', reveal: true, progress: false, threshold: 0.2 },
  init(el, o) {
    const items = [...el.querySelectorAll(':scope > .efx-timeline__item')];
    if (!items.length) return;
    const layout = LAYOUTS.includes(o.layout) ? o.layout : 'vertical';
    const cls0 = el.getAttribute('class'), role0 = el.getAttribute('role');
    const added = [], offs = [], saved = items.map(i => i.getAttribute('role'));
    el.classList.add('efx-timeline--on', 'efx-timeline--' + layout);
    if (el.tagName !== 'OL' && el.tagName !== 'UL') el.setAttribute('role', 'list');
    items.forEach(it => {
      if (it.tagName !== 'LI') it.setAttribute('role', 'listitem');
      const m = document.createElement('span');
      m.className = 'efx-timeline__marker'; m.setAttribute('aria-hidden', 'true');
      if (it.dataset.efxIcon) m.textContent = it.dataset.efxIcon; else m.classList.add('is-dot');
      it.prepend(m); added.push(m);
    });
    if (o.reveal && motionOK()) {
      el.classList.add('efx-timeline--reveal');
      items.forEach((it, i) => {
        it.style.setProperty('--i', i % 6);
        it.classList.add('efx-timeline__pending');
        offs.push(onVisible(it, (v, e) => { if (!v) return; it.classList.remove('efx-timeline__pending'); it.classList.add('is-in'); }, '0px 0px -8% 0px', o.threshold));
      });
    }
    if (o.progress && layout !== 'horizontal') {
      // the line fills from the first marker to the viewport middle
      offs.push(onScroll((y, h) => {
        const r = el.getBoundingClientRect(), p = Math.max(0, Math.min(1, (h / 2 - r.top) / (r.height || 1)));
        return () => el.style.setProperty('--efx-timeline-progress', p.toFixed(3));
      }));
    }
    return () => {
      offs.forEach(f => f());
      added.forEach(m => m.remove());
      items.forEach((it, i) => {
        it.classList.remove('efx-timeline__pending', 'is-in'); it.style.removeProperty('--i');
        saved[i] === null ? it.removeAttribute('role') : it.setAttribute('role', saved[i]);
      });
      el.style.removeProperty('--efx-timeline-progress');
      cls0 === null ? el.removeAttribute('class') : el.setAttribute('class', cls0);
      role0 === null ? el.removeAttribute('role') : el.setAttribute('role', role0);
    };
  },
};
