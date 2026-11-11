/* viz-map — map from your own GeoJSON: choropleth, bubbles and animated route arcs.
   <div class="efx-viz-map" data-efx-geo-url="/world.geojson" data-efx-data='[{"name":"France","value":12}]'
        data-efx-points='[{"lat":48.8,"lon":2.3,"value":9,"label":"Paris"}]' data-efx-zoom></div>
   No map data is bundled: supply GeoJSON (inline script, data-efx-geo, or data-efx-geo-url). */
import { COMMON, chart, palette, s, esc } from './_lib.js';
import { on } from '../core.js';

const D = Math.PI / 180;
const PROJ = {
  mercator: (x, y) => [x * D, -Math.log(Math.tan(Math.PI / 4 + Math.max(-85, Math.min(85, y)) * D / 2))],
  equirectangular: (x, y) => [x * D, -y * D],
  natural: (x, y) => { const p = y * D, a = p * p, b = a * a; return [x * D * (0.8707 - 0.131979 * a + b * (-0.013791 + b * (0.003971 * a - 0.001529 * b))), -p * (1.007226 + a * (0.015085 + b * (-0.044475 + 0.028874 * a - 0.005916 * b)))]; },
};
const json = v => { try { return typeof v === 'string' ? (v.trim() ? JSON.parse(v) : null) : v; } catch (e) { return null; } };
const arr = v => (Array.isArray(v) ? v : []);
const feats = g => {
  g = json(g);
  if (!g || typeof g !== 'object') return [];
  const l = g.type === 'FeatureCollection' ? arr(g.features) : g.type === 'Feature' ? [g] : g.type ? [{ geometry: g }] : [];
  return l.filter(f => f && f.geometry).map(f => {
    const p = f.properties || {}, gm = f.geometry;
    const polys = gm.type === 'Polygon' ? [gm.coordinates] : gm.type === 'MultiPolygon' ? arr(gm.coordinates) : [];
    return { id: f.id != null ? f.id : p.id, name: String(p.name ?? p.NAME ?? f.id ?? ''), polys: polys.map(pl => arr(pl).map(r => arr(r).filter(c => isFinite(c[0]) && isFinite(c[1])))) };
  });
};
const rowsOf = v => {
  v = json(v);
  if (v && !Array.isArray(v) && typeof v === 'object') v = Object.keys(v).map(k => ({ id: k, value: v[k] }));
  return arr(v).filter(r => r && typeof r === 'object');
};
const pip = (rings, x, y) => { // even-odd point in polygon
  let c = false;
  rings.forEach(r => { for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < (r[j][0] - r[i][0]) * (y - r[i][1]) / (r[j][1] - r[i][1]) + r[i][0]) c = !c; });
  return c;
};

export default {
  name: 'viz-map',
  selector: '.efx-viz-map',
  lazy: true,
  defaults: { ...COMMON, geo: '', geoUrl: '', projection: 'mercator', points: '', routes: '', zoom: false, steps: 6, legend: true, height: 0 },
  init(el, o) {
    const j = el.querySelector(':scope > script[type="application/json"]');
    let geo = feats(o.geo || (j && j.textContent)), vals = rowsOf(o.data), pts = rowsOf(o.points), routes = rowsOf(o.routes);
    const proj = PROJ[o.projection] || PROJ.mercator;
    let alive = true;
    const set = d => {
      if (d.geo != null) geo = feats(d.geo);
      if (d.data != null || d.values != null) vals = rowsOf(d.data ?? d.values);
      if (d.points != null) pts = rowsOf(d.points);
      if (d.routes != null) routes = rowsOf(d.routes);
    };
    const offData = on(el, 'efx:data', e => set(e.detail || {}));
    if (o.geoUrl) fetch(o.geoUrl).then(r => r.json()).then(g => { if (alive) el.dispatchEvent(new CustomEvent('efx:data', { detail: { geo: g } })); }).catch(e => console.warn('[effix] map geo', e));

    // projected bounds -> fit transform (cached per geo)
    const fit = (w, h, pad) => {
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      const add = (lon, lat) => { const p = proj(lon, lat); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); };
      geo.forEach(f => f.polys.forEach(pl => pl.forEach(r => r.forEach(c => add(c[0], c[1])))));
      if (!geo.length) pts.forEach(q => add(+q.lon, +q.lat));
      if (x1 < x0) return null;
      const k = Math.min((w - 2 * pad) / ((x1 - x0) || 1), (h - 2 * pad) / ((y1 - y0) || 1));
      return { k, x: w / 2 - k * (x0 + x1) / 2, y: h / 2 - k * (y0 + y1) / 2, ar: ((y1 - y0) || 1) / ((x1 - x0) || 1) };
    };
    const T = { k: 1, x: 0, y: 0 };
    let cur = null, moved = 0;
    const apply = () => {
      if (!cur) return;
      cur.g.setAttribute('transform', `translate(${T.x} ${T.y}) scale(${T.k})`);
      cur.marks.forEach(m => { m.x = m.bx * T.k + T.x; m.y = m.by * T.k + T.y; });
    };
    const svgPos = e => { const sv = el.querySelector('.efx-chart__svg'), r = sv.getBoundingClientRect(); return [(e.clientX - r.left) * (cur.w / r.width), (e.clientY - r.top) * (cur.h / r.height)]; };
    const offs = [];
    if (o.zoom) {
      let drag = null;
      offs.push(
        on(el, 'wheel', e => {
          if (!cur) return;
          e.preventDefault();
          const [px, py] = svgPos(e), k = Math.max(1, Math.min(14, T.k * Math.exp(-e.deltaY * 0.0015)));
          T.x = px - (px - T.x) * k / T.k; T.y = py - (py - T.y) * k / T.k; T.k = k;
          if (k === 1) { T.x = 0; T.y = 0; }
          apply();
        }, { passive: false }),
        on(el, 'pointerdown', e => { if (e.button === 0 && T.k > 1) { drag = [e.clientX, e.clientY, T.x, T.y]; moved = 0; } }),
        on(el, 'pointermove', e => { if (drag) { moved = Math.max(moved, Math.abs(e.clientX - drag[0]) + Math.abs(e.clientY - drag[1])); if (moved > 3) { T.x = drag[2] + e.clientX - drag[0]; T.y = drag[3] + e.clientY - drag[1]; apply(); } } }),
        on(window, 'pointerup', () => { drag = null; }),
        on(el, 'click', e => { if (moved > 3) { e.stopPropagation(); moved = 0; } }, true),
        on(el, 'dblclick', () => { T.k = 1; T.x = T.y = 0; apply(); }),
      );
    }

    const draw = ({ g: root, w, h, colors, fmt, deco }) => {
      const pad = deco ? 0 : 8;
      const F = fit(w, h, pad);
      if (!F) return [];
      if (o.zoom) { root.parentNode.style.overflow = 'hidden'; root.parentNode.style.touchAction = 'pan-y'; }
      const g = s('g', {}, root), P = (lon, lat) => { const p = proj(lon, lat); return [p[0] * F.k + F.x, p[1] * F.k + F.y]; };
      const base = colors[0], pt = colors[1] || colors[0];
      const marks = [], fm = [];
      // choropleth values
      const look = new Map();
      vals.forEach(r => { const v = +r.value; if (isFinite(v)) [r.id, r.name].forEach(k => k != null && look.set(String(k).toLowerCase(), v)); });
      const vv = geo.map(f => look.get(String(f.id).toLowerCase()) ?? look.get(f.name.toLowerCase())).filter(v => v != null);
      const lo = Math.min(...vv), hi = Math.max(...vv), N = Math.max(2, o.steps | 0);
      const ramp = i => `color-mix(in oklab, ${base} ${Math.round(18 + 82 * i / (N - 1))}%, var(--sh-surface, #fff))`;
      const bin = v => hi === lo ? N - 1 : Math.min(N - 1, Math.floor((v - lo) / (hi - lo) * N));
      geo.forEach((f, i) => {
        const v = look.get(String(f.id).toLowerCase()) ?? look.get(f.name.toLowerCase());
        const rings = f.polys.map(pl => pl.map(r => r.map(c => P(c[0], c[1]))));
        const d = rings.map(pl => pl.map(r => 'M' + r.map(c => c[0].toFixed(1) + ',' + c[1].toFixed(1)).join('L') + 'Z').join('')).join('');
        const fill = v != null ? ramp(bin(v)) : vv.length ? 'color-mix(in oklab, var(--sh-border, #e2e8f0) 55%, var(--sh-surface, #fff))' : ramp(0);
        const node = s('path', { d, 'fill-rule': 'evenodd', style: `fill:${fill};--i:${i}`, class: 'efx-chart__mark efx-viz-map__f efx-chart__fade' }, g);
        // label point = centre of the biggest ring's box
        let best = null, ba = -1;
        rings.forEach(pl => { const r = pl[0] || []; const xs = r.map(c => c[0]), ys = r.map(c => c[1]); const a = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)); if (a > ba) { ba = a; best = [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2]; } });
        fm.push({ x: best ? best[0] : 0, y: best ? best[1] : 0, bx: best ? best[0] : 0, by: best ? best[1] : 0, label: f.name || String(f.id ?? ''), value: v, valueText: v == null ? 'no data' : fmt(v), node, index: i, group: 0,
          hit: (px, py) => { const bx = (px - T.x) / T.k, by = (py - T.y) / T.k; return rings.some(pl => pip(pl, bx, by)); } });
      });
      // routes: curved arcs with animated dashes
      routes.forEach((r, i) => {
        const a = arr(r.from), b = arr(r.to);
        if (a.length < 2 || b.length < 2) return;
        const [x0, y0] = P(+a[1], +a[0]), [x1, y1] = P(+b[1], +b[0]), dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len, f = (ny > 0 ? -1 : 1) * len * 0.2, cx = (x0 + x1) / 2 + nx * f, cy = (y0 + y1) / 2 + ny * f;
        s('path', { d: `M${x0},${y0}Q${cx},${cy} ${x1},${y1}`, fill: 'none', stroke: pt, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke', class: 'efx-viz-map__route efx-chart__fade', style: `--i:${i + 4}` }, g);
      });
      // bubbles
      const bv = pts.map(q => +q.value || 0), bmax = Math.max(...bv, 1), R = Math.max(8, Math.min(30, Math.min(w, h) * 0.06));
      const bm = [];
      pts.forEach((q, i) => {
        if (!isFinite(+q.lat) || !isFinite(+q.lon)) return;
        const [x, y] = P(+q.lon, +q.lat), r = Math.max(3, R * Math.sqrt(bv[i] / bmax));
        const node = s('circle', { cx: x, cy: y, r, fill: pt, 'fill-opacity': 0.6, stroke: pt, 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke', class: 'efx-chart__mark efx-chart__fade', style: `--i:${i + 6}` }, g);
        bm.push({ x, y, bx: x, by: y, label: String(q.label ?? `${q.lat}, ${q.lon}`), value: bv[i], node, index: i, group: 0, hit: (px, py) => Math.hypot((px - T.x) / T.k - x, (py - T.y) / T.k - y) <= r + 3 / T.k });
      });
      // legend (choropleth)
      if (!deco && o.legend && vv.length) {
        const lg = s('g', { 'aria-hidden': 'true', class: 'efx-chart__axis', transform: `translate(${pad + 4} ${h - pad - 22})` }, root), sw = 18;
        for (let i = 0; i < N; i++) s('rect', { x: i * sw, y: 0, width: sw, height: 8, style: `fill:${ramp(i)}` }, lg);
        s('text', { x: 0, y: 20 }, lg).textContent = fmt(lo);
        s('text', { x: N * sw, y: 20, 'text-anchor': 'end' }, lg).textContent = fmt(hi);
      }
      cur = { g, marks: [...bm, ...fm], w, h };
      marks.push(...cur.marks);
      apply();
      return marks;
    };
    draw.height = w => { if (o.height > 0) return 0; const F = fit(w, 1000, 8); return F ? Math.round(Math.max(160, Math.min(560, (w - 16) * F.ar + 16))) : 240; };
    draw.radius = 0.001;
    const stop = chart(el, o, draw);
    return () => { alive = false; offData(); offs.forEach(f => f()); stop(); cur = null; };
  },
};
