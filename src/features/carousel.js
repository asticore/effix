/* carousel — buttons, dots, keyboard, autoplay and fade mode for Shine's .carousel (the scroll-snap track).
   <div class="carousel efx-carousel" data-efx-autoplay="5000" tabindex="0" aria-label="Gallery">
     <div>Slide 1</div><div>Slide 2</div></div> */
import { on, onVisible, motionOK } from '../core.js';

export default {
  name: 'carousel',
  selector: '.efx-carousel',
  defaults: { autoplay: 0, loop: true, dots: true, arrows: true, perView: 0, fade: false },
  init(el, o) {
    const slides = [...el.children], n = slides.length;
    if (!n) return;
    const reduce = !motionOK();
    const auto = o.autoplay > 0 && !reduce;
    const act = new Set(), offs = [];
    let cur = 0, timer = 0, paused = false, hover = false, seen = true;
    const btn = (cls, label, txt) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = cls; b.setAttribute('aria-label', label); if (txt) b.textContent = txt;
      return b;
    };
    const nav = document.createElement('div');
    nav.className = 'efx-carousel__nav';
    const prev = btn('btn btn-icon btn-ghost efx-carousel__prev', 'Previous slide', '‹');
    const next = btn('btn btn-icon btn-ghost efx-carousel__next', 'Next slide', '›');
    const dots = slides.map((_, i) => btn('efx-carousel__dot', `Go to slide ${i + 1}`));
    const dotBox = document.createElement('div');
    dotBox.className = 'efx-carousel__dots';
    if (o.arrows) nav.appendChild(prev);
    if (o.dots) { dotBox.append(...dots); nav.appendChild(dotBox); }
    if (o.arrows) nav.appendChild(next);
    let pause;
    if (auto) {
      pause = btn('btn btn-icon btn-ghost efx-carousel__pause', 'Pause autoplay', '⏸');
      nav.appendChild(pause);
    }
    if (nav.children.length) el.after(nav);

    if (o.fade) el.classList.add('efx-carousel-fade');
    if (o.perView > 0 && !o.fade) {
      el.style.setProperty('--efx-per-view', o.perView);
      slides.forEach(s => { s.style.flexBasis = 'calc(100% / var(--efx-per-view))'; });
    }

    const mark = () => {
      slides.forEach((s, i) => s.classList.toggle('is-active', act.has(i)));
      dots.forEach((d, i) => { if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    };
    const go = i => {
      i = Math.max(0, Math.min(n - 1, i));
      if (o.fade) { act.clear(); act.add(i); cur = i; mark(); return; }
      const r = slides[i].getBoundingClientRect().left - el.getBoundingClientRect().left;
      el.scrollTo({ left: el.scrollLeft + r, behavior: reduce ? 'instant' : 'smooth' });
    };
    const atEnd = () => o.fade ? cur >= n - 1 : el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    const goNext = () => { if (atEnd()) { if (o.loop) go(0); } else go(cur + 1); };
    const goPrev = () => { if (cur <= 0) { if (o.loop) go(n - 1); } else go(cur - 1); };

    const sched = () => {
      clearTimeout(timer);
      if (auto && !paused && !hover && seen) timer = setTimeout(() => { goNext(); sched(); }, o.autoplay);
    };
    offs.push(on(prev, 'click', () => { goPrev(); sched(); }), on(next, 'click', () => { goNext(); sched(); }));
    dots.forEach((d, i) => offs.push(on(d, 'click', () => { go(i); sched(); })));
    offs.push(on(el, 'keydown', e => {
      if (e.target !== el || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); sched(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); sched(); }
    }));
    if (auto) {
      const hov = v => () => { hover = v; sched(); };
      for (const t of [el, nav]) {
        offs.push(on(t, 'pointerenter', hov(true)), on(t, 'pointerleave', hov(false)), on(t, 'focusin', hov(true)), on(t, 'focusout', hov(false)));
      }
      offs.push(on(pause, 'click', () => {
        paused = !paused;
        pause.textContent = paused ? '▶' : '⏸';
        pause.setAttribute('aria-label', paused ? 'Play autoplay' : 'Pause autoplay');
        sched();
      }));
      offs.push(onVisible(el, v => { seen = v; sched(); }));
    }
    let io;
    if (o.fade) { act.add(0); mark(); }
    else if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(es => {
        es.forEach(e => { const i = slides.indexOf(e.target); if (e.isIntersecting) act.add(i); else act.delete(i); });
        if (act.size) cur = Math.min(...act);
        mark();
      }, { root: el, threshold: 0.6 });
      slides.forEach(s => io.observe(s));
    }
    sched();
    return () => {
      clearTimeout(timer);
      offs.forEach(f => f());
      io && io.disconnect();
      nav.remove();
      el.classList.remove('efx-carousel-fade');
      el.style.removeProperty('--efx-per-view');
      slides.forEach(s => { s.classList.remove('is-active'); s.style.flexBasis = ''; });
    };
  },
};
