/* pricing — price toggle that rolls the numbers.
   <div class="efx-pricing" data-efx-periods="Monthly|Yearly">
     <button data-efx-period="Monthly">Monthly</button><button data-efx-period="Yearly">Yearly</button>   (or <input type=checkbox class="efx-pricing__toggle">)
     <span data-efx-prices="9|90">$<span class="efx-odometer">9</span></span> <small data-efx-period-text="per month|per year"></small>
     <span data-efx-show-on="Yearly">Save 20%</span>
   </div>
   A price inside/being an .efx-odometer gets efx:data {value}; others count up/down. Emits efx:period on the container. */
import { on, motionOK } from '../core.js';

const num = /[\d][\d,]*\.?\d*/;

export default {
  name: 'pricing',
  selector: '.efx-pricing',
  defaults: { periods: ['Monthly', 'Yearly'], start: 0, duration: 600 },
  init(el, o) {
    const periods = o.periods, undo = [];
    const norm = s => String(s).trim().toLowerCase();
    const btns = [...el.querySelectorAll('[data-efx-period]')];
    const chk = el.querySelector('.efx-pricing__toggle');
    const prices = [...el.querySelectorAll('[data-efx-prices]')].map(p => ({
      el: p, vals: p.dataset.efxPrices.split('|').map(s => s.trim()),
      odo: p.matches('.efx-odometer') ? p : p.querySelector('.efx-odometer'), orig: p.innerHTML, raf: 0,
    }));
    const texts = [...el.querySelectorAll('[data-efx-period-text]')].map(t => ({ el: t, vals: t.dataset.efxPeriodText.split('|').map(s => s.trim()), orig: t.textContent }));
    const shows = [...el.querySelectorAll('[data-efx-show-on]')].map(s => ({ el: s, hid: s.hidden }));
    const live = document.createElement('span');
    live.className = 'efx-pricing__live'; live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
    el.append(live);

    const setAttr = (n, k, v) => { const had = n.getAttribute(k); n.setAttribute(k, v); if (!undo.some(u => u.n === n && u.k === k)) undo.push({ n, k, had }); };
    const group = btns.length && btns[0].parentElement;
    if (group && !group.hasAttribute('role')) setAttr(group, 'role', 'radiogroup');
    btns.forEach(b => { if (!b.hasAttribute('role')) setAttr(b, 'role', 'radio'); if (!b.hasAttribute('type') && b.tagName === 'BUTTON') setAttr(b, 'type', 'button'); });
    const bIdx = b => { const v = b.dataset.efxPeriod; const i = periods.findIndex(p => norm(p) === norm(v)); return i >= 0 ? i : (parseInt(v, 10) || 0); };
    const fmtLike = (tpl, n) => { const dec = (tpl.split('.')[1] || '').length; const s = n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); return tpl.includes(',') ? s : s.replace(/,/g, ''); };
    const roll = (p, val, animate) => {
      cancelAnimationFrame(p.raf);
      if (p.odo) {
        p.odo.dispatchEvent(new CustomEvent('efx:data', { detail: { value: val } }));
        return;
      }
      const to = val.match(num), from = p.el.textContent.match(num);
      if (!animate || !to || !from) { p.el.textContent = val; return; }
      const a = parseFloat(from[0].replace(/,/g, '')), b = parseFloat(to[0].replace(/,/g, '')), t0 = performance.now();
      const step = now => {
        const k = Math.min(1, (now - t0) / o.duration), e = 1 - (1 - k) ** 3;
        p.el.textContent = k < 1 ? val.replace(num, fmtLike(to[0], a + (b - a) * e)) : val;
        if (k < 1) p.raf = requestAnimationFrame(step);
      };
      p.raf = requestAnimationFrame(step);
    };

    let idx = -1;
    const set = (i, animate, quiet) => {
      i = Math.max(0, Math.min(periods.length - 1, i));
      if (i === idx) return;
      idx = i;
      const anim = animate && motionOK();
      prices.forEach(p => roll(p, p.vals[i] ?? p.vals[p.vals.length - 1], anim));
      texts.forEach(t => { t.el.textContent = t.vals[i] ?? t.vals[t.vals.length - 1]; });
      shows.forEach(s => { s.el.hidden = norm(s.el.dataset.efxShowOn) !== norm(periods[i]); });
      btns.forEach(b => { const on = bIdx(b) === i; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; b.classList.toggle('is-active', on); });
      if (chk) chk.checked = i > 0;
      if (!quiet) {
        const f = prices[0], ft = texts[0];
        live.textContent = [periods[i], f && f.vals[i], ft && ft.vals[i]].filter(Boolean).join(' ');
        el.dispatchEvent(new CustomEvent('efx:period', { bubbles: true, detail: { index: i, period: periods[i] } }));
      }
    };

    const offs = [];
    btns.forEach(b => {
      offs.push(on(b, 'click', () => set(bIdx(b), true)));
      offs.push(on(b, 'keydown', e => {
        const k = e.key, d = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? -1 : 0;
        const to = k === 'Home' ? 0 : k === 'End' ? periods.length - 1 : idx + d;
        if (!d && k !== 'Home' && k !== 'End') return;
        e.preventDefault(); set(to, true);
        const nb = btns.find(x => bIdx(x) === idx); if (nb) nb.focus();
      }));
    });
    if (chk) offs.push(on(chk, 'change', () => set(chk.checked ? 1 : 0, true)));

    const start = Math.max(0, Math.min(periods.length - 1, o.start | 0));
    set(start, false, true);
    // odometers may initialise after us: sync them next tick
    const t = setTimeout(() => prices.forEach(p => p.odo && roll(p, p.vals[start] ?? p.vals[0], false)), 0);

    return () => {
      clearTimeout(t); offs.forEach(f => f());
      prices.forEach(p => { cancelAnimationFrame(p.raf); if (!p.odo) p.el.innerHTML = p.orig; });
      texts.forEach(t => { t.el.textContent = t.orig; });
      shows.forEach(s => { s.el.hidden = s.hid; });
      btns.forEach(b => { b.removeAttribute('aria-checked'); b.removeAttribute('tabindex'); b.classList.remove('is-active'); });
      undo.forEach(u => (u.had === null ? u.n.removeAttribute(u.k) : u.n.setAttribute(u.k, u.had)));
      live.remove();
    };
  },
};
