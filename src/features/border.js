/* border — animated borders for any element (Shine .btn, .card, …).
   <button class="btn spark-border-spin" data-spark-colors="#f0f|#0ff|#f0f">Save</button>
   <button class="btn spark-border-trace" data-spark-loading="click" data-spark-timeout="3000">Send</button>
   Also: spark-border-wipe (draws on hover/focus), spark-border-pulse (expanding ring).
   loading: click -> animates while .is-loading; stop with el.dispatchEvent(new Event('spark:done')). */
import { onVisible, motionOK, on } from '../core.js';

export default {
  name: 'border',
  selector: '.spark-border-spin,.spark-border-trace,.spark-border-glow,.spark-border-gradient,.spark-border-wipe,.spark-border-pulse',
  defaults: { colors: [], speed: 0, width: 0, loading: '', timeout: 0 },
  init(el, o) {
    const st = el.style, cl = el.classList, offs = [];
    if (o.colors.length) st.setProperty('--spark-border-colors', o.colors.join(','));
    if (o.speed > 0) st.setProperty('--spark-border-speed', o.speed + 's');
    if (o.width > 0) st.setProperty('--spark-border-width', o.width + 'px');
    let restorePos = false;
    if (getComputedStyle(el).position === 'static') { st.position = 'relative'; restorePos = true; }
    const ok = motionOK();
    if (!ok) cl.add('is-static');
    const gated = o.loading === 'click';
    let vis = true, busy = false, t = 0, wasAria = null;
    const sync = () => cl.toggle('is-paused', !ok || !vis || (gated && !busy));
    // aria-disabled (not [disabled]) keeps keyboard focus on the button while it is busy
    const restoreAria = () => {
      if (wasAria === null) el.removeAttribute('aria-disabled'); else el.setAttribute('aria-disabled', wasAria);
    };
    const stop = () => {
      if (!busy) return;
      busy = false; clearTimeout(t);
      cl.remove('is-loading'); el.removeAttribute('aria-busy');
      restoreAria();
      sync();
    };
    if (gated) {
      offs.push(on(el, 'click', e => {
        if (busy) { e.preventDefault(); e.stopImmediatePropagation(); return; }
        busy = true; wasAria = el.getAttribute('aria-disabled');
        cl.add('is-loading'); el.setAttribute('aria-busy', 'true'); el.setAttribute('aria-disabled', 'true');
        if (o.timeout > 0) t = setTimeout(stop, o.timeout);
        sync();
      }), on(el, 'spark:done', stop));
    }
    if (ok) offs.push(onVisible(el, v => { vis = v; sync(); }));
    sync();
    return () => {
      offs.forEach(f => f()); clearTimeout(t);
      if (busy) restoreAria();
      if (restorePos) st.position = '';
      cl.remove('is-paused', 'is-static', 'is-loading'); el.removeAttribute('aria-busy');
      ['--spark-border-colors', '--spark-border-speed', '--spark-border-width'].forEach(p => st.removeProperty(p));
    };
  },
};
