/* spinner — CSS loaders; JS only adds role="status" and a visually hidden label when missing.
   <span class="efx-spinner" data-efx-type="dots"></span>   types: ring dots bars pulse orbit wave square (or class efx-spinner-<type>).
   Size: --efx-spinner-size. data-efx-label="Loading". */
export default {
  name: 'spinner',
  selector: '.efx-spinner, [class*="efx-spinner-"]',
  defaults: { type: '', label: 'Loading' },
  init(el, o) {
    const undo = [];
    if (o.type) { const c = 'efx-spinner-' + o.type; if (!el.classList.contains(c)) { el.classList.add(c); undo.push(() => el.classList.remove(c)); } }
    if (!el.classList.contains('efx-spinner')) { el.classList.add('efx-spinner'); undo.push(() => el.classList.remove('efx-spinner')); }
    if (!el.hasAttribute('role')) { el.setAttribute('role', 'status'); undo.push(() => el.removeAttribute('role')); }
    if (!el.hasAttribute('aria-label') && !el.querySelector('.efx-spinner__label') && !el.textContent.trim()) {
      const l = document.createElement('span');
      l.className = 'efx-spinner__label'; l.textContent = o.label;
      el.append(l); undo.push(() => l.remove());
    }
    return () => undo.forEach(f => f());
  },
};
