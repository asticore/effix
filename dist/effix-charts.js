/*! Effix Charts v0.3.0 | MIT | https://github.com/asticore/effix */
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
  var cssVar = (...a) => window.Effix.cssVar(...a);
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
    const json = el.querySelector(':scope > script[type="application/json"]');
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
      if (!out && json) out = JSON.parse(json.textContent);
    } catch (err) {
      console.warn("[effix] chart data", err);
    }
    if (!out || typeof out !== "object") out = {};
    const arr = (v) => Array.isArray(v) ? v : [];
    if (Array.isArray(out)) {
      if (out.length && out.every((d) => d == null || typeof d !== "object" || !Array.isArray(d) && !("data" in d) && !("values" in d))) out = { data: out };
      else out = { series: out };
    }
    let series = arr(out.series || out.datasets).filter((x) => x != null).map((s0, i) => {
      var _a, _b, _c;
      const sr = Array.isArray(s0) ? { values: s0 } : typeof s0 === "object" ? s0 : { values: [s0] };
      const values = arr(sr.values || sr.data).map((v) => num(v && typeof v === "object" ? v.value : v));
      return { name: String((_c = (_b = (_a = sr.name) != null ? _a : sr.label) != null ? _b : o.names[i]) != null ? _c : `Series ${i + 1}`), values, color: typeof sr.color === "string" ? sr.color : void 0 };
    });
    const flat = arr(out.data);
    if (!series.length && flat.length) series = [{ name: String(o.names[0] || ""), values: flat.map((d) => num(d && typeof d === "object" ? d.value : d)) }];
    const n = Math.max(0, ...series.map((s0) => s0.values.length));
    const labels = (o.labels.length ? o.labels : arr(out.labels).length ? arr(out.labels) : flat.map((d) => d && typeof d === "object" ? d.label : void 0)).slice(0, Math.max(n, o.labels.length));
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
    let nf3;
    try {
      nf3 = new Intl.NumberFormat(void 0, opts);
    } catch (e) {
      nf3 = { format: (v) => String(v) };
    }
    return (v) => o.prefix + nf3.format(v) + o.suffix;
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
    const wrap2 = document.createElement("div");
    wrap2.className = "efx-chart__wrap" + (deco ? " efx-chart__wrap--bg" : "");
    if (deco) wrap2.setAttribute("aria-hidden", "true");
    const svg = s("svg", { class: "efx-chart__svg", role: deco ? null : "img", "aria-labelledby": deco ? null : id + "-t", focusable: "false" });
    const title = s("title", { id: id + "-t" }, svg);
    wrap2.appendChild(svg);
    const tip = document.createElement("div");
    tip.className = "efx-chart__tip";
    tip.setAttribute("role", "status");
    tip.hidden = true;
    const legend = document.createElement("div");
    legend.className = "efx-chart__legend";
    const sr = document.createElement("ul");
    sr.className = "efx-chart__sr";
    if (deco) el.prepend(wrap2);
    else el.append(wrap2, tip, legend, sr);
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
      wrap2.remove();
      tip.remove();
      legend.remove();
      sr.remove();
      el.classList.remove("efx-chart");
      el.style.position = restore.pos;
      el.style.isolation = restore.iso;
    };
  }

  // src/charts/chart-bar.js
  var chart_bar_default = {
    name: "chart-bar",
    selector: ".efx-chart-bar",
    lazy: true,
    defaults: { ...COMMON, horizontal: false, stacked: false, normalize: false, diverging: false, radial: false, style: "bar", values: false, radius: 4, grid: true, min: 0 },
    init(el, o) {
      return chart(el, o, ({ g, w, h, data, visible, colors, fmt, deco }) => {
        const n = data.labels.length;
        if (!n || !visible.length) return [];
        const hz = o.horizontal;
        const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : hz ? { t: 8, r: 24, b: 24, l: 72 } : { t: 12, r: 8, b: 28, l: 44 };
        const st = o.stacked || o.normalize, lol = o.style === "lollipop" && !st;
        const totals = data.labels.map((_, i) => visible.reduce((a, sr) => a + Math.max(0, sr.values[i] || 0), 0));
        const V = (sr, i) => {
          const x = sr.values[i] || 0;
          return o.normalize ? x / (totals[i] || 1) * 100 : x;
        };
        const F = o.normalize ? (t) => t + "%" : fmt;
        const vals = o.normalize ? [100] : st ? totals : visible.flatMap((sr) => sr.values);
        const ext = o.diverging ? Math.max(...vals.map(Math.abs), 1) : 0;
        const sc = o.diverging ? nice(-ext, ext, 4) : nice(Math.min(o.min, ...vals), Math.max(...vals, 0), hz ? Math.max(2, Math.floor(w / 90)) : Math.max(2, Math.floor(h / 50)));
        if (o.radial) return radial({ g, w, h, data, visible, colors, fmt: F, deco, V, sc, st });
        const v = linear([sc.min, sc.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
        const b = band(n, hz ? [pad.t, h - pad.b] : [pad.l, w - pad.r], 0.28);
        if (!deco) {
          if (hz) {
            const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
            sc.ticks.forEach((t) => {
              s("line", { x1: v(t), x2: v(t), y1: pad.t, y2: h - pad.b, class: "efx-chart__grid" }, ax);
              s("text", { x: v(t), y: h - pad.b + 16, "text-anchor": "middle" }, ax).textContent = F(t);
            });
            data.labels.forEach((l, i) => {
              s("text", { x: pad.l - 8, y: b.x(i) + b.bw / 2, "text-anchor": "end", "dominant-baseline": "middle" }, ax).textContent = l;
            });
          } else axes(g, { w, h, pad, y: v, ticks: sc.ticks, labels: data.labels, x: (i) => b.x(i) + b.bw / 2, fmt: F, grid: o.grid });
          if (sc.min < 0) s("line", hz ? { x1: v(0), x2: v(0), y1: pad.t, y2: h - pad.b, style: "stroke:var(--efx-chart-text,#64748b);stroke-opacity:.7" } : { x1: pad.l, x2: w - pad.r, y1: v(0), y2: v(0), style: "stroke:var(--efx-chart-text,#64748b);stroke-opacity:.7" }, g);
        }
        const marks = [];
        const per = st ? 1 : visible.length;
        const neg = o.diverging && visible.length === 1 ? cssVar(el, "--sh-danger", "#ef4444") : "";
        const bw = b.bw / per;
        data.labels.forEach((label, i) => {
          let acc = 0;
          visible.forEach((sr, k) => {
            const raw = sr.values[i] || 0, val2 = V(sr, i);
            const a = st ? acc : Math.min(0, Math.max(sc.min, 0));
            const z = st ? acc + val2 : val2;
            acc += Math.max(0, val2);
            const p0 = v(st ? a : Math.max(sc.min, 0)), p1 = v(z);
            const off = b.x(i) + (st ? 0 : k * bw);
            const thick = Math.max(1, (st ? b.bw : bw) - (per > 1 ? 2 : 0));
            const r = Math.min(o.radius, thick / 2);
            const attrs = hz ? { x: Math.min(p0, p1), y: off, width: Math.abs(p1 - p0), height: thick } : { x: off, y: Math.min(p0, p1), width: thick, height: Math.abs(p1 - p0) };
            const col = neg && val2 < 0 ? neg : colors[sr.index], cls = `efx-chart__mark ${hz ? "efx-chart__grow-x" : "efx-chart__grow"}`;
            let node;
            if (lol) {
              const cx0 = attrs.x + attrs.width / 2, cy0 = attrs.y + attrs.height / 2, dr = Math.max(3, Math.min(8, thick / 2));
              node = s("g", { class: cls, style: `--i:${i}`, fill: col, stroke: col }, g);
              s("line", hz ? { x1: p0, x2: p1, y1: cy0, y2: cy0, "stroke-width": 2 } : { x1: cx0, x2: cx0, y1: p0, y2: p1, "stroke-width": 2 }, node);
              s("circle", { cx: hz ? p1 : cx0, cy: hz ? cy0 : p1, r: dr, stroke: "none" }, node);
            } else node = s("rect", { ...attrs, rx: r, fill: col, class: cls, style: `--i:${i}` }, g);
            if (o.values && !deco && !st) {
              const t = hz ? s("text", { x: val2 < 0 ? Math.min(p0, p1) - (lol ? 13 : 6) : Math.max(p0, p1) + (lol ? 13 : 6), "text-anchor": val2 < 0 ? "end" : null, y: off + thick / 2, "dominant-baseline": "middle", class: "efx-chart__value efx-chart__fade", style: `--i:${i}` }, g) : s("text", { x: off + thick / 2, y: val2 < 0 ? Math.max(p0, p1) + (lol ? 20 : 14) : Math.min(p0, p1) - (lol ? 13 : 6), "text-anchor": "middle", class: "efx-chart__value efx-chart__fade", style: `--i:${i}` }, g);
              t.textContent = fmt(raw);
            }
            const cx = attrs.x + attrs.width / 2, cy = attrs.y + (hz ? attrs.height / 2 : 0);
            marks.push({
              x: cx,
              y: cy,
              label,
              value: raw,
              valueText: o.normalize ? `${+val2.toFixed(1)}% (${fmt(raw)})` : void 0,
              series: visible.length > 1 || data.series.length > 1 ? sr.name : "",
              node,
              index: i,
              hit: (px, py) => px >= attrs.x && px <= attrs.x + attrs.width && py >= attrs.y - 4 && py <= attrs.y + attrs.height
            });
          });
        });
        return marks;
      });
    }
  };
  function radial({ g, w, h, data, visible, colors, fmt, deco, V, sc, st }) {
    const n = data.labels.length, cx = w / 2, cy = h / 2, m = deco ? 2 : 52;
    const R = Math.max(20, Math.min(w / 2 - m, h / 2 - (deco ? 2 : 20))), r0 = R * 0.28;
    const mx = Math.max(...st ? data.labels.map((_, i) => visible.reduce((a, sr) => a + Math.max(0, V(sr, i)), 0)) : visible.flatMap((sr) => sr.values.map((_, i) => V(sr, i))), 1);
    const rs = nice(0, mx, 3);
    const rad = (val2) => r0 + Math.max(0, val2) * (R - r0) / (rs.max || 1);
    const marks = [];
    if (!deco) {
      const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
      rs.ticks.forEach((t) => s("circle", { cx, cy, r: rad(t), fill: "none", class: "efx-chart__grid" }, ax));
      data.labels.forEach((l, i) => {
        const am = (i + 0.5) / n * Math.PI * 2, [x, y] = pt(cx, cy, R + 8, am), sn = Math.sin(am), cs = Math.cos(am);
        s("text", { x, y: y + (cs > 0.3 ? -2 : cs < -0.3 ? 10 : 4), "text-anchor": sn > 0.2 ? "start" : sn < -0.2 ? "end" : "middle" }, ax).textContent = l;
      });
    }
    const per = st ? 1 : visible.length, slot = Math.PI * 2 / n, gap2 = slot * 0.12;
    data.labels.forEach((label, i) => {
      let acc = 0;
      visible.forEach((sr, k) => {
        const raw = sr.values[i] || 0, val2 = V(sr, i), lo = st ? acc : 0;
        acc += Math.max(0, val2);
        const bw = (slot - gap2) / per, a0 = i * slot + gap2 / 2 + (st ? 0 : k * bw), a1 = a0 + bw;
        const ri = st ? rad(lo) : r0, ro = rad(lo + Math.max(0, val2));
        const node = s("path", { d: arcPath(cx, cy, ri, Math.max(ro, ri + 1), a0, a1), fill: colors[sr.index], class: "efx-chart__mark efx-chart__fade", style: `--i:${i}` }, g);
        const [x, y] = pt(cx, cy, Math.max(ro, ri + 1), (a0 + a1) / 2);
        marks.push({ x, y, label, value: raw, series: visible.length > 1 || data.series.length > 1 ? sr.name : "", node, index: i, hit: (px, py) => {
          const d = Math.hypot(px - cx, py - cy);
          let a = Math.atan2(px - cx, cy - py);
          if (a < 0) a += Math.PI * 2;
          return d >= ri && d <= Math.max(ro, ri + 1) && a >= a0 && a <= a1;
        } });
      });
    });
    return marks;
  }

  // src/charts/chart-box.js
  var Q = (a, p) => {
    const i = (a.length - 1) * p, l = Math.floor(i);
    return a[l] + (a[Math.min(l + 1, a.length - 1)] - a[l]) * (i - l);
  };
  var stat = (c) => {
    if (Array.isArray(c)) {
      const a = c.map(Number).filter(Number.isFinite).sort((x, y) => x - y);
      if (!a.length) return null;
      const q1 = Q(a, 0.25), q3 = Q(a, 0.75), r = 1.5 * (q3 - q1), k = a.filter((v) => v >= q1 - r && v <= q3 + r);
      return { n: a.length, min: k[0], q1, median: Q(a, 0.5), q3, max: k[k.length - 1], out: a.filter((v) => v < q1 - r || v > q3 + r) };
    }
    if (!c || typeof c !== "object") return null;
    const m = { min: +c.min, q1: +c.q1, median: +c.median, q3: +c.q3, max: +c.max };
    return Object.values(m).some(isNaN) ? null : { ...m, out: (c.outliers || []).map(Number).filter(Number.isFinite), l: c.label };
  };
  var read = (el, o, raw) => {
    try {
      if (raw === void 0) raw = JSON.parse((o.data || "").trim() || el.querySelector(':scope > script[type="application/json"]').textContent);
      const r = Array.isArray(raw) ? { series: raw[0].median != null ? [{ data: raw }] : raw } : raw || {};
      const groups = r.series.map((x, k) => {
        var _a, _b;
        return { name: String((_b = (_a = x.name) != null ? _a : o.names[k]) != null ? _b : ""), boxes: (x.data || x.values || []).map(stat) };
      });
      const n = Math.max(0, ...groups.map((x) => x.boxes.length));
      return { groups, L: Array.from({ length: n }, (_, i) => {
        var _a, _b, _c;
        return String((_c = (_b = (_a = o.labels[i]) != null ? _a : (r.labels || [])[i]) != null ? _b : (groups[0].boxes[i] || {}).l) != null ? _c : i + 1);
      }) };
    } catch (e) {
      return { groups: [], L: [] };
    }
  };
  var chart_box_default = {
    name: "chart-box",
    selector: ".efx-chart-box",
    lazy: true,
    defaults: { ...COMMON, horizontal: false, grid: true },
    init(el, o) {
      let m = read(el, o);
      const off = on(el, "efx:data", (e) => {
        m = read(el, o, e.detail || {});
      });
      const draw = ({ g, w, h, visible, colors, fmt, deco }) => {
        const { groups, L } = m, n = L.length, vg = visible.filter((x) => groups[x.index]);
        const all = vg.flatMap((x) => groups[x.index].boxes.filter(Boolean).flatMap((b2) => [b2.min, b2.max, ...b2.out]));
        if (!n || !all.length) return [];
        const hz = o.horizontal;
        const pad = deco ? { t: 6, r: 6, b: 6, l: 6 } : hz ? { t: 8, r: 24, b: 24, l: 72 } : { t: 12, r: 8, b: 28, l: 44 };
        const sc = nice(Math.min(...all), Math.max(...all), hz ? Math.max(2, Math.floor(w / 90)) : Math.max(2, Math.floor(h / 50)));
        const v = linear([sc.min, sc.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
        const b = band(n, hz ? [pad.t, h - pad.b] : [pad.l, w - pad.r], 0.3);
        const P = (c, val2) => hz ? [v(val2), c] : [c, v(val2)];
        if (!deco) {
          if (hz) {
            const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
            sc.ticks.forEach((t) => {
              s("line", { x1: v(t), x2: v(t), y1: pad.t, y2: h - pad.b, class: "efx-chart__grid" }, ax);
              s("text", { x: v(t), y: h - pad.b + 16, "text-anchor": "middle" }, ax).textContent = fmt(t);
            });
            L.forEach((l, i) => {
              s("text", { x: pad.l - 8, y: b.x(i) + b.bw / 2, "text-anchor": "end", "dominant-baseline": "middle" }, ax).textContent = l;
            });
          } else axes(g, { w, h, pad, y: v, ticks: sc.ticks, labels: L, x: (i) => b.x(i) + b.bw / 2, fmt, grid: o.grid });
        }
        const marks = [], sw = b.bw / vg.length, cw = Math.max(4, sw - (vg.length > 1 ? 4 : 0));
        L.forEach((label, i) => vg.forEach((x, k) => {
          const bx = groups[x.index].boxes[i];
          if (!bx) return;
          const col = colors[x.index], c0 = b.x(i) + k * sw + (sw - cw) / 2, cm = c0 + cw / 2;
          const gr = s("g", { class: "efx-chart__mark efx-chart__fade", style: `--i:${i}`, stroke: col, "stroke-width": 1.5, fill: "none" }, g);
          const ln = (c, a, d, z, e) => {
            const [x12, y12] = P(c, a), [x22, y22] = P(d, z);
            return s("line", { x1: x12, y1: y12, x2: x22, y2: y22, ...e }, gr);
          };
          ln(cm, bx.min, cm, bx.q1);
          ln(cm, bx.q3, cm, bx.max);
          ln(cm - cw / 4, bx.min, cm + cw / 4, bx.min);
          ln(cm - cw / 4, bx.max, cm + cw / 4, bx.max);
          const [x1, y1] = P(c0, bx.q1), [x2, y2] = P(c0 + cw, bx.q3);
          s("rect", { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1), rx: 2, fill: col, "fill-opacity": 0.28 }, gr);
          ln(c0, bx.median, c0 + cw, bx.median, { "stroke-width": 3 });
          bx.out.forEach((z) => {
            const [cx, cy] = P(cm, z);
            s("circle", { cx, cy, r: 3, fill: "var(--sh-surface, #fff)" }, gr);
          });
          const lo = Math.min(bx.min, ...bx.out), hi = Math.max(bx.max, ...bx.out);
          const [ax, ay] = P(c0 - 2, lo), [bx2, by2] = P(c0 + cw + 2, hi), [mx, my] = P(cm, bx.median);
          const row = (t, z) => `<span>${t} <b>${esc(fmt(z))}</b></span>`;
          marks.push({
            x: mx,
            y: my,
            label,
            value: bx.median,
            series: vg.length > 1 ? groups[x.index].name : "",
            node: gr,
            index: i,
            html: `<strong>${esc(label)}</strong>${vg.length > 1 ? `<span>${esc(groups[x.index].name)}</span>` : ""}${row("Max", bx.max)}${row("Q3", bx.q3)}${row("Median", bx.median)}${row("Q1", bx.q1)}${row("Min", bx.min)}${bx.n ? `<span>n = ${bx.n}</span>` : ""}${bx.out.length ? `<span>${bx.out.length} outlier${bx.out.length > 1 ? "s" : ""}</span>` : ""}`,
            hit: (px, py) => px >= Math.min(ax, bx2) && px <= Math.max(ax, bx2) && py >= Math.min(ay, by2) && py <= Math.max(ay, by2)
          });
        }));
        return marks;
      };
      draw.radius = 1;
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
      };
    }
  };

  // src/charts/chart-bullet.js
  var nums = (a) => (Array.isArray(a) ? a : []).map(Number).filter(Number.isFinite).sort((x, y) => x - y);
  var rowsOf = (a, o) => (Array.isArray(a) ? a : []).filter((r) => r && typeof r === "object").map((r) => {
    var _a, _b;
    return { label: String((_b = (_a = r.label) != null ? _a : r.name) != null ? _b : ""), value: +r.value || 0, target: r.target == null ? null : +r.target, ranges: nums(r.ranges || o.ranges), max: +r.max || 0, color: r.color };
  });
  var read2 = (el, o) => {
    try {
      return rowsOf(JSON.parse((o.data || "").trim() || el.querySelector(':scope > script[type="application/json"]').textContent), o);
    } catch (e) {
      return null;
    }
  };
  var cut = (t, px) => t.length * 6.2 > px ? t.slice(0, Math.max(1, Math.floor(px / 6.2) - 1)) + "\u2026" : t;
  var chart_bullet_default = {
    name: "chart-bullet",
    selector: ".efx-chart-bullet",
    lazy: true,
    defaults: { ...COMMON, vertical: false, barHeight: 18, values: true, shared: false, targets: [], ranges: [], legend: false },
    init(el, o) {
      let own = read2(el, o);
      const off = on(el, "efx:data", (e) => {
        own = Array.isArray(e.detail) ? rowsOf(e.detail, o) : null;
      });
      const rows = (data) => {
        if (own && own.length) return own;
        const tg = o.targets;
        return (data.series[0] ? data.series[0].values : []).map((value, i) => {
          const x = tg.length ? parseFloat(tg[tg.length === 1 ? 0 : i]) : NaN;
          return { label: data.labels[i], value, target: Number.isFinite(x) ? x : null, ranges: nums(o.ranges), max: 0 };
        });
      };
      const draw = ({ g, w, h, data, colors, fmt, deco }) => {
        const R = rows(data), n = R.length;
        if (!n) return [];
        const hz = !o.vertical, bh = o.barHeight, lab = R.some((r) => r.label);
        const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : hz ? { t: 2, r: o.values ? 60 : 8, b: o.shared ? 22 : 2, l: lab ? 92 : 8 } : { t: o.values ? 18 : 6, r: 4, b: 24, l: 4 };
        const top = (r) => r.max || Math.max(r.value, r.target || 0, ...r.ranges, 0) || 1;
        const gmax = nice(0, Math.max(...R.map(top))), step = (hz ? h - pad.t - pad.b : w - pad.l - pad.r) / n;
        const marks = [];
        if (o.shared && !deco) {
          const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g), sx = linear([0, gmax.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
          gmax.ticks.forEach((t) => s("text", hz ? { x: sx(t), y: h - 6, "text-anchor": "middle" } : { x: w - 2, y: sx(t), "text-anchor": "end", "dominant-baseline": "middle" }, ax).textContent = fmt(t));
        }
        R.forEach((r, i) => {
          const max = o.shared ? gmax.max : top(r), c0 = (hz ? pad.t : pad.l) + i * step, th = Math.min(bh, step - 4) || bh, cc = c0 + (step - th) / 2;
          const sc = linear([0, max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
          const box = (c, t, a, b, fill, cls, extra) => {
            const [p, q] = [sc(a), sc(b)];
            return s("rect", { ...hz ? { x: Math.min(p, q), y: c, width: Math.abs(q - p), height: t } : { x: c, y: Math.min(p, q), width: t, height: Math.abs(q - p) }, fill, class: cls, style: `--i:${i}`, ...extra }, gr);
          };
          const gr = s("g", { class: "efx-chart__mark" }, g), bd = r.ranges.length ? r.ranges.concat(r.ranges[r.ranges.length - 1] < max ? [max] : []) : [max];
          bd.forEach((b, j) => box(cc, th, j ? bd[j - 1] : 0, Math.min(b, max), `color-mix(in oklab, var(--sh-text, #0f172a) ${Math.max(5, 8 * (bd.length - j))}%, var(--sh-surface, #fff))`, "efx-chart__fade"));
          const mt = Math.max(3, th / 3);
          box(cc + (th - mt) / 2, mt, 0, Math.min(r.value, max), r.color || colors[0], hz ? "efx-chart__grow-x" : "efx-chart__grow", { rx: 1.5 });
          if (r.target != null) {
            const tv = sc(Math.min(r.target, max)), a = cc + th * 0.15, b = cc + th * 0.85;
            s("line", hz ? { x1: tv, x2: tv, y1: a, y2: b } : { x1: a, x2: b, y1: tv, y2: tv }, gr).setAttribute("style", "stroke:var(--sh-text,#0f172a);stroke-width:2.5;stroke-linecap:round");
          }
          if (!deco) {
            if (r.label) {
              const lbl = s("text", hz ? { x: pad.l - 8, y: cc + th / 2, "text-anchor": "end", "dominant-baseline": "middle" } : { x: c0 + step / 2, y: h - 8, "text-anchor": "middle" }, g);
              lbl.textContent = cut(r.label, hz ? pad.l - 12 : step - 4);
              lbl.setAttribute("class", "efx-chart__axis-t");
            }
            if (o.values) {
              const v = s("text", hz ? { x: w - pad.r + 8, y: cc + th / 2, "dominant-baseline": "middle" } : { x: c0 + step / 2, y: pad.t - 6, "text-anchor": "middle" }, g);
              v.setAttribute("class", "efx-chart__value efx-chart__fade");
              v.textContent = fmt(r.value);
            }
          }
          const [ex, ey] = hz ? [sc(Math.min(r.value, max)), cc + th / 2] : [cc + th / 2, sc(Math.min(r.value, max))];
          marks.push({
            x: ex,
            y: ey,
            label: r.label,
            value: r.value,
            series: "",
            node: gr,
            index: i,
            html: `<strong>${esc(r.label)}</strong><b>${esc(fmt(r.value))}</b>${r.target != null ? `<span>Target ${esc(fmt(r.target))}${r.target ? ` \xB7 ${Math.round(r.value / r.target * 100)}%` : ""}</span>` : ""}`,
            hit: (px, py) => hz ? py >= c0 && py < c0 + step && px >= pad.l - 4 : px >= c0 && px < c0 + step && py <= h - pad.b + 4
          });
        });
        return marks;
      };
      draw.radius = 1;
      draw.height = (w, data) => o.vertical ? o.height || 220 : rows(data).length * (o.barHeight + 12) + (o.shared ? 22 : 0) + 4;
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
      };
    }
  };

  // src/charts/chart-candle.js
  var KEYS = ["o", "h", "l", "c", "v"];
  var objRows = (r) => {
    r = Array.isArray(r) ? r : r && (r.rows || r.data);
    return Array.isArray(r) && r.length && r.every((d) => d && typeof d === "object" && !Array.isArray(d) && "h" in d) ? r : null;
  };
  var chart_candle_default = {
    name: "chart-candle",
    selector: ".efx-chart-candle",
    lazy: true,
    defaults: { ...COMMON, legend: false, style: "candle", volume: false, grid: true },
    init(el, o) {
      let rows = null;
      const read5 = (r) => {
        try {
          rows = objRows(typeof r === "string" ? JSON.parse(r) : r);
        } catch (e) {
          rows = null;
        }
      };
      const j = el.querySelector(':scope > script[type="application/json"]');
      read5(!o.source && o.data ? o.data : j && j.textContent);
      const offData = on(el, "efx:data", (e) => read5(e.detail));
      const draw = ({ g, w, h, data, colors, fmt, deco }) => {
        let R = rows && rows.map((d, i) => {
          var _a;
          return { label: String((_a = d.label) != null ? _a : i + 1), o: +d.o, h: +d.h, l: +d.l, c: +d.c, v: +d.v || 0 };
        });
        if (!R) {
          const by = {};
          data.series.forEach((sr, i) => {
            const k = KEYS.find((k2) => k2 === sr.name.toLowerCase()[0] && !by[k2]);
            by[k || KEYS[i]] = sr.values;
          });
          R = data.labels.map((label, i) => ({ label, o: by.o && by.o[i], h: by.h && by.h[i], l: by.l && by.l[i], c: by.c && by.c[i], v: by.v && by.v[i] || 0 }));
        }
        R = R.filter((d) => [d.o, d.h, d.l, d.c].every(Number.isFinite));
        const n = R.length;
        if (!n) return [];
        const vol = o.volume && !deco && R.some((d) => d.v > 0);
        const pad = deco ? { t: 4, r: 0, b: 4, l: 0 } : { t: 12, r: 8, b: 28, l: 48 };
        const vh = vol ? (h - pad.t - pad.b) * 0.2 : 0, pb = h - pad.b - (vol ? vh + 8 : 0);
        const lo = Math.min(...R.map((d) => d.l)), hi = Math.max(...R.map((d) => d.h)), m = (hi - lo) * 0.04 || 1;
        const sc = nice(lo - m, hi + m, Math.max(2, Math.floor((pb - pad.t) / 46)));
        const y = linear([sc.min, sc.max], [pb, pad.t]);
        const b = band(n, [pad.l, w - pad.r], 0.3);
        const cx = (i) => b.x(i) + b.bw / 2;
        const [up, dn] = o.colors.length >= 2 ? [o.colors[0], o.colors[1]] : [cssVar(el, "--sh-success", "#10b981"), cssVar(el, "--sh-danger", "#ef4444")];
        if (!deco) {
          axes(g, { w, h, pad, y, ticks: sc.ticks, labels: R.map((d) => d.label), x: cx, fmt, grid: o.grid, rotate: b.step < 34 });
        }
        const vmax = Math.max(...R.map((d) => d.v), 1), bw = Math.max(1, Math.min(b.bw, 18)), ohlc = o.style === "ohlc";
        const step = Math.min(1, 24 / n);
        const base = h - pad.b;
        return R.map((d, i) => {
          const col = d.c >= d.o ? up : dn, x = cx(i);
          const node = s("g", { class: "efx-chart__mark efx-cd__pt" }, g);
          s("rect", { x: b.x(i) - (b.step - b.bw) / 2, y: pad.t, width: b.step, height: base - pad.t, class: "efx-cd__band" }, node);
          const sh = s("g", { class: "efx-chart__fade", style: `--i:${i * step}`, stroke: col, fill: col }, node);
          if (vol && d.v > 0) s("rect", { x: x - bw / 2, y: base - Math.max(1, d.v / vmax * vh), width: bw, height: Math.max(1, d.v / vmax * vh), "fill-opacity": 0.35, stroke: "none" }, sh);
          s("line", { x1: x, x2: x, y1: y(d.h), y2: y(d.l), "stroke-width": ohlc ? Math.max(1, Math.min(2, bw / 3)) : 1 }, sh);
          if (ohlc) {
            const t = Math.max(2, bw / 2), sw = Math.max(1, Math.min(2, bw / 3));
            s("line", { x1: x - t, x2: x, y1: y(d.o), y2: y(d.o), "stroke-width": sw }, sh);
            s("line", { x1: x, x2: x + t, y1: y(d.c), y2: y(d.c), "stroke-width": sw }, sh);
          } else {
            const t = Math.min(y(d.o), y(d.c));
            s("rect", { x: x - bw / 2, y: t, width: bw, height: Math.max(1, Math.abs(y(d.o) - y(d.c))), rx: bw > 6 ? 1.5 : 0, fill: col }, sh);
          }
          const chg = d.o ? (d.c - d.o) / d.o * 100 : 0, row = (k, v) => `<span>${k} <b>${esc(fmt(v))}</b></span>`;
          return {
            x,
            y: y(d.h),
            label: d.label,
            value: d.c,
            node,
            index: i,
            xOnly: true,
            group: i,
            html: `<strong>${esc(d.label)}</strong>${row("O", d.o)}${row("H", d.h)}${row("L", d.l)}${row("C", d.c)}` + (d.v ? row("Vol", d.v) : "") + `<span style="color:${col}">${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%</span>`
          };
        });
      };
      draw.radius = Infinity;
      const off = chart(el, o, draw);
      return () => {
        offData();
        off();
      };
    }
  };

  // src/charts/chart-combo.js
  var safeColor = (c) => {
    try {
      return typeof c === "string" && CSS.supports("color", c) && !/[;{}"'<>]/.test(c) ? c : "#6366f1";
    } catch (e) {
      return "#6366f1";
    }
  };
  var metaOf = (r) => (Array.isArray(r) ? r : r && (r.series || r.datasets)) || [];
  var uid2 = 0;
  var chart_combo_default = {
    name: "chart-combo",
    selector: ".efx-chart-combo",
    lazy: true,
    defaults: { ...COMMON, types: [], axes: [], smooth: true, dots: true, area: false, grid: true, radius: 4, prefix2: "", suffix2: "" },
    init(el, o) {
      let meta = [];
      try {
        const j = el.querySelector(':scope > script[type="application/json"]');
        const raw = !o.source && o.data && /^\s*[[{]/.test(o.data) ? o.data : j && j.textContent;
        if (raw) meta = metaOf(JSON.parse(raw));
      } catch (e) {
      }
      const offData = on(el, "efx:data", (e) => {
        if (e.detail && e.detail.series) meta = metaOf(e.detail);
      });
      const fmt2 = formatter({ ...o, prefix: o.prefix2, suffix: o.suffix2 });
      const kind = (i) => {
        const t = meta[i] && meta[i].type || o.types[i] || (i ? "line" : "bar");
        return t === "line" ? "line" : "bar";
      };
      const side = (i) => (meta[i] && meta[i].axis || o.axes[i]) === "right" ? 1 : 0;
      const draw = ({ g, w, h, data, visible, colors, fmt, deco }) => {
        const n = data.labels.length;
        if (!n || !visible.length) return [];
        const rows = visible.map((sr) => ({ sr, k: kind(sr.index), a: side(sr.index), c: colors[sr.index] }));
        const right = !deco && rows.some((r) => r.a);
        const pad = deco ? { t: 6, r: 0, b: 6, l: 0 } : { t: 12, r: right ? 48 : 16, b: 28, l: 44 };
        const cnt = Math.max(2, Math.floor(h / 50));
        const sc = [0, 1].map((a) => {
          const rr = rows.filter((r) => r.a === a);
          if (!rr.length) return null;
          const vals = rr.flatMap((r) => r.sr.values.map((v) => v || 0)).concat(rr.some((r) => r.k === "bar") ? 0 : []);
          const nc = nice(Math.min(...vals), Math.max(...vals), cnt);
          return { ...nc, f: linear([nc.min, nc.max], [h - pad.b, pad.t]) };
        });
        const L = sc[0] || sc[1], Y = (r) => sc[r.a].f;
        const b = band(n, [pad.l, w - pad.r], 0.3);
        const cx = (i) => b.x(i) + b.bw / 2;
        if (!deco) {
          axes(g, { w, h, pad, y: L.f, ticks: L.ticks, labels: data.labels, x: cx, fmt: sc[0] ? fmt : fmt2, grid: o.grid });
          if (right) {
            const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
            const R = sc[1];
            R.ticks.forEach((t) => {
              s("text", { x: w - pad.r + 8, y: R.f(t), "dominant-baseline": "middle" }, ax).textContent = fmt2(t);
            });
          }
        }
        const bars = rows.filter((r) => r.k === "bar"), bw = b.bw / Math.max(1, bars.length);
        bars.forEach((r, k) => {
          const f = Y(r), z = f(0);
          r.sr.values.forEach((v, i) => {
            if (i >= n) return;
            const y1 = f(v || 0), thick = Math.max(1, bw - (bars.length > 1 ? 2 : 0));
            s("rect", { x: b.x(i) + k * bw, y: Math.min(z, y1), width: thick, height: Math.abs(y1 - z), rx: Math.min(o.radius, thick / 2), fill: r.c, class: "efx-chart__grow", style: `--i:${i}` }, g);
          });
        });
        const base = h - pad.b;
        rows.filter((r) => r.k === "line").forEach((r, k) => {
          const pts = r.sr.values.slice(0, n).map((v, i) => [cx(i), Y(r)(v || 0)]);
          if (o.area && pts.length > 1) {
            const id = "efx-cg" + ++uid2, defs2 = s("defs", {}, g), lg = s("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs2);
            s("stop", { offset: 0, "stop-color": r.c, "stop-opacity": 0.3 }, lg);
            s("stop", { offset: 1, "stop-color": r.c, "stop-opacity": 0 }, lg);
            s("path", { d: linePath(pts, o.smooth) + `L${pts[pts.length - 1][0]},${base}L${pts[0][0]},${base}Z`, fill: `url(#${id})`, class: "efx-chart__fade", style: `--i:${k}` }, g);
          }
          s("path", { d: linePath(pts, o.smooth), pathLength: 1, fill: "none", stroke: r.c, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", class: "efx-chart__draw" }, g);
        });
        if (deco) return [];
        const step = Math.min(1, 16 / n);
        return data.labels.map((label, i) => {
          const node = s("g", { class: "efx-chart__mark efx-combo__pt" }, g);
          s("rect", { x: b.x(i) - (b.step - b.bw) / 2, y: pad.t, width: b.step, height: base - pad.t, class: "efx-combo__band" }, node);
          rows.filter((r) => r.k === "line").forEach((r) => s("circle", { cx: cx(i), cy: Y(r)(r.sr.values[i] || 0), r: 4, fill: r.c, class: "efx-combo__dot " + (o.dots ? "efx-chart__fade" : "efx-combo__hid"), style: `--i:${i * step}` }, node));
          const F = (r) => r.a ? fmt2 : fmt;
          return {
            x: cx(i),
            y: Math.min(...rows.map((r) => Y(r)(r.sr.values[i] || 0))),
            label,
            node,
            index: i,
            xOnly: true,
            group: i,
            value: rows[0].sr.values[i] || 0,
            series: rows.length > 1 ? "" : rows[0].sr.name,
            html: `<strong>${esc(label)}</strong>` + rows.map((r) => `<span><i style="color:${esc(safeColor(r.c))}">\u25CF</i> ${esc(r.sr.name)} <b>${esc(F(r)(r.sr.values[i] || 0))}</b></span>`).join("")
          };
        });
      };
      draw.radius = Infinity;
      const off = chart(el, o, draw);
      return () => {
        offData();
        off();
      };
    }
  };

  // src/charts/chart-flow.js
  var safe = (v) => {
    const d = v && typeof v === "object" && !Array.isArray(v) ? v : {};
    return { nodes: Array.isArray(d.nodes) ? d.nodes : [], links: Array.isArray(d.links) ? d.links.filter((l) => l && typeof l === "object") : [] };
  };
  var read3 = (el, o) => {
    try {
      const j = el.querySelector(':scope > script[type="application/json"]');
      return safe(JSON.parse((o.data || "").trim() || j.textContent));
    } catch (e) {
      return safe(null);
    }
  };
  var chart_flow_default = {
    name: "chart-flow",
    selector: ".efx-chart-flow",
    lazy: true,
    defaults: { ...COMMON, nodeWidth: 12, nodePad: 12, align: "justify", legend: false },
    init(el, o) {
      let d = read3(el, o);
      const off = on(el, "efx:data", (e) => {
        d = e.detail ? safe(e.detail) : d;
      });
      const draw = ({ g, w, h, deco, fmt }) => {
        const names = (d.nodes || []).map((n) => String(n && n.name != null ? n.name : n == null ? "" : n));
        const id = (v) => {
          if (typeof v === "number" && names[v] != null) return v;
          const k = String(v), i = names.indexOf(k);
          return i < 0 ? names.push(k) - 1 : i;
        };
        const L = (d.links || []).map((l) => ({ s: id(l.source), t: id(l.target), v: +l.value || 0 })).filter((l) => l.v > 0 && l.s !== l.t);
        const all = names.map((name, i) => ({ i, name, in: 0, out: 0, col: 0, a: [], b: [] }));
        L.forEach((l) => {
          all[l.s].out += l.v;
          all[l.s].a.push(l);
          all[l.t].in += l.v;
          all[l.t].b.push(l);
        });
        const N = all.filter((n) => n.in + n.out);
        if (!N.length) return [];
        N.forEach((n, k) => {
          n.v = Math.max(n.in, n.out);
          n.mi = L.length + k;
        });
        for (let k = 0, c = 1; c && k < N.length; k++) {
          c = 0;
          L.forEach((l) => {
            const t = all[l.t];
            if (t.col < Math.min(N.length - 1, all[l.s].col + 1)) {
              t.col = all[l.s].col + 1;
              c = 1;
            }
          });
        }
        const C = Math.max(...N.map((n) => n.col)) + 1;
        if (o.align === "justify") N.forEach((n) => {
          if (!n.a.length) n.col = C - 1;
        });
        const pad = deco ? 0 : 6, H = h - 2 * pad, nw = o.nodeWidth, gap2 = o.nodePad;
        const cols = Array.from({ length: C }, (_, c) => N.filter((n) => n.col === c));
        const ky = Math.max(0.01, Math.min(...cols.filter((c) => c.length).map((c) => (H - (c.length - 1) * gap2) / c.reduce((a, n) => a + n.v, 0))));
        cols.forEach((c, ci) => {
          const bar = (n) => {
            const q = n.b.filter((l) => all[l.s].col < ci);
            return q.length ? q.reduce((a, l) => a + l.v * (all[l.s].y + all[l.s].h / 2), 0) / q.reduce((a, l) => a + l.v, 0) : 0;
          };
          if (ci) c.sort((a, b) => bar(a) - bar(b));
          let y = pad + (H - c.reduce((a, n) => a + n.v * ky + gap2, -gap2)) / 2;
          c.forEach((n) => {
            n.x = pad / 2 + (C > 1 ? ci * (w - pad - nw) / (C - 1) : 0);
            n.y = y;
            n.h = Math.max(1, n.v * ky);
            y += n.h + gap2;
          });
        });
        N.forEach((n) => {
          let y = n.y;
          n.a.sort((p, q) => all[p.t].y - all[q.t].y).forEach((l) => {
            l.sy = y + l.v * ky / 2;
            y += l.v * ky;
          });
          y = n.y;
          n.b.sort((p, q) => all[p.s].y - all[q.s].y).forEach((l) => {
            l.ty = y + l.v * ky / 2;
            y += l.v * ky;
          });
        });
        const pal = palette(el, o, names.length), marks = [];
        L.forEach((l, i) => {
          const A = all[l.s], B = all[l.t], x0 = A.x + nw, x1 = B.x, xm = (x0 + x1) / 2, lw = l.v * ky;
          const node = s("path", { d: `M${x0},${l.sy}C${xm},${l.sy} ${xm},${l.ty} ${x1},${l.ty}`, fill: "none", stroke: pal[A.i], "stroke-opacity": 0.35, "stroke-width": lw, pathLength: 1, class: "efx-chart__mark efx-chart__draw", style: `--i:${i}` }, g);
          marks.push({
            x: xm,
            y: (l.sy + l.ty) / 2,
            label: `${A.name} \u2192 ${B.name}`,
            value: l.v,
            node,
            index: i,
            rel: [A.mi, B.mi],
            html: `<strong>${esc(A.name)} \u2192 ${esc(B.name)}</strong><b>${esc(fmt(l.v))} (${Math.round(l.v / A.v * 100)}% of ${esc(A.name)})</b>`,
            hit(px, py) {
              if (px < x0 || px > x1) return false;
              let a = 0, b = 1, t = 0.5;
              for (let k = 0; k < 14; k++) {
                t = (a + b) / 2;
                x0 + (x1 - x0) * (1.5 * t - 1.5 * t * t + t * t * t) < px ? a = t : b = t;
              }
              return Math.abs(py - (l.sy + (l.ty - l.sy) * t * t * (3 - 2 * t))) <= lw / 2 + 2;
            }
          });
        });
        N.forEach((n, i) => {
          const node = s("rect", { x: n.x, y: n.y, width: nw, height: n.h, rx: 2, fill: pal[n.i], class: "efx-chart__mark efx-chart__fade", style: `--i:${i}` }, g);
          marks.push({
            x: n.x + nw / 2,
            y: n.y + n.h / 2,
            label: n.name,
            value: n.v,
            node,
            index: L.length + i,
            rel: n.a.concat(n.b).map((l) => L.indexOf(l)),
            hit: (px, py) => px >= n.x - 2 && px <= n.x + nw + 2 && py >= n.y && py <= n.y + n.h
          });
        });
        if (!deco) N.forEach((n, i) => {
          const right = n.x < w / 2;
          s("text", { x: right ? n.x + nw + 6 : n.x - 6, y: n.y + n.h / 2, "text-anchor": right ? "start" : "end", "dominant-baseline": "middle", class: "efx-chart__value efx-flow__label efx-chart__fade", style: `--i:${i}` }, g).textContent = n.name;
        });
        return marks;
      };
      draw.radius = 1;
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
      };
    }
  };

  // src/charts/chart-funnel.js
  var pc = (x) => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10) + "%";
  var cut2 = (t, n) => t.length > n ? t.slice(0, Math.max(1, n - 1)) + "\u2026" : t;
  var chart_funnel_default = {
    name: "chart-funnel",
    selector: ".efx-chart-funnel",
    lazy: true,
    defaults: { ...COMMON, height: 320, style: "curved", horizontal: false, neck: 0.25, gap: 4, conversion: true, show: "inside", dynamic: true, compare: "mirror" },
    init(el, o) {
      const draw = ({ g, w, h, data, hidden, fmt, deco }) => {
        const S = data.series, idx = data.labels.map((_, i) => i).filter((i) => !hidden.has(i)), n = idx.length;
        if (!n || !S.length) return [];
        const pal = palette(el, o, data.labels.length);
        const hz = o.horizontal, st = o.style, bars = st === "bars", pyr = st === "pyramid", curved = st === "curved";
        const cmp = S.length > 1, ghost = cmp && o.compare === "ghost", conv = o.conversion && !deco;
        const sh = deco ? "none" : o.show, nk = Math.min(0.95, Math.max(0, o.neck));
        const V = [0, 1].map((j) => (i) => {
          const x = S[j] && S[j].values[i];
          return Number.isFinite(x) && x > 0 ? x : 0;
        });
        const max = Math.max(1e-9, ...idx.map(V[0]), ...cmp ? idx.map(V[1]) : []);
        const pd = deco ? { t: 0, r: 0, b: 0, l: 0 } : hz ? { t: conv ? 22 : 6, r: 6, b: sh === "none" ? 6 : 36, l: 6 } : { t: 6, r: conv ? 54 : 6, b: 6, l: sh === "side" ? Math.min(150, w * 0.3) : conv ? 54 : 6 };
        const L = hz ? w - pd.l - pd.r : h - pd.t - pd.b, W = hz ? h - pd.t - pd.b : w - pd.l - pd.r;
        const cx = pd.l + (w - pd.l - pd.r) / 2, cy = pd.t + (h - pd.t - pd.b) / 2, flip = pyr && !hz;
        const P = (u, v) => {
          if (flip) u = L - u;
          return hz ? [pd.l + u, cy + v] : [cx + v, pd.t + u];
        };
        const q = (u, v) => P(u, v).join(",");
        const inv = (px, py) => {
          let u = hz ? px - pd.l : py - pd.t;
          if (flip) u = L - u;
          return [u, hz ? py - cy : px - cx];
        };
        const gp = bars ? o.gap + (conv ? hz ? 40 : 18 : 6) : o.gap;
        const mean = idx.reduce((a, i) => a + V[0](i), 0) / n;
        const wt = idx.map((i) => o.dynamic ? V[0](i) + mean * 0.3 + 1e-9 : 1), tw = wt.reduce((a, b) => a + b);
        const av = Math.max(n, L - gp * (n - 1));
        const H = wt.map((x) => x / tw * av), U = H.map((_, k) => H.slice(0, k).reduce((a, b) => a + b, 0) + k * gp);
        const prop = bars || cmp || !pyr && nk <= 0;
        const prof = (t) => pyr ? 1 - t : curved ? nk + (1 - nk) * (1 - t * t * (3 - 2 * t)) : 1 - (1 - nk) * t;
        const mk = (Vf) => {
          const gs = idx.map((i, k) => {
            const u0 = U[k], u1 = u0 + H[k];
            const a = prop ? Vf(i) / max : prof(u0 / L), b = prop ? bars ? a : k < n - 1 ? Vf(idx[k + 1]) / max : a * 0.7 : prof(u1 / L);
            return { u0, u1, ea: a * W / 2, eb: b * W / 2 };
          });
          const m = (x) => (x.eb - x.ea) / (x.u1 - x.u0 || 1);
          gs.forEach((x, k) => {
            const c = m(x), p = k ? m(gs[k - 1]) : c, nx = k < n - 1 ? m(gs[k + 1]) : c;
            x.ta = k ? p * c > 0 ? (p + c) / 2 : 0 : c;
            x.tb = k < n - 1 ? nx * c > 0 ? (nx + c) / 2 : 0 : c;
          });
          return gs;
        };
        const G = [mk(V[0])];
        if (cmp) G.push(mk(V[1]));
        const ext = (k, u) => Math.max(...G.map((gs) => {
          const a = gs[k];
          return a.ea + (a.eb - a.ea) * Math.min(1, Math.max(0, (u - a.u0) / (a.u1 - a.u0 || 1)));
        }));
        const shape = (x, lo, hi, ins = 0) => {
          const u0 = x.u0 + ins, u1 = x.u1 - ins, ea = Math.max(0, x.ea - ins), eb = Math.max(0, x.eb - ins), d = (u1 - u0) / 3;
          const edge = (sg, rev) => !curved || !sg ? `L${rev ? q(u0, sg * ea) : q(u1, sg * eb)}` : rev ? `C${q(u1 - d, sg * (eb - d * x.tb))} ${q(u0 + d, sg * (ea + d * x.ta))} ${q(u0, sg * ea)}` : `C${q(u0 + d, sg * (ea + d * x.ta))} ${q(u1 - d, sg * (eb - d * x.tb))} ${q(u1, sg * eb)}`;
          return `M${q(u0, lo * ea)}${edge(lo)}L${q(u1, hi * eb)}${edge(hi, 1)}Z`;
        };
        const marks = [], rows = idx.map(() => []);
        if (bars) idx.forEach((i, k) => {
          if (k === n - 1) return;
          (cmp && !ghost ? [[0, -1, 0], [1, 0, 1]] : [[0, -1, 1]]).forEach(([j, lo, hi]) => {
            const a = G[j][k], b = G[j][k + 1];
            s("path", { d: `M${q(a.u1, lo * a.eb)}L${q(b.u0, lo * b.ea)}L${q(b.u0, hi * b.ea)}L${q(a.u1, hi * a.eb)}Z`, fill: pal[i], "fill-opacity": 0.16, class: "efx-chart__fade", style: `--i:${k}` }, g);
          });
        });
        [1, 0].forEach((pass) => (pass && !ghost ? [] : cmp && !ghost ? [0, 1] : [0]).forEach((j) => {
          const gj = pass ? 1 : j;
          idx.forEach((i, k) => {
            const x = G[gj][k], lo = cmp && !ghost && gj ? 0 : -1, hi = cmp && !ghost && !gj ? 0 : 1, v = V[gj](i);
            const half = cmp && !ghost, mid = (x.u0 + x.u1) / 2, e = (x.ea + x.eb) / 2;
            const ins = bars && !pass ? 4 : 0;
            const org = !half ? "50% 50%" : hz ? gj ? "50% 0%" : "50% 100%" : gj ? "0% 50%" : "100% 50%";
            const node = s("path", {
              d: shape(x, lo, hi, ins),
              fill: pal[i],
              "fill-opacity": pass ? 0.14 : half && gj ? 0.55 : null,
              stroke: pass || ins ? pal[i] : null,
              "stroke-width": pass ? 1.5 : ins ? 8 : null,
              "stroke-dasharray": pass ? "5 4" : null,
              "stroke-linejoin": ins ? "round" : null,
              class: "efx-chart__mark " + (pass ? "efx-chart__fade" : hz ? "efx-fn-y" : "efx-fn-x"),
              style: `--i:${k};` + (pass ? "" : `transform-origin:${org}`)
            }, g);
            const first = V[gj](idx[0]), prev = k ? V[0](idx[k - 1]) : v, vv = V[0](i), other = V[1](i);
            const dd = prev - vv;
            const html = `<strong>${esc(data.labels[i])}</strong>${half ? `<span>${esc(S[gj].name)}</span>` : ""}<b>${esc(fmt(half ? v : vv))}</b>` + (ghost ? `<span>${esc(S[1].name)}: ${esc(fmt(other))}</span>` : "") + `<span>${pc(first ? v / first * 100 : 0)} of total${k && (half ? V[gj](idx[k - 1]) : prev) ? ` \xB7 ${pc(v / (half ? V[gj](idx[k - 1]) : prev) * 100)} of previous` : ""}</span>` + (k ? `<span>${dd >= 0 ? "\u2212" : "+"}${esc(fmt(Math.abs(half ? V[gj](idx[k - 1]) - v : dd)))} vs previous</span>` : "");
            const [mx, my] = P(mid, half ? gj ? e / 2 : -e / 2 : 0);
            rows[k][pass ? 1 : j] = {
              x: mx,
              y: my,
              label: data.labels[i],
              value: pass ? other : v,
              series: cmp ? S[gj].name : "",
              node,
              index: i,
              group: k,
              html,
              hit: pass ? () => false : (px, py) => {
                const [u, vv2] = inv(px, py), z = ext(k, u) + 2;
                return u >= G[0][k].u0 - gp / 2 && u <= G[0][k].u1 + gp / 2 && vv2 >= lo * z && vv2 <= hi * z;
              }
            };
          });
        }));
        rows.forEach((r) => r.forEach((m) => m && marks.push(m)));
        const txt = (x, y, cls, str, k, anchor = "middle") => {
          s("text", { x, y, "text-anchor": anchor, "dominant-baseline": "central", class: cls + " efx-chart__fade", style: `--i:${k}` }, g).textContent = str;
        };
        if (sh !== "none") idx.forEach((i, k) => {
          const a = G[0][k], len = a.u1 - a.u0, u = (a.u0 + a.u1) / 2, name = data.labels[i], v = V[0](i), first = V[0](idx[0]);
          const l2 = fmt(v) + (cmp ? " / " + fmt(V[1](i)) : "") + (conv ? " \xB7 " + pc(first ? v / first * 100 : 0) : "");
          const cw = 2 * Math.min(...G.map((gs) => (gs[k].ea + gs[k].eb) / 2)) * 0.9 - 8;
          const t1 = name.length * 6.8, t2 = l2.length * 6.2;
          const fit = (tw2, th) => sh === "inside" && (hz ? len >= tw2 + 10 && cw >= th + 2 : cw >= tw2 && len >= th + 2);
          const lines = fit(Math.max(t1, t2), 30) ? 2 : fit(t1, 14) ? 1 : 0;
          const [x, y] = P(u, 0), e = ext(k, u);
          if (lines) {
            txt(x, y - (lines > 1 ? 7 : 0), "efx-fn-t", name, k);
            if (lines > 1) txt(x, y + 8, "efx-fn-t efx-fn-2", l2, k);
          } else if (hz) {
            const m = Math.max(4, Math.floor((len + gp) / 6.4)), by = cy + W / 2;
            s("line", { x1: x, x2: x, y1: cy + e + 3, y2: by + 3, class: "efx-fn-l efx-chart__fade", style: `--i:${k}` }, g);
            txt(x, by + 12, "efx-chart__value", cut2(name, m), k);
            txt(x, by + 25, "efx-fn-s", cut2(l2, m), k);
          } else {
            const ex = sh === "side" ? pd.l - 10 : cx - e - 10;
            if (sh === "side") s("line", { x1: ex + 5, x2: cx - e - 3, y1: y, y2: y, class: "efx-fn-l efx-chart__fade", style: `--i:${k}` }, g);
            txt(ex, y - 7, "efx-chart__value", name, k, "end");
            txt(ex, y + 8, "efx-fn-s", l2, k, "end");
          }
        });
        if (conv) idx.forEach((i, k) => {
          const a = V[0](i), b = V[0](idx[k + 1]);
          if (k === n - 1 || !a) return;
          const dr = (1 - b / a) * 100, str = (dr >= 0 ? "\u2212" : "+") + pc(Math.abs(dr)), uB = (G[0][k].u1 + G[0][k + 1].u0) / 2;
          const e = Math.max(...G.map((gs) => Math.max(gs[k].eb, gs[k + 1].ea)));
          if (bars) {
            const [x, y] = P(uB, 0);
            txt(x, y, "efx-fn-d", str, k);
          } else if (hz) {
            const [x, y] = P(uB, -e - 9);
            txt(x, y, "efx-fn-d", str, k);
          } else {
            const [x, y] = P(uB, e + 8);
            txt(x, y, "efx-fn-d", str, k, "start");
          }
        });
        return marks;
      };
      draw.legendByLabel = true;
      draw.radius = 1;
      return chart(el, o, draw);
    }
  };

  // src/charts/chart-gauge.js
  var TAU = Math.PI * 2;
  var chart_gauge_default = {
    name: "chart-gauge",
    selector: ".efx-chart-gauge",
    lazy: true,
    defaults: { ...COMMON, legend: false, type: "gauge", value: NaN, min: 0, max: 100, thick: 0.18, needle: false, target: NaN, label: "" },
    init(el, o) {
      const off = on(el, "efx:data", (e) => {
        const v = e.detail && e.detail.value;
        o.value = v != null && v !== "" && Number.isFinite(+v) ? +v : NaN;
      });
      const stop = chart(el, o, ({ g, w, h, data, fmt, deco }) => {
        const ty = o.type, rad = ty === "radial", gauge = ty === "gauge", S = data.series[0] || { values: [] };
        const pal = palette(el, o, Math.max(1, data.labels.length));
        if (rad && !S.values.length) return [];
        const vals = rad ? S.values : [Number.isFinite(o.value) ? o.value : S.values[0] || 0];
        const span = o.max - o.min || 1, p = (v2) => Math.min(1, Math.max(0, (v2 - o.min) / span));
        const a0 = gauge ? -2 * Math.PI / 3 : 0, sw = rad ? 1.5 * Math.PI : gauge ? 4 * Math.PI / 3 : TAU;
        const m = deco ? 2 : 6;
        const R = gauge ? Math.min((w - 2 * m) / 2, (h - 2 * m) / 1.5) : Math.min(w, h) / 2 - m;
        const cx = w / 2, cy = gauge ? (h - 1.5 * R) / 2 + R : h / 2;
        const n = vals.length, ring = Math.max(2, rad ? Math.min(o.thick * R, R * 0.78 / n - 3) : o.thick * R);
        const arc = (r, a, b) => {
          b = Math.min(b, a + TAU - 1e-3);
          const [x0, y0] = pt(cx, cy, r, a), [x1, y1] = pt(cx, cy, r, b);
          return `M${x0},${y0}A${r},${r} 0 ${b - a > Math.PI ? 1 : 0} 1 ${x1},${y1}`;
        };
        const marks = [];
        const text = !deco && Math.min(w, h) >= 90;
        vals.forEach((v2, i) => {
          const r = rad ? R - ring / 2 - i * (R * 0.78 / n) : R - ring / 2, a1 = a0 + sw * p(v2), name = rad ? data.labels[i] || String(i + 1) : o.label || (data.labels[0] && data.labels[0] !== "1" ? data.labels[0] : "Value");
          s("path", { d: arc(r, a0, a0 + sw), class: "efx-gauge-track", "stroke-width": ring, "stroke-linecap": "round", fill: "none" }, g);
          const node = s("path", { d: arc(r, a0, a1 || a0 + 1e-3), pathLength: 1, class: "efx-chart__mark efx-gauge-sweep", style: `--i:${i * 3}`, stroke: pal[rad ? i : 0], "stroke-width": ring, "stroke-linecap": "round", fill: "none", visibility: p(v2) > 0 ? null : "hidden" }, g);
          const [x, y] = pt(cx, cy, r, a1);
          marks.push({
            x,
            y,
            label: name,
            value: v2,
            node,
            index: i,
            series: "",
            html: `<strong>${esc(name)}</strong><b>${esc(fmt(v2))}</b><span>${Math.round(p(v2) * 100)}% of ${esc(fmt(o.max))}</span>`,
            hit: (px, py) => {
              const d = Math.hypot(px - cx, py - cy), an = ((Math.atan2(px - cx, cy - py) - a0) % TAU + TAU) % TAU;
              return Math.abs(d - r) <= ring / 2 + 4 && an <= sw + 0.05;
            }
          });
          if (rad && text) {
            const t = s("text", { x: cx - 10, y: cy - r, "text-anchor": "end", "dominant-baseline": "central", class: "efx-gauge-lab efx-chart__fade", style: `--i:${i}` }, g);
            t.textContent = name;
          }
        });
        const v = vals[0], ri = R - ring;
        if (Number.isFinite(o.target) && !rad) {
          const at = a0 + sw * p(o.target), [x1, y1] = pt(cx, cy, R - ring - 3, at), [x2, y2] = pt(cx, cy, R + 3, at);
          s("line", { x1, y1, x2, y2, class: "efx-gauge-target" }, g);
        }
        if (deco || rad) return marks;
        if (gauge && o.needle) {
          const len = R - ring - 4;
          s("path", { d: `M${cx - 3.5},${cy}L${cx},${cy - len}L${cx + 3.5},${cy}Z`, class: "efx-gauge-needle", style: `transform-origin:${cx}px ${cy}px;--a:${a0 + sw * p(v)}rad` }, g);
          s("circle", { cx, cy, r: 6, class: "efx-gauge-hub" }, g);
        }
        if (text) {
          const str = fmt(v), cap = o.label || (data.labels[0] && data.labels[0] !== "1" ? data.labels[0] : "");
          const f = Math.min(ri * (gauge ? o.needle ? 0.36 : 0.5 : 0.5), ri * 1.6 / (str.length * 0.58)), ty0 = gauge ? o.needle ? cy + ri * 0.4 : cy + ri * 0.02 : cy - (cap ? f * 0.3 : 0);
          const big = s("text", { x: cx, y: ty0, "text-anchor": "middle", "dominant-baseline": "central", class: "efx-chart__value efx-chart__fade", style: `font-size:${f}px` }, g);
          big.textContent = str;
          if (cap) s("text", { x: cx, y: ty0 + f * 0.8, "text-anchor": "middle", "dominant-baseline": "central", class: "efx-gauge-lab efx-chart__fade" }, g).textContent = cap;
        }
        return marks;
      });
      return () => {
        off();
        stop();
      };
    }
  };

  // src/charts/chart-heatmap.js
  var DAY = 864e5;
  var utc = (d) => {
    const m = String(d).match(/\d+/g) || [];
    return Date.UTC(m[0], m[1] - 1, m[2]);
  };
  var parseDays = (raw) => {
    let r = typeof raw === "string" ? JSON.parse(raw) : raw;
    r = Array.isArray(r) ? r : r && r.data || [];
    if (!Array.isArray(r)) return [];
    return capDays(r.filter((d) => d && d.date).map((d) => ({ t: utc(d.date), v: +d.value || 0 })).filter((d) => Number.isFinite(d.t)));
  };
  var capDays = (a) => {
    if (!a.length) return a;
    const max = Math.max(...a.map((d) => d.t)), min = max - (53 * 7 - 1) * DAY;
    return a.filter((d) => d.t >= min);
  };
  var rd = (el, t) => {
    try {
      const j = el.querySelector(':scope > script[type="application/json"]');
      return parseDays(j ? j.textContent : t);
    } catch (e) {
      return [];
    }
  };
  var chart_heatmap_default = {
    name: "chart-heatmap",
    selector: ".efx-chart-heatmap",
    lazy: true,
    defaults: { ...COMMON, height: 0, legend: false, calendar: false, scheme: "", gap: 2, radius: 2 },
    init(el, o) {
      const H0 = o.height, cal = o.calendar;
      let days = cal ? rd(el, o.data) : [], rows = cal ? 0 : parseData(el, o).series.length;
      if (cal) o.data = '{"series":[]}';
      const geo = (w) => {
        const t0 = Math.min(...days.map((d) => d.t)), n = Math.round((Math.max(...days.map((d) => d.t)) - t0) / DAY) + 1, d0 = new Date(t0).getUTCDay(), wk = Math.ceil((n + d0) / 7);
        return { t0, n, d0, wk, cell: Math.min(20, (w - 30) / wk) };
      };
      if (!o.background && !H0) Object.defineProperty(o, "height", { get: () => cal ? days.length ? 18 + 7 * geo(Math.max(40, el.clientWidth)).cell : 60 : 22 + 30 * Math.max(1, rows) });
      const off = on(el, "efx:data", (e) => {
        const d = e.detail;
        if (cal) {
          try {
            days = parseDays(d);
          } catch (err) {
            days = [];
          }
        } else rows = (d && d.series || []).length || rows;
      });
      const fmtDate = (t) => new Date(t).toLocaleDateString(void 0, { dateStyle: "medium", timeZone: "UTC" });
      const draw = ({ g, w, h, data, visible, fmt, deco }) => {
        const pal = palette(el, o, 7), c0 = pal[0], c1 = o.colors.length ? pal[1] : pal[5], gap2 = o.gap, cells = [];
        const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
        const text = (a, t) => s("text", a, ax).textContent = t;
        let cw, ch, ox = 0, oy = 0;
        if (cal) {
          if (!days.length) return [];
          const q = geo(w), by = new Map(days.map((d) => [d.t, d.v]));
          ox = deco ? 0 : 30;
          oy = deco ? 0 : 18;
          cw = deco ? w / q.wk : q.cell;
          ch = deco ? h / 7 : q.cell;
          let last = -9;
          for (let c = 0; c < q.wk; c++) {
            for (let r = 0; r < 7; r++) {
              const i = c * 7 + r - q.d0;
              if (i < 0 || i >= q.n) continue;
              const t = q.t0 + i * DAY;
              cells.push({ c, r, v: by.has(t) ? by.get(t) : null, label: fmtDate(t), series: "" });
              if (!deco && r === 0 && (c === 0 || new Date(t).getUTCDate() <= 7 && new Date(t - 7 * DAY).getUTCMonth() !== new Date(t).getUTCMonth()) && c - last >= 3) {
                last = c;
                text({ x: ox + c * cw, y: 11 }, new Date(t).toLocaleDateString(void 0, { month: "short", timeZone: "UTC" }));
              }
            }
          }
          if (!deco && ch >= 11) [1, 3, 5].forEach((r) => text({ x: ox - 6, y: oy + (r + 0.5) * ch, "text-anchor": "end", "dominant-baseline": "middle" }, new Date(Date.UTC(2023, 0, 1 + r)).toLocaleDateString(void 0, { weekday: "short", timeZone: "UTC" })));
        } else {
          const nc = data.labels.length;
          if (!nc || !visible.length) return [];
          ox = deco ? 0 : Math.min(120, 12 + 6.5 * Math.max(...visible.map((v) => String(v.name).length)));
          oy = deco ? 0 : 22;
          cw = (w - ox) / nc;
          ch = (h - oy) / visible.length;
          const every = Math.ceil(nc / Math.max(1, Math.floor((w - ox) / 48)));
          if (!deco) data.labels.forEach((l, c) => c % every || text({ x: ox + (c + 0.5) * cw, y: 14, "text-anchor": "middle" }, l));
          visible.forEach((sr, r) => {
            if (!deco) text({ x: ox - 8, y: oy + (r + 0.5) * ch, "text-anchor": "end", "dominant-baseline": "middle" }, String(sr.name));
            data.labels.forEach((l, c) => cells.push({ c, r, v: sr.values[c] == null ? null : sr.values[c], label: l, series: String(sr.name) }));
          });
        }
        const vs = cells.filter((k) => k.v != null).map((k) => k.v), lo = Math.min(...vs), hi = Math.max(...vs), div = o.scheme === "diverging", m = Math.max(Math.abs(lo), Math.abs(hi)) || 1;
        const step = Math.min(1, 16 / Math.max(1, cal ? cells.length / 7 : cells.length / (visible.length || 1)));
        const marks = [];
        cells.forEach((k) => {
          const t = div ? Math.abs(k.v) / m : (k.v - lo) / (hi - lo || 1), x = ox + k.c * cw, y = oy + k.r * ch, rw = Math.max(1, cw - gap2), rh = Math.max(1, ch - gap2);
          const fill = k.v == null ? "var(--efx-chart-text) 10%" : `${div && k.v < 0 ? c1 : c0} ${Math.round(8 + 92 * t)}%`;
          const node = s("rect", { x, y, width: rw, height: rh, rx: o.radius, style: `fill:color-mix(in oklab, ${fill}, transparent);--i:${k.c * step}`, class: (k.v == null ? "" : "efx-chart__mark ") + "efx-chart__fade" }, g);
          if (k.v != null) marks.push({ x: x + rw / 2, y: y + rh / 2, label: k.label, value: k.v, series: k.series, node, index: marks.length, hit: (px, py) => px >= x - gap2 / 2 && px <= x + rw + gap2 / 2 && py >= y - gap2 / 2 && py <= y + rh + gap2 / 2 });
        });
        return marks;
      };
      draw.radius = 1;
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
      };
    }
  };

  // src/charts/chart-histogram.js
  var chart_histogram_default = {
    name: "chart-histogram",
    selector: ".efx-chart-histogram",
    lazy: true,
    defaults: { ...COMMON, bins: 0, step: 0, curve: false, grid: true },
    init(el, o) {
      const draw = ({ g, w, h, data, colors, fmt, deco }) => {
        const xs = ((data.series[0] || {}).values || []).filter(Number.isFinite), n = xs.length;
        if (!n) return [];
        let lo = Math.min(...xs), hi = Math.max(...xs), st = o.step;
        if (lo === hi) {
          lo -= 0.5;
          hi += 0.5;
        }
        if (st > 0) {
          lo = Math.floor(lo / st) * st;
          hi = Math.ceil(hi / st) * st;
        } else {
          const k = o.bins > 0 ? Math.round(o.bins) : Math.ceil(Math.log2(n) + 1);
          if (o.bins > 0) st = (hi - lo) / k;
          else {
            st = tickStep(lo, hi, k);
            lo = Math.floor(lo / st) * st;
            hi = Math.ceil(hi / st) * st;
          }
        }
        const nb = Math.max(1, Math.min(200, Math.round((hi - lo) / st)));
        st = (hi - lo) / nb;
        const edges = Array.from({ length: nb + 1 }, (_, i) => +(lo + i * st).toFixed(10)), cnt = Array(nb).fill(0);
        xs.forEach((x) => {
          cnt[Math.min(nb - 1, Math.floor((x - lo) / st + 1e-9))]++;
        });
        const mean = xs.reduce((a, x) => a + x, 0) / n, sd = Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / n);
        const pdf = (x) => n * st * Math.exp(-((x - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
        const curve = o.curve && sd > 0;
        const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : { t: 12, r: 12, b: 28, l: 36 };
        const sc = nice(0, Math.max(...cnt, curve ? pdf(mean) : 0), Math.max(2, Math.floor(h / 50)));
        const X = linear([lo, hi], [pad.l, w - pad.r]), Y = linear([sc.min, sc.max], [h - pad.b, pad.t]);
        if (!deco) axes(g, { w, h, pad, y: Y, ticks: sc.ticks, labels: edges.map(fmt), x: (i) => X(edges[i]), fmt: String, grid: o.grid });
        const marks = cnt.map((c, i) => {
          const x0 = X(edges[i]), x1 = X(edges[i + 1]), y = Y(c), label = `[${fmt(edges[i])}, ${fmt(edges[i + 1])}${i === nb - 1 ? "]" : ")"}`;
          const node = s("rect", { x: x0, y, width: x1 - x0, height: Y(0) - y, fill: colors[0], stroke: "var(--sh-surface, #fff)", "stroke-width": deco ? 0 : 1, class: "efx-chart__mark efx-chart__grow", style: `--i:${Math.min(i, 12)}` }, g);
          return {
            x: (x0 + x1) / 2,
            y,
            label,
            value: c,
            series: "",
            node,
            index: i,
            html: `<strong>${esc(label)}</strong><b>${c} value${c === 1 ? "" : "s"}</b>`,
            hit: (px, py) => px >= x0 && px <= x1 && py >= pad.t && py <= h - pad.b
          };
        });
        if (curve) s("path", { d: linePath(Array.from({ length: 65 }, (_, i) => {
          const x = lo + (hi - lo) * i / 64;
          return [X(x), Y(pdf(x))];
        }), false), fill: "none", stroke: colors[1] || colors[0], "stroke-width": 2, pathLength: 1, class: "efx-chart__draw", style: "pointer-events:none" }, g);
        return marks;
      };
      draw.radius = 1;
      return chart(el, o, draw);
    }
  };

  // src/charts/chart-line.js
  var safeColor2 = (c) => {
    try {
      return typeof c === "string" && CSS.supports("color", c) && !/[;{}"'<>]/.test(c) ? c : "#6366f1";
    } catch (e) {
      return "#6366f1";
    }
  };
  var uid3 = 0;
  var chart_line_default = {
    name: "chart-line",
    selector: ".efx-chart-line",
    lazy: true,
    defaults: { ...COMMON, area: false, smooth: true, dots: true, stacked: false, stream: false, grid: true, min: "" },
    init(el, o) {
      const draw = ({ g, w, h, data, visible, colors, fmt, deco }) => {
        const n = data.labels.length;
        if (!n || !visible.length) return [];
        const pad = deco ? { t: 6, r: 0, b: 6, l: 0 } : { t: 12, r: 16, b: 28, l: o.stream ? 8 : 44 };
        const sk = o.stream, stack = o.stacked || sk, area = o.area || stack;
        let acc = Array(n).fill(0);
        if (sk) {
          let y0 = 0;
          acc = acc.map((_, j) => {
            if (j) {
              let s1 = 0, s2 = 0, c = 0;
              visible.forEach((sr) => {
                const v = sr.values[j] || 0;
                s1 += v;
                s2 += (v / 2 + c) * (v - (sr.values[j - 1] || 0));
                c += v;
              });
              if (s1) y0 -= s2 / s1;
            }
            return y0;
          });
          const tot = acc.map((a, j) => a + visible.reduce((q, sr) => q + (sr.values[j] || 0), 0)), mid = (Math.min(...acc) + Math.max(...tot)) / 2;
          acc = acc.map((a) => a - mid);
        }
        const rows = visible.map((sr) => {
          const lo = acc, hi = sr.values.map((_, i) => 0);
          for (let i = 0; i < n; i++) hi[i] = (stack ? lo[i] : 0) + (sr.values[i] || 0);
          if (stack) acc = hi;
          return { sr, lo, hi, c: colors[sr.index] };
        });
        const vals = rows.flatMap((r) => r.hi).concat(sk ? rows[0].lo : area ? 0 : []);
        const lo0 = o.min === "" || o.min == null ? NaN : +o.min;
        const sc = sk ? { min: Math.min(...vals), max: Math.max(...vals), ticks: [] } : nice(Number.isFinite(lo0) ? lo0 : Math.min(...vals), Math.max(...vals), Math.max(2, Math.floor(h / 50)));
        const y = linear([sc.min, sc.max], [h - pad.b, pad.t]);
        const x = (i) => n > 1 ? pad.l + i * (w - pad.l - pad.r) / (n - 1) : (pad.l + w - pad.r) / 2;
        if (!deco) axes(g, { w, h, pad, y, ticks: sc.ticks, labels: data.labels, x, fmt, grid: o.grid });
        const P = (a) => a.map((v, i) => [x(i), y(v)]);
        const base = y(Math.max(sc.min, 0));
        if (area) {
          const defs2 = s("defs", {}, g);
          rows.forEach((r, k) => {
            const id = "efx-lg" + ++uid3;
            const lg = s("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs2);
            s("stop", { offset: 0, "stop-color": r.c, "stop-opacity": sk ? 0.85 : 0.35 }, lg);
            s("stop", { offset: 1, "stop-color": r.c, "stop-opacity": sk ? 0.85 : 0 }, lg);
            const tail = stack ? "L" + linePath(P(r.lo).reverse(), o.smooth).slice(1) : `L${x(n - 1)},${base}L${x(0)},${base}`;
            s("path", { d: linePath(P(r.hi), o.smooth) + tail + "Z", fill: `url(#${id})`, class: "efx-chart__fade", style: `--i:${k}` }, g);
          });
        }
        if (!sk) rows.forEach((r) => s("path", { d: linePath(P(r.hi), o.smooth), pathLength: 1, fill: "none", stroke: r.c, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", class: "efx-chart__draw" }, g));
        if (deco) return [];
        const step = Math.min(1, 16 / n);
        return data.labels.map((label, i) => {
          const node = s("g", { class: "efx-chart__mark efx-chart-line__pt" }, g);
          s("line", { x1: x(i), x2: x(i), y1: pad.t, y2: h - pad.b, class: "efx-chart-line__x" }, node);
          rows.forEach((r) => s("circle", { cx: x(i), cy: y(sk ? (r.lo[i] + r.hi[i]) / 2 : r.hi[i]), r: 4, fill: r.c, class: "efx-chart-line__dot " + (o.dots ? "efx-chart__fade" : "efx-chart-line__hid"), style: `--i:${i * step}` }, node));
          const multi = rows.length > 1;
          return {
            x: x(i),
            y: Math.min(...rows.map((r) => y(r.hi[i]))),
            label,
            node,
            index: i,
            xOnly: true,
            group: i,
            value: stack ? rows[rows.length - 1].hi[i] : rows[0].sr.values[i] || 0,
            series: multi ? "" : rows[0].sr.name,
            html: `<strong>${esc(label)}</strong>` + rows.map((r) => `<span>${multi ? `<i style="color:${esc(safeColor2(r.c))}">\u25CF</i> ${esc(r.sr.name)} ` : ""}<b>${esc(fmt(r.sr.values[i] || 0))}</b></span>`).join("")
          };
        });
      };
      draw.radius = Infinity;
      return chart(el, o, draw);
    }
  };

  // src/charts/chart-pie.js
  var TAU2 = Math.PI * 2;
  var pc2 = (x) => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10) + "%";
  var chart_pie_default = {
    name: "chart-pie",
    selector: ".efx-chart-pie",
    lazy: true,
    defaults: { ...COMMON, height: 300, donut: 0.6, pad: 0.01, sort: false, center: "", show: "auto", half: false, rose: false },
    init(el, o) {
      let center = () => {
      };
      const draw = ({ g, w, h, data, hidden, fmt, deco }) => {
        const vals = data.series[0] ? data.series[0].values : [];
        let idx = data.labels.map((_, i) => i).filter((i) => !hidden.has(i) && vals[i] > 0);
        if (o.sort) idx.sort((a, b) => vals[b] - vals[a]);
        const total = idx.reduce((a, i) => a + vals[i], 0), vmax = Math.max(...idx.map((i) => vals[i]));
        if (!total) return [];
        const pal = palette(el, o, data.labels.length), half = o.half;
        const auto = !deco && o.show === "auto", inner = !deco && o.show === "percent";
        const rv = half ? h - 22 : h / 2 - 20;
        let R = Math.min(rv, w / 2 - (auto ? 78 : 8)), lab = auto;
        if (R < 40) {
          R = Math.max(10, Math.min(rv, w / 2 - 8));
          lab = false;
        }
        if (deco) R = Math.min(half ? h : h / 2, w / 2);
        const r0 = R * Math.min(0.95, Math.max(0, o.donut)), cx = w / 2, cy = half ? deco ? h : h - 6 : h / 2;
        const span = half ? Math.PI : TAU2, start = half ? -Math.PI / 2 : 0;
        const gap2 = Math.min(o.pad, span / idx.length / 2);
        let acc = start;
        const marks = [], arcs = [], labs = [];
        idx.forEach((i, k) => {
          const a0 = acc, a1 = acc + (o.rose ? 1 / idx.length : vals[i] / total) * span, m = (a0 + a1) / 2;
          const Ro = o.rose ? r0 + (R - r0) * Math.sqrt(vals[i] / vmax) : R;
          acc = a1;
          const d = idx.length > 1 ? gap2 / 2 : 0;
          const [dx, dy] = pt(0, 0, 7, m);
          const node = s("path", { d: arcPath(cx, cy, r0, Ro, a0 + d, a1 - d), fill: pal[i], class: "efx-chart__mark efx-pie-arc", style: `--i:${k};--dx:${dx}px;--dy:${dy}px;transform-origin:${cx}px ${cy}px` }, g);
          arcs.push({ node, i });
          const [mx, my] = pt(cx, cy, (r0 + Ro) / 2, m), pct = vals[i] / total * 100;
          marks.push({
            x: mx,
            y: my,
            label: data.labels[i],
            value: vals[i],
            node,
            index: i,
            group: k,
            html: `<strong>${esc(data.labels[i])}</strong><b>${esc(fmt(vals[i]))}</b><span>${pc2(pct)}</span>`,
            hit: (px, py) => {
              const r = Math.hypot(px - cx, py - cy);
              if (r < r0 - 2 || r > Ro + 8) return false;
              const an = ((Math.atan2(px - cx, cy - py) - start) % TAU2 + TAU2) % TAU2 + start;
              return an >= a0 && an <= a1;
            }
          });
          if (inner && (a1 - a0) * (r0 + R) / 2 >= 28 && R - r0 > 14) {
            const t = s("text", { x: mx, y: my, "text-anchor": "middle", "dominant-baseline": "central", class: "efx-pie-t efx-chart__fade", style: `--i:${k}` }, g);
            t.textContent = pc2(pct);
          }
          if (lab) labs.push({ m, Ro, sd: Math.sin(m) >= 0 ? 1 : -1, t: `${data.labels[i]}  ${pc2(pct)}`, k });
        });
        [-1, 1].forEach((sd) => {
          const L = labs.filter((l) => l.sd === sd).map((l) => ({ ...l, y: pt(cx, cy, R + 14, l.m)[1] })).sort((a, b) => a.y - b.y);
          L.forEach((l, j) => {
            if (j) l.y = Math.max(l.y, L[j - 1].y + 15);
          });
          for (let j = L.length - 1; j >= 0; j--) {
            if (j < L.length - 1 && L[j].y > L[j + 1].y - 15) L[j].y = L[j + 1].y - 15;
          }
          L.forEach((l) => {
            const [x1, y1] = pt(cx, cy, l.Ro + 2, l.m), [x2, y2] = pt(cx, cy, R + 12, l.m), xl = cx + sd * (R + 22);
            s("path", { d: `M${x1},${y1}L${x2},${y2}L${xl},${l.y}`, class: "efx-pie-l efx-chart__fade", style: `--i:${l.k}` }, g);
            const mc = Math.floor((w / 2 - R - 30) / 6.2), t = s("text", { x: xl + sd * 4, y: l.y, "text-anchor": sd > 0 ? "start" : "end", "dominant-baseline": "central", class: "efx-chart__value efx-pie-lt efx-chart__fade", style: `--i:${l.k}` }, g);
            t.textContent = l.t.length > mc ? l.t.slice(0, Math.max(3, mc - 1)) + "\u2026" : l.t;
          });
        });
        if (!deco && r0 >= 28) {
          const tot = fmt(total), custom = o.center.replace("{total}", tot);
          const fs = Math.max(12, Math.min(28, r0 * 0.42)), cyy = half ? cy - r0 * 0.3 : cy;
          const big = s("text", { x: cx, y: cyy - (custom ? 0 : 6), "text-anchor": "middle", "dominant-baseline": "central", class: "efx-chart__value efx-pie-c" }, g);
          const cap = s("text", { x: cx, y: cyy + fs * 0.7, "text-anchor": "middle", "dominant-baseline": "central", class: "efx-pie-s" }, g);
          const set = (a) => {
            const v = a ? fmt(vals[a.i]) : custom || tot, c = a ? data.labels[a.i] : custom ? "" : "Total";
            const f = Math.min(fs, r0 * 1.7 / (Math.max(v.length, c.length * 0.6) * 0.58));
            big.style.fontSize = f + "px";
            big.textContent = v;
            cap.textContent = c;
            big.setAttribute("y", cyy - (c ? f * 0.35 : 0));
            cap.setAttribute("y", cyy + f * 0.6);
          };
          set();
          center = (m) => set(m ? arcs.find((a) => a.node === m.node) : void 0);
        }
        return marks;
      };
      draw.legendByLabel = true;
      draw.onShow = (m) => center(m);
      draw.radius = 1;
      const off = chart(el, o, draw);
      return off;
    }
  };

  // src/charts/chart-progress.js
  var GAP = 12;
  var chart_progress_default = {
    name: "chart-progress",
    selector: ".efx-chart-progress",
    lazy: true,
    defaults: { ...COMMON, max: NaN, values: true, percent: true, thick: 10, radius: 999, legend: false },
    init(el, o) {
      const auto = el.dataset.efxHeight === void 0;
      const fit = (n) => {
        if (auto) o.height = Math.max(1, n) * (o.thick + 30) - GAP;
      };
      const rows = (d) => fit(d.labels.length);
      rows(parseData(el, o));
      const off = on(el, "efx:data", (e) => {
        const x = e.detail || {};
        rows(parseData(el, { ...o, source: "", data: JSON.stringify(x), labels: x.labels || [] }));
      });
      const draw = ({ g, w, h, data, fmt, deco }) => {
        const n = data.labels.length, [V, T] = data.series;
        if (!n || !V) return [];
        const pal = palette(el, o, n), pitch = (h + GAP) / n, th = deco ? pitch * 0.6 : o.thick, r = Math.min(o.radius, th / 2);
        const all = Math.max(...V.values, ...T ? T.values : [], 1);
        return data.labels.map((label, i) => {
          const v = V.values[i] || 0, t = T ? T.values[i] || 0 : 0;
          const sc = o.max > 0 ? o.max : t ? Math.max(t, v) : all;
          const y = i * pitch + (deco ? (pitch - th) / 2 : 16), f = Math.max(0, Math.min(1, v / sc)) * w;
          const pc3 = Math.round(v / (t || sc) * 100);
          const txt = [o.values && fmt(v) + (t ? " / " + fmt(t) : ""), o.percent && pc3 + "%"].filter(Boolean).join(" \xB7 ");
          s("rect", { x: 0, y, width: w, height: th, rx: r, style: "fill:var(--sh-surface-2,rgb(128 128 128/.18))" }, g);
          if (!deco) {
            const lab = s("text", { x: 0, y: i * pitch + 11, style: "fill:var(--sh-text,#0f172a);font-size:13px" }, g);
            const room = Math.max(4, Math.floor((w - txt.length * 7.5 - 12) / 7));
            lab.textContent = label.length > room ? label.slice(0, room - 1) + "\u2026" : label;
            s("text", { x: w, y: i * pitch + 11, "text-anchor": "end", class: "efx-chart__value", style: "font-size:13px" }, g).textContent = txt;
          }
          const node = s("rect", { x: 0, y, width: Math.max(f, f ? th : 0), height: th, rx: r, fill: pal[i], class: "efx-chart__mark efx-chart__grow-x", style: `--i:${i}` }, g);
          if (t) {
            const tx = Math.min(1, t / sc) * w;
            s("line", { x1: tx, x2: tx, y1: y - 3, y2: y + th + 3, stroke: "var(--sh-text,#0f172a)", "stroke-width": 2, "stroke-linecap": "round", class: "efx-chart__fade", style: `--i:${i}` }, g);
          }
          return {
            x: f,
            y: y + th / 2,
            label,
            value: v,
            node,
            index: i,
            html: `<strong>${esc(label)}</strong><b>${esc(fmt(v) + (t ? " / " + fmt(t) : ""))}</b><span>${pc3}%</span>`,
            hit: (px, py) => py >= i * pitch && py <= i * pitch + pitch - GAP + 4
          };
        });
      };
      draw.radius = 1;
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
      };
    }
  };

  // src/charts/chart-pyramid.js
  var wrap = (t, n) => {
    const out = [];
    let l = "";
    String(t).split(/\s+/).forEach((wd) => {
      if (l && (l + " " + wd).length > n) {
        out.push(l);
        l = wd;
      } else l = l ? l + " " + wd : wd;
    });
    if (l) out.push(l);
    return out.slice(0, 3);
  };
  var chart_pyramid_default = {
    name: "chart-pyramid",
    selector: ".efx-chart-pyramid",
    lazy: true,
    defaults: { ...COMMON, height: 320, inverted: false, equal: false, notes: [], gap: 3 },
    init(el, o) {
      const draw = ({ g, w, h, data, hidden, fmt, deco }) => {
        const idx = data.labels.map((_, i) => i).filter((i) => !hidden.has(i)), n = idx.length;
        if (!n) return [];
        const vals = data.series[0] && data.series[0].values || [];
        const has = !o.equal && idx.some((i) => vals[i] > 0);
        const pal = palette(el, o, data.labels.length), inv = o.inverted, gp = deco ? 0 : o.gap;
        const pad = deco ? 0 : 6, nw = o.notes.length && !deco ? Math.min(230, (w - 12) * 0.38) : 0;
        const tw = w - 2 * pad - (nw ? nw + 14 : 0), H = h - 2 * pad, cx = pad + tw / 2;
        const mean = has ? idx.reduce((a, i) => a + Math.max(0, vals[i] || 0), 0) / n : 1;
        const wt = idx.map((i) => has ? Math.max(0, vals[i] || 0) + mean * 0.35 : 1), sum = wt.reduce((a, b) => a + b);
        const av = Math.max(n, H - gp * (n - 1));
        const hw = (y2) => (inv ? 1 - (y2 - pad) / H : (y2 - pad) / H) * tw / 2;
        let y = pad;
        const marks = [];
        idx.forEach((i, k) => {
          const bh = wt[k] / sum * av, y0 = y, y1 = y + bh, ym = (y0 + y1) / 2;
          y = y1 + gp;
          const a = Math.max(0, hw(y0)), b = Math.max(0, hw(y1));
          const node = s("polygon", { points: `${cx - a},${y0} ${cx + a},${y0} ${cx + b},${y1} ${cx - b},${y1}`, fill: pal[i], class: "efx-chart__mark efx-pyr__b", style: `--i:${inv ? n - 1 - k : k}` }, g);
          const note = o.notes[k];
          if (!deco) {
            const label = data.labels[i], val2 = has ? fmt(vals[i] || 0) : "", mid = hw(ym) * 2, fit = mid >= label.length * 6.8 + 14;
            const two = val2 && fit && bh >= 38 && mid >= val2.length * 6.4 + 14;
            const t = (x, yy, cls, str, anchor) => {
              const e = s("text", { x, y: yy, "text-anchor": anchor || "middle", "dominant-baseline": "middle", class: cls + " efx-chart__fade", style: `--i:${(inv ? n - 1 - k : k) * 2 + 2}` }, g);
              e.textContent = str;
            };
            if (fit) {
              t(cx, ym - (two ? 7 : 0), "efx-pyr__t", label);
              if (two) t(cx, ym + 8, "efx-pyr__t efx-pyr__t2", val2);
            } else t(cx + Math.max(a, b) + 8, ym, "efx-pyr__o", label + (val2 ? " \xB7 " + val2 : ""), "start");
            if (note) {
              const nx = pad + tw + 14, ex = cx + Math.max(hw(ym), 0) + (fit ? 4 : 0);
              if (fit) s("line", { x1: ex, x2: nx - 6, y1: ym, y2: ym, class: "efx-chart__grid efx-chart__fade", style: `--i:${k}` }, g);
              const lines = wrap(note, Math.max(8, Math.floor(nw / 6.4))), e = s("text", { x: nx, y: ym - (lines.length - 1) * 7, class: "efx-pyr__n efx-chart__fade", style: `--i:${k * 2 + 2}` }, g);
              lines.forEach((l, q) => {
                const sp = s("tspan", { x: nx, dy: q ? 14 : 0, "dominant-baseline": "middle" }, e);
                sp.textContent = l;
              });
            }
          }
          marks.push({
            x: cx,
            y: ym,
            label: data.labels[i],
            value: has ? vals[i] || 0 : k + 1,
            valueText: has ? fmt(vals[i] || 0) : `Tier ${k + 1} of ${n}`,
            node,
            index: i,
            hit: (px, py) => py >= y0 - gp / 2 && py <= y1 + gp / 2,
            html: `<strong>${esc(data.labels[i])}</strong>` + (note ? `<span>${esc(note)}</span>` : "") + `<b>${esc(has ? fmt(vals[i] || 0) : `Tier ${k + 1} of ${n}`)}</b>`
          });
        });
        return marks;
      };
      draw.legendByLabel = true;
      draw.radius = 1e-3;
      return chart(el, o, draw);
    }
  };

  // src/charts/chart-quadrant.js
  var norm = (d) => (Array.isArray(d) ? d : d && d.items || []).filter((q) => q && typeof q === "object").map((q) => ({ ...q, x: +q.x, y: +q.y })).filter((q) => isFinite(q.x) && isFinite(q.y));
  var nf = new Intl.NumberFormat(void 0, { maximumFractionDigits: 2 });
  var dom = (a, k) => (a.length > 1 && a.every((v) => isFinite(parseFloat(v))) ? a.map(parseFloat) : [0, 100])[k];
  var hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  var chart_quadrant_default = {
    name: "chart-quadrant",
    selector: ".efx-chart-quadrant",
    lazy: true,
    defaults: { ...COMMON, height: 360, legend: false, quadrants: [], xLabel: "", yLabel: "", xDomain: [], yDomain: [] },
    init(el, o) {
      const read5 = (d) => {
        try {
          return norm(d);
        } catch (e) {
          return [];
        }
      };
      const j = el.querySelector(':scope > script[type="application/json"]');
      let items = [];
      try {
        items = read5(JSON.parse((o.data || "").trim() || (j ? j.textContent : "[]")));
      } catch (e) {
        console.warn("[effix] chart data", e);
      }
      const jt = j && j.getAttribute("type");
      if (j) j.setAttribute("type", "application/x-efx-json");
      o.source = "";
      o.data = "[]";
      const off = on(el, "efx:data", (e) => {
        items = read5(e.detail);
      });
      const draw = ({ g, w, h, deco }) => {
        if (!items.length) return [];
        const pal = palette(el, o, 7), Q2 = o.quadrants;
        const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : { t: 6, r: 6, b: o.xLabel ? 32 : 6, l: o.yLabel ? 30 : 6 };
        const X0 = pad.l, X1 = w - pad.r, Y0 = pad.t, Y1 = h - pad.b, mx = (X0 + X1) / 2, my = (Y0 + Y1) / 2, gp = deco ? 0 : 2;
        const x = linear([dom(o.xDomain, 0), dom(o.xDomain, 1)], [X0, X1]), y = linear([dom(o.yDomain, 0), dom(o.yDomain, 1)], [Y1, Y0]);
        const cl = (v, a, b) => Math.max(Math.min(a, b), Math.min(Math.max(a, b), v));
        [[X0, Y0, 2], [mx, Y0, 0], [X0, my, 4], [mx, my, 5]].forEach(([qx, qy, c], k) => {
          const l = qx === X0 ? 0 : 1, t = qy === Y0 ? 0 : 1;
          s("rect", { x: qx + (l ? gp : 0), y: qy + (t ? gp : 0), width: mx - X0 - gp, height: my - Y0 - gp, rx: deco ? 0 : 8, fill: pal[c], "fill-opacity": deco ? 0.14 : 0.09, class: "efx-chart__fade", style: `--i:${k}` }, g);
          if (!deco && Q2[k]) s("text", { x: l ? X1 - 12 : X0 + 12, y: t ? Y1 - 12 : Y0 + 18, "text-anchor": l ? "end" : "start", class: "efx-quad__q efx-chart__fade" }, g).textContent = Q2[k];
        });
        if (!deco) {
          const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
          s("line", { x1: mx, x2: mx, y1: Y0, y2: Y1, class: "efx-chart__grid" }, ax);
          s("line", { x1: X0, x2: X1, y1: my, y2: my, class: "efx-chart__grid" }, ax);
          if (o.xLabel) s("text", { x: mx, y: h - 8, "text-anchor": "middle" }, ax).textContent = o.xLabel;
          if (o.yLabel) s("text", { x: 10, y: my, "text-anchor": "middle", transform: `rotate(-90 10 ${my})` }, ax).textContent = o.yLabel;
        }
        const groups = [...new Set(items.map((q) => q.group).filter((v) => v != null))];
        const rmax = Math.max(0, ...items.map((q) => +q.r || 0));
        const dots = items.map((q) => {
          const r = rmax ? 5 + 11 * Math.sqrt((+q.r || 0) / rmax) : deco ? 4 : 6;
          const cx = cl(x(q.x), X0 + r, X1 - r), cy = cl(y(q.y), Y0 + r, Y1 - r);
          return { q, r, cx, cy, col: pal[q.group == null ? 0 : groups.indexOf(q.group) % 7] };
        });
        dots.forEach((d, i) => {
          d.node = s("circle", { cx: d.cx, cy: d.cy, r: d.r, fill: d.col, "fill-opacity": rmax ? 0.8 : 1, stroke: "var(--sh-surface,#fff)", "stroke-width": 2, class: "efx-chart__mark efx-chart__fade", style: `--i:${i + 4}` }, g);
        });
        if (!deco) {
          const placed = [], box = (d) => ({ x: d.cx - d.r, y: d.cy - d.r, w: 2 * d.r, h: 2 * d.r });
          dots.forEach((d, i) => {
            const t = String(d.q.label == null ? "" : d.q.label), tw = t.length * 6.4 + 4, r = d.r;
            const C = [[r + 5, 0, 0], [-r - 5, 0, 1], [0, -r - 9, 2], [0, r + 10, 2], [r + 3, -r - 3, 0], [r + 3, r + 4, 0], [-r - 3, -r - 3, 1], [-r - 3, r + 4, 1], [r + 5, -14, 0], [r + 5, 14, 0], [-r - 5, -14, 1], [-r - 5, 14, 1]];
            let best, bs = 1e9;
            for (const [dx, dy, a] of C) {
              const b = { x: d.cx + dx - (a === 1 ? tw : a === 2 ? tw / 2 : 0), y: d.cy + dy - 7, w: tw, h: 14 };
              const sc = placed.filter((p) => hit(b, p)).length + dots.filter((e, k) => k !== i && hit(b, box(e))).length + (b.x < X0 || b.x + b.w > X1 || b.y < Y0 || b.y + b.h > Y1 ? 4 : 0);
              if (sc < bs) {
                bs = sc;
                best = { b, dx, dy, a };
              }
              if (!sc) break;
            }
            placed.push(best.b);
            s("text", { x: d.cx + best.dx, y: d.cy + best.dy, "text-anchor": ["start", "end", "middle"][best.a], "dominant-baseline": "middle", class: "efx-quad__l efx-chart__fade", style: `--i:${i + 6}` }, g).textContent = t;
          });
        }
        return dots.map((d, i) => {
          const q = d.q, qn = Q2[(q.y >= (dom(o.yDomain, 0) + dom(o.yDomain, 1)) / 2 ? 0 : 2) + (q.x >= (dom(o.xDomain, 0) + dom(o.xDomain, 1)) / 2 ? 1 : 0)];
          return {
            x: d.cx,
            y: d.cy,
            label: String(q.label == null ? "" : q.label),
            value: q.y,
            series: q.group == null ? "" : String(q.group),
            node: d.node,
            index: i,
            valueText: `${o.xLabel || "x"} ${nf.format(q.x)}, ${o.yLabel || "y"} ${nf.format(q.y)}`,
            hit: (px, py) => Math.hypot(px - d.cx, py - d.cy) <= d.r + 4,
            html: `<strong>${esc(q.label == null ? "" : q.label)}</strong>` + (qn ? `<span>${esc(qn)}${q.group != null ? " \xB7 " + esc(q.group) : ""}</span>` : q.group != null ? `<span>${esc(q.group)}</span>` : "") + `<span>${esc(o.xLabel || "x")} <b>${nf.format(q.x)}</b></span><span>${esc(o.yLabel || "y")} <b>${nf.format(q.y)}</b></span>` + (q.r != null ? `<span>size <b>${nf.format(q.r)}</b></span>` : "")
          };
        });
      };
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
        if (j) {
          if (jt == null) j.removeAttribute("type");
          else j.setAttribute("type", jt);
        }
      };
    }
  };

  // src/charts/chart-radar.js
  var TAU3 = Math.PI * 2;
  var chart_radar_default = {
    name: "chart-radar",
    selector: ".efx-chart-radar",
    lazy: true,
    defaults: { ...COMMON, height: 320, levels: 4, area: true, dots: true, max: "" },
    init(el, o) {
      return chart(el, o, ({ g, w, h, data, visible, colors, fmt, deco }) => {
        const n = data.labels.length;
        if (n < 3 || !visible.length) return [];
        const all = visible.flatMap((sr) => sr.values), top = Math.max(...all, 0);
        const nt = nice(0, top || 1, o.levels), fixed = Number.isFinite(parseFloat(o.max)) && parseFloat(o.max) > 0, lv = fixed ? Math.max(1, o.levels) : nt.ticks.length - 1, mx = fixed ? parseFloat(o.max) : nt.max;
        const long = Math.max(...data.labels.map((l) => l.length));
        const R = deco ? Math.min(w, h) / 2 - 2 : Math.max(20, Math.min(w / 2 - Math.min(w * 0.3, long * 6.2 + 16), h / 2 - 24));
        const cx = w / 2, cy = h / 2, ang = (k) => k * TAU3 / n;
        const pt2 = (k, r) => [cx + r * Math.sin(ang(k)), cy - r * Math.cos(ang(k))];
        const poly = (r) => "M" + data.labels.map((_, k) => pt2(k, r).join(",")).join("L") + "Z";
        const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
        for (let j = 1; j <= lv; j++) {
          s("path", { d: poly(R * j / lv), class: "efx-chart__grid", fill: "none" }, ax);
          if (!deco && j < lv) s("text", { x: cx + 4, y: cy - R * j / lv, class: "efx-rd-tick", "dominant-baseline": "central" }, ax).textContent = fmt(mx * j / lv);
        }
        data.labels.forEach((l, k) => {
          const [x, y] = pt2(k, R);
          s("line", { x1: cx, y1: cy, x2: x, y2: y, class: "efx-chart__grid" }, ax);
          if (deco) return;
          const sn = Math.sin(ang(k)), cs = Math.cos(ang(k)), [lx, ly] = pt2(k, R + 12);
          const room = Math.max(4, Math.floor((w / 2 - R * Math.abs(sn) - 12) / 6.2));
          const t = s("text", { x: lx, y: ly + cs * -3 + (cs < -0.3 ? 4 : 0), "text-anchor": Math.abs(sn) < 0.25 ? "middle" : sn > 0 ? "start" : "end", "dominant-baseline": "central" }, ax);
          t.textContent = Math.abs(sn) < 0.25 ? l : l.length > room ? l.slice(0, Math.max(2, room - 1)) + "\u2026" : l;
        });
        const marks = [];
        visible.forEach((sr, si) => {
          const col = colors[sr.index], pts = data.labels.map((_, k) => pt2(k, R * Math.min(1, Math.max(0, sr.values[k] || 0) / mx)));
          const d = "M" + pts.map((p) => p.join(",")).join("L") + "Z";
          s("path", { d, fill: o.area ? col : "none", "fill-opacity": o.area ? 0.18 : null, stroke: col, "stroke-width": 2, "stroke-linejoin": "round", class: "efx-rd-poly", style: `--i:${si};transform-origin:${cx}px ${cy}px` }, g);
          data.labels.forEach((l, k) => {
            const node = s("circle", { cx: pts[k][0], cy: pts[k][1], r: 4, fill: col, stroke: "var(--sh-surface, #fff)", "stroke-width": 1.5, class: "efx-chart__mark efx-rd-dot" + (o.dots || deco ? "" : " efx-rd-h"), style: `--i:${k + si}` }, g);
            marks.push({ x: pts[k][0], y: pts[k][1], label: l, value: sr.values[k] || 0, series: data.series.length > 1 ? sr.name : "", node, index: k, group: sr.index + 1 });
          });
        });
        return marks;
      });
    }
  };

  // src/charts/chart-scatter.js
  var isObj = (d) => d && typeof d === "object";
  var norm2 = (r, names = []) => {
    if (!isObj(r)) return [];
    r = Array.isArray(r) ? r : r.series || r.datasets || [r];
    if (!Array.isArray(r)) return [];
    if (isObj(r[0]) && !Array.isArray(r[0]) && r[0].x != null) r = [r];
    return r.filter(isObj).map((q, i) => {
      const pts = Array.isArray(q) ? q : q.points || q.data || [];
      return { n: String(!Array.isArray(q) && q.name != null ? q.name : names[i] != null ? names[i] : `Series ${i + 1}`), p: (Array.isArray(pts) ? pts : []).filter(isObj).map((d) => ({ ...d, x: +d.x, y: +d.y, r: +d.r || 1 })).filter((d) => isFinite(d.x) && isFinite(d.y)) };
    });
  };
  var nf2 = new Intl.NumberFormat(void 0, { maximumFractionDigits: 2 });
  var chart_scatter_default = {
    name: "chart-scatter",
    selector: ".efx-chart-scatter",
    lazy: true,
    defaults: { ...COMMON, xLabel: "", yLabel: "", bubble: false, connected: false },
    init(el, o) {
      const read5 = (d) => {
        try {
          return norm2(d, o.names);
        } catch (e) {
          return [];
        }
      };
      const j = el.querySelector(':scope > script[type="application/json"]');
      let sets = [];
      try {
        sets = read5(JSON.parse(j ? j.textContent : o.data));
      } catch (e) {
        console.warn("[effix] chart data", e);
      }
      const jt = j && j.getAttribute("type");
      if (j) j.setAttribute("type", "application/x-efx-json");
      const names = () => JSON.stringify({ series: sets.map((q) => ({ name: q.n, values: [] })) });
      o.source = "";
      o.data = names();
      const off = on(el, "efx:data", (e) => {
        sets = read5(e.detail);
      });
      const draw = ({ g, w, h, hidden, fmt, deco }) => {
        const colors = palette(el, o, sets.length), visible = sets.map((q, index) => ({ index, name: q.n })).filter((v) => !hidden.has(v.index));
        const all = visible.flatMap((v) => sets[v.index] ? sets[v.index].p : []);
        if (!all.length) return [];
        const rmax = Math.max(...all.map((p) => Math.abs(p.r)));
        const R = (p) => o.bubble ? Math.max(3, 24 * Math.sqrt(Math.abs(p.r) / rmax)) : 5;
        const m = deco ? o.bubble ? 24 : 8 : 0;
        const pad = deco ? { t: m, r: m, b: m, l: m } : { t: 12, r: 24, b: o.xLabel ? 46 : 30, l: o.yLabel ? 60 : 46 };
        const X = nice(Math.min(...all.map((p) => p.x)), Math.max(...all.map((p) => p.x)), Math.max(2, Math.floor(w / 80)));
        const Y = nice(Math.min(...all.map((p) => p.y)), Math.max(...all.map((p) => p.y)), Math.max(2, Math.floor(h / 50)));
        const x = linear([X.min, X.max], [pad.l, w - pad.r]), y = linear([Y.min, Y.max], [h - pad.b, pad.t]);
        if (!deco) {
          axes(g, { w, h, pad, y, ticks: Y.ticks, fmt });
          const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
          X.ticks.forEach((t) => {
            s("line", { x1: x(t), x2: x(t), y1: pad.t, y2: h - pad.b, class: "efx-chart__grid" }, ax);
            s("text", { x: x(t), y: h - pad.b + 18, "text-anchor": "middle" }, ax).textContent = nf2.format(t);
          });
          if (o.xLabel) s("text", { x: (pad.l + w - pad.r) / 2, y: h - 4, "text-anchor": "middle" }, ax).textContent = o.xLabel;
          if (o.yLabel) s("text", { x: 12, y: (pad.t + h - pad.b) / 2, "text-anchor": "middle", transform: `rotate(-90 12 ${(pad.t + h - pad.b) / 2})` }, ax).textContent = o.yLabel;
        }
        if (o.connected) visible.forEach((v, k) => {
          const q = (sets[v.index] ? sets[v.index].p : []).map((p) => [x(p.x), y(p.y)]);
          if (q.length < 2) return;
          const c = colors[v.index], e = q[q.length - 1], f = q[q.length - 2], a = Math.atan2(e[1] - f[1], e[0] - f[0]), lp = sets[v.index].p[q.length - 1];
          const back = (R(lp) + 2) * (Math.hypot(e[0] - f[0], e[1] - f[1]) > R(lp) + 12 ? 1 : 0);
          s("path", { d: "M" + q.map((p) => p.join(",")).join("L"), pathLength: 1, fill: "none", stroke: c, "stroke-width": 1.5, "stroke-opacity": 0.6, "stroke-linejoin": "round", class: "efx-chart__draw" }, g);
          s("path", { d: "M0,0L-9,-4.5L-9,4.5Z", transform: `translate(${e[0] - back * Math.cos(a)} ${e[1] - back * Math.sin(a)}) rotate(${a * 180 / Math.PI})`, fill: c, class: "efx-chart__fade", style: `--i:${k + 6}` }, g);
        });
        const multi = sets.length > 1, items = [];
        visible.forEach((v) => (sets[v.index] ? sets[v.index].p : []).forEach((p) => items.push({ p, v, cx: x(p.x), cy: y(p.y), r: R(p) })));
        const step = Math.min(1, 24 / items.length);
        [...items].sort((a, b) => b.r - a.r).forEach((t, k) => {
          t.node = s("circle", { cx: t.cx, cy: t.cy, r: t.r, fill: colors[t.v.index], "fill-opacity": o.bubble ? 0.55 : 0.85, stroke: o.bubble ? colors[t.v.index] : null, "stroke-width": 1.5, class: "efx-chart__mark efx-chart__fade", style: `--i:${k * step}` }, g);
        });
        return items.sort((a, b) => a.cx - b.cx).map((t, i) => ({
          x: t.cx,
          y: t.cy,
          value: t.p.y,
          series: multi ? t.v.name : "",
          node: t.node,
          index: i,
          label: t.p.label || `${nf2.format(t.p.x)}, ${nf2.format(t.p.y)}`,
          hit: (px, py) => Math.hypot(px - t.cx, py - t.cy) <= t.r + 3,
          html: (t.p.label ? `<strong>${esc(t.p.label)}</strong>` : "") + (multi ? `<span>${esc(t.v.name)}</span>` : "") + `<span>${esc(o.xLabel || "x")} <b>${nf2.format(t.p.x)}</b></span><span>${esc(o.yLabel || "y")} <b>${esc(fmt(t.p.y))}</b></span>` + (o.bubble ? `<span>size <b>${nf2.format(t.p.r)}</b></span>` : "")
        }));
      };
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
        if (j) {
          if (jt == null) j.removeAttribute("type");
          else j.setAttribute("type", jt);
        }
      };
    }
  };

  // src/charts/chart-spark.js
  var uid4 = 0;
  var chart_spark_default = {
    name: "chart-spark",
    selector: ".efx-chart-spark",
    lazy: true,
    defaults: { ...COMMON, height: 0, legend: false, area: true, type: "line", last: true, smooth: true },
    init(el, o) {
      const cs = getComputedStyle(el), keep = [el.style.display, el.style.width, el.style.verticalAlign];
      const inl = (cs.display.startsWith("inline") || /^inline/.test(getComputedStyle(el.parentElement || el).display)) && !o.background;
      if (inl) {
        if (cs.display === "inline") el.style.display = "inline-block";
        if (!el.style.width && el.clientWidth < 8) el.style.width = "6em";
        el.style.verticalAlign = "-.25em";
        if (!o.height) o.height = Math.round(parseFloat(cs.fontSize) * 12) / 10;
      } else if (!o.height && !el.clientHeight) o.height = 40;
      const draw = ({ g, w, h, data, visible, colors, fmt, deco }) => {
        const sr = visible[0], v = sr ? sr.values : [], n = v.length;
        if (!n) return [];
        const c = colors[sr.index], T = o.type, lo = Math.min(...v), hi = Math.max(...v), pal = palette(el, o, 7);
        const px = deco ? 0 : 3, py = deco ? 4 : 3, slot = (w - 2 * px) / n, step = Math.min(1, 12 / n);
        const x = (i) => n > 1 ? px + i * (w - 2 * px) / (n - 1) : w / 2;
        const mk = (i, node, mx, my) => ({ x: mx, y: my, label: data.labels[i], value: v[i], series: "", node, index: i, xOnly: true });
        if (T === "line") {
          const y2 = linear(lo === hi ? [lo - 1, hi + 1] : [lo, hi], [h - py, py]);
          const pts = v.map((a, i) => [x(i), y2(a)]), d = linePath(pts, o.smooth);
          if (o.area) {
            const id = "efx-sg" + ++uid4, lg = s("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, s("defs", {}, g));
            s("stop", { offset: 0, "stop-color": c, "stop-opacity": 0.35 }, lg);
            s("stop", { offset: 1, "stop-color": c, "stop-opacity": 0 }, lg);
            s("path", { d: `${d}L${x(n - 1)},${h}L${x(0)},${h}Z`, fill: `url(#${id})`, class: "efx-chart__fade" }, g);
          }
          s("path", { d, pathLength: 1, fill: "none", stroke: c, "stroke-width": 1.75, "stroke-linecap": "round", "stroke-linejoin": "round", class: "efx-chart__draw" }, g);
          if (o.last) s("circle", { cx: x(n - 1), cy: y2(v[n - 1]), r: 2.5, fill: c, class: "efx-chart__fade", style: "--i:12" }, g);
          if (deco) return [];
          return pts.map((p, i) => mk(i, s("circle", { cx: p[0], cy: p[1], r: 3.5, fill: c, class: "efx-chart__mark efx-chart-spark__pt" }, g), p[0], p[1]));
        }
        const wl = T === "win-loss", y = linear([Math.min(0, lo), Math.max(0, hi) || 1], [h - py, py]), base = wl ? h / 2 : y(0);
        return v.map((a, i) => {
          const top = wl ? a > 0 ? py : base + 1 : Math.min(y(a), base), ht = wl ? a ? (h - 2 * py) / 2 - 1 : 1 : Math.max(1, Math.abs(y(a) - base));
          const node = s("rect", { x: px + i * slot + slot * 0.15, y: wl && !a ? base - 0.5 : top, width: Math.max(1, slot * 0.7), height: ht, rx: Math.min(2, slot * 0.35), fill: wl ? a >= 0 ? o.colors.length ? pal[0] : pal[2] : o.colors.length > 1 ? pal[1] : pal[5] : c, class: "efx-chart__mark efx-chart__grow", style: `--i:${i * step}` }, g);
          return mk(i, node, px + (i + 0.5) * slot, top);
        });
      };
      draw.radius = Infinity;
      const stop = chart(el, o, draw);
      return () => {
        stop();
        if (inl) [el.style.display, el.style.width, el.style.verticalAlign] = keep;
      };
    }
  };

  // src/charts/chart-sunburst.js
  var TAU4 = Math.PI * 2;
  var build = (raw) => {
    const all = [];
    const mk = (d, parent, depth, br) => {
      var _a;
      d = d && typeof d === "object" ? d : {};
      const n = { name: String((_a = d.name) != null ? _a : ""), parent, depth, br, kids: [], i: all.length };
      all.push(n);
      (Array.isArray(d.children) ? d.children : []).forEach((c) => n.kids.push(mk(c, n, depth + 1, depth ? br : n.kids.length)));
      const sum = n.kids.reduce((a, k) => a + k.v, 0);
      n.v = sum > 0 ? sum : Math.max(0, +d.value || 0);
      n.kids = n.kids.filter((k) => k.v > 0);
      return n;
    };
    const root = mk(Array.isArray(raw) ? { children: raw } : raw, null, 0, 0);
    root.all = all;
    return root;
  };
  var read4 = (el, o) => {
    try {
      return build(JSON.parse((o.data || "").trim() || el.querySelector(':scope > script[type="application/json"]').textContent));
    } catch (e) {
      return build({});
    }
  };
  var hgt = (n) => n.kids.length ? 1 + Math.max(...n.kids.map(hgt)) : 0;
  var cut3 = (t, px) => t.length * 6.2 > px ? t.slice(0, Math.max(1, Math.floor(px / 6.2) - 1)) + "\u2026" : t;
  var chart_sunburst_default = {
    name: "chart-sunburst",
    selector: ".efx-chart-sunburst",
    lazy: true,
    defaults: { ...COMMON, height: 320, depth: 4, captions: true, legend: false },
    init(el, o) {
      let tree = read4(el, o), focus = tree, zoomed = false, ct = null;
      const off = on(el, "efx:data", (e) => {
        const d = e.detail;
        if (d && d.zoom) return;
        if (d && (d.children || d.name != null || Array.isArray(d))) tree = build(d);
        else if (d && d.tree) tree = build(d.tree);
        focus = tree;
      });
      const draw = ({ g, w, h, deco, fmt }) => {
        const D = Math.min(Math.max(1, o.depth), hgt(focus));
        if (!D) return [];
        const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 2, rc = R * (deco ? 0.15 : 0.36), t = (R - rc) / D;
        const pal = palette(el, o, tree.kids.length), anim = zoomed || !g.classList.contains("is-in");
        zoomed = false;
        const arcs = [], pos = /* @__PURE__ */ new Map(), marks = [];
        const walk = (n, a0, a1, d) => {
          let a = a0;
          n.kids.forEach((k) => {
            const b = a + (a1 - a0) * k.v / n.v;
            if ((b - a) * (rc + d * t) >= 1.5) {
              arcs.push({ n: k, a0: a, a1: b, d });
              if (d < D) walk(k, a, b, d + 1);
            }
            a = b;
          });
        };
        walk(focus, 0, TAU4, 1);
        const trail = (n) => {
          const p = [];
          for (; n && n !== focus; n = n.parent) p.unshift(n.name);
          return p.join(" \u203A ");
        };
        arcs.forEach(({ n, a0, a1, d }, j) => {
          const r0 = rc + (d - 1) * t, r1 = r0 + t, pct = Math.max(42, 100 - 15 * (n.depth - 1)), am = (a0 + a1) / 2;
          const cls = anim ? " efx-sb" : "", st = `--i:${d};--o:${cx}px ${cy}px`;
          const node = s("path", { d: arcPath(cx, cy, r0, r1, a0, a1), fill: `color-mix(in oklab, ${pal[n.br]} ${pct}%, var(--sh-surface, #fff))`, stroke: "var(--sh-surface, #fff)", "stroke-width": 1.5, class: "efx-chart__mark" + cls, style: st }, g);
          pos.set(n, j);
          const [x, y] = pt(cx, cy, (r0 + r1) / 2, am), arc = (a1 - a0) * (r0 + r1) / 2, deg = am * 180 / Math.PI;
          if (!deco && o.captions) {
            let tx = n.name, rot = deg + (deg > 90 && deg < 270 ? 180 : 0);
            if (arc - 8 < tx.length * 6.2 || t < 16) {
              rot = deg - 90 + (am > Math.PI ? 180 : 0);
              tx = arc >= 13 && t >= 34 ? cut3(tx, t - 10) : "";
              if (tx.length < 2) tx = "";
            }
            if (tx) s("text", { x, y, "text-anchor": "middle", "dominant-baseline": "middle", transform: `rotate(${rot} ${x} ${y})`, class: "efx-chart__value efx-sb__t" + (anim ? " efx-sbf" : ""), style: `${st};fill:${pct < 75 ? "var(--sh-text,#0f172a)" : "#fff"}` }, g).textContent = tx;
          }
          const rel = [];
          for (let p = n.parent; p && p !== focus; p = p.parent) rel.push(pos.get(p));
          marks.push({
            x,
            y,
            label: n.name,
            value: n.v,
            series: "",
            node,
            index: n.i,
            rel,
            html: `<strong>${esc(trail(n))}</strong><b>${esc(fmt(n.v))}</b><span>${(n.v / focus.v * 100).toFixed(1)}% of ${esc(focus.name || "total")}</span>`,
            hit: (px, py) => {
              const q = Math.hypot(px - cx, py - cy);
              let a = Math.atan2(px - cx, cy - py);
              if (a < 0) a += TAU4;
              return q >= r0 && q < r1 && a >= a0 && a < a1;
            }
          });
        });
        if (!deco) {
          const up = focus.parent, T = [0, 1, 2].map((i) => s("text", { x: cx, y: cy + (i - 1) * 16 - (i ? 0 : 2), "text-anchor": "middle", "dominant-baseline": "middle", class: i === 1 ? "efx-chart__value" : "efx-sb__s" }, g));
          const set = (a, b, c) => {
            T[0].textContent = cut3(a, rc * 2 - 6);
            T[1].textContent = cut3(b, rc * 2 - 6);
            T[2].textContent = c;
          };
          const crumbs = [];
          for (let n = up; n; n = n.parent) crumbs.unshift(n.name || "total");
          const reset = () => set(crumbs.join(" \u203A "), focus.name || "Total", fmt(focus.v));
          ct = { set: (m) => m ? set("", m.label, fmt(m.value)) : reset() };
          reset();
          if (up) {
            s("circle", { cx, cy, r: rc, fill: "transparent", style: "cursor:pointer" }, g);
            marks.push({ x: cx, y: cy, label: "Back to " + (up.name || "total"), value: focus.v, series: "", index: -1, html: `<strong>Back to ${esc(up.name || "total")}</strong>`, hit: (px, py) => Math.hypot(px - cx, py - cy) < rc });
          }
        }
        return marks;
      };
      draw.radius = 1;
      draw.onShow = (m) => {
        if (ct) ct.set(m && m.node ? m : null);
      };
      const stop = chart(el, o, draw);
      const offS = on(el, "efx:select", (e) => {
        const i = e.detail.index, n = i < 0 ? focus.parent : tree.all[i];
        if (e.target !== el || !n || n === focus || !n.kids.length) return;
        focus = n;
        zoomed = true;
        const svg = el.querySelector(".efx-chart__svg");
        svg.dispatchEvent(new Event("pointerleave"));
        el.dispatchEvent(new CustomEvent("efx:data", { detail: { zoom: 1 } }));
      });
      return () => {
        off();
        offS();
        stop();
      };
    }
  };

  // src/charts/chart-timeline.js
  var DAY2 = 864e5;
  var ROW = 30;
  var mon = new Intl.DateTimeFormat(void 0, { month: "short", timeZone: "UTC" });
  var dfmt = (t, o) => new Intl.DateTimeFormat(void 0, { timeZone: "UTC", ...o }).format(t);
  var val = (v) => typeof v === "number" ? v : /^-?[\d.]+$/.test(String(v).trim()) ? +v : Date.parse(v);
  var STEPS = [["d", 1], ["d", 2], ["w", 1], ["w", 2], ["m", 1], ["m", 2], ["m", 3], ["m", 6], ["y", 1], ["y", 2], ["y", 5], ["y", 10]];
  function dateTicks(a, b, count) {
    const span = (b - a) / DAY2;
    const [u, k] = STEPS.find(([u2, k2]) => span / (k2 * { d: 1, w: 7, m: 30.4, y: 365.25 }[u2]) <= count) || STEPS[STEPS.length - 1];
    const d = new Date(a), out = [];
    if (u === "d" || u === "w") {
      let t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      if (u === "w") t -= (d.getUTCDay() + 6) % 7 * DAY2;
      for (; t <= b; t += k * (u === "w" ? 7 : 1) * DAY2) if (t >= a) out.push(t);
    } else {
      let y = d.getUTCFullYear(), m = u === "y" ? 0 : Math.floor(d.getUTCMonth() / k) * k;
      if (u === "y") y = Math.floor(y / k) * k;
      for (let t = Date.UTC(y, m); t <= b; u === "y" ? y += k : m += k, t = Date.UTC(y, m)) if (t >= a) out.push(t);
    }
    const label = (t, i) => u === "y" ? String(new Date(t).getUTCFullYear()) : u === "m" ? new Date(t).getUTCMonth() === 0 || !i ? mon.format(t) + " " + new Date(t).getUTCFullYear() : mon.format(t) : dfmt(t, { month: "short", day: "numeric" });
    return out.map((t, i) => ({ t, text: label(t, i) }));
  }
  var readRows = (r) => {
    r = Array.isArray(r) ? r : r && (r.rows || r.data);
    return Array.isArray(r) ? r.filter((d) => d && typeof d === "object") : [];
  };
  var chart_timeline_default = {
    name: "chart-timeline",
    selector: ".efx-chart-timeline",
    lazy: true,
    defaults: { ...COMMON, legend: false, today: true, grid: true, radius: 4 },
    init(el, o) {
      let rows = [];
      const read5 = (r) => {
        try {
          rows = readRows(typeof r === "string" ? JSON.parse(r) : r);
        } catch (e) {
          rows = [];
        }
      };
      const j = el.querySelector(':scope > script[type="application/json"]');
      read5(o.data || j && j.textContent);
      const offData = on(el, "efx:data", (e) => read5(e.detail));
      let uid6 = 0;
      let items = [], lanes = [];
      const prep = () => {
        items = rows.map((d) => ({ d, a: val(d.start), b: val(d.end), g: d.group == null ? "" : String(d.group) })).filter((x) => Number.isFinite(x.a) && Number.isFinite(x.b));
        lanes = [...new Set(items.map((x) => x.g))];
        if (lanes.length > 1 || lanes[0]) items = lanes.flatMap((l) => items.filter((x) => x.g === l));
      };
      prep();
      const grouped = () => lanes.length > 1 || !!lanes[0];
      const draw = ({ g, w, h, fmt, deco }) => {
        prep();
        if (!items.length) return [];
        const dates = items.some((x2) => typeof x2.d.start === "string" && !/^-?[\d.]+$/.test(x2.d.start.trim()));
        const pal = palette(el, o, 7);
        const len = Math.max(...items.map((x2) => {
          var _a;
          return String((_a = x2.d.label) != null ? _a : "").length;
        }), ...lanes.map((l) => l.length));
        const pad = deco ? { t: 4, r: 0, b: 4, l: 0 } : { t: 16, r: 16, b: 28, l: Math.min(Math.max(48, len * 6.5 + 16), w * 0.35) };
        let lo = Math.min(...items.map((x2) => x2.a)), hi = Math.max(...items.map((x2) => x2.b));
        const pd = (hi - lo) * 0.02 || (dates ? DAY2 : 1);
        lo -= pd;
        hi += pd;
        let ticks;
        if (dates) ticks = dateTicks(lo, hi, Math.max(2, Math.floor((w - pad.l - pad.r) / 80)));
        else {
          const nc = nice(lo, hi, Math.max(2, Math.floor((w - pad.l - pad.r) / 80)));
          ticks = nc.ticks.filter((t) => t >= lo && t <= hi).map((t) => ({ t, text: fmt(t) }));
        }
        const x = linear([lo, hi], [pad.l, w - pad.r]);
        const nh = grouped() ? lanes.length : 0;
        const rh = deco ? (h - pad.t - pad.b) / (items.length + nh * 0.6) : ROW;
        let yy = pad.t, last = null;
        const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
        if (!deco) ticks.forEach((k) => {
          s("line", { x1: x(k.t), x2: x(k.t), y1: pad.t, y2: h - pad.b, class: "efx-chart__grid" }, ax);
          s("text", { x: x(k.t), y: h - pad.b + 18, "text-anchor": "middle" }, ax).textContent = k.text;
        });
        const marks = [];
        items.forEach((it, i) => {
          var _a, _b, _c;
          if (grouped() && it.g !== last) {
            last = it.g;
            if (!deco) s("text", { x: 0, y: yy + rh * 0.35, "dominant-baseline": "middle", class: "efx-tl__grp" }, ax).textContent = it.g || "\u2014";
            yy += rh * 0.6;
          }
          const d = it.d, col = d.color || pal[Math.max(0, lanes.indexOf(it.g)) % pal.length];
          const x0 = x(it.a), bw = Math.max(3, x(it.b) - x0), bh = Math.min(rh * 0.6, 20), by = yy + (rh - bh) / 2;
          const p = d.progress == null ? null : Math.max(0, Math.min(1, +d.progress > 1 ? +d.progress / 100 : +d.progress));
          const node = s("g", { class: "efx-chart__mark efx-chart__grow-x", style: `--i:${i}` }, g);
          const id = "efx-tl" + ++uid6 + "-" + i;
          s("rect", { x: x0, y: by, width: bw, height: bh, rx: o.radius, fill: col, "fill-opacity": p == null ? 1 : 0.28 }, node);
          if (p != null) {
            const cp = s("clipPath", { id }, node);
            s("rect", { x: x0, y: by, width: bw, height: bh, rx: o.radius }, cp);
            s("rect", { x: x0, y: by, width: bw * p, height: bh, fill: col, "clip-path": `url(#${id})` }, node);
          }
          if (!deco) {
            const t = s("text", { x: pad.l - 8, y: by + bh / 2, "text-anchor": "end", "dominant-baseline": "middle" }, ax);
            const mc = Math.floor((pad.l - 12) / 6.2), lb = String((_a = d.label) != null ? _a : "");
            t.textContent = lb.length > mc ? lb.slice(0, Math.max(3, mc - 1)) + "\u2026" : lb;
          }
          const dur = (it.b - it.a) / (dates ? DAY2 : 1), df = (t) => dates ? dfmt(t, { year: "numeric", month: "short", day: "numeric" }) : fmt(t);
          const y0 = yy;
          marks.push({
            x: x0 + bw / 2,
            y: by,
            label: String((_b = d.label) != null ? _b : i + 1),
            value: dur,
            node,
            index: i,
            html: `<strong>${esc((_c = d.label) != null ? _c : "")}</strong><span>${esc(df(it.a))} \u2013 ${esc(df(it.b))}</span><span>Duration <b>${esc(dates ? Math.round(dur) + (Math.round(dur) === 1 ? " day" : " days") : fmt(dur))}</b></span>` + (p == null ? "" : `<span>Progress <b>${Math.round(p * 100)}%</b></span>`),
            hit: (px, py) => py >= y0 && py <= y0 + rh && px >= pad.l - 4
          });
          yy += rh;
        });
        if (!deco && dates && o.today) {
          const now = Date.now();
          if (now >= lo && now <= hi) {
            s("line", { x1: x(now), x2: x(now), y1: pad.t, y2: h - pad.b, class: "efx-tl__today", stroke: pal[5] }, g);
            s("text", { x: x(now), y: pad.t - 4, "text-anchor": "middle", class: "efx-tl__tt", fill: pal[5] }, g).textContent = "Today";
          }
        }
        return marks;
      };
      draw.height = () => {
        prep();
        return 16 + 28 + items.length * ROW + (grouped() ? lanes.length * ROW * 0.6 : 0);
      };
      draw.radius = 1;
      const off = chart(el, o, draw);
      return () => {
        offData();
        off();
      };
    }
  };

  // src/charts/chart-treemap.js
  var PHI = (1 + Math.sqrt(5)) / 2;
  var chart_treemap_default = {
    name: "chart-treemap",
    selector: ".efx-chart-treemap",
    lazy: true,
    defaults: { ...COMMON, gap: 2, radius: 4, captions: true, sort: true },
    init(el, o) {
      const draw = ({ g, w, h, data, fmt, deco }) => {
        const sr = data.series[0];
        const items = sr ? data.labels.map((l, i) => ({ l, i, v: sr.values[i] || 0 })).filter((d) => d.v > 0) : [];
        if (!items.length) return [];
        if (o.sort) items.sort((a, b) => b.v - a.v);
        const n = items.length, tot = items.reduce((a, d) => a + d.v, 0);
        const pal = palette(el, o, data.labels.length), ramp = o.colors.length === 1;
        const fresh = !g.classList.contains("is-in");
        let x0 = 0, y0 = 0, val2 = tot, i0 = 0;
        const rects = [];
        while (i0 < n) {
          const dx = w - x0, dy = h - y0;
          let i1 = i0, sum = items[i1++].v, min = sum, max = sum;
          const k = Math.max(dy / dx, dx / dy) / (val2 * PHI);
          let beta = sum * sum * k, best = Math.max(max / beta, beta / min);
          for (; i1 < n; i1++) {
            const v = items[i1].v;
            sum += v;
            min = Math.min(min, v);
            max = Math.max(max, v);
            beta = sum * sum * k;
            const r = Math.max(max / beta, beta / min);
            if (r > best) {
              sum -= v;
              break;
            }
            best = r;
          }
          if (dx < dy) {
            const yy = y0 + dy * sum / val2;
            let x = x0;
            for (let j = i0; j < i1; j++) {
              rects[j] = [x, y0, x += items[j].v * dx / sum, yy];
            }
            y0 = yy;
          } else {
            const xx = x0 + dx * sum / val2;
            let y = y0;
            for (let j = i0; j < i1; j++) {
              rects[j] = [x0, y, xx, y += items[j].v * dy / sum];
            }
            x0 = xx;
          }
          val2 -= sum;
          i0 = i1;
        }
        return items.map((d, j) => {
          const q = o.gap / 2, [a, b, c, e] = rects[j];
          const x = a + q, y = b + q, tw = Math.max(0, c - a - o.gap), th = Math.max(0, e - b - o.gap);
          const pct = ramp ? 100 - 55 * items.filter((z) => z.v > d.v).length / Math.max(1, n - 1) : 100;
          const fill = ramp ? `color-mix(in oklab, ${pal[0]} ${pct}%, var(--sh-surface, #fff))` : pal[d.i];
          const node = s("rect", { x, y, width: tw, height: th, rx: Math.min(o.radius, tw / 2, th / 2), fill, class: "efx-chart__mark" + (fresh ? " efx-tm" : ""), style: `--i:${j}` }, g);
          if (o.captions && !deco && tw >= 44 && th >= 26) {
            const st = `pointer-events:none;fill:${pct < 70 ? "var(--sh-text,#0f172a)" : "#fff"}`;
            const t = s("text", { x: x + 7, y: y + 17, class: "efx-chart__value" + (fresh ? " efx-tm" : ""), style: `${st};--i:${j}` }, g);
            t.textContent = d.l.length * 6.6 > tw - 12 ? d.l.slice(0, Math.max(1, Math.floor((tw - 12) / 6.6) - 1)) + "\u2026" : d.l;
            if (th >= 44) {
              const u = s("text", { x: x + 7, y: y + 33, class: fresh ? "efx-tm" : "", style: `${st};opacity:.85;--i:${j}` }, g);
              u.textContent = fmt(d.v);
            }
          }
          return {
            x: x + tw / 2,
            y: y + th / 2,
            label: d.l,
            value: d.v,
            series: "",
            node,
            index: d.i,
            html: `<strong>${esc(d.l)}</strong><b>${esc(fmt(d.v))}</b><span>${(d.v / tot * 100).toFixed(1)}%</span>`,
            hit: (px, py) => px >= x && px <= x + tw && py >= y && py <= y + th
          };
        });
      };
      draw.radius = 1;
      return chart(el, o, draw);
    }
  };

  // src/charts/chart-venn.js
  var uid5 = 0;
  var norm3 = (d) => (Array.isArray(d) ? d : d && d.items || []).filter((q) => q && typeof q === "object").map((q) => ({
    sets: [...new Set((Array.isArray(q.sets) ? q.sets : String(q.sets == null ? "" : q.sets).split(/[&,|]/)).map((v) => String(v).trim()).filter(Boolean))].slice(0, 3),
    size: +q.size
  })).filter((q) => q.sets.length && q.size > 0);
  var lens = (a, b, d) => {
    if (d >= a + b) return 0;
    if (d <= Math.abs(a - b)) return Math.PI * Math.min(a, b) ** 2;
    return a * a * Math.acos((d * d + a * a - b * b) / (2 * d * a)) + b * b * Math.acos((d * d + b * b - a * a) / (2 * d * b)) - 0.5 * Math.sqrt((-d + a + b) * (d + a - b) * (d - a + b) * (d + a + b));
  };
  var gap = (a, b, area) => {
    let lo = Math.abs(a - b), hi = a + b;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      if (lens(a, b, m) > area) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  };
  var chart_venn_default = {
    name: "chart-venn",
    selector: ".efx-chart-venn",
    lazy: true,
    defaults: { ...COMMON, height: 300, legend: false, opacity: 0.4 },
    init(el, o) {
      const read5 = (d) => {
        try {
          return norm3(d);
        } catch (e) {
          return [];
        }
      };
      const j = el.querySelector(':scope > script[type="application/json"]');
      let items = [];
      try {
        items = read5(JSON.parse((o.data || "").trim() || (j ? j.textContent : "[]")));
      } catch (e) {
        console.warn("[effix] chart data", e);
      }
      const jt = j && j.getAttribute("type");
      if (j) j.setAttribute("type", "application/x-efx-json");
      o.source = "";
      o.data = "[]";
      const off = on(el, "efx:data", (e) => {
        items = read5(e.detail);
      });
      const draw = ({ g, w, h, fmt, deco }) => {
        const names = [];
        items.filter((q) => q.sets.length === 1).forEach((q) => names.includes(q.sets[0]) || names.push(q.sets[0]));
        items.forEach((q) => q.sets.forEach((n) => names.includes(n) || names.push(n)));
        names.splice(3);
        const sizeOf = (ids) => {
          const key = ids.map((i) => names[i]).sort().join("\0");
          const q = items.find((t) => t.sets.slice().sort().join("\0") === key);
          return q ? q.size : 0;
        };
        const tot = names.map((n, i) => sizeOf([i]) || Math.max(...items.filter((q) => q.sets.includes(n)).map((q) => q.size)));
        if (!names.length) return [];
        const R = tot.map((v) => Math.sqrt(v / Math.PI));
        const D = (a, b) => {
          const ov = Math.min(sizeOf([a, b]), tot[a], tot[b]);
          return ov > 0 ? gap(R[a], R[b], ov) : R[a] + R[b] + R[a] * 0.08;
        };
        const C = [[0, 0]];
        if (names.length > 1) C.push([D(0, 1), 0]);
        if (names.length > 2) {
          const ab = C[1][0], ac = D(0, 2), bc = D(1, 2), px = (ac * ac - bc * bc + ab * ab) / (2 * ab);
          C.push([px, -Math.sqrt(Math.max(0, ac * ac - px * px))]);
        }
        const x0 = Math.min(...C.map((c2, i) => c2[0] - R[i])), x1 = Math.max(...C.map((c2, i) => c2[0] + R[i]));
        const y0 = Math.min(...C.map((c2, i) => c2[1] - R[i])), y1 = Math.max(...C.map((c2, i) => c2[1] + R[i]));
        const pd = deco ? 6 : 14, k = Math.min((w - 2 * pd) / (x1 - x0), (h - 2 * pd) / (y1 - y0));
        const ox = (w - k * (x0 + x1)) / 2, oy = (h - k * (y0 + y1)) / 2;
        const c = C.map((p, i) => ({ x: ox + k * p[0], y: oy + k * p[1], r: k * R[i] }));
        const pal = palette(el, o, 3);
        const inside = (ids, px, py) => ids.every((i) => Math.hypot(px - c[i].x, py - c[i].y) <= c[i].r);
        const regions = names.map((n, i) => ({ ids: [i], size: tot[i], name: n }));
        [[0, 1], [0, 2], [1, 2], [0, 1, 2]].forEach((ids) => {
          if (ids.every((i) => i < names.length) && sizeOf(ids) > 0) regions.push({ ids, size: sizeOf(ids), name: ids.map((i) => names[i]).join(" \u2229 ") });
        });
        const id = "efx-v" + ++uid5;
        c.forEach((q, i) => {
          regions[i].node = s("circle", { cx: q.x, cy: q.y, r: q.r, fill: pal[i], "fill-opacity": o.opacity, stroke: pal[i], "stroke-width": 1.5, class: "efx-chart__mark efx-venn__c efx-chart__fade", style: `--i:${i * 2}` }, g);
        });
        regions.slice(names.length).forEach((r, m) => {
          const [a, b, d] = r.ids, cp = (n, t) => {
            const p = s("clipPath", { id: `${id}-${m}-${n}` }, g);
            s("circle", { cx: c[t].x, cy: c[t].y, r: c[t].r }, p);
            return `url(#${id}-${m}-${n})`;
          };
          const host = d == null ? g : s("g", { "clip-path": cp(1, d) }, g);
          r.node = s("circle", { cx: c[a].x, cy: c[a].y, r: c[a].r, "clip-path": cp(0, b), class: "efx-chart__mark efx-venn__x" }, host);
        });
        if (!deco) {
          const txt = (x, y, cls, str, i, dy) => {
            const t = s("text", { x, y: y + (dy || 0), "text-anchor": "middle", "dominant-baseline": "middle", class: cls + " efx-chart__fade", style: `--i:${i}` }, g);
            t.textContent = str;
          };
          c.forEach((q, i) => {
            const oth = c.filter((_, j2) => j2 !== i), mx = oth.reduce((a, p) => a + p.x, 0) / (oth.length || 1), my = oth.reduce((a, p) => a + p.y, 0) / (oth.length || 1);
            const dx = q.x - mx, dy = q.y - my, l = oth.length ? Math.hypot(dx, dy) || 1 : 1, sh = oth.length ? q.r * (names.length > 2 ? 0.5 : 0.42) : 0;
            const lx = q.x + (oth.length ? dx / l : 0) * sh, ly = q.y + (oth.length ? dy / l : 0) * sh;
            txt(lx, ly, "efx-chart__value", names[i], i + 3, -7);
            txt(lx, ly, "efx-venn__n", fmt(tot[i]), i + 3, 9);
          });
          regions.slice(names.length).forEach((r, m) => {
            let px, py;
            if (r.ids.length === 3) {
              px = (c[0].x + c[1].x + c[2].x) / 3;
              py = (c[0].y + c[1].y + c[2].y) / 3;
            } else {
              const [a, b] = r.ids, d = Math.hypot(c[b].x - c[a].x, c[b].y - c[a].y) || 1, ux = (c[b].x - c[a].x) / d, uy = (c[b].y - c[a].y) / d;
              const t = d <= Math.abs(c[a].r - c[b].r) ? c[a].r < c[b].r ? 0 : d : (d - c[b].r + c[a].r) / 2;
              px = c[a].x + ux * t;
              py = c[a].y + uy * t;
              const third = names.length > 2 && sizeOf([0, 1, 2]) > 0 ? c[3 - a - b] : null;
              if (third) {
                const ex = px - third.x, ey = py - third.y, el2 = Math.hypot(ex, ey) || 1, wd = Math.max(0, Math.min(c[a].r + c[b].r - d, 2 * Math.min(c[a].r, c[b].r)));
                px += ex / el2 * wd * 0.5;
                py += ey / el2 * wd * 0.5;
              }
            }
            txt(px, py, "efx-chart__value efx-venn__i", fmt(r.size), names.length + 3 + m);
          });
        }
        return regions.map((r, i) => ({
          x: r.ids.reduce((a, t) => a + c[t].x, 0) / r.ids.length,
          y: r.ids.reduce((a, t) => a + c[t].y, 0) / r.ids.length,
          label: r.name,
          value: r.size,
          node: r.node,
          index: i,
          hit: (px, py) => inside(r.ids, px, py) && !regions.some((q) => q.ids.length > r.ids.length && q.ids.every((t) => r.ids.includes(t)) && inside(q.ids, px, py))
        }));
      };
      draw.radius = 1e-3;
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
        if (j) {
          if (jt == null) j.removeAttribute("type");
          else j.setAttribute("type", jt);
        }
      };
    }
  };

  // src/charts/chart-waterfall.js
  var chart_waterfall_default = {
    name: "chart-waterfall",
    selector: ".efx-chart-waterfall",
    lazy: true,
    defaults: { ...COMMON, totals: [], values: true, connectors: true, grid: true, radius: 3 },
    init(el, o) {
      return chart(el, o, ({ g, w, h, data, colors, fmt, deco }) => {
        const vals = data.series[0] ? data.series[0].values : [];
        const n = vals.length;
        if (!n) return [];
        const tot = new Set(o.totals.map((t) => {
          const k = parseInt(t, 10);
          return k < 0 ? n + k : k;
        }));
        const sg = (v) => (v < 0 ? "\u2212" : v > 0 ? "+" : "") + fmt(Math.abs(v));
        const [cT, cU, cD] = o.colors.length ? [o.colors[0], o.colors[1] || o.colors[0], o.colors[2] || o.colors[0]] : [colors[0], cssVar(el, "--sh-success", "#10b981"), cssVar(el, "--sh-danger", "#ef4444")];
        let run = 0;
        const bars = vals.map((v, i) => {
          const isT = tot.has(i), from = isT ? 0 : run;
          if (isT) run = v || run;
          else run += v;
          return { v, isT, from, to: run, d: isT ? run : v, run };
        });
        const all = bars.flatMap((b2) => [b2.from, b2.to]).concat(0);
        const pad = deco ? { t: 4, r: 0, b: 4, l: 0 } : { t: 18, r: 8, b: 28, l: 44 };
        const sc = nice(Math.min(...all), Math.max(...all), Math.max(2, Math.floor(h / 50)));
        const y = linear([sc.min, sc.max], [h - pad.b, pad.t]);
        const b = band(n, [pad.l, w - pad.r], 0.3);
        if (!deco) axes(g, { w, h, pad, y, ticks: sc.ticks, labels: data.labels, x: (i) => b.x(i) + b.bw / 2, fmt, grid: o.grid, rotate: b.step < 44 });
        if (o.connectors && !deco) bars.slice(1).forEach((k, i) => s("line", { x1: b.x(i) + b.bw, x2: b.x(i + 1), y1: y(bars[i].to), y2: y(bars[i].to), class: "efx-chart__fade efx-wf__c", style: `--i:${i}` }, g));
        return bars.map((k, i) => {
          const col = k.isT ? cT : k.v < 0 ? cD : cU, y0 = y(k.from), y1 = y(k.to), top = Math.min(y0, y1), bh = Math.max(1, Math.abs(y1 - y0));
          const node = s("rect", { x: b.x(i), y: top, width: b.bw, height: bh, rx: Math.min(o.radius, b.bw / 2, bh / 2), fill: col, class: "efx-chart__mark efx-chart__grow", style: `--i:${i}` }, g);
          if (o.values && !deco && b.bw > 18) {
            const up = k.isT || k.v >= 0;
            s("text", { x: b.x(i) + b.bw / 2, y: up ? top - 6 : top + bh + 13, "text-anchor": "middle", class: "efx-chart__value efx-chart__fade", style: `--i:${i}` }, g).textContent = k.isT ? fmt(k.d) : sg(k.v);
          }
          return {
            x: b.x(i) + b.bw / 2,
            y: top,
            label: data.labels[i],
            value: k.d,
            node,
            index: i,
            html: `<strong>${esc(data.labels[i])}</strong>` + (k.isT ? "" : `<span>Change <b>${esc(sg(k.v))}</b></span>`) + `<span>Total <b>${esc(fmt(k.run))}</b></span>`,
            hit: (px, py) => px >= b.x(i) && px <= b.x(i) + b.bw && py >= pad.t && py <= h - pad.b
          };
        });
      });
    }
  };

  // src/effix-entry.js
  var defs = [chart_bar_default, chart_box_default, chart_bullet_default, chart_candle_default, chart_combo_default, chart_flow_default, chart_funnel_default, chart_gauge_default, chart_heatmap_default, chart_histogram_default, chart_line_default, chart_pie_default, chart_progress_default, chart_pyramid_default, chart_quadrant_default, chart_radar_default, chart_scatter_default, chart_spark_default, chart_sunburst_default, chart_timeline_default, chart_treemap_default, chart_venn_default, chart_waterfall_default];
  if (window.Effix) window.Effix.charts = lib_exports;
  else window.EffixChartKit = lib_exports;
  if (window.Effix) window.Effix.define(defs);
  else (window.EffixPending = window.EffixPending || []).push(...defs);
})();
