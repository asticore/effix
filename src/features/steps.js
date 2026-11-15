/* steps — stepper / multi-step helper: one panel at a time, progress list, back / next, validation, URL hash sync.
   <div class="efx-steps" data-efx-hash>
     <section class="efx-step" data-efx-title="Account">…</section>
     <section class="efx-step" data-efx-title="Plan">…</section>
   </div>
   Before moving forward the step is validated: native form validity of its fields, a `data-efx-validate` name
   registered with Effix.add('step-validate', name, (panel, index) => bool), and a cancelable `efx:validate` event.
   Fires `efx:step` ({ index, count, previous }) on every change and `efx:done` when the last step is completed. */
import { on, get } from '../core.js';

export default {
  name: 'steps',
  selector: '.efx-steps',
  defaults: { start: 0, hash: false, linear: true, native: true, validate: '', back: 'Back', next: 'Next', finish: 'Finish', label: 'Progress' },
  init(el, o) {
    const panels = [...el.children].filter(c => c.classList.contains('efx-step'));
    if (!panels.length) return;
    const n = panels.length, key = el.id || 'step', offs = [];
    const saved = panels.map(p => [p.hidden, p.getAttribute('aria-labelledby'), p.getAttribute('role'), p.id]);
    const bits = [];
    const mk = (tag, cls, txt) => { const x = document.createElement(tag); x.className = cls; if (txt != null) x.textContent = txt; return x; };
    const list = mk('ol', 'efx-steps__list'), bar = mk('div', 'efx-steps__bar'), status = mk('div', 'efx-steps__status');
    const nav = mk('div', 'efx-steps__nav'), back = mk('button', 'btn btn-outline efx-steps__back', o.back), next = mk('button', 'btn efx-steps__next', o.next);
    back.type = next.type = 'button';
    status.setAttribute('aria-live', 'polite'); list.setAttribute('aria-label', o.label); bar.setAttribute('aria-hidden', 'true');
    const items = panels.map((p, i) => {
      const li = mk('li', 'efx-steps__item'), b = mk('button', 'efx-steps__btn'), num = mk('span', 'efx-steps__num', i + 1), t = mk('span', 'efx-steps__title', p.dataset.efxTitle || `Step ${i + 1}`);
      b.type = 'button'; b.append(num, t); li.append(b); list.append(li);
      if (!p.id) { p.id = `${key}-panel-${i + 1}`; bits.push(p); }
      p.setAttribute('role', 'group'); b.id = `${key}-tab-${i + 1}`; p.setAttribute('aria-labelledby', b.id);
      offs.push(on(b, 'click', () => go(i, true)));
      return { li, b, p };
    });
    nav.append(back, next);
    el.prepend(list); el.prepend(bar); el.append(status, nav);
    el.classList.add('efx-steps--on');
    let cur = -1, doneAll = false;

    const valid = i => {
      const p = panels[i];
      if (o.native) {
        const bad = [...p.querySelectorAll('input,select,textarea')].find(f => !f.disabled && f.willValidate && !f.checkValidity());
        if (bad) { bad.reportValidity(); return false; }
      }
      const fn = o.validate && get('step-validate', o.validate);
      if (typeof fn === 'function') { try { if (fn(p, i) === false) return false; } catch (e) { console.warn('[effix] steps validate', e); } }
      return p.dispatchEvent(new CustomEvent('efx:validate', { bubbles: true, cancelable: true, detail: { index: i } }));
    };
    function show(i, quiet) {
      const prevI = cur; cur = i;
      items.forEach((it, k) => {
        it.p.hidden = k !== i;
        it.li.classList.toggle('is-active', k === i); it.li.classList.toggle('is-done', k < i || doneAll);
        if (k === i) it.b.setAttribute('aria-current', 'step'); else it.b.removeAttribute('aria-current');
        it.b.disabled = o.linear && k > i && !(k < reached + 1);
      });
      el.style.setProperty('--efx-steps-progress', n > 1 ? i / (n - 1) : 1);
      el.setAttribute('data-efx-step', i);
      back.disabled = i === 0;
      next.textContent = i === n - 1 ? o.finish : o.next;
      next.classList.toggle('is-last', i === n - 1);
      status.textContent = `Step ${i + 1} of ${n}: ${items[i].b.textContent.replace(/^\d+/, '')}`;
      if (o.hash && !quiet) { const h = `#${key}=${i + 1}`; if (location.hash !== h) history.replaceState(null, '', h); }
      if (!quiet || prevI < 0) el.dispatchEvent(new CustomEvent('efx:step', { bubbles: true, detail: { index: i, count: n, previous: prevI } }));
    }
    let reached = 0;
    function go(i, userNav) {
      i = Math.max(0, Math.min(n - 1, i));
      if (i === cur) return;
      if (i > cur) {
        if (o.linear && userNav && i > reached) return;
        for (let k = cur; k < i; k++) if (!valid(k)) return;
      }
      reached = Math.max(reached, i);
      show(i);
      const focus = panels[i].querySelector('[autofocus],input,select,textarea,button,a[href]');
      if (userNav !== 'quiet' && focus) try { focus.focus({ preventScroll: true }); } catch (e) {}
    }
    offs.push(on(back, 'click', () => go(cur - 1)));
    offs.push(on(next, 'click', () => {
      if (cur < n - 1) return go(cur + 1);
      if (!valid(cur)) return;
      doneAll = true; items.forEach(it => it.li.classList.add('is-done'));
      el.classList.add('is-done');
      el.dispatchEvent(new CustomEvent('efx:done', { bubbles: true }));
    }));
    offs.push(on(el, 'efx:goto', e => { const i = Math.round(e.detail && e.detail.index); if (Number.isFinite(i)) { reached = Math.max(reached, i); go(i, 'quiet'); } }));
    const fromHash = () => { const m = new RegExp(`[#&]${key.replace(/[^\w-]/g, '')}=(\\d+)`).exec(location.hash); return m ? +m[1] - 1 : null; };
    if (o.hash) offs.push(on(window, 'hashchange', () => { const i = fromHash(); if (i != null && i >= 0 && i < n && i !== cur) { reached = Math.max(reached, i); show(i, true); } }));
    const h0 = o.hash ? fromHash() : null, s0 = Math.max(0, Math.min(n - 1, Math.round(h0 != null ? h0 : o.start)));
    reached = s0; show(s0, true);

    return () => {
      offs.forEach(f => f());
      [list, bar, status, nav].forEach(x => x.remove());
      panels.forEach((p, i) => {
        p.hidden = saved[i][0];
        [['aria-labelledby', saved[i][1]], ['role', saved[i][2]]].forEach(([a, v]) => v === null ? p.removeAttribute(a) : p.setAttribute(a, v));
        if (bits.includes(p)) p.removeAttribute('id');
      });
      el.classList.remove('efx-steps--on', 'is-done'); el.style.removeProperty('--efx-steps-progress'); el.removeAttribute('data-efx-step');
    };
  },
};
