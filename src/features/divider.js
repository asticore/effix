/* divider — animated SVG shape dividers between sections.
   <section style="position:relative"><div class="efx-divider" data-efx-shape="waves" data-efx-position="bottom"
     data-efx-animate="drift" data-efx-color="#fff"></div></section>
   Shapes: wave waves tilt curve triangle arrow zigzag clouds mountains drips steps spikes. */
import { onVisible, motionOK } from '../core.js';

/* parent -> { count, prev }: several dividers may share one parent; the first forces position:relative,
   the last to leave restores the original inline value. */
const parents = new WeakMap();
const claimParent = p => {
  let rec = parents.get(p);
  if (!rec) { rec = { count: 0, prev: p.style.position }; parents.set(p, rec); p.style.position = 'relative'; }
  rec.count++;
};
const releaseParent = p => {
  const rec = parents.get(p);
  if (!rec) return;
  if (--rec.count <= 0) { p.style.position = rec.prev; parents.delete(p); }
};

const f = n => +n.toFixed(1);
// wave layer: sampled sine, integer cycles per 1200 so tiles join seamlessly
const wave = (amp, cyc, ph, base) => [base + amp * Math.sin(ph), 'b', ox => {
  let d = '';
  for (let x = 10; x <= 1200; x += 10) d += `L${ox + x},${f(base + amp * Math.sin(6.2832 * cyc * x / 1200 + ph))}`;
  return d;
}];
const rep = (n, fn) => ox => { let d = '', w = 1200 / n; for (let i = 0; i < n; i++) d += fn(ox + i * w, w, i); return d; };
const poly = pts => ox => pts.map(p => `L${ox + p[0]},${p[1]}`).join('');
// shape -> [periodic, layers[[y0, fillSide, tile(ox)]], opacities]
const SHAPES = {
  wave: [1, [wave(28, 2, 0, 70)]],
  waves: [1, [wave(18, 2, 1, 50), wave(22, 3, 3, 70), wave(26, 2, 0, 85)], [.25, .5, 1]],
  tilt: [0, [[110, 'b', poly([[1200, 10]])]]],
  curve: [0, [[120, 'b', ox => `Q${ox + 600},-60 ${ox + 1200},120`]]],
  triangle: [0, [[120, 'b', poly([[600, 10], [1200, 120]])]]],
  arrow: [0, [[120, 'b', poly([[0, 60], [540, 60], [600, 15], [660, 60], [1200, 60], [1200, 120]])]]],
  zigzag: [1, [[90, 'b', rep(12, (x, w) => `L${x + w / 2},30L${x + w},90`)]]],
  clouds: [1, [[100, 'b', rep(6, (x, w) => `A${w / 2},60 0 0 1 ${x + w},100`)]]],
  mountains: [1, [[110, 'b', poly([[100, 50], [180, 85], [300, 20], [420, 80], [520, 45], [640, 95], [760, 35], [880, 85], [1000, 30], [1100, 70], [1200, 110]])]]],
  drips: [1, [[25, 't', rep(6, (x, w, i) => `L${x + 60},25L${x + 60},${[50, 85, 40][i % 3]}A10,10 0 0 0 ${x + 80},${[50, 85, 40][i % 3]}L${x + 80},25L${x + w},25`)]]],
  steps: [0, [[120, 'b', poly([[0, 100], [150, 100], [150, 85], [300, 85], [300, 65], [450, 65], [450, 50], [600, 50], [600, 35], [750, 35], [750, 20], [1200, 20], [1200, 120]])]]],
  spikes: [1, [[100, 'b', rep(24, (x, w) => `L${x + w / 2},20L${x + w},100`)]]],
};

export default {
  name: 'divider',
  selector: '.efx-divider',
  defaults: { shape: 'wave', color: '', height: 80, flip: false, invert: false, animate: 'none', speed: 12, position: '' },
  init(el, o) {
    const [per, layers, ops = []] = SHAPES[o.shape] || SHAPES.wave;
    const st = el.style, parent = el.parentElement;
    const move = motionOK() && o.animate !== 'none';
    const mode = o.animate === 'layers' ? 'layers' : !per && o.animate === 'drift' ? 'float' : o.animate;
    const drift = move && per && (mode === 'drift' || mode === 'layers');
    const W = drift ? 2400 : 1200;
    const side = layers[0][1];
    const saved = st.cssText;
    let claimed = false;
    if (o.color) st.setProperty('--efx-divider-color', o.color);
    st.height = o.height + 'px';
    if (o.flip || o.invert) st.transform = `scale(${o.flip ? -1 : 1},${o.invert ? -1 : 1})`;
    if (o.position) {
      st.position = 'absolute'; st.left = st.right = '0'; st.zIndex = '1';
      st[o.position === 'top' ? 'top' : 'bottom'] = '0';
      if (parent && (parents.has(parent) || getComputedStyle(parent).position === 'static')) { claimParent(parent); claimed = true; }
    }
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-efx-mode', move ? mode : 'none');
    st.setProperty('--efx-dv-dir', side === 't' ? 1 : -1);
    const mk = (k, op) => {
      let body = '';
      layers.forEach(([y0, s, tile], li) => {
        let d = `M0,${y0}`;
        for (let ox = 0; ox < W; ox += 1200) d += tile(ox);
        d += s === 't' ? `L${W},0L0,0Z` : `L${W},120L0,120Z`;
        body += `<path d="${d}"${ops[li] ? ` opacity="${ops[li]}"` : ''}/>`;
      });
      const s = `<svg viewBox="0 0 ${W} 120" preserveAspectRatio="none" focusable="false" class="efx-divider__svg" ` +
        `style="${drift ? 'width:200%;' : ''}${op < 1 ? `opacity:${op};` : ''}--efx-dv-t:${move ? o.speed : 0}s;` +
        `${k ? `animation-duration:${(o.speed * [1.5, 1, .7][k]).toFixed(1)}s;animation-delay:-${(o.speed * k / 3).toFixed(1)}s;` : ''}">${body}</svg>`;
      return s;
    };
    const copies = mode === 'layers' && move ? [0, 1, 2] : [0];
    el.innerHTML = copies.map(k => mk(k, copies.length > 1 ? [.35, .6, 1][k] : 1)).join('');
    el.classList.add('is-ready');
    const kind = drift ? 'drift' : move ? 'float' : '';
    if (kind) el.classList.add('efx-divider--' + kind);
    const stop = move ? onVisible(el, v => el.classList.toggle('is-paused', !v)) : () => {};
    return () => {
      stop();
      el.innerHTML = '';
      el.removeAttribute('aria-hidden'); el.removeAttribute('data-efx-mode');
      el.classList.remove('is-ready', 'is-paused', 'efx-divider--drift', 'efx-divider--float');
      st.cssText = saved;
      if (claimed) releaseParent(parent);
    };
  },
};
