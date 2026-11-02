/* stack — cards pile up as you scroll; covered cards scale down (and optionally blur/dim).
   <div class="efx-stack" data-efx-offset="80" data-efx-gap="16"><div class="card">1</div><div class="card">2</div></div>
   The container's ancestors must not clip overflow (position:sticky). */
import { onScroll, motionOK } from '../core.js';

export default {
  name: 'stack',
  selector: '.efx-stack',
  defaults: { offset: 80, gap: 16, shrink: 0.05, blur: 0, dim: 0.15 },
  init(el, o) {
    const cards = [...el.children], anim = motionOK();
    const saved = cards.map(c => [c.style.position, c.style.top, c.style.transformOrigin, c.style.scale, c.style.filter, c.style.willChange]);
    cards.forEach((c, i) => {
      c.style.position = 'sticky';
      c.style.top = (o.offset + i * o.gap) + 'px';
      if (anim) { c.style.transformOrigin = '50% 0'; c.style.willChange = 'scale'; }
    });
    const fx = o.blur || o.dim;
    const stop = anim && cards.length > 1 && onScroll(() => {
      // q[j]: how far card j has travelled onto the previous card (0 = not yet, 1 = fully stacked).
      const tops = cards.map(c => c.getBoundingClientRect().top);
      const q = cards.map((c, j) => (j ? 1 - Math.min(1, Math.max(0, (tops[j] - (o.offset + j * o.gap)) / (cards[j - 1].offsetHeight || 1))) : 0));
      return () => {
        let sum = 0;
        for (let i = cards.length - 1; i >= 0; i--) {
          cards[i].style.scale = (1 - o.shrink * sum).toFixed(4);
          if (fx) cards[i].style.filter = sum ? `${o.blur ? `blur(${(o.blur * Math.min(sum, 1)).toFixed(1)}px) ` : ''}brightness(${(1 - o.dim * Math.min(sum, 1)).toFixed(3)})` : '';
          sum += q[i];
        }
      };
    });
    return () => {
      stop && stop();
      cards.forEach((c, i) => { [c.style.position, c.style.top, c.style.transformOrigin, c.style.scale, c.style.filter, c.style.willChange] = saved[i]; });
    };
  },
};
