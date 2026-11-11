/* ascii — ASCII art from an <img>, <video>, <canvas> or big text. Samples luminance per cell into a <pre> (or canvas).
   <img class="efx-ascii" src="face.jpg" alt="Face" data-efx-cols="80">
   <video class="efx-ascii" autoplay muted loop playsinline src="clip.mp4" data-efx-color="source"></video>
   <div class="efx-ascii" data-efx-text="EFFIX" data-efx-cols="60"></div>
   Bright pixels map to the last character of data-efx-chars (data-efx-invert flips it). Sources must be same-origin or CORS-enabled
   (getImageData); on a tainted canvas the original is left in place with a console.warn. */
import { on, onVisible, motionOK } from '../core.js';

const CH = .6; // monospace glyph width / line height
const esc = c => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c);

export default {
  name: 'ascii',
  selector: '.efx-ascii',
  lazy: true,
  defaults: { cols: 80, chars: ' .:-=+*#%@', invert: false, color: 'mono', text: '', fps: 24, reveal: true, duration: 1200, output: 'pre', live: false },
  init(el, o) {
    const tag = el.tagName, isVid = tag === 'VIDEO', isCv = tag === 'CANVAS', isImg = tag === 'IMG';
    const text = !(isVid || isCv || isImg) ? (o.text || el.textContent.trim()) : '';
    if (!(isVid || isCv || isImg) && !text) return;
    const chars = o.chars || ' .:-=+*#%@', pool = chars.replace(/ /g, '') || chars, N = chars.length;
    const source = o.color === 'source' && !text, toCv = o.output === 'canvas';
    const offs = [], reduce = !motionOK();
    const parent = text ? el : el.parentElement || el;
    const initW = text ? 0 : el.getBoundingClientRect().width;

    // text → offscreen canvas (white on transparent)
    const mkText = () => {
      const cs = getComputedStyle(el), f = cs.fontWeight + ' 100px ' + cs.fontFamily, lines = text.split('\n');
      const c = document.createElement('canvas'), x = c.getContext('2d');
      x.font = f;
      c.width = Math.ceil(Math.max(...lines.map(l => x.measureText(l).width))) + 20; c.height = 130 * lines.length;
      x.font = f; x.textBaseline = 'middle'; x.fillStyle = '#fff';
      lines.forEach((l, i) => x.fillText(l, 10, 130 * (i + .5)));
      return c;
    };
    const was = { html: el.innerHTML, label: el.getAttribute('aria-label'), role: el.getAttribute('role') };
    let tc = text ? mkText() : null;

    const out = document.createElement(toCv ? 'canvas' : 'pre');
    out.className = 'efx-ascii__out';
    out.setAttribute('aria-hidden', 'true');
    if (text) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', text); el.textContent = ''; el.appendChild(out); }
    else { if (isImg && el.alt) el.setAttribute('aria-label', el.alt); el.classList.add('efx-ascii__src'); el.after(out); }
    if (isVid) offs.push(on(out, 'click', () => (el.paused ? el.play() : el.pause())));

    const oc = document.createElement('canvas'), ox = oc.getContext('2d', { willReadFrequently: true });
    const src = text ? () => tc : () => el;
    const dims = () => (text ? [tc.width, tc.height] : isImg ? [el.naturalWidth, el.naturalHeight] : isVid ? [el.videoWidth, el.videoHeight] : [el.width, el.height]);
    let g = null, S = null, raf = 0, last = 0, k0 = null, vis = false, dead = false, fs = 10, revealed = !(o.reveal && !reduce);

    const sample = () => {
      const [w, h] = dims();
      if (!w || !h) return null;
      const cols = Math.max(4, o.cols | 0), rows = Math.max(1, Math.round(cols * h / w * CH));
      oc.width = cols; oc.height = rows;
      let d;
      try { ox.drawImage(src(), 0, 0, cols, rows); d = ox.getImageData(0, 0, cols, rows).data; } catch (e) { return e.name === 'SecurityError' ? false : null; }
      const L = new Float32Array(cols * rows), C = source ? [] : null;
      for (let i = 0; i < L.length; i++) {
        const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2], l = (.2126 * r + .7152 * gg + .0722 * b) / 255 * d[i * 4 + 3] / 255;
        L[i] = o.invert ? 1 - l : l;
        if (C) C[i] = 'rgb(' + (r & 240) + ',' + (gg & 240) + ',' + (b & 240) + ')';
      }
      return { cols, rows, L, C };
    };
    const fit = () => {
      if (!g) return;
      const tw = Math.min(initW || 1e9, parent.clientWidth) || 300;
      fs = Math.max(2, tw / (g.cols * CH));
      if (!toCv) out.style.fontSize = fs + 'px';
    };
    const paint = k => {
      const { cols, rows, L, C } = g, n = cols * rows;
      if (k != null && (!S || S.length !== n)) { S = new Float32Array(n); for (let i = 0; i < n; i++) S[i] = ((i % cols) / cols * .5 + Math.random() * .5) * o.duration; }
      const at = i => {
        const ch = chars[Math.max(0, Math.min(N - 1, Math.round(L[i] * (N - 1))))];
        return k != null && S[i] > k && ch !== ' ' ? pool[(Math.random() * pool.length) | 0] : ch;
      };
      if (toCv) {
        const dpr = Math.min(devicePixelRatio || 1, 2), W = Math.ceil(cols * fs * CH), H = Math.ceil(rows * fs), c = out.getContext('2d');
        out.width = W * dpr; out.height = H * dpr; out.style.width = W + 'px'; out.style.height = H + 'px';
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.font = fs + 'px ui-monospace,Menlo,Consolas,monospace'; c.textBaseline = 'top';
        c.fillStyle = getComputedStyle(out).color;
        for (let i = 0; i < n; i++) { const ch = at(i); if (ch === ' ') continue; if (C) c.fillStyle = C[i]; c.fillText(ch, (i % cols) * fs * CH, ((i / cols) | 0) * fs); }
        return;
      }
      let s = '', run = null;
      for (let i = 0; i < n; i++) {
        if (C && C[i] !== run) { s += (run ? '</span>' : '') + '<span style="color:' + C[i] + '">'; run = C[i]; }
        s += esc(at(i)) + ((i + 1) % cols ? '' : '\n');
      }
      if (C) out.innerHTML = s + '</span>'; else out.textContent = s;
    };

    const live = () => (isVid && !el.paused && !el.ended && !reduce) || (isCv && o.live && !reduce);
    const frame = t => {
      raf = 0;
      if (dead) return;
      if (t - last >= 1000 / o.fps || !g) {
        last = t;
        if (!revealed && k0 == null) k0 = t;
        const r = (live() || !g) ? sample() : g;
        if (r === false) {
          console.warn('[effix] ascii: source is cross-origin/tainted (needs same-origin or CORS), showing the original');
          dead = true; out.remove(); el.classList.remove('efx-ascii__src');
          return;
        }
        if (r) { g = r; fit(); const k = revealed ? null : t - k0; paint(k); if (k != null && k >= o.duration) revealed = true; }
      }
      if (vis && g && (!revealed || live())) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && !dead && vis) raf = requestAnimationFrame(frame); };
    const refresh = () => { g = null; kick(); };

    offs.push(onVisible(out, v => { vis = v; if (v) kick(); else { cancelAnimationFrame(raf); raf = 0; } }));
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => { fit(); if (g && !raf) paint(revealed ? null : -1); }); ro.observe(parent); offs.push(() => ro.disconnect()); }
    if (isImg) offs.push(on(el, 'load', refresh));
    if (isVid) ['loadeddata', 'seeked', 'play'].forEach(e => offs.push(on(el, e, e === 'play' ? kick : refresh)));
    if (text && document.fonts) document.fonts.ready.then(() => { if (!dead) { tc = mkText(); refresh(); } });

    return () => {
      dead = true; cancelAnimationFrame(raf);
      offs.forEach(f => f());
      out.remove();
      el.classList.remove('efx-ascii__src');
      if (text) el.innerHTML = was.html;
      ['aria-label', 'role'].forEach((a, i) => { const v = [was.label, was.role][i]; v == null ? el.removeAttribute(a) : el.setAttribute(a, v); });
    };
  },
};
