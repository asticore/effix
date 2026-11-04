/* toast — notification toasts that nudge in. Uses Shine .toast + .btn-close, adds motion only.
   <div class="efx-toast" data-efx-show="3000" data-efx-position="bottom-right" data-efx-duration="5000" hidden>New message</div>
   Trigger:  <button data-efx-toast="#id">   Ad-hoc (needs at least one .efx-toast on the page):
   document.dispatchEvent(new CustomEvent('efx:toast', { detail: { text, tone, duration, position } })) */
import { on } from '../core.js';

const POS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
const stacks = new Map(); // position -> container
let users = 0, offGlobal = [];

const stackFor = pos => {
  pos = POS.includes(pos) ? pos : 'bottom-right';
  let s = stacks.get(pos);
  if (!s) {
    s = document.createElement('div');
    s.className = 'efx-toast__stack'; s.dataset.pos = pos; s.setAttribute('data-efx-skip', '');
    s.setAttribute('popover', 'manual');
    document.body.append(s);
    try { s.showPopover(); } catch (e) { s.removeAttribute('popover'); }
    stacks.set(pos, s);
  }
  return s;
};

function show(fill, o) {
  const stack = stackFor(o.position);
  const t = document.createElement('div');
  t.className = 'toast efx-toast__item' + (/^[\w-]+$/.test(o.tone || '') ? ' tone-' + o.tone : '');
  t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
  const body = document.createElement('div');
  body.className = 'efx-toast__body';
  fill(body);
  const x = document.createElement('button');
  x.type = 'button'; x.className = 'btn-close'; x.setAttribute('aria-label', 'Close');
  t.append(body, x);
  stack.append(t);

  let left = o.duration, t0 = 0, timer = 0, paused = false, closed = false;
  const run = () => { if (o.duration > 0 && !paused && !closed) { t0 = Date.now(); timer = setTimeout(close, Math.max(left, 300)); } };
  const pause = () => { if (paused) return; paused = true; clearTimeout(timer); if (t0) left -= Date.now() - t0; };
  const resume = () => { if (!paused) return; paused = false; run(); };
  function close() {
    if (closed) return;
    closed = true; clearTimeout(timer);
    t.classList.add('is-out');
    const done = () => { t.remove(); if (!stack.children.length && stacks.get(o.position) === stack) { stack.remove(); stacks.delete(o.position); } };
    t.addEventListener('animationend', done, { once: true });
    setTimeout(done, 450);
  }
  x.addEventListener('click', close);
  t.addEventListener('pointerenter', pause); t.addEventListener('pointerleave', resume);
  t.addEventListener('focusin', pause);
  t.addEventListener('focusout', e => { if (!t.contains(e.relatedTarget)) resume(); });
  t.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  run();
  return close;
}

export default {
  name: 'toast',
  selector: '.efx-toast',
  defaults: { show: -1, position: 'bottom-right', duration: 5000, tone: '' },
  init(el, o) {
    const closers = new Set(), timers = new Set();
    const id = el.id;
    const fire = () => {
      const c = show(b => { for (const n of el.childNodes) b.append(n.cloneNode(true)); }, o);
      closers.add(c);
    };
    if (el.hasAttribute('data-efx-show')) { const t = setTimeout(fire, Math.max(0, o.show)); timers.add(t); }
    if (!users++) {
      offGlobal = [
        on(document, 'efx:toast', e => {
          const d = e.detail || {};
          show(b => { b.textContent = d.text == null ? '' : String(d.text); }, {
            position: d.position || 'bottom-right', tone: d.tone || '', duration: Number.isFinite(+d.duration) && d.duration !== undefined ? +d.duration : 5000,
          });
        }),
      ];
    }
    const offClick = id ? on(document, 'click', e => {
      const a = e.target.closest && e.target.closest('[data-efx-toast]');
      if (a && a.dataset.efxToast === '#' + id) fire();
    }) : () => {};
    return () => {
      timers.forEach(clearTimeout); offClick();
      closers.forEach(c => c());
      if (!--users) {
        offGlobal.forEach(f => f()); offGlobal = [];
        stacks.forEach(s => s.remove()); stacks.clear();
      }
    };
  },
};
