/* lazyimg — blur-up images, loaded when near the viewport.
   <img class="spark-lazyimg" src="tiny.jpg" data-spark-src="full.jpg" data-spark-srcset="…" alt="…">
   <div class="spark-lazyimg" data-spark-bg="full.jpg"></div>
   Tip: native `loading="lazy"` is enough when you don't need the blur-up. */
import { onVisible, motionOK } from '../core.js';

export default {
  name: 'lazyimg',
  selector: '.spark-lazyimg',
  defaults: { margin: '300px', blur: 12 },
  init(el, o) {
    const bg = el.dataset.sparkBg, isImg = el.tagName === 'IMG';
    if (!isImg && !bg) return;
    const blur = motionOK();
    const prev = isImg ? [el.getAttribute('src'), el.getAttribute('srcset')] : el.style.backgroundImage;
    if (blur) { el.style.setProperty('--spark-blur', o.blur + 'px'); el.classList.add('is-lazy'); }
    let img = null;
    const stop = onVisible(el, v => {
      if (!v) return;
      stop();
      img = new Image();
      img.onload = () => {
        if (isImg) { el.srcset = el.dataset.sparkSrcset || ''; if (el.dataset.sparkSrc) el.src = el.dataset.sparkSrc; if (!el.dataset.sparkSrcset) el.removeAttribute('srcset'); }
        else el.style.backgroundImage = `url("${bg}")`;
        el.classList.add('is-loaded');
        el.classList.remove('is-lazy');
      };
      img.onerror = () => el.classList.add('is-error');
      if (isImg && el.dataset.sparkSizes) img.sizes = el.dataset.sparkSizes;
      if (isImg && el.dataset.sparkSrcset) img.srcset = el.dataset.sparkSrcset;
      img.src = isImg ? el.dataset.sparkSrc || (el.dataset.sparkSrcset || '').split(/[ ,]/)[0] : bg;
    }, o.margin);
    return () => {
      stop();
      if (img) img.onload = img.onerror = null;
      el.classList.remove('is-lazy', 'is-loaded', 'is-error');
      el.style.removeProperty('--spark-blur');
      if (isImg) { prev[0] == null ? el.removeAttribute('src') : el.setAttribute('src', prev[0]); prev[1] == null ? el.removeAttribute('srcset') : el.setAttribute('srcset', prev[1]); }
      else el.style.backgroundImage = prev;
    };
  },
};
