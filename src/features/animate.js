/* animate — JS triggers for the CSS animation classes (hover/focus/active/load are pure CSS).
   <div class="spark-fade-in-up spark-scroll" data-spark-delay="100">…</div>   plays when scrolled into view
   <button class="btn spark-tada spark-click">Tap</button>                   plays on every click
   Wrap siblings in .spark-stagger (data-spark-stagger="80") to cascade delays of .spark-scroll/.spark-load items. */
import { onVisible, motionOK, on } from '../core.js';
import { stagger, staggerGroup } from './_stagger.js';

const ENTER = /\bspark-(fade-in|bounce-(in|up|down)|slide-|pop-in|rotate-in|scale-|zoom-in|flip-)/;

export default {
  name: 'animate',
  selector: '.spark-click,.spark-load,.spark-scroll',
  defaults: { delay: 0, once: true, threshold: 0.15, repeat: '' },
  init(el, o) {
    if (!motionOK()) return;
    const cl = el.classList, st = el.style, offs = [];
    const prevDelay = st.getPropertyValue('--spark-delay'), prevIter = st.getPropertyValue('--spark-iter');
    let delay = o.delay;
    const group = staggerGroup(el);
    if (group && !cl.contains('spark-click')) delay += stagger(group, '.spark-load,.spark-scroll', el);
    if (delay) st.setProperty('--spark-delay', delay + 'ms');
    if (o.repeat) st.setProperty('--spark-iter', o.repeat === 'infinite' || o.repeat === 'loop' ? 'infinite' : parseFloat(o.repeat) || 1);
    const play = () => { cl.remove('spark-anim-pending'); cl.remove('is-playing'); void el.offsetWidth; cl.add('is-playing'); };
    let stop = () => {};
    if (cl.contains('spark-click')) {
      offs.push(on(el, 'click', play), on(el, 'animationend', e => { if (e.target === el) cl.remove('is-playing'); }));
    } else if (cl.contains('spark-scroll')) {
      const enter = ENTER.test(el.className);
      if (enter) cl.add('spark-anim-pending');
      stop = onVisible(el, (vis, e) => {
        if (vis && (e.intersectionRatio >= o.threshold || e.intersectionRect.height >= innerHeight * 0.25)) {
          cl.remove('spark-anim-pending'); cl.add('is-playing');
          if (o.once) stop();
        } else if (!o.once && !vis) { cl.remove('is-playing'); if (enter) cl.add('spark-anim-pending'); }
      }, '0px', [0, o.threshold, 0.5, 1]);
    } else if (delay) { // .spark-load: restart so the stagger delay applies
      st.animation = 'none'; void el.offsetWidth; st.animation = '';
    }
    return () => {
      stop(); offs.forEach(f => f());
      cl.remove('spark-anim-pending', 'is-playing');
      if (prevDelay) st.setProperty('--spark-delay', prevDelay); else st.removeProperty('--spark-delay');
      if (prevIter) st.setProperty('--spark-iter', prevIter); else st.removeProperty('--spark-iter');
    };
  },
};
