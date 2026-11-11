/*! Effix Diagrams v0.3.0 | MIT | https://github.com/asticore/effix */
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
    const f2 = (v) => r0 + (v - d0) * k;
    f2.invert = (r) => d0 + (r - r0) / (k || 1);
    return f2;
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
    const wrap3 = document.createElement("div");
    wrap3.className = "efx-chart__wrap" + (deco ? " efx-chart__wrap--bg" : "");
    if (deco) wrap3.setAttribute("aria-hidden", "true");
    const svg = s("svg", { class: "efx-chart__svg", role: deco ? null : "img", "aria-labelledby": deco ? null : id + "-t", focusable: "false" });
    const title = s("title", { id: id + "-t" }, svg);
    wrap3.appendChild(svg);
    const tip = document.createElement("div");
    tip.className = "efx-chart__tip";
    tip.setAttribute("role", "status");
    tip.hidden = true;
    const legend = document.createElement("div");
    legend.className = "efx-chart__legend";
    const sr = document.createElement("ul");
    sr.className = "efx-chart__sr";
    if (deco) el.prepend(wrap3);
    else el.append(wrap3, tip, legend, sr);
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
      offs.forEach((f2) => f2());
      stopVis();
      onResize.cancel();
      if (ro) ro.disconnect();
      wrap3.remove();
      tip.remove();
      legend.remove();
      sr.remove();
      el.classList.remove("efx-chart");
      el.style.position = restore.pos;
      el.style.isolation = restore.iso;
    };
  }

  // src/charts/diagram-cycle.js
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
  var descs = (d) => {
    const a = Array.isArray(d) ? d : d && (d.items || d.descriptions);
    return Array.isArray(a) ? a.map((q) => {
      var _a, _b;
      return (_b = q && typeof q === "object" ? (_a = q.desc) != null ? _a : q.description : q) != null ? _b : "";
    }) : [];
  };
  var diagram_cycle_default = {
    name: "diagram-cycle",
    selector: ".efx-diagram-cycle",
    lazy: true,
    defaults: { ...COMMON, height: 340, legend: false, descriptions: [], center: "", numbers: true, flow: true, start: 0 },
    init(el, o) {
      let raw = null;
      try {
        const j = el.querySelector(':scope > script[type="application/json"]');
        const t = (o.data || "").trim() || (j ? j.textContent : "");
        if (t && /^[[{]/.test(t)) raw = JSON.parse(t);
      } catch (e) {
      }
      const off = on(el, "efx:data", (e) => {
        raw = e.detail;
      });
      const draw = ({ g, w, h, data, deco }) => {
        const L = data.labels, n = L.length;
        if (!n) return [];
        const D = descs(raw), pal = palette(el, o, n), nr = deco ? 12 : 20;
        const lw = deco ? 0 : Math.min(120, w * 0.24), top = deco ? 0 : 22;
        const R = Math.max(24, Math.min(w / 2 - nr - lw - 6, h / 2 - nr - top));
        const cx = w / 2, cy = h / 2, a0 = o.start * Math.PI / 180, step = Math.PI * 2 / n;
        const ang = (i) => a0 + i * step;
        const P = (i) => pt(cx, cy, R, ang(i));
        if (!deco) {
          s("circle", { cx, cy, r: R, fill: "none", class: "efx-chart__grid efx-chart__fade" }, g);
          if (o.center) {
            const ls = String(o.center).split("|");
            const t = s("text", { x: cx, y: cy - (ls.length - 1) * 9, "text-anchor": "middle", class: "efx-chart__value efx-cyc__c efx-chart__fade" }, g);
            ls.forEach((l, q) => {
              const sp = s("tspan", { x: cx, dy: q ? 18 : 0, "dominant-baseline": "middle" }, t);
              sp.textContent = l.trim();
            });
          }
        }
        if (n > 1) for (let i = 0; i < n; i++) {
          const gapA = (nr + 7) / R, s0 = ang(i) + gapA, s1 = ang(i + 1) - gapA;
          if (s1 <= s0) continue;
          const [x0, y0] = pt(cx, cy, R, s0), [x1, y1] = pt(cx, cy, R, s1);
          const col = "var(--efx-chart-text)";
          s("path", { d: `M${x0},${y0}A${R},${R} 0 ${s1 - s0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`, fill: "none", stroke: col, "stroke-width": 1.75, "stroke-linecap": "round", class: "efx-cyc__a efx-chart__fade" + (o.flow && !deco ? " efx-cyc__flow" : ""), style: `--i:${i + n}` }, g);
          const tx = Math.cos(s1), ty = Math.sin(s1), px = -ty, py = tx, k = 5;
          s("path", { d: `M${x1 + tx * 2},${y1 + ty * 2}L${x1 - tx * k + px * k * 0.8},${y1 - ty * k + py * k * 0.8}M${x1 + tx * 2},${y1 + ty * 2}L${x1 - tx * k - px * k * 0.8},${y1 - ty * k - py * k * 0.8}`, fill: "none", stroke: col, "stroke-width": 1.75, "stroke-linecap": "round", class: "efx-chart__fade", style: `--i:${i + n}` }, g);
        }
        return L.map((label, i) => {
          const [x, y] = P(i), sn = Math.sin(ang(i)), cs = -Math.cos(ang(i));
          const node = s("circle", { cx: x, cy: y, r: nr, fill: pal[i], stroke: "var(--sh-surface,#fff)", "stroke-width": 2, class: "efx-chart__mark efx-chart__fade", style: `--i:${i}` }, g);
          if (!deco) {
            const t = s("text", { x, y, "text-anchor": "middle", "dominant-baseline": "central", class: "efx-cyc__num efx-chart__fade", style: `--i:${i}` }, g);
            t.textContent = o.numbers ? i + 1 : "";
            const anchor = sn > 0.3 ? "start" : sn < -0.3 ? "end" : "middle", ox = x + sn * (nr + 8) * (anchor === "middle" ? 0 : 1);
            const ls = wrap(label, Math.max(8, Math.floor(lw / 6.6))), lh = 14;
            const ly = cs < -0.3 ? y - nr - 10 - (ls.length - 1) * lh : cs > 0.3 ? y + nr + 14 : y - (ls.length - 1) * lh / 2;
            const e = s("text", { x: ox, y: ly, "text-anchor": anchor, "dominant-baseline": "middle", class: "efx-cyc__l efx-chart__fade", style: `--i:${i + 1}` }, g);
            ls.forEach((l, q) => {
              const sp = s("tspan", { x: ox, dy: q ? lh : 0 }, e);
              sp.textContent = l;
            });
          }
          const d = D[i] ? String(D[i]) : o.descriptions[i] || "";
          return {
            x,
            y,
            label,
            value: i + 1,
            valueText: d || `Step ${i + 1} of ${n}`,
            node,
            index: i,
            hit: (px, py) => Math.hypot(px - x, py - y) <= nr + 8,
            html: `<strong>${i + 1}. ${esc(label)}</strong>` + (d ? `<span style="white-space:normal;max-inline-size:16rem">${esc(d)}</span>` : "")
          };
        });
      };
      draw.radius = 1e-3;
      const stop = chart(el, o, draw);
      return () => {
        off();
        stop();
      };
    }
  };

  // src/charts/diagram-fishbone.js
  var own = (li) => [...li.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
  var norm = (d) => {
    d = d && typeof d === "object" ? d : {};
    return { problem: d.problem != null ? String(d.problem) : "", causes: (Array.isArray(d.causes) ? d.causes : []).map((c) => ({ name: String(c && c.name != null ? c.name : c || ""), items: (c && c.items || []).map(String) })) };
  };
  var wrap2 = (t, n) => {
    const out = [];
    let cur = "";
    String(t).split(/\s+/).forEach((w) => {
      if (cur && (cur + " " + w).length > n) {
        out.push(cur);
        cur = w;
      } else cur = (cur + " " + w).trim();
    });
    out.push(cur);
    return out.slice(0, 3);
  };
  var diagram_fishbone_default = {
    name: "diagram-fishbone",
    selector: ".efx-diagram-fishbone",
    lazy: true,
    defaults: { problem: "", data: "", colors: [], title: "" },
    init(el, o) {
      const ul = el.querySelector(":scope > ul");
      const read = () => {
        try {
          const j = el.querySelector(':scope > script[type="application/json"]');
          if (o.data.trim() || j) return norm(JSON.parse(o.data.trim() || j.textContent));
        } catch (e) {
          console.warn("[effix] fishbone data", e);
        }
        return { problem: "", causes: ul ? [...ul.children].map((li) => ({ name: own(li), items: [...li.querySelectorAll("li")].map(own).filter(Boolean) })) : [] };
      };
      let d = read();
      if (o.problem) d.problem = o.problem;
      let hidden = false;
      if (ul && !ul.hidden) {
        ul.hidden = true;
        hidden = true;
      }
      const prevRole = el.getAttribute("role"), prevLabel = el.getAttribute("aria-label");
      if (prevRole == null) el.setAttribute("role", "group");
      if (prevLabel == null) el.setAttribute("aria-label", o.title || "Cause and effect diagram: " + d.problem);
      el.classList.add("efx-diagram");
      const svg = s("svg", { class: "efx-diagram__fish" });
      const sr = document.createElement("ul");
      sr.className = "efx-chart__sr efx-diagram__sr";
      el.append(svg, sr);
      let lastW = 0;
      const render = () => {
        const { problem, causes } = d, n = causes.length, k = Math.max(1, Math.ceil(n / 2)), HW = 150;
        lastW = el.clientWidth || 720;
        const LW = Math.max(lastW, 40 + HW + k * 165), slot = (LW - HW - 50) / k;
        const M = Math.max(2, ...causes.map((c) => c.items.length)), bh = Math.max(120, M * 25 + 46), dx = bh * 0.42, sy = bh + 46, H = sy * 2;
        const colors = palette(el, o, Math.max(n, 1)), maxC = Math.max(8, Math.floor((slot - 34) / 6.3));
        svg.setAttribute("viewBox", `0 0 ${LW} ${H}`);
        svg.textContent = "";
        s("line", { class: "efx-diagram__spine", x1: 16, y1: sy, x2: LW - HW, y2: sy }, svg);
        const head = s("g", { class: "efx-diagram__head" }, svg);
        s("rect", { x: LW - HW, y: sy - 36, width: HW, height: 72, rx: 14 }, head);
        const lines = wrap2(problem, 17), t = s("text", { x: LW - HW / 2, y: sy - (lines.length - 1) * 8 }, head);
        lines.forEach((ln, i) => {
          const sp = s("tspan", { x: LW - HW / 2, dy: i ? 16 : 0 }, t);
          sp.textContent = ln;
        });
        causes.forEach((c, i) => {
          const top = i % 2 === 0, j = i >> 1, sg = top ? -1 : 1, xa = LW - HW - 14 - j * slot, xe = xa - dx, ye = sy + sg * bh;
          const g = s("g", { class: "efx-diagram__bone", "data-i": i, tabindex: 0, role: "img", "aria-label": `${c.name}: ${c.items.join(", ")}`, style: `--c:${colors[i]};--i:${i}` }, svg);
          s("path", { class: "efx-diagram__hit", d: `M${xa},${sy}L${xe},${ye}` }, g);
          s("path", { class: "efx-diagram__bone-line", d: `M${xa},${sy}L${xe},${ye}` }, g);
          c.items.forEach((it, m) => {
            const tt = (m + 1) / (c.items.length + 1), bx = xa - dx * tt, by = sy + sg * bh * tt;
            s("line", { class: "efx-diagram__tick", x1: bx - 9, y1: by, x2: bx, y2: by }, g);
            const tx = s("text", { class: "efx-diagram__item", x: bx - 12, y: by }, g);
            tx.textContent = it.length > maxC ? it.slice(0, maxC - 1) + "\u2026" : it;
            if (it.length > maxC) s("title", {}, tx).textContent = it;
          });
          const w = Math.min(slot - 12, c.name.length * 7.6 + 26);
          const lb = s("g", { class: "efx-diagram__cat" }, g);
          s("rect", { x: xe - w / 2, y: ye - 14 + sg * 14, width: w, height: 28, rx: 14 }, lb);
          const ct = s("text", { x: xe, y: ye + sg * 14 }, lb);
          ct.textContent = c.name;
        });
        sr.innerHTML = `<li>${esc(problem)}</li>` + causes.map((c) => `<li>${esc(c.name)}: ${esc(c.items.join(", "))}</li>`).join("");
      };
      render();
      const nodeOf = (t) => t.closest && t.closest(".efx-diagram__bone");
      const hl = (g) => {
        svg.classList.toggle("is-focus", !!g);
        svg.querySelectorAll(".efx-diagram__bone").forEach((b) => b.classList.toggle("is-hl", b === g));
      };
      const select = (g) => {
        const c = d.causes[+g.dataset.i];
        el.dispatchEvent(new CustomEvent("efx:select", { bubbles: true, detail: { index: +g.dataset.i, label: c.name, items: c.items, problem: d.problem } }));
      };
      const resize = rafThrottle(() => {
        if (Math.abs(el.clientWidth - lastW) > 1) render();
      });
      const offs = [
        on(svg, "pointerover", (e) => hl(nodeOf(e.target))),
        on(svg, "pointerleave", () => hl(null)),
        on(svg, "focusin", (e) => hl(nodeOf(e.target))),
        on(svg, "focusout", () => hl(null)),
        on(svg, "click", (e) => {
          const g = nodeOf(e.target);
          g && select(g);
        }),
        on(svg, "keydown", (e) => {
          const g = nodeOf(e.target);
          if (g && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            select(g);
          }
        }),
        on(el, "efx:data", (e) => {
          d = norm(e.detail);
          render();
        })
      ];
      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
      ro && ro.observe(el);
      return () => {
        resize.cancel();
        ro && ro.disconnect();
        offs.forEach((f2) => f2());
        svg.remove();
        sr.remove();
        if (hidden) ul.hidden = false;
        if (prevRole == null) el.removeAttribute("role");
        if (prevLabel == null) el.removeAttribute("aria-label");
        el.classList.remove("efx-diagram");
      };
    }
  };

  // src/charts/diagram-flow.js
  var OPS = /^([^<~=>:\s][^<~=>:]*?)\s*(<>|~>|=>|>)\s*([^:]+?)\s*(?::(.*))?$/;
  var CARD = /^(1|n|m|\*|0n|01)$/i;
  var NORM = { r: [1, 0], l: [-1, 0], b: [0, 1], t: [0, -1] };
  var OPP = { r: "l", l: "r", t: "b", b: "t" };
  var f = (p) => p[0].toFixed(1) + "," + p[1].toFixed(1);
  var dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  var uid2 = 0;
  function rounded(P, rad = 10) {
    let d = "M" + f(P[0]);
    for (let i = 1; i < P.length - 1; i++) {
      const a = P[i - 1], b = P[i], c = P[i + 1], l1 = dist(a, b), l2 = dist(b, c), r = Math.min(rad, l1 / 2, l2 / 2);
      if (!l1 || !l2) continue;
      d += "L" + f([b[0] + (a[0] - b[0]) * r / l1, b[1] + (a[1] - b[1]) * r / l1]) + "Q" + f(b) + " " + f([b[0] + (c[0] - b[0]) * r / l2, b[1] + (c[1] - b[1]) * r / l2]);
    }
    return d + "L" + f(P[P.length - 1]);
  }
  function rankOf(ids, edges) {
    const out = new Map(ids.map((i) => [i, []])), st = /* @__PURE__ */ new Map(), order = [], back = /* @__PURE__ */ new Set();
    edges.forEach((e) => out.has(e.a) && out.has(e.b) && out.get(e.a).push(e.b));
    const dfs = (u) => {
      st.set(u, 1);
      for (const v of out.get(u)) {
        if (st.get(v) === 1) back.add(u + ">" + v);
        else if (!st.get(v)) dfs(v);
      }
      st.set(u, 2);
      order.push(u);
    };
    ids.forEach((u) => st.get(u) || dfs(u));
    const r = new Map(ids.map((i) => [i, 0]));
    order.reverse().forEach((u) => out.get(u).forEach((v) => back.has(u + ">" + v) || r.set(v, Math.max(r.get(v), r.get(u) + 1))));
    return { r, back };
  }
  var diagram_flow_default = {
    name: "diagram-flow",
    selector: ".efx-diagram-flow",
    lazy: true,
    defaults: { edges: "", layout: "", direction: "TB", cols: 0, lanes: [], route: "orth", flow: false, colors: [], title: "" },
    init(el, o) {
      const undo = [], set = (n, k, v) => {
        undo.push([n, k, n.style[k]]);
        n.style[k] = v;
      };
      const find = (id) => {
        try {
          return el.querySelector("#" + CSS.escape(id));
        } catch (e) {
          return null;
        }
      };
      const nameOf = (n) => (n.getAttribute("aria-label") || (n.querySelector(":scope > b") || n).textContent).replace(/\s+/g, " ").trim();
      const E = String(o.edges).split("|").map((p) => {
        const m = p.trim().match(OPS);
        return m && { a: m[1], b: m[3], op: m[2], label: (m[4] || "").trim() };
      }).filter(Boolean);
      const byId = /* @__PURE__ */ new Map(), nodes = /* @__PURE__ */ new Set();
      E.forEach((e) => [e.a, e.b].forEach((id) => {
        const n = find(id);
        if (n) {
          byId.set(id, n);
          nodes.add(n);
        }
      }));
      el.querySelectorAll("[data-efx-shape],[data-efx-lane]").forEach((n) => {
        nodes.add(n);
        if (n.id) byId.set(n.id, n);
      });
      const edges = E.filter((e) => byId.has(e.a) && byId.has(e.b) && e.a !== e.b);
      let restore = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restore = true;
      }
      el.style.isolation = "isolate";
      const added = [];
      const addCls = (n, c) => {
        if (!n.classList.contains(c)) {
          n.classList.add(c);
          added.push([n, c]);
        }
      };
      addCls(el, "efx-diagram");
      const gridify = (c, cols) => {
        set(c, "display", "grid");
        set(c, "gridTemplateColumns", `repeat(${cols},minmax(0,1fr))`);
        set(c, "justifyItems", "center");
        set(c, "alignItems", "center");
      };
      const cell = (n, c, r, cs = 1, rs = 1) => {
        set(n, "gridColumn", `${c} / span ${cs}`);
        set(n, "gridRow", `${r} / span ${rs}`);
      };
      const lanes = o.lanes;
      if (lanes.length || o.layout === "auto") {
        const ids = [...byId.keys()].filter((i) => byId.get(i).parentElement === el);
        const { r, back } = rankOf(ids, edges);
        const R = Math.max(0, ...r.values());
        const layers = Array.from({ length: R + 1 }, () => []);
        ids.forEach((i) => layers[r.get(i)].push(i));
        const pos = /* @__PURE__ */ new Map(), fw = edges.filter((e) => !back.has(e.a + ">" + e.b) && r.has(e.a) && r.has(e.b));
        const place = () => layers.forEach((L) => L.forEach((id, k) => pos.set(id, k)));
        const order = (li, down) => {
          const L = layers[li], b = new Map(L.map((id) => {
            const ns = fw.map((e) => down ? e.b === id ? e.a : null : e.a === id ? e.b : null).filter((x) => x != null);
            return [id, ns.length ? ns.reduce((a, x) => a + pos.get(x), 0) / ns.length : pos.get(id)];
          }));
          L.sort((x, y) => b.get(x) - b.get(y));
          L.forEach((id, k) => pos.set(id, k));
        };
        place();
        for (let i = 0; i < 3; i++) {
          for (let l = 1; l <= R; l++) order(l, true);
          for (let l = R - 1; l >= 0; l--) order(l, false);
        }
        if (lanes.length) {
          const laneIdx = (n) => {
            const v = n.dataset.efxLane;
            const i = lanes.indexOf(v);
            return i >= 0 ? i : Math.max(0, (parseInt(v, 10) || 1) - 1);
          };
          let cols = R + 1;
          byId.forEach((n, id) => {
            var _a;
            const m = (n.dataset.efxCell || "").split(",").map((x) => parseInt(x, 10));
            const c = m[0] || ((_a = r.get(id)) != null ? _a : 0) + 1;
            cols = Math.max(cols, c);
            cell(n, c, laneIdx(n) + 1);
          });
          gridify(el, cols);
          set(el, "gridTemplateRows", `repeat(${lanes.length},minmax(var(--efx-lane-h,5.5rem),auto))`);
          addCls(el, "efx-diagram--lanes");
        } else {
          const LR = /^l/i.test(o.direction), mx = Math.max(...layers.map((L) => L.length));
          ids.forEach((id) => {
            const L = layers[r.get(id)], k = pos.get(id), at = 1 + (mx - L.length) + 2 * k;
            LR ? cell(byId.get(id), r.get(id) + 1, at, 1, 2) : cell(byId.get(id), at, r.get(id) + 1, 2, 1);
          });
          gridify(el, LR ? R + 1 : mx * 2);
          if (LR) set(el, "gridTemplateRows", `repeat(${mx * 2},auto)`);
        }
      } else {
        [el, ...el.querySelectorAll("[data-efx-group]")].forEach((c) => {
          const kids = [...c.children].filter((k) => k.dataset.efxCell);
          let cols = parseInt(c.dataset.efxCols, 10) || o.cols * (c === el) || 0;
          kids.forEach((k) => {
            const m = k.dataset.efxCell.split(",").map((x) => parseInt(x, 10));
            cell(k, m[0] || 1, m[1] || 1, m[2] || 1, m[3] || 1);
            cols = Math.max(cols, (m[0] || 1) + (m[2] || 1) - 1);
          });
          if (cols) gridify(c, cols);
        });
      }
      const colors = palette(el, o, 7);
      nodes.forEach((n) => {
        addCls(n, "efx-diagram__node");
        const t = n.dataset.efxTone;
        if (t && /^[1-7]$/.test(t)) set(n, "--efx-n", colors[t - 1]);
        if (!n.hasAttribute("tabindex") && !n.matches("a[href],button,input,select,textarea,[contenteditable]")) {
          n.setAttribute("tabindex", "0");
          undo.push([n, "tabindex", null]);
        }
      });
      const attrs = [];
      const setAttr = (n, k, v) => {
        if (!n.hasAttribute(k)) {
          n.setAttribute(k, v);
          attrs.push([n, k]);
        }
      };
      setAttr(el, "role", "group");
      setAttr(el, "aria-label", o.title || "Diagram");
      const svg = s("svg", { class: "efx-diagram__svg", "aria-hidden": "true" });
      const mid = "efx-dg-" + ++uid2;
      el.appendChild(svg);
      const sr = document.createElement("ul");
      sr.className = "efx-chart__sr efx-diagram__sr";
      sr.innerHTML = edges.map((e) => `<li>${esc(nameOf(byId.get(e.a)))} \u2192 ${esc(nameOf(byId.get(e.b)))}${e.label ? " (" + esc(e.label) + ")" : ""}</li>`).join("");
      el.appendChild(sr);
      const ed = [];
      let hl = null;
      const apply = () => {
        el.classList.toggle("is-focus", !!hl);
        nodes.forEach((n) => n.classList.toggle("is-hl", !!hl && hl.n.has(n)));
        ed.forEach((x) => x.g.classList.toggle("is-hl", !!hl && hl.e.has(x.i)));
      };
      const focusNode = (n) => {
        const hn = /* @__PURE__ */ new Set([n]), he = /* @__PURE__ */ new Set();
        edges.forEach((e, i) => {
          if (byId.get(e.a) === n || byId.get(e.b) === n) {
            he.add(i);
            hn.add(byId.get(e.a));
            hn.add(byId.get(e.b));
          }
        });
        hl = { n: hn, e: he };
        apply();
      };
      const clear = () => {
        if (hl) {
          hl = null;
          apply();
        }
      };
      const draw = () => {
        const r = el.getBoundingClientRect(), ox = r.left + el.clientLeft, oy = r.top + el.clientTop, W = el.clientWidth, H = el.clientHeight;
        const rc = /* @__PURE__ */ new Map();
        byId.forEach((n, id) => {
          const q = n.getBoundingClientRect();
          rc.set(id, { l: q.left - ox, t: q.top - oy, r: q.right - ox, b: q.bottom - oy, cx: (q.left + q.right) / 2 - ox, cy: (q.top + q.bottom) / 2 - oy });
        });
        const cs = getComputedStyle(el);
        const tracks = lanes.length ? cs.gridTemplateRows.split(" ").map(parseFloat) : [];
        const gap = parseFloat(cs.rowGap) || 0, pt2 = parseFloat(cs.paddingTop) || 0, pl = parseFloat(cs.paddingLeft) || 0;
        const tone = edges.map((e) => getComputedStyle(byId.get(e.a)).getPropertyValue("--efx-n").trim());
        const sides = edges.map((e) => {
          const a = rc.get(e.a), b = rc.get(e.b), gx = Math.max(b.l - a.r, a.l - b.r), gy = Math.max(b.t - a.b, a.t - b.b);
          const h = gx > 0 && gx >= gy ? true : gy > 0 ? false : Math.abs(b.cx - a.cx) > Math.abs(b.cy - a.cy);
          const sa = h ? b.cx >= a.cx ? "r" : "l" : b.cy >= a.cy ? "b" : "t";
          return [sa, OPP[sa]];
        });
        const ports = /* @__PURE__ */ new Map();
        edges.forEach((e, i) => [[e.a, 0, e.b], [e.b, 1, e.a]].forEach(([id, end, other]) => {
          const k = id + ":" + sides[i][end], o2 = rc.get(other), v = /[rl]/.test(sides[i][end]) ? o2.cy : o2.cx;
          (ports.get(k) || ports.set(k, []).get(k)).push([i, end, v]);
        }));
        const off = edges.map(() => [0, 0]);
        ports.forEach((L) => {
          L.sort((x, y) => x[2] - y[2]);
          L.forEach(([i, end], k) => {
            off[i][end] = (k - (L.length - 1) / 2) * Math.min(14, 60 / L.length);
          });
        });
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.textContent = "";
        const defs2 = s("defs", {}, svg);
        const mk = s("marker", { id: mid, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 10, markerHeight: 10, markerUnits: "userSpaceOnUse", orient: "auto-start-reverse" }, defs2);
        s("path", { d: "M0,1 L9,5 L0,9 z", fill: "context-stroke" }, mk);
        if (tracks.length) {
          const g = s("g", { class: "efx-diagram__lanes" }, svg);
          let y = pt2;
          tracks.forEach((h, i) => {
            const y0 = i ? y - gap / 2 : 0, y1 = i === tracks.length - 1 ? H : y + h + gap / 2;
            s("rect", { class: "efx-diagram__lane", x: 0, y: y0, width: W, height: y1 - y0 }, g);
            const words = String(lanes[i]).split(/\s+/), lines = [];
            let cur = "";
            words.forEach((w) => {
              if ((cur + " " + w).trim().length > 13 && cur) {
                lines.push(cur);
                cur = w;
              } else cur = (cur + " " + w).trim();
            });
            lines.push(cur);
            const t = s("text", { class: "efx-diagram__lane-label", x: 14, y: (y0 + y1) / 2 - (lines.length - 1) * 8 }, g);
            lines.forEach((ln, k) => {
              const sp = s("tspan", { x: 14, dy: k ? 16 : 0 }, t);
              sp.textContent = ln;
            });
            y += h + gap;
          });
          s("line", { class: "efx-diagram__lane-sep", x1: pl - 14, x2: pl - 14, y1: 0, y2: H }, g);
        }
        ed.length = 0;
        const route = String(o.route).toLowerCase();
        edges.forEach((e, i) => {
          const a = rc.get(e.a), b = rc.get(e.b), [sa, sb] = sides[i];
          const port = (n, side, d2) => side === "r" ? [n.r, n.cy + d2] : side === "l" ? [n.l, n.cy + d2] : side === "b" ? [n.cx + d2, n.b] : [n.cx + d2, n.t];
          const p1 = port(a, sa, off[i][0]), p2 = port(b, sb, off[i][1]), hz = /[rl]/.test(sa);
          let d;
          if (route === "straight") d = "M" + f(p1) + "L" + f(p2);
          else if (route === "curve") {
            const k = Math.max(30, dist(p1, p2) / 2), n1 = NORM[sa], n2 = NORM[sb];
            d = `M${f(p1)}C${f([p1[0] + n1[0] * k, p1[1] + n1[1] * k])} ${f([p2[0] + n2[0] * k, p2[1] + n2[1] * k])} ${f(p2)}`;
          } else if (hz ? Math.abs(p1[1] - p2[1]) < 1 : Math.abs(p1[0] - p2[0]) < 1) d = "M" + f(p1) + "L" + f(p2);
          else {
            const m = hz ? (p1[0] + p2[0]) / 2 : (p1[1] + p2[1]) / 2;
            d = rounded(hz ? [p1, [m, p1[1]], [m, p2[1]], p2] : [p1, [p1[0], m], [p2[0], m], p2]);
          }
          const g = s("g", { class: "efx-diagram__edge", "data-i": i }, svg);
          if (tone[i]) g.style.setProperty("--c", tone[i]);
          s("path", { class: "efx-diagram__hit", d }, g);
          const er = e.label.split("..");
          const isER = er.length === 2 && CARD.test(er[0]) && CARD.test(er[1]);
          const line = s("path", { class: "efx-diagram__line", d }, g);
          if (e.op === "~>") line.setAttribute("stroke-dasharray", "6 5");
          if (e.op === "=>") line.setAttribute("stroke-width", 3.4);
          if (!isER) {
            line.setAttribute("marker-end", `url(#${mid})`);
            if (e.op === "<>") line.setAttribute("marker-start", `url(#${mid})`);
          } else [[p1, sa, er[0]], [p2, sb, er[1]]].forEach(([p, sd, tk]) => {
            const n = NORM[sd], pp = [-n[1], n[0]], at = (u, v = 0) => [p[0] + n[0] * u + pp[0] * v, p[1] + n[1] * u + pp[1] * v];
            const t = tk.toLowerCase(), many = /[nm*]/.test(t), zero = t[0] === "0";
            let m = "";
            if (many) m += `M${f(at(11, 0))}L${f(at(0, 6))}M${f(at(11, 0))}L${f(at(0, -6))}M${f(at(11, 0))}L${f(at(0, 0))}`;
            else m += `M${f(at(8, 6))}L${f(at(8, -6))}`;
            if (t === "1") m += `M${f(at(12, 6))}L${f(at(12, -6))}`;
            s("path", { class: "efx-diagram__er", d: m }, g);
            if (zero) {
              const c = at(many ? 17 : 15);
              s("circle", { class: "efx-diagram__er efx-diagram__er--o", cx: c[0], cy: c[1], r: 4 }, g);
            }
          });
          let len = 0;
          try {
            len = line.getTotalLength();
          } catch (x) {
          }
          if (e.label && !isER && len) {
            const m = line.getPointAtLength(len / 2), w = e.label.length * 6.4 + 14;
            const lb = s("g", { class: "efx-diagram__lbl" }, g);
            s("rect", { x: m.x - w / 2, y: m.y - 9, width: w, height: 18, rx: 9 }, lb);
            s("text", { x: m.x, y: m.y }, lb).textContent = e.label;
          }
          if (o.flow && motionOK() && len) {
            const c = s("circle", { class: "efx-diagram__dot", r: 3 }, g);
            const am = s("animateMotion", { dur: Math.max(1.6, len / 80) + "s", repeatCount: "indefinite", begin: -(i * 0.7) + "s", path: d }, c);
            am.setAttribute("rotate", "0");
          }
          ed.push({ g, i });
        });
        apply();
      };
      const lay = rafThrottle(draw);
      draw();
      const nodeOf = (t) => {
        const n = t.closest && t.closest(".efx-diagram__node");
        return n && el.contains(n) ? n : null;
      };
      const select = (n) => el.dispatchEvent(new CustomEvent("efx:select", { bubbles: true, detail: { id: n.id, label: nameOf(n), index: [...nodes].indexOf(n) } }));
      const offs = [
        on(el, "pointerover", (e) => {
          const n = nodeOf(e.target);
          if (n) return focusNode(n);
          const g = e.target.closest && e.target.closest(".efx-diagram__edge");
          if (g) {
            const i = +g.dataset.i, x = edges[i];
            hl = { n: /* @__PURE__ */ new Set([byId.get(x.a), byId.get(x.b)]), e: /* @__PURE__ */ new Set([i]) };
            apply();
          } else clear();
        }),
        on(el, "pointerleave", clear),
        on(el, "focusin", (e) => {
          const n = nodeOf(e.target);
          n ? focusNode(n) : clear();
        }),
        on(el, "focusout", clear),
        on(el, "click", (e) => {
          const n = nodeOf(e.target);
          if (n) select(n);
        }),
        on(el, "keydown", (e) => {
          const n = nodeOf(e.target);
          if (n && n === e.target && (e.key === "Enter" || e.key === " ") && !n.matches("a,button")) {
            e.preventDefault();
            select(n);
          }
        }),
        on(window, "resize", lay)
      ];
      let ro;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(lay);
        ro.observe(el);
        nodes.forEach((n) => ro.observe(n));
      }
      return () => {
        lay.cancel();
        ro && ro.disconnect();
        offs.forEach((x) => x());
        svg.remove();
        sr.remove();
        attrs.forEach(([n, k]) => n.removeAttribute(k));
        undo.reverse().forEach(([n, k, v]) => k === "tabindex" ? n.removeAttribute("tabindex") : n.style[k] = v);
        added.forEach(([n, c]) => n.classList.remove(c));
        nodes.forEach((n) => n.classList.remove("is-hl"));
        el.classList.remove("is-focus");
        el.style.isolation = "";
        if (restore) el.style.position = "";
      };
    }
  };

  // src/charts/diagram-sequence.js
  var ARROW = /^(.+?)\s*(-->>|->>|-->|->)([+-]?)\s*(.+?)\s*(?::\s*(.*))?$/;
  var unq = (v) => String(v == null ? "" : v).trim().replace(/^"(.*)"$/, "$1");
  var KIND = { "->": "sync", "->>": "async", "-->": "return", "-->>": "return" };
  var FRAMES = "loop|alt|opt|par|critical|break|rect";
  function parseText(src) {
    const parts = [], ev = [];
    let title = "", numbers = false;
    const add = (id, label) => {
      id = unq(id);
      if (id && !parts.some((p) => p.id === id)) parts.push({ id, label: unq(label) || id });
      return id;
    };
    String(src).split(/\r?\n/).forEach((raw) => {
      const line = raw.trim();
      let m;
      if (!line || /^(#|\/\/|%%)/.test(line)) return;
      if (m = line.match(/^(?:participant|actor)\s+(.+?)(?:\s+as\s+(.+))?$/i)) add(m[1], m[2]);
      else if (m = line.match(/^title\s*:?\s*(.+)$/i)) title = m[1];
      else if (/^autonumber$/i.test(line)) numbers = true;
      else if (m = line.match(/^note\s+(over|left of|right of)\s+([^:]+?)\s*:\s*(.*)$/i)) ev.push({ t: "note", pos: m[1].toLowerCase().split(" ")[0], on: m[2].split(",").map((x) => add(x)), text: m[3] });
      else if (m = line.match(new RegExp("^(" + FRAMES + ")\\b\\s*(.*)$", "i"))) ev.push({ t: "open", kind: m[1].toLowerCase(), text: m[2] });
      else if (m = line.match(/^else\b\s*(.*)$/i)) ev.push({ t: "else", text: m[1] });
      else if (/^end$/i.test(line)) ev.push({ t: "end" });
      else if (m = line.match(/^(activate|deactivate)\s+(.+)$/i)) ev.push({ t: m[1].toLowerCase(), who: add(m[2]) });
      else if (m = line.match(ARROW)) ev.push({ t: "msg", from: add(m[1]), to: add(m[4]), text: m[5] || "", kind: KIND[m[2]], dashed: m[2][1] === "-", act: m[3] });
    });
    return { parts, ev, title, numbers };
  }
  function parseJSON(d) {
    const parts = [], ev = [];
    const add = (p) => {
      var _a;
      const o = p && typeof p === "object" ? p : { id: p };
      const id = unq((_a = o.id) != null ? _a : o.name);
      if (id && !parts.some((x) => x.id === id)) parts.push({ id, label: unq(o.label) || id });
      return id;
    };
    (Array.isArray(d.participants) ? d.participants : []).forEach(add);
    (Array.isArray(d.messages) ? d.messages : Array.isArray(d.steps) ? d.steps : Array.isArray(d) ? d : []).forEach((m) => {
      var _a, _b, _c, _d, _e, _f;
      if (!m || typeof m !== "object") return;
      if (m.note != null) ev.push({ t: "note", pos: m.left ? "left" : m.right ? "right" : "over", on: [].concat((_d = (_c = (_b = (_a = m.over) != null ? _a : m.left) != null ? _b : m.right) != null ? _c : m.on) != null ? _d : []).map(add), text: String(m.note) });
      else if (m.frame) ev.push({ t: "open", kind: String(m.frame).toLowerCase(), text: m.label || "" });
      else if (m.else != null) ev.push({ t: "else", text: m.else === true ? "" : String(m.else) });
      else if (m.end) ev.push({ t: "end" });
      else if (m.from != null && m.to != null) {
        const k = String(m.kind || m.type || "sync").toLowerCase();
        ev.push({ t: "msg", from: add(m.from), to: add(m.to), text: String((_f = (_e = m.text) != null ? _e : m.label) != null ? _f : ""), kind: k === "return" ? "return" : k === "async" ? "async" : "sync", dashed: k === "return", act: m.act || "" });
      }
    });
    return { parts, ev, title: String(d.title || ""), numbers: !!d.numbers };
  }
  var diagram_sequence_default = {
    name: "diagram-sequence",
    selector: ".efx-diagram-sequence",
    lazy: true,
    defaults: { data: "", play: false, step: 420, activations: false, numbers: false, bottom: false, gap: 0, colors: [], title: "", tooltip: true },
    init(el, o) {
      const src0 = () => {
        const raw = String(o.data || "").trim();
        if (raw) return raw;
        const n = el.querySelector(':scope > script[type="text/plain"], :scope > script[type="text/x-sequence"], :scope > pre');
        return n ? n.textContent : "";
      };
      let src = src0();
      const pre = el.querySelector(":scope > pre");
      const preHidden = pre && pre.hidden;
      if (pre) pre.hidden = true;
      const restore = { pos: el.style.position };
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.classList.add("efx-seq");
      const wrap3 = document.createElement("div");
      wrap3.className = "efx-seq__wrap";
      const svg = s("svg", { class: "efx-seq__svg", role: "img", focusable: "false", tabindex: "0" });
      const tip = document.createElement("div");
      tip.className = "efx-seq__tip";
      tip.setAttribute("role", "status");
      tip.hidden = true;
      const sr = document.createElement("ol");
      sr.className = "efx-seq__sr";
      wrap3.appendChild(svg);
      el.append(wrap3, tip, sr);
      let msgs = [], active = -1, W = 0, H = 0, played = !(o.play && motionOK());
      const playing = !played;
      const cache = /* @__PURE__ */ new Map();
      let meas = null;
      const tw = (str) => {
        if (cache.has(str)) return cache.get(str);
        meas.textContent = str;
        let w = 0;
        try {
          w = meas.getComputedTextLength();
        } catch (e) {
        }
        if (!w) w = str.length * 7;
        cache.set(str, w);
        return w;
      };
      const wrapText = (str, max) => {
        const lines = [];
        let cur = "";
        String(str).split(/\\n|\n/).forEach((seg) => {
          cur = "";
          seg.split(/\s+/).filter(Boolean).forEach((w) => {
            const t = cur ? cur + " " + w : w;
            if (cur && tw(t) > max) {
              lines.push(cur);
              cur = w;
            } else cur = t;
          });
          lines.push(cur);
        });
        return lines;
      };
      function render() {
        let json = null;
        if (/^[[{]/.test(src.trim())) {
          try {
            json = JSON.parse(src);
          } catch (e) {
            json = null;
          }
        }
        const model = json ? parseJSON(json) : parseText(src);
        const { parts, ev } = model;
        const showNum = o.numbers || model.numbers;
        [...svg.childNodes].forEach((n2) => n2.remove());
        cache.clear();
        msgs = [];
        active = -1;
        tip.hidden = true;
        const label = o.title || model.title || el.getAttribute("aria-label") || "Sequence diagram";
        svg.setAttribute("aria-label", label + (o.tooltip ? ". Use arrow keys to step through the messages." : ""));
        sr.innerHTML = "";
        if (!parts.length) {
          svg.setAttribute("viewBox", "0 0 10 10");
          return;
        }
        meas = s("text", { class: "efx-seq__m", x: 0, y: 0, "aria-hidden": "true" }, svg);
        const idx = Object.fromEntries(parts.map((p, i) => [p.id, i]));
        const n = parts.length, colors = palette(el, o, n);
        const HH = 34, Y0 = 8 + HH + 12;
        let y = Y0, lastY = y, k = 0;
        const items = [], stack = [], frames = [], bars = [], open = Array.from({ length: n }, () => []);
        const push = (it) => {
          items.push(it);
          stack.forEach((f2) => f2.items.push(it));
          return it;
        };
        ev.forEach((e) => {
          var _a, _b;
          if (e.t === "msg") {
            const a = idx[e.from], b = idx[e.to], self = a === b;
            const up = e.act === "+" || o.activations && !e.dashed && e.kind !== "return";
            const down = e.act === "-" || o.activations && e.kind === "return";
            const my = y + 24;
            if (up) open[b].push(my);
            const off = (i) => open[i].length ? 5 + 4 * (open[i].length - 1) : 0;
            const it = push({ t: "msg", e, a, b, self, y: my, oa: off(a), ob: off(b), step: k++, num: msgs.length + 1 });
            if (down && open[a].length) bars.push({ c: a, d: open[a].length - 1, y0: open[a].pop(), y1: my });
            msgs.push(it);
            y = my + (self ? 34 : 14);
            lastY = my;
          } else if (e.t === "note") {
            const cols = e.on.map((i) => idx[i]).sort((p, q) => p - q);
            const lines = wrapText(e.text, cols.length > 1 ? 220 : 170);
            const h = lines.length * 16 + 12;
            push({ t: "note", e, a: (_a = cols[0]) != null ? _a : 0, b: (_b = cols[cols.length - 1]) != null ? _b : 0, lines, h, y, step: k++, w: Math.max(60, Math.max(...lines.map(tw)) + 24) });
            y += h + 14;
          } else if (e.t === "open") {
            const f2 = { kind: e.kind, text: e.text, y0: y, elses: [], items: [], depth: stack.length, step: k++ };
            stack.push(f2);
            frames.push(f2);
            y += 28;
          } else if (e.t === "else" && stack.length) {
            const f2 = stack[stack.length - 1];
            y += 6;
            f2.elses.push({ y, text: e.text, step: k++ });
            y += 24;
          } else if (e.t === "end" && stack.length) {
            const f2 = stack.pop();
            f2.y1 = y;
            y += 10;
          } else if (e.t === "activate") open[idx[e.who]].push(lastY + 12);
          else if (e.t === "deactivate" && open[idx[e.who]].length) bars.push({ c: idx[e.who], d: open[idx[e.who]].length - 1, y0: open[idx[e.who]].pop(), y1: lastY + 12 });
        });
        while (stack.length) {
          const f2 = stack.pop();
          f2.y1 = y;
          y += 10;
        }
        open.forEach((st, c) => st.forEach((y0, d) => bars.push({ c, d, y0, y1: y + 2 })));
        const bottom = y + 16;
        H = bottom + (o.bottom ? HH + 8 : 0) + 8;
        frames.slice().sort((p, q) => q.depth - p.depth).forEach((f2) => {
          f2.h = 1 + Math.max(0, ...frames.filter((g) => g.depth > f2.depth && g.y0 >= f2.y0 && g.y1 <= f2.y1).map((g) => g.h));
          f2.pad = 12 + 9 * (f2.h - 1);
        });
        const hw = parts.map((p) => Math.max(70, tw(p.label) + 28));
        const minGap = o.gap > 0 ? o.gap : 130;
        const gap = Array.from({ length: Math.max(0, n - 1) }, (_, i) => Math.max(minGap, (hw[i] + hw[i + 1]) / 2 + 18));
        let mL = hw[0] / 2 + 10, mR = hw[n - 1] / 2 + 10;
        const need = [];
        items.forEach((it) => {
          if (it.t === "msg") {
            const t = tw((showNum ? it.num + ". " : "") + it.e.text) + 40;
            if (it.self) {
              const w = tw(it.e.text) + 64;
              if (it.a < n - 1) need.push([it.a, it.a + 1, w]);
              else mR = Math.max(mR, w);
            } else need.push([Math.min(it.a, it.b), Math.max(it.a, it.b), t]);
          } else {
            const w = it.w;
            if (it.e.pos === "left") {
              if (it.a > 0) need.push([it.a - 1, it.a, w + 24]);
              else mL = Math.max(mL, w + 24);
            } else if (it.e.pos === "right") {
              if (it.a < n - 1) need.push([it.a, it.a + 1, w + 24]);
              else mR = Math.max(mR, w + 24);
            } else if (it.a !== it.b) need.push([it.a, it.b, w - 30]);
            else {
              mL = Math.max(mL, it.a === 0 ? w / 2 + 12 : 0);
              mR = Math.max(mR, it.a === n - 1 ? w / 2 + 12 : 0);
            }
          }
        });
        need.sort((p, q) => p[1] - p[0] - (q[1] - q[0]));
        for (let pass = 0; pass < 2; pass++) need.forEach(([i, j, w]) => {
          let have = 0;
          for (let g = i; g < j; g++) have += gap[g];
          if (have < w) for (let g = i; g < j; g++) gap[g] += (w - have) / (j - i);
        });
        const fpad = frames.length ? 12 + 9 * Math.max(...frames.map((f2) => f2.h - 1)) : 0;
        mL += fpad;
        mR += fpad;
        const X = [];
        let xx = mL;
        for (let i = 0; i < n; i++) {
          X.push(xx);
          xx += gap[i] || 0;
        }
        W = Math.ceil(X[n - 1] + mR);
        meas.remove();
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("width", W);
        svg.setAttribute("height", H);
        svg.style.maxWidth = W + "px";
        const plot = s("g", { class: "efx-seq__plot" + (played ? " is-in" : "") }, svg);
        const step = (i) => `--i:${i}`;
        const ext = (it) => {
          if (it.t === "msg") return it.self ? [X[it.a] - 8, X[it.a] + 50 + tw(it.e.text)] : [Math.min(X[it.a], X[it.b]), Math.max(X[it.a], X[it.b])];
          if (it.e.pos === "left") return [X[it.a] - 10 - it.w, X[it.a] - 10];
          if (it.e.pos === "right") return [X[it.a] + 10, X[it.a] + 10 + it.w];
          const c = (X[it.a] + X[it.b]) / 2, w = Math.max(it.w, X[it.b] - X[it.a] + 36);
          return [c - w / 2, c + w / 2];
        };
        frames.slice().sort((p, q) => p.depth - q.depth).forEach((f2) => {
          const xs = f2.items.length ? f2.items.map(ext) : [[X[0], X[n - 1]]];
          const x0 = Math.min(...xs.map((v) => v[0])) - f2.pad, x1 = Math.max(...xs.map((v) => v[1])) + f2.pad;
          const g = s("g", { class: "efx-seq__frame efx-seq__step", style: step(f2.step) }, plot);
          s("rect", { x: x0, y: f2.y0, width: x1 - x0, height: f2.y1 - f2.y0, rx: 4, class: "efx-seq__frame-box" }, g);
          const tgw = tw(f2.kind) + 18;
          s("path", { d: `M${x0},${f2.y0}h${tgw}v10l-8,8h${-tgw + 8}z`, class: "efx-seq__tag" }, g);
          s("text", { x: x0 + 9, y: f2.y0 + 13, class: "efx-seq__tag-t" }, g).textContent = f2.kind;
          if (f2.text) s("text", { x: x0 + tgw + 8, y: f2.y0 + 14, class: "efx-seq__frame-t" }, g).textContent = "[" + f2.text + "]";
          f2.elses.forEach((l) => {
            s("line", { x1: x0, x2: x1, y1: l.y, y2: l.y, class: "efx-seq__else" }, g);
            if (l.text) s("text", { x: x0 + 9, y: l.y + 15, class: "efx-seq__frame-t" }, g).textContent = "[" + l.text + "]";
          });
        });
        const life = [], head = [];
        parts.forEach((p, i) => {
          const g = s("g", { class: "efx-seq__p", style: `--c:${colors[i]}` }, plot);
          life.push(g);
          s("line", { x1: X[i], x2: X[i], y1: 8 + HH, y2: bottom, class: "efx-seq__life" }, g);
          const box = (yy) => {
            s("rect", { x: X[i] - hw[i] / 2, y: yy, width: hw[i], height: HH, rx: 6, class: "efx-seq__head" }, g);
            s("text", { x: X[i], y: yy + HH / 2, "text-anchor": "middle", "dominant-baseline": "central", class: "efx-seq__head-t" }, g).textContent = p.label;
          };
          box(8);
          if (o.bottom) box(bottom);
          head.push(g);
        });
        bars.forEach((b) => s("rect", { x: X[b.c] - 5 + b.d * 4, y: b.y0, width: 10, height: Math.max(8, b.y1 - b.y0), class: "efx-seq__bar", style: `--c:${colors[b.c]}` }, plot));
        const nodeFor = /* @__PURE__ */ new Map();
        items.forEach((it) => {
          if (it.t === "note") {
            const [x0, x1] = ext(it);
            const g = s("g", { class: "efx-seq__note efx-seq__step", style: step(it.step) }, plot);
            s("rect", { x: x0, y: it.y, width: x1 - x0, height: it.h, rx: 3, class: "efx-seq__note-box" }, g);
            it.lines.forEach((l, i) => s("text", { x: (x0 + x1) / 2, y: it.y + 6 + 16 * i + 8, "text-anchor": "middle", "dominant-baseline": "central", class: "efx-seq__note-t" }, g).textContent = l);
          } else {
            const { e } = it, dir = X[it.b] >= X[it.a] ? 1 : -1;
            const g = s("g", { class: `efx-seq__msg efx-seq__step is-${e.kind}${it.self ? " is-self" : ""} ${it.self || dir > 0 ? "to-r" : "to-l"}`, style: `${step(it.step)};--c:${colors[it.a]}`, "data-i": msgs.indexOf(it) }, plot);
            const text = (showNum ? it.num + ". " : "") + e.text;
            let d, ax, ay, adir, lx, ly, anchor = "middle";
            if (it.self) {
              const x = X[it.a] + it.oa, r = x + 36;
              d = `M${x},${it.y}H${r}V${it.y + 18}H${x + it.ob + 1}`;
              ax = x + it.ob + 1;
              ay = it.y + 18;
              adir = -1;
              lx = r + 8;
              ly = it.y + 9;
              anchor = "start";
            } else {
              const x0 = X[it.a] + dir * it.oa, x1 = X[it.b] - dir * it.ob;
              d = `M${x0},${it.y}H${x1}`;
              ax = x1;
              ay = it.y;
              adir = dir;
              lx = (x0 + x1) / 2;
              ly = it.y - 7;
            }
            s("path", { d, class: "efx-seq__hit" }, g);
            s("path", { d, class: "efx-seq__line" + (e.dashed ? " is-dashed" : "") }, g);
            const sz = 8;
            if (e.kind === "sync") s("path", { d: `M${ax},${ay}l${-adir * sz},-4.5v9z`, class: "efx-seq__arrow is-fill" }, g);
            else s("path", { d: `M${ax - adir * sz},${ay - 4.5}L${ax},${ay}L${ax - adir * sz},${ay + 4.5}`, class: "efx-seq__arrow", fill: "none" }, g);
            if (text) s("text", { x: lx, y: ly, "text-anchor": anchor, class: "efx-seq__label" }, g).textContent = text;
            it.node = g;
            it.from = parts[it.a], it.to = parts[it.b];
            it.mx = it.self ? X[it.a] + 36 : (X[it.a] + X[it.b]) / 2;
            nodeFor.set(g, it);
          }
        });
        const stk = [];
        ev.forEach((e) => {
          let t = "";
          if (e.t === "msg") t = `${unq(e.from)} ${e.kind === "return" ? "replies to" : e.kind === "async" ? "sends asynchronously to" : "calls"} ${unq(e.to)}${e.text ? ": " + e.text : ""}`;
          else if (e.t === "note") t = `Note ${e.pos === "over" ? "over" : e.pos + " of"} ${e.on.join(", ")}: ${e.text}`;
          else if (e.t === "open") {
            stk.push(e.kind);
            t = `Start ${e.kind}${e.text ? ": " + e.text : ""}`;
          } else if (e.t === "else") t = `Else${e.text ? ": " + e.text : ""}`;
          else if (e.t === "end" && stk.length) t = `End ${stk.pop()}`;
          if (t) sr.appendChild(Object.assign(document.createElement("li"), { textContent: t }));
        });
        render.parts = parts;
        render.life = life;
        render.nodeFor = nodeFor;
        render.plot = plot;
      }
      const clear = () => {
        active = -1;
        tip.hidden = true;
        svg.classList.remove("has-hot");
        svg.querySelectorAll(".is-hot").forEach((n) => n.classList.remove("is-hot"));
      };
      function hot(i, withTip) {
        clear();
        const it = msgs[i];
        if (!it) return;
        active = i;
        svg.classList.add("has-hot");
        it.node.classList.add("is-hot");
        render.life[it.a].classList.add("is-hot");
        render.life[it.b].classList.add("is-hot");
        if (!withTip || !o.tooltip) return;
        tip.textContent = "";
        const b = document.createElement("strong");
        b.textContent = `${it.num}. ${it.from.label} \u2192 ${it.to.label}`;
        tip.appendChild(b);
        if (it.e.text) {
          const sp = document.createElement("span");
          sp.textContent = it.e.text;
          tip.appendChild(sp);
        }
        tip.hidden = false;
        const r = el.getBoundingClientRect(), sv = svg.getBoundingClientRect(), sc = sv.width / W;
        const x = sv.left - r.left + it.mx * sc, yy = sv.top - r.top + it.y * sc;
        tip.style.left = Math.max(0, Math.min(r.width - tip.offsetWidth, x - tip.offsetWidth / 2)) + "px";
        tip.style.top = yy + 12 + "px";
      }
      const at = (e) => {
        const g = e.target.closest && e.target.closest(".efx-seq__msg");
        return g ? +g.getAttribute("data-i") : -1;
      };
      const offs = [
        on(svg, "pointerover", (e) => {
          const i = at(e);
          if (i >= 0) {
            if (i !== active) hot(i, false);
          } else if (active >= 0) clear();
        }),
        on(svg, "pointerleave", clear),
        on(svg, "click", (e) => {
          const i = at(e);
          if (i >= 0) {
            const it = msgs[i];
            el.dispatchEvent(new CustomEvent("efx:select", { bubbles: true, detail: { index: i, label: it.e.text, from: it.from.id, to: it.to.id } }));
          }
        }),
        on(svg, "keydown", (e) => {
          if (!msgs.length) return;
          const k = e.key;
          if (k === "ArrowRight" || k === "ArrowDown") hot(active < msgs.length - 1 ? active + 1 : 0, true);
          else if (k === "ArrowLeft" || k === "ArrowUp") hot(active > 0 ? active - 1 : msgs.length - 1, true);
          else if (k === "Home") hot(0, true);
          else if (k === "End") hot(msgs.length - 1, true);
          else if (k === "Escape") clear();
          else return;
          e.preventDefault();
        }),
        on(svg, "blur", clear),
        on(el, "efx:data", (e) => {
          const d = e.detail;
          if (d != null) {
            src = typeof d === "string" ? d : JSON.stringify(d);
            render();
          }
        })
      ];
      render();
      let stopVis = () => {
      };
      if (playing) {
        svg.classList.add("is-play");
        svg.style.setProperty("--efx-seq-step", o.step + "ms");
        stopVis = onVisible(el, (vis, e) => {
          if (!vis || e.intersectionRatio < 0.25 && e.intersectionRect.height < innerHeight * 0.25) return;
          played = true;
          stopVis();
          svg.querySelectorAll(".efx-seq__plot").forEach((p) => p.classList.add("is-in"));
        }, "0px", [0, 0.1, 0.25, 0.5]);
      }
      return () => {
        offs.forEach((f2) => f2());
        stopVis();
        wrap3.remove();
        tip.remove();
        sr.remove();
        el.classList.remove("efx-seq");
        el.style.position = restore.pos;
        if (!el.getAttribute("style")) el.removeAttribute("style");
        if (pre) pre.hidden = preHidden;
      };
    }
  };

  // src/charts/diagram-tree.js
  var uid3 = 0;
  var EASE = "cubic-bezier(.22,1,.36,1)";
  var diagram_tree_default = {
    name: "diagram-tree",
    selector: ".efx-diagram-tree",
    lazy: true,
    defaults: { direction: "down", layout: "tree", links: "elbow", collapsible: true, collapse: 0, gap: 16, levelGap: 44, animate: true, tone: "", title: "" },
    init(el, o) {
      const root = el.matches("ul,ol") ? el : el.querySelector("ul,ol");
      if (!root) return;
      const undo = [];
      const attr = (n, k, v) => {
        undo.push([n, k, n.getAttribute(k)]);
        n.setAttribute(k, v);
      };
      const mind = o.layout === "mindmap";
      const dir = mind || o.direction === "right" ? "right" : "down";
      const nodes = [], byChip = /* @__PURE__ */ new Map();
      const pad = 14, play = o.animate && motionOK();
      const pick = (li) => [...li.childNodes].find((c) => c.nodeType === 1 ? !/^[UO]L$/.test(c.tagName) : c.nodeType === 3 && c.textContent.trim());
      const walk = (ul, depth, parent) => {
        const lis = [...ul.children].filter((c) => c.tagName === "LI");
        lis.forEach((li, i) => {
          let chip = pick(li);
          if (!chip) {
            chip = document.createElement("span");
            li.prepend(chip);
            undo.push([chip, 0]);
          } else if (chip.nodeType === 3) {
            const w = document.createElement("span"), tx = chip;
            li.insertBefore(w, tx);
            w.appendChild(tx);
            chip = w;
            undo.push([() => {
              li.insertBefore(tx, w);
              w.remove();
            }]);
          }
          const sub = li.querySelector(":scope > ul, :scope > ol");
          const n = { li, chip, parent, depth, kids: [], sub, collapsed: false, side: "" };
          nodes.push(n);
          byChip.set(chip, n);
          if (parent) parent.kids.push(n);
          undo.push([chip, "style", chip.getAttribute("style")], [chip, "class", chip.getAttribute("class")]);
          chip.classList.add("efx-tree__node");
          attr(li, "role", "none");
          attr(chip, "role", "treeitem");
          attr(chip, "tabindex", "-1");
          attr(chip, "aria-level", depth + 1);
          attr(chip, "aria-setsize", lis.length);
          attr(chip, "aria-posinset", i + 1);
          const tone = li.getAttribute("data-efx-tone") || o.tone;
          if (tone) chip.style.setProperty("--efx-tone", `var(--sh-${tone}, ${tone})`);
          if (sub) {
            if (!sub.id) {
              attr(sub, "id", "efx-t" + ++uid3);
            }
            attr(sub, "role", "group");
            attr(chip, "aria-owns", sub.id);
            walk(sub, depth + 1, n);
          }
          if (n.kids.length && o.collapsible) {
            n.collapsed = li.hasAttribute("data-efx-collapsed") || o.collapse > 0 && depth >= o.collapse;
            attr(chip, "aria-expanded", String(!n.collapsed));
            chip.classList.add("is-branch");
          }
        });
      };
      attr(root, "role", "tree");
      const label = o.title || root.getAttribute("aria-label");
      if (label) attr(root, "aria-label", label);
      undo.push([root, "style", root.getAttribute("style")], [root, "class", root.getAttribute("class")]);
      walk(root, 0, null);
      if (!nodes.length) {
        undo.reverse().forEach((u) => u.length === 1 ? u[0]() : null);
        return;
      }
      const top = nodes[0];
      top.chip.tabIndex = 0;
      root.classList.add("efx-tree-on", "efx-tree--" + (mind ? "mind" : dir));
      if (play) root.classList.add("efx-tree--pending");
      const svg = s("svg", { class: "efx-tree__links", "aria-hidden": "true", focusable: "false" });
      root.prepend(svg);
      nodes.forEach((n) => {
        if (n.parent) n.link = s("path", { class: "efx-tree__link", fill: "none" }, svg);
      });
      nodes.forEach((n) => {
        const t = n.chip.style.getPropertyValue("--efx-tone");
        if (n.link && t) n.link.style.setProperty("--efx-tone", t);
      });
      const down = dir === "down", gB = o.gap, gD = o.levelGap;
      const B = (n) => down ? n.w : n.h, D = (n) => down ? n.h : n.w;
      const kidsOf = (n) => n.collapsed ? [] : n.kids;
      const sum = (a) => a.reduce((x, y) => x + y, 0);
      const span = /* @__PURE__ */ new Map();
      const measure = (n) => {
        const k = kidsOf(n).map(measure);
        const v = Math.max(B(n), k.length ? sum(k) + gB * (k.length - 1) : 0);
        span.set(n, v);
        return v;
      };
      function forest(list) {
        const lv = [];
        const lvl = (n, d) => {
          lv[d] = Math.max(lv[d] || 0, D(n));
          kidsOf(n).forEach((k) => lvl(k, d + 1));
        };
        list.forEach((n) => lvl(n, 0));
        const off = [0];
        lv.forEach((m, i) => {
          off[i + 1] = off[i] + m + gD;
        });
        const assign = (n, start, d) => {
          const k = kidsOf(n), sp = span.get(n);
          let c;
          if (k.length) {
            let p2 = start + (sp - (sum(k.map((x) => span.get(x))) + gB * (k.length - 1))) / 2;
            const cs = k.map((x) => {
              const r = assign(x, p2, d + 1);
              p2 += span.get(x) + gB;
              return r;
            });
            c = (cs[0] + cs[cs.length - 1]) / 2;
          } else c = start + sp / 2;
          n.b = c;
          n.d = off[d] + (lv[d] - D(n)) / 2;
          return c;
        };
        let p = 0;
        list.forEach((n) => {
          assign(n, p, 0);
          p += span.get(n) + gB;
        });
        return Math.max(0, p - gB);
      }
      const mark = (n, side) => {
        n.side = side;
        n.kids.forEach((k) => mark(k, side));
      };
      let cw = 0, W = 0, H = 0;
      function place() {
        nodes.forEach((n) => {
          n.w = n.chip.offsetWidth;
          n.h = n.chip.offsetHeight;
        });
        measure(top);
        if (mind) {
          const R = [], L = [];
          let a = 0, b = 0;
          kidsOf(top).forEach((k) => {
            if (a <= b) {
              R.push(k);
              a += span.get(k);
              mark(k, "r");
            } else {
              L.push(k);
              b += span.get(k);
              mark(k, "l");
            }
          });
          const tr = forest(R), tl = forest(L);
          const sideNodes = (list) => {
            const out = [];
            const f2 = (n) => {
              out.push(n);
              kidsOf(n).forEach(f2);
            };
            list.forEach(f2);
            return out;
          };
          const cy = Math.max(tr, tl, top.h) / 2;
          sideNodes(R).forEach((n) => {
            n.x = top.w + gD + n.d;
            n.y = n.b - n.h / 2 + cy - tr / 2;
          });
          sideNodes(L).forEach((n) => {
            n.x = -gD - n.d - n.w;
            n.y = n.b - n.h / 2 + cy - tl / 2;
          });
          top.x = 0;
          top.y = cy - top.h / 2;
        } else {
          forest([top]);
          const put = (n) => {
            if (down) {
              n.x = n.b - n.w / 2;
              n.y = n.d;
            } else {
              n.y = n.b - n.h / 2;
              n.x = n.d;
            }
            kidsOf(n).forEach(put);
          };
          put(top);
        }
        const vis = (n, px, py) => {
          n.vis = px == null;
          if (!n.vis) {
            n.x = px;
            n.y = py;
          }
          const hid = !n.vis || n.collapsed;
          n.kids.forEach((k) => vis(k, hid ? n.x : null, hid ? n.y : null));
        };
        vis(top, null, null);
        const vs = nodes.filter((n) => n.vis);
        const minX = Math.min(...vs.map((n) => n.x)), maxX = Math.max(...vs.map((n) => n.x + n.w));
        const minY = Math.min(...vs.map((n) => n.y)), maxY = Math.max(...vs.map((n) => n.y + n.h));
        cw = root.clientWidth;
        const ox = pad - minX + Math.max(0, (cw - (maxX - minX) - 2 * pad) / 2), oy = pad - minY;
        nodes.forEach((n) => {
          n.x += ox;
          n.y += oy;
        });
        W = Math.max(cw, maxX - minX + 2 * pad);
        H = maxY - minY + 2 * pad;
      }
      const linkD = (n) => {
        const p = n.parent, m = o.links;
        let x1, y1, x2, y2, v = down;
        if (down) {
          x1 = p.x + p.w / 2;
          y1 = p.y + p.h;
          x2 = n.x + n.w / 2;
          y2 = n.y;
        } else if (n.side === "l") {
          x1 = p.x;
          y1 = p.y + p.h / 2;
          x2 = n.x + n.w;
          y2 = n.y + n.h / 2;
        } else {
          x1 = p.x + p.w;
          y1 = p.y + p.h / 2;
          x2 = n.x;
          y2 = n.y + n.h / 2;
        }
        if (m === "straight") return `M${x1},${y1}L${x2},${y2}`;
        const a = v ? [x1, y1, x2, y2] : [y1, x1, y2, x2];
        const f2 = (b, d) => v ? `${b},${d}` : `${d},${b}`;
        const [b1, d1, b2, d2] = a, dm = (d1 + d2) / 2;
        if (m === "curve") return `M${f2(b1, d1)}C${f2(b1, dm)} ${f2(b2, dm)} ${f2(b2, d2)}`;
        const sg = b2 > b1 ? 1 : -1, r = Math.min(8, Math.abs(b2 - b1) / 2, Math.abs(d2 - d1) / 4);
        if (r < 1) return `M${f2(b1, d1)}L${f2(b1, dm)}L${f2(b2, dm)}L${f2(b2, d2)}`;
        const dd = Math.sign(d2 - d1) || 1;
        return `M${f2(b1, d1)}L${f2(b1, dm - dd * r)}Q${f2(b1, dm)} ${f2(b1 + sg * r, dm)}L${f2(b2 - sg * r, dm)}Q${f2(b2, dm)} ${f2(b2, dm + dd * r)}L${f2(b2, d2)}`;
      };
      function apply(anim) {
        root.style.height = H + "px";
        svg.setAttribute("width", W);
        svg.setAttribute("height", H);
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        nodes.forEach((n) => {
          const to = `translate(${n.x}px,${n.y}px)`;
          if (anim && n.px != null && (n.px !== n.x || n.py !== n.y || n.pv !== n.vis)) {
            n.chip.animate([
              { transform: `translate(${n.px}px,${n.py}px)`, opacity: n.pv ? 1 : 0, visibility: "visible" },
              { transform: to, opacity: n.vis ? 1 : 0, visibility: "visible" }
            ], { duration: 320, easing: EASE });
          }
          n.chip.style.transform = to;
          n.chip.style.opacity = n.vis ? "" : "0";
          n.chip.style.visibility = n.vis ? "" : "hidden";
          if (n.link) {
            const d = linkD(n);
            if (anim && n.pd && n.pd !== d) {
              try {
                n.link.animate([{ d: `path("${n.pd}")` }, { d: `path("${d}")` }], { duration: 320, easing: EASE });
              } catch (e) {
              }
            }
            n.link.setAttribute("d", d);
            n.link.style.opacity = n.vis ? "" : "0";
            n.pd = d;
          }
          n.px = n.x;
          n.py = n.y;
          n.pv = n.vis;
        });
      }
      const layout = (anim) => {
        place();
        apply(anim && play);
      };
      layout(false);
      let stopVis = () => {
      };
      if (play) {
        stopVis = onVisible(root, (vis) => {
          if (!vis) return;
          stopVis();
          root.classList.remove("efx-tree--pending");
          nodes.forEach((n) => {
            n.chip.animate([{ opacity: 0, transform: `translate(${top.x}px,${top.y}px) scale(.8)` }, { opacity: 1, transform: `translate(${n.x}px,${n.y}px)` }], { duration: 520, delay: n.depth * 90, easing: EASE, fill: "backwards" });
            if (n.link) n.link.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: n.depth * 90 + 120, fill: "backwards" });
          });
        }, "0px", [0, 0.1]);
      }
      const hot = (n) => {
        nodes.forEach((k) => {
          k.link && k.link.classList.remove("is-hot");
          k.chip.classList.remove("is-hot");
        });
        for (; n; n = n.parent) {
          n.link && n.link.classList.add("is-hot");
          n.chip.classList.add("is-hot");
        }
      };
      const focus = (n) => {
        nodes.forEach((k) => {
          k.chip.tabIndex = -1;
        });
        n.chip.tabIndex = 0;
        n.chip.focus();
      };
      function toggle(n, v) {
        if (!n.kids.length || !o.collapsible) return;
        const c = v == null ? !n.collapsed : v;
        if (c === n.collapsed) return;
        n.collapsed = c;
        n.chip.setAttribute("aria-expanded", String(!c));
        layout(true);
        el.dispatchEvent(new CustomEvent("efx:toggle", { bubbles: true, detail: { label: n.chip.textContent.trim(), expanded: !c } }));
      }
      const text = (n) => n.chip.textContent.trim();
      const offs = [
        on(root, "click", (e) => {
          const chip = e.target.closest(".efx-tree__node"), n = chip && byChip.get(chip);
          if (!n) return;
          el.dispatchEvent(new CustomEvent("efx:select", { bubbles: true, detail: { label: text(n), depth: n.depth } }));
          if (!e.target.closest("a,button,input")) {
            n.chip.focus();
            toggle(n);
          }
        }),
        on(root, "keydown", (e) => {
          const chip = e.target.closest(".efx-tree__node"), n = chip && byChip.get(chip);
          if (!n || e.altKey || e.ctrlKey || e.metaKey) return;
          const k = e.key, sibs = n.parent ? n.parent.kids : [n], i = sibs.indexOf(n);
          let t = null;
          if (k === "ArrowDown") t = sibs[i + 1];
          else if (k === "ArrowUp") t = sibs[i - 1];
          else if (k === "ArrowRight" || k === "ArrowLeft") {
            const R = k === "ArrowRight";
            const toChild = R !== (n.side === "l");
            if (!n.parent && mind) {
              const side = R ? "r" : "l";
              if (n.collapsed) toggle(n, false);
              else t = n.kids.find((c) => c.side === side);
            } else if (toChild) {
              if (n.kids.length) {
                if (n.collapsed) toggle(n, false);
                else t = n.kids[0];
              }
            } else t = n.parent;
          } else if (k === "Home") t = top;
          else if (k === "End") {
            t = nodes.filter((x) => x.vis).pop();
          } else if (k === "Enter" || k === " ") {
            if (!e.target.closest("a")) {
              toggle(n);
              el.dispatchEvent(new CustomEvent("efx:select", { bubbles: true, detail: { label: text(n), depth: n.depth } }));
            }
          } else return;
          e.preventDefault();
          if (t) focus(t);
        }),
        on(root, "focusin", (e) => {
          const n = byChip.get(e.target.closest(".efx-tree__node"));
          if (n) hot(n);
        }),
        on(root, "focusout", () => hot(null)),
        on(root, "pointerover", (e) => {
          const n = byChip.get(e.target.closest(".efx-tree__node"));
          if (n) hot(n);
        }),
        on(root, "pointerleave", () => hot(null))
      ];
      const rs = rafThrottle(() => {
        if (Math.abs(root.clientWidth - cw) > 1) layout(false);
      });
      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(rs) : null;
      if (ro) ro.observe(root);
      const fonts = document.fonts && document.fonts.ready;
      if (fonts) fonts.then(() => {
        if (!root.isConnected) return;
        const w = nodes.map((n) => n.chip.offsetWidth).join();
        if (w !== nodes.map((n) => n.w).join()) layout(false);
      });
      return () => {
        offs.forEach((f2) => f2());
        stopVis();
        rs.cancel();
        if (ro) ro.disconnect();
        nodes.forEach((n) => n.chip.getAnimations().forEach((a) => a.cancel()));
        svg.remove();
        root.classList.remove("efx-tree-on", "efx-tree--mind", "efx-tree--down", "efx-tree--right", "efx-tree--pending");
        undo.reverse().forEach(([n, k, v]) => {
          if (typeof n === "function") return n();
          if (k === 0) return n.remove();
          if (v == null) n.removeAttribute(k);
          else n.setAttribute(k, v);
        });
        [root, ...nodes.map((n) => n.chip)].forEach((n) => {
          if (n.getAttribute("style") === "") n.removeAttribute("style");
        });
      };
    }
  };

  // src/effix-entry.js
  var defs = [diagram_cycle_default, diagram_fishbone_default, diagram_flow_default, diagram_sequence_default, diagram_tree_default];
  if (window.Effix) window.Effix.charts = lib_exports;
  else window.EffixChartKit = lib_exports;
  if (window.Effix) window.Effix.define(defs);
  else (window.EffixPending = window.EffixPending || []).push(...defs);
})();
