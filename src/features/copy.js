/* copy — copy text to the clipboard.
   <button class="btn efx-copy" data-efx-target="#code">Copy</button>   or   data-efx-text="literal" */
import { on } from '../core.js';

const fallback = text => {
  const t = document.createElement('textarea');
  t.value = text; t.setAttribute('readonly', '');
  t.style.cssText = 'position:fixed;top:0;opacity:0';
  document.body.appendChild(t); t.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  t.remove();
  return ok;
};

export default {
  name: 'copy',
  selector: '.efx-copy',
  defaults: { target: '', text: '', done: 'Copied!', duration: 1800 },
  init(el, o) {
    const html = el.innerHTML;
    const live = document.createElement('span');
    live.className = 'efx-copy__live';
    live.setAttribute('aria-live', 'polite');
    el.after(live);
    let timer = 0;
    const off = on(el, 'click', async () => {
      let text = o.text;
      if (!text && o.target) {
        const t = document.querySelector(o.target);
        text = t ? ('value' in t ? t.value : t.textContent) : '';
      }
      if (!text) return;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { ok = fallback(text); }
      if (!ok) return;
      el.textContent = o.done;
      el.classList.add('is-copied');
      live.textContent = o.done;
      clearTimeout(timer);
      timer = setTimeout(() => { el.innerHTML = html; el.classList.remove('is-copied'); live.textContent = ''; }, o.duration);
    });
    return () => { off(); clearTimeout(timer); el.innerHTML = html; el.classList.remove('is-copied'); live.remove(); };
  },
};
