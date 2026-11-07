/* animate — JS triggers for the CSS animation classes (hover/focus/active/load are pure CSS).
   <div class="efx-fade-in-up efx-scroll" data-efx-delay="100">…</div>   plays when scrolled into view
   <button class="btn efx-tada efx-click">Tap</button>                   plays on every click
   Wrap siblings in .efx-stagger (data-efx-stagger="80") to cascade delays of .efx-scroll/.efx-load items. */
import { onVisible, motionOK, on } from '../core.js';
import { stagger, staggerGroup } from './_stagger.js';

const ENTER = /\befx-(fade-in|bounce-(in|up|down)|slide-|pop-in|rotate-in|scale-|zoom-in|flip-)/;

export default {
  name: 'animate',
  selector: '.efx-click,.efx-load,.efx-scroll',
  defaults: { delay: 0, once: true, threshold: 0.15, repeat: '' },
  init(el, o) {
    if (!motionOK()) return;
    const cl = el.classList, st = el.style, offs = [];
    const prevDelay = st.getPropertyValue('--efx-delay'), prevIter = st.getPropertyValue('--efx-iter');
    let delay = o.delay;
    const group = staggerGroup(el);
    if (group && !cl.contains('efx-click')) delay += stagger(group, '.efx-load,.efx-scroll', el);
    if (delay) st.setProperty('--efx-delay', delay + 'ms');
    if (o.repeat) st.setProperty('--efx-iter', o.repeat === 'infinite' || o.repeat === 'loop' ? 'infinite' : parseFloat(o.repeat) || 1);
    const play = () => { cl.remove('efx-anim-pending'); cl.remove('is-playing'); void el.offsetWidth; cl.add('is-playing'); };
    let stop = () => {};
    if (cl.contains('efx-click')) {
      offs.push(on(el, 'click', play), on(el, 'animationend', e => { if (e.target === el) cl.remove('is-playing'); }));
    } else if (cl.contains('efx-scroll')) {
      const enter = ENTER.test(el.className);
      if (enter) cl.add('efx-anim-pending');
      stop = onVisible(el, (vis, e) => {
        if (vis && (e.intersectionRatio >= o.threshold || e.intersectionRect.height >= innerHeight * 0.25)) {
          cl.remove('efx-anim-pending'); cl.add('is-playing');
          if (o.once) stop();
        } else if (!o.once && !vis) { cl.remove('is-playing'); if (enter) cl.add('efx-anim-pending'); }
      }, '0px', [0, o.threshold, 0.5, 1]);
    } else if (delay) { // .efx-load: restart so the stagger delay applies
      st.animation = 'none'; void el.offsetWidth; st.animation = '';
    }
    return () => {
      stop(); offs.forEach(f => f());
      cl.remove('efx-anim-pending', 'is-playing');
      if (prevDelay) st.setProperty('--efx-delay', prevDelay); else st.removeProperty('--efx-delay');
      if (prevIter) st.setProperty('--efx-iter', prevIter); else st.removeProperty('--efx-iter');
    };
  },
};
