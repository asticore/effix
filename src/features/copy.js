/* copy — copy text to the clipboard.
   <button class="btn efx-copy" data-efx-target="#code">Copy</button>   or   data-efx-text="literal" */
import { on } from '../core.js';

const fallback = text => {
  const prev = document.activeElement;
  const t = document.createElement('textarea');
  t.value = text; t.setAttribute('readonly', '');
  t.style.cssText = 'position:fixed;top:0;opacity:0';
  document.body.appendChild(t); t.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  t.remove();
  if (prev && prev.focus && prev !== document.body) try { prev.focus({ preventScroll: true }); } catch (e) {}
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
    let timer = 0, dead = false, changed = false;
    const restore = () => {
      if (changed) { el.innerHTML = html; changed = false; }
      el.classList.remove('is-copied');
      live.textContent = '';
    };
    const off = on(el, 'click', async () => {
      let text = o.text;
      if (!text && o.target) {
        let t = null;
        try { t = document.querySelector(o.target); } catch (e) {}
        text = t ? ('value' in t ? t.value : t.textContent) : '';
      }
      if (!text) return;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { ok = fallback(text); }
      if (dead || !ok) return;
      el.textContent = o.done;
      changed = true;
      el.classList.add('is-copied');
      live.textContent = o.done;
      clearTimeout(timer);
      timer = setTimeout(restore, o.duration);
    });
    return () => { dead = true; off(); clearTimeout(timer); restore(); live.remove(); };
  },
};
