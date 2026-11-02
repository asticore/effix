/* lazyimg — blur-up images, loaded when near the viewport.
   <img class="efx-lazyimg" src="tiny.jpg" data-efx-src="full.jpg" data-efx-srcset="…" alt="…">
   <div class="efx-lazyimg" data-efx-bg="full.jpg"></div>
   Tip: native `loading="lazy"` is enough when you don't need the blur-up. */
import { onVisible, motionOK } from '../core.js';

export default {
  name: 'lazyimg',
  selector: '.efx-lazyimg',
  defaults: { margin: '300px', blur: 12 },
  init(el, o) {
    const bg = el.dataset.efxBg, isImg = el.tagName === 'IMG';
    if (!isImg && !bg) return;
    const blur = motionOK();
    const prev = isImg ? [el.getAttribute('src'), el.getAttribute('srcset')] : el.style.backgroundImage;
    if (blur) { el.style.setProperty('--efx-blur', o.blur + 'px'); el.classList.add('is-lazy'); }
    let img = null;
    const stop = onVisible(el, v => {
      if (!v) return;
      stop();
      img = new Image();
      img.onload = () => {
        if (isImg) { el.srcset = el.dataset.efxSrcset || ''; if (el.dataset.efxSrc) el.src = el.dataset.efxSrc; if (!el.dataset.efxSrcset) el.removeAttribute('srcset'); }
        else el.style.backgroundImage = `url("${bg}")`;
        el.classList.add('is-loaded');
        el.classList.remove('is-lazy');
      };
      img.onerror = () => el.classList.add('is-error');
      if (isImg && el.dataset.efxSizes) img.sizes = el.dataset.efxSizes;
      if (isImg && el.dataset.efxSrcset) img.srcset = el.dataset.efxSrcset;
      img.src = isImg ? el.dataset.efxSrc || (el.dataset.efxSrcset || '').split(/[ ,]/)[0] : bg;
    }, o.margin);
    return () => {
      stop();
      if (img) img.onload = img.onerror = null;
      el.classList.remove('is-lazy', 'is-loaded', 'is-error');
      el.style.removeProperty('--efx-blur');
      if (isImg) { prev[0] == null ? el.removeAttribute('src') : el.setAttribute('src', prev[0]); prev[1] == null ? el.removeAttribute('srcset') : el.setAttribute('srcset', prev[1]); }
      else el.style.backgroundImage = prev;
    };
  },
};
