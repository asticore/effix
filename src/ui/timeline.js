/* timeline — content timeline (not the chart): vertical, alternating or horizontal, icons, reveal on scroll.
   <ol class="spark-timeline" data-spark-layout="alternate">
     <li class="spark-timeline__item" data-spark-icon="★"><time class="spark-timeline__time">2024</time><div class="spark-timeline__body"><h4>Launch</h4><p>…</p></div></li>
   </ol>
   Content is visible without JS; items are only hidden after JS claims the list (and never when motion is reduced). */
import { onVisible, onScroll, motionOK } from '../core.js';
import { shineWidgets } from './_shine.js';

const LAYOUTS = ['vertical', 'alternate', 'horizontal'];

export default {
  name: 'timeline',
  selector: '.spark-timeline',
  defaults: { layout: 'vertical', reveal: true, progress: false, threshold: 0.2 },
  init(el, o) {
    const items = [...el.querySelectorAll(':scope > .spark-timeline__item')];
    if (!items.length) return;
    const layout = LAYOUTS.includes(o.layout) ? o.layout : 'vertical';
    const cls0 = el.getAttribute('class'), role0 = el.getAttribute('role');
    const added = [], shClass = [], offs = [], saved = items.map(i => i.getAttribute('role'));
    const sh = shineWidgets(); // Shine's .timeline / .timeline-alt / .timeline-horizontal do the layout
    el.classList.add('spark-timeline--on');
    if (sh) el.classList.add('timeline', ...(layout === 'alternate' ? ['timeline-alt'] : layout === 'horizontal' ? ['timeline-horizontal'] : [])); else el.classList.add('spark-timeline--own', 'spark-timeline--' + layout);
    if (el.tagName !== 'OL' && el.tagName !== 'UL') el.setAttribute('role', 'list');
    items.forEach(it => {
      if (it.tagName !== 'LI') it.setAttribute('role', 'listitem');
      const m = document.createElement('span');
      m.className = 'spark-timeline__marker' + (sh ? ' timeline-marker' : ''); m.setAttribute('aria-hidden', 'true');
      if (it.dataset.sparkIcon) m.textContent = it.dataset.sparkIcon; else m.classList.add('is-dot');
      if (sh) {
        it.classList.add('timeline-item'); shClass.push(it);
        it.querySelectorAll(':scope > .spark-timeline__time').forEach(x => { x.classList.add('timeline-date'); shClass.push(x); });
        it.querySelectorAll(':scope > .spark-timeline__body').forEach(x => { x.classList.add('timeline-body'); shClass.push(x); });
      }
      it.prepend(m); added.push(m);
    });
    if (o.reveal && motionOK()) {
      el.classList.add('spark-timeline--reveal');
      items.forEach((it, i) => {
        it.style.setProperty('--i', i % 6);
        it.classList.add('spark-timeline__pending');
        offs.push(onVisible(it, (v, e) => { if (!v) return; it.classList.remove('spark-timeline__pending'); it.classList.add('is-in'); }, '0px 0px -8% 0px', o.threshold));
      });
    }
    if (o.progress && !sh && layout !== 'horizontal') {
      // the line fills from the first marker to the viewport middle
      offs.push(onScroll((y, h) => {
        const r = el.getBoundingClientRect(), p = Math.max(0, Math.min(1, (h / 2 - r.top) / (r.height || 1)));
        return () => el.style.setProperty('--spark-timeline-progress', p.toFixed(3));
      }));
    }
    return () => {
      offs.forEach(f => f());
      added.forEach(m => m.remove());
      items.forEach((it, i) => {
        it.classList.remove('spark-timeline__pending', 'is-in'); it.style.removeProperty('--i');
        saved[i] === null ? it.removeAttribute('role') : it.setAttribute('role', saved[i]);
      });
      el.style.removeProperty('--spark-timeline-progress');
      shClass.forEach(x => x.classList.remove('timeline-item', 'timeline-date', 'timeline-body'));
      cls0 === null ? el.removeAttribute('class') : el.setAttribute('class', cls0);
      role0 === null ? el.removeAttribute('role') : el.setAttribute('role', role0);
    };
  },
};
