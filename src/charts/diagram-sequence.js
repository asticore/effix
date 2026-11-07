/* diagram-sequence — UML sequence diagram from text (or JSON), drawn as SVG.
   <div class="efx-diagram-sequence"><script type="text/plain">
     Client -> API: GET /me          (solid = sync)
     API --> Client: 401             (dashed = return)
     Client ->> Queue: enqueue       (open arrow = async)
     note over API: refresh token
     loop retry … end   |   alt ok … else failed … end   |   opt / par
     participant DB as "Primary DB"   activate API / deactivate API   (or ->+ / -->-)
   </script></div>
   Hover a message to highlight it and its participants; ← → step through messages;
   data-efx-play draws the messages in one by one when scrolled into view. */
import { s, palette } from './_lib.js';
import { onVisible, motionOK, on } from '../core.js';

const ARROW = /^(.+?)\s*(-->>|->>|-->|->)([+-]?)\s*(.+?)\s*(?::\s*(.*))?$/;
const unq = v => String(v == null ? '' : v).trim().replace(/^"(.*)"$/, '$1');
const KIND = { '->': 'sync', '->>': 'async', '-->': 'return', '-->>': 'return' };
const FRAMES = 'loop|alt|opt|par|critical|break|rect';

/** text → { parts:[{id,label}], ev:[…] } */
function parseText(src) {
  const parts = [], ev = [];
  let title = '', numbers = false;
  const add = (id, label) => { id = unq(id); if (id && !parts.some(p => p.id === id)) parts.push({ id, label: unq(label) || id }); return id; };
  String(src).split(/\r?\n/).forEach(raw => {
    const line = raw.trim();
    let m;
    if (!line || /^(#|\/\/|%%)/.test(line)) return;
    if ((m = line.match(/^(?:participant|actor)\s+(.+?)(?:\s+as\s+(.+))?$/i))) add(m[1], m[2]);
    else if ((m = line.match(/^title\s*:?\s*(.+)$/i))) title = m[1];
    else if (/^autonumber$/i.test(line)) numbers = true;
    else if ((m = line.match(/^note\s+(over|left of|right of)\s+([^:]+?)\s*:\s*(.*)$/i))) ev.push({ t: 'note', pos: m[1].toLowerCase().split(' ')[0], on: m[2].split(',').map(x => add(x)), text: m[3] });
    else if ((m = line.match(new RegExp('^(' + FRAMES + ')\\b\\s*(.*)$', 'i')))) ev.push({ t: 'open', kind: m[1].toLowerCase(), text: m[2] });
    else if ((m = line.match(/^else\b\s*(.*)$/i))) ev.push({ t: 'else', text: m[1] });
    else if (/^end$/i.test(line)) ev.push({ t: 'end' });
    else if ((m = line.match(/^(activate|deactivate)\s+(.+)$/i))) ev.push({ t: m[1].toLowerCase(), who: add(m[2]) });
    else if ((m = line.match(ARROW))) ev.push({ t: 'msg', from: add(m[1]), to: add(m[4]), text: m[5] || '', kind: KIND[m[2]], dashed: m[2][1] === '-', act: m[3] });
  });
  return { parts, ev, title, numbers };
}

/** JSON { participants:[…], messages:[…] } → same shape */
function parseJSON(d) {
  const parts = [], ev = [];
  const add = p => { const o = p && typeof p === 'object' ? p : { id: p }; const id = unq(o.id ?? o.name); if (id && !parts.some(x => x.id === id)) parts.push({ id, label: unq(o.label) || id }); return id; };
  (Array.isArray(d.participants) ? d.participants : []).forEach(add);
  (Array.isArray(d.messages) ? d.messages : Array.isArray(d.steps) ? d.steps : Array.isArray(d) ? d : []).forEach(m => {
    if (!m || typeof m !== 'object') return;
    if (m.note != null) ev.push({ t: 'note', pos: m.left ? 'left' : m.right ? 'right' : 'over', on: [].concat(m.over ?? m.left ?? m.right ?? m.on ?? []).map(add), text: String(m.note) });
    else if (m.frame) ev.push({ t: 'open', kind: String(m.frame).toLowerCase(), text: m.label || '' });
    else if (m.else != null) ev.push({ t: 'else', text: m.else === true ? '' : String(m.else) });
    else if (m.end) ev.push({ t: 'end' });
    else if (m.from != null && m.to != null) {
      const k = String(m.kind || m.type || 'sync').toLowerCase();
      ev.push({ t: 'msg', from: add(m.from), to: add(m.to), text: String(m.text ?? m.label ?? ''), kind: k === 'return' ? 'return' : k === 'async' ? 'async' : 'sync', dashed: k === 'return', act: m.act || '' });
    }
  });
  return { parts, ev, title: String(d.title || ''), numbers: !!d.numbers };
}

export default {
  name: 'diagram-sequence',
  selector: '.efx-diagram-sequence',
  lazy: true,
  defaults: { data: '', play: false, step: 420, activations: false, numbers: false, bottom: false, gap: 0, colors: [], title: '', tooltip: true },
  init(el, o) {
    const src0 = () => {
      const raw = String(o.data || '').trim();
      if (raw) return raw;
      const n = el.querySelector(':scope > script[type="text/plain"], :scope > script[type="text/x-sequence"], :scope > pre');
      return n ? n.textContent : '';
    };
    let src = src0();
    const pre = el.querySelector(':scope > pre');
    const preHidden = pre && pre.hidden;
    if (pre) pre.hidden = true;
    const restore = { pos: el.style.position };
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.classList.add('efx-seq');
    const wrap = document.createElement('div');
    wrap.className = 'efx-seq__wrap';
    const svg = s('svg', { class: 'efx-seq__svg', role: 'img', focusable: 'false', tabindex: '0' });
    const tip = document.createElement('div');
    tip.className = 'efx-seq__tip'; tip.setAttribute('role', 'status'); tip.hidden = true;
    const sr = document.createElement('ol');
    sr.className = 'efx-seq__sr';
    wrap.appendChild(svg);
    el.append(wrap, tip, sr);

    let msgs = [], active = -1, W = 0, H = 0, played = !(o.play && motionOK());
    const playing = !played;
    const cache = new Map();
    let meas = null;
    const tw = str => {
      if (cache.has(str)) return cache.get(str);
      meas.textContent = str;
      let w = 0;
      try { w = meas.getComputedTextLength(); } catch (e) { /* not laid out */ }
      if (!w) w = str.length * 7;
      cache.set(str, w); return w;
    };
    const wrapText = (str, max) => {
      const lines = []; let cur = '';
      String(str).split(/\\n|\n/).forEach(seg => {
        cur = '';
        seg.split(/\s+/).filter(Boolean).forEach(w => {
          const t = cur ? cur + ' ' + w : w;
          if (cur && tw(t) > max) { lines.push(cur); cur = w; } else cur = t;
        });
        lines.push(cur);
      });
      return lines;
    };

    function render() {
      let json = null;
      if (/^[[{]/.test(src.trim())) { try { json = JSON.parse(src); } catch (e) { json = null; } }
      const model = json ? parseJSON(json) : parseText(src);
      const { parts, ev } = model;
      const showNum = o.numbers || model.numbers;
      [...svg.childNodes].forEach(n => n.remove());
      cache.clear();
      msgs = []; active = -1; tip.hidden = true;
      const label = o.title || model.title || el.getAttribute('aria-label') || 'Sequence diagram';
      svg.setAttribute('aria-label', label + (o.tooltip ? '. Use arrow keys to step through the messages.' : ''));
      sr.innerHTML = '';
      if (!parts.length) { svg.setAttribute('viewBox', '0 0 10 10'); return; }
      meas = s('text', { class: 'efx-seq__m', x: 0, y: 0, 'aria-hidden': 'true' }, svg);
      const idx = Object.fromEntries(parts.map((p, i) => [p.id, i]));
      const n = parts.length, colors = palette(el, o, n);

      /* ---- phase 1: vertical flow ---- */
      const HH = 34, Y0 = 8 + HH + 12;
      let y = Y0, lastY = y, k = 0;
      const items = [], stack = [], frames = [], bars = [], open = Array.from({ length: n }, () => []);
      const push = it => { items.push(it); stack.forEach(f => f.items.push(it)); return it; };
      ev.forEach(e => {
        if (e.t === 'msg') {
          const a = idx[e.from], b = idx[e.to], self = a === b;
          const up = e.act === '+' || (o.activations && !e.dashed && e.kind !== 'return');
          const down = e.act === '-' || (o.activations && e.kind === 'return');
          const my = y + 24;
          if (up) open[b].push(my);
          const off = i => (open[i].length ? 5 + 4 * (open[i].length - 1) : 0);
          const it = push({ t: 'msg', e, a, b, self, y: my, oa: off(a), ob: off(b), step: k++, num: msgs.length + 1 });
          if (down && open[a].length) bars.push({ c: a, d: open[a].length - 1, y0: open[a].pop(), y1: my });
          msgs.push(it); y = my + (self ? 34 : 14); lastY = my;
        } else if (e.t === 'note') {
          const cols = e.on.map(i => idx[i]).sort((p, q) => p - q);
          const lines = wrapText(e.text, cols.length > 1 ? 220 : 170);
          const h = lines.length * 16 + 12;
          push({ t: 'note', e, a: cols[0] ?? 0, b: cols[cols.length - 1] ?? 0, lines, h, y, step: k++, w: Math.max(60, Math.max(...lines.map(tw)) + 24) });
          y += h + 14;
        } else if (e.t === 'open') {
          const f = { kind: e.kind, text: e.text, y0: y, elses: [], items: [], depth: stack.length, step: k++ };
          stack.push(f); frames.push(f); y += 28;
        } else if (e.t === 'else' && stack.length) {
          const f = stack[stack.length - 1]; y += 6; f.elses.push({ y, text: e.text, step: k++ }); y += 24;
        } else if (e.t === 'end' && stack.length) {
          const f = stack.pop(); f.y1 = y; y += 10;
        } else if (e.t === 'activate') open[idx[e.who]].push(lastY + 12);
        else if (e.t === 'deactivate' && open[idx[e.who]].length) bars.push({ c: idx[e.who], d: open[idx[e.who]].length - 1, y0: open[idx[e.who]].pop(), y1: lastY + 12 });
      });
      while (stack.length) { const f = stack.pop(); f.y1 = y; y += 10; }
      open.forEach((st, c) => st.forEach((y0, d) => bars.push({ c, d, y0, y1: y + 2 })));
      const bottom = y + 16;
      H = bottom + (o.bottom ? HH + 8 : 0) + 8;
      // outer frames get more padding than the frames nested inside them
      frames.slice().sort((p, q) => q.depth - p.depth).forEach(f => {
        f.h = 1 + Math.max(0, ...frames.filter(g => g.depth > f.depth && g.y0 >= f.y0 && g.y1 <= f.y1).map(g => g.h));
        f.pad = 12 + 9 * (f.h - 1);
      });

      /* ---- phase 2: horizontal spacing ---- */
      const hw = parts.map(p => Math.max(70, tw(p.label) + 28));
      const minGap = o.gap > 0 ? o.gap : 130;
      const gap = Array.from({ length: Math.max(0, n - 1) }, (_, i) => Math.max(minGap, (hw[i] + hw[i + 1]) / 2 + 18));
      let mL = hw[0] / 2 + 10, mR = hw[n - 1] / 2 + 10;
      const need = [];
      items.forEach(it => {
        if (it.t === 'msg') {
          const t = tw((showNum ? it.num + '. ' : '') + it.e.text) + 40;
          if (it.self) { const w = tw(it.e.text) + 64; if (it.a < n - 1) need.push([it.a, it.a + 1, w]); else mR = Math.max(mR, w); }
          else need.push([Math.min(it.a, it.b), Math.max(it.a, it.b), t]);
        } else {
          const w = it.w;
          if (it.e.pos === 'left') { if (it.a > 0) need.push([it.a - 1, it.a, w + 24]); else mL = Math.max(mL, w + 24); }
          else if (it.e.pos === 'right') { if (it.a < n - 1) need.push([it.a, it.a + 1, w + 24]); else mR = Math.max(mR, w + 24); }
          else if (it.a !== it.b) need.push([it.a, it.b, w - 30]);
          else { mL = Math.max(mL, it.a === 0 ? w / 2 + 12 : 0); mR = Math.max(mR, it.a === n - 1 ? w / 2 + 12 : 0); }
        }
      });
      need.sort((p, q) => (p[1] - p[0]) - (q[1] - q[0]));
      for (let pass = 0; pass < 2; pass++) need.forEach(([i, j, w]) => {
        let have = 0; for (let g = i; g < j; g++) have += gap[g];
        if (have < w) for (let g = i; g < j; g++) gap[g] += (w - have) / (j - i);
      });
      const fpad = frames.length ? 12 + 9 * Math.max(...frames.map(f => f.h - 1)) : 0;
      mL += fpad; mR += fpad;
      const X = []; let xx = mL;
      for (let i = 0; i < n; i++) { X.push(xx); xx += gap[i] || 0; }
      W = Math.ceil(X[n - 1] + mR);
      meas.remove();

      /* ---- phase 3: draw ---- */
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      svg.style.maxWidth = W + 'px';
      const plot = s('g', { class: 'efx-seq__plot' + (played ? ' is-in' : '') }, svg);
      const step = i => `--i:${i}`;
      const ext = it => {
        if (it.t === 'msg') return it.self ? [X[it.a] - 8, X[it.a] + 50 + tw(it.e.text)] : [Math.min(X[it.a], X[it.b]), Math.max(X[it.a], X[it.b])];
        if (it.e.pos === 'left') return [X[it.a] - 10 - it.w, X[it.a] - 10];
        if (it.e.pos === 'right') return [X[it.a] + 10, X[it.a] + 10 + it.w];
        const c = (X[it.a] + X[it.b]) / 2, w = Math.max(it.w, X[it.b] - X[it.a] + 36);
        return [c - w / 2, c + w / 2];
      };
      // frames (behind everything)
      frames.slice().sort((p, q) => p.depth - q.depth).forEach(f => {
        const xs = f.items.length ? f.items.map(ext) : [[X[0], X[n - 1]]];
        const x0 = Math.min(...xs.map(v => v[0])) - f.pad, x1 = Math.max(...xs.map(v => v[1])) + f.pad;
        const g = s('g', { class: 'efx-seq__frame efx-seq__step', style: step(f.step) }, plot);
        s('rect', { x: x0, y: f.y0, width: x1 - x0, height: f.y1 - f.y0, rx: 4, class: 'efx-seq__frame-box' }, g);
        const tgw = tw(f.kind) + 18;
        s('path', { d: `M${x0},${f.y0}h${tgw}v10l-8,8h${-tgw + 8}z`, class: 'efx-seq__tag' }, g);
        s('text', { x: x0 + 9, y: f.y0 + 13, class: 'efx-seq__tag-t' }, g).textContent = f.kind;
        if (f.text) s('text', { x: x0 + tgw + 8, y: f.y0 + 14, class: 'efx-seq__frame-t' }, g).textContent = '[' + f.text + ']';
        f.elses.forEach(l => {
          s('line', { x1: x0, x2: x1, y1: l.y, y2: l.y, class: 'efx-seq__else' }, g);
          if (l.text) s('text', { x: x0 + 9, y: l.y + 15, class: 'efx-seq__frame-t' }, g).textContent = '[' + l.text + ']';
        });
      });
      // lifelines + headers
      const life = [], head = [];
      parts.forEach((p, i) => {
        const g = s('g', { class: 'efx-seq__p', style: `--c:${colors[i]}` }, plot);
        life.push(g);
        s('line', { x1: X[i], x2: X[i], y1: 8 + HH, y2: bottom, class: 'efx-seq__life' }, g);
        const box = (yy) => {
          s('rect', { x: X[i] - hw[i] / 2, y: yy, width: hw[i], height: HH, rx: 6, class: 'efx-seq__head' }, g);
          s('text', { x: X[i], y: yy + HH / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'efx-seq__head-t' }, g).textContent = p.label;
        };
        box(8);
        if (o.bottom) box(bottom);
        head.push(g);
      });
      bars.forEach(b => s('rect', { x: X[b.c] - 5 + b.d * 4, y: b.y0, width: 10, height: Math.max(8, b.y1 - b.y0), class: 'efx-seq__bar', style: `--c:${colors[b.c]}` }, plot));
      // events in order
      const nodeFor = new Map();
      items.forEach(it => {
        if (it.t === 'note') {
          const [x0, x1] = ext(it);
          const g = s('g', { class: 'efx-seq__note efx-seq__step', style: step(it.step) }, plot);
          s('rect', { x: x0, y: it.y, width: x1 - x0, height: it.h, rx: 3, class: 'efx-seq__note-box' }, g);
          it.lines.forEach((l, i) => s('text', { x: (x0 + x1) / 2, y: it.y + 6 + 16 * i + 8, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'efx-seq__note-t' }, g).textContent = l);
        } else {
          const { e } = it, dir = X[it.b] >= X[it.a] ? 1 : -1;
          const g = s('g', { class: `efx-seq__msg efx-seq__step is-${e.kind}${it.self ? ' is-self' : ''} ${it.self || dir > 0 ? 'to-r' : 'to-l'}`, style: `${step(it.step)};--c:${colors[it.a]}`, 'data-i': msgs.indexOf(it) }, plot);
          const text = (showNum ? it.num + '. ' : '') + e.text;
          let d, ax, ay, adir, lx, ly, anchor = 'middle';
          if (it.self) {
            const x = X[it.a] + it.oa, r = x + 36;
            d = `M${x},${it.y}H${r}V${it.y + 18}H${x + it.ob + 1}`; ax = x + it.ob + 1; ay = it.y + 18; adir = -1; lx = r + 8; ly = it.y + 9; anchor = 'start';
          } else {
            const x0 = X[it.a] + dir * it.oa, x1 = X[it.b] - dir * it.ob;
            d = `M${x0},${it.y}H${x1}`; ax = x1; ay = it.y; adir = dir; lx = (x0 + x1) / 2; ly = it.y - 7;
          }
          s('path', { d, class: 'efx-seq__hit' }, g);
          s('path', { d, class: 'efx-seq__line' + (e.dashed ? ' is-dashed' : '') }, g);
          const sz = 8;
          if (e.kind === 'sync') s('path', { d: `M${ax},${ay}l${-adir * sz},-4.5v9z`, class: 'efx-seq__arrow is-fill' }, g);
          else s('path', { d: `M${ax - adir * sz},${ay - 4.5}L${ax},${ay}L${ax - adir * sz},${ay + 4.5}`, class: 'efx-seq__arrow', fill: 'none' }, g);
          if (text) s('text', { x: lx, y: ly, 'text-anchor': anchor, class: 'efx-seq__label' }, g).textContent = text;
          it.node = g; it.from = parts[it.a], it.to = parts[it.b];
          it.mx = it.self ? X[it.a] + 36 : (X[it.a] + X[it.b]) / 2;
          nodeFor.set(g, it);
        }
      });
      // accessible description, in order
      const stk = [];
      ev.forEach(e => {
        let t = '';
        if (e.t === 'msg') t = `${unq(e.from)} ${e.kind === 'return' ? 'replies to' : e.kind === 'async' ? 'sends asynchronously to' : 'calls'} ${unq(e.to)}${e.text ? ': ' + e.text : ''}`;
        else if (e.t === 'note') t = `Note ${e.pos === 'over' ? 'over' : e.pos + ' of'} ${e.on.join(', ')}: ${e.text}`;
        else if (e.t === 'open') { stk.push(e.kind); t = `Start ${e.kind}${e.text ? ': ' + e.text : ''}`; }
        else if (e.t === 'else') t = `Else${e.text ? ': ' + e.text : ''}`;
        else if (e.t === 'end' && stk.length) t = `End ${stk.pop()}`;
        if (t) sr.appendChild(Object.assign(document.createElement('li'), { textContent: t }));
      });
      render.parts = parts; render.life = life; render.nodeFor = nodeFor; render.plot = plot;
    }

    /* ---- interaction ---- */
    const clear = () => {
      active = -1; tip.hidden = true;
      svg.classList.remove('has-hot');
      svg.querySelectorAll('.is-hot').forEach(n => n.classList.remove('is-hot'));
    };
    function hot(i, withTip) {
      clear();
      const it = msgs[i];
      if (!it) return;
      active = i;
      svg.classList.add('has-hot');
      it.node.classList.add('is-hot');
      render.life[it.a].classList.add('is-hot'); render.life[it.b].classList.add('is-hot');
      if (!withTip || !o.tooltip) return;
      tip.textContent = '';
      const b = document.createElement('strong');
      b.textContent = `${it.num}. ${it.from.label} → ${it.to.label}`;
      tip.appendChild(b);
      if (it.e.text) { const sp = document.createElement('span'); sp.textContent = it.e.text; tip.appendChild(sp); }
      tip.hidden = false;
      const r = el.getBoundingClientRect(), sv = svg.getBoundingClientRect(), sc = sv.width / W;
      const x = sv.left - r.left + it.mx * sc, yy = sv.top - r.top + it.y * sc;
      tip.style.left = Math.max(0, Math.min(r.width - tip.offsetWidth, x - tip.offsetWidth / 2)) + 'px';
      tip.style.top = yy + 12 + 'px';
    }
    const at = e => { const g = e.target.closest && e.target.closest('.efx-seq__msg'); return g ? +g.getAttribute('data-i') : -1; };
    const offs = [
      on(svg, 'pointerover', e => { const i = at(e); if (i >= 0) { if (i !== active) hot(i, false); } else if (active >= 0) clear(); }),
      on(svg, 'pointerleave', clear),
      on(svg, 'click', e => { const i = at(e); if (i >= 0) { const it = msgs[i]; el.dispatchEvent(new CustomEvent('efx:select', { bubbles: true, detail: { index: i, label: it.e.text, from: it.from.id, to: it.to.id } })); } }),
      on(svg, 'keydown', e => {
        if (!msgs.length) return;
        const k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') hot(active < msgs.length - 1 ? active + 1 : 0, true);
        else if (k === 'ArrowLeft' || k === 'ArrowUp') hot(active > 0 ? active - 1 : msgs.length - 1, true);
        else if (k === 'Home') hot(0, true);
        else if (k === 'End') hot(msgs.length - 1, true);
        else if (k === 'Escape') clear();
        else return;
        e.preventDefault();
      }),
      on(svg, 'blur', clear),
      on(el, 'efx:data', e => { const d = e.detail; if (d != null) { src = typeof d === 'string' ? d : JSON.stringify(d); render(); } }),
    ];

    render();
    let stopVis = () => {};
    if (playing) {
      svg.classList.add('is-play');
      svg.style.setProperty('--efx-seq-step', o.step + 'ms');
      stopVis = onVisible(el, (vis, e) => {
        if (!vis || (e.intersectionRatio < 0.25 && e.intersectionRect.height < innerHeight * 0.25)) return;
        played = true; stopVis();
        svg.querySelectorAll('.efx-seq__plot').forEach(p => p.classList.add('is-in'));
      }, '0px', [0, 0.1, 0.25, 0.5]);
    }

    return () => {
      offs.forEach(f => f());
      stopVis();
      wrap.remove(); tip.remove(); sr.remove();
      el.classList.remove('efx-seq');
      el.style.position = restore.pos;
      if (!el.getAttribute('style')) el.removeAttribute('style');
      if (pre) pre.hidden = preHidden;
    };
  },
};
