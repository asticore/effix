/*! Effix Viz v0.3.0 | MIT | https://github.com/asticore/effix */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/charts/_lib.js
  var lib_exports = {};
  __export(lib_exports, {
    COMMON: () => COMMON,
    arcPath: () => arcPath,
    axes: () => axes,
    band: () => band,
    chart: () => chart,
    esc: () => esc,
    formatter: () => formatter,
    linePath: () => linePath,
    linear: () => linear,
    nice: () => nice,
    palette: () => palette,
    parseData: () => parseData,
    polar: () => pt,
    s: () => s,
    tickStep: () => tickStep
  });

  // effix-host:effix-core
  var get = (...a) => window.Effix.get(...a);
  var motionOK = (...a) => window.Effix.motionOK(...a);
  var on = (...a) => window.Effix.on(...a);
  var rafThrottle = (...a) => window.Effix.rafThrottle(...a);
  var onVisible = (...a) => window.Effix.onVisible(...a);
  var effix_core_default = window.Effix;

  // src/charts/_lib.js
  var NS = "http://www.w3.org/2000/svg";
  var COMMON = {
    data: "",
    // "12,19,7"  or JSON [[..],[..]] / [{name,data}]
    labels: [],
    // "Mon|Tue|Wed"
    names: [],
    // series names "2025|2026"
    source: "",
    // CSS selector of a <table> (e.g. a Shine .table) to read data from
    colors: [],
    // "#f43f5e|#8b5cf6" (default: Shine tone palette)
    height: 260,
    // px (0 = use the element's CSS height)
    background: false,
    // decorative mode: fills the element, no axes/legend/tooltip, aria-hidden
    legend: true,
    tooltip: true,
    animate: true,
    prefix: "",
    suffix: "",
    decimals: -1,
    // -1 = auto
    compact: false,
    // 12.3k
    format: "",
    // name of a registered formatter: Effix.add('format', 'gbp', v => '£' + v.toFixed(2))
    title: ""
    // accessible name (falls back to aria-label / first heading)
  };
  var num = (v) => {
    const n = parseFloat(String(v).replace(/[^\d.eE+-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };
  function fromTable(table) {
    const head = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
    const rows = [...table.querySelectorAll("tbody tr")].map((tr) => [...tr.children].map((td) => td.textContent.trim()));
    return {
      labels: rows.map((r) => r[0]),
      series: head.slice(1).map((name, i) => ({ name, values: rows.map((r) => num(r[i + 1])) }))
    };
  }
  function parseData(el, o) {
    let out = null;
    const json2 = el.querySelector(':scope > script[type="application/json"]');
    try {
      if (o.update) out = o.update;
      if (!out && o.source) {
        const t = document.querySelector(o.source);
        if (t) out = fromTable(t);
      }
      if (!out && o.data) {
        const raw = String(o.data).trim();
        if (raw[0] === "[" || raw[0] === "{") out = JSON.parse(raw);
        else out = { series: raw.split("|").map((s2) => ({ values: s2.split(",").map(num) })) };
      }
      if (!out && json2) out = JSON.parse(json2.textContent);
    } catch (err) {
      console.warn("[effix] chart data", err);
    }
    if (!out || typeof out !== "object") out = {};
    const arr5 = (v) => Array.isArray(v) ? v : [];
    if (Array.isArray(out)) {
      if (out.length && out.every((d) => d == null || typeof d !== "object" || !Array.isArray(d) && !("data" in d) && !("values" in d))) out = { data: out };
      else out = { series: out };
    }
    let series = arr5(out.series || out.datasets).filter((x) => x != null).map((s0, i) => {
      var _a, _b, _c;
      const sr = Array.isArray(s0) ? { values: s0 } : typeof s0 === "object" ? s0 : { values: [s0] };
      const values = arr5(sr.values || sr.data).map((v) => num(v && typeof v === "object" ? v.value : v));
      return { name: String((_c = (_b = (_a = sr.name) != null ? _a : sr.label) != null ? _b : o.names[i]) != null ? _c : `Series ${i + 1}`), values, color: typeof sr.color === "string" ? sr.color : void 0 };
    });
    const flat = arr5(out.data);
    if (!series.length && flat.length) series = [{ name: String(o.names[0] || ""), values: flat.map((d) => num(d && typeof d === "object" ? d.value : d)) }];
    const n = Math.max(0, ...series.map((s0) => s0.values.length));
    const labels = (o.labels.length ? o.labels : arr5(out.labels).length ? arr5(out.labels) : flat.map((d) => d && typeof d === "object" ? d.label : void 0)).slice(0, Math.max(n, o.labels.length));
    for (let i = 0; i < n; i++) if (labels[i] == null) labels[i] = String(i + 1);
    return { labels: labels.map(String), series };
  }
  var TOKENS = ["--sh-primary", "--sh-accent", "--sh-success", "--sh-warning", "--sh-info", "--sh-danger", "--sh-secondary"];
  var FALLBACK = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#0ea5e9", "#ef4444", "#8b5cf6"];
  function palette(el, o, n) {
    const cs = getComputedStyle(el);
    const base = o.colors.length ? o.colors : TOKENS.map((t, i) => cs.getPropertyValue(`--efx-chart-${i + 1}`).trim() || cs.getPropertyValue(t).trim() || FALLBACK[i]);
    return Array.from({ length: Math.max(n, 1) }, (_, i) => base[i % base.length]);
  }
  function tickStep(start, stop, count) {
    const step0 = Math.abs(stop - start) / Math.max(1, count);
    let step1 = Math.pow(10, Math.floor(Math.log10(step0 || 1)));
    const err = step0 / step1;
    if (err >= 7.07) step1 *= 10;
    else if (err >= 3.16) step1 *= 5;
    else if (err >= 1.41) step1 *= 2;
    return step1;
  }
  function nice(min, max, count = 5) {
    if (min === max) {
      max = min + 1;
      if (min > 0) min = 0;
    }
    const step = tickStep(min, max, count);
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const ticks = [];
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || !(step > 0)) return { min: min || 0, max: max || 1, ticks: [min || 0, max || 1] };
    for (let i = 0, v = lo; v <= hi + step / 2 && i < 100; v = lo + ++i * step) ticks.push(+v.toFixed(10));
    return { min: lo, max: hi, ticks };
  }
  function linear([d0, d1], [r0, r1]) {
    const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
    const f = (v) => r0 + (v - d0) * k;
    f.invert = (r) => d0 + (r - r0) / (k || 1);
    return f;
  }
  function band(n, [r0, r1], padding = 0.25) {
    const step = (r1 - r0) / Math.max(1, n);
    const bw = step * (1 - padding);
    return { x: (i) => r0 + i * step + (step - bw) / 2, bw, step };
  }
  function linePath(pts, smooth = true) {
    if (!pts.length) return "";
    if (!smooth || pts.length < 3) return "M" + pts.map((p) => `${p[0]},${p[1]}`).join("L");
    const n = pts.length, dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) {
      dx[i] = pts[i + 1][0] - pts[i][0];
      m[i] = (pts[i + 1][1] - pts[i][1]) / (dx[i] || 1);
    }
    t[0] = m[0];
    t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : 3 * (dx[i - 1] + dx[i]) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
      const h = dx[i] / 3;
      d += `C${pts[i][0] + h},${pts[i][1] + h * t[i]} ${pts[i + 1][0] - h},${pts[i + 1][1] - h * t[i + 1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
    }
    return d;
  }
  var pt = (cx, cy, r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  function arcPath(cx, cy, r0, r1, a0, a1) {
    if (a1 - a0 >= Math.PI * 2 - 1e-6) a1 = a0 + Math.PI * 2 - 1e-4;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const [x0, y0] = pt(cx, cy, r1, a0), [x1, y1] = pt(cx, cy, r1, a1);
    let d = `M${x0},${y0}A${r1},${r1} 0 ${large} 1 ${x1},${y1}`;
    if (r0 > 0) {
      const [x2, y2] = pt(cx, cy, r0, a1), [x3, y3] = pt(cx, cy, r0, a0);
      d += `L${x2},${y2}A${r0},${r0} 0 ${large} 0 ${x3},${y3}Z`;
    } else d += `L${cx},${cy}Z`;
    return d;
  }
  function formatter(o) {
    const custom = o.format && get("format", o.format);
    if (typeof custom === "function") return (v) => String(custom(v, o));
    const opts = o.compact ? { notation: "compact", maximumFractionDigits: 1 } : {};
    if (o.decimals >= 0) {
      opts.minimumFractionDigits = o.decimals;
      opts.maximumFractionDigits = o.decimals;
    }
    let nf;
    try {
      nf = new Intl.NumberFormat(void 0, opts);
    } catch (e) {
      nf = { format: (v) => String(v) };
    }
    return (v) => o.prefix + nf.format(v) + o.suffix;
  }
  function s(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  var esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function axes(g, { w, h, pad, y, ticks, labels, x, fmt, grid = true, rotate = false }) {
    const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
    for (const t of ticks) {
      const yy = y(t);
      if (grid) s("line", { x1: pad.l, x2: w - pad.r, y1: yy, y2: yy, class: "efx-chart__grid" }, ax);
      s("text", { x: pad.l - 8, y: yy, "text-anchor": "end", "dominant-baseline": "middle" }, ax).textContent = fmt(t);
    }
    if (labels && x) {
      const every = Math.ceil(labels.length / Math.max(1, Math.floor((w - pad.l - pad.r) / 56)));
      labels.forEach((l, i) => {
        if (i % every) return;
        const t = s("text", { x: x(i), y: h - pad.b + 18, "text-anchor": rotate ? "end" : "middle" }, ax);
        if (rotate) t.setAttribute("transform", `rotate(-35 ${x(i)} ${h - pad.b + 18})`);
        t.textContent = l;
      });
    }
  }
  var uid = 0;
  function chart(el, o, draw) {
    const id = "efx-c" + ++uid;
    const restore = { pos: el.style.position, iso: el.style.isolation };
    const deco = o.background;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    if (deco) el.style.isolation = "isolate";
    const wrap = document.createElement("div");
    wrap.className = "efx-chart__wrap" + (deco ? " efx-chart__wrap--bg" : "");
    if (deco) wrap.setAttribute("aria-hidden", "true");
    const svg = s("svg", { class: "efx-chart__svg", role: deco ? null : "img", "aria-labelledby": deco ? null : id + "-t", focusable: "false" });
    const title = s("title", { id: id + "-t" }, svg);
    wrap.appendChild(svg);
    const tip = document.createElement("div");
    tip.className = "efx-chart__tip";
    tip.setAttribute("role", "status");
    tip.hidden = true;
    const legend = document.createElement("div");
    legend.className = "efx-chart__legend";
    const sr = document.createElement("ul");
    sr.className = "efx-chart__sr";
    if (deco) el.prepend(wrap);
    else el.append(wrap, tip, legend, sr);
    el.classList.add("efx-chart");
    let data = parseData(el, o);
    const hidden = /* @__PURE__ */ new Set();
    let marks = [], active = -1, w = 0, h = 0, played = !o.animate || !motionOK();
    const fmt = formatter(o);
    const name = () => o.title || el.getAttribute("aria-label") || (el.querySelector("h1,h2,h3,h4,h5,h6,figcaption") || {}).textContent || "Chart";
    function render(again) {
      w = Math.max(16, el.clientWidth);
      h = deco ? Math.max(20, el.clientHeight) : draw.height && draw.height(w, data) || o.height || el.clientHeight || 260;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      [...svg.childNodes].forEach((n) => n !== title && n.remove());
      title.textContent = name();
      const visible = draw.legendByLabel ? data.series.map((s0, i) => ({ ...s0, index: i })) : data.series.map((s0, i) => ({ ...s0, index: i })).filter((x) => !hidden.has(x.index));
      const colors = palette(el, o, data.series.length).map((c, i) => data.series[i] && data.series[i].color || c);
      const g = s("g", { class: "efx-chart__plot" + (played ? " is-in" : "") }, svg);
      marks = draw({ el, svg, g, w, h, o, data, visible, hidden, colors, fmt, deco, again }) || [];
      if (!deco) {
        sr.innerHTML = marks.slice(0, 200).map((m) => {
          var _a;
          return `<li>${esc(m.label)}${m.series ? " (" + esc(m.series) + ")" : ""}: ${esc((_a = m.valueText) != null ? _a : fmt(m.value))}</li>`;
        }).join("");
        svg.setAttribute("tabindex", marks.length ? "0" : "-1");
      }
    }
    function renderLegend() {
      legend.innerHTML = "";
      if (deco || !o.legend || data.series.length < 2 && !draw.legendByLabel) return;
      const colors = palette(el, o, Math.max(data.series.length, data.labels.length));
      const items = draw.legendByLabel ? data.labels : data.series.map((x) => x.name);
      items.forEach((label, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "efx-chart__key";
        b.setAttribute("aria-pressed", String(!hidden.has(i)));
        b.style.setProperty("--efx-key", data.series[i] && data.series[i].color || colors[i]);
        b.textContent = label;
        b.addEventListener("click", () => {
          hidden.has(i) ? hidden.delete(i) : hidden.add(i);
          if (hidden.size >= items.length) hidden.delete(i);
          b.setAttribute("aria-pressed", String(!hidden.has(i)));
          render(true);
        });
        legend.appendChild(b);
      });
    }
    function show(i) {
      var _a;
      if (deco || !o.tooltip) return;
      active = i;
      const m = marks[i];
      if (!m) return hide();
      const rel = new Set(m.rel || []);
      marks.forEach((k, j) => k.node && k.node.classList.toggle("is-dim", j !== i && !rel.has(j) && (m.group == null || k.group !== m.group)));
      if (m.node) m.node.classList.add("is-active");
      if (draw.onShow) draw.onShow(m);
      tip.innerHTML = m.html || `<strong>${esc(m.label)}</strong>${m.series ? `<span>${esc(m.series)}</span>` : ""}<b>${esc((_a = m.valueText) != null ? _a : fmt(m.value))}</b>`;
      tip.hidden = false;
      const r = el.getBoundingClientRect(), sv = svg.getBoundingClientRect();
      const x = sv.left - r.left + m.x * (sv.width / w), y = sv.top - r.top + m.y * (sv.height / h);
      tip.style.left = Math.max(0, Math.min(r.width - tip.offsetWidth, x - tip.offsetWidth / 2)) + "px";
      const above = r.top + y - tip.offsetHeight - 10 > 0;
      tip.style.top = (above ? y - tip.offsetHeight - 10 : y + 14) + "px";
    }
    function hide() {
      active = -1;
      tip.hidden = true;
      marks.forEach((k) => k.node && k.node.classList.remove("is-dim", "is-active"));
      if (draw.onShow) draw.onShow(null);
    }
    const nearest = (px, py) => {
      let best = -1, bd = Infinity;
      marks.forEach((m, i) => {
        if (m.hit && m.hit(px, py)) {
          bd = -1;
          best = i;
          return;
        }
        if (bd < 0) return;
        const d = m.xOnly ? Math.abs(m.x - px) : Math.hypot(m.x - px, m.y - py);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return bd === -1 || bd < (draw.radius || 48) ? best : -1;
    };
    const pos = (e) => {
      const r = svg.getBoundingClientRect();
      return [(e.clientX - r.left) * (w / r.width), (e.clientY - r.top) * (h / r.height)];
    };
    const offs = [];
    if (!deco) {
      const move = rafThrottle((e) => {
        const i = nearest(...pos(e));
        if (i < 0) hide();
        else if (i !== active) show(i);
      });
      offs.push(
        on(svg, "pointermove", move),
        on(svg, "pointerleave", () => {
          move.cancel();
          hide();
        }),
        () => move.cancel(),
        on(svg, "click", (e) => {
          const i = nearest(...pos(e));
          if (i >= 0) select(i);
        }),
        on(svg, "keydown", (e) => {
          if (!marks.length) return;
          const k = e.key;
          if (k === "ArrowRight" || k === "ArrowDown") show(active < marks.length - 1 ? active + 1 : 0);
          else if (k === "ArrowLeft" || k === "ArrowUp") show(active > 0 ? active - 1 : marks.length - 1);
          else if (k === "Home") show(0);
          else if (k === "End") show(marks.length - 1);
          else if ((k === "Enter" || k === " ") && active >= 0) select(active);
          else if (k === "Escape") hide();
          else return;
          e.preventDefault();
        }),
        on(svg, "blur", hide)
      );
    }
    function select(i) {
      var _a;
      const m = marks[i];
      el.dispatchEvent(new CustomEvent("efx:select", { bubbles: true, detail: { index: (_a = m.index) != null ? _a : i, label: m.label, value: m.value, series: m.series } }));
    }
    offs.push(on(el, "efx:data", (e) => {
      const d = e.detail || {};
      data = parseData(el, { ...o, update: d, labels: Array.isArray(d.labels) ? d.labels : [] });
      hidden.clear();
      renderLegend();
      render(true);
    }));
    const onResize = rafThrottle(() => {
      if (Math.abs(el.clientWidth - w) > 1 || deco && Math.abs(el.clientHeight - h) > 1) render(true);
    });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (ro) ro.observe(el);
    renderLegend();
    render(false);
    let stopVis = () => {
    };
    if (!played) stopVis = onVisible(el, (vis, e) => {
      if (!vis || e.intersectionRatio < 0.25 && e.intersectionRect.height < innerHeight * 0.25) return;
      played = true;
      svg.querySelectorAll(".efx-chart__plot").forEach((p) => p.classList.add("is-in"));
      stopVis();
    }, "0px", [0, 0.01, 0.05, 0.1, 0.25]);
    return () => {
      offs.forEach((f) => f());
      stopVis();
      onResize.cancel();
      if (ro) ro.disconnect();
      wrap.remove();
      tip.remove();
      legend.remove();
      sr.remove();
      el.classList.remove("efx-chart");
      el.style.position = restore.pos;
      el.style.isolation = restore.iso;
    };
  }

  // src/charts/viz-arc.js
  var arr = (v) => Array.isArray(v) ? v : [];
  var norm = (d, sort) => {
    d = d && typeof d === "object" ? d : {};
    let N = arr(d.nodes).map((n) => n && typeof n === "object" ? { ...n } : { id: n }).filter((n) => n.id != null).map((n) => ({ ...n, id: String(n.id), deg: 0 }));
    const id = (v) => String(v && typeof v === "object" ? v.id : v);
    const L = arr(d.links).filter((l) => l && N.some((n) => n.id === id(l.source)) && N.some((n) => n.id === id(l.target)) && id(l.source) !== id(l.target)).map((l) => ({ s: id(l.source), t: id(l.target), v: +l.value || 1 }));
    L.forEach((l) => N.forEach((n) => {
      if (n.id === l.s || n.id === l.t) n.deg++;
    }));
    if (sort === "group") N = N.map((n, i) => [n, i]).sort((a, b) => String(a[0].group).localeCompare(String(b[0].group)) || a[1] - b[1]).map((x) => x[0]);
    else if (sort === "degree") N = N.map((n, i) => [n, i]).sort((a, b) => b[0].deg - a[0].deg || a[1] - b[1]).map((x) => x[0]);
    return { N, L };
  };
  var viz_arc_default = {
    name: "viz-arc",
    selector: ".efx-viz-arc",
    lazy: true,
    defaults: { ...COMMON, height: 280, legend: false, sort: "", radius: 5 },
    init(el, o) {
      const read = (r) => {
        try {
          return norm(typeof r === "string" ? JSON.parse(r) : r, o.sort);
        } catch (e) {
          return norm(null);
        }
      };
      const j = el.querySelector(':scope > script[type="application/json"]');
      let d = read((o.data || "").trim() || j && j.textContent);
      const offData = on(el, "efx:data", (e) => {
        d = e.detail ? read(e.detail) : d;
      });
      const draw = ({ g, w, h, deco }) => {
        const { N, L } = d, n = N.length;
        if (!n) return [];
        const groups = [...new Set(N.map((x) => x.group))], pal = palette(el, o, groups.length);
        const col = (x) => pal[groups.indexOf(x.group)];
        const pad = deco ? { t: 4, b: 4, l: 8, r: 8 } : { t: 8, b: 56, l: 16, r: 16 };
        const step = n > 1 ? (w - pad.l - pad.r) / (n - 1) : 0, y0 = h - pad.b;
        const X = (i) => n > 1 ? pad.l + i * step : w / 2;
        const ix = new Map(N.map((x, i) => [x.id, i]));
        const ratio = Math.min(1, (y0 - pad.t) / Math.max(1, (n - 1) * step / 2));
        const maxV = Math.max(...L.map((l) => l.v), 1);
        const marks = N.map((x, i) => {
          var _a;
          return { x: X(i), y: y0, label: (_a = x.label) != null ? _a : x.id, series: x.group != null ? String(x.group) : "", value: x.deg, valueText: `${x.deg} link${x.deg === 1 ? "" : "s"}`, index: i, rel: [] };
        });
        L.forEach((l, k) => {
          var _a, _b;
          const a = ix.get(l.s), b = ix.get(l.t), x1 = X(Math.min(a, b)), x2 = X(Math.max(a, b)), rx = (x2 - x1) / 2;
          const node = s("path", { d: `M${x1},${y0}A${rx},${rx * ratio} 0 0 1 ${x2},${y0}`, fill: "none", stroke: col(N[a]), "stroke-opacity": 0.4, "stroke-width": +(1 + 4 * Math.sqrt(l.v / maxV)).toFixed(2), pathLength: 1, class: "efx-chart__mark efx-chart__draw efx-viz__arc", style: `--i:${k % 20}` }, g);
          const m = marks.length;
          marks[a].rel.push(m);
          marks[b].rel.push(m);
          marks.push({ x: (x1 + x2) / 2, y: y0 - rx * ratio, label: `${(_a = N[a].label) != null ? _a : N[a].id} \u2192 ${(_b = N[b].label) != null ? _b : N[b].id}`, value: l.v, node, index: m, rel: [a, b], hit: (px, py) => py < y0 - 9 && node.isPointInStroke(new DOMPoint(px, py)) });
        });
        N.forEach((x, i) => {
          var _a;
          const r = o.radius * (1 + Math.min(1, x.deg / 8)) * (deco ? 0.7 : 1);
          marks[i].node = s("circle", { cx: X(i), cy: y0, r, fill: col(x), class: "efx-chart__mark efx-chart__fade", style: `--i:${i % 20}` }, g);
          marks[i].hit = (px, py) => Math.hypot(px - X(i), py - y0) <= r + 4;
          if (!deco && step > 11) {
            const t = s("text", { x: X(i), y: y0 + r + 8, class: "efx-viz__label efx-chart__fade", "text-anchor": step < 40 ? "end" : "middle", "dominant-baseline": "hanging", style: `--i:${i % 20}` }, g);
            if (step < 40) t.setAttribute("transform", `rotate(-60 ${X(i)} ${y0 + r + 8})`);
            t.textContent = (_a = x.label) != null ? _a : x.id;
          }
        });
        return marks;
      };
      draw.radius = 1;
      const stop = chart(el, o, draw);
      return () => {
        offData();
        stop();
      };
    }
  };

  // src/charts/viz-chord.js
  var TAU = Math.PI * 2;
  var norm2 = (d, o) => {
    if (Array.isArray(d)) d = { matrix: d };
    d = d && typeof d === "object" ? d : {};
    const M = (Array.isArray(d.matrix) ? d.matrix : []).map((r) => (Array.isArray(r) ? r : []).map((v) => Math.max(0, +v || 0)));
    const n = M.length, L = o.labels.length ? o.labels : Array.isArray(d.labels) ? d.labels : [];
    return { M: M.map((r) => Array.from({ length: n }, (_, i) => r[i] || 0)), L: M.map((_, i) => {
      var _a;
      return String((_a = L[i]) != null ? _a : i + 1);
    }) };
  };
  var viz_chord_default = {
    name: "viz-chord",
    selector: ".efx-viz-chord",
    lazy: true,
    defaults: { ...COMMON, height: 380, legend: false, gap: 0.04 },
    init(el, o) {
      const read = (r) => {
        try {
          return norm2(typeof r === "string" ? JSON.parse(r) : r, o);
        } catch (e) {
          return norm2(null, o);
        }
      };
      const j = el.querySelector(':scope > script[type="application/json"]');
      let d = read((o.data || "").trim() || j && j.textContent);
      const offData = on(el, "efx:data", (e) => {
        d = e.detail ? read(e.detail) : d;
      });
      const draw = ({ g, w, h, colors, fmt, deco }) => {
        const { M, L } = d, n = M.length;
        const tot = M.map((r, i) => r.reduce((a2, v) => a2 + v, 0) + M.reduce((a2, q2) => a2 + q2[i], 0) - M[i][i]);
        const sum = M.reduce((a2, r) => a2 + r.reduce((x, v) => x + v, 0), 0);
        if (!n || !sum) return [];
        const pal = palette(el, o, n);
        const out = M.map((r) => r.reduce((a2, v) => a2 + v, 0)), inn = M.map((_, i) => M.reduce((a2, r) => a2 + r[i], 0)), k = (TAU - n * o.gap) / tot.reduce((a2, v) => a2 + v, 0);
        let a = 0;
        const A = tot.map((t) => {
          const r = [a, a + t * k];
          a += t * k + o.gap;
          return r;
        });
        const sub = M.map((_, i) => {
          let p = A[i][0];
          return M.map((__, j2) => {
            const q2 = [p, p + (i === j2 ? M[i][i] : M[i][j2] + M[j2][i]) * k];
            p = q2[1];
            return q2;
          });
        });
        const pad = deco ? 4 : 18 + Math.min(90, Math.max(...L.map((l) => l.length)) * 6);
        const R = Math.max(30, Math.min(w - 2 * pad, h - 2 * (deco ? 4 : 24)) / 2), cx = w / 2, cy = h / 2, ri = R - (deco ? R * 0.1 : 12);
        const P = (r, an) => pt(cx, cy, r, an).join(",");
        const arc = (r, a0, a1, sw = 1) => `A${r},${r} 0 ${Math.abs(a1 - a0) > Math.PI ? 1 : 0} ${sw} ${P(r, a1)}`;
        const hit = (node) => (px, py) => node.isPointInFill(new DOMPoint(px, py));
        const marks = [];
        M.forEach((_, i) => {
          const [a0, a1] = A[i], m = (a0 + a1) / 2, e = Math.min(a1, a0 + TAU - 1e-4), c = pt(cx, cy, (R + ri) / 2, m);
          const node = s("path", { d: `M${P(R, a0)}${arc(R, a0, e)}L${P(ri, e)}${arc(ri, e, a0, 0)}Z`, fill: pal[i], class: "efx-chart__mark efx-chart__fade", style: `--i:${i}` }, g);
          marks.push({
            x: c[0],
            y: c[1],
            label: L[i],
            value: tot[i],
            node,
            index: i,
            rel: [],
            hit: hit(node),
            html: `<strong>${esc(L[i])}</strong><span>out ${esc(fmt(out[i]))} \xB7 in ${esc(fmt(inn[i]))}</span>`
          });
          if (!deco) {
            const [x, y] = pt(cx, cy, R + 8, m), sn = Math.sin(m), cs = Math.cos(m);
            s("text", { x, y, "text-anchor": sn > 0.1 ? "start" : sn < -0.1 ? "end" : "middle", "dominant-baseline": cs > 0.3 ? "auto" : cs < -0.3 ? "hanging" : "middle", class: "efx-chart__value efx-viz__label efx-chart__fade", style: `--i:${i}` }, g).textContent = L[i];
          }
        });
        M.forEach((_, i) => M.forEach((__, j2) => {
          if (j2 < i || M[i][j2] + M[j2][i] <= 0) return;
          const [s0, s1] = sub[i][j2], [t0, t1] = sub[j2][i], rib = marks.length, same = i === j2;
          const node = s("path", {
            d: `M${P(ri, s0)}${arc(ri, s0, s1)}` + (same ? "" : `Q${cx},${cy} ${P(ri, t0)}${arc(ri, t0, t1)}`) + `Q${cx},${cy} ${P(ri, s0)}Z`,
            fill: pal[M[i][j2] >= M[j2][i] ? i : j2],
            "fill-opacity": 0.6,
            class: "efx-chart__mark efx-chart__fade",
            style: `--i:${rib}`
          }, g);
          const c = pt(cx, cy, ri * 0.6, same ? (s0 + s1) / 2 : (s0 + s1 + t0 + t1) / 4), f = (v) => esc(fmt(v));
          marks[i].rel.push(rib);
          if (!same) marks[j2].rel.push(rib);
          marks.push({
            x: c[0],
            y: c[1],
            label: same ? L[i] : `${L[i]} \u2192 ${L[j2]}`,
            value: M[i][j2] + M[j2][i],
            node,
            index: rib,
            rel: same ? [i] : [i, j2],
            hit: hit(node),
            html: same ? `<strong>${esc(L[i])} \u2192 ${esc(L[i])}: ${f(M[i][i])}</strong>` : `<strong>${esc(L[i])} \u2192 ${esc(L[j2])}: ${f(M[i][j2])}, ${esc(L[j2])} \u2192 ${esc(L[i])}: ${f(M[j2][i])}</strong>`
          });
        }));
        return marks;
      };
      draw.radius = 1;
      const stop = chart(el, o, draw);
      return () => {
        offData();
        stop();
      };
    }
  };

  // src/charts/viz-distribution.js
  var fin = (a) => a.map(Number).filter(Number.isFinite);
  var arr2 = (a) => Array.isArray(a) ? a : [];
  function norm3(raw, o) {
    let d = raw;
    try {
      if (typeof d === "string") d = JSON.parse(d);
    } catch (e) {
      d = null;
    }
    if (Array.isArray(d)) d = d.length && d.every((x) => x && typeof x === "object" && !Array.isArray(x)) ? { series: d } : { series: [{ data: d }] };
    d = d && typeof d === "object" ? d : {};
    const series = arr2(d.series).map((sr, i) => {
      var _a, _b;
      sr = Array.isArray(sr) ? { data: sr } : sr || {};
      let v = arr2(sr.data || sr.values);
      if (!v.some(Array.isArray)) v = [v];
      return { name: String((_b = (_a = sr.name) != null ? _a : o.names[i]) != null ? _b : ""), groups: v.map((x) => fin(arr2(x))) };
    });
    const ng = Math.max(1, ...series.map((x) => x.groups.length)), L = o.labels.length ? o.labels : arr2(d.labels);
    series.forEach((x, i) => {
      if (!x.name && series.length > 1) x.name = "Series " + (i + 1);
    });
    return { series, glabels: Array.from({ length: ng }, (_, i) => {
      var _a;
      return String((_a = L[i]) != null ? _a : ng > 1 ? "Group " + (i + 1) : "");
    }) };
  }
  var q = (a, p) => {
    const i = (a.length - 1) * p, f = Math.floor(i);
    return a[f] + (a[Math.ceil(i)] - a[f]) * (i - f);
  };
  var bwOf = (a, o) => {
    if (o.bandwidth > 0) return o.bandwidth;
    const n = a.length, m = a.reduce((x, y) => x + y, 0) / n, sd = Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / Math.max(1, n - 1));
    return 0.9 * (Math.min(sd, (q(a, 0.75) - q(a, 0.25)) / 1.34 || sd) || 1) * Math.pow(n, -0.2);
  };
  var dummy = (N) => JSON.stringify({ labels: N.glabels, series: N.series.map((x) => ({ name: x.name, values: N.glabels.map((_, i) => (x.groups[i] || []).length) })) });
  var viz_distribution_default = {
    name: "viz-distribution",
    selector: ".efx-viz-distribution",
    lazy: true,
    defaults: { ...COMMON, mode: "density", bandwidth: 0, overlap: 0.8, grid: true, height: 0 },
    init(el, o) {
      const j = el.querySelector(':scope > script[type="application/json"]');
      let N = norm3(o.data || j && j.textContent, o);
      const byG = () => N.series.length < 2 && N.glabels.length > 1;
      const o2 = { ...o, data: dummy(N), labels: N.glabels, source: "" };
      const offData = on(el, "efx:data", (e) => {
        N = norm3(e.detail, o);
        draw.legendByLabel = byG();
      });
      const draw = ({ g, w, h, data, hidden, visible, deco, fmt }) => {
        const mode = o.mode, hz = mode === "density" || mode === "ridgeline", ridge = mode === "ridgeline", bg = draw.legendByLabel;
        const sIdx = bg ? [0] : visible.map((x) => x.index);
        const gIdx = N.glabels.map((_, i) => i).filter((i) => !(bg && hidden.has(i)));
        const cols = palette(el, o, bg ? N.glabels.length : N.series.length), items = [];
        gIdx.forEach((gi, gx) => sIdx.forEach((si, sx) => {
          const sr = N.series[si], a = arr2(sr && sr.groups[gi]).slice().sort((x, y) => x - y);
          if (!a.length) return;
          const gl = N.glabels[gi], sn = sr.name;
          items.push({ a, gx, sx, color: cols[bg ? gi : si], bw: bwOf(a, o), name: N.series.length > 1 ? gl && N.glabels.length > 1 ? gl + " \xB7 " + sn : sn || gl : gl || sn || "Samples" });
        }));
        if (!items.length) return [];
        const ext = mode === "beeswarm" ? 0 : mode === "violin" ? 2 : 3;
        const lo = Math.min(...items.map((t) => t.a[0] - ext * t.bw)), hi = Math.max(...items.map((t) => t.a[t.a.length - 1] + ext * t.bw));
        const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : ridge ? { t: 10, r: 12, b: 28, l: 84 } : hz ? { t: 10, r: 12, b: 28, l: 12 } : { t: 12, r: 8, b: 28, l: 44 };
        const sc = nice(lo, hi, Math.max(2, Math.floor((hz ? w : h) / 70)));
        const v = linear([sc.min, sc.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
        const NP = hz ? 80 : 48;
        if (mode !== "beeswarm") items.forEach((t) => {
          t.xs = [];
          t.ys = [];
          for (let i = 0; i < NP; i++) {
            const x = sc.min + (sc.max - sc.min) * i / (NP - 1);
            let sum = 0;
            for (const a of t.a) sum += Math.exp(-0.5 * ((x - a) / t.bw) ** 2);
            t.xs.push(x);
            t.ys.push(sum / (t.a.length * t.bw * 2.5066));
          }
        });
        const dmax = Math.max(...items.map((t) => Math.max(...t.ys || [0])), 1e-9);
        const b = band(gIdx.length, [pad.l, w - pad.r], 0.2), sw = b.bw / sIdx.length;
        if (!deco) {
          if (hz) {
            const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
            sc.ticks.forEach((t) => {
              if (o.grid) s("line", { x1: v(t), x2: v(t), y1: pad.t, y2: h - pad.b, class: "efx-chart__grid" }, ax);
              s("text", { x: v(t), y: h - pad.b + 16, "text-anchor": "middle" }, ax).textContent = fmt(t);
            });
          } else axes(g, { w, h, pad, y: v, ticks: sc.ticks, labels: gIdx.map((i) => N.glabels[i]), x: (i) => b.x(i) + b.bw / 2, fmt, grid: o.grid });
        }
        const m = items.length, rh = ridge ? (h - pad.t - pad.b) / (m + o.overlap) : 0, amp = rh * (1 + o.overlap);
        const base = h - pad.b, yd = linear([0, dmax], [base, deco ? pad.t : pad.t]);
        const marks = [];
        const info = (t) => {
          const n = t.a.length;
          return `<strong>${esc(t.name)}</strong><span>n <b>${n}</b> \xB7 median <b>${esc(fmt(q(t.a, 0.5)))}</b></span><span>Q1\u2013Q3 <b>${esc(fmt(q(t.a, 0.25)))} \u2013 ${esc(fmt(q(t.a, 0.75)))}</b></span><span>min\u2013max <b>${esc(fmt(t.a[0]))} \u2013 ${esc(fmt(t.a[n - 1]))}</b></span>`;
        };
        items.forEach((t, k) => {
          const f = s("g", { class: "efx-chart__fade", style: `--i:${k}` }, g);
          const med = q(t.a, 0.5), n = t.a.length;
          if (hz) {
            const y0 = ridge ? pad.t + amp + k * rh : base, sy = ridge ? rh * (1 + o.overlap) / dmax : (base - pad.t) / dmax;
            const pts = t.xs.map((x, i) => [v(x), y0 - t.ys[i] * sy]), d = linePath(pts, false);
            if (ridge) {
              s("line", { x1: pad.l, x2: w - pad.r, y1: y0, y2: y0, class: "efx-chart__grid" }, f);
              if (!deco) s("text", { x: pad.l - 8, y: y0 - 3, "text-anchor": "end", class: "efx-chart__axis", "aria-hidden": "true", style: "fill:var(--efx-chart-text)" }, f).textContent = t.name;
            }
            const node = s("g", { class: "efx-chart__mark" }, f);
            s("path", { d: d + `L${pts[NP - 1][0]},${y0}L${pts[0][0]},${y0}Z`, fill: t.color, "fill-opacity": ridge ? 0.7 : 0.22, stroke: "none" }, node);
            s("path", { d, fill: "none", stroke: t.color, "stroke-width": 2, "stroke-linejoin": "round" }, node);
            const pk = t.ys.indexOf(Math.max(...t.ys));
            marks.push({
              x: pts[pk][0],
              y: pts[pk][1],
              label: t.name,
              value: med,
              valueText: "median " + fmt(med),
              html: info(t),
              node,
              index: k,
              group: k,
              hit: (px, py) => ridge ? py <= y0 && (k === 0 || py > y0 - rh) : px >= pts[0][0] && px <= pts[NP - 1][0] && Math.abs(py - pts[Math.max(0, Math.min(NP - 1, Math.round((px - pts[0][0]) / (pts[NP - 1][0] - pts[0][0]) * (NP - 1))))][1]) < 10
            });
            return;
          }
          const cx = b.x(t.gx) + sw * (t.sx + 0.5);
          if (mode === "violin") {
            const hw = sw / 2 * 0.95, R = t.xs.map((x, i) => [cx + t.ys[i] / dmax * hw, v(x)]), L = t.xs.map((x, i) => [cx - t.ys[i] / dmax * hw, v(x)]).reverse();
            const node = s("g", { class: "efx-chart__mark" }, f);
            s("path", { d: linePath(R.concat(L), false) + "Z", fill: t.color, "fill-opacity": 0.35, stroke: t.color, "stroke-width": 1.5, "stroke-linejoin": "round" }, node);
            s("line", { x1: cx, x2: cx, y1: v(q(t.a, 0.25)), y2: v(q(t.a, 0.75)), stroke: t.color, "stroke-width": 5, "stroke-linecap": "round" }, node);
            s("circle", { cx, cy: v(med), r: 3, style: "fill:var(--sh-surface,#fff)" }, node);
            marks.push({ x: cx, y: v(med), label: t.name, value: med, valueText: "median " + fmt(med), html: info(t), node, index: k, group: k, hit: (px) => Math.abs(px - cx) <= sw / 2 });
            return;
          }
          const r = n > 200 ? 2.2 : 3.3, placed = [], lim = sw / 2 - r;
          const dots = t.a.map((val) => {
            const y = v(val);
            let x = 0;
            for (let i = 0; i < 400; i++) {
              x = (i % 2 ? 1 : -1) * Math.ceil(i / 2) * r * 0.6;
              if (!placed.some((p) => (p[0] - x) ** 2 + (p[1] - y) ** 2 < (2 * r) ** 2)) break;
            }
            placed.push([x, y]);
            return [x, y, val];
          });
          const mx = Math.max(...dots.map((p) => Math.abs(p[0]))), kx = mx > lim && lim > 0 ? lim / mx : 1;
          s("line", { x1: cx - sw * 0.35, x2: cx + sw * 0.35, y1: v(med), y2: v(med), stroke: t.color, "stroke-width": 2 }, f);
          dots.forEach(([dx, y, val], i) => {
            const node = s("circle", { cx: cx + dx * kx, cy: y, r, fill: t.color, "fill-opacity": 0.8, class: "efx-chart__mark" }, f);
            marks.push({
              x: cx + dx * kx,
              y,
              label: t.name,
              value: val,
              node,
              index: i,
              group: k,
              html: `<strong>${esc(t.name)}</strong><b>${esc(fmt(val))}</b><span>median ${esc(fmt(med))} \xB7 n ${n}</span>`
            });
          });
        });
        return marks;
      };
      draw.legendByLabel = byG();
      draw.height = () => o.height || (o.mode === "ridgeline" ? N.glabels.length * Math.max(1, N.series.length) * 40 + 40 : 280);
      const off = chart(el, o2, draw);
      return () => {
        offData();
        off();
      };
    }
  };

  // src/charts/viz-map.js
  var D = Math.PI / 180;
  var PROJ = {
    mercator: (x, y) => [x * D, -Math.log(Math.tan(Math.PI / 4 + Math.max(-85, Math.min(85, y)) * D / 2))],
    equirectangular: (x, y) => [x * D, -y * D],
    natural: (x, y) => {
      const p = y * D, a = p * p, b = a * a;
      return [x * D * (0.8707 - 0.131979 * a + b * (-0.013791 + b * (3971e-6 * a - 1529e-6 * b))), -p * (1.007226 + a * (0.015085 + b * (-0.044475 + 0.028874 * a - 5916e-6 * b)))];
    }
  };
  var json = (v) => {
    try {
      return typeof v === "string" ? v.trim() ? JSON.parse(v) : null : v;
    } catch (e) {
      return null;
    }
  };
  var arr3 = (v) => Array.isArray(v) ? v : [];
  var feats = (g) => {
    g = json(g);
    if (!g || typeof g !== "object") return [];
    const l = g.type === "FeatureCollection" ? arr3(g.features) : g.type === "Feature" ? [g] : g.type ? [{ geometry: g }] : [];
    return l.filter((f) => f && f.geometry).map((f) => {
      var _a, _b, _c;
      const p = f.properties || {}, gm = f.geometry;
      const polys = gm.type === "Polygon" ? [gm.coordinates] : gm.type === "MultiPolygon" ? arr3(gm.coordinates) : [];
      return { id: f.id != null ? f.id : p.id, name: String((_c = (_b = (_a = p.name) != null ? _a : p.NAME) != null ? _b : f.id) != null ? _c : ""), polys: polys.map((pl) => arr3(pl).map((r) => arr3(r).filter((c) => isFinite(c[0]) && isFinite(c[1])))) };
    });
  };
  var rowsOf = (v) => {
    v = json(v);
    if (v && !Array.isArray(v) && typeof v === "object") v = Object.keys(v).map((k) => ({ id: k, value: v[k] }));
    return arr3(v).filter((r) => r && typeof r === "object");
  };
  var pip = (rings, x, y) => {
    let c = false;
    rings.forEach((r) => {
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) if (r[i][1] > y !== r[j][1] > y && x < (r[j][0] - r[i][0]) * (y - r[i][1]) / (r[j][1] - r[i][1]) + r[i][0]) c = !c;
    });
    return c;
  };
  var viz_map_default = {
    name: "viz-map",
    selector: ".efx-viz-map",
    lazy: true,
    defaults: { ...COMMON, geo: "", geoUrl: "", projection: "mercator", points: "", routes: "", zoom: false, steps: 6, legend: true, height: 0 },
    init(el, o) {
      const j = el.querySelector(':scope > script[type="application/json"]');
      let geo = feats(o.geo || j && j.textContent), vals = rowsOf(o.data), pts = rowsOf(o.points), routes = rowsOf(o.routes);
      const proj = PROJ[o.projection] || PROJ.mercator;
      let alive = true;
      const set = (d) => {
        var _a;
        if (d.geo != null) geo = feats(d.geo);
        if (d.data != null || d.values != null) vals = rowsOf((_a = d.data) != null ? _a : d.values);
        if (d.points != null) pts = rowsOf(d.points);
        if (d.routes != null) routes = rowsOf(d.routes);
      };
      const offData = on(el, "efx:data", (e) => set(e.detail || {}));
      if (o.geoUrl) fetch(o.geoUrl).then((r) => r.json()).then((g) => {
        if (alive) el.dispatchEvent(new CustomEvent("efx:data", { detail: { geo: g } }));
      }).catch((e) => console.warn("[effix] map geo", e));
      const fit = (w, h, pad) => {
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        const add = (lon, lat) => {
          const p = proj(lon, lat);
          x0 = Math.min(x0, p[0]);
          x1 = Math.max(x1, p[0]);
          y0 = Math.min(y0, p[1]);
          y1 = Math.max(y1, p[1]);
        };
        geo.forEach((f) => f.polys.forEach((pl) => pl.forEach((r) => r.forEach((c) => add(c[0], c[1])))));
        if (!geo.length) pts.forEach((q2) => add(+q2.lon, +q2.lat));
        if (x1 < x0) return null;
        const k = Math.min((w - 2 * pad) / (x1 - x0 || 1), (h - 2 * pad) / (y1 - y0 || 1));
        return { k, x: w / 2 - k * (x0 + x1) / 2, y: h / 2 - k * (y0 + y1) / 2, ar: (y1 - y0 || 1) / (x1 - x0 || 1) };
      };
      const T = { k: 1, x: 0, y: 0 };
      let cur = null, moved = 0;
      const apply = () => {
        if (!cur) return;
        cur.g.setAttribute("transform", `translate(${T.x} ${T.y}) scale(${T.k})`);
        cur.marks.forEach((m) => {
          m.x = m.bx * T.k + T.x;
          m.y = m.by * T.k + T.y;
        });
      };
      const svgPos = (e) => {
        const sv = el.querySelector(".efx-chart__svg"), r = sv.getBoundingClientRect();
        return [(e.clientX - r.left) * (cur.w / r.width), (e.clientY - r.top) * (cur.h / r.height)];
      };
      const offs = [];
      if (o.zoom) {
        let drag = null;
        offs.push(
          on(el, "wheel", (e) => {
            if (!cur) return;
            e.preventDefault();
            const [px, py] = svgPos(e), k = Math.max(1, Math.min(14, T.k * Math.exp(-e.deltaY * 15e-4)));
            T.x = px - (px - T.x) * k / T.k;
            T.y = py - (py - T.y) * k / T.k;
            T.k = k;
            if (k === 1) {
              T.x = 0;
              T.y = 0;
            }
            apply();
          }, { passive: false }),
          on(el, "pointerdown", (e) => {
            if (e.button === 0 && T.k > 1) {
              drag = [e.clientX, e.clientY, T.x, T.y];
              moved = 0;
            }
          }),
          on(el, "pointermove", (e) => {
            if (drag) {
              moved = Math.max(moved, Math.abs(e.clientX - drag[0]) + Math.abs(e.clientY - drag[1]));
              if (moved > 3) {
                T.x = drag[2] + e.clientX - drag[0];
                T.y = drag[3] + e.clientY - drag[1];
                apply();
              }
            }
          }),
          on(window, "pointerup", () => {
            drag = null;
          }),
          on(el, "click", (e) => {
            if (moved > 3) {
              e.stopPropagation();
              moved = 0;
            }
          }, true),
          on(el, "dblclick", () => {
            T.k = 1;
            T.x = T.y = 0;
            apply();
          })
        );
      }
      const draw = ({ g: root, w, h, colors, fmt, deco }) => {
        const pad = deco ? 0 : 8;
        const F = fit(w, h, pad);
        if (!F) return [];
        if (o.zoom) {
          root.parentNode.style.overflow = "hidden";
          root.parentNode.style.touchAction = "pan-y";
        }
        const g = s("g", {}, root), P = (lon, lat) => {
          const p = proj(lon, lat);
          return [p[0] * F.k + F.x, p[1] * F.k + F.y];
        };
        const base = colors[0], pt2 = colors[1] || colors[0];
        const marks = [], fm = [];
        const look = /* @__PURE__ */ new Map();
        vals.forEach((r) => {
          const v = +r.value;
          if (isFinite(v)) [r.id, r.name].forEach((k) => k != null && look.set(String(k).toLowerCase(), v));
        });
        const vv = geo.map((f) => {
          var _a;
          return (_a = look.get(String(f.id).toLowerCase())) != null ? _a : look.get(f.name.toLowerCase());
        }).filter((v) => v != null);
        const lo = Math.min(...vv), hi = Math.max(...vv), N = Math.max(2, o.steps | 0);
        const ramp = (i) => `color-mix(in oklab, ${base} ${Math.round(18 + 82 * i / (N - 1))}%, var(--sh-surface, #fff))`;
        const bin = (v) => hi === lo ? N - 1 : Math.min(N - 1, Math.floor((v - lo) / (hi - lo) * N));
        geo.forEach((f, i) => {
          var _a, _b;
          const v = (_a = look.get(String(f.id).toLowerCase())) != null ? _a : look.get(f.name.toLowerCase());
          const rings = f.polys.map((pl) => pl.map((r) => r.map((c) => P(c[0], c[1]))));
          const d = rings.map((pl) => pl.map((r) => "M" + r.map((c) => c[0].toFixed(1) + "," + c[1].toFixed(1)).join("L") + "Z").join("")).join("");
          const fill = v != null ? ramp(bin(v)) : vv.length ? "color-mix(in oklab, var(--sh-border, #e2e8f0) 55%, var(--sh-surface, #fff))" : ramp(0);
          const node = s("path", { d, "fill-rule": "evenodd", style: `fill:${fill};--i:${i}`, class: "efx-chart__mark efx-viz-map__f efx-chart__fade" }, g);
          let best = null, ba = -1;
          rings.forEach((pl) => {
            const r = pl[0] || [];
            const xs = r.map((c) => c[0]), ys = r.map((c) => c[1]);
            const a = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
            if (a > ba) {
              ba = a;
              best = [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2];
            }
          });
          fm.push({
            x: best ? best[0] : 0,
            y: best ? best[1] : 0,
            bx: best ? best[0] : 0,
            by: best ? best[1] : 0,
            label: f.name || String((_b = f.id) != null ? _b : ""),
            value: v,
            valueText: v == null ? "no data" : fmt(v),
            node,
            index: i,
            group: 0,
            hit: (px, py) => {
              const bx = (px - T.x) / T.k, by = (py - T.y) / T.k;
              return rings.some((pl) => pip(pl, bx, by));
            }
          });
        });
        routes.forEach((r, i) => {
          const a = arr3(r.from), b = arr3(r.to);
          if (a.length < 2 || b.length < 2) return;
          const [x0, y0] = P(+a[1], +a[0]), [x1, y1] = P(+b[1], +b[0]), dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len, ny = dx / len, f = (ny > 0 ? -1 : 1) * len * 0.2, cx = (x0 + x1) / 2 + nx * f, cy = (y0 + y1) / 2 + ny * f;
          s("path", { d: `M${x0},${y0}Q${cx},${cy} ${x1},${y1}`, fill: "none", stroke: pt2, "stroke-width": 1.6, "stroke-linecap": "round", "vector-effect": "non-scaling-stroke", class: "efx-viz-map__route efx-chart__fade", style: `--i:${i + 4}` }, g);
        });
        const bv = pts.map((q2) => +q2.value || 0), bmax = Math.max(...bv, 1), R = Math.max(8, Math.min(30, Math.min(w, h) * 0.06));
        const bm = [];
        pts.forEach((q2, i) => {
          var _a;
          if (!isFinite(+q2.lat) || !isFinite(+q2.lon)) return;
          const [x, y] = P(+q2.lon, +q2.lat), r = Math.max(3, R * Math.sqrt(bv[i] / bmax));
          const node = s("circle", { cx: x, cy: y, r, fill: pt2, "fill-opacity": 0.6, stroke: pt2, "stroke-width": 1.5, "vector-effect": "non-scaling-stroke", class: "efx-chart__mark efx-chart__fade", style: `--i:${i + 6}` }, g);
          bm.push({ x, y, bx: x, by: y, label: String((_a = q2.label) != null ? _a : `${q2.lat}, ${q2.lon}`), value: bv[i], node, index: i, group: 0, hit: (px, py) => Math.hypot((px - T.x) / T.k - x, (py - T.y) / T.k - y) <= r + 3 / T.k });
        });
        if (!deco && o.legend && vv.length) {
          const lg = s("g", { "aria-hidden": "true", class: "efx-chart__axis", transform: `translate(${pad + 4} ${h - pad - 22})` }, root), sw = 18;
          for (let i = 0; i < N; i++) s("rect", { x: i * sw, y: 0, width: sw, height: 8, style: `fill:${ramp(i)}` }, lg);
          s("text", { x: 0, y: 20 }, lg).textContent = fmt(lo);
          s("text", { x: N * sw, y: 20, "text-anchor": "end" }, lg).textContent = fmt(hi);
        }
        cur = { g, marks: [...bm, ...fm], w, h };
        marks.push(...cur.marks);
        apply();
        return marks;
      };
      draw.height = (w) => {
        if (o.height > 0) return 0;
        const F = fit(w, 1e3, 8);
        return F ? Math.round(Math.max(160, Math.min(560, (w - 16) * F.ar + 16))) : 240;
      };
      draw.radius = 1e-3;
      const stop = chart(el, o, draw);
      return () => {
        alive = false;
        offData();
        offs.forEach((f) => f());
        stop();
        cur = null;
      };
    }
  };

  // src/charts/viz-marimekko.js
  var viz_marimekko_default = {
    name: "viz-marimekko",
    selector: ".efx-viz-marimekko",
    lazy: true,
    defaults: { ...COMMON, gap: 2, inside: "percent", height: 320 },
    init(el, o) {
      return chart(el, o, ({ g, w, h, data, visible, colors, fmt, deco }) => {
        const n = data.labels.length;
        const tot = data.labels.map((_, i) => visible.reduce((a, sr) => a + Math.max(0, sr.values[i] || 0), 0));
        const all = tot.reduce((a, b) => a + b, 0);
        if (!n || !all) return [];
        const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : { t: 8, r: 4, b: 40, l: 36 };
        const pw = w - pad.l - pad.r - o.gap * (n - 1), ph = h - pad.t - pad.b, pct = (v) => (v / all * 100).toFixed(1).replace(/\.0$/, "") + "%";
        const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
        if (!deco) [0, 25, 50, 75, 100].forEach((t) => {
          s("text", { x: pad.l - 6, y: pad.t + ph * (1 - t / 100), "text-anchor": "end", "dominant-baseline": "middle" }, ax).textContent = t + "%";
        });
        const marks = [], txt = s("g", { "pointer-events": "none" }, g);
        let x = pad.l;
        data.labels.forEach((label, i) => {
          if (!tot[i]) return;
          const cw = tot[i] / all * pw;
          let y = pad.t + ph;
          if (!deco) {
            const c = x + cw / 2, ch = Math.floor(cw / 6.2);
            if (ch >= 3) {
              s("text", { x: c, y: h - pad.b + 16, "text-anchor": "middle", style: "font-weight:600" }, ax).textContent = label.length > ch ? label.slice(0, ch - 1) + "\u2026" : label;
              if (cw > 44) s("text", { x: c, y: h - pad.b + 30, "text-anchor": "middle" }, ax).textContent = fmt(tot[i]);
            }
          }
          visible.forEach((sr) => {
            const v = Math.max(0, sr.values[i] || 0);
            if (!v) return;
            const sh = v / tot[i] * ph;
            y -= sh;
            const node = s("rect", { x, y: y + 0, width: cw, height: sh, fill: colors[sr.index], class: "efx-chart__mark efx-chart__grow", style: `--i:${i};stroke:var(--sh-surface,#fff);stroke-width:1.5` }, g);
            if (!deco && o.inside !== "none" && cw > 34 && sh > 16) {
              const big = cw > 70 && sh > 34, t = s("text", { x: x + cw / 2, y: y + sh / 2 + (big ? -6 : 0), "text-anchor": "middle", "dominant-baseline": "middle", class: "efx-chart__fade", style: `--i:${i};fill:#fff;stroke:rgb(0 0 0/.3);stroke-width:2.5px;paint-order:stroke;font-weight:600;font-size:11px` }, txt);
              t.textContent = o.inside === "value" ? fmt(v) : (v / tot[i] * 100).toFixed(0) + "%";
              if (big) s("text", { x: x + cw / 2, y: y + sh / 2 + 8, "text-anchor": "middle", "dominant-baseline": "middle", class: "efx-chart__fade", style: `--i:${i};fill:#fff;stroke:rgb(0 0 0/.3);stroke-width:2.5px;paint-order:stroke;font-size:10px` }, txt).textContent = cw / 6 > sr.name.length ? sr.name : sr.name.slice(0, Math.floor(cw / 6) - 1) + "\u2026";
            }
            const cy = y, sy = x, sw = cw, shh = sh;
            marks.push({
              x: x + cw / 2,
              y: y + sh / 2,
              label,
              series: sr.name,
              value: v,
              node,
              index: i,
              group: sr.index,
              html: `<strong>${esc(label)}</strong><span>${esc(sr.name)}</span><b>${esc(fmt(v))}</b><span>${(v / tot[i] * 100).toFixed(1)}% of ${esc(label)} \xB7 ${pct(v)} of total</span>`,
              hit: (px, py) => px >= sy && px <= sy + sw && py >= cy && py <= cy + shh
            });
          });
          x += cw + o.gap;
        });
        g.appendChild(txt);
        return marks;
      });
    }
  };

  // src/charts/viz-network.js
  var arr4 = (v) => Array.isArray(v) ? v : [];
  var norm4 = (d) => {
    d = d && typeof d === "object" ? d : {};
    const ix = /* @__PURE__ */ new Map();
    const N = arr4(d.nodes).map((n) => n && typeof n === "object" ? { ...n } : { id: n }).filter((n) => n.id != null).map((n, i) => (ix.set(String(n.id), i), { ...n, id: String(n.id), i }));
    const id = (v) => ix.get(String(v && typeof v === "object" ? v.id : v));
    const L = arr4(d.links).map((l) => l && { s: id(l.source), t: id(l.target), v: +l.value || 1 }).filter((l) => l && l.s != null && l.t != null && l.s !== l.t);
    return { N, L };
  };
  var viz_network_default = {
    name: "viz-network",
    selector: ".efx-viz-network",
    lazy: true,
    defaults: { ...COMMON, height: 420, legend: false, label: false, zoom: true, linkDistance: 70, charge: 60, radius: 5 },
    init(el, o) {
      const read = (r) => {
        try {
          return norm4(typeof r === "string" ? JSON.parse(r) : r);
        } catch (e) {
          return norm4();
        }
      };
      const j = el.querySelector(':scope > script[type="application/json"]');
      let d = read((o.data || "").trim() || j && j.textContent);
      const offData = on(el, "efx:data", (e) => {
        d = e.detail ? norm4(e.detail) : d;
      });
      let S, raf = 0, view = { k: 1, x: 0, y: 0 }, bound = 0, cur;
      const cancel = () => {
        cancelAnimationFrame(raf);
        raf = 0;
      };
      const tick = () => {
        const { N, L } = S, a = S.a += (S.t - S.a) * S.dec, n = N.length;
        L.forEach((l) => {
          const A = N[l.s], B = N[l.t];
          let dx = B.x + B.vx - A.x - A.vx || 1e-6, dy = B.y + B.vy - A.y - A.vy || 1e-6;
          const k = (Math.hypot(dx, dy) - o.linkDistance) / Math.hypot(dx, dy) * a * l.k;
          dx *= k;
          dy *= k;
          B.vx -= dx * l.b;
          B.vy -= dy * l.b;
          A.vx += dx * (1 - l.b);
          A.vy += dy * (1 - l.b);
        });
        for (let i = 0; i < n; i++) for (let j2 = i + 1; j2 < n; j2++) {
          const A = N[i], B = N[j2];
          let dx = B.x - A.x || Math.random() * 1e-3, dy = B.y - A.y || Math.random() * 1e-3, d2 = dx * dx + dy * dy;
          if (d2 < 4e4) {
            const f = o.charge * a / Math.max(d2, 1);
            A.vx -= dx * f;
            A.vy -= dy * f;
            B.vx += dx * f;
            B.vy += dy * f;
          }
          const rr = A.r + B.r + 1, dd = Math.sqrt(d2);
          if (dd < rr) {
            const m = (rr - dd) / dd * 0.35;
            A.vx -= dx * m;
            A.vy -= dy * m;
            B.vx += dx * m;
            B.vy += dy * m;
          }
        }
        let sx = 0, sy = 0;
        N.forEach((p) => {
          p.vx += (S.cx - p.x) * 0.03 * a;
          p.vy += (S.cy - p.y) * 0.03 * a;
          sx += p.x;
          sy += p.y;
        });
        sx = sx / n - S.cx;
        sy = sy / n - S.cy;
        N.forEach((p) => {
          if (p.fx != null) {
            p.x = p.fx;
            p.y = p.fy;
            p.vx = p.vy = 0;
          } else {
            p.x += (p.vx *= 0.6) - sx;
            p.y += (p.vy *= 0.6) - sy;
          }
        });
      };
      const draw = ({ svg, g, w, h, deco }) => {
        cancel();
        if (!d.N.length) return [];
        const { N, L } = d;
        if (!S || S.src !== d) {
          const deg = N.map(() => 0);
          L.forEach((l) => {
            deg[l.s]++;
            deg[l.t]++;
          });
          L.forEach((l) => {
            l.k = 1 / Math.min(deg[l.s], deg[l.t]);
            l.b = deg[l.s] / (deg[l.s] + deg[l.t]);
          });
          const mean = N.reduce((a, n) => a + (+n.size || 1), 0) / N.length;
          N.forEach((n, i) => {
            const q2 = 10 * Math.sqrt(0.5 + i), t = i * 2.4;
            Object.assign(n, { x: w / 2 + q2 * Math.cos(t), y: h / 2 + q2 * Math.sin(t), vx: 0, vy: 0, fx: null, fy: null, r: o.radius * Math.sqrt((+n.size || 1) / mean), deg: deg[i] });
          });
          S = { src: d, N, L, a: 1, t: 0, dec: 1 - Math.pow(1e-3, 1 / 300), cx: w / 2, cy: h / 2 };
        } else {
          N.forEach((n) => {
            n.x += w / 2 - S.cx;
            n.y += h / 2 - S.cy;
          });
          Object.assign(S, { cx: w / 2, cy: h / 2, a: Math.max(S.a, 0.3) });
        }
        const groups = [...new Set(N.map((n) => n.group))], pal = palette(el, o, groups.length);
        const zg = s("g", { class: "efx-viz__zoom", transform: `translate(${view.x} ${view.y}) scale(${view.k})` }, g);
        const lines = L.map((l) => s("line", { class: "efx-viz__link", "stroke-width": Math.min(4, 0.6 + Math.sqrt(l.v)) }, zg));
        const circles = N.map((n, i) => s("circle", { r: n.r, fill: pal[groups.indexOf(n.group)], class: "efx-chart__mark efx-chart__fade efx-viz__node", "data-i": i, style: `--i:${i % 20}` }, zg));
        const texts = o.label && !deco ? N.map((n) => {
          var _a;
          const t = s("text", { class: "efx-viz__label", "text-anchor": "middle" }, zg);
          t.textContent = (_a = n.label) != null ? _a : n.id;
          return t;
        }) : [];
        const marks = N.map((n, i) => {
          var _a, _b;
          return {
            label: String((_a = n.label) != null ? _a : n.id),
            series: n.group != null ? String(n.group) : "",
            value: (_b = n.size) != null ? _b : n.deg,
            valueText: `${n.deg} link${n.deg === 1 ? "" : "s"}`,
            node: circles[i],
            index: i,
            rel: L.filter((l) => l.s === i || l.t === i).map((l) => l.s === i ? l.t : l.s),
            hit: (px, py) => Math.hypot(px - marks[i].x, py - marks[i].y) <= n.r * view.k + 3
          };
        });
        const paint = () => {
          N.forEach((n, i) => {
            circles[i].setAttribute("cx", n.x);
            circles[i].setAttribute("cy", n.y);
            if (texts[i]) {
              texts[i].setAttribute("x", n.x);
              texts[i].setAttribute("y", n.y - n.r - 4);
            }
            marks[i].x = n.x * view.k + view.x;
            marks[i].y = n.y * view.k + view.y;
          });
          L.forEach((l, i) => {
            const A = N[l.s], B = N[l.t];
            lines[i].setAttribute("x1", A.x);
            lines[i].setAttribute("y1", A.y);
            lines[i].setAttribute("x2", B.x);
            lines[i].setAttribute("y2", B.y);
          });
        };
        const still = () => !motionOK() || !o.animate;
        const frame = () => {
          raf = 0;
          tick();
          paint();
          if (S.a > 1e-3 || S.t) raf = requestAnimationFrame(frame);
        };
        const go = () => {
          if (!still()) {
            if (!raf) raf = requestAnimationFrame(frame);
            return;
          }
          for (let i = 0; i < 300 && (S.a > 1e-3 || S.t && i < 20); i++) tick();
          paint();
        };
        draw.onShow = (m) => lines.forEach((ln, i) => ln.classList.toggle("is-dim", !!m && L[i].s !== m.index && L[i].t !== m.index));
        go();
        if (deco) return marks;
        cur = { go, paint, zg };
        if (!bound++) {
          const P = (e) => {
            const r = svg.getBoundingClientRect();
            return [(e.clientX - r.left) * (svg.viewBox.baseVal.width / r.width), (e.clientY - r.top) * (svg.viewBox.baseVal.height / r.height)];
          };
          const apply = () => {
            cur.zg.setAttribute("transform", `translate(${view.x} ${view.y}) scale(${view.k})`);
            cur.paint();
          };
          let drag, pan;
          svg.addEventListener("pointerdown", (e) => {
            const i = e.target.getAttribute && e.target.getAttribute("data-i");
            if (i != null) {
              drag = S.N[i];
              S.t = 0.3;
              svg.setPointerCapture(e.pointerId);
              cur.go();
            } else if (o.zoom && e.pointerType !== "touch") {
              pan = [e.clientX - view.x, e.clientY - view.y];
              svg.setPointerCapture(e.pointerId);
            }
          });
          svg.addEventListener("pointermove", (e) => {
            if (drag) {
              const [x, y] = P(e);
              drag.fx = (x - view.x) / view.k;
              drag.fy = (y - view.y) / view.k;
              cur.go();
            } else if (pan) {
              view.x = e.clientX - pan[0];
              view.y = e.clientY - pan[1];
              apply();
            }
          });
          const up = () => {
            if (drag) {
              drag.fx = drag.fy = null;
              S.t = 0;
              cur.go();
            }
            drag = pan = null;
          };
          svg.addEventListener("pointerup", up);
          svg.addEventListener("pointercancel", up);
          if (o.zoom) svg.addEventListener("wheel", (e) => {
            e.preventDefault();
            const [x, y] = P(e), k = Math.max(0.3, Math.min(8, view.k * Math.exp(-e.deltaY * 15e-4))), q2 = k / view.k;
            view = { k, x: x - (x - view.x) * q2, y: y - (y - view.y) * q2 };
            apply();
          }, { passive: false });
        }
        return marks;
      };
      draw.radius = 1;
      const stop = chart(el, o, draw);
      return () => {
        cancel();
        offData();
        stop();
      };
    }
  };

  // src/charts/viz-pack.js
  var place = (b, a, c) => {
    const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
    if (!d2) {
      c.x = a.x + c.r;
      c.y = a.y;
      return;
    }
    const a2 = (a.r + c.r) ** 2, b2 = (b.r + c.r) ** 2;
    if (a2 > b2) {
      const x = (d2 + b2 - a2) / (2 * d2), y = Math.sqrt(Math.max(0, b2 / d2 - x * x));
      c.x = b.x - x * dx - y * dy;
      c.y = b.y - x * dy + y * dx;
    } else {
      const x = (d2 + a2 - b2) / (2 * d2), y = Math.sqrt(Math.max(0, a2 / d2 - x * x));
      c.x = a.x + x * dx - y * dy;
      c.y = a.y + x * dy + y * dx;
    }
  };
  var hits = (a, b) => {
    const dr = a.r + b.r - 1e-6, dx = b.x - a.x, dy = b.y - a.y;
    return dr > 0 && dr * dr > dx * dx + dy * dy;
  };
  var score = (n) => {
    const a = n._, b = n.next._, ab = a.r + b.r, dx = (a.x * b.r + b.x * a.r) / ab, dy = (a.y * b.r + b.y * a.r) / ab;
    return dx * dx + dy * dy;
  };
  var enclose = (C) => {
    let x = 0, y = 0, W = 0;
    C.forEach((c) => {
      x += c.x * c.r;
      y += c.y * c.r;
      W += c.r;
    });
    x /= W;
    y /= W;
    for (let i = 1; i < 80; i++) {
      let f, m = -1;
      C.forEach((c) => {
        const q2 = Math.hypot(c.x - x, c.y - y) + c.r;
        if (q2 > m) {
          m = q2;
          f = c;
        }
      });
      const d = Math.hypot(f.x - x, f.y - y) || 1, t = (d - f.r) / (i + 1) / d;
      x += (f.x - x) * t;
      y += (f.y - y) * t;
    }
    return { x, y, r: Math.max(...C.map((c) => Math.hypot(c.x - x, c.y - y) + c.r)) };
  };
  var packSiblings = (C) => {
    const n = C.length;
    let a = C[0], b, c, i, j, k, sj, sk, aa, ca;
    a.x = a.y = 0;
    if (n < 2) return a.r;
    b = C[1];
    a.x = -b.r;
    b.x = a.r;
    b.y = 0;
    if (n < 3) return a.r + b.r;
    place(b, a, C[2]);
    const node = (_) => ({ _, next: null, previous: null });
    a = node(a);
    b = node(b);
    c = node(C[2]);
    a.next = c.previous = b;
    b.next = a.previous = c;
    c.next = b.previous = a;
    pack: for (i = 3; i < n; ++i) {
      place(a._, b._, C[i]);
      c = node(C[i]);
      j = b.next;
      k = a.previous;
      sj = b._.r;
      sk = a._.r;
      do {
        if (sj <= sk) {
          if (hits(j._, c._)) {
            b = j;
            a.next = b;
            b.previous = a;
            --i;
            continue pack;
          }
          sj += j._.r;
          j = j.next;
        } else {
          if (hits(k._, c._)) {
            a = k;
            a.next = b;
            b.previous = a;
            --i;
            continue pack;
          }
          sk += k._.r;
          k = k.previous;
        }
      } while (j !== k.next);
      c.previous = a;
      c.next = b;
      a.next = b.previous = b = c;
      aa = score(a);
      while ((c = c.next) !== b) if ((ca = score(c)) < aa) {
        a = c;
        aa = ca;
      }
      b = a.next;
    }
    const ring = [b._];
    for (c = b.next; c !== b; c = c.next) ring.push(c._);
    const E = enclose(ring);
    C.forEach((q2) => {
      q2.x -= E.x;
      q2.y -= E.y;
    });
    return E.r;
  };
  var build = (d, padding) => {
    let pad = 0;
    const nodes = [];
    const rec = (src, parent, depth) => {
      var _a;
      const kids = (Array.isArray(src && src.children) ? src.children : []).filter((k) => k && typeof k === "object");
      const n = { name: String((_a = src && src.name) != null ? _a : ""), depth, parent, kids: [], value: kids.length ? 0 : src && src.value != null ? Math.max(0, +src.value) || 0 : 1, index: nodes.length, x: 0, y: 0 };
      nodes.push(n);
      n.kids = kids.map((k) => rec(k, n, depth + 1));
      if (n.kids.length) n.value = n.kids.reduce((a, k) => a + k.value, 0);
      return n;
    };
    const root = rec(d, null, 0);
    const size = (n) => {
      if (!n.kids.length) {
        n.r = Math.sqrt(n.value);
        return;
      }
      n.kids.forEach(size);
      const C = n.kids.filter((k) => k.r > 0).map((k) => k.p = { x: 0, y: 0, r: k.r + pad, k });
      n.r = C.length ? packSiblings(C) + pad : 0;
      C.forEach((q2) => {
        q2.k.x = q2.x;
        q2.k.y = q2.y;
      });
    };
    const lv = nodes.filter((n) => !n.kids.length && n.value > 0);
    pad = padding * lv.reduce((a, n) => a + Math.sqrt(n.value), 0) / (lv.length || 1);
    size(root);
    const abs = (n) => n.kids.forEach((k) => {
      k.x += n.x;
      k.y += n.y;
      abs(k);
    });
    abs(root);
    return { nodes: nodes.filter((n) => n.r > 0), root };
  };
  var viz_pack_default = {
    name: "viz-pack",
    selector: ".efx-viz-pack",
    lazy: true,
    defaults: { ...COMMON, height: 420, legend: false, padding: 0.15 },
    init(el, o) {
      const read = (r) => {
        try {
          return typeof r === "string" ? JSON.parse(r) : r;
        } catch (e) {
          return null;
        }
      };
      const j = el.querySelector(':scope > script[type="application/json"]');
      let src = read((o.data || "").trim() || j && j.textContent), T, focus, raf = 0;
      const offData = on(el, "efx:data", (e) => {
        src = e.detail || src;
        T = focus = null;
      });
      const draw = ({ g, w, h, deco, fmt }) => {
        cancelAnimationFrame(raf);
        if (!T) {
          T = build(src && typeof src === "object" ? src : {}, o.padding);
          focus = null;
        }
        const { nodes, root } = T;
        if (!root.r) return [];
        const top = root.kids.filter((k) => k.r > 0), pal = palette(el, o, top.length);
        const colorOf = (n) => {
          while (n.depth > 1) n = n.parent;
          return pal[top.indexOf(n)] || pal[0];
        };
        const zg = s("g", {}, g), lg = s("g", { class: "efx-viz__labels" }, g);
        const marks = nodes.map((n, i) => {
          const leaf = !n.kids.length, root0 = !n.depth, c = colorOf(n);
          const node = s("circle", { cx: n.x, cy: n.y, r: n.r, fill: root0 ? "none" : c, "fill-opacity": leaf ? 0.8 : 0.06 + 0.05 * n.depth, stroke: root0 ? "var(--efx-chart-grid)" : c, "stroke-opacity": 0.55, "vector-effect": "non-scaling-stroke", class: "efx-chart__mark efx-chart__fade", style: `--i:${Math.min(n.depth * 4 + i % 8, 30)}` }, zg);
          const path = [];
          for (let q2 = n; q2; q2 = q2.parent) path.unshift(q2.name);
          return {
            x: 0,
            y: 0,
            label: n.name || "Root",
            series: n.depth > 1 ? path.slice(1, -1).join(" \u203A ") : "",
            value: n.value,
            node,
            index: i,
            n,
            rel: [],
            html: `<strong>${esc(path.slice(1).join(" \u203A ") || n.name)}</strong><b>${esc(fmt(n.value))}</b>`,
            hit: (px, py) => Math.hypot(px - marks[i].x, py - marks[i].y) <= n.r * K()
          };
        });
        const labels = deco ? [] : marks.filter((m) => !m.n.kids.length).map((m) => {
          const t = s("text", { class: "efx-viz__label", "text-anchor": "middle", "dominant-baseline": "middle" }, lg);
          t.textContent = m.label;
          return [m, t];
        });
        let f = focus ? { x: focus.x, y: focus.y, r: focus.r } : { x: root.x, y: root.y, r: root.r };
        const m0 = deco ? 0 : 6, K = () => Math.min(w, h) / 2 / f.r * (1 - m0 / 100);
        const apply = () => {
          const k = K(), tx = w / 2 - f.x * k, ty = h / 2 - f.y * k;
          zg.setAttribute("transform", `translate(${tx} ${ty}) scale(${k})`);
          marks.forEach((m) => {
            m.x = m.n.x * k + tx;
            m.y = m.n.y * k + ty;
            m.node.classList.toggle("efx-viz__out", !!focus && !inside(m.n));
          });
          labels.forEach(([m, t]) => {
            const show = m.n.r * k * 1.7 > m.label.length * 6 + 6 && m.n.r * k > 9 && inside(m.n);
            t.style.display = show ? "" : "none";
            if (show) {
              t.setAttribute("x", m.x);
              t.setAttribute("y", m.y);
            }
          });
        };
        const inside = (n) => {
          for (let q2 = n; q2; q2 = q2.parent) if (q2 === (focus || root)) return true;
          return false;
        };
        const zoom = (n) => {
          if (deco || n === (focus || root)) return;
          const to = { x: n.x, y: n.y, r: n.r }, from = { ...f }, t0 = performance.now();
          focus = n === root ? null : n;
          const step = (t) => {
            const u = Math.min(1, (t - t0) / 600), e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
            f = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, r: from.r + (to.r - from.r) * e };
            apply();
            raf = u < 1 ? requestAnimationFrame(step) : 0;
          };
          if (motionOK() && o.animate) raf = requestAnimationFrame(step);
          else {
            f = to;
            apply();
          }
        };
        apply();
        draw.zoom = zoom;
        draw.cur = () => ({ root, focus });
        return marks;
      };
      draw.radius = 1;
      const pick = (n, svgClick) => {
        const { root, focus: focus2 } = draw.cur ? draw.cur() : {};
        if (!root) return;
        const cur = focus2 || root;
        if (n) {
          let q2 = n;
          while (q2 && q2.parent !== cur) q2 = q2.parent;
          if (q2 && q2.kids.length) return draw.zoom(q2);
          if (q2) return;
        }
        if (svgClick || n) draw.zoom(cur.parent || root);
      };
      let nodesOf = () => T ? T.nodes : [];
      const offSel = on(el, "efx:select", (e) => pick(nodesOf()[e.detail.index]));
      const stop = chart(el, o, draw);
      const svg = el.querySelector(".efx-chart__svg");
      const offBg = !o.background && svg ? on(svg, "click", (e) => {
        if (!e.target.closest(".efx-chart__mark")) pick(null, true);
      }) : () => {
      };
      return () => {
        cancelAnimationFrame(raf);
        offSel();
        offBg();
        offData();
        stop();
      };
    }
  };

  // src/charts/viz-parallel.js
  var rowsOf2 = (d) => {
    d = Array.isArray(d) ? d : d && d.rows;
    return Array.isArray(d) && d.length && d.every((r) => r && typeof r === "object" && !Array.isArray(r) && !("data" in r) && !("values" in r)) ? d : null;
  };
  var parse = (r) => {
    try {
      return rowsOf2(typeof r === "string" ? JSON.parse(r) : r);
    } catch (e) {
      return null;
    }
  };
  var prep = (R, o) => {
    const dims = (o.dims.length ? o.dims : [...new Set(R.flatMap((r) => Object.keys(r)))].filter((k) => k !== "name" && k !== o.group)).filter((k) => R.some((r) => Number.isFinite(parseFloat(r[k]))));
    const groups = [...new Set(R.map((r) => {
      var _a;
      return String((_a = r[o.group]) != null ? _a : "");
    }))];
    return { dims, groups, rows: R.map((r, i) => {
      var _a, _b;
      return { name: String((_a = r.name) != null ? _a : i + 1), grp: groups.indexOf(String((_b = r[o.group]) != null ? _b : "")), vals: dims.map((k) => parseFloat(r[k])) };
    }) };
  };
  var dseg = (px, py, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
  };
  var stub = (P) => ({ labels: P.groups, series: [{ name: "", values: P.groups.map(() => 0) }] });
  var viz_parallel_default = {
    name: "viz-parallel",
    selector: ".efx-viz-parallel",
    lazy: true,
    defaults: { ...COMMON, dims: [], group: "group", height: 340, opacity: 0.65 },
    init(el, o) {
      const j = el.querySelector(':scope > script[type="application/json"]');
      let P = null, R = parse(o.data || j && j.textContent);
      const mk = () => {
        P = R && prep(R, o);
        if (draw) draw.legendByLabel = !!P && P.groups.length > 1;
      };
      let draw;
      mk();
      const o2 = { ...o, source: "", data: P ? JSON.stringify(stub(P)) : o.data };
      const brush = {};
      const offData = on(el, "efx:data", (e) => {
        const r = rowsOf2(e.detail);
        if (r && Array.isArray(e.detail)) {
          e.stopImmediatePropagation();
          P = prep(r, o);
          R = r;
          draw.legendByLabel = P.groups.length > 1;
          el.dispatchEvent(new CustomEvent("efx:data", { detail: { ...stub(P), rows: r } }));
          return;
        }
        R = r;
        mk();
      });
      draw = ({ g, svg, w, h, data, hidden, visible, colors, deco, fmt }) => {
        let D2, rows;
        if (P) {
          D2 = P.dims;
          const cols = palette(el, o, P.groups.length);
          rows = P.rows.filter((r) => !(draw.legendByLabel && hidden.has(r.grp))).map((r) => ({ ...r, color: cols[r.grp] }));
        } else {
          D2 = data.labels;
          rows = visible.map((x) => ({ name: x.name, vals: x.values, color: colors[x.index], grp: x.index }));
        }
        const nd = D2.length;
        if (!nd || !rows.length) return [];
        const pad = deco ? { t: 4, r: 4, b: 4, l: 4 } : { t: 30, r: 16, b: 12, l: 38 };
        const X = (i) => nd > 1 ? pad.l + i * (w - pad.l - pad.r) / (nd - 1) : w / 2;
        const ys = D2.map((_, i) => {
          const a = rows.map((r) => r.vals[i]).filter(Number.isFinite), sc = nice(Math.min(...a), Math.max(...a), 4);
          return { sc, y: linear([sc.min, sc.max], [h - pad.b, pad.t]) };
        });
        const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
        if (!deco) D2.forEach((d, i) => {
          s("line", { x1: X(i), x2: X(i), y1: pad.t, y2: h - pad.b, stroke: "var(--efx-chart-text)", "stroke-opacity": 0.5 }, ax);
          s("text", { x: X(i), y: pad.t - 12, "text-anchor": i === 0 && nd > 1 ? "start" : i === nd - 1 && nd > 1 ? "end" : "middle", style: "font-weight:600" }, ax).textContent = d;
          ys[i].sc.ticks.forEach((t) => {
            s("line", { x1: X(i) - 3, x2: X(i), y1: ys[i].y(t), y2: ys[i].y(t), stroke: "var(--efx-chart-text)", "stroke-opacity": 0.5 }, ax);
            s("text", { x: X(i) - 6, y: ys[i].y(t), "text-anchor": "end", "dominant-baseline": "middle", style: "font-size:10px" }, ax).textContent = fmt(t);
          });
        });
        const marks = [];
        const nodes = rows.map((r, k) => {
          const pts = r.vals.map((v, i) => [X(i), ys[i].y(Number.isFinite(v) ? v : ys[i].sc.min)]);
          const node = s("path", { d: "M" + pts.map((p) => p.join(",")).join("L"), fill: "none", stroke: r.color, "stroke-width": deco ? 1.5 : 1.6, "stroke-opacity": o.opacity, "stroke-linejoin": "round", pathLength: 1, class: "efx-chart__mark efx-chart__draw efx-pc__line", style: `--i:${k * Math.min(1, 12 / rows.length)}` }, g);
          const mid = Math.floor((nd - 1) / 2);
          marks.push({
            x: pts[mid][0],
            y: pts[mid][1],
            label: r.name,
            value: 0,
            node,
            index: k,
            group: void 0,
            html: `<strong>${esc(r.name)}</strong>` + D2.map((d, i) => `<span>${esc(d)} <b>${esc(fmt(r.vals[i]))}</b></span>`).join(""),
            hit: (px, py) => !node.classList.contains("is-off") && pts.slice(1).some((p, i) => dseg(px, py, pts[i], p) < 6)
          });
          return node;
        });
        draw.onShow = (m) => {
          if (m) g.appendChild(m.node);
        };
        const sels = [];
        const apply = () => {
          rows.forEach((r, k) => nodes[k].classList.toggle("is-off", D2.some((d, i) => brush[d] && !(r.vals[i] >= brush[d][0] && r.vals[i] <= brush[d][1]))));
          sels.forEach((r, i) => {
            const b = brush[D2[i]];
            r.setAttribute("visibility", b ? "visible" : "hidden");
            if (b) {
              r.setAttribute("y", ys[i].y(b[1]));
              r.setAttribute("height", ys[i].y(b[0]) - ys[i].y(b[1]));
            }
          });
        };
        if (!deco) D2.forEach((d, i) => {
          const sel = s("rect", { x: X(i) - 5, width: 10, rx: 2, class: "efx-pc__sel", visibility: "hidden" }, g);
          sels.push(sel);
          const ov = s("rect", { x: X(i) - 12, y: pad.t, width: 24, height: h - pad.t - pad.b, fill: "transparent", class: "efx-pc__ov" }, g);
          on(ov, "click", (e) => e.stopPropagation());
          on(ov, "dblclick", () => {
            delete brush[d];
            apply();
          });
          on(ov, "pointerdown", (e) => {
            e.preventDefault();
            const r = svg.getBoundingClientRect(), py = (ev) => Math.max(pad.t, Math.min(h - pad.b, (ev.clientY - r.top) * (h / r.height))), y0 = py(e);
            const mv = (ev) => {
              const y1 = py(ev);
              if (Math.abs(y1 - y0) > 2) {
                brush[d] = [ys[i].y.invert(Math.max(y0, y1)), ys[i].y.invert(Math.min(y0, y1))];
                apply();
              }
            };
            const o1 = on(window, "pointermove", mv), o22 = on(window, "pointerup", () => {
              o1();
              o22();
            });
          });
        });
        apply();
        return marks;
      };
      draw.legendByLabel = !!P && P.groups.length > 1;
      const off = chart(el, o2, draw);
      return () => {
        offData();
        off();
      };
    }
  };

  // src/charts/viz-rank.js
  var dseg2 = (px, py, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - a[0] - t * dx, py - a[1] - t * dy);
  };
  var cut = (t, m) => t.length > m ? t.slice(0, Math.max(1, m - 1)) + "\u2026" : t;
  var spread = (ys, gap, lo, hi) => {
    const ord = ys.map((_, i) => i).sort((a, b) => ys[a] - ys[b]), out = ys.slice();
    ord.forEach((k, i) => {
      if (i) out[k] = Math.max(out[k], out[ord[i - 1]] + gap);
    });
    for (let i = ord.length - 1; i >= 0; i--) {
      const k = ord[i], lim = i < ord.length - 1 ? out[ord[i + 1]] - gap : hi;
      if (out[k] > lim) out[k] = lim;
    }
    if (out[ord[0]] < lo) {
      const d = lo - out[ord[0]];
      ord.forEach((k) => {
        out[k] += d;
      });
    }
    return out;
  };
  var viz_rank_default = {
    name: "viz-rank",
    selector: ".efx-viz-rank",
    lazy: true,
    defaults: { ...COMMON, mode: "bump", ranks: false, smooth: true, legend: false, height: 0 },
    init(el, o) {
      const draw = ({ g, w, h, data, visible, colors, fmt, deco }) => {
        const slope = o.mode === "slope", P = data.labels, items = visible, m = items.length;
        if (P.length < (slope ? 2 : 1) || !m) return [];
        const ps = slope ? [0, P.length - 1] : P.map((_, i) => i), n = ps.length;
        const rank = ps.map((p) => {
          if (o.ranks) return items.map((it) => it.values[p]);
          const ord = items.map((_, k) => k).sort((a, b) => items[b].values[p] - items[a].values[p] || a - b), r = [];
          ord.forEach((k, i) => {
            r[k] = i + 1;
          });
          return r;
        });
        const val = (k, j) => slope && !o.ranks ? items[k].values[ps[j]] : rank[j][k];
        const all = items.flatMap((_, k) => ps.map((_2, j) => val(k, j)));
        const sc = slope ? nice(Math.min(...all), Math.max(...all), 4) : { min: Math.min(...all), max: Math.max(...all) };
        const txt = items.map((it, k) => slope ? [it.name + " " + fmt(it.values[ps[0]]), fmt(it.values[ps[1]]) + " " + it.name] : [it.name, it.name]);
        const lw = deco ? 0 : Math.min(w * 0.3, Math.max(...txt.flat().map((t) => t.length)) * 6.4 + 16);
        const pad = deco ? { t: 8, r: 8, b: 8, l: 8 } : { t: 30, r: lw, b: 14, l: lw };
        const X = (j) => n > 1 ? pad.l + j * (w - pad.l - pad.r) / (n - 1) : w / 2;
        const flip = slope ? !o.ranks : false;
        const top = deco ? pad.t : pad.t + 6, bot = h - pad.b - 6;
        const Y = sc.max === sc.min ? () => (top + bot) / 2 : linear(flip ? [sc.min, sc.max] : [sc.min, sc.max], flip ? [bot, top] : [top, bot]);
        const mc = Math.max(4, Math.floor(lw / 6.4) - 2);
        if (!deco) {
          const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
          ps.forEach((p, j) => {
            s("line", { x1: X(j), x2: X(j), y1: pad.t - 6, y2: h - pad.b, class: "efx-chart__grid" }, ax);
            s("text", { x: X(j), y: 12, "text-anchor": slope ? j ? "end" : "start" : "middle", style: "font-weight:600" }, ax).textContent = P[p];
          });
        }
        const ly = slope && !deco ? [0, 1].map((j) => spread(items.map((_, k) => Y(val(k, j))), 14, top, bot)) : null;
        return items.map((it, k) => {
          const pts = ps.map((_, j) => [X(j), Y(val(k, j))]);
          const f = s("g", { class: "efx-chart__mark efx-vr__item" }, g);
          const d = pts.reduce((a, [x, y], i) => a + (i ? o.smooth ? `C${(pts[i - 1][0] + x) / 2},${pts[i - 1][1]} ${(pts[i - 1][0] + x) / 2},${y} ${x},${y}` : `L${x},${y}` : `M${x},${y}`), "");
          s("path", { d, fill: "none", stroke: colors[it.index], "stroke-width": 3, "stroke-linecap": "round", pathLength: 1, class: "efx-chart__draw", style: `--i:${k}` }, f);
          const fd = s("g", { class: "efx-chart__fade", style: `--i:${k}` }, f);
          pts.forEach((p) => s("circle", { cx: p[0], cy: p[1], r: deco ? 3 : 4.5, fill: colors[it.index], style: "stroke:var(--sh-surface,#fff);stroke-width:2" }, fd));
          if (!deco) [0, n - 1].forEach((j, e) => {
            if (n < 2 && e) return;
            s("text", { x: X(j) + (e ? 10 : -10), y: ly ? ly[e][k] : pts[j][1], "text-anchor": e ? "start" : "end", "dominant-baseline": "middle", class: "efx-chart__value" }, fd).textContent = cut(txt[k][e], mc);
          });
          const dl = slope ? it.values[ps[1]] - it.values[ps[0]] : 0;
          return {
            x: pts[n - 1][0],
            y: pts[n - 1][1],
            label: it.name,
            value: it.values[ps[n - 1]],
            node: f,
            index: it.index,
            series: "",
            html: `<strong>${esc(it.name)}</strong>` + (slope ? `<span>${esc(P[ps[0]])} <b>${esc(fmt(it.values[ps[0]]))}</b> \u2192 ${esc(P[ps[1]])} <b>${esc(fmt(it.values[ps[1]]))}</b></span>` + (o.ranks ? "" : `<span>${dl >= 0 ? "+" : ""}${esc(fmt(dl))}</span>`) : ps.map((p, j) => `<span>${esc(P[p])} <b>#${rank[j][k]}${o.ranks ? "" : " \xB7 " + esc(fmt(it.values[p]))}</b></span>`).join("")),
            hit: (px, py) => n > 1 ? pts.slice(1).some((q2, i) => dseg2(px, py, pts[i], q2) < 8) : Math.hypot(px - pts[0][0], py - pts[0][1]) < 10
          };
        });
      };
      draw.height = () => o.height || (o.mode === "slope" ? 320 : 300);
      return chart(el, o, draw);
    }
  };

  // src/charts/viz-wordcloud.js
  var STOP = new Set("a about all an and are as at be but by can for from had has have he her his i if in into is it its just me my no not of on or our she so that the their them then there they this to too us was we were what when which who will with you your".split(" "));
  var norm5 = (d) => {
    const out = [];
    if (typeof d === "string") d = d.trim();
    if (typeof d === "string" && (d[0] === "[" || d[0] === "{")) try {
      d = JSON.parse(d);
    } catch (e) {
      d = "";
    }
    if (d && !Array.isArray(d) && typeof d === "object") d = d.words || d.data || (d.text != null ? String(d.text) : []);
    if (typeof d === "string") {
      if (d.includes(":")) d.split("|").forEach((p) => {
        const i = p.lastIndexOf(":");
        out.push({ text: p.slice(0, i), value: +p.slice(i + 1) });
      });
      else {
        const m = /* @__PURE__ */ new Map();
        (d.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).forEach((w) => {
          w = w.replace(/['’-]+$/, "");
          if (w.length > 1 && !STOP.has(w)) m.set(w, (m.get(w) || 0) + 1);
        });
        m.forEach((value, text) => out.push({ text, value }));
      }
    } else if (Array.isArray(d)) d.forEach((w) => {
      var _a, _b, _c, _d;
      if (w && typeof w === "object") out.push({ text: (_b = (_a = w.text) != null ? _a : w.word) != null ? _b : w.label, value: (_d = (_c = w.value) != null ? _c : w.weight) != null ? _d : w.count });
      else if (typeof w === "string") out.push({ text: w, value: 1 });
    });
    return out.map((w) => {
      var _a;
      return { text: String((_a = w.text) != null ? _a : "").trim(), value: +w.value || 0 };
    }).filter((w) => w.text && w.value > 0).sort((a, b) => b.value - a.value);
  };
  var viz_wordcloud_default = {
    name: "viz-wordcloud",
    selector: ".efx-viz-wordcloud",
    lazy: true,
    defaults: { ...COMMON, text: "", minSize: 12, maxSize: 56, rotate: [], max: 80, padding: 2, legend: false, height: 0 },
    init(el, o) {
      const j = el.querySelector(':scope > script[type="application/json"]');
      let words = norm5(o.update || o.text || o.data || j && j.textContent || "");
      if (o.text) words = norm5(o.text);
      const off = on(el, "efx:data", (e) => {
        const d = e.detail;
        if (d && (d.words || d.text || Array.isArray(d))) words = norm5(Array.isArray(d) ? d : d.words || d.text);
      });
      const cv = document.createElement("canvas").getContext("2d");
      const angles = o.rotate.map(Number).filter(Number.isFinite);
      if (!angles.length) angles.push(0);
      const draw = ({ g, w, h, deco, fmt }) => {
        const list = words.slice(0, o.max);
        if (!list.length) return [];
        const cols = palette(el, o, 7), ff = getComputedStyle(el).fontFamily;
        const vmax = list[0].value, vmin = list[list.length - 1].value;
        const sz = (v) => o.minSize + (o.maxSize - o.minSize) * (vmax === vmin ? 1 : Math.sqrt((v - vmin) / (vmax - vmin)));
        const placed = [], marks = [];
        const hit = (b, pad) => placed.some((p) => Math.abs(b.x - p.x) * 2 < b.w + p.w + pad && Math.abs(b.y - p.y) * 2 < b.h + p.h + pad);
        let seed = 7;
        const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
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
          const node = s("text", { x: 0, y: 0, transform: `translate(${box.x} ${box.y})${a ? ` rotate(${a})` : ""}`, "text-anchor": "middle", "dominant-baseline": "central", "font-size": size / 0.85, fill: cols[i % cols.length], "font-weight": 600, "font-family": ff, class: "efx-chart__mark efx-chart__fade", style: `--i:${Math.min(i, 30) / 2}` }, g);
          node.textContent = d.text;
          marks.push({ x: box.x, y: box.y - box.h / 2, label: d.text, value: d.value, node, index: i, hit: (px, py) => Math.abs(px - box.x) <= box.w / 2 && Math.abs(py - box.y) <= box.h / 2 });
        });
        return marks;
      };
      draw.height = (w) => o.height > 0 ? 0 : Math.round(Math.max(200, w * 0.5));
      draw.radius = 1;
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
      };
    }
  };

  // src/effix-entry.js
  var defs = [viz_arc_default, viz_chord_default, viz_distribution_default, viz_map_default, viz_marimekko_default, viz_network_default, viz_pack_default, viz_parallel_default, viz_rank_default, viz_wordcloud_default];
  if (window.Effix) window.Effix.charts = lib_exports;
  else window.EffixChartKit = lib_exports;
  if (window.Effix) window.Effix.define(defs);
  else (window.EffixPending = window.EffixPending || []).push(...defs);
})();
