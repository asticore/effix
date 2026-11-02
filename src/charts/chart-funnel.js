/* chart-funnel — funnel / pyramid / centered bars with conversion rates.
   <div class="efx-chart-funnel" data-efx-data="1200,780,420,180" data-efx-labels="Visits|Signups|Trials|Paid"></div>
   Several series = compare mode (data-efx-compare="mirror|ghost"). All geometry is built in (u = along the flow,
   v = across it) and mapped to x/y by P(), so horizontal and flipped (pyramid) variants share one code path. */
import { COMMON, chart, palette, s, esc } from './_lib.js';

const pc = x => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10) + '%';
const cut = (t, n) => (t.length > n ? t.slice(0, Math.max(1, n - 1)) + '…' : t);

export default {
  name: 'chart-funnel',
  selector: '.efx-chart-funnel',
  lazy: true,
  defaults: { ...COMMON, height: 320, style: 'curved', horizontal: false, neck: 0.25, gap: 4, conversion: true, show: 'inside', dynamic: true, compare: 'mirror' },
  init(el, o) {
    const draw = ({ g, w, h, data, hidden, fmt, deco }) => {
      const S = data.series, idx = data.labels.map((_, i) => i).filter(i => !hidden.has(i)), n = idx.length;
      if (!n || !S.length) return [];
      const pal = palette(el, o, data.labels.length);
      const hz = o.horizontal, st = o.style, bars = st === 'bars', pyr = st === 'pyramid', curved = st === 'curved';
      const cmp = S.length > 1, ghost = cmp && o.compare === 'ghost', conv = o.conversion && !deco;
      const sh = deco ? 'none' : o.show, nk = Math.min(0.95, Math.max(0, o.neck));
      const V = [0, 1].map(j => i => { const x = S[j] && S[j].values[i]; return Number.isFinite(x) && x > 0 ? x : 0; });
      const max = Math.max(1e-9, ...idx.map(V[0]), ...(cmp ? idx.map(V[1]) : []));
      const pd = deco ? { t: 0, r: 0, b: 0, l: 0 } : hz
        ? { t: conv ? 22 : 6, r: 6, b: sh === 'none' ? 6 : 36, l: 6 }
        : { t: 6, r: conv ? 54 : 6, b: 6, l: sh === 'side' ? Math.min(150, w * 0.3) : conv ? 54 : 6 };
      const L = hz ? w - pd.l - pd.r : h - pd.t - pd.b, W = hz ? h - pd.t - pd.b : w - pd.l - pd.r;
      const cx = pd.l + (w - pd.l - pd.r) / 2, cy = pd.t + (h - pd.t - pd.b) / 2, flip = pyr && !hz;
      const P = (u, v) => { if (flip) u = L - u; return hz ? [pd.l + u, cy + v] : [cx + v, pd.t + u]; };
      const q = (u, v) => P(u, v).join(',');
      const inv = (px, py) => { let u = hz ? px - pd.l : py - pd.t; if (flip) u = L - u; return [u, hz ? py - cy : px - cx]; };

      // stage extents along the flow (heights ∝ value when dynamic, with a floor so small stages stay visible)
      const gp = bars ? o.gap + (conv ? (hz ? 40 : 18) : 6) : o.gap;
      const mean = idx.reduce((a, i) => a + V[0](i), 0) / n;
      const wt = idx.map(i => (o.dynamic ? V[0](i) + mean * 0.3 + 1e-9 : 1)), tw = wt.reduce((a, b) => a + b);
      const av = Math.max(n, L - gp * (n - 1));
      const H = wt.map(x => (x / tw) * av), U = H.map((_, k) => H.slice(0, k).reduce((a, b) => a + b, 0) + k * gp);

      // half-widths: tapered profile (neck > 0) or value-proportional (neck 0, compare, bars)
      const prop = bars || cmp || (!pyr && nk <= 0);
      const prof = t => (pyr ? 1 - t : curved ? nk + (1 - nk) * (1 - t * t * (3 - 2 * t)) : 1 - (1 - nk) * t);
      const mk = Vf => {
        const gs = idx.map((i, k) => {
          const u0 = U[k], u1 = u0 + H[k];
          const a = prop ? Vf(i) / max : prof(u0 / L), b = prop ? (bars ? a : k < n - 1 ? Vf(idx[k + 1]) / max : a * 0.7) : prof(u1 / L);
          return { u0, u1, ea: (a * W) / 2, eb: (b * W) / 2 };
        });
        const m = x => (x.eb - x.ea) / (x.u1 - x.u0 || 1);
        gs.forEach((x, k) => {
          const c = m(x), p = k ? m(gs[k - 1]) : c, nx = k < n - 1 ? m(gs[k + 1]) : c;
          x.ta = k ? (p * c > 0 ? (p + c) / 2 : 0) : c;
          x.tb = k < n - 1 ? (nx * c > 0 ? (nx + c) / 2 : 0) : c;
        });
        return gs;
      };
      const G = [mk(V[0])];
      if (cmp) G.push(mk(V[1]));
      const ext = (k, u) => Math.max(...G.map(gs => { const a = gs[k]; return a.ea + (a.eb - a.ea) * Math.min(1, Math.max(0, (u - a.u0) / (a.u1 - a.u0 || 1))); }));

      // shape between the lo and hi sides (-1 left/top edge, 0 axis, 1 right/bottom edge)
      const shape = (x, lo, hi, ins = 0) => {
        const u0 = x.u0 + ins, u1 = x.u1 - ins, ea = Math.max(0, x.ea - ins), eb = Math.max(0, x.eb - ins), d = (u1 - u0) / 3;
        const edge = (sg, rev) => !curved || !sg ? `L${rev ? q(u0, sg * ea) : q(u1, sg * eb)}`
          : rev ? `C${q(u1 - d, sg * (eb - d * x.tb))} ${q(u0 + d, sg * (ea + d * x.ta))} ${q(u0, sg * ea)}`
            : `C${q(u0 + d, sg * (ea + d * x.ta))} ${q(u1 - d, sg * (eb - d * x.tb))} ${q(u1, sg * eb)}`;
        return `M${q(u0, lo * ea)}${edge(lo)}L${q(u1, hi * eb)}${edge(hi, 1)}Z`;
      };

      const marks = [], rows = idx.map(() => []);
      // bars: translucent connectors between consecutive bars
      if (bars) idx.forEach((i, k) => {
        if (k === n - 1) return;
        (cmp && !ghost ? [[0, -1, 0], [1, 0, 1]] : [[0, -1, 1]]).forEach(([j, lo, hi]) => {
          const a = G[j][k], b = G[j][k + 1];
          s('path', { d: `M${q(a.u1, lo * a.eb)}L${q(b.u0, lo * b.ea)}L${q(b.u0, hi * b.ea)}L${q(a.u1, hi * a.eb)}Z`, fill: pal[i], 'fill-opacity': 0.16, class: 'efx-chart__fade', style: `--i:${k}` }, g);
        });
      });
      // stages: ghost (series 2 outline) first, then the solid shapes
      [1, 0].forEach(pass => (pass && !ghost ? [] : cmp && !ghost ? [0, 1] : [0]).forEach(j => {
        const gj = pass ? 1 : j;
        idx.forEach((i, k) => {
          const x = G[gj][k], lo = cmp && !ghost && gj ? 0 : -1, hi = cmp && !ghost && !gj ? 0 : 1, v = V[gj](i);
          const half = cmp && !ghost, mid = (x.u0 + x.u1) / 2, e = (x.ea + x.eb) / 2;
          const ins = bars && !pass ? 4 : 0;
          const org = !half ? '50% 50%' : hz ? (gj ? '50% 0%' : '50% 100%') : (gj ? '0% 50%' : '100% 50%');
          const node = s('path', {
            d: shape(x, lo, hi, ins), fill: pal[i],
            'fill-opacity': pass ? 0.14 : half && gj ? 0.55 : null,
            stroke: pass || ins ? pal[i] : null, 'stroke-width': pass ? 1.5 : ins ? 8 : null,
            'stroke-dasharray': pass ? '5 4' : null, 'stroke-linejoin': ins ? 'round' : null,
            class: 'efx-chart__mark ' + (pass ? 'efx-chart__fade' : hz ? 'efx-fn-y' : 'efx-fn-x'),
            style: `--i:${k};` + (pass ? '' : `transform-origin:${org}`),
          }, g);
          const first = V[gj](idx[0]), prev = k ? V[0](idx[k - 1]) : v, vv = V[0](i), other = V[1](i);
          const dd = prev - vv;
          const html = `<strong>${esc(data.labels[i])}</strong>${half ? `<span>${esc(S[gj].name)}</span>` : ''}<b>${esc(fmt(half ? v : vv))}</b>`
            + (ghost ? `<span>${esc(S[1].name)}: ${esc(fmt(other))}</span>` : '')
            + `<span>${pc(first ? (v / first) * 100 : 0)} of total${k && (half ? V[gj](idx[k - 1]) : prev) ? ` · ${pc((v / (half ? V[gj](idx[k - 1]) : prev)) * 100)} of previous` : ''}</span>`
            + (k ? `<span>${dd >= 0 ? '−' : '+'}${esc(fmt(Math.abs(half ? V[gj](idx[k - 1]) - v : dd)))} vs previous</span>` : '');
          const [mx, my] = P(mid, half ? (gj ? e / 2 : -e / 2) : 0);
          rows[k][pass ? 1 : j] = {
            x: mx, y: my, label: data.labels[i], value: pass ? other : v, series: cmp ? S[gj].name : '', node, index: i, group: k, html,
            hit: pass ? () => false : (px, py) => {
              const [u, vv2] = inv(px, py), z = ext(k, u) + 2;
              return u >= G[0][k].u0 - gp / 2 && u <= G[0][k].u1 + gp / 2 && vv2 >= lo * z && vv2 <= hi * z;
            },
          };
        });
      }));
      rows.forEach(r => r.forEach(m => m && marks.push(m)));

      // labels + drop-off rates
      const txt = (x, y, cls, str, k, anchor = 'middle') => { s('text', { x, y, 'text-anchor': anchor, 'dominant-baseline': 'central', class: cls + ' efx-chart__fade', style: `--i:${k}` }, g).textContent = str; };
      if (sh !== 'none') idx.forEach((i, k) => {
        const a = G[0][k], len = a.u1 - a.u0, u = (a.u0 + a.u1) / 2, name = data.labels[i], v = V[0](i), first = V[0](idx[0]);
        const l2 = fmt(v) + (cmp ? ' / ' + fmt(V[1](i)) : '') + (conv ? ' · ' + pc(first ? (v / first) * 100 : 0) : '');
        const cw = 2 * Math.min(...G.map(gs => (gs[k].ea + gs[k].eb) / 2)) * 0.9 - 8;
        const t1 = name.length * 6.8, t2 = l2.length * 6.2;
        const fit = (tw2, th) => sh === 'inside' && (hz ? len >= tw2 + 10 && cw >= th + 2 : cw >= tw2 && len >= th + 2);
        const lines = fit(Math.max(t1, t2), 30) ? 2 : fit(t1, 14) ? 1 : 0;
        const [x, y] = P(u, 0), e = ext(k, u);
        if (lines) {
          txt(x, y - (lines > 1 ? 7 : 0), 'efx-fn-t', name, k);
          if (lines > 1) txt(x, y + 8, 'efx-fn-t efx-fn-2', l2, k);
        } else if (hz) {
          const m = Math.max(4, Math.floor((len + gp) / 6.4)), by = cy + W / 2;
          s('line', { x1: x, x2: x, y1: cy + e + 3, y2: by + 3, class: 'efx-fn-l efx-chart__fade', style: `--i:${k}` }, g);
          txt(x, by + 12, 'efx-chart__value', cut(name, m), k);
          txt(x, by + 25, 'efx-fn-s', cut(l2, m), k);
        } else {
          const ex = sh === 'side' ? pd.l - 10 : cx - e - 10;
          if (sh === 'side') s('line', { x1: ex + 5, x2: cx - e - 3, y1: y, y2: y, class: 'efx-fn-l efx-chart__fade', style: `--i:${k}` }, g);
          txt(ex, y - 7, 'efx-chart__value', name, k, 'end');
          txt(ex, y + 8, 'efx-fn-s', l2, k, 'end');
        }
      });
      if (conv) idx.forEach((i, k) => {
        const a = V[0](i), b = V[0](idx[k + 1]);
        if (k === n - 1 || !a) return;
        const dr = (1 - b / a) * 100, str = (dr >= 0 ? '−' : '+') + pc(Math.abs(dr)), uB = (G[0][k].u1 + G[0][k + 1].u0) / 2;
        const e = Math.max(...G.map(gs => Math.max(gs[k].eb, gs[k + 1].ea)));
        if (bars) { const [x, y] = P(uB, 0); txt(x, y, 'efx-fn-d', str, k); }
        else if (hz) { const [x, y] = P(uB, -e - 9); txt(x, y, 'efx-fn-d', str, k); }
        else { const [x, y] = P(uB, e + 8); txt(x, y, 'efx-fn-d', str, k, 'start'); }
      });
      return marks;
    };
    draw.legendByLabel = true;
    draw.radius = 1;
    return chart(el, o, draw);
  },
};
