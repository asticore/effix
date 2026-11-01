/* popup — auto-open triggers for a Shine modal (native <dialog>).
   <dialog class="modal efx-popup" id="promo" data-efx-delay="5" data-efx-frequency="session">…
     <button class="btn-close" data-efx-close aria-label="Close"></button></dialog>
   Manual openers: <button data-efx-open="promo"> or <a href="#promo">. One auto popup per page view. */
import { on } from '../core.js';

let shown = false; // only one auto popup per page view
const bot = /bot|crawl|spider|lighthouse/i;
const store = (s, fn) => { try { return fn(window[s]); } catch (e) {} };

export default {
  name: 'popup',
  selector: '.efx-popup',
  defaults: { delay: -1, scroll: 0, exit: false, frequency: 'always', days: 7, id: '' },
  init(el, o) {
    const id = o.id || el.id, key = 'efx-popup:' + id, offs = [];
    let timer = 0, opener = null;
    const canAuto = () => {
      if (o.frequency === 'session') return !store('sessionStorage', s => s.getItem(key));
      if (o.frequency === 'once') return !store('localStorage', s => s.getItem(key));
      if (o.frequency === 'days') { const t = +store('localStorage', s => s.getItem(key)); return !t || Date.now() - t > o.days * 864e5; }
      return true;
    };
    const mark = () => {
      if (o.frequency === 'session') store('sessionStorage', s => s.setItem(key, '1'));
      else if (o.frequency === 'once' || o.frequency === 'days') store('localStorage', s => s.setItem(key, Date.now()));
    };
    const open = by => {
      if (el.open || !el.showModal) return;
      opener = by || document.activeElement;
      el.showModal();
    };
    const auto = () => {
      if (shown || el.open || !canAuto()) return;
      shown = true; mark(); open();
    };
    const close = () => el.open && el.close();

    offs.push(on(el, 'close', () => { if (opener && opener.focus) opener.focus(); opener = null; }));
    offs.push(on(el, 'click', e => {
      if (e.target.closest('[data-efx-close]')) return close();
      if (e.target !== el) return;
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
    }));
    offs.push(on(document, 'click', e => {
      const t = e.target.closest && e.target.closest('[data-efx-open],a[href^="#"]');
      if (!t || !id) return;
      if ((t.dataset.efxOpen || t.getAttribute('href').slice(1)) !== id) return;
      e.preventDefault(); open(t);
    }));

    if (!bot.test(navigator.userAgent)) {
      if (o.delay >= 0) timer = setTimeout(auto, o.delay * 1000);
      if (o.scroll > 0) {
        const chk = () => {
          const h = document.documentElement.scrollHeight - innerHeight;
          if (h <= 0 || scrollY / h * 100 >= o.scroll) auto();
        };
        offs.push(on(window, 'scroll', chk, { passive: true }));
      }
      if (o.exit && matchMedia('(hover: hover) and (pointer: fine)').matches) {
        offs.push(on(document, 'mouseout', e => { if (!e.relatedTarget && e.clientY <= 0) auto(); }));
      }
    }
    return () => { clearTimeout(timer); offs.forEach(f => f()); close(); };
  },
};
