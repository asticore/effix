/* schedule — show/hide content by date window, weekday and hours (local time).
   <div class="efx-schedule" hidden data-efx-from="2026-12-01" data-efx-until="2026-12-26T00:00">…</div>
   Add `hidden` in the HTML for mode="show" items to avoid a flash; JS removes it inside the window. */
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const date = s => { if (!s) return 0; const d = new Date(/^\d{4}-\d\d-\d\d$/.test(s) ? s + 'T00:00' : s); return isNaN(d) ? 0 : +d; };
const dayIdx = s => DAYS.indexOf(s.trim().slice(0, 3).toLowerCase());
const parseDays = s => {
  const set = new Set();
  s.split(',').forEach(p => {
    const [a, b] = p.split('-').map(dayIdx);
    if (a < 0) return;
    if (b === undefined) return set.add(a);
    for (let i = a; ; i = (i + 1) % 7) { set.add(i); if (i === b) break; }
  });
  return set;
};
const mins = s => { const [h, m = 0] = s.split(':'); return +h * 60 + +m; };

export default {
  name: 'schedule',
  selector: '.efx-schedule',
  defaults: { from: '', until: '', days: '', hours: '', mode: 'show' },
  init(el, o) {
    const from = date(o.from), until = date(o.until);
    const days = o.days ? parseDays(o.days) : null;
    const hr = o.hours ? o.hours.split('-').map(mins) : null;
    const wasHidden = el.hidden;
    let timer = 0, last;
    const run = () => {
      const now = new Date(), t = +now, m = now.getHours() * 60 + now.getMinutes();
      let inside = (!from || t >= from) && (!until || t < until) && (!days || days.has(now.getDay()));
      if (inside && hr && hr[0] !== hr[1]) inside = hr[0] < hr[1] ? m >= hr[0] && m < hr[1] : m >= hr[0] || m < hr[1];
      const on = o.mode === 'hide' ? !inside : inside;
      el.hidden = !on;
      el.classList.toggle('is-scheduled-off', !on);
      if (on !== last) { last = on; el.dispatchEvent(new CustomEvent('efx:change', { bubbles: true, detail: { on } })); }
      // next boundary: date edges, next midnight (days), hour edges today/tomorrow (hours)
      const at = (d, mm) => { const x = new Date(now); x.setDate(x.getDate() + d); x.setHours(0, mm, 0, 0); return +x; };
      const c = [from, until, days && at(1, 0), hr && at(0, hr[0]), hr && at(0, hr[1]), hr && at(1, hr[0]), hr && at(1, hr[1])].filter(x => x > t);
      timer = setTimeout(run, Math.min(Math.min(...c, t + 864e5) - t, 864e5) + 50);
    };
    run();
    return () => { clearTimeout(timer); el.hidden = wasHidden; el.classList.remove('is-scheduled-off'); };
  },
};
