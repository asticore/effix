/* lyrics — captions/lyrics synced to an <audio>/<video>: active line highlight, auto-scroll inside the box, karaoke fill, click to seek.
   <audio id="song" controls src="a.mp3"><track kind="captions" src="a.vtt"></audio>
   <div class="efx-lyrics" data-efx-for="#song" data-efx-karaoke data-efx-cues='[{"t":0,"text":"Hello"},{"t":2.5,"text":"world","words":[{"t":2.5,"w":"wor"},{"t":3,"w":"ld"}]}]'></div>
   Cues come from data-efx-cues, an inline <script type="application/json"> child, or the media's captions/subtitles <track> (WebVTT; <00:01.500> word stamps drive karaoke). */
import { on, motionOK } from '../core.js';

const ts = s => s.split(':').reduce((a, v) => a * 60 + parseFloat(v), 0);
const parse = a => (Array.isArray(a) ? a : []).map(c => ({ t: +c.t || 0, end: c.end, text: String(c.text == null ? '' : c.text), words: c.words })).sort((a, b) => a.t - b.t);

export default {
  name: 'lyrics',
  selector: '.efx-lyrics',
  defaults: { for: '', karaoke: false, scroll: true, seek: true, offset: 0 },
  init(el, o) {
    const m = (o.for && document.querySelector(o.for)) || (el.parentElement && el.parentElement.querySelector('audio,video'));
    if (!m) return console.warn('[effix] lyrics: media not found', o.for);
    const orig = el.innerHTML;
    const offs = [];
    let cues = [], lines = [], W = [], cur = -2, raf = 0, hold = 0, rm = [];
    const reduce = !motionOK();

    // 1. cues from attribute / inline JSON
    const sc = el.querySelector('script[type="application/json"]');
    try { cues = parse(JSON.parse(el.dataset.efxCues || (sc && sc.textContent) || '[]')); } catch (e) { console.warn('[effix] lyrics: bad cue JSON', e); }

    const ol = document.createElement('ol');
    ol.className = 'efx-lyrics__list';
    el.textContent = '';
    el.appendChild(ol);
    el.classList.toggle('efx-lyrics--karaoke', o.karaoke);

    const build = () => {
      ol.textContent = '';
      W = []; cur = -2;
      lines = cues.map((c, i) => {
        const li = document.createElement('li');
        li.className = 'efx-lyrics__line';
        const b = document.createElement(o.seek ? 'button' : 'span');
        b.className = 'efx-lyrics__btn';
        if (o.seek) { b.type = 'button'; b.onclick = () => { m.currentTime = Math.max(0, c.t - o.offset); }; }
        if (o.karaoke) {
          const end = c.end != null ? c.end : cues[i + 1] ? cues[i + 1].t : c.t + 4;
          let ws = c.words;
          if (!ws || !ws.length) {
            const parts = c.text.split(/\s+/).filter(Boolean), tot = parts.join('').length || 1;
            let a = c.t;
            ws = parts.map(w => { const t = a; a += (end - c.t) * w.length / tot; return { t, w }; });
          }
          W[i] = ws.map((w, k) => {
            const s = document.createElement('span');
            s.className = 'efx-lyrics__word';
            s.textContent = w.w;
            if (k) b.appendChild(document.createTextNode(' '));
            b.appendChild(s);
            return { s, t0: w.t, t1: ws[k + 1] ? ws[k + 1].t : end, p: 0 };
          });
        } else b.textContent = c.text;
        li.appendChild(b);
        ol.appendChild(li);
        return li;
      });
      sync();
    };

    const setP = (w, p) => { if (w.p !== p) { w.p = p; w.s.style.setProperty('--p', p); } };
    const sync = () => {
      const t = m.currentTime + o.offset;
      let a = -1;
      for (let i = 0; i < cues.length && cues[i].t <= t; i++) a = i;
      if (a !== cur) {
        if (lines[cur]) { lines[cur].removeAttribute('aria-current'); lines[cur].classList.remove('is-active'); }
        if (lines[a]) {
          lines[a].setAttribute('aria-current', 'true');
          lines[a].classList.add('is-active');
          if (o.scroll && Date.now() > hold) {
            const r = lines[a].getBoundingClientRect(), b = el.getBoundingClientRect();
            el.scrollTo({ top: r.top - b.top + el.scrollTop - (el.clientHeight - r.height) / 2, behavior: reduce ? 'auto' : 'smooth' });
          }
        }
        if (o.karaoke) W.forEach((ws, i) => ws.forEach(w => setP(w, i < a ? 1 : 0)));
        cur = a;
      }
      if (o.karaoke && W[a]) W[a].forEach(w => setP(w, reduce ? 1 : Math.min(1, Math.max(0, (t - w.t0) / ((w.t1 - w.t0) || 1)))));
    };
    const loop = () => { sync(); raf = m.paused || m.ended ? 0 : requestAnimationFrame(loop); };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    // 2. cues from a WebVTT track when none were given
    if (!cues.length) {
      const read = () => {
        const tt = [...m.textTracks].find(t => t.kind === 'captions' || t.kind === 'subtitles');
        if (!tt) return;
        if (tt.mode === 'disabled') { rm.push([tt, tt.mode]); tt.mode = 'hidden'; }
        if (!tt.cues || !tt.cues.length || tt.cues.length === cues.length) return;
        cues = parse([...tt.cues].map(c => {
          const text = c.text || '', parts = text.split(/<((?:\d+:)?\d+:\d+\.\d+)>/);
          let tm = c.startTime;
          const words = parts.length > 1 ? parts.reduce((a, p, k) => {
            if (k % 2) tm = ts(p);
            else p.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).forEach(w => a.push({ t: tm, w }));
            return a;
          }, []) : 0;
          return { t: c.startTime, end: c.endTime, text: text.replace(/<[^>]+>/g, ''), words };
        }));
        build();
      };
      read();
      [...m.querySelectorAll('track')].forEach(tr => offs.push(on(tr, 'load', read)));
      offs.push(on(m, 'loadedmetadata', read));
    }

    offs.push(on(m, 'play', kick), on(m, 'timeupdate', sync), on(m, 'seeked', sync), on(m, 'loadedmetadata', sync));
    const hush = () => { hold = Date.now() + 3000; };
    offs.push(on(el, 'wheel', hush, { passive: true }), on(el, 'touchmove', hush, { passive: true }));
    build();
    if (!m.paused) kick();

    return () => {
      cancelAnimationFrame(raf); raf = 0;
      offs.forEach(f => f());
      rm.forEach(([t, md]) => { t.mode = md; });
      el.classList.remove('efx-lyrics--karaoke');
      el.innerHTML = orig;
    };
  },
};
