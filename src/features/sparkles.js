/* sparkles — twinkling stars around an element (headline, button, badge).
   <span class="efx-sparkles" data-efx-count="12" data-efx-color="#fbbf24|#fff">Magic</span>
   Shapes come from the 'sparkle-shape' registry: Effix.add('sparkle-shape','heart',size=>'<svg…>'). */
import { onVisible, motionOK, themeColor, on, add, get } from '../core.js';

add('sparkle-shape', 'star', s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M12 0c.6 7 4.9 11.4 12 12-7.1.6-11.4 5-12 12-.6-7-4.9-11.4-12-12 7.1-.6 11.4-5 12-12z"/></svg>`);

export default {
  name: 'sparkles',
  selector: '.efx-sparkles',
  defaults: { count: 10, color: '', sizeMin: 8, sizeMax: 18, speed: 1, shape: 'star' },
  init(el, o) {
    if (!motionOK()) return;
    let restore = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restore = true; }
    const layer = document.createElement('span');
    layer.className = 'efx-sparkles__layer';
    layer.setAttribute('aria-hidden', 'true');
    const cols = o.color ? o.color.split('|').map(s => s.trim()).filter(Boolean) : [themeColor(el), '#fbbf24'];
    const shape = get('sparkle-shape', o.shape) || get('sparkle-shape', 'star');
    const r = (a, b) => a + Math.random() * (b - a);
    const place = s => { s.style.left = r(-8, 108) + '%'; s.style.top = r(-25, 125) + '%'; };
    for (let i = 0; i < Math.min(60, o.count); i++) {
      const s = document.createElement('span'), m = shape(r(o.sizeMin, o.sizeMax) | 0);
      s.className = 'efx-sparkles__s';
      typeof m === 'string' ? (s.innerHTML = m) : s.appendChild(m);
      s.style.color = cols[i % cols.length];
      s.style.animationDuration = r(.8, 1.6) / o.speed + 's';
      s.style.animationDelay = -r(0, 1.6) + 's';
      place(s);
      layer.appendChild(s);
    }
    el.appendChild(layer);
    const offs = [on(layer, 'animationiteration', e => place(e.target)), onVisible(el, v => layer.classList.toggle('is-paused', !v))];
    return () => { offs.forEach(f => f()); layer.remove(); if (restore) el.style.position = ''; };
  },
};
