/* transition — page/link transitions. Put the class on <html> or <body>.
   <html class="efx-transition" data-efx-style="slide-up" data-efx-duration="400">
   Styles: fade · slide-up · curtain · zoom. Same-origin link clicks play an exit animation, then navigate; the next page
   plays the enter animation. Browsers with cross-document View Transitions use them natively (via an injected
   `@view-transition` rule), others get a JS curtain. Skipped: target=_blank, modifier keys, #hash-only, download,
   [data-efx-no-transition]. data-efx-prefetch (default on) adds <link rel=prefetch> when an internal link is hovered/focused. */
import { on, motionOK } from '../core.js';

const KEY = 'efx-tr';
const css = (s, d) => `@view-transition{navigation:auto}::view-transition-group(root){animation-duration:${d}ms}` + ({
  'slide-up': `::view-transition-new(root){animation:efx-tr-up ${d}ms cubic-bezier(.22,1,.36,1)}@keyframes efx-tr-up{from{transform:translateY(8%);opacity:0}}`,
  zoom: `::view-transition-new(root){animation:efx-tr-zoom ${d}ms cubic-bezier(.22,1,.36,1)}@keyframes efx-tr-zoom{from{transform:scale(.94);opacity:0}}`,
}[s] || '');

export default {
  name: 'transition',
  selector: '.efx-transition',
  defaults: { style: 'fade', duration: 400, prefetch: true },
  init(el, o) {
    if (!motionOK()) return;
    const native = typeof CSSViewTransitionRule !== 'undefined';
    const offs = [];
    let curtain = null, style = null;
    const ss = { get: () => { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } },
                 set: v => { try { v ? sessionStorage.setItem(KEY, 1) : sessionStorage.removeItem(KEY); } catch (e) {} } };
    if (native) {
      style = document.createElement('style');
      style.setAttribute('data-efx-transition', '');
      style.textContent = css(o.style, o.duration);
      document.head.appendChild(style);
    } else {
      curtain = document.createElement('div');
      curtain.className = 'efx-transition__curtain';
      curtain.setAttribute('aria-hidden', 'true');
      curtain.setAttribute('data-efx-style', o.style);
      curtain.style.setProperty('--efx-tr-dur', o.duration + 'ms');
      document.body.appendChild(curtain);
      // enter: we arrived through one of our own exits, so start covered and reveal the page
      if (ss.get()) {
        ss.set(0);
        curtain.classList.add('is-cover', 'is-instant');
        curtain.offsetWidth; // flush so the removal below transitions
        curtain.classList.remove('is-cover', 'is-instant');
        curtain.classList.add('is-leave');
      }
      // back/forward cache restores the exited state: clear it
      offs.push(on(window, 'pageshow', e => { if (e.persisted) curtain.classList.remove('is-cover'); }));
    }
    const link = e => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.closest('[data-efx-no-transition]') || (a.target && a.target !== '_self') || a.hasAttribute('download')) return null;
      let u;
      try { u = new URL(a.href, location.href); } catch (err) { return null; }
      if (!/^https?:$/.test(u.protocol) || u.origin !== location.origin) return null;
      if (u.pathname === location.pathname && u.search === location.search) return null; // same page / #hash
      return u;
    };
    if (curtain) offs.push(on(document, 'click', e => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const u = link(e);
      if (!u) return;
      e.preventDefault();
      ss.set(1);
      curtain.classList.remove('is-leave');
      curtain.classList.add('is-cover');
      setTimeout(() => { location.href = u.href; }, o.duration);
    }));
    if (o.prefetch) {
      const done = new Set(), links = [];
      const pre = e => {
        const u = link(e);
        if (!u || done.has(u.href)) return;
        done.add(u.href);
        const l = document.createElement('link');
        l.rel = 'prefetch'; l.href = u.href; l.setAttribute('data-efx-prefetch-link', '');
        document.head.appendChild(l); links.push(l);
      };
      offs.push(on(document, 'pointerover', pre, { passive: true }), on(document, 'focusin', pre), () => links.forEach(l => l.remove()));
    }
    return () => { offs.forEach(f => f()); curtain && curtain.remove(); style && style.remove(); };
  },
};
