/* proximity — letters (or icons) react to how close the pointer is.
   <h2 class="efx-proximity" data-efx-weight="800" data-efx-scale="1.3">Hover the letters</h2>
   <div class="efx-proximity cluster" data-efx-mode="items"><span data-efx-item>…</span>…</div>   (icon dock)
   Each piece interpolates by distance within `radius` px: scale, font weight (variable fonts), lift, color. */
import { on, onVisible, motionOK, finePointer } from '../core.js';

const subs = new Set();
let docOff = null;
const subscribe = fn => {
  subs.add(fn);
  if (!docOff) docOff = on(document, 'pointermove', e => subs.forEach(f => f(e)), { passive: true });
  return () => { subs.delete(fn); if (!subs.size && docOff) { docOff(); docOff = null; } };
};

export default {
  name: 'proximity',
  selector: '.efx-proximity',
  defaults: { radius: 120, scale: 1.4, weight: 0, lift: 0, color: '', mode: 'letters' },
  init(el, o) {
    if (!finePointer() || !motionOK()) return;
    let saved = null, pieces;
    if (o.mode === 'items') pieces = [...el.querySelectorAll('[data-efx-item]')];
    else {
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > 300) return;
      saved = el.innerHTML;
      const sr = document.createElement('span');
      sr.className = 'efx-proximity__sr'; sr.textContent = text;
      const vis = document.createElement('span');
      vis.className = 'efx-proximity__pieces'; vis.setAttribute('aria-hidden', 'true');
      text.split(' ').forEach((w, k) => {
        if (k) vis.append(' ');
        const wrap = document.createElement('span');
        wrap.className = 'efx-proximity__w';
        [...w].forEach(c => { const s = document.createElement('span'); s.className = 'efx-proximity__c'; s.textContent = c; wrap.append(s); });
        vis.append(wrap);
      });
      el.textContent = '';
      el.append(sr, vis);
      pieces = [...vis.querySelectorAll('.efx-proximity__c')];
    }
    if (!pieces.length) return;
    const base = parseFloat(getComputedStyle(el).fontWeight) || 400;
    const keep = pieces.map(p => ({ t: p.style.translate, s: p.style.scale, w: p.style.fontWeight }));
    if (o.color) { el.style.setProperty('--efx-pcolor', o.color); el.classList.add('has-pcolor'); }
    el.classList.add('is-proximity');
    let px = 0, py = 0, raf = 0, dirty = false, unsub = null;
    const paint = (p, t) => {
      p.style.scale = t ? (1 + (o.scale - 1) * t).toFixed(3) : '';
      p.style.translate = t && o.lift ? '0 ' + (-o.lift * t).toFixed(2) + 'px' : '';
      if (o.weight) p.style.fontWeight = t ? Math.round(base + (o.weight - base) * t) : '';
      if (o.color) p.style.setProperty('--efx-p', t.toFixed(3));
    };
    const frame = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const near = px > r.left - o.radius && px < r.right + o.radius && py > r.top - o.radius && py < r.bottom + o.radius;
      if (!near && !dirty) return;
      dirty = near;
      const rects = pieces.map(p => p.getBoundingClientRect()); // all reads, then writes
      pieces.forEach((p, i) => {
        const b = rects[i];
        const d = near ? Math.hypot(px - (b.left + b.width / 2), py - (b.top + b.height / 2)) : o.radius;
        const t = Math.max(0, 1 - d / o.radius);
        paint(p, t * t * (3 - 2 * t));
      });
    };
    const move = e => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(frame); };
    const stopVis = onVisible(el, v => {
      if (v && !unsub) unsub = subscribe(move);
      else if (!v && unsub) { unsub(); unsub = null; px = py = -1e5; dirty = true; frame(); }
    });
    return () => {
      stopVis(); unsub && unsub(); cancelAnimationFrame(raf);
      if (saved !== null) el.innerHTML = saved;
      else pieces.forEach((p, i) => { p.style.translate = keep[i].t; p.style.scale = keep[i].s; p.style.fontWeight = keep[i].w; p.style.removeProperty('--efx-p'); });
      el.style.removeProperty('--efx-pcolor');
      el.classList.remove('has-pcolor', 'is-proximity');
    };
  },
};
