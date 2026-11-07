/* scrub — scroll-scrubbed transform/filter/opacity tied to the element's progress through the viewport.
   <div class="efx-scrub" data-efx-y="80" data-efx-rotate="12" data-efx-opacity="1"></div>   (neutral → value)
   <img class="efx-scrub" data-efx-from="y:60 opacity:0" data-efx-to="y:0 opacity:1" data-efx-end=".5">
   Progress p: 0 when the top hits the viewport bottom, 1 when the bottom leaves the top. Writes --efx-p.
   data-efx-peak="center": progress becomes a triangle that peaks at 1 when the element center is at the viewport center (grow as it arrives, shrink as it leaves). */
import { onScroll, motionOK } from '../core.js';
import { ease as getEase } from './_easing.js';

const NEUTRAL = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 };
const parse = s => {
  const o = {};
  String(s).split(/[\s;,]+/).forEach(t => { const [k, v] = t.split(':'), n = parseFloat(v); if (k in NEUTRAL && Number.isFinite(n)) o[k] = n; });
  return o;
};

export default {
  name: 'scrub',
  selector: '.efx-scrub',
  defaults: { from: '', to: '', start: 0, end: 1, ease: 'linear', peak: 'none', x: 0, y: 0, rotate: 0, scale: 1, opacity: -1, blur: 0 },
  init(el, o) {
    if (!motionOK()) return;
    const A = { ...NEUTRAL, ...parse(o.from) };
    const B = { ...NEUTRAL, x: o.x, y: o.y, rotate: o.rotate, scale: o.scale, blur: o.blur, ...(o.opacity >= 0 ? { opacity: o.opacity } : {}), ...parse(o.to) };
    const ease = getEase(o.ease), span = (o.end - o.start) || 1;
    const s = el.style, saved = [s.translate, s.rotate, s.scale, s.opacity, s.filter, s.transition, s.willChange, s.getPropertyValue('--efx-p')];
    const use = k => A[k] !== B[k];
    const moves = use('x') || use('y'), turns = use('rotate'), zooms = use('scale'), fades = use('opacity'), blurs = use('blur');
    s.transition = 'none'; s.willChange = 'transform, opacity';
    let ty = 0, sc = A.scale;
    const stop = onScroll((y, vh) => {
      const r = el.getBoundingClientRect();
      // Undo our own translate/scale so the element's progress doesn't feed back into itself.
      const h0 = r.height / (sc || 1), top0 = r.top - ty - h0 * (1 - sc) / 2;
      let q = Math.min(1, Math.max(0, ((vh - top0) / (vh + h0) - o.start) / span));
      if (o.peak === 'center') q = 1 - Math.abs(2 * q - 1);
      q = ease(q);
      const v = k => A[k] + (B[k] - A[k]) * q;
      return () => {
        ty = v('y'); sc = v('scale');
        s.setProperty('--efx-p', q.toFixed(3));
        if (moves) s.translate = `${v('x').toFixed(1)}px ${ty.toFixed(1)}px`;
        if (turns) s.rotate = v('rotate').toFixed(2) + 'deg';
        if (zooms) s.scale = sc.toFixed(3);
        if (fades) s.opacity = v('opacity').toFixed(3);
        if (blurs) s.filter = `blur(${Math.max(0, v('blur')).toFixed(1)}px)`;
      };
    });
    return () => {
      stop();
      [s.translate, s.rotate, s.scale, s.opacity, s.filter, s.transition, s.willChange] = saved;
      saved[7] ? s.setProperty('--efx-p', saved[7]) : s.removeProperty('--efx-p');
    };
  },
};
