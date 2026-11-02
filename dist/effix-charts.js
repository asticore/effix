/*! Effix Charts v0.1.0 | MIT | https://github.com/asticore/effix */
(() => {
  // effix-host:effix-core
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
      if (o.source) {
        const t = document.querySelector(o.source);
        if (t) out = fromTable(t);
      }
      if (!out && json) out = JSON.parse(json.textContent);
      if (!out && o.data) {
        const raw = o.data.trim();
        if (raw[0] === "[" || raw[0] === "{") out = JSON.parse(raw);
        else out = { series: raw.split("|").map((s2) => ({ values: s2.split(",").map(num) })) };
      }
    } catch (err) {
      console.warn("[effix] chart data", err);
    }
    out = out || { series: [] };
    if (Array.isArray(out)) out = { series: out };
    let series = (out.series || out.datasets || []).map((s2, i) => {
      if (Array.isArray(s2)) s2 = { values: s2 };
      const values = (s2.values || s2.data || []).map(num);
      return { name: s2.name || s2.label || o.names[i] || `Series ${i + 1}`, values, color: s2.color };
    });
    if (!series.length && Array.isArray(out.data)) series = [{ name: o.names[0] || "", values: out.data.map((d) => {
      var _a;
      return num((_a = d.value) != null ? _a : d);
    }) }];
    const n = Math.max(0, ...series.map((s2) => s2.values.length));
    const labels = (o.labels.length ? o.labels : out.labels || (Array.isArray(out.data) ? out.data.map((d) => d.label) : [])).slice();
    for (let i = labels.length; i < n; i++) labels.push(String(i + 1));
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
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(+v.toFixed(10));
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
  function formatter(o) {
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
      w = Math.max(40, el.clientWidth);
      h = deco ? Math.max(20, el.clientHeight) : o.height || el.clientHeight || 260;
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
        sr.innerHTML = marks.slice(0, 200).map((m) => `<li>${esc(m.label)}${m.series ? " (" + esc(m.series) + ")" : ""}: ${esc(fmt(m.value))}</li>`).join("");
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
      if (deco || !o.tooltip) return;
      active = i;
      const m = marks[i];
      if (!m) return hide();
      marks.forEach((k, j) => k.node && k.node.classList.toggle("is-dim", j !== i && (!m.group || k.group !== m.group)));
      if (m.node) m.node.classList.add("is-active");
      tip.innerHTML = m.html || `<strong>${esc(m.label)}</strong>${m.series ? `<span>${esc(m.series)}</span>` : ""}<b>${esc(fmt(m.value))}</b>`;
      tip.hidden = false;
      const r = el.getBoundingClientRect(), sv = svg.getBoundingClientRect();
      const x = sv.left - r.left + m.x * (sv.width / w), y = sv.top - r.top + m.y * (sv.height / h);
      tip.style.left = Math.max(0, Math.min(r.width - tip.offsetWidth, x - tip.offsetWidth / 2)) + "px";
      tip.style.top = Math.max(0, y - tip.offsetHeight - 10) + "px";
    }
    function hide() {
      active = -1;
      tip.hidden = true;
      marks.forEach((k) => k.node && k.node.classList.remove("is-dim", "is-active"));
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
      data = parseData(el, { ...o, source: "", data: JSON.stringify(d), labels: d.labels || [] });
      renderLegend();
      render(true);
    }));
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(rafThrottle(() => {
      if (Math.abs(el.clientWidth - w) > 1 || deco && Math.abs(el.clientHeight - h) > 1) render(true);
    })) : null;
    if (ro) ro.observe(el);
    renderLegend();
    render(false);
    const stopVis = played ? () => {
    } : onVisible(el, (vis, e) => {
      if (!vis || e.intersectionRatio < 0.25 && e.intersectionRect.height < innerHeight * 0.25) return;
      played = true;
      svg.querySelectorAll(".efx-chart__plot").forEach((p) => p.classList.add("is-in"));
      stopVis();
    }, "0px", [0, 0.25]);
    return () => {
      offs.forEach((f) => f());
      stopVis();
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

  // src/charts/chart-bar.js
  var chart_bar_default = {
    name: "chart-bar",
    selector: ".efx-chart-bar",
    lazy: true,
    defaults: { ...COMMON, horizontal: false, stacked: false, values: false, radius: 4, grid: true, min: 0 },
    init(el, o) {
      return chart(el, o, ({ g, w, h, data, visible, colors, fmt, deco }) => {
        const n = data.labels.length;
        if (!n || !visible.length) return [];
        const hz = o.horizontal;
        const pad = deco ? { t: 0, r: 0, b: 0, l: 0 } : hz ? { t: 8, r: 24, b: 24, l: 72 } : { t: 12, r: 8, b: 28, l: 44 };
        const totals = data.labels.map((_, i) => visible.reduce((a, sr) => a + Math.max(0, sr.values[i] || 0), 0));
        const vals = o.stacked ? totals : visible.flatMap((sr) => sr.values);
        const sc = nice(Math.min(o.min, ...vals), Math.max(...vals, 0), hz ? Math.max(2, Math.floor(w / 90)) : Math.max(2, Math.floor(h / 50)));
        const v = linear([sc.min, sc.max], hz ? [pad.l, w - pad.r] : [h - pad.b, pad.t]);
        const b = band(n, hz ? [pad.t, h - pad.b] : [pad.l, w - pad.r], 0.28);
        if (!deco) {
          if (hz) {
            const ax = s("g", { class: "efx-chart__axis", "aria-hidden": "true" }, g);
            sc.ticks.forEach((t) => {
              s("line", { x1: v(t), x2: v(t), y1: pad.t, y2: h - pad.b, class: "efx-chart__grid" }, ax);
              s("text", { x: v(t), y: h - pad.b + 16, "text-anchor": "middle" }, ax).textContent = fmt(t);
            });
            data.labels.forEach((l, i) => {
              s("text", { x: pad.l - 8, y: b.x(i) + b.bw / 2, "text-anchor": "end", "dominant-baseline": "middle" }, ax).textContent = l;
            });
          } else axes(g, { w, h, pad, y: v, ticks: sc.ticks, labels: data.labels, x: (i) => b.x(i) + b.bw / 2, fmt, grid: o.grid });
        }
        const marks = [];
        const per = o.stacked ? 1 : visible.length;
        const bw = b.bw / per;
        data.labels.forEach((label, i) => {
          let acc = 0;
          visible.forEach((sr, k) => {
            const val = sr.values[i] || 0;
            const a = o.stacked ? acc : Math.min(0, Math.max(sc.min, 0));
            const z = o.stacked ? acc + val : val;
            acc += Math.max(0, val);
            const p0 = v(o.stacked ? a : Math.max(sc.min, 0)), p1 = v(z);
            const off = b.x(i) + (o.stacked ? 0 : k * bw);
            const thick = Math.max(1, (o.stacked ? b.bw : bw) - (per > 1 ? 2 : 0));
            const r = Math.min(o.radius, thick / 2);
            const attrs = hz ? { x: Math.min(p0, p1), y: off, width: Math.abs(p1 - p0), height: thick } : { x: off, y: Math.min(p0, p1), width: thick, height: Math.abs(p1 - p0) };
            const node = s("rect", { ...attrs, rx: r, fill: colors[sr.index], class: `efx-chart__mark ${hz ? "efx-chart__grow-x" : "efx-chart__grow"}`, style: `--i:${i}` }, g);
            if (o.values && !deco && !o.stacked) {
              const t = hz ? s("text", { x: Math.max(p0, p1) + 6, y: off + thick / 2, "dominant-baseline": "middle", class: "efx-chart__value efx-chart__fade", style: `--i:${i}` }, g) : s("text", { x: off + thick / 2, y: Math.min(p0, p1) - 6, "text-anchor": "middle", class: "efx-chart__value efx-chart__fade", style: `--i:${i}` }, g);
              t.textContent = fmt(val);
            }
            const cx = attrs.x + attrs.width / 2, cy = attrs.y + (hz ? attrs.height / 2 : 0);
            marks.push({
              x: cx,
              y: cy,
              label,
              value: val,
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

  // src/effix-entry.js
  var defs = [chart_bar_default];
  if (window.Effix) window.Effix.define(defs);
  else (window.EffixPending = window.EffixPending || []).push(...defs);
})();
