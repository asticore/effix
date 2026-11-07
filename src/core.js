/* Effix core — registry, auto-init, option parsing and shared loops.
   Every feature is a plain object:
     { name, selector, lazy?, page?, defaults?, init(el, opts, ctx) => cleanup? }
   - selector: CSS selector the feature claims (usually `.efx-<name>`).
   - lazy:     true = init only when the element first comes near the viewport.
   - defaults: option defaults; each key is read from `data-efx-<kebab-key>` and
               coerced to the default's type (number, boolean, string, array).
   - init:     sets the element up, returns an optional cleanup function.
   Speed rules: one querySelectorAll per registered feature on boot, nothing runs
   for features that are absent from the page, heavy loops pause off-screen. */

const registry = new Map();
const mounted = new WeakMap(); // el -> Map(name -> cleanup)
const doc = typeof document !== 'undefined' ? document : null;
const mq = q => (typeof matchMedia !== 'undefined' ? matchMedia(q) : { matches: false, addEventListener() {} });
const reduceMQ = mq('(prefers-reduced-motion: reduce)');
const fineMQ = mq('(hover: hover) and (pointer: fine)');

/* ------------------------------------------------------------------ env */
export const motionOK = () => !reduceMQ.matches && !(doc && doc.documentElement.hasAttribute('data-efx-reduce'));
export const finePointer = () => fineMQ.matches;

/* --------------------------------------------------------------- options */
const kebab = s => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
const camelKey = k => 'efx' + k[0].toUpperCase() + k.slice(1);

/** Read `data-efx-*` options for `el`, typed by `defaults`. */
export function options(el, defaults = {}) {
  const out = {};
  for (const key in defaults) {
    const def = defaults[key];
    const raw = el.dataset[camelKey(key)];
    if (raw === undefined) { out[key] = Array.isArray(def) ? def.slice() : def; continue; }
    if (typeof def === 'number') { const n = parseFloat(raw); out[key] = Number.isFinite(n) ? n : def; }
    else if (typeof def === 'boolean') out[key] = raw === '' || raw === 'true' || raw === '1' || raw === 'on';
    else if (Array.isArray(def)) out[key] = raw.split(raw.includes('|') ? '|' : ',').map(s => s.trim()).filter(Boolean);
    else out[key] = raw;
  }
  return out;
}

/** Resolve a CSS custom property on `el` (falls back to `fallback`). */
export function cssVar(el, name, fallback = '') {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

/** Brand color: --efx-color, then Shine tone/primary, then indigo. */
export function themeColor(el) {
  const cs = getComputedStyle(el);
  for (const n of ['--efx-color', '--sh-tone', '--sh-primary']) { const v = cs.getPropertyValue(n).trim(); if (v) return v; }
  return '#6366f1';
}

/* ---------------------------------------------------------------- events */
export function on(target, type, fn, opts) {
  target.addEventListener(type, fn, opts);
  return () => target.removeEventListener(type, fn, opts);
}

/** Coalesce calls into one per animation frame. */
export function rafThrottle(fn) {
  let id = 0, args;
  const run = () => { id = 0; fn(...args); };
  const t = (...a) => { args = a; if (!id) id = requestAnimationFrame(run); };
  t.cancel = () => { cancelAnimationFrame(id); id = 0; };
  return t;
}

/* ---------------------------------------------- shared visibility observers */
const visIOs = new Map(); // "rootMargin|threshold" -> { io, cbs: WeakMap(el -> Set) }
/** Call `cb(isVisible, entry)` whenever `el` enters/leaves the viewport. Returns stop() (idempotent).
    One IntersectionObserver is shared by every element using the same rootMargin + threshold. */
export function onVisible(el, cb, rootMargin = '0px', threshold = 0) {
  if (typeof IntersectionObserver === 'undefined') { cb(true, { intersectionRatio: 1, intersectionRect: { height: 1e9 } }); return () => {}; }
  const key = rootMargin + '|' + threshold;
  let v = visIOs.get(key);
  if (!v) {
    const cbs = new WeakMap();
    const io = new IntersectionObserver(es => es.forEach(e => { const s = cbs.get(e.target); if (s) [...s].forEach(f => f(e.isIntersecting, e)); }), { rootMargin, threshold });
    v = { io, cbs };
    visIOs.set(key, v);
  }
  let set = v.cbs.get(el);
  if (!set) { set = new Set(); v.cbs.set(el, set); v.io.observe(el); }
  set.add(cb);
  let done = false;
  return () => {
    if (done) return;
    done = true;
    set.delete(cb);
    if (!set.size && v.cbs.get(el) === set) { v.cbs.delete(el); v.io.unobserve(el); }
  };
}

/* ------------------------------------------------- shared scroll/resize loop */
const scrollSubs = new Set();
let scrollBound = false;
// Two phases per frame: every subscriber reads layout first and may return a write
// function; all writes run afterwards, so N subscribers cause one reflow, not N.
const runScroll = subs => {
  const y = scrollY, h = innerHeight;
  const writes = [];
  subs.forEach(f => { const w = f(y, h); if (typeof w === 'function') writes.push(w); });
  writes.forEach(w => w());
};
const scrollTick = rafThrottle(() => runScroll(scrollSubs));
const bindScroll = on => {
  const m = on ? 'addEventListener' : 'removeEventListener';
  window[m]('scroll', scrollTick, { passive: true });
  window[m]('resize', scrollTick, { passive: true });
  scrollBound = on;
};
/** Run `fn(scrollY, viewportHeight)` at most once per frame on scroll/resize.
    Read layout inside fn; return a function to do DOM writes after all reads. Returns stop(). */
export function onScroll(fn) {
  if (!scrollBound) bindScroll(true);
  scrollSubs.add(fn);
  runScroll([fn]);
  return () => {
    scrollSubs.delete(fn);
    if (!scrollSubs.size && scrollBound) { bindScroll(false); scrollTick.cancel(); }
  };
}

/* --------------------------------------------------------------- registry */
const lazyQueue = new WeakMap(); // el -> Set(names)
let lazyIO = null;
const lazyMargin = () => (doc && doc.documentElement.dataset.efxMargin) || '200px';

function mount(el, def) {
  let m = mounted.get(el);
  if (m && m.has(def.name)) return;
  if (!m) { m = new Map(); mounted.set(el, m); }
  m.set(def.name, null); // reserve
  try {
    m.set(def.name, def.init(el, options(el, def.defaults || {}), api) || null);
  } catch (err) {
    m.delete(def.name);
    if (!m.size) mounted.delete(el);
    console.error(`[effix] ${def.name} failed`, err);
    return;
  }
  el.setAttribute('data-efx-ready', [...m.keys()].join(' '));
}

function queueLazy(el, def) {
  if (typeof IntersectionObserver === 'undefined') return mount(el, def);
  if (!lazyIO) {
    lazyIO = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const names = lazyQueue.get(e.target);
      lazyIO.unobserve(e.target);
      lazyQueue.delete(e.target);
      e.target.removeAttribute('data-efx-lazy');
      if (names) names.forEach(n => registry.has(n) && mount(e.target, registry.get(n)));
    }), { rootMargin: lazyMargin() });
  }
  let s = lazyQueue.get(el);
  if (!s) { s = new Set(); lazyQueue.set(el, s); lazyIO.observe(el); el.setAttribute('data-efx-lazy', ''); }
  s.add(def.name);
}

function scan(root, def) {
  const els = [];
  if (root.nodeType === 1 && root.matches(def.selector)) els.push(root);
  if (root.querySelectorAll) els.push(...root.querySelectorAll(def.selector));
  for (const el of els) {
    if (mounted.get(el)?.has(def.name) || lazyQueue.get(el)?.has(def.name) || el.closest('[data-efx-skip]')) continue;
    if (!mediaOK(el)) continue;
    if (def.lazy) queueLazy(el, def); else mount(el, def);
  }
}

/** Register one or more features. If the page is already initialised, scan for them now. */
export function define(...defs) {
  for (const def of defs.flat()) {
    if (!def || !def.name) continue;
    registry.set(def.name, def);
    if (booted && doc) scan(doc, def);
  }
  return api;
}

let booted = false;
/** Initialise every registered feature inside `root` (default: document). Safe to call repeatedly. */
export function init(root = doc, only) {
  if (!root) return api;
  booted = true;
  for (const def of registry.values()) if (!only || only.includes(def.name)) scan(root, def);
  return api;
}

/** Tear down features on `root` and its descendants (all, or only `name`). */
export function destroy(root = doc, name) {
  if (!root) return api;
  const sel = '[data-efx-ready], [data-efx-lazy]';
  const els = root.nodeType === 1 ? [root, ...root.querySelectorAll(sel)] : [...root.querySelectorAll(sel)];
  for (const el of els) teardown(el, name);
  return api;
}

/** Stop features on one element only (not its descendants). */
function teardown(el, name) {
  const q = lazyQueue.get(el);
  if (q) {
    if (name) q.delete(name); else q.clear();
    if (!q.size) { lazyQueue.delete(el); lazyIO.unobserve(el); el.removeAttribute('data-efx-lazy'); }
  }
  const m = mounted.get(el);
  if (!m) return;
  for (const [n, cleanup] of m) {
    if (name && n !== name) continue;
    try { cleanup && cleanup(); } catch (err) { console.error(`[effix] ${n} cleanup failed`, err); }
    m.delete(n);
  }
  if (m.size) el.setAttribute('data-efx-ready', [...m.keys()].join(' '));
  else { mounted.delete(el); el.removeAttribute('data-efx-ready'); }
}

/* ------------------------------------------------- responsive gating */
// <div class="efx-particles" data-efx-media="(min-width: 768px)"> runs only while the query matches;
// it starts and stops as the viewport crosses the breakpoint.
const mediaWatch = new WeakMap();
function mediaOK(el) {
  const q = el.getAttribute('data-efx-media');
  if (!q || typeof matchMedia === 'undefined') return true;
  let mql = mediaWatch.get(el);
  if (!mql) {
    try { mql = matchMedia(q); } catch (e) { return true; }
    mediaWatch.set(el, mql);
    mql.addEventListener('change', () => {
      if (!el.isConnected) return;
      if (mql.matches) for (const def of registry.values()) { if (el.matches(def.selector)) def.lazy ? queueLazy(el, def) : mount(el, def); }
      else teardown(el);
    });
  }
  return mql.matches;
}

/** Re-read options: destroy then init again (e.g. after a visual editor changes data-efx-*). */
export function refresh(root = doc, name) {
  destroy(root, name);
  return init(root, name ? [name] : undefined);
}

/* ------------------------------------------- DOM watching (editors, SPAs) */
let mo = null;
// Nodes that features inject themselves (efx-<name>__<part>) never hold features: skip them.
const injected = n => /(^|\s)efx-[\w-]+__/.test(n.getAttribute('class') || '');
/** Watch the DOM: auto-init added nodes, destroy removed ones.
    Attribute edits are not watched (features toggle their own classes); call refresh(el) instead. */
export function observe(target = doc && doc.body) {
  if (mo || !target || typeof MutationObserver === 'undefined') return api;
  mo = new MutationObserver(records => {
    for (const r of records) {
      r.removedNodes.forEach(n => { if (n.nodeType === 1 && !n.isConnected && !injected(n)) destroy(n); });
      r.addedNodes.forEach(n => { if (n.nodeType === 1 && n.isConnected && !injected(n) && !n.closest('[data-efx-skip]')) init(n); });
    }
  });
  mo.observe(target, { childList: true, subtree: true });
  return api;
}
export function disconnect() { if (mo) { mo.disconnect(); mo = null; } return api; }

/* ------------------------------------------------------------ extensions */
// Plugin registry: features look up named implementations by kind, so users can add
// their own particle shapes, divider shapes, ambient modes, easings, chart formats…
//   Effix.add('particle-shape', 'heart', (ctx, size) => { … })
//   <div class="efx-particles" data-efx-shape="heart">
const ext = new Map(); // kind -> Map(name -> impl)
/** Register `impl` under `kind`/`name` (or an object of many: add(kind, { a, b })). Returns api. */
export function add(kind, name, impl) {
  if (!ext.has(kind)) ext.set(kind, new Map());
  if (name && typeof name === 'object') for (const k in name) ext.get(kind).set(k, name[k]);
  else ext.get(kind).set(name, impl);
  return api;
}
/** Look up an implementation; undefined when missing. */
export const get = (kind, name) => ext.get(kind)?.get(name);
/** Names registered for a kind. */
export const list = kind => [...(ext.get(kind)?.keys() || [])];

/** Push new data into a chart, odometer or any feature that listens for `efx:data`. */
export function setData(el, data) {
  if (typeof el === 'string') el = doc && doc.querySelector(el);
  if (el) el.dispatchEvent(new CustomEvent('efx:data', { detail: data }));
  return api;
}

/** Instance check / feature list helpers. */
export const isMounted = (el, name) => !!mounted.get(el)?.has(name);
export const features = () => [...registry.keys()];

export const api = {
  version: '__VERSION__',
  define, init, destroy, refresh, observe, disconnect, options, isMounted, features, add, get, list, setData,
  motionOK, finePointer, cssVar, themeColor, on, rafThrottle, onVisible, onScroll,
};

/** Auto-boot unless <html data-efx-manual> or window.EffixConfig = { auto: false }. */
export function autoBoot() {
  if (!doc) return;
  const html = doc.documentElement;
  const cfg = (typeof window !== 'undefined' && window.EffixConfig) || {};
  // Add-on bundles (e.g. effix-charts) loaded before this file park their features here.
  const pending = (typeof window !== 'undefined' && window.EffixPending) || [];
  if (pending.length) define(pending.splice(0));
  if (typeof window !== 'undefined' && window.EffixChartKit && !api.charts) api.charts = window.EffixChartKit;
  // window.EffixConfig = { extend(Effix) { Effix.add(…) } } runs before the first scan.
  if (typeof cfg.extend === 'function') { try { cfg.extend(api); } catch (err) { console.error('[effix] extend', err); } }
  if (cfg.auto === false || html.hasAttribute('data-efx-manual')) return;
  const go = () => {
    init();
    if (cfg.observe || html.hasAttribute('data-efx-observe')) observe();
    doc.dispatchEvent(new CustomEvent('efx:ready', { detail: api }));
  };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', go, { once: true });
  else go();
}

export default api;
