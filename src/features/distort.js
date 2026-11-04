/* distort — liquid/ripple warp via an inline SVG filter (feTurbulence + feDisplacementMap).
   <img class="efx-distort" src="…"> or any element. trigger: hover | always | view. */
import { on, onVisible, motionOK, finePointer } from '../core.js';

const NS = 'http://www.w3.org/2000/svg';
let uid = 0;
export default {
  name: 'distort',
  selector: '.efx-distort',
  defaults: { scale: 30, frequency: 0.02, speed: 1, trigger: 'hover' },
  init(el, o) {
    if (!motionOK() || (o.trigger === 'hover' && !finePointer())) return;
    const id = 'efx-distort-' + ++uid;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'efx-distort__svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${o.frequency}" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`;
    document.body.appendChild(svg);
    const turb = svg.querySelector('feTurbulence'), disp = svg.querySelector('feDisplacementMap');
    const prevFilter = el.style.filter;
    let target = 0, k = 0, t = 0, last = 0, raf = 0, vis = true, pulse = 0;
    const frame = now => {
      const dt = Math.min(now - last, 50) / 1000; last = now;
      t += dt * o.speed;
      k += (target - k) * Math.min(1, dt * 6);
      if (!target && k < 0.01) { raf = 0; el.style.filter = prevFilter; return; }
      const f = o.frequency;
      turb.setAttribute('baseFrequency', (f * (1 + 0.3 * Math.sin(t * 2.1))).toFixed(5) + ' ' + (f * (1 + 0.3 * Math.cos(t * 1.7))).toFixed(5));
      disp.setAttribute('scale', (o.scale * k).toFixed(2));
      raf = requestAnimationFrame(frame);
    };
    const go = v => {
      target = v;
      if (v && !raf && vis) { el.style.filter = `url(#${id})`; last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    const offs = [];
    let stop;
    if (o.trigger === 'hover') offs.push(on(el, 'pointerenter', e => e.pointerType !== 'touch' && go(1)), on(el, 'pointerleave', () => go(0)));
    else stop = onVisible(el, v => {
      vis = v;
      clearTimeout(pulse);
      if (!v) { cancelAnimationFrame(raf); raf = 0; el.style.filter = prevFilter; k = 0; return; }
      go(1);
      if (o.trigger === 'view') pulse = setTimeout(() => go(0), 900 / o.speed);
    });
    return () => {
      offs.forEach(f => f());
      stop && stop();
      clearTimeout(pulse);
      cancelAnimationFrame(raf);
      el.style.filter = prevFilter;
      svg.remove();
    };
  },
};
