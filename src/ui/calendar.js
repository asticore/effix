/* calendar — month view with events (JSON or ICS) and an optional date / range picker.
   <div class="spark-calendar" data-spark-events='[{"date":"2026-11-20","title":"Launch"}]'></div>
   <div class="spark-calendar" data-spark-range data-spark-name="stay"></div>
   Events: JSON array [{ date, end?, title, color? }], an .ics / .json URL, or an inline <script type="application/json">.
   Fires `change` (detail = { value, end, events }) when a day (or range) is picked. */
import { on } from '../core.js';
import { shineWidgets } from './_shine.js';

const pad = n => String(n).padStart(2, '0');
const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = v => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Minimal ICS reader: VEVENT SUMMARY / DTSTART / DTEND (all-day ends are exclusive). */
export function parseICS(text) {
  const lines = String(text).replace(/\r?\n[ \t]/g, '').split(/\r?\n/), out = [];
  let ev = null;
  const day = (v, p) => {
    const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/.exec(v);
    if (!m) return null;
    if (m[7]) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
    return new Date(+m[1], +m[2] - 1, +m[3]);
  };
  for (const l of lines) {
    if (l === 'BEGIN:VEVENT') ev = {};
    else if (l === 'END:VEVENT') {
      if (ev && ev.s) {
        const s = ev.s, allDay = ev.allDay, e = ev.e ? (allDay ? addDays(ev.e, -1) : ev.e) : s;
        out.push({ date: key(s), end: key(e < s ? s : e), title: ev.title || '' });
      }
      ev = null;
    } else if (ev) {
      const i = l.indexOf(':'); if (i < 0) continue;
      const name = l.slice(0, i).split(';')[0], val = l.slice(i + 1);
      if (name === 'SUMMARY') ev.title = val.replace(/\\([,;nN\\])/g, (_, c) => (c === 'n' || c === 'N' ? ' ' : c));
      else if (name === 'DTSTART') { ev.s = day(val); ev.allDay = !/T/.test(val); }
      else if (name === 'DTEND') ev.e = day(val);
    }
  }
  return out;
}

export default {
  name: 'calendar',
  selector: '.spark-calendar',
  defaults: { events: '', range: false, picker: true, firstDay: 0, locale: '', month: '', value: '', min: '', max: '', name: '', label: 'Calendar' },
  init(el, o) {
    const saved = el.innerHTML, offs = [], sh = shineWidgets(), cls0 = el.getAttribute('class');
    const c = (shine, own) => (sh ? shine : own); // Shine's .calendar markup when its widgets CSS is loaded
    el.classList.add(...(sh ? ['calendar'] : ['spark-calendar--own']));
    const jsonTag = el.querySelector(':scope > script[type="application/json"]');
    let dead = false, events = [], sel = [null, null], view, focus;
    const loc = o.locale || undefined;
    const mn = parse(o.min), mx = parse(o.max), fd = ((Math.round(o.firstDay) % 7) + 7) % 7;
    const [v0, v1] = String(o.value).split('/').map(parse);
    if (v0) sel = [v0, o.range ? v1 || null : null];
    const m0 = parse(o.month + '-01') || v0 || new Date();
    view = new Date(m0.getFullYear(), m0.getMonth(), 1); focus = v0 || (view.getMonth() === new Date().getMonth() && view.getFullYear() === new Date().getFullYear() ? new Date() : view);

    el.textContent = '';
    const head = document.createElement('div'), title = document.createElement('div'), grid = document.createElement('div'), list = document.createElement('ul');
    const mkBtn = (cls, txt, label) => { const b = document.createElement('button'); b.type = 'button'; b.className = sh ? 'btn btn-ghost btn-icon btn-sm' : cls; b.textContent = txt; b.setAttribute('aria-label', label); return b; };
    const prev = mkBtn('spark-calendar__nav', '‹', 'Previous month'), nextB = mkBtn('spark-calendar__nav', '›', 'Next month');
    head.className = c('calendar-head', 'spark-calendar__head'); title.className = 'spark-calendar__title'; title.setAttribute('aria-live', 'polite');
    grid.className = c('calendar-grid', 'spark-calendar__grid'); grid.setAttribute('role', 'grid'); list.className = 'spark-calendar__events';
    head.append(prev, title, nextB); el.append(head, grid, list);
    el.setAttribute('aria-label', o.label);
    const input = o.name ? Object.assign(document.createElement('input'), { type: 'hidden', name: o.name }) : null;
    if (input) el.append(input);

    const fmtM = new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }), fmtD = new Intl.DateTimeFormat(loc, { dateStyle: 'full' });
    const wk = new Intl.DateTimeFormat(loc, { weekday: 'short' }), wkL = new Intl.DateTimeFormat(loc, { weekday: 'long' });
    const eventsOn = k => events.filter(e => k >= e.date && k <= (e.end || e.date));
    const disabled = d => (mn && d < mn) || (mx && d > mx);
    const same = (a, b) => a && b && key(a) === key(b);

    const render = () => {
      title.textContent = fmtM.format(view);
      grid.textContent = '';
      const hr = document.createElement('div'); hr.setAttribute('role', 'row'); hr.className = 'spark-calendar__row'; if (sh) hr.style.display = 'contents';
      for (let i = 0; i < 7; i++) {
        const d = new Date(2023, 0, 1 + ((fd + i) % 7)), c = document.createElement('div'), cc = (a, b) => (sh ? a : b);
        c.setAttribute('role', 'columnheader'); c.className = cc('calendar-dow', 'spark-calendar__dow'); c.textContent = wk.format(d); c.setAttribute('aria-label', wkL.format(d)); hr.append(c);
      }
      grid.append(hr);
      const first = new Date(view.getFullYear(), view.getMonth(), 1), lead = (first.getDay() - fd + 7) % 7;
      const dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), weeks = Math.ceil((lead + dim) / 7);
      const fk = key(focus), inView = focus.getMonth() === view.getMonth() && focus.getFullYear() === view.getFullYear();
      const lo = sel[0] && sel[1] ? (sel[0] < sel[1] ? sel[0] : sel[1]) : sel[0], hi = sel[0] && sel[1] ? (sel[0] < sel[1] ? sel[1] : sel[0]) : sel[0];
      for (let w = 0; w < weeks; w++) {
        const row = document.createElement('div'); row.setAttribute('role', 'row'); row.className = 'spark-calendar__row'; if (sh) row.style.display = 'contents';
        for (let i = 0; i < 7; i++) {
          const d = addDays(first, w * 7 + i - lead), k = key(d), out = d.getMonth() !== view.getMonth();
          const cell = document.createElement('div'); cell.setAttribute('role', 'gridcell'); if (sh) cell.style.display = 'contents';
          const b = document.createElement('button'); b.type = 'button'; b.className = sh ? 'calendar-day' : 'spark-calendar__day'; b.dataset.date = k;
          b.textContent = d.getDate(); b.tabIndex = k === fk && inView || (!inView && !out && d.getDate() === 1) ? 0 : -1;
          const ev = eventsOn(k);
          b.setAttribute('aria-label', fmtD.format(d) + (ev.length ? `, ${ev.length} event${ev.length > 1 ? 's' : ''}` : ''));
          if (out) b.classList.add(sh ? 'outside' : 'is-outside');
          if (same(d, new Date())) b.setAttribute('aria-current', 'date');
          if (disabled(d)) b.disabled = true;
          const picked = o.picker && lo && d >= lo && d <= hi;
          if (picked) {
            cell.setAttribute('aria-selected', 'true'); b.classList.add('is-selected'); if (same(d, lo)) b.classList.add('is-start'); if (same(d, hi)) b.classList.add('is-end');
            if (sh) { // Shine: aria-selected + .range-start / .range-end on the ends, .in-range between
              const ends = same(d, lo) || same(d, hi), span = !same(lo, hi);
              if (ends) b.setAttribute('aria-selected', 'true'); else b.classList.add('in-range');
              if (span && same(d, lo)) b.classList.add('range-start'); if (span && same(d, hi)) b.classList.add('range-end');
            }
          }
          if (ev.length) {
            b.classList.add('has-events');
            const dots = document.createElement('span'); dots.className = sh ? 'calendar-dots' : 'spark-calendar__dots'; dots.setAttribute('aria-hidden', 'true');
            ev.slice(0, 3).forEach(e => { const dot = document.createElement('i'); if (e.color && /^[\w#(),.% -]+$/.test(e.color)) dot.style.background = e.color; dots.append(dot); });
            b.append(dots);
          }
          cell.append(b); row.append(cell);
        }
        grid.append(row);
      }
      renderList();
    };
    const renderList = () => {
      list.textContent = '';
      const ref = sel[0] || focus, hi = sel[1] && sel[1] > ref ? sel[1] : ref;
      const shown = events.filter(e => e.date <= key(hi) && (e.end || e.date) >= key(ref));
      // nothing picked: list the events of the month in view
      const items = sel[0] ? shown : events.filter(e => { const a = parse(e.date), b = parse(e.end || e.date); return a < new Date(view.getFullYear(), view.getMonth() + 1, 1) && b >= view; });
      items.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 50).forEach(e => {
        const li = document.createElement('li'), t = document.createElement('time'), s = document.createElement('span');
        t.dateTime = e.date; t.textContent = e.end && e.end !== e.date ? `${e.date} – ${e.end}` : e.date; s.textContent = e.title;
        li.append(t, ' ', s); list.append(li);
      });
      list.hidden = !list.children.length;
    };
    const go = (d, keep) => {
      focus = d;
      if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) view = new Date(d.getFullYear(), d.getMonth(), 1);
      render();
      if (keep) { const b = grid.querySelector(`[data-date="${key(d)}"]`); if (b) b.focus(); }
    };
    const pick = d => {
      if (!o.picker || disabled(d)) return;
      if (o.range) { if (!sel[0] || sel[1]) sel = [d, null]; else sel = d < sel[0] ? [d, sel[0]] : [sel[0], d]; }
      else sel = [d, null];
      const done = !o.range || !!sel[1];
      if (input) input.value = sel[0] ? key(sel[0]) + (sel[1] ? '/' + key(sel[1]) : '') : '';
      focus = d; render();
      const b = grid.querySelector(`[data-date="${key(d)}"]`); if (b) b.focus();
      if (done) { const a = sel[0], z = sel[1]; el.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { value: key(a), end: z ? key(z) : '', events: events.filter(e => e.date <= key(z || a) && (e.end || e.date) >= key(a)) } })); }
    };
    offs.push(on(prev, 'click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); focus = new Date(view); render(); }));
    offs.push(on(nextB, 'click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); focus = new Date(view); render(); }));
    offs.push(on(grid, 'click', e => { const b = e.target.closest('[data-date]'); if (b) pick(parse(b.dataset.date)); }));
    offs.push(on(grid, 'keydown', e => {
      const b = e.target.closest('[data-date]'); if (!b) return;
      const d = parse(b.dataset.date), k = e.key;
      const mv = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[k];
      if (mv) go(addDays(d, mv), true);
      else if (k === 'Home') go(addDays(d, -((d.getDay() - fd + 7) % 7)), true);
      else if (k === 'End') go(addDays(d, 6 - ((d.getDay() - fd + 7) % 7)), true);
      else if (k === 'PageUp' || k === 'PageDown') { const n = k === 'PageUp' ? -1 : 1, t = new Date(d.getFullYear(), d.getMonth() + n + (e.shiftKey ? 11 * n : 0), 1); t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate())); go(t, true); }
      else return;
      e.preventDefault();
    }));

    const setEvents = raw => {
      let a = raw;
      if (typeof a === 'string') a = a.trim()[0] === '[' || a.trim()[0] === '{' ? JSON.parse(a) : parseICS(a);
      if (a && !Array.isArray(a)) a = a.events;
      events = (Array.isArray(a) ? a : []).filter(e => e && parse(e.date)).map(e => ({ date: String(e.date).slice(0, 10), end: e.end ? String(e.end).slice(0, 10) : '', title: String(e.title || e.name || ''), color: e.color }));
      if (!dead) render();
    };
    offs.push(on(el, 'spark:data', e => { try { setEvents(e.detail); } catch (err) { console.warn('[spark] calendar data', err); } }));
    const src = (o.events || '').trim();
    try {
      if (!src && jsonTag) setEvents(jsonTag.textContent);
      else if (src && /^(\[|\{|BEGIN:VCALENDAR)/.test(src)) setEvents(src);
      else if (src) fetch(src).then(r => r.text()).then(t => { if (!dead) setEvents(t); }).catch(err => console.warn('[spark] calendar events', err));
    } catch (err) { console.warn('[spark] calendar events', err); }
    render();
    return () => { dead = true; offs.forEach(f => f()); el.innerHTML = saved; el.removeAttribute('aria-label'); cls0 === null ? el.removeAttribute('class') : el.setAttribute('class', cls0); };
  },
};
