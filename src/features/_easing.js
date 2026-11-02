/* shared easing registry (not a feature). Users: Effix.add('easing', 'name', t => t) with t and result in 0..1 (overshoot ok).
   Features call ease(name) -> fn; unknown names fall back to linear. */
import { add, get } from '../core.js';

const io = t => (t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
const oc = t => 1 - Math.pow(1 - t, 3);
add('easing', {
  linear: t => t,
  'ease-in': t => t * t,
  'ease-out': t => 1 - (1 - t) * (1 - t),
  'ease-in-out': io,
  'ease-out-cubic': oc,
  'back-out': t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  'elastic-out': t => (t <= 0 || t >= 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * 2.0944) + 1),
  in: t => t * t, out: t => 1 - (1 - t) * (1 - t), inout: io,
});
export const ease = name => get('easing', name) || get('easing', 'linear');
