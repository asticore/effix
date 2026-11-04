/* mask — cursor spotlight reveal. Base image is greyscale, a colour copy shows through a circle at the pointer.
   <div class="efx-mask"><img src="a.jpg" alt="…"><img class="efx-mask__reveal" src="b.jpg" alt=""></div>
   (no .efx-mask__reveal = a colour copy of the base image). Touch / keyboard: tap or Enter toggles full reveal. */
import { on, rafThrottle, finePointer, motionOK } from '../core.js';

export default {
  name: 'mask',
  selector: '.efx-mask',
  defaults: { radius: 120, soft: 0.4, gray: true },
  init(el, o) {
    const base = el.querySelector('img');
    if (!base) return;
    let reveal = el.querySelector('.efx-mask__reveal'), made = false;
    if (!reveal) {
      reveal = base.cloneNode();
      reveal.className = 'efx-mask__reveal';
      reveal.alt = '';
      reveal.removeAttribute('id');
      reveal.removeAttribute('loading');
      el.appendChild(reveal);
      made = true;
    }
    reveal.setAttribute('aria-hidden', 'true');
    const prev = { role: el.getAttribute('role'), tab: el.getAttribute('tabindex'), label: el.getAttribute('aria-label') };
    el.classList.add('efx-mask-on');
    base.classList.toggle('efx-mask__base', o.gray);
    el.style.setProperty('--efx-soft', String(Math.min(0.99, Math.max(0, o.soft))));
    el.style.setProperty('--efx-r', '0px');
    el.style.setProperty('--efx-x', '50%');
    el.style.setProperty('--efx-y', '50%');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-pressed', 'false');
    if (!prev.label) el.setAttribute('aria-label', base.alt || 'Reveal image');
    let r = 0, target = 0, raf = 0;
    const anim = () => {
      r += (target - r) * (motionOK() ? 0.18 : 1);
      if (Math.abs(target - r) < 0.5) r = target;
      el.style.setProperty('--efx-r', r.toFixed(1) + 'px');
      raf = r === target ? 0 : requestAnimationFrame(anim);
    };
    const grow = v => { target = v; if (!raf) raf = requestAnimationFrame(anim); };
    const move = rafThrottle(e => {
      const b = el.getBoundingClientRect();
      el.style.setProperty('--efx-x', e.clientX - b.left + 'px');
      el.style.setProperty('--efx-y', e.clientY - b.top + 'px');
    });
    const toggle = () => { const v = !el.classList.contains('is-full'); el.classList.toggle('is-full', v); el.setAttribute('aria-pressed', String(v)); };
    const offs = [
      on(el, 'click', toggle),
      on(el, 'keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }),
    ];
    if (finePointer()) offs.push(
      on(el, 'pointerenter', e => { if (e.pointerType === 'touch') return; move(e); grow(o.radius); }),
      on(el, 'pointermove', e => e.pointerType !== 'touch' && move(e)),
      on(el, 'pointerleave', () => grow(0)));
    return () => {
      offs.forEach(f => f());
      move.cancel();
      cancelAnimationFrame(raf);
      if (made) reveal.remove(); else reveal.removeAttribute('aria-hidden');
      base.classList.remove('efx-mask__base');
      el.classList.remove('efx-mask-on', 'is-full');
      ['--efx-soft', '--efx-r', '--efx-x', '--efx-y'].forEach(v => el.style.removeProperty(v));
      ['role', 'tabindex', 'aria-pressed', 'aria-label'].forEach(a => el.removeAttribute(a));
      if (prev.role) el.setAttribute('role', prev.role);
      if (prev.tab) el.setAttribute('tabindex', prev.tab);
      if (prev.label) el.setAttribute('aria-label', prev.label);
    };
  },
};
