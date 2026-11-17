/* spinner — CSS loaders; JS only adds role="status" and a visually hidden label when missing.
   <span class="spark-spinner" data-spark-type="dots"></span>   types: ring dots bars pulse orbit wave square (or class spark-spinner-<type>).
   Size: --spark-spinner-size. data-spark-label="Loading". */
export default {
  name: 'spinner',
  selector: '.spark-spinner, [class*="spark-spinner-"]',
  defaults: { type: '', label: 'Loading' },
  init(el, o) {
    const undo = [];
    if (o.type) { const c = 'spark-spinner-' + o.type; if (!el.classList.contains(c)) { el.classList.add(c); undo.push(() => el.classList.remove(c)); } }
    if (!el.classList.contains('spark-spinner')) { el.classList.add('spark-spinner'); undo.push(() => el.classList.remove('spark-spinner')); }
    if (!el.hasAttribute('role')) { el.setAttribute('role', 'status'); undo.push(() => el.removeAttribute('role')); }
    if (!el.hasAttribute('aria-label') && !el.querySelector('.spark-spinner__label') && !el.textContent.trim()) {
      const l = document.createElement('span');
      l.className = 'spark-spinner__label'; l.textContent = o.label;
      el.append(l); undo.push(() => l.remove());
    }
    return () => undo.forEach(f => f());
  },
};
