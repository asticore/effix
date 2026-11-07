/* layout — FLIP layout animations. Children that are added, removed, hidden, reordered or resized glide to their new spot;
   entering items fade/scale in, leaving items fade out from a clone.
   <div class="efx-layout grid grid-cols-3 gap-4" id="grid">…<div data-efx-tags="design dev" data-efx-key-price="19">…</div></div>
   Controls (inside or linked with data-efx-for="#grid"): <button data-efx-filter="design"> · <button data-efx-sort="price">
   (filter "*" = all; sort toggles asc/desc; keys read from data-efx-key-<name>). A polite live region announces "6 items". */
import { on, motionOK } from '../core.js';

const SKIP = '.efx-layout__ghost,.efx-layout__status,[data-efx-filter],[data-efx-sort],[data-efx-controls]';

export default {
  name: 'layout',
  selector: '.efx-layout',
  defaults: { duration: 400, ease: 'cubic-bezier(.22,1,.36,1)', scale: 0.9, noun: 'item', count: '' },
  init(el, o) {
    const animate = motionOK() && !!el.animate;
    const items = () => [...el.children].filter(c => !c.matches(SKIP));
    const shown = c => c.getClientRects().length > 0;
    const savedPos = el.style.position;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

    /* ---- measurement + FLIP ---- */
    const rectOf = c => {
      const r = c.getBoundingClientRect(), b = el.getBoundingClientRect();
      return { x: r.left - b.left - el.clientLeft, y: r.top - b.top - el.clientTop, w: r.width, h: r.height };
    };
    let cache = new Map();                 // item -> true layout rect (no animation applied)
    const running = new Map();             // item -> Animation
    const ghosts = new Set();
    const snapshot = () => { cache = new Map(); items().filter(shown).forEach(c => cache.set(c, rectOf(c))); };
    const play = (c, frames) => {
      const a = c.animate(frames, { duration: o.duration, easing: o.ease });
      running.set(c, a);
      const done = () => { if (running.get(c) === a) running.delete(c); };
      a.onfinish = done; a.oncancel = done;
    };
    const ghost = (c, r) => {
      const g = c.cloneNode(true);
      g.classList.add('efx-layout__ghost');
      g.removeAttribute('id'); g.removeAttribute('hidden'); g.removeAttribute('data-efx-ready');
      g.setAttribute('aria-hidden', 'true');
      g.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      Object.assign(g.style, { position: 'absolute', margin: '0', boxSizing: 'border-box', left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
      el.appendChild(g); ghosts.add(g);
      const a = g.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: o.scale }], { duration: o.duration, easing: o.ease });
      a.onfinish = a.oncancel = () => { g.remove(); ghosts.delete(g); };
    };
    const flip = () => {
      const visual = new Map();
      running.forEach((a, c) => visual.set(c, rectOf(c))); // where in-flight items are right now
      running.forEach(a => a.cancel()); running.clear();
      const now = items().filter(shown), next = new Map();
      now.forEach(c => next.set(c, rectOf(c)));
      now.forEach(c => {
        const last = next.get(c), first = visual.get(c) || cache.get(c);
        if (!first) return play(c, [{ opacity: 0, scale: o.scale }, { opacity: 1, scale: 1 }]);
        const dx = first.x - last.x, dy = first.y - last.y;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) play(c, [{ translate: dx + 'px ' + dy + 'px' }, { translate: '0px 0px' }]);
      });
      cache.forEach((r, c) => { if (!next.has(c)) ghost(c, visual.get(c) || r); });
      cache = next;
    };

    /* ---- count (aria-live) ---- */
    let status = null;
    const made = [];
    const target = o.count && document.querySelector(o.count);
    const savedLive = target ? target.getAttribute('aria-live') : null;
    if (target) { if (savedLive === null) target.setAttribute('aria-live', 'polite'); status = target; }
    else {
      status = document.createElement('span');
      status.className = 'efx-layout__status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      el.after(status); made.push(status);
    }
    const count = () => {
      const n = items().filter(c => !c.hidden && shown(c)).length;
      status.textContent = n + ' ' + o.noun + (n === 1 ? '' : 's');
    };

    /* ---- filter / sort controls ---- */
    const ctl = new Set([...el.querySelectorAll('[data-efx-filter],[data-efx-sort]')]);
    document.querySelectorAll('[data-efx-for]').forEach(b => { if (b.matches('[data-efx-filter],[data-efx-sort]') && el.matches(b.dataset.efxFor || '\0')) ctl.add(b); });
    const filters = [...ctl].filter(b => b.hasAttribute('data-efx-filter'));
    const sorts = [...ctl].filter(b => b.hasAttribute('data-efx-sort'));
    const savedPressed = new Map([...ctl].map(b => [b, b.getAttribute('aria-pressed')]));
    const hid = new Set();
    const setPressed = (list, on_) => list.forEach(b => b.setAttribute('aria-pressed', b === on_ ? 'true' : 'false'));
    const applyFilter = tag => {
      items().forEach(c => {
        const ok = tag === '*' || (c.getAttribute('data-efx-tags') || '').split(/\s+/).includes(tag);
        if (!ok && !c.hidden) { c.hidden = true; hid.add(c); } else if (ok && c.hidden && hid.has(c)) { c.hidden = false; hid.delete(c); }
      });
    };
    const sortBy = (key, dir) => {
      const val = c => c.getAttribute('data-efx-key-' + key) || '';
      const list = items();
      if (!list.length) return;
      const end = list[list.length - 1].nextSibling;
      list.sort((a, b) => {
        const x = val(a), y = val(b), nx = parseFloat(x), ny = parseFloat(y);
        const r = Number.isFinite(nx) && Number.isFinite(ny) && x !== '' && y !== '' ? nx - ny : x.localeCompare(y);
        return dir === 'desc' ? -r : r;
      }).forEach(c => el.insertBefore(c, end));
    };
    const offs = [];
    filters.forEach(b => offs.push(on(b, 'click', () => { applyFilter(b.getAttribute('data-efx-filter')); setPressed(filters, b); })));
    sorts.forEach(b => offs.push(on(b, 'click', () => {
      const dir = b.getAttribute('aria-pressed') === 'true' && b.getAttribute('data-efx-dir') !== 'desc' ? 'desc' : 'asc';
      sorts.forEach(s => s.removeAttribute('data-efx-dir'));
      b.setAttribute('data-efx-dir', dir);
      sortBy(b.getAttribute('data-efx-sort'), dir); setPressed(sorts, b);
    })));
    // initial state from aria-pressed="true" on a filter button
    const start = filters.find(b => b.getAttribute('aria-pressed') === 'true');
    if (start) { applyFilter(start.getAttribute('data-efx-filter')); setPressed(filters, start); }
    else filters.forEach(b => { if (b.getAttribute('data-efx-filter') === '*') b.setAttribute('aria-pressed', 'true'); else b.setAttribute('aria-pressed', 'false'); });
    sorts.forEach(b => { if (b.getAttribute('aria-pressed') === null) b.setAttribute('aria-pressed', 'false'); });

    /* ---- observers ---- */
    el.classList.add('efx-layout-on');
    snapshot(); count();
    let mo = null, ro = null, raf = 0;
    if (animate) {
      const relevant = r => [...r.addedNodes, ...r.removedNodes].some(n => !(n.nodeType === 1 && n.classList.contains('efx-layout__ghost') || n.classList && n.classList.contains('efx-layout__status')))
        || (r.type === 'attributes' && !r.target.classList.contains('efx-layout__ghost') && !(r.target.closest && r.target.closest('.efx-layout__ghost')));
      mo = new MutationObserver(rs => { if (rs.some(relevant)) { flip(); count(); } });
      mo.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => items().filter(shown).forEach(c => { if (!running.has(c)) cache.set(c, rectOf(c)); }));
        });
        ro.observe(el);
      }
    } else { mo = new MutationObserver(() => count()); mo.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] }); }

    return () => {
      mo && mo.disconnect(); ro && ro.disconnect(); cancelAnimationFrame(raf);
      offs.forEach(f => f());
      running.forEach(a => { a.onfinish = a.oncancel = null; a.cancel(); });
      ghosts.forEach(g => g.remove()); ghosts.clear();
      made.forEach(n => n.remove());
      if (target) { if (savedLive === null) target.removeAttribute('aria-live'); }
      hid.forEach(c => { c.hidden = false; });
      savedPressed.forEach((v, b) => (v === null ? b.removeAttribute('aria-pressed') : b.setAttribute('aria-pressed', v)));
      ctl.forEach(b => b.removeAttribute('data-efx-dir'));
      el.style.position = savedPos;
      el.classList.remove('efx-layout-on');
    };
  },
};
