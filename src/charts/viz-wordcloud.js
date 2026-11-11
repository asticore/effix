/* viz-wordcloud — word cloud with Archimedean spiral placement and box collision.
   <div class="efx-viz-wordcloud" data-efx-data="design:40|code:28|motion:19|type:12"></div>
   <div class="efx-viz-wordcloud" data-efx-text="any long text, counted and stripped of stop words"></div> */
import { COMMON, chart, palette, s, esc } from './_lib.js';
import { on } from '../core.js';

const STOP = new Set('a about all an and are as at be but by can for from had has have he her his i if in into is it its just me my no not of on or our she so that the their them then there they this to too us was we were what when which who will with you your'.split(' '));
const norm = d => {
  const out = [];
  if (typeof d === 'string') d = d.trim();
  if (typeof d === 'string' && (d[0] === '[' || d[0] === '{')) try { d = JSON.parse(d); } catch (e) { d = ''; }
  if (d && !Array.isArray(d) && typeof d === 'object') d = d.words || d.data || (d.text != null ? String(d.text) : []);
  if (typeof d === 'string') {
    if (d.includes(':')) d.split('|').forEach(p => { const i = p.lastIndexOf(':'); out.push({ text: p.slice(0, i), value: +p.slice(i + 1) }); });
    else { const m = new Map(); (d.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).forEach(w => { w = w.replace(/['’-]+$/, ''); if (w.length > 1 && !STOP.has(w)) m.set(w, (m.get(w) || 0) + 1); }); m.forEach((value, text) => out.push({ text, value })); }
  } else if (Array.isArray(d)) d.forEach(w => { if (w && typeof w === 'object') out.push({ text: w.text ?? w.word ?? w.label, value: w.value ?? w.weight ?? w.count }); else if (typeof w === 'string') out.push({ text: w, value: 1 }); });
  return out.map(w => ({ text: String(w.text ?? '').trim(), value: +w.value || 0 })).filter(w => w.text && w.value > 0).sort((a, b) => b.value - a.value);
};

export default {
  name: 'viz-wordcloud',
  selector: '.efx-viz-wordcloud',
  lazy: true,
  defaults: { ...COMMON, text: '', minSize: 12, maxSize: 56, rotate: [], max: 80, padding: 2, legend: false, height: 0 },
  init(el, o) {
    const j = el.querySelector(':scope > script[type="application/json"]');
    let words = norm(o.update || o.text || o.data || (j && j.textContent) || '');
    if (o.text) words = norm(o.text);
    const off = on(el, 'efx:data', e => { const d = e.detail; if (d && (d.words || d.text || Array.isArray(d))) words = norm(Array.isArray(d) ? d : d.words || d.text); });
    const cv = document.createElement('canvas').getContext('2d');
    const angles = o.rotate.map(Number).filter(Number.isFinite);
    if (!angles.length) angles.push(0);
    const draw = ({ g, w, h, deco, fmt }) => {
      const list = words.slice(0, o.max);
      if (!list.length) return [];
      const cols = palette(el, o, 7), ff = getComputedStyle(el).fontFamily;
      const vmax = list[0].value, vmin = list[list.length - 1].value;
      const sz = v => o.minSize + (o.maxSize - o.minSize) * (vmax === vmin ? 1 : Math.sqrt((v - vmin) / (vmax - vmin)));
      const placed = [], marks = [];
      const hit = (b, pad) => placed.some(p => Math.abs(b.x - p.x) * 2 < b.w + p.w + pad && Math.abs(b.y - p.y) * 2 < b.h + p.h + pad);
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      list.forEach((d, i) => {
        const a = i ? angles[Math.floor(rnd() * angles.length)] : angles[0], r = a * Math.PI / 180;
        let size = sz(d.value), box = null;
        for (let tries = 0; tries < 6 && !box; tries++, size *= 0.85) {
          cv.font = `600 ${size}px ${ff}`;
          const tw = cv.measureText(d.text).width + 2, th = size * 1.05;
          const bw = Math.abs(tw * Math.cos(r)) + Math.abs(th * Math.sin(r)), bh = Math.abs(tw * Math.sin(r)) + Math.abs(th * Math.cos(r));
          const asp = w / h;
          for (let t = 0, rad = 0; rad < (w + h) / 2 && !box; t += 5 / Math.max(rad, 6), rad = 14 * t / 6.283) {
            const b = { x: w / 2 + rad * Math.cos(t) * asp, y: h / 2 + rad * Math.sin(t), w: bw, h: bh };
            if (Math.abs(b.x - w / 2) + bw / 2 <= w / 2 && Math.abs(b.y - h / 2) + bh / 2 <= h / 2 && !hit(b, o.padding)) box = b;
          }
        }
        if (!box) return;
        placed.push(box);
        const node = s('text', { x: 0, y: 0, transform: `translate(${box.x} ${box.y})${a ? ` rotate(${a})` : ''}`, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': size / 0.85, fill: cols[i % cols.length], 'font-weight': 600, 'font-family': ff, class: 'efx-chart__mark efx-chart__fade', style: `--i:${Math.min(i, 30) / 2}` }, g);
        node.textContent = d.text;
        marks.push({ x: box.x, y: box.y - box.h / 2, label: d.text, value: d.value, node, index: i, hit: (px, py) => Math.abs(px - box.x) <= box.w / 2 && Math.abs(py - box.y) <= box.h / 2 });
      });
      return marks;
    };
    draw.height = w => (o.height > 0 ? 0 : Math.round(Math.max(200, w * 0.5)));
    draw.radius = 1;
    const stop = chart(el, o, draw);
    return () => { off(); stop(); };
  },
};
