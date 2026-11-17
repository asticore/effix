/* lottie — small dotLottie / Lottie player. The player library is NOT bundled: it is fetched on demand,
   only when a .spark-lottie element nears the viewport (lazy), so pages without one pay nothing.
   <div class="spark-lottie" data-spark-src="/anim/hero.lottie" data-spark-trigger="visible" style="width:240px"></div>
   Triggers: auto · visible (play in view, pause out) · hover · click · scroll (scrub with scroll position).
   Reduced motion: shows one still frame, never plays. Any content inside the element stays as the fallback until it is ready.
   Player: window.DotLottie, else Spark.add('lottie-lib', 'default', () => import('…')), else data-spark-lib (ES module URL exporting DotLottie). */
import { on, onVisible, onScroll, motionOK, get } from '../core.js';

const LIB = 'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0/+esm';
let libP = null;
const loadLib = url => libP || (libP = (async () => {
  if (window.DotLottie) return window.DotLottie;
  const custom = get('lottie-lib', 'default');
  const mod = custom ? await custom() : await import(/* @vite-ignore */ url);
  return mod.DotLottie || (mod.default && mod.default.DotLottie) || mod.default;
})().catch(e => { libP = null; throw e; }));

export default {
  name: 'lottie',
  selector: '.spark-lottie',
  lazy: true,
  defaults: { src: '', autoplay: true, loop: true, speed: 1, trigger: 'auto', still: 0, lib: LIB, label: '' },
  init(el, o) {
    if (!o.src) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'spark-lottie__canvas';
    el.append(canvas);
    const a0 = ['role', 'aria-label'].map(a => [a, el.getAttribute(a)]);
    if (o.label) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', o.label); } else canvas.setAttribute('aria-hidden', 'true');
    const offs = [];
    let dead = false, player = null, ready = false, inView = true;
    const reduced = !motionOK(), trig = ['auto', 'visible', 'hover', 'click', 'scroll'].includes(o.trigger) ? o.trigger : 'auto';
    const total = () => Math.max(1, player.totalFrames || 1);

    const start = () => {
      if (dead || !ready) return;
      const still = Math.min(1, Math.max(0, o.still));
      if (reduced) { player.setFrame(Math.round(still * (total() - 1))); return; }
      if (trig === 'auto') { if (o.autoplay) player.play(); else player.setFrame(Math.round(still * (total() - 1))); }
      else if (trig === 'visible') {
        offs.push(onVisible(el, v => { inView = v; if (v) player.play(); else player.pause(); }, '0px', 0.25));
      } else if (trig === 'hover') {
        player.setFrame(Math.round(still * (total() - 1)));
        offs.push(on(el, 'pointerenter', () => player.play()), on(el, 'pointerleave', () => player.pause()));
      } else if (trig === 'click') {
        player.setFrame(Math.round(still * (total() - 1)));
        offs.push(on(el, 'click', () => { if (player.isPlaying) player.pause(); else player.play(); }));
      } else if (trig === 'scroll') {
        offs.push(onScroll((y, h) => {
          const r = el.getBoundingClientRect(), p = Math.min(1, Math.max(0, (h - r.top) / (h + r.height)));
          return () => player.setFrame(p * (total() - 1));
        }));
      }
    };

    loadLib(o.lib).then(DotLottie => {
      if (dead) return;
      player = new DotLottie({ canvas, src: o.src, autoplay: false, loop: o.loop && !reduced, speed: o.speed, renderConfig: { autoResize: true } });
      const done = () => {
        if (dead || ready) return;
        ready = true; el.classList.add('is-ready');
        el.dispatchEvent(new CustomEvent('spark:ready', { bubbles: true }));
        start();
      };
      player.addEventListener('load', done);
      player.addEventListener('loadError', () => { if (!dead) el.classList.add('is-error'); });
      player.addEventListener('complete', () => el.dispatchEvent(new CustomEvent('spark:done', { bubbles: true })));
    }).catch(e => { if (!dead) { el.classList.add('is-error'); console.warn('[spark] lottie player failed to load', e); } });

    return () => {
      dead = true; offs.forEach(f => f());
      try { player && player.destroy(); } catch (e) {}
      canvas.remove(); el.classList.remove('is-ready', 'is-error');
      a0.forEach(([a, v]) => v === null ? el.removeAttribute(a) : el.setAttribute(a, v));
    };
  },
};
