/* kinetic — kinetic typography bumper: one word or phrase per beat.
   <div class="efx-kinetic" data-efx-words="Ship|faster|with|Effix" data-efx-beat="600"></div>
   Screen readers get the whole sentence; the animated stage is aria-hidden. */
import { onVisible, motionOK, on } from '../core.js';

const STYLES = ['punch', 'slide', 'spin', 'blur', 'split'];
const TONES = ['var(--sh-primary,#6366f1)', 'var(--sh-success,#22c55e)', 'var(--sh-info,#0ea5e9)', 'var(--sh-warning,#f59e0b)', 'var(--sh-danger,#ef4444)', 'var(--sh-accent,#ec4899)'];

export default {
  name: 'kinetic',
  selector: '.efx-kinetic',
  defaults: { words: [], beat: 600, styles: STYLES, colors: [], random: false, hold: false },
  init(el, o) {
    const words = o.words.length ? o.words : el.textContent.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return;
    const html = el.innerHTML, sentence = words.join(' ');
    const sr = document.createElement('span'); sr.className = 'efx-kinetic__sr'; sr.textContent = sentence;
    const stage = document.createElement('span'); stage.className = 'efx-kinetic__stage'; stage.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    el.append(sr, stage);
    const styles = o.styles.filter(s => STYLES.includes(s)), list = styles.length ? styles : STYLES;
    const colors = o.colors.length ? o.colors : TONES;
    const cleanup = () => { el.innerHTML = html; el.classList.remove('is-kinetic'); el.style.removeProperty('--efx-kin'); };
    if (!motionOK()) { stage.textContent = sentence; el.classList.add('is-kinetic', 'is-static'); return () => { el.classList.remove('is-static'); cleanup(); }; }
    el.classList.add('is-kinetic');
    el.style.setProperty('--efx-kin', Math.min(o.beat * .75, 700) + 'ms');
    let cur = -1, timer = 0, vis = false, tab = !document.hidden, k = 0;
    const stop = () => { clearTimeout(timer); timer = 0; };
    const later = () => { if (cur + 1 < words.length) timer = setTimeout(() => show(cur + 1), o.beat); else if (!o.hold) timer = setTimeout(() => show(0), o.beat); };
    const show = i => {
      cur = i;
      const st = o.random ? list[Math.floor(Math.random() * list.length)] : list[k++ % list.length];
      const w = document.createElement('span');
      w.className = 'efx-kinetic__word k-' + st;
      w.style.color = colors[i % colors.length];
      if (st === 'split') [...words[i]].forEach((c, j) => { const s = document.createElement('span'); s.textContent = c; s.style.setProperty('--efx-i', j); w.appendChild(s); });
      else w.textContent = words[i];
      stage.textContent = '';
      stage.appendChild(w);
      later();
    };
    const sync = () => { stop(); if (vis && tab) { if (cur < 0) show(0); else later(); } };
    const offs = [on(document, 'visibilitychange', () => { tab = !document.hidden; sync(); })];
    const off = onVisible(el, v => { vis = v; sync(); });
    return () => { off(); offs.forEach(f => f()); stop(); cleanup(); };
  },
};
