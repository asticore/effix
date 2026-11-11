/* audio — audio-reactive visualizer for an <audio>/<video>. Canvas + AnalyserNode, created lazily on the first 'play'.
   <audio id="song" controls src="song.mp3"></audio>
   <div class="efx-audio" data-efx-for="#song" data-efx-type="bars" style="height:160px"></div>
   Also writes --efx-level (0..1, smoothed) on the visualizer and on any [data-efx-level-for="#song"] element.
   Types: bars · wave · circle · scope · dots, or any Effix.add('audio-viz', name, (ctx, {freq, time, level, count}, w, h, colors) => …).
   Media must be same-origin, blob:/data: or carry crossOrigin + CORS headers: otherwise the analyser is skipped (the page would go silent). */
import { on, onVisible, motionOK, themeColor, cssVar, add } from '../core.js';

const split = s => {
  const out = []; let d = 0, cur = '';
  for (const ch of String(s)) {
    if (ch === '(') d++; else if (ch === ')') d = Math.max(0, d - 1);
    if ((ch === '|' || ch === ',') && !d) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map(c => c.trim()).filter(Boolean);
};
const pick = (c, f) => c[Math.min(c.length - 1, (f * c.length) | 0)];
const avg = (a, i, n, step) => { let s = 0; for (let k = 0; k < step; k++) s += a[i * step + k] || 0; return s / step / 255; };
const grad = (c, cols, x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); cols.forEach((k, i) => g.addColorStop(cols.length > 1 ? i / (cols.length - 1) : 0, k)); return g; };

add('audio-viz', {
  bars(c, d, w, h, cols) {
    const n = d.count, step = Math.max(1, Math.floor(d.freq.length * .75 / n)), bw = w / n;
    for (let i = 0; i < n; i++) {
      const v = Math.pow(avg(d.freq, i, n, step), 1.2), bh = Math.max(3, v * h * .96);
      c.fillStyle = pick(cols, i / n);
      c.beginPath();
      c.roundRect ? c.roundRect(i * bw + bw * .15, h - bh, bw * .7, bh, Math.min(bw * .35, 6)) : c.rect(i * bw + bw * .15, h - bh, bw * .7, bh);
      c.fill();
    }
  },
  wave(c, d, w, h, cols) {
    const t = d.time, n = t.length;
    c.lineWidth = 2.5; c.lineJoin = 'round'; c.strokeStyle = grad(c, cols, 0, w);
    c.beginPath();
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * w, y = h / 2 + (t[i] - 128) / 128 * h * .45; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
  },
  circle(c, d, w, h, cols) {
    const n = d.count, step = Math.max(1, Math.floor(d.freq.length * .75 / n)), m = Math.min(w, h), r0 = m * .2;
    c.lineCap = 'round'; c.lineWidth = Math.max(2, m * .018);
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.2832 - 1.5708, len = 3 + avg(d.freq, i, n, step) * m * .26;
      c.strokeStyle = pick(cols, i / n);
      c.beginPath();
      c.moveTo(w / 2 + Math.cos(a) * r0, h / 2 + Math.sin(a) * r0);
      c.lineTo(w / 2 + Math.cos(a) * (r0 + len), h / 2 + Math.sin(a) * (r0 + len));
      c.stroke();
    }
  },
  scope(c, d, w, h, cols) {
    const t = d.time, n = t.length, off = n >> 2, m = Math.min(w, h);
    c.lineWidth = 1.5; c.strokeStyle = cols[0]; c.shadowColor = cols[cols.length - 1]; c.shadowBlur = 10; c.lineJoin = 'round';
    c.beginPath();
    for (let i = 0; i < n; i++) { const x = w / 2 + (t[i] - 128) / 128 * m * .46, y = h / 2 + (t[(i + off) % n] - 128) / 128 * m * .46; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
  },
  dots(c, d, w, h, cols) {
    const n = Math.max(8, d.count >> 1), rows = 8, step = Math.max(1, Math.floor(d.freq.length * .75 / n)), cw = w / n, rh = h / rows, r = Math.max(1.5, Math.min(cw, rh) * .32);
    for (let i = 0; i < n; i++) {
      const lit = avg(d.freq, i, n, step) * rows;
      c.fillStyle = pick(cols, i / n);
      for (let j = 0; j < rows; j++) { c.globalAlpha = j < lit ? 1 : .14; c.beginPath(); c.arc(i * cw + cw / 2, h - j * rh - rh / 2, r, 0, 6.2832); c.fill(); }
    }
    c.globalAlpha = 1;
  },
});

/* One AnalyserNode per media element (createMediaElementSource works once per element). The graph lives as long as the element. */
const graphs = new WeakMap();
let AC;
const sameOK = m => {
  const u = m.currentSrc || m.src;
  if (!u || m.crossOrigin !== null) return true;
  try { const l = new URL(u, location.href); return /^(data|blob):$/.test(l.protocol) || l.origin === location.origin; } catch (e) { return true; }
};
function tap(m) {
  const had = graphs.get(m);
  if (had !== undefined) return had;
  const AX = window.AudioContext || window.webkitAudioContext;
  if (!AX) return null;
  if (!sameOK(m)) { graphs.set(m, null); console.warn('[effix] audio: cross-origin media without crossorigin attribute, visualizer skipped', m.currentSrc); return null; }
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null; // autoplay: tapping now could mute the page
  try {
    AC = AC || new AX();
    const a = AC.createAnalyser();
    a.fftSize = 512; a.smoothingTimeConstant = .8;
    AC.createMediaElementSource(m).connect(a);
    a.connect(AC.destination);
    const g = { a, f: new Uint8Array(a.frequencyBinCount), t: new Uint8Array(a.fftSize) };
    graphs.set(m, g);
    return g;
  } catch (e) { graphs.set(m, null); console.warn('[effix] audio: analyser unavailable', e); return null; }
}

export default {
  name: 'audio',
  selector: '.efx-audio',
  lazy: true,
  defaults: { for: '', type: 'bars', color: '', count: 48, gain: 1 },
  init(el, o, Effix) {
    const m = o.for ? document.querySelector(o.for) : el.querySelector('audio,video');
    if (!m || el === m) return console.warn('[effix] audio: media not found', o.for);
    const fn = Effix.get('audio-viz', o.type) || Effix.get('audio-viz', 'bars');
    let restore = false;
    if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; restore = true; }
    const cv = document.createElement('canvas');
    cv.className = 'efx-audio__canvas';
    cv.setAttribute('aria-hidden', 'true');
    el.appendChild(cv);
    const cx = cv.getContext('2d');
    let colors = split(o.color);
    if (!colors.length) for (let i = 1; i < 5; i++) { const v = cssVar(el, '--efx-chart-' + i); if (v) colors.push(v); }
    if (!colors.length) colors = [themeColor(el)];
    const count = Math.max(4, o.count | 0);
    const offs = [], reduce = !motionOK();
    let w = 0, h = 0, raf = 0, vis = true, playing = false, lv = 0, g = null, linked = [];
    const idle = { freq: new Uint8Array(256), time: new Uint8Array(512).fill(128), level: 0, count };
    const calm = { freq: idle.freq.map((_, i) => 70 + 40 * Math.cos(i / 40)), time: idle.time.map((_, i) => 128 + 22 * Math.sin(i / 14)), level: .2, count };
    const paint = d => { cx.clearRect(0, 0, w, h); cx.save(); cx.fillStyle = cx.strokeStyle = colors[0]; fn(cx, d, w, h, colors); cx.restore(); };
    const setLv = v => { const s = v.toFixed(3); [el, ...linked].forEach(n => n.style.setProperty('--efx-level', s)); };
    const rest = () => paint(reduce ? calm : idle);

    const tick = () => {
      raf = 0;
      if (!g) return;
      g.a.getByteFrequencyData(g.f);
      g.a.getByteTimeDomainData(g.t);
      let s = 0; const n = (g.f.length * .6) | 0;
      for (let i = 0; i < n; i++) s += g.f[i];
      lv += (Math.min(1, s / n / 255 * 1.6 * o.gain) - lv) * .25;
      paint({ freq: g.f, time: g.t, level: lv, count });
      setLv(lv);
      if (vis && (playing || lv > .01)) raf = requestAnimationFrame(tick);
      else if (!playing) { lv = 0; setLv(0); rest(); }
    };
    const kick = () => { if (!raf && g) raf = requestAnimationFrame(tick); };

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!raf) rest();
    };
    size();
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(size); ro.observe(el); offs.push(() => ro.disconnect()); }

    if (!reduce) {
      const onPlay = () => {
        linked = [...document.querySelectorAll('[data-efx-level-for]')].filter(n => document.querySelector(n.dataset.efxLevelFor) === m);
        g = tap(m);
        if (!g) return;
        if (AC.state === 'suspended') AC.resume();
        playing = true; kick();
      };
      const onStop = () => { playing = false; kick(); };
      offs.push(on(m, 'play', onPlay), on(m, 'playing', onPlay), on(m, 'pause', onStop), on(m, 'ended', onStop),
        onVisible(el, v => { vis = v; if (v) kick(); }));
      if (!m.paused) onPlay();
    }

    return () => {
      cancelAnimationFrame(raf); raf = 0; playing = false;
      offs.forEach(f => f());
      [el, ...linked].forEach(n => n.style.removeProperty('--efx-level'));
      cv.remove();
      if (restore) el.style.position = '';
    };
  },
};
