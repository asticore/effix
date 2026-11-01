/* border — animated borders for any element (Shine .btn, .card, …).
   <button class="btn efx-border-spin" data-efx-colors="#f0f|#0ff|#f0f">Save</button>
   <button class="btn efx-border-trace" data-efx-loading="click" data-efx-timeout="3000">Send</button>
   loading: click -> animates while .is-loading; stop with el.dispatchEvent(new Event('efx:done')). */
import { onVisible, motionOK, on } from '../core.js';

export default {
  name: 'border',
  selector: '.efx-border-spin,.efx-border-trace,.efx-border-glow,.efx-border-gradient',
  defaults: { colors: [], speed: 0, width: 0, loading: '', timeout: 0 },
  init(el, o) {
    const st = el.style, cl = el.classList, offs = [];
    if (o.colors.length) st.setProperty('--efx-border-colors', o.colors.join(','));
    if (o.speed > 0) st.setProperty('--efx-border-speed', o.speed + 's');
    if (o.width > 0) st.setProperty('--efx-border-width', o.width + 'px');
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
      }), on(el, 'efx:done', stop));
    }
    if (ok) offs.push(onVisible(el, v => { vis = v; sync(); }));
    sync();
    return () => {
      offs.forEach(f => f()); clearTimeout(t);
      if (busy) restoreAria();
      if (restorePos) st.position = '';
      cl.remove('is-paused', 'is-static', 'is-loading'); el.removeAttribute('aria-busy');
      ['--efx-border-colors', '--efx-border-speed', '--efx-border-width'].forEach(p => st.removeProperty(p));
    };
  },
};
