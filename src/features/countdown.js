/* countdown — live countdown to a date.
   <div class="efx-countdown" data-efx-to="2027-01-31T18:00"></div>
   Fires `efx:done` (bubbles) and adds .is-done when it reaches zero. */
export default {
  name: 'countdown',
  selector: '.efx-countdown',
  defaults: { to: '', units: 'dhms', labels: ['Days', 'Hours', 'Minutes', 'Seconds'], expired: '', pad: true, compact: false },
  init(el, o) {
    const end = new Date(o.to).getTime();
    if (!Number.isFinite(end)) return;
    const saved = el.innerHTML, prev = ['role', 'aria-live', 'aria-label'].map(a => el.getAttribute(a));
    const SEC = { d: 86400, h: 3600, m: 60, s: 1 }, NAME = { d: 'day', h: 'hour', m: 'minute', s: 'second' };
    const us = [...'dhms'].filter(u => o.units.includes(u));
    const labels = o.labels, nums = {};
    const p2 = (n, u) => (o.pad && u !== 'd' ? String(n).padStart(2, '0') : String(n));
    el.setAttribute('role', 'timer'); el.setAttribute('aria-live', 'off');
    let tm = 0, done = false, lastMin = -1, txt = null;
    if (!o.compact) {
      el.textContent = '';
      us.forEach(u => {
        const cell = document.createElement('div'), n = document.createElement('span'), l = document.createElement('span');
        cell.className = 'efx-countdown__unit'; n.className = 'efx-countdown__num'; l.className = 'efx-countdown__label';
        l.textContent = labels['dhms'.indexOf(u)] || ''; nums[u] = n;
        cell.append(n, l); el.append(cell);
      });
    }
    const render = () => {
      let left = Math.max(0, Math.round((end - Date.now()) / 1000));
      const v = {};
      us.forEach(u => { v[u] = Math.floor(left / SEC[u]); left -= v[u] * SEC[u]; });
      if (o.compact) {
        const t = us.map(u => u === 'd' ? v.d + 'd' : p2(v[u], u));
        const s = (us[0] === 'd' ? t.shift() + ' ' : '') + t.join(':');
        if (s !== txt) el.textContent = txt = s;
      } else us.forEach(u => { const s = p2(v[u], u); if (nums[u].textContent !== s) nums[u].textContent = s; });
      const rem = Math.max(0, end - Date.now()), min = Math.floor(rem / 60000);
      if (min !== lastMin || rem === 0) {
        lastMin = min;
        let s = Math.round(rem / 1000);
        const parts = us.map(u => { const n = Math.floor(s / SEC[u]); s -= n * SEC[u]; return n ? `${n} ${NAME[u]}${n > 1 ? 's' : ''}` : ''; }).filter(Boolean);
        el.setAttribute('aria-label', rem ? parts.join(', ') + ' remaining' : (o.expired || 'Countdown finished'));
      }
      return rem;
    };
    const tick = () => {
      if (render() > 0) { tm = setTimeout(tick, 1000 - (Date.now() % 1000) + 5); return; }
      if (done) return;
      done = true;
      if (o.expired) el.textContent = o.expired;
      el.classList.add('is-done');
      el.dispatchEvent(new CustomEvent('efx:done', { bubbles: true }));
    };
    const vis = () => { clearTimeout(tm); if (!document.hidden && !done) tick(); };
    document.addEventListener('visibilitychange', vis);
    tick();
    return () => {
      clearTimeout(tm); document.removeEventListener('visibilitychange', vis);
      el.innerHTML = saved; el.classList.remove('is-done');
      ['role', 'aria-live', 'aria-label'].forEach((a, i) => prev[i] === null ? el.removeAttribute(a) : el.setAttribute(a, prev[i]));
    };
  },
};
