/* dim — hover/focus one child of a list or grid and the siblings dim; optional floating image preview.
   <ul class="efx-dim"><li data-efx-image="a.jpg">Project</li>…</ul>   data-efx-opacity=".35" data-efx-blur="2" data-efx-items=".row" data-efx-preview="false"
   The hovered child gets .is-hovered. Keyboard focus-within works; touch never dims. */
import { on, finePointer, motionOK } from '../core.js';

const posRef = new WeakMap();
export default {
  name: 'dim',
  selector: '.efx-dim',
  defaults: { opacity: .35, blur: 0, preview: true, items: '' },
  init(el, o) {
    const kids = () => o.items ? [...el.querySelectorAll(o.items)] : [...el.children].filter(c => !c.classList.contains('efx-dim__preview'));
    const s = el.style, saved = [s.getPropertyValue('--efx-dim-opacity'), s.getPropertyValue('--efx-dim-blur')];
    if (!el.style.getPropertyValue('--efx-dim-opacity')) s.setProperty('--efx-dim-opacity', o.opacity);
    if (o.blur) s.setProperty('--efx-dim-blur', o.blur + 'px');
    el.classList.add('efx-dim-on');
    const fine = finePointer();
    let cur = null, pv = null, restorePos = false, ptr = 0, shown = '';
    if (o.preview && fine && motionOK()) {
      if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restorePos = true; }
      pv = document.createElement('div');
      pv.className = 'efx-dim__preview';
      pv.setAttribute('aria-hidden', 'true');
      el.append(pv);
    }
    const itemOf = t => { const k = kids(); let n = t instanceof Element ? t : null; while (n && n.parentElement !== el && !k.includes(n)) n = n.parentElement; return n && k.includes(n) ? n : null; };
    const set = it => {
      if (it === cur) return;
      if (cur) cur.classList.remove('is-hovered');
      cur = it;
      el.classList.toggle('efx-dim-active', !!it);
      if (it) it.classList.add('is-hovered');
      if (pv) {
        const src = it && it.dataset.efxImage;
        pv.classList.toggle('is-on', !!src && ptr);
        if (src && shown !== src) { shown = src; pv.style.backgroundImage = 'url("' + src.replace(/["\\]/g, '') + '")'; }
      }
    };
    const move = e => {
      if (e.pointerType === 'touch') return;
      ptr = 1;
      set(itemOf(e.target));
      if (pv && cur && cur.dataset.efxImage) {
        const r = el.getBoundingClientRect();
        pv.style.translate = (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px';
        pv.classList.add('is-on');
      }
    };
    const offs = [
      on(el, 'pointermove', move),
      on(el, 'pointerover', move),
      on(el, 'pointerleave', e => { if (e.pointerType === 'touch') return; ptr = 0; pv && pv.classList.remove('is-on'); set(el.contains(document.activeElement) && document.activeElement.matches(':focus-visible') ? itemOf(document.activeElement) : null); }),
      on(el, 'focusin', e => { try { if (e.target.matches(':focus-visible')) { ptr = 0; pv && pv.classList.remove('is-on'); set(itemOf(e.target)); } } catch (_) {} }),
      on(el, 'focusout', e => { if (!e.relatedTarget || !el.contains(e.relatedTarget)) { if (!el.matches(':hover')) set(null); } }),
    ];
    return () => {
      offs.forEach(f => f());
      if (cur) cur.classList.remove('is-hovered');
      el.classList.remove('efx-dim-on', 'efx-dim-active');
      saved[0] ? s.setProperty('--efx-dim-opacity', saved[0]) : s.removeProperty('--efx-dim-opacity');
      saved[1] ? s.setProperty('--efx-dim-blur', saved[1]) : s.removeProperty('--efx-dim-blur');
      pv && pv.remove();
      if (restorePos) el.style.position = '';
    };
  },
};
