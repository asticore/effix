/* diagram-cycle — loop / cycle diagram: numbered steps on a circle joined by flowing curved arrows.
   <div class="efx-diagram-cycle" data-efx-labels="Plan|Build|Measure|Learn" data-efx-descriptions="Pick a bet|Ship it|Watch the numbers|Decide what's next" data-efx-center="Product loop"></div>
   JSON items also work: [{"label":"Plan","desc":"Pick a bet"}] */
import { COMMON, chart, palette, polar, s, esc } from './_lib.js';
import { on } from '../core.js';

const wrap = (t, n) => { const out = []; let l = ''; String(t).split(/\s+/).forEach(wd => { if (l && (l + ' ' + wd).length > n) { out.push(l); l = wd; } else l = l ? l + ' ' + wd : wd; }); if (l) out.push(l); return out.slice(0, 3); };
const descs = d => { const a = Array.isArray(d) ? d : d && (d.items || d.descriptions); return Array.isArray(a) ? a.map(q => (q && typeof q === 'object' ? q.desc ?? q.description : q) ?? '') : []; };

export default {
  name: 'diagram-cycle',
  selector: '.efx-diagram-cycle',
  lazy: true,
  defaults: { ...COMMON, height: 340, legend: false, descriptions: [], center: '', numbers: true, flow: true, start: 0 },
  init(el, o) {
    let raw = null;
    try {
      const j = el.querySelector(':scope > script[type="application/json"]');
      const t = (o.data || '').trim() || (j ? j.textContent : '');
      if (t && /^[[{]/.test(t)) raw = JSON.parse(t);
    } catch (e) { /* the lib reports bad data */ }
    // registered before chart() so it runs before the lib's own efx:data handler
    const off = on(el, 'efx:data', e => { raw = e.detail; });
    const draw = ({ g, w, h, data, deco }) => {
      const L = data.labels, n = L.length;
      if (!n) return [];
      const D = descs(raw), pal = palette(el, o, n), nr = deco ? 12 : 20;
      const lw = deco ? 0 : Math.min(120, w * 0.24), top = deco ? 0 : 22;
      const R = Math.max(24, Math.min(w / 2 - nr - lw - 6, h / 2 - nr - top));
      const cx = w / 2, cy = h / 2, a0 = (o.start * Math.PI) / 180, step = (Math.PI * 2) / n;
      const ang = i => a0 + i * step;
      const P = i => polar(cx, cy, R, ang(i));
      if (!deco) {
        // faint track
        s('circle', { cx, cy, r: R, fill: 'none', class: 'efx-chart__grid efx-chart__fade' }, g);
        if (o.center) {
          const ls = String(o.center).split('|');
          const t = s('text', { x: cx, y: cy - (ls.length - 1) * 9, 'text-anchor': 'middle', class: 'efx-chart__value efx-cyc__c efx-chart__fade' }, g);
          ls.forEach((l, q) => { const sp = s('tspan', { x: cx, dy: q ? 18 : 0, 'dominant-baseline': 'middle' }, t); sp.textContent = l.trim(); });
        }
      }
      // arrows: clockwise arcs between neighbouring nodes, an arrowhead at each end
      if (n > 1) for (let i = 0; i < n; i++) {
        const gapA = (nr + 7) / R, s0 = ang(i) + gapA, s1 = ang(i + 1) - gapA;
        if (s1 <= s0) continue;
        const [x0, y0] = polar(cx, cy, R, s0), [x1, y1] = polar(cx, cy, R, s1);
        const col = 'var(--efx-chart-text)';
        s('path', { d: `M${x0},${y0}A${R},${R} 0 ${s1 - s0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`, fill: 'none', stroke: col, 'stroke-width': 1.75, 'stroke-linecap': 'round', class: 'efx-cyc__a efx-chart__fade' + (o.flow && !deco ? ' efx-cyc__flow' : ''), style: `--i:${i + n}` }, g);
        const tx = Math.cos(s1), ty = Math.sin(s1), px = -ty, py = tx, k = 5;
        s('path', { d: `M${x1 + tx * 2},${y1 + ty * 2}L${x1 - tx * k + px * k * 0.8},${y1 - ty * k + py * k * 0.8}M${x1 + tx * 2},${y1 + ty * 2}L${x1 - tx * k - px * k * 0.8},${y1 - ty * k - py * k * 0.8}`, fill: 'none', stroke: col, 'stroke-width': 1.75, 'stroke-linecap': 'round', class: 'efx-chart__fade', style: `--i:${i + n}` }, g);
      }
      return L.map((label, i) => {
        const [x, y] = P(i), sn = Math.sin(ang(i)), cs = -Math.cos(ang(i));
        const node = s('circle', { cx: x, cy: y, r: nr, fill: pal[i], stroke: 'var(--sh-surface,#fff)', 'stroke-width': 2, class: 'efx-chart__mark efx-chart__fade', style: `--i:${i}` }, g);
        if (!deco) {
          const t = s('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'efx-cyc__num efx-chart__fade', style: `--i:${i}` }, g);
          t.textContent = o.numbers ? i + 1 : '';
          const anchor = sn > 0.3 ? 'start' : sn < -0.3 ? 'end' : 'middle', ox = x + sn * (nr + 8) * (anchor === 'middle' ? 0 : 1);
          const ls = wrap(label, Math.max(8, Math.floor(lw / 6.6))), lh = 14;
          const ly = cs < -0.3 ? y - nr - 10 - (ls.length - 1) * lh : cs > 0.3 ? y + nr + 14 : y - ((ls.length - 1) * lh) / 2;
          const e = s('text', { x: ox, y: ly, 'text-anchor': anchor, 'dominant-baseline': 'middle', class: 'efx-cyc__l efx-chart__fade', style: `--i:${i + 1}` }, g);
          ls.forEach((l, q) => { const sp = s('tspan', { x: ox, dy: q ? lh : 0 }, e); sp.textContent = l; });
        }
        const d = D[i] ? String(D[i]) : (o.descriptions[i] || '');
        return {
          x, y, label, value: i + 1, valueText: d || `Step ${i + 1} of ${n}`, node, index: i,
          hit: (px, py) => Math.hypot(px - x, py - y) <= nr + 8,
          html: `<strong>${i + 1}. ${esc(label)}</strong>` + (d ? `<span style="white-space:normal;max-inline-size:16rem">${esc(d)}</span>` : ''),
        };
      });
    };
    draw.radius = 0.001;
    const stop = chart(el, o, draw);
    return () => { off(); stop(); };
  },
};
