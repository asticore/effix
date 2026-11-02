/* Effix charts — shared toolkit (bundled once, used by every chart-* feature).
   Tiny re-implementations of the d3 ideas charts need: data parsing, linear/band
   scales with "nice" ticks, monotone curves, arcs, number formatting, a shared
   tooltip, a toggle legend, keyboard navigation, resize + entrance animation.

   Every chart is mounted with chart(el, opts, draw):
     draw(ctx) -> marks[]   ctx = { svg, w, h, data, colors, o, g(), add(), sx/sy helpers… }
     marks: [{ x, y, label, value, series, html?, node? }] — used for tooltip, keyboard
     focus (←/→) and the efx:select event. */
import { onVisible, motionOK, on, rafThrottle } from '../core.js';

const NS = 'http://www.w3.org/2000/svg';

/* ------------------------------------------------------------- options */
/** Defaults shared by every chart; spread into each feature's `defaults`. */
export const COMMON = {
  data: '',          // "12,19,7"  or JSON [[..],[..]] / [{name,data}]
  labels: [],        // "Mon|Tue|Wed"
  names: [],         // series names "2025|2026"
  source: '',        // CSS selector of a <table> (e.g. a Shine .table) to read data from
  colors: [],        // "#f43f5e|#8b5cf6" (default: Shine tone palette)
  height: 260,       // px (0 = use the element's CSS height)
  background: false, // decorative mode: fills the element, no axes/legend/tooltip, aria-hidden
  legend: true,
  tooltip: true,
  animate: true,
  prefix: '',
  suffix: '',
  decimals: -1,      // -1 = auto
  compact: false,    // 12.3k
  title: '',         // accessible name (falls back to aria-label / first heading)
};

/* --------------------------------------------------------------- data */
const num = v => { const n = parseFloat(String(v).replace(/[^\d.eE+-]/g, '')); return Number.isFinite(n) ? n : 0; };

function fromTable(table) {
  const head = [...table.querySelectorAll('thead th')].map(th => th.textContent.trim());
  const rows = [...table.querySelectorAll('tbody tr')].map(tr => [...tr.children].map(td => td.textContent.trim()));
  // first column = labels, other columns = series
  return {
    labels: rows.map(r => r[0]),
    series: head.slice(1).map((name, i) => ({ name, values: rows.map(r => num(r[i + 1])) })),
  };
}

/** Normalise every supported input into { labels: string[], series: [{name, values:number[]}] }. */
export function parseData(el, o) {
  let out = null;
  const json = el.querySelector(':scope > script[type="application/json"]');
  try {
    if (o.source) { const t = document.querySelector(o.source); if (t) out = fromTable(t); }
    if (!out && json) out = JSON.parse(json.textContent);
    if (!out && o.data) {
      const raw = o.data.trim();
      if (raw[0] === '[' || raw[0] === '{') out = JSON.parse(raw);
      else out = { series: raw.split('|').map(s => ({ values: s.split(',').map(num) })) };
    }
  } catch (err) { console.warn('[effix] chart data', err); }
  out = out || { series: [] };
  if (Array.isArray(out)) out = { series: out };
  let series = (out.series || out.datasets || []).map((s, i) => {
    if (Array.isArray(s)) s = { values: s };
    const values = (s.values || s.data || []).map(num);
    return { name: s.name || s.label || o.names[i] || `Series ${i + 1}`, values, color: s.color };
  });
  // [{label, value}] shorthand
  if (!series.length && Array.isArray(out.data)) series = [{ name: o.names[0] || '', values: out.data.map(d => num(d.value ?? d)) }];
  const n = Math.max(0, ...series.map(s => s.values.length));
  const labels = (o.labels.length ? o.labels : out.labels || (Array.isArray(out.data) ? out.data.map(d => d.label) : [])).slice();
  for (let i = labels.length; i < n; i++) labels.push(String(i + 1));
  return { labels: labels.map(String), series };
}

/* -------------------------------------------------------------- colors */
const TOKENS = ['--sh-primary', '--sh-accent', '--sh-success', '--sh-warning', '--sh-info', '--sh-danger', '--sh-secondary'];
const FALLBACK = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#8b5cf6'];
/** n colors: data-efx-colors, else --efx-chart-1..7, else Shine tones, else defaults. */
export function palette(el, o, n) {
  const cs = getComputedStyle(el);
  const base = o.colors.length ? o.colors
    : TOKENS.map((t, i) => cs.getPropertyValue(`--efx-chart-${i + 1}`).trim() || cs.getPropertyValue(t).trim() || FALLBACK[i]);
  return Array.from({ length: Math.max(n, 1) }, (_, i) => base[i % base.length]);
}

/* -------------------------------------------------------------- scales */
/** d3-style tick step: 1, 2 or 5 × 10^k closest to span/count. */
export function tickStep(start, stop, count) {
  const step0 = Math.abs(stop - start) / Math.max(1, count);
  let step1 = Math.pow(10, Math.floor(Math.log10(step0 || 1)));
  const err = step0 / step1;
  if (err >= 7.07) step1 *= 10; else if (err >= 3.16) step1 *= 5; else if (err >= 1.41) step1 *= 2;
  return step1;
}
/** Extend [min,max] to round tick values; returns { min, max, ticks }. */
export function nice(min, max, count = 5) {
  if (min === max) { max = min + 1; if (min > 0) min = 0; }
  const step = tickStep(min, max, count);
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
  return { min: lo, max: hi, ticks };
}
/** Linear scale function with .ticks and .domain. */
export function linear([d0, d1], [r0, r1]) {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  const f = v => r0 + (v - d0) * k;
  f.invert = r => d0 + (r - r0) / (k || 1);
  return f;
}
/** Band scale: n slots across [r0,r1] with inner padding (0..1). Returns { x(i), bw, step }. */
export function band(n, [r0, r1], padding = 0.25) {
  const step = (r1 - r0) / Math.max(1, n);
  const bw = step * (1 - padding);
  return { x: i => r0 + i * step + (step - bw) / 2, bw, step };
}

/* --------------------------------------------------------------- paths */
/** Polyline or monotone-cubic (Fritsch–Carlson, as d3.curveMonotoneX) path through points. */
export function linePath(pts, smooth = true) {
  if (!pts.length) return '';
  if (!smooth || pts.length < 3) return 'M' + pts.map(p => `${p[0]},${p[1]}`).join('L');
  const n = pts.length, dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / (dx[i] || 1); }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${pts[i][0] + h},${pts[i][1] + h * t[i]} ${pts[i + 1][0] - h},${pts[i + 1][1] - h * t[i + 1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}
const pt = (cx, cy, r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)]; // 0 rad = 12 o'clock, clockwise
/** Annular sector path (angles in radians, 0 at top, clockwise). r0 = 0 for a pie slice. */
export function arcPath(cx, cy, r0, r1, a0, a1) {
  if (a1 - a0 >= Math.PI * 2 - 1e-6) a1 = a0 + Math.PI * 2 - 1e-4;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = pt(cx, cy, r1, a0), [x1, y1] = pt(cx, cy, r1, a1);
  let d = `M${x0},${y0}A${r1},${r1} 0 ${large} 1 ${x1},${y1}`;
  if (r0 > 0) { const [x2, y2] = pt(cx, cy, r0, a1), [x3, y3] = pt(cx, cy, r0, a0); d += `L${x2},${y2}A${r0},${r0} 0 ${large} 0 ${x3},${y3}Z`; }
  else d += `L${cx},${cy}Z`;
  return d;
}
export { pt as polar };

/* -------------------------------------------------------------- format */
export function formatter(o) {
  const opts = o.compact ? { notation: 'compact', maximumFractionDigits: 1 } : {};
  if (o.decimals >= 0) { opts.minimumFractionDigits = o.decimals; opts.maximumFractionDigits = o.decimals; }
  let nf;
  try { nf = new Intl.NumberFormat(undefined, opts); } catch (e) { nf = { format: v => String(v) }; }
  return v => o.prefix + nf.format(v) + o.suffix;
}

/* ----------------------------------------------------------------- svg */
/** Create an SVG element with attributes, optionally appended to parent. */
export function s(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}
const esc = v => String(v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export { esc };

/** Y axis gridlines + labels and X labels. Returns nothing; draws into g. */
export function axes(g, { w, h, pad, y, ticks, labels, x, fmt, grid = true, rotate = false }) {
  const ax = s('g', { class: 'efx-chart__axis', 'aria-hidden': 'true' }, g);
  for (const t of ticks) {
    const yy = y(t);
    if (grid) s('line', { x1: pad.l, x2: w - pad.r, y1: yy, y2: yy, class: 'efx-chart__grid' }, ax);
    s('text', { x: pad.l - 8, y: yy, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, ax).textContent = fmt(t);
  }
  if (labels && x) {
    const every = Math.ceil(labels.length / Math.max(1, Math.floor((w - pad.l - pad.r) / 56)));
    labels.forEach((l, i) => {
      if (i % every) return;
      const t = s('text', { x: x(i), y: h - pad.b + 18, 'text-anchor': rotate ? 'end' : 'middle' }, ax);
      if (rotate) t.setAttribute('transform', `rotate(-35 ${x(i)} ${h - pad.b + 18})`);
      t.textContent = l;
    });
  }
}

/* --------------------------------------------------------------- mount */
let uid = 0;

/** Mount a chart on el. Handles container, svg, legend, tooltip, keyboard, resize, entrance, data updates. */
export function chart(el, o, draw) {
  const id = 'efx-c' + ++uid;
  const restore = { pos: el.style.position, iso: el.style.isolation };
  const deco = o.background;
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  // Background mode: chart layer sits under the element's own content (z-index -1 inside an isolated host).
  if (deco) el.style.isolation = 'isolate';

  // Keep author content (e.g. a fallback <script type=application/json> or text); add our layer.
  const wrap = document.createElement('div');
  wrap.className = 'efx-chart__wrap' + (deco ? ' efx-chart__wrap--bg' : '');
  if (deco) wrap.setAttribute('aria-hidden', 'true');
  const svg = s('svg', { class: 'efx-chart__svg', role: deco ? null : 'img', 'aria-labelledby': deco ? null : id + '-t', focusable: 'false' });
  const title = s('title', { id: id + '-t' }, svg);
  wrap.appendChild(svg);
  const tip = document.createElement('div');
  tip.className = 'efx-chart__tip';
  tip.setAttribute('role', 'status');
  tip.hidden = true;
  const legend = document.createElement('div');
  legend.className = 'efx-chart__legend';
  const sr = document.createElement('ul');
  sr.className = 'efx-chart__sr';
  if (deco) el.prepend(wrap); else el.append(wrap, tip, legend, sr);
  el.classList.add('efx-chart');

  let data = parseData(el, o);
  const hidden = new Set();
  let marks = [], active = -1, w = 0, h = 0, played = !o.animate || !motionOK();
  const fmt = formatter(o);

  const name = () => o.title || el.getAttribute('aria-label') || (el.querySelector('h1,h2,h3,h4,h5,h6,figcaption') || {}).textContent || 'Chart';

  function render(again) {
    w = Math.max(40, el.clientWidth);
    h = deco ? Math.max(20, el.clientHeight) : (o.height || el.clientHeight || 260);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    [...svg.childNodes].forEach(n => n !== title && n.remove());
    title.textContent = name();
    // Series legends hide series; label legends (pie, funnel) pass `hidden` so draw() can skip labels.
    const visible = draw.legendByLabel ? data.series.map((s0, i) => ({ ...s0, index: i })) : data.series.map((s0, i) => ({ ...s0, index: i })).filter(x => !hidden.has(x.index));
    const colors = palette(el, o, data.series.length).map((c, i) => data.series[i] && data.series[i].color || c);
    const g = s('g', { class: 'efx-chart__plot' + (played ? ' is-in' : '') }, svg);
    marks = draw({ el, svg, g, w, h, o, data, visible, hidden, colors, fmt, deco, again }) || [];
    if (!deco) {
      sr.innerHTML = marks.slice(0, 200).map(m => `<li>${esc(m.label)}${m.series ? ' (' + esc(m.series) + ')' : ''}: ${esc(fmt(m.value))}</li>`).join('');
      svg.setAttribute('tabindex', marks.length ? '0' : '-1');
    }
  }

  function renderLegend() {
    legend.innerHTML = '';
    if (deco || !o.legend || data.series.length < 2 && !draw.legendByLabel) return;
    const colors = palette(el, o, Math.max(data.series.length, data.labels.length));
    const items = draw.legendByLabel ? data.labels : data.series.map(x => x.name);
    items.forEach((label, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'efx-chart__key';
      b.setAttribute('aria-pressed', String(!hidden.has(i)));
      b.style.setProperty('--efx-key', (data.series[i] && data.series[i].color) || colors[i]);
      b.textContent = label;
      b.addEventListener('click', () => {
        hidden.has(i) ? hidden.delete(i) : hidden.add(i);
        if (hidden.size >= items.length) hidden.delete(i); // keep one visible
        b.setAttribute('aria-pressed', String(!hidden.has(i)));
        render(true);
      });
      legend.appendChild(b);
    });
  }

  /* tooltip + highlight */
  function show(i) {
    if (deco || !o.tooltip) return;
    active = i;
    const m = marks[i];
    if (!m) return hide();
    // Keep undimmed: the mark itself, marks in the same group, and marks it lists in `rel` (indexes).
    const rel = new Set(m.rel || []);
    marks.forEach((k, j) => k.node && k.node.classList.toggle('is-dim', j !== i && !rel.has(j) && (m.group == null || k.group !== m.group)));
    if (m.node) m.node.classList.add('is-active');
    tip.innerHTML = m.html || `<strong>${esc(m.label)}</strong>${m.series ? `<span>${esc(m.series)}</span>` : ''}<b>${esc(fmt(m.value))}</b>`;
    tip.hidden = false;
    const r = el.getBoundingClientRect(), sv = svg.getBoundingClientRect();
    const x = sv.left - r.left + m.x * (sv.width / w), y = sv.top - r.top + m.y * (sv.height / h);
    tip.style.left = Math.max(0, Math.min(r.width - tip.offsetWidth, x - tip.offsetWidth / 2)) + 'px';
    tip.style.top = Math.max(0, y - tip.offsetHeight - 10) + 'px';
  }
  function hide() {
    active = -1;
    tip.hidden = true;
    marks.forEach(k => k.node && k.node.classList.remove('is-dim', 'is-active'));
  }
  const nearest = (px, py) => {
    let best = -1, bd = Infinity;
    marks.forEach((m, i) => {
      if (m.hit && m.hit(px, py)) { bd = -1; best = i; return; }
      if (bd < 0) return;
      const d = m.xOnly ? Math.abs(m.x - px) : Math.hypot(m.x - px, m.y - py);
      if (d < bd) { bd = d; best = i; }
    });
    return bd === -1 || bd < (draw.radius || 48) ? best : -1;
  };
  const pos = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) * (w / r.width), (e.clientY - r.top) * (h / r.height)]; };
  const offs = [];
  if (!deco) {
    const move = rafThrottle(e => { const i = nearest(...pos(e)); if (i < 0) hide(); else if (i !== active) show(i); });
    offs.push(
      on(svg, 'pointermove', move),
      on(svg, 'pointerleave', () => { move.cancel(); hide(); }),
      on(svg, 'click', e => { const i = nearest(...pos(e)); if (i >= 0) select(i); }),
      on(svg, 'keydown', e => {
        if (!marks.length) return;
        const k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') show(active < marks.length - 1 ? active + 1 : 0);
        else if (k === 'ArrowLeft' || k === 'ArrowUp') show(active > 0 ? active - 1 : marks.length - 1);
        else if (k === 'Home') show(0);
        else if (k === 'End') show(marks.length - 1);
        else if ((k === 'Enter' || k === ' ') && active >= 0) select(active);
        else if (k === 'Escape') hide();
        else return;
        e.preventDefault();
      }),
      on(svg, 'blur', hide),
    );
  }
  function select(i) {
    const m = marks[i];
    el.dispatchEvent(new CustomEvent('efx:select', { bubbles: true, detail: { index: m.index ?? i, label: m.label, value: m.value, series: m.series } }));
  }

  /* data updates: el.dispatchEvent(new CustomEvent('efx:data', { detail: { labels, series } })) */
  offs.push(on(el, 'efx:data', e => {
    const d = e.detail || {};
    data = parseData(el, { ...o, source: '', data: JSON.stringify(d), labels: d.labels || [] });
    renderLegend();
    render(true);
  }));

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(rafThrottle(() => { if (Math.abs(el.clientWidth - w) > 1 || deco && Math.abs(el.clientHeight - h) > 1) render(true); })) : null;
  if (ro) ro.observe(el);

  renderLegend();
  render(false);
  const stopVis = played ? () => {} : onVisible(el, (vis, e) => {
    if (!vis || (e.intersectionRatio < 0.25 && e.intersectionRect.height < innerHeight * 0.25)) return;
    played = true;
    svg.querySelectorAll('.efx-chart__plot').forEach(p => p.classList.add('is-in'));
    stopVis();
  }, '0px', [0, 0.25]);

  return () => {
    offs.forEach(f => f());
    stopVis();
    if (ro) ro.disconnect();
    wrap.remove(); tip.remove(); legend.remove(); sr.remove();
    el.classList.remove('efx-chart');
    el.style.position = restore.pos;
    el.style.isolation = restore.iso;
  };
}
