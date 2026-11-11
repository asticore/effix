/* reel — HTML scene sequencer (showreel / product-launch film).
   <div class="efx-reel" data-efx-loop>
     <section class="efx-reel__scene" data-efx-duration="3000" data-efx-transition="slide">…</section> …
   Plays scenes in order, one visible at a time; entering a scene re-runs Effix features inside it.
   Controls, clickable progress segments, ←/→/Space, pauses offscreen. Emits efx:scene {index}. */
import Effix, { onVisible, motionOK, on, cssVar } from '../core.js';

const snap = (n, attrs) => { const o = attrs.map(a => [a, n.getAttribute(a)]); return () => o.forEach(([a, v]) => v == null ? n.removeAttribute(a) : n.setAttribute(a, v)); };
const ms = v => { const n = parseFloat(v); return /ms\s*$/.test(v) || !/s\s*$/.test(v) ? n || 600 : n * 1000; };

export default {
  name: 'reel',
  selector: '.efx-reel',
  defaults: { autoplay: true, loop: false, controls: true, duration: 3000, transition: 'fade' },
  init(el, o) {
    const scenes = [...el.children].filter(c => c.matches('.efx-reel__scene,[data-efx-scene]'));
    const n = scenes.length;
    if (!n) return;
    const calm = !motionOK();
    const undo = [snap(el, ['role', 'aria-roledescription', 'aria-label', 'tabindex'])];
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
    el.classList.add('is-reel');
    if (calm) el.classList.add('is-manual');
    el.setAttribute('role', 'group');
    el.setAttribute('aria-roledescription', 'scene sequence');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Scenes');
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    const dur = s => Math.max(200, parseFloat(s.dataset.efxDuration) || o.duration);
    scenes.forEach((s, i) => {
      undo.push(snap(s, ['role', 'aria-roledescription', 'aria-label', 'aria-hidden', 'inert']));
      s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'scene');
      s.setAttribute('aria-label', `${i + 1} of ${n}`);
      s.setAttribute('aria-hidden', 'true'); s.inert = true;
    });
    const live = document.createElement('span');
    live.className = 'efx-reel__live'; live.setAttribute('aria-live', 'polite');
    el.appendChild(live);
    let bar, btn; const segs = [];
    if (o.controls) {
      bar = document.createElement('div'); bar.className = 'efx-reel__controls';
      btn = document.createElement('button'); btn.type = 'button'; btn.className = 'efx-reel__play';
      bar.appendChild(btn);
      scenes.forEach((s, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'efx-reel__seg';
        b.setAttribute('aria-label', `Go to scene ${i + 1} of ${n}`);
        b.style.setProperty('--efx-d', dur(s) + 'ms');
        b.innerHTML = '<span class="efx-reel__fill"></span>';
        b.onclick = () => go(i, true);
        segs.push(b); bar.appendChild(b);
      });
      el.appendChild(bar);
    }
    let idx = -1, want = o.autoplay && !calm, vis = false, tab = !document.hidden, timer = 0, t0 = 0, left = 0, leaving = null, leaveT = 0;
    const running = () => want && vis && tab;
    const halt = () => { if (timer) { clearTimeout(timer); timer = 0; left -= performance.now() - t0; } };
    const sync = () => {
      halt();
      const r = running();
      el.classList.toggle('is-paused', !r);
      if (btn) {
        btn.setAttribute('aria-label', want ? 'Pause' : 'Play');
        btn.classList.toggle('is-on', want);
      }
      if (r) { t0 = performance.now(); timer = setTimeout(() => { timer = 0; step(); }, Math.max(0, left)); }
    };
    const step = () => {
      if (idx + 1 < n || o.loop) go((idx + 1) % n);
      else { want = false; left = 0; sync(); }
    };
    function go(i, manual) {
      i = ((i % n) + n) % n;
      if (i === idx) return;
      const dir = i > idx ? 1 : -1, s = scenes[i], prev = scenes[idx];
      const type = calm ? 'cut' : s.dataset.efxTransition || o.transition;
      el.style.setProperty('--efx-dir', dir);
      clearTimeout(leaveT);
      if (leaving) leaving.className = leaving.className.replace(/\s?(is-leave|t-\w+)/g, '');
      scenes.forEach(x => x.classList.remove('is-enter'));
      if (prev) {
        prev.classList.remove('is-active'); prev.inert = true; prev.setAttribute('aria-hidden', 'true');
        if (type !== 'cut') {
          prev.classList.add('is-leave', 't-' + type); leaving = prev;
          leaveT = setTimeout(() => { prev.classList.remove('is-leave', 't-' + type); leaving = null; }, ms(cssVar(el, '--efx-reel-t', '600ms')) + 50);
        }
      }
      idx = i;
      s.classList.add('is-active', 't-' + type);
      if (prev && type !== 'cut') s.classList.add('is-enter');
      s.inert = false; s.removeAttribute('aria-hidden');
      el.classList.remove('is-first'); if (i === 0) el.classList.add('is-first');
      segs.forEach((b, k) => {
        b.classList.toggle('is-current', k === i); b.classList.toggle('is-done', k < i);
        if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        if (k === i) { const f = b.firstChild; f.style.animation = 'none'; void f.offsetWidth; f.style.animation = ''; }
      });
      halt(); left = dur(s);
      Effix.refresh(s);
      if (manual || !running()) live.textContent = `Scene ${i + 1} of ${n}`;
      el.dispatchEvent(new CustomEvent('efx:scene', { detail: { index: i }, bubbles: true }));
      sync();
    }
    const toggle = () => { if (!want && idx === n - 1 && !o.loop) { want = true; idx = -1; go(0); return; } want = !want; sync(); };
    const offs = [
      on(el, 'keydown', e => {
        if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
        const k = e.key;
        if (k === 'ArrowRight') go(idx + 1, true);
        else if (k === 'ArrowLeft') go(idx - 1, true);
        else if (k === ' ' && !e.target.closest('button')) toggle();
        else return;
        e.preventDefault();
      }),
      on(document, 'visibilitychange', () => { tab = !document.hidden; sync(); }),
    ];
    btn && (btn.onclick = toggle);
    const stop = onVisible(el, v => { vis = v; sync(); });
    go(0);
    return () => {
      stop(); offs.forEach(f => f()); halt(); clearTimeout(leaveT);
      bar && bar.remove(); live.remove();
      scenes.forEach(s => s.classList.remove('is-active', 'is-enter', 'is-leave', 't-fade', 't-slide', 't-wipe', 't-zoom', 't-cut'));
      undo.reverse().forEach(f => f());
      el.classList.remove('is-reel', 'is-manual', 'is-paused', 'is-first');
      el.style.removeProperty('--efx-dir');
      if (restorePos) el.style.position = '';
    };
  },
};
