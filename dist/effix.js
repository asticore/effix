/*! Effix v0.1.0 | MIT | https://github.com/asticore/effix */
(() => {
  // src/core.js
  var registry = /* @__PURE__ */ new Map();
  var mounted = /* @__PURE__ */ new WeakMap();
  var doc = typeof document !== "undefined" ? document : null;
  var mq = (q) => typeof matchMedia !== "undefined" ? matchMedia(q) : { matches: false, addEventListener() {
  } };
  var reduceMQ = mq("(prefers-reduced-motion: reduce)");
  var fineMQ = mq("(hover: hover) and (pointer: fine)");
  var motionOK = () => !reduceMQ.matches && !(doc && doc.documentElement.hasAttribute("data-efx-reduce"));
  var finePointer = () => fineMQ.matches;
  var camelKey = (k) => "efx" + k[0].toUpperCase() + k.slice(1);
  function options(el, defaults = {}) {
    const out = {};
    for (const key in defaults) {
      const def = defaults[key];
      const raw = el.dataset[camelKey(key)];
      if (raw === void 0) {
        out[key] = Array.isArray(def) ? def.slice() : def;
        continue;
      }
      if (typeof def === "number") {
        const n = parseFloat(raw);
        out[key] = Number.isFinite(n) ? n : def;
      } else if (typeof def === "boolean") out[key] = raw === "" || raw === "true" || raw === "1" || raw === "on";
      else if (Array.isArray(def)) out[key] = raw.split(raw.includes("|") ? "|" : ",").map((s) => s.trim()).filter(Boolean);
      else out[key] = raw;
    }
    return out;
  }
  function cssVar(el, name, fallback2 = "") {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fallback2;
  }
  function themeColor(el) {
    const cs = getComputedStyle(el);
    for (const n of ["--efx-color", "--sh-tone", "--sh-primary"]) {
      const v = cs.getPropertyValue(n).trim();
      if (v) return v;
    }
    return "#6366f1";
  }
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    return () => target.removeEventListener(type, fn, opts);
  }
  function rafThrottle(fn) {
    let id = 0, args;
    const run = () => {
      id = 0;
      fn(...args);
    };
    const t = (...a) => {
      args = a;
      if (!id) id = requestAnimationFrame(run);
    };
    t.cancel = () => {
      cancelAnimationFrame(id);
      id = 0;
    };
    return t;
  }
  var visIOs = /* @__PURE__ */ new Map();
  function onVisible(el, cb, rootMargin = "0px", threshold = 0) {
    if (typeof IntersectionObserver === "undefined") {
      cb(true, { intersectionRatio: 1, intersectionRect: { height: 1e9 } });
      return () => {
      };
    }
    const key = rootMargin + "|" + threshold;
    let v = visIOs.get(key);
    if (!v) {
      const cbs = /* @__PURE__ */ new WeakMap();
      const io2 = new IntersectionObserver((es) => es.forEach((e) => {
        const s = cbs.get(e.target);
        if (s) [...s].forEach((f2) => f2(e.isIntersecting, e));
      }), { rootMargin, threshold });
      v = { io: io2, cbs };
      visIOs.set(key, v);
    }
    let set = v.cbs.get(el);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      v.cbs.set(el, set);
      v.io.observe(el);
    }
    set.add(cb);
    let done = false;
    return () => {
      if (done) return;
      done = true;
      set.delete(cb);
      if (!set.size && v.cbs.get(el) === set) {
        v.cbs.delete(el);
        v.io.unobserve(el);
      }
    };
  }
  var scrollSubs = /* @__PURE__ */ new Set();
  var scrollBound = false;
  var runScroll = (subs5) => {
    const y = scrollY, h = innerHeight;
    const writes = [];
    subs5.forEach((f2) => {
      const w = f2(y, h);
      if (typeof w === "function") writes.push(w);
    });
    writes.forEach((w) => w());
  };
  var scrollTick = rafThrottle(() => runScroll(scrollSubs));
  var bindScroll = (on2) => {
    const m = on2 ? "addEventListener" : "removeEventListener";
    window[m]("scroll", scrollTick, { passive: true });
    window[m]("resize", scrollTick, { passive: true });
    scrollBound = on2;
  };
  function onScroll(fn) {
    if (!scrollBound) bindScroll(true);
    scrollSubs.add(fn);
    runScroll([fn]);
    return () => {
      scrollSubs.delete(fn);
      if (!scrollSubs.size && scrollBound) {
        bindScroll(false);
        scrollTick.cancel();
      }
    };
  }
  var lazyQueue = /* @__PURE__ */ new WeakMap();
  var lazyIO = null;
  var lazyMargin = () => doc && doc.documentElement.dataset.efxMargin || "200px";
  function mount(el, def) {
    let m = mounted.get(el);
    if (m && m.has(def.name)) return;
    if (!m) {
      m = /* @__PURE__ */ new Map();
      mounted.set(el, m);
    }
    m.set(def.name, null);
    try {
      m.set(def.name, def.init(el, options(el, def.defaults || {}), api) || null);
    } catch (err) {
      m.delete(def.name);
      if (!m.size) mounted.delete(el);
      console.error(`[effix] ${def.name} failed`, err);
      return;
    }
    el.setAttribute("data-efx-ready", [...m.keys()].join(" "));
  }
  function queueLazy(el, def) {
    if (typeof IntersectionObserver === "undefined") return mount(el, def);
    if (!lazyIO) {
      lazyIO = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        const names2 = lazyQueue.get(e.target);
        lazyIO.unobserve(e.target);
        lazyQueue.delete(e.target);
        e.target.removeAttribute("data-efx-lazy");
        if (names2) names2.forEach((n) => registry.has(n) && mount(e.target, registry.get(n)));
      }), { rootMargin: lazyMargin() });
    }
    let s = lazyQueue.get(el);
    if (!s) {
      s = /* @__PURE__ */ new Set();
      lazyQueue.set(el, s);
      lazyIO.observe(el);
      el.setAttribute("data-efx-lazy", "");
    }
    s.add(def.name);
  }
  function scan(root, def) {
    var _a, _b;
    const els = [];
    if (root.nodeType === 1 && root.matches(def.selector)) els.push(root);
    if (root.querySelectorAll) els.push(...root.querySelectorAll(def.selector));
    for (const el of els) {
      if (((_a = mounted.get(el)) == null ? void 0 : _a.has(def.name)) || ((_b = lazyQueue.get(el)) == null ? void 0 : _b.has(def.name)) || el.closest("[data-efx-skip]")) continue;
      if (def.lazy) queueLazy(el, def);
      else mount(el, def);
    }
  }
  function define(...defs) {
    for (const def of defs.flat()) {
      if (!def || !def.name) continue;
      registry.set(def.name, def);
      if (booted && doc) scan(doc, def);
    }
    return api;
  }
  var booted = false;
  function init(root = doc, only) {
    if (!root) return api;
    booted = true;
    for (const def of registry.values()) if (!only || only.includes(def.name)) scan(root, def);
    return api;
  }
  function destroy(root = doc, name) {
    if (!root) return api;
    const sel = "[data-efx-ready], [data-efx-lazy]";
    const els = root.nodeType === 1 ? [root, ...root.querySelectorAll(sel)] : [...root.querySelectorAll(sel)];
    for (const el of els) {
      const q = lazyQueue.get(el);
      if (q) {
        if (name) q.delete(name);
        else q.clear();
        if (!q.size) {
          lazyQueue.delete(el);
          lazyIO.unobserve(el);
          el.removeAttribute("data-efx-lazy");
        }
      }
      const m = mounted.get(el);
      if (!m) continue;
      for (const [n, cleanup] of m) {
        if (name && n !== name) continue;
        try {
          cleanup && cleanup();
        } catch (err) {
          console.error(`[effix] ${n} cleanup failed`, err);
        }
        m.delete(n);
      }
      if (m.size) el.setAttribute("data-efx-ready", [...m.keys()].join(" "));
      else {
        mounted.delete(el);
        el.removeAttribute("data-efx-ready");
      }
    }
    return api;
  }
  function refresh(root = doc, name) {
    destroy(root, name);
    return init(root, name ? [name] : void 0);
  }
  var mo = null;
  var injected = (n) => /(^|\s)efx-[\w-]+__/.test(n.getAttribute("class") || "");
  function observe(target = doc && doc.body) {
    if (mo || !target || typeof MutationObserver === "undefined") return api;
    mo = new MutationObserver((records) => {
      for (const r of records) {
        r.removedNodes.forEach((n) => {
          if (n.nodeType === 1 && !n.isConnected && !injected(n)) destroy(n);
        });
        r.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && n.isConnected && !injected(n) && !n.closest("[data-efx-skip]")) init(n);
        });
      }
    });
    mo.observe(target, { childList: true, subtree: true });
    return api;
  }
  function disconnect() {
    if (mo) {
      mo.disconnect();
      mo = null;
    }
    return api;
  }
  var ext = /* @__PURE__ */ new Map();
  function add(kind, name, impl) {
    if (!ext.has(kind)) ext.set(kind, /* @__PURE__ */ new Map());
    if (name && typeof name === "object") for (const k in name) ext.get(kind).set(k, name[k]);
    else ext.get(kind).set(name, impl);
    return api;
  }
  var get = (kind, name) => {
    var _a;
    return (_a = ext.get(kind)) == null ? void 0 : _a.get(name);
  };
  var list = (kind) => {
    var _a;
    return [...((_a = ext.get(kind)) == null ? void 0 : _a.keys()) || []];
  };
  function setData(el, data) {
    if (typeof el === "string") el = doc && doc.querySelector(el);
    if (el) el.dispatchEvent(new CustomEvent("efx:data", { detail: data }));
    return api;
  }
  var isMounted = (el, name) => {
    var _a;
    return !!((_a = mounted.get(el)) == null ? void 0 : _a.has(name));
  };
  var features = () => [...registry.keys()];
  var api = {
    version: "0.1.0",
    define,
    init,
    destroy,
    refresh,
    observe,
    disconnect,
    options,
    isMounted,
    features,
    add,
    get,
    list,
    setData,
    motionOK,
    finePointer,
    cssVar,
    themeColor,
    on,
    rafThrottle,
    onVisible,
    onScroll
  };
  function autoBoot() {
    if (!doc) return;
    const html = doc.documentElement;
    const cfg = typeof window !== "undefined" && window.EffixConfig || {};
    const pending = typeof window !== "undefined" && window.EffixPending || [];
    if (pending.length) define(pending.splice(0));
    if (typeof window !== "undefined" && window.EffixChartKit && !api.charts) api.charts = window.EffixChartKit;
    if (typeof cfg.extend === "function") {
      try {
        cfg.extend(api);
      } catch (err) {
        console.error("[effix] extend", err);
      }
    }
    if (cfg.auto === false || html.hasAttribute("data-efx-manual")) return;
    const go = () => {
      init();
      if (cfg.observe || html.hasAttribute("data-efx-observe")) observe();
      doc.dispatchEvent(new CustomEvent("efx:ready", { detail: api }));
    };
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", go, { once: true });
    else go();
  }
  var core_default = api;

  // src/features/ambient.js
  var split = (s) => {
    const out = [];
    let d = 0, cur = "";
    for (const ch of String(s)) {
      if (ch === "(") d++;
      else if (ch === ")") d = Math.max(0, d - 1);
      if ((ch === "|" || ch === ",") && !d) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out.map((c) => c.trim()).filter(Boolean);
  };
  var visSubs = /* @__PURE__ */ new Set();
  var visOff = null;
  var onDocVis = () => visSubs.forEach((fn) => fn(document.hidden));
  var subVis = (fn) => {
    visSubs.add(fn);
    if (!visOff) visOff = on(document, "visibilitychange", onDocVis);
    return () => {
      visSubs.delete(fn);
      if (!visSubs.size && visOff) {
        visOff();
        visOff = null;
      }
    };
  };
  var cnt = (div, max) => (a) => Math.max(3, Math.min(max, a / div | 0));
  var fx = (r0, r1, bot2, rf) => (p, S2, first) => {
    p.a = S2.rnd(0, 6.28);
    p.x = S2.rnd(0, S2.w);
    p.y = first ? S2.rnd(0, S2.h) : bot2 ? S2.h + 20 : -20;
    p.r = rf ? S2.rnd(r0, r1) * Math.max(S2.w, S2.h) : S2.rnd(r0, r1);
    p.v = S2.rnd(0.4, 1.2);
  };
  var dot = (c, x, y, r) => {
    c.beginPath();
    c.arc(x, y, r, 0, 6.2832);
  };
  var fall = (up, leaf) => (p, S2) => {
    p.y += (up ? -p.v * 1.2 : p.v * (leaf ? 1 : p.r * 0.4 + 0.3)) * S2.sp;
    p.x += Math.sin(S2.t * p.v + p.a) * (leaf ? 1 : 0.4) * S2.sp;
    if (leaf) p.a += 0.02 * p.v * S2.sp;
    return up ? p.y > -p.r * 2 : p.y < S2.h + 20;
  };
  add("ambient-mode", {
    stars: {
      count: cnt(5e3, 200),
      ptr: 1,
      spawn: fx(0.6, 2.4),
      step: () => 1,
      draw: (c, p, S2) => {
        c.globalAlpha = S2.op * (0.55 + 0.45 * Math.sin(S2.t * 2 * p.v + p.a));
        dot(c, p.x - S2.px * p.r * 12, p.y - S2.py * p.r * 12, p.r);
        c.fill();
      }
    },
    warp: {
      count: cnt(8e3, 160),
      ptr: 1,
      spawn: (p, S2, first) => {
        fx(0.6, 2.4)(p, S2, first);
        p.x = S2.rnd(-1, 1);
        p.y = S2.rnd(-1, 1);
        p.z = first ? S2.rnd(0.05, 1) : 1;
      },
      step: (p, S2) => (p.z -= 6e-3 * S2.sp * p.v) >= 0.03,
      draw: (c, p, S2) => {
        const f2 = S2.w * 0.3, cx = S2.w / 2 + S2.px * S2.w * 0.3, cy = S2.h / 2 + S2.py * S2.h * 0.3, z2 = Math.min(1, p.z + 0.04 * S2.sp);
        c.globalAlpha = S2.op * (1 - p.z);
        c.lineWidth = Math.max(0.5, 1.6 * (1 - p.z));
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(cx + p.x / z2 * f2, cy + p.y / z2 * f2);
        c.lineTo(cx + p.x / p.z * f2, cy + p.y / p.z * f2);
        c.stroke();
      }
    },
    orbs: {
      count: cnt(1e5, 6),
      ptr: 1,
      blend: "lighter",
      spawn: (p, S2, first) => {
        fx(0.25, 0.45, 0, 1)(p, S2, first);
        p.y = S2.rnd(0, S2.h);
        p.vx = S2.rnd(-0.3, 0.3);
        p.vy = S2.rnd(-0.3, 0.3);
      },
      step: (p, S2) => {
        if (S2.ptr.on) {
          p.vx += (S2.ptr.x - p.x) * 2e-6;
          p.vy += (S2.ptr.y - p.y) * 2e-6;
        }
        p.vx *= 0.998;
        p.vy *= 0.998;
        p.x += p.vx * S2.sp;
        p.y += p.vy * S2.sp;
        if (p.x < -p.r * 0.3 || p.x > S2.w + p.r * 0.3) p.vx *= -1;
        if (p.y < -p.r * 0.3 || p.y > S2.h + p.r * 0.3) p.vy *= -1;
        return 1;
      },
      draw: (c, p, S2) => {
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, p.c);
        g.addColorStop(1, "transparent");
        c.globalAlpha = S2.op * 0.55;
        c.fillStyle = g;
        dot(c, p.x, p.y, p.r);
        c.fill();
      }
    },
    waves: {
      count: () => 3,
      step: () => 1,
      spawn: fx(0, 1),
      draw: (c, p, S2) => {
        const { w, h } = S2, i = p.i, base = h * (0.55 + i * 0.12), amp = h * 0.06 * (1 + p.v * 0.5);
        c.globalAlpha = S2.op * (0.22 + i * 0.08);
        c.beginPath();
        c.moveTo(0, h);
        for (let x = 0; x <= w + 8; x += 8) c.lineTo(x, base + Math.sin(x / w * (3 + i) * 2 + S2.t * p.v + p.a) * amp + Math.sin(x / w * 7 - S2.t * 0.7 * p.v) * amp * 0.3);
        c.lineTo(w, h);
        c.fill();
      }
    },
    snow: { count: cnt(9e3, 120), spawn: fx(0.6, 2.4), step: fall(), draw: (c, p, S2) => {
      c.globalAlpha = S2.op;
      dot(c, p.x, p.y, p.r);
      c.fill();
    } },
    leaves: {
      count: cnt(3e4, 25),
      spawn: fx(5, 11),
      step: fall(0, 1),
      draw: (c, p, S2) => {
        c.globalAlpha = S2.op * 0.85;
        c.beginPath();
        c.ellipse(p.x, p.y, p.r, p.r * 0.45, p.a, 0, 6.2832);
        c.fill();
      }
    },
    bubbles: {
      count: cnt(16e3, 40),
      spawn: fx(3, 14, 1),
      step: fall(1),
      draw: (c, p, S2) => {
        c.globalAlpha = S2.op * 0.5;
        c.lineWidth = 1;
        dot(c, p.x, p.y, p.r);
        c.stroke();
        c.globalAlpha = S2.op * 0.6;
        dot(c, p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.2);
        c.fill();
      }
    }
  });
  var ambient_default = {
    name: "ambient",
    selector: ".efx-ambient",
    lazy: true,
    defaults: { mode: "stars", count: 0, color: "", speed: 1, opacity: 1, interact: true },
    init(el, o) {
      let restorePos = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restorePos = true;
      }
      const cv2 = document.createElement("canvas");
      cv2.className = "efx-ambient__canvas";
      cv2.setAttribute("aria-hidden", "true");
      el.insertBefore(cv2, el.firstChild);
      const ctx2 = cv2.getContext("2d");
      const M = get("ambient-mode", o.mode) || get("ambient-mode", "stars");
      const motion = motionOK();
      const colors = o.color ? split(o.color) : [];
      if (!colors.length) colors.push(themeColor(el));
      let w = 0, h = 0, ps2 = [], raf2 = 0, vis = true, hidden = document.hidden;
      const S2 = { w: 0, h: 0, t: 0, sp: o.speed, op: o.opacity, px: 0, py: 0, ptr: { x: 0, y: 0, on: 0 }, rnd: (a, b) => a + Math.random() * (b - a) };
      const ptr = S2.ptr;
      const spawn = (p, first) => {
        p.c = colors[Math.random() * colors.length | 0];
        M.spawn(p, S2, first);
        return p;
      };
      const seed = () => {
        const dpr2 = Math.min(devicePixelRatio || 1, 1.5);
        w = S2.w = el.clientWidth;
        h = S2.h = el.clientHeight;
        cv2.width = w * dpr2;
        cv2.height = h * dpr2;
        ctx2.setTransform(dpr2, 0, 0, dpr2, 0, 0);
        const n = o.count ? Math.min(600, Math.max(0, o.count | 0)) : M.count(w * h);
        ps2 = Array.from({ length: n }, (_, i) => spawn({ i }, 1));
        draw2();
      };
      const draw2 = () => {
        ctx2.clearRect(0, 0, w, h);
        ctx2.globalCompositeOperation = M.blend || "source-over";
        S2.px = ptr.on ? (ptr.x - w / 2) / w : 0;
        S2.py = ptr.on ? (ptr.y - h / 2) / h : 0;
        for (const p of ps2) {
          ctx2.globalAlpha = o.opacity;
          ctx2.fillStyle = ctx2.strokeStyle = p.c;
          M.draw(ctx2, p, S2);
        }
        ctx2.globalAlpha = 1;
        ctx2.globalCompositeOperation = "source-over";
      };
      const step = () => {
        raf2 = 0;
        S2.t += 0.016 * S2.sp;
        for (const p of ps2) if (!M.step(p, S2)) spawn(p);
        draw2();
        go();
      };
      const go = () => {
        if (motion && vis && !hidden && !raf2) raf2 = requestAnimationFrame(step);
      };
      const offs = [];
      seed();
      if (motion) {
        offs.push(onVisible(el, (v) => {
          vis = v;
          if (v) go();
          else {
            cancelAnimationFrame(raf2);
            raf2 = 0;
          }
        }));
        offs.push(subVis((hd) => {
          hidden = hd;
          if (hd) {
            cancelAnimationFrame(raf2);
            raf2 = 0;
          } else go();
        }));
        if (o.interact && finePointer() && M.ptr) {
          let rect = null;
          const stale = () => {
            rect = null;
          };
          offs.push(on(el, "pointermove", (e) => {
            const r = rect || (rect = el.getBoundingClientRect());
            ptr.x = e.clientX - r.left;
            ptr.y = e.clientY - r.top;
            ptr.on = 1;
          }));
          offs.push(on(el, "pointerleave", () => {
            ptr.on = 0;
            rect = null;
          }));
          offs.push(on(window, "scroll", stale, { passive: true, capture: true }), on(window, "resize", stale, { passive: true }));
        }
      }
      let ro;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          if (el.clientWidth !== w || el.clientHeight !== h) seed();
        });
        ro.observe(el);
      }
      return () => {
        cancelAnimationFrame(raf2);
        raf2 = 0;
        vis = false;
        offs.forEach((f2) => f2());
        ro && ro.disconnect();
        cv2.remove();
        if (restorePos) el.style.position = "";
      };
    }
  };

  // src/features/border.js
  var border_default = {
    name: "border",
    selector: ".efx-border-spin,.efx-border-trace,.efx-border-glow,.efx-border-gradient",
    defaults: { colors: [], speed: 0, width: 0, loading: "", timeout: 0 },
    init(el, o) {
      const st = el.style, cl = el.classList, offs = [];
      if (o.colors.length) st.setProperty("--efx-border-colors", o.colors.join(","));
      if (o.speed > 0) st.setProperty("--efx-border-speed", o.speed + "s");
      if (o.width > 0) st.setProperty("--efx-border-width", o.width + "px");
      let restorePos = false;
      if (getComputedStyle(el).position === "static") {
        st.position = "relative";
        restorePos = true;
      }
      const ok = motionOK();
      if (!ok) cl.add("is-static");
      const gated = o.loading === "click";
      let vis = true, busy = false, t = 0, wasAria = null;
      const sync = () => cl.toggle("is-paused", !ok || !vis || gated && !busy);
      const restoreAria = () => {
        if (wasAria === null) el.removeAttribute("aria-disabled");
        else el.setAttribute("aria-disabled", wasAria);
      };
      const stop = () => {
        if (!busy) return;
        busy = false;
        clearTimeout(t);
        cl.remove("is-loading");
        el.removeAttribute("aria-busy");
        restoreAria();
        sync();
      };
      if (gated) {
        offs.push(on(el, "click", (e) => {
          if (busy) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
          }
          busy = true;
          wasAria = el.getAttribute("aria-disabled");
          cl.add("is-loading");
          el.setAttribute("aria-busy", "true");
          el.setAttribute("aria-disabled", "true");
          if (o.timeout > 0) t = setTimeout(stop, o.timeout);
          sync();
        }), on(el, "efx:done", stop));
      }
      if (ok) offs.push(onVisible(el, (v) => {
        vis = v;
        sync();
      }));
      sync();
      return () => {
        offs.forEach((f2) => f2());
        clearTimeout(t);
        if (busy) restoreAria();
        if (restorePos) st.position = "";
        cl.remove("is-paused", "is-static", "is-loading");
        el.removeAttribute("aria-busy");
        ["--efx-border-colors", "--efx-border-speed", "--efx-border-width"].forEach((p) => st.removeProperty(p));
      };
    }
  };

  // src/features/carousel.js
  var carousel_default = {
    name: "carousel",
    selector: ".efx-carousel",
    defaults: { autoplay: 0, loop: true, dots: true, arrows: true, perView: 0, fade: false },
    init(el, o) {
      const slides = [...el.children], n = slides.length;
      if (!n) return;
      const reduce = !motionOK();
      const auto = o.autoplay > 0 && !reduce;
      const act = /* @__PURE__ */ new Set(), offs = [];
      let cur = 0, timer = 0, paused = false, hover = false, seen = true;
      const btn = (cls, label, txt) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = cls;
        b.setAttribute("aria-label", label);
        if (txt) b.textContent = txt;
        return b;
      };
      const nav = document.createElement("div");
      nav.className = "efx-carousel__nav";
      const prev = btn("btn btn-icon btn-ghost efx-carousel__prev", "Previous slide", "\u2039");
      const next = btn("btn btn-icon btn-ghost efx-carousel__next", "Next slide", "\u203A");
      const dots = slides.map((_, i) => btn("efx-carousel__dot", `Go to slide ${i + 1}`));
      const dotBox = document.createElement("div");
      dotBox.className = "efx-carousel__dots";
      if (o.arrows) nav.appendChild(prev);
      if (o.dots) {
        dotBox.append(...dots);
        nav.appendChild(dotBox);
      }
      if (o.arrows) nav.appendChild(next);
      let pause;
      if (auto) {
        pause = btn("btn btn-icon btn-ghost efx-carousel__pause", "Pause autoplay", "\u23F8");
        nav.appendChild(pause);
      }
      if (nav.children.length) el.after(nav);
      const tab = el.getAttribute("tabindex");
      if (tab === null) el.setAttribute("tabindex", "0");
      if (o.fade) el.classList.add("efx-carousel-fade");
      if (o.perView > 0 && !o.fade) {
        el.style.setProperty("--efx-per-view", o.perView);
        slides.forEach((s) => {
          s.style.flexBasis = "calc(100% / var(--efx-per-view))";
        });
      }
      const mark = () => {
        slides.forEach((s, i) => s.classList.toggle("is-active", act.has(i)));
        dots.forEach((d, i) => {
          if (i === cur) d.setAttribute("aria-current", "true");
          else d.removeAttribute("aria-current");
        });
      };
      const go = (i) => {
        i = Math.max(0, Math.min(n - 1, i));
        if (o.fade) {
          act.clear();
          act.add(i);
          cur = i;
          mark();
          return;
        }
        const r = slides[i].getBoundingClientRect().left - el.getBoundingClientRect().left;
        el.scrollTo({ left: el.scrollLeft + r, behavior: reduce ? "instant" : "smooth" });
      };
      const atEnd = () => o.fade ? cur >= n - 1 : el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      const goNext = () => {
        if (atEnd()) {
          if (o.loop) go(0);
        } else go(cur + 1);
      };
      const goPrev = () => {
        if (cur <= 0) {
          if (o.loop) go(n - 1);
        } else go(cur - 1);
      };
      const sched = () => {
        clearTimeout(timer);
        if (auto && !paused && !hover && seen) timer = setTimeout(() => {
          goNext();
          sched();
        }, o.autoplay);
      };
      offs.push(on(prev, "click", () => {
        goPrev();
        sched();
      }), on(next, "click", () => {
        goNext();
        sched();
      }));
      dots.forEach((d, i) => offs.push(on(d, "click", () => {
        go(i);
        sched();
      })));
      offs.push(on(el, "keydown", (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return;
        const t = e.target;
        if (t !== el && t.closest && t.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) return;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goNext();
          sched();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          goPrev();
          sched();
        }
      }));
      if (auto) {
        const hov = (v) => () => {
          hover = v;
          sched();
        };
        for (const t of [el, nav]) {
          offs.push(on(t, "pointerenter", hov(true)), on(t, "pointerleave", hov(false)), on(t, "focusin", hov(true)), on(t, "focusout", hov(false)));
        }
        offs.push(on(pause, "click", () => {
          paused = !paused;
          pause.textContent = paused ? "\u25B6" : "\u23F8";
          pause.setAttribute("aria-label", paused ? "Play autoplay" : "Pause autoplay");
          sched();
        }));
        offs.push(onVisible(el, (v) => {
          seen = v;
          sched();
        }));
      }
      let io2;
      if (o.fade) {
        act.add(0);
        mark();
      } else if (typeof IntersectionObserver !== "undefined") {
        io2 = new IntersectionObserver((es) => {
          es.forEach((e) => {
            const i = slides.indexOf(e.target);
            if (e.isIntersecting) act.add(i);
            else act.delete(i);
          });
          if (act.size) cur = Math.min(...act);
          mark();
        }, { root: el, threshold: 0.6 });
        slides.forEach((s) => io2.observe(s));
      }
      sched();
      return () => {
        clearTimeout(timer);
        offs.forEach((f2) => f2());
        io2 && io2.disconnect();
        nav.remove();
        if (tab === null) el.removeAttribute("tabindex");
        el.classList.remove("efx-carousel-fade");
        el.style.removeProperty("--efx-per-view");
        slides.forEach((s) => {
          s.classList.remove("is-active");
          s.style.flexBasis = "";
        });
      };
    }
  };

  // src/features/collapse.js
  var names = /* @__PURE__ */ new Map();
  var collapse_default = {
    name: "collapse",
    selector: ".efx-collapse",
    defaults: { duration: 300, easing: "ease" },
    init(el, o) {
      const list2 = el.matches("details") ? [el] : [...el.querySelectorAll("details")];
      const anim = /* @__PURE__ */ new Map();
      const closedH = (d) => {
        const cs = getComputedStyle(d), s = d.querySelector(":scope > summary");
        return (s ? s.getBoundingClientRect().bottom : d.getBoundingClientRect().top) - d.getBoundingClientRect().top + parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth);
      };
      const run = (d, to) => {
        const h0 = d.offsetHeight, prev = anim.get(d);
        if (prev) prev.a.cancel();
        if (to) d.open = true;
        const h1 = to ? d.offsetHeight : closedH(d), s = d.style;
        const saved = prev ? prev.saved : [s.overflow, s.boxSizing];
        s.overflow = "hidden";
        s.boxSizing = "border-box";
        const a = d.animate({ height: [h0 + "px", h1 + "px"] }, { duration: o.duration, easing: o.easing });
        const rec = { a, to, saved };
        anim.set(d, rec);
        return a.finished.then(() => {
          if (anim.get(d) !== rec) return 0;
          anim.delete(d);
          [s.overflow, s.boxSizing] = saved;
          if (!to) d.open = false;
          return 1;
        }, () => 0);
      };
      const click = (e) => {
        const d = e.currentTarget.parentElement;
        if (!motionOK() || e.target.closest("a[href]")) return;
        e.preventDefault();
        const to = anim.has(d) ? !anim.get(d).to : !d.open, jobs = [];
        const name = d.getAttribute("name");
        const others = to && name ? [...document.querySelectorAll(`details[name="${CSS.escape(name)}"][open]`)].filter((x) => x !== d) : [];
        if (others.length) {
          [d, ...others].forEach((x) => {
            names.set(x, name);
            x.removeAttribute("name");
          });
          others.forEach((x) => jobs.push(run(x, false)));
        }
        jobs.push(run(d, to));
        if (others.length) Promise.all(jobs).then(() => [d, ...others].forEach((x) => {
          if (names.has(x)) {
            x.setAttribute("name", names.get(x));
            names.delete(x);
          }
        }));
      };
      const toggled = (e) => {
        const rec = anim.get(e.target);
        if (rec && e.target.open !== rec.to && !(rec.to === false && e.target.open)) {
          rec.a.cancel();
          anim.delete(e.target);
        }
      };
      const offs = list2.map((d) => {
        const s = d.querySelector(":scope > summary");
        return [s && on(s, "click", click), on(d, "toggle", toggled)];
      }).flat().filter(Boolean);
      return () => {
        offs.forEach((f2) => f2());
        anim.forEach((rec, d) => {
          rec.a.cancel();
          d.open = rec.to;
          [d.style.overflow, d.style.boxSizing] = rec.saved;
        });
        anim.clear();
        names.forEach((n, d) => d.setAttribute("name", n));
        names.clear();
      };
    }
  };

  // src/features/compare.js
  var compare_default = {
    name: "compare",
    selector: ".efx-compare",
    defaults: { start: 50, vertical: false, hover: false },
    init(el, o) {
      const after = el.querySelectorAll(":scope > img")[1];
      if (!after) return;
      const mk = (tag, cls) => {
        const n = document.createElement(tag);
        n.className = "efx-compare__" + cls;
        return n;
      };
      const clip = mk("div", "clip"), handle = mk("div", "handle"), knob = mk("span", "knob"), input = mk("input", "range");
      handle.setAttribute("aria-hidden", "true");
      handle.appendChild(knob);
      Object.assign(input, { type: "range", min: 0, max: 100, step: 1 });
      input.setAttribute("aria-label", "Comparison position");
      if (o.vertical) {
        el.classList.add("efx-compare-vertical");
        input.setAttribute("aria-orientation", "vertical");
      }
      const pos = el.style.position, setPos = getComputedStyle(el).position === "static";
      if (setPos) el.style.position = "relative";
      after.before(clip);
      clip.appendChild(after);
      el.append(input, handle);
      const set = (p) => {
        p = Math.max(0, Math.min(100, p));
        el.style.setProperty("--efx-pos", p + "%");
        input.value = p;
        input.setAttribute("aria-valuetext", Math.round(p) + "%");
      };
      const fromEvent = (e) => {
        const r = el.getBoundingClientRect();
        set(o.vertical ? (e.clientY - r.top) / r.height * 100 : (e.clientX - r.left) / r.width * 100);
      };
      let drag = false;
      const offs = [
        on(el, "pointerdown", (e) => {
          if (e.button) return;
          drag = true;
          el.setPointerCapture(e.pointerId);
          el.classList.add("is-dragging");
          fromEvent(e);
        }),
        on(el, "pointermove", (e) => {
          if (drag || o.hover && finePointer() && e.pointerType === "mouse") fromEvent(e);
        }),
        on(el, "pointerup", () => {
          drag = false;
          el.classList.remove("is-dragging");
        }),
        on(el, "pointercancel", () => {
          drag = false;
          el.classList.remove("is-dragging");
        }),
        on(input, "input", () => set(+input.value))
      ];
      set(o.start);
      return () => {
        offs.forEach((f2) => f2());
        clip.replaceWith(after);
        input.remove();
        handle.remove();
        el.classList.remove("efx-compare-vertical", "is-dragging");
        el.style.removeProperty("--efx-pos");
        if (setPos) el.style.position = pos;
      };
    }
  };

  // src/features/confetti.js
  add("confetti-shape", {
    square: (c, s) => c.fillRect(-s / 2, -s / 2, s, s),
    circle: (c, s) => {
      c.beginPath();
      c.arc(0, 0, s / 2, 0, 7);
      c.fill();
    },
    strip: (c, s) => c.fillRect(-s / 2, -s / 6, s, s / 3)
  });
  var cv = null;
  var ctx = null;
  var ps = [];
  var raf = 0;
  var dpr = 1;
  var rnd = (a, b) => a + Math.random() * (b - a);
  var draw = () => {
    raf = 0;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ps = ps.filter((p) => {
      p.vy += 0.35 * p.g;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life--;
      if (p.life <= 0 || p.y > innerHeight + 20) return false;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / 25);
      ctx.translate(p.x * dpr, p.y * dpr);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      const s = p.s * dpr;
      (get("confetti-shape", p.shape) || get("confetti-shape", "square"))(ctx, s, p);
      ctx.restore();
      return true;
    });
    if (ps.length) raf = requestAnimationFrame(draw);
    else {
      cv.remove();
      cv = ctx = null;
    }
  };
  var burst = (x, y, o, colors) => {
    if (!cv) {
      cv = document.createElement("canvas");
      cv.className = "efx-confetti__canvas";
      cv.setAttribute("aria-hidden", "true");
      cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483000";
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      ctx = cv.getContext("2d");
      document.body.append(cv);
    }
    const shapes = o.shapes.length ? o.shapes : ["square"];
    const spread = o.spread * Math.PI / 180;
    const count = Math.min(500, Math.max(0, o.count | 0));
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + rnd(-spread / 2, spread / 2), v = o.velocity * rnd(0.4, 1);
      ps.push({
        x,
        y,
        vx: Math.cos(a) * v / 2,
        vy: Math.sin(a) * v / 2,
        g: o.gravity,
        rot: rnd(0, 6.28),
        vr: rnd(-0.3, 0.3),
        s: rnd(6, 11),
        life: rnd(70, 120) | 0,
        c: colors[Math.random() * colors.length | 0],
        shape: shapes[Math.random() * shapes.length | 0]
      });
    }
    if (!raf) raf = requestAnimationFrame(draw);
  };
  var refs = 0;
  var docOff = null;
  var DEF = { count: 80, spread: 70, velocity: 45, gravity: 1, colors: [], shapes: ["square", "circle", "strip"], origin: "" };
  var palette = (el, o) => {
    if (o.colors.length) return o.colors;
    const c = [themeColor(el)];
    for (const [n, f2] of [["--sh-accent", "#db2777"], ["--sh-success", "#15803d"], ["--sh-warning", "#b45309"], ["--sh-danger", "#dc2626"]]) c.push(cssVar(el, n, f2));
    return c;
  };
  var fire = (el, o, e) => {
    if (!motionOK()) {
      el.animate && el.animate({ scale: [1, 1.06, 1] }, 220);
      return;
    }
    const r = el.getBoundingClientRect();
    let x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (o.origin) {
      const [ox, oy] = o.origin.split(/[ ,]+/).map(parseFloat);
      if (ox === ox && oy === oy) {
        x = ox / 100 * innerWidth;
        y = oy / 100 * innerHeight;
      }
    } else if (e && e.type === "click" && e.clientX) {
      x = e.clientX;
      y = e.clientY;
    }
    burst(x, y, o, palette(el, o));
  };
  var onEvt = (e) => {
    const d = e.detail || {}, o = { ...DEF, ...d };
    if (typeof o.colors === "string") o.colors = o.colors.split("|");
    const t = e.target instanceof Element ? e.target : null;
    if (t) fire(t, o);
    else if (motionOK()) burst(innerWidth / 2, innerHeight / 2, o, palette(document.documentElement, o));
  };
  var confetti_default = {
    name: "confetti",
    selector: ".efx-confetti",
    defaults: { trigger: "click", count: 80, spread: 70, velocity: 45, gravity: 1, colors: [], shapes: ["square", "circle", "strip"], origin: "" },
    init(el, o) {
      if (!refs++) docOff = on(document, "efx:confetti", onEvt);
      const offs = [() => {
        if (!--refs && docOff) {
          docOff();
          docOff = null;
        }
      }];
      let stopVis = () => {
      };
      if (o.trigger === "done") offs.push(on(el, "efx:done", () => fire(el, o)));
      else if (o.trigger === "view") {
        stopVis = onVisible(el, (v) => {
          if (v) {
            fire(el, o);
            stopVis();
          }
        }, "0px", 0.5);
      } else offs.push(on(el, "click", (e) => fire(el, o, e)));
      return () => {
        stopVis();
        offs.forEach((f2) => f2());
      };
    }
  };

  // src/features/copy.js
  var fallback = (text) => {
    const prev = document.activeElement;
    const t = document.createElement("textarea");
    t.value = text;
    t.setAttribute("readonly", "");
    t.style.cssText = "position:fixed;top:0;opacity:0";
    document.body.appendChild(t);
    t.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
    }
    t.remove();
    if (prev && prev.focus && prev !== document.body) try {
      prev.focus({ preventScroll: true });
    } catch (e) {
    }
    return ok;
  };
  var copy_default = {
    name: "copy",
    selector: ".efx-copy",
    defaults: { target: "", text: "", done: "Copied!", duration: 1800 },
    init(el, o) {
      const html = el.innerHTML;
      const live = document.createElement("span");
      live.className = "efx-copy__live";
      live.setAttribute("aria-live", "polite");
      el.after(live);
      let timer = 0, dead = false, changed = false;
      const restore = () => {
        if (changed) {
          el.innerHTML = html;
          changed = false;
        }
        el.classList.remove("is-copied");
        live.textContent = "";
      };
      const off = on(el, "click", async () => {
        let text = o.text;
        if (!text && o.target) {
          let t = null;
          try {
            t = document.querySelector(o.target);
          } catch (e) {
          }
          text = t ? "value" in t ? t.value : t.textContent : "";
        }
        if (!text) return;
        let ok = false;
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch (e) {
          ok = fallback(text);
        }
        if (dead || !ok) return;
        el.textContent = o.done;
        changed = true;
        el.classList.add("is-copied");
        live.textContent = o.done;
        clearTimeout(timer);
        timer = setTimeout(restore, o.duration);
      });
      return () => {
        dead = true;
        off();
        clearTimeout(timer);
        restore();
        live.remove();
      };
    }
  };

  // src/features/countdown.js
  var countdown_default = {
    name: "countdown",
    selector: ".efx-countdown",
    defaults: { to: "", units: "dhms", labels: ["Days", "Hours", "Minutes", "Seconds"], expired: "", pad: true, compact: false },
    init(el, o) {
      const end = new Date(o.to).getTime();
      if (!Number.isFinite(end)) return;
      const saved = el.innerHTML, prev = ["role", "aria-live", "aria-label"].map((a) => el.getAttribute(a));
      const SEC = { d: 86400, h: 3600, m: 60, s: 1 }, NAME = { d: "day", h: "hour", m: "minute", s: "second" };
      const us = [..."dhms"].filter((u) => o.units.includes(u));
      const labels = o.labels, nums = {};
      const p2 = (n, u) => o.pad && u !== "d" ? String(n).padStart(2, "0") : String(n);
      el.setAttribute("role", "timer");
      el.setAttribute("aria-live", "off");
      let tm = 0, done = false, lastMin = -1, txt = null;
      if (!o.compact) {
        el.textContent = "";
        us.forEach((u) => {
          const cell = document.createElement("div"), n = document.createElement("span"), l = document.createElement("span");
          cell.className = "efx-countdown__unit";
          n.className = "efx-countdown__num";
          l.className = "efx-countdown__label";
          l.textContent = labels["dhms".indexOf(u)] || "";
          nums[u] = n;
          cell.append(n, l);
          el.append(cell);
        });
      }
      const render = () => {
        let left = Math.max(0, Math.round((end - Date.now()) / 1e3));
        const v = {};
        us.forEach((u) => {
          v[u] = Math.floor(left / SEC[u]);
          left -= v[u] * SEC[u];
        });
        if (o.compact) {
          const t = us.map((u) => u === "d" ? v.d + "d" : p2(v[u], u));
          const s = (us[0] === "d" ? t.shift() + " " : "") + t.join(":");
          if (s !== txt) el.textContent = txt = s;
        } else us.forEach((u) => {
          const s = p2(v[u], u);
          if (nums[u].textContent !== s) nums[u].textContent = s;
        });
        const rem = Math.max(0, end - Date.now()), min = Math.floor(rem / 6e4);
        if (min !== lastMin || rem === 0) {
          lastMin = min;
          let s = Math.round(rem / 1e3);
          const parts = us.map((u) => {
            const n = Math.floor(s / SEC[u]);
            s -= n * SEC[u];
            return n ? `${n} ${NAME[u]}${n > 1 ? "s" : ""}` : "";
          }).filter(Boolean);
          el.setAttribute("aria-label", rem ? parts.join(", ") + " remaining" : o.expired || "Countdown finished");
        }
        return rem;
      };
      const tick = () => {
        if (render() > 0) {
          tm = setTimeout(tick, 1e3 - Date.now() % 1e3 + 5);
          return;
        }
        if (done) return;
        done = true;
        if (o.expired) el.textContent = o.expired;
        el.classList.add("is-done");
        el.dispatchEvent(new CustomEvent("efx:done", { bubbles: true }));
      };
      const vis = () => {
        clearTimeout(tm);
        if (!document.hidden && !done) tick();
      };
      document.addEventListener("visibilitychange", vis);
      tick();
      return () => {
        clearTimeout(tm);
        document.removeEventListener("visibilitychange", vis);
        el.innerHTML = saved;
        el.classList.remove("is-done");
        ["role", "aria-live", "aria-label"].forEach((a, i) => prev[i] === null ? el.removeAttribute(a) : el.setAttribute(a, prev[i]));
      };
    }
  };

  // src/features/_easing.js
  var io = (t) => t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
  var oc = (t) => 1 - Math.pow(1 - t, 3);
  add("easing", {
    linear: (t) => t,
    "ease-in": (t) => t * t,
    "ease-out": (t) => 1 - (1 - t) * (1 - t),
    "ease-in-out": io,
    "ease-out-cubic": oc,
    "back-out": (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    "elastic-out": (t) => t <= 0 || t >= 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * 2.0944) + 1,
    in: (t) => t * t,
    out: (t) => 1 - (1 - t) * (1 - t),
    inout: io
  });
  var ease = (name) => get("easing", name) || get("easing", "linear");

  // src/features/counter.js
  var counter_default = {
    name: "counter",
    selector: ".efx-counter",
    defaults: { from: 0, to: NaN, duration: 1600, decimals: -1, separator: ",", ease: "ease-out-cubic", prefix: "", suffix: "", once: true },
    init(el, o) {
      const orig = el.textContent, hadHidden = el.getAttribute("aria-hidden");
      const to = Number.isFinite(o.to) ? o.to : parseFloat(orig.replace(/[^0-9.\-]/g, ""));
      if (!Number.isFinite(to)) return;
      const dec = o.decimals >= 0 ? o.decimals : Math.max((String(Number.isFinite(o.to) ? o.to : orig.replace(/[^0-9.]/g, "")).split(".")[1] || "").length, (String(o.from).split(".")[1] || "").length);
      const fmt = (n) => {
        const [i, d] = Math.abs(n).toFixed(dec).split(".");
        return o.prefix + (n < 0 ? "-" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, o.separator) + (d ? "." + d : "") + o.suffix;
      };
      const final = () => {
        el.textContent = fmt(to);
      };
      let raf2 = 0;
      const e = ease(o.ease);
      const run = () => {
        cancelAnimationFrame(raf2);
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - t0) / o.duration);
          el.textContent = fmt(o.from + (to - o.from) * e(p));
          if (p < 1) raf2 = requestAnimationFrame(step);
        };
        raf2 = requestAnimationFrame(step);
      };
      if (!motionOK()) {
        final();
        return () => {
          el.textContent = orig;
        };
      }
      const sr = document.createElement("span");
      sr.className = "efx-counter__sr";
      sr.textContent = fmt(to);
      el.after(sr);
      el.setAttribute("aria-hidden", "true");
      el.textContent = fmt(o.from);
      let stop = () => {
      };
      stop = onVisible(el, (v) => {
        if (v) {
          run();
          if (o.once) stop();
        } else if (!o.once) {
          cancelAnimationFrame(raf2);
          el.textContent = fmt(o.from);
        }
      });
      return () => {
        stop();
        cancelAnimationFrame(raf2);
        el.textContent = orig;
        sr.remove();
        hadHidden === null ? el.removeAttribute("aria-hidden") : el.setAttribute("aria-hidden", hadHidden);
      };
    }
  };

  // src/features/cursor.js
  var cursor_default = {
    name: "cursor",
    selector: ".efx-cursor",
    defaults: {
      style: "ring",
      size: 32,
      color: "",
      hideNative: false,
      blend: false,
      hover: "a,button,[role=button],input,select,textarea,label,summary,.efx-cursor-hover"
    },
    init(el, o) {
      if (!finePointer() || !motionOK()) return;
      let hoverSel = o.hover;
      try {
        document.querySelector(hoverSel);
      } catch {
        hoverSel = "a,button,[role=button],input,select,textarea,label,summary,.efx-cursor-hover";
      }
      const mk = (k) => {
        const d = document.createElement("div");
        d.className = "efx-cursor__" + k;
        d.setAttribute("aria-hidden", "true");
        d.style.cssText = "opacity:0;--efx-cursor-size:" + (k === "ring" ? o.size : Math.max(6, o.size / 5)) + "px";
        if (o.color) d.style.setProperty("--efx-cursor-color", o.color);
        else d.style.setProperty("--efx-cursor-color", themeColor(el));
        if (o.blend) d.classList.add("efx-cursor--blend");
        document.body.appendChild(d);
        return d;
      };
      const ring = o.style !== "dot" ? mk("ring") : null;
      const dot2 = o.style !== "ring" ? mk("dot") : null;
      const parts = [ring, dot2].filter(Boolean);
      if (o.hideNative) el.classList.add("efx-cursor-hide");
      let tx = 0, ty = 0, rx = 0, ry = 0, raf2 = 0, seen = false;
      const put = (n, x, y) => {
        n.style.transform = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
      };
      const tick = () => {
        raf2 = 0;
        rx += (tx - rx) * 0.2;
        ry += (ty - ry) * 0.2;
        if (Math.abs(tx - rx) < 0.3 && Math.abs(ty - ry) < 0.3) {
          rx = tx;
          ry = ty;
        } else raf2 = requestAnimationFrame(tick);
        put(ring, rx, ry);
      };
      const show2 = (v) => parts.forEach((n) => {
        n.style.opacity = v ? "" : "0";
      });
      const offs = [
        on(document, "pointermove", (e) => {
          if (e.pointerType === "touch") return;
          tx = e.clientX;
          ty = e.clientY;
          if (dot2) put(dot2, tx, ty);
          if (ring) {
            if (!seen) {
              rx = tx;
              ry = ty;
              put(ring, rx, ry);
            } else if (!raf2) raf2 = requestAnimationFrame(tick);
          }
          seen = true;
          show2(true);
          const h = !!(e.target.closest && e.target.closest(hoverSel));
          parts.forEach((n) => n.toggleAttribute("data-hover", h));
        }, { passive: true }),
        on(document, "pointerdown", () => parts.forEach((n) => n.setAttribute("data-down", ""))),
        on(document, "pointerup", () => parts.forEach((n) => n.removeAttribute("data-down"))),
        on(document.documentElement, "pointerleave", () => {
          seen = false;
          show2(false);
        }),
        on(window, "blur", () => {
          seen = false;
          show2(false);
        })
      ];
      return () => {
        offs.forEach((f2) => f2());
        cancelAnimationFrame(raf2);
        parts.forEach((n) => n.remove());
        el.classList.remove("efx-cursor-hide");
      };
    }
  };

  // src/features/direction.js
  var direction_default = {
    name: "direction",
    selector: ".efx-direction",
    defaults: { fill: true },
    init(el, o) {
      let restorePos = false;
      if (o.fill) {
        if (getComputedStyle(el).position === "static") {
          el.style.position = "relative";
          restorePos = true;
        }
        el.classList.add("efx-direction-fill");
      }
      const edge = (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left) / (r.width || 1) - 0.5, dy = (e.clientY - r.top) / (r.height || 1) - 0.5;
        return Math.abs(dx) > Math.abs(dy) ? dx < 0 ? "left" : "right" : dy < 0 ? "top" : "bottom";
      };
      const enter = (from) => {
        el.setAttribute("data-efx-from", from);
        el.classList.add("efx-direction-snap");
        void el.offsetWidth;
        el.classList.remove("efx-direction-snap");
        el.classList.add("is-hover");
      };
      const leave = (from) => {
        el.setAttribute("data-efx-from", from);
        el.classList.remove("is-hover");
      };
      const mouse = (e) => e.pointerType !== "touch";
      const offs = [
        on(el, "pointerenter", (e) => mouse(e) && enter(edge(e))),
        on(el, "pointerleave", (e) => mouse(e) && leave(edge(e))),
        on(el, "focusin", (e) => {
          try {
            if (e.target.matches(":focus-visible")) enter("left");
          } catch (_) {
          }
        }),
        on(el, "focusout", (e) => {
          if (el.matches(":hover") || e.relatedTarget && el.contains(e.relatedTarget)) return;
          leave("left");
        })
      ];
      return () => {
        offs.forEach((f2) => f2());
        el.classList.remove("is-hover", "efx-direction-fill", "efx-direction-snap");
        el.removeAttribute("data-efx-from");
        if (restorePos) el.style.position = "";
      };
    }
  };

  // src/features/divider.js
  var parents = /* @__PURE__ */ new WeakMap();
  var claimParent = (p) => {
    let rec = parents.get(p);
    if (!rec) {
      rec = { count: 0, prev: p.style.position };
      parents.set(p, rec);
      p.style.position = "relative";
    }
    rec.count++;
  };
  var releaseParent = (p) => {
    const rec = parents.get(p);
    if (!rec) return;
    if (--rec.count <= 0) {
      p.style.position = rec.prev;
      parents.delete(p);
    }
  };
  var f = (n) => +n.toFixed(1);
  var wave = (amp, cyc, ph, base) => [base + amp * Math.sin(ph), "b", (ox) => {
    let d = "";
    for (let x = 10; x <= 1200; x += 10) d += `L${ox + x},${f(base + amp * Math.sin(6.2832 * cyc * x / 1200 + ph))}`;
    return d;
  }];
  var rep = (n, fn) => (ox) => {
    let d = "", w = 1200 / n;
    for (let i = 0; i < n; i++) d += fn(ox + i * w, w, i);
    return d;
  };
  var poly = (pts) => (ox) => pts.map((p) => `L${ox + p[0]},${p[1]}`).join("");
  var SHAPES = {
    wave: [1, [wave(28, 2, 0, 70)]],
    waves: [1, [wave(18, 2, 1, 50), wave(22, 3, 3, 70), wave(26, 2, 0, 85)], [0.25, 0.5, 1]],
    tilt: [0, [[110, "b", poly([[1200, 10]])]]],
    curve: [0, [[120, "b", (ox) => `Q${ox + 600},-60 ${ox + 1200},120`]]],
    triangle: [0, [[120, "b", poly([[600, 10], [1200, 120]])]]],
    arrow: [0, [[120, "b", poly([[0, 60], [540, 60], [600, 15], [660, 60], [1200, 60], [1200, 120]])]]],
    zigzag: [1, [[90, "b", rep(12, (x, w) => `L${x + w / 2},30L${x + w},90`)]]],
    clouds: [1, [[100, "b", rep(6, (x, w) => `A${w / 2},60 0 0 1 ${x + w},100`)]]],
    mountains: [1, [[110, "b", poly([[100, 50], [180, 85], [300, 20], [420, 80], [520, 45], [640, 95], [760, 35], [880, 85], [1e3, 30], [1100, 70], [1200, 110]])]]],
    drips: [1, [[25, "t", rep(6, (x, w, i) => `L${x + 60},25L${x + 60},${[50, 85, 40][i % 3]}A10,10 0 0 0 ${x + 80},${[50, 85, 40][i % 3]}L${x + 80},25L${x + w},25`)]]],
    steps: [0, [[120, "b", poly([[0, 100], [150, 100], [150, 85], [300, 85], [300, 65], [450, 65], [450, 50], [600, 50], [600, 35], [750, 35], [750, 20], [1200, 20], [1200, 120]])]]],
    spikes: [1, [[100, "b", rep(24, (x, w) => `L${x + w / 2},20L${x + w},100`)]]]
  };
  add("divider-shape", Object.fromEntries(Object.entries(SHAPES).map(([k, [periodic, layers, ops]]) => [k, { periodic, layers, ops }])));
  var divider_default = {
    name: "divider",
    selector: ".efx-divider",
    defaults: { shape: "wave", color: "", height: 80, flip: false, invert: false, animate: "none", speed: 12, position: "" },
    init(el, o) {
      const { periodic: per, layers, ops = [] } = get("divider-shape", o.shape) || get("divider-shape", "wave");
      const st = el.style, parent = el.parentElement;
      const move = motionOK() && o.animate !== "none";
      const mode = o.animate === "layers" ? "layers" : !per && o.animate === "drift" ? "float" : o.animate;
      const drift = move && per && (mode === "drift" || mode === "layers");
      const W = drift ? 2400 : 1200;
      const side = layers[0][1];
      const saved = st.cssText;
      let claimed = false;
      if (o.color) st.setProperty("--efx-divider-color", o.color);
      st.height = o.height + "px";
      if (o.flip || o.invert) st.transform = `scale(${o.flip ? -1 : 1},${o.invert ? -1 : 1})`;
      if (o.position) {
        st.position = "absolute";
        st.left = st.right = "0";
        st.zIndex = "1";
        st[o.position === "top" ? "top" : "bottom"] = "0";
        if (parent && (parents.has(parent) || getComputedStyle(parent).position === "static")) {
          claimParent(parent);
          claimed = true;
        }
      }
      el.setAttribute("aria-hidden", "true");
      el.setAttribute("data-efx-mode", move ? mode : "none");
      st.setProperty("--efx-dv-dir", side === "t" ? 1 : -1);
      const mk = (k, op) => {
        let body = "";
        layers.forEach(([y0, s2, tile], li) => {
          let d = `M0,${y0}`;
          for (let ox = 0; ox < W; ox += 1200) d += tile(ox);
          d += s2 === "t" ? `L${W},0L0,0Z` : `L${W},120L0,120Z`;
          body += `<path d="${d}"${ops[li] ? ` opacity="${ops[li]}"` : ""}/>`;
        });
        const s = `<svg viewBox="0 0 ${W} 120" preserveAspectRatio="none" focusable="false" class="efx-divider__svg" style="${drift ? "width:200%;" : ""}${op < 1 ? `opacity:${op};` : ""}--efx-dv-t:${move ? o.speed : 0}s;${k ? `animation-duration:${(o.speed * [1.5, 1, 0.7][k]).toFixed(1)}s;animation-delay:-${(o.speed * k / 3).toFixed(1)}s;` : ""}">${body}</svg>`;
        return s;
      };
      const copies = mode === "layers" && move ? [0, 1, 2] : [0];
      el.innerHTML = copies.map((k) => mk(k, copies.length > 1 ? [0.35, 0.6, 1][k] : 1)).join("");
      el.classList.add("is-ready");
      const kind = drift ? "drift" : move ? "float" : "";
      if (kind) el.classList.add("efx-divider--" + kind);
      const stop = move ? onVisible(el, (v) => el.classList.toggle("is-paused", !v)) : () => {
      };
      return () => {
        stop();
        el.innerHTML = "";
        el.removeAttribute("aria-hidden");
        el.removeAttribute("data-efx-mode");
        el.classList.remove("is-ready", "is-paused", "efx-divider--drift", "efx-divider--float");
        st.cssText = saved;
        if (claimed) releaseParent(parent);
      };
    }
  };

  // src/features/drag.js
  var drag_default = {
    name: "drag",
    selector: ".efx-drag",
    defaults: { inertia: true, axis: "x" },
    init(el, o) {
      const ax = o.axis === "y" || o.axis === "both" ? o.axis : "x";
      const inertia = o.inertia && motionOK();
      const st = el.style, saved = [st.scrollSnapType, st.scrollBehavior];
      let id = 0, down = null, moved = 0, block = false, vx = 0, vy = 0, offsMove = [];
      const stopInertia = () => {
        cancelAnimationFrame(id);
        id = 0;
      };
      const restore = () => {
        st.scrollSnapType = saved[0];
        st.scrollBehavior = saved[1];
        el.classList.remove("is-dragging");
      };
      const glide = () => {
        vx *= 0.95;
        vy *= 0.95;
        if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
          id = 0;
          return restore();
        }
        el.scrollLeft -= vx;
        el.scrollTop -= vy;
        id = requestAnimationFrame(glide);
      };
      const mv = (e) => {
        if (!down) return;
        const dx = ax === "y" ? 0 : e.clientX - down.x, dy = ax === "x" ? 0 : e.clientY - down.y;
        moved += Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y);
        if (!el.classList.contains("is-dragging") && moved > 5) {
          el.classList.add("is-dragging");
          st.scrollSnapType = "none";
          st.scrollBehavior = "auto";
          try {
            el.setPointerCapture(e.pointerId);
          } catch (_) {
          }
        }
        if (!el.classList.contains("is-dragging")) return;
        el.scrollLeft -= dx;
        el.scrollTop -= dy;
        vx = dx;
        vy = dy;
        down.x = e.clientX;
        down.y = e.clientY;
      };
      const up = (e) => {
        if (!down) return;
        const dragged = moved > 5;
        offsMove.forEach((f2) => f2());
        offsMove = [];
        try {
          el.releasePointerCapture(down.id);
        } catch (_) {
        }
        down = null;
        if (dragged) {
          block = true;
          setTimeout(() => {
            block = false;
          });
        }
        if (dragged && inertia) id = requestAnimationFrame(glide);
        else restore();
      };
      const offs = [
        on(el, "pointerdown", (e) => {
          if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("input,textarea,select,[contenteditable]")) return;
          stopInertia();
          restore();
          down = { x: e.clientX, y: e.clientY, id: e.pointerId };
          moved = vx = vy = 0;
          offsMove = [on(window, "pointermove", mv), on(window, "pointerup", up), on(window, "pointercancel", up)];
        }),
        on(el, "click", (e) => {
          if (block) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true),
        on(el, "dragstart", (e) => e.preventDefault())
      ];
      el.classList.add("efx-drag-on");
      return () => {
        stopInertia();
        offs.forEach((f2) => f2());
        offsMove.forEach((f2) => f2());
        restore();
        el.classList.remove("efx-drag-on");
      };
    }
  };

  // src/features/draw.js
  var SHAPES2 = "path,line,polyline,polygon,circle,ellipse,rect";
  var clamp = (v) => Math.min(1, Math.max(0, v));
  var draw_default = {
    name: "draw",
    selector: ".efx-draw",
    defaults: { mode: "scroll", duration: 1500, start: 0, end: 0.7, stagger: 0, fill: false },
    init(el, o) {
      if (!motionOK()) return;
      const root = el.matches("svg") ? el : el.querySelector("svg");
      if (!root) return;
      const marked = root.querySelectorAll("[data-efx-draw-item]");
      const items = [...marked.length ? marked : root.querySelectorAll(SHAPES2)].filter((n2) => n2.getTotalLength);
      const parts = items.map((n2) => {
        let len = 0;
        try {
          len = n2.getTotalLength();
        } catch (e) {
        }
        const s = n2.style;
        const p = { n: n2, len, saved: [s.strokeDasharray, s.strokeDashoffset, s.fill, s.fillOpacity] };
        if (o.fill && getComputedStyle(n2).fill === "none") s.fill = getComputedStyle(n2).stroke;
        return p;
      }).filter((p) => p.len > 0);
      if (!parts.length) return;
      const n = parts.length, st = o.stagger;
      const set = (p, q) => {
        p.n.style.strokeDashoffset = (p.len * (1 - q)).toFixed(2);
        if (o.fill) p.n.style.fillOpacity = clamp((q - 0.8) / 0.2).toFixed(2);
      };
      parts.forEach((p) => {
        p.n.style.strokeDasharray = p.len;
        set(p, 0);
      });
      let stop = () => {
      }, anims = [];
      if (o.mode === "view") {
        stop = onVisible(el, (v) => {
          if (!v) return;
          stop();
          parts.forEach((p, i) => {
            const a = p.n.animate({ strokeDashoffset: [p.len, 0] }, { duration: o.duration, delay: i * st, easing: "ease-in-out", fill: "both" });
            anims.push(a);
            if (o.fill) anims.push(p.n.animate({ fillOpacity: [0, 1] }, { duration: o.duration * 0.3, delay: i * st + o.duration * 0.7, fill: "both" }));
          });
        });
      } else {
        const span = o.end - o.start || 1, tail = Math.max(0.05, 1 - (n - 1) * st);
        stop = onScroll((y, vh) => {
          const r = el.getBoundingClientRect();
          const q = clamp(((vh - r.top) / (vh + r.height) - o.start) / span);
          return () => parts.forEach((p, i) => set(p, clamp((q - i * st) / tail)));
        });
      }
      return () => {
        stop();
        anims.forEach((a) => a.cancel());
        parts.forEach((p) => {
          const s = p.n.style;
          [s.strokeDasharray, s.strokeDashoffset, s.fill, s.fillOpacity] = p.saved;
        });
      };
    }
  };

  // src/features/hscroll.js
  var hscroll_default = {
    name: "hscroll",
    selector: ".efx-hscroll",
    defaults: { offset: 0, snap: false },
    init(el, o) {
      const made = [];
      let track = [...el.children].find((c) => c.classList.contains("efx-hscroll__track"));
      if (!track) {
        track = document.createElement("div");
        track.className = "efx-hscroll__track";
        while (el.firstChild) track.appendChild(el.firstChild);
        el.appendChild(track);
        made.push(track);
      }
      const mq2 = matchMedia("(max-width: 767px)");
      const pinned = () => motionOK() && !mq2.matches;
      let pin, saveH = "", off = [], timer = 0, W = 0, H = 0, dist = 0, stop = () => {
      };
      const teardown = () => {
        stop();
        stop = () => {
        };
        off.forEach((f2) => f2());
        off = [];
        clearTimeout(timer);
        track.style.transform = track.style.willChange = "";
        if (pin) {
          el.style.height = saveH;
          if (pin.parentNode === el) el.insertBefore(track, pin);
          else el.appendChild(track);
          pin.remove();
          pin = null;
        }
        el.classList.remove("efx-hscroll-on", "efx-hscroll-native");
      };
      const measure = () => {
        const vw = innerWidth, vh = innerHeight - o.offset;
        dist = Math.max(0, track.scrollWidth - vw);
        W = vw;
        H = vh;
        const h = dist + vh + "px";
        return () => {
          el.style.height = h;
        };
      };
      const setup = () => {
        if (!pinned()) {
          el.classList.add("efx-hscroll-native");
          return;
        }
        pin = document.createElement("div");
        pin.className = "efx-hscroll__pin";
        pin.style.top = o.offset + "px";
        pin.style.height = `calc(100vh - ${o.offset}px)`;
        el.insertBefore(pin, track);
        pin.appendChild(track);
        el.classList.add("efx-hscroll-on");
        track.style.willChange = "transform";
        saveH = el.style.height;
        measure()();
        if (typeof ResizeObserver !== "undefined") {
          const ro = new ResizeObserver(() => measure()());
          ro.observe(track);
          off.push(() => ro.disconnect());
        }
        stop = onScroll((y, vh) => {
          const wm = innerWidth !== W || vh - o.offset !== H ? measure() : null;
          const top = el.getBoundingClientRect().top;
          const p = dist ? Math.min(1, Math.max(0, (o.offset - top) / dist)) : 0;
          if (o.snap) {
            clearTimeout(timer);
            if (p > 0 && p < 1) timer = setTimeout(() => {
              const kids = [...track.children], at = p * dist;
              let best = at, d = 1e9;
              kids.forEach((k) => {
                const t = Math.min(dist, k.offsetLeft);
                if (Math.abs(t - at) < d) {
                  d = Math.abs(t - at);
                  best = t;
                }
              });
              scrollBy({ top: best - at, behavior: "smooth" });
            }, 140);
          }
          return () => {
            wm && wm();
            track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
          };
        });
      };
      const rebuild = () => {
        teardown();
        setup();
      };
      setup();
      const offMq = mq2.addEventListener ? on(mq2, "change", rebuild) : () => {
      };
      return () => {
        offMq();
        teardown();
        made.forEach((t) => {
          while (t.firstChild) el.insertBefore(t.firstChild, t);
          t.remove();
        });
      };
    }
  };

  // src/features/lazyimg.js
  var lazyimg_default = {
    name: "lazyimg",
    selector: ".efx-lazyimg",
    defaults: { margin: "300px", blur: 12 },
    init(el, o) {
      const bg = el.dataset.efxBg, isImg = el.tagName === "IMG";
      if (!isImg && !bg) return;
      const blur = motionOK();
      const prev = isImg ? [el.getAttribute("src"), el.getAttribute("srcset")] : el.style.backgroundImage;
      if (blur) {
        el.style.setProperty("--efx-blur", o.blur + "px");
        el.classList.add("is-lazy");
      }
      let img = null;
      const stop = onVisible(el, (v) => {
        if (!v) return;
        stop();
        img = new Image();
        img.onload = () => {
          if (isImg) {
            el.srcset = el.dataset.efxSrcset || "";
            if (el.dataset.efxSrc) el.src = el.dataset.efxSrc;
            if (!el.dataset.efxSrcset) el.removeAttribute("srcset");
          } else el.style.backgroundImage = `url("${bg}")`;
          el.classList.add("is-loaded");
          el.classList.remove("is-lazy");
        };
        img.onerror = () => el.classList.add("is-error");
        if (isImg && el.dataset.efxSizes) img.sizes = el.dataset.efxSizes;
        if (isImg && el.dataset.efxSrcset) img.srcset = el.dataset.efxSrcset;
        img.src = isImg ? el.dataset.efxSrc || (el.dataset.efxSrcset || "").split(/[ ,]/)[0] : bg;
      }, o.margin);
      return () => {
        stop();
        if (img) img.onload = img.onerror = null;
        el.classList.remove("is-lazy", "is-loaded", "is-error");
        el.style.removeProperty("--efx-blur");
        if (isImg) {
          prev[0] == null ? el.removeAttribute("src") : el.setAttribute("src", prev[0]);
          prev[1] == null ? el.removeAttribute("srcset") : el.setAttribute("srcset", prev[1]);
        } else el.style.backgroundImage = prev;
      };
    }
  };

  // src/features/lightbox.js
  var SEL = "a[href],[data-efx-src]";
  var S = null;
  var meta = (a) => {
    const img = a.querySelector("img"), fig = a.closest("figure");
    const fc = fig && fig.querySelector("figcaption");
    return { src: a.dataset.efxSrc || a.getAttribute("href"), cap: a.dataset.efxCaption || img && img.alt || fc && fc.textContent.trim() || "" };
  };
  function build() {
    const d = document.createElement("dialog");
    d.className = "modal modal-lg efx-lightbox__dialog";
    d.setAttribute("aria-label", "Image viewer");
    d.innerHTML = '<button type="button" class="btn-close efx-lightbox__close" aria-label="Close"></button><button type="button" class="btn btn-icon efx-lightbox__prev" aria-label="Previous image">\u2039</button><figure class="efx-lightbox__fig"><img alt=""><figcaption></figcaption></figure><button type="button" class="btn btn-icon efx-lightbox__next" aria-label="Next image">\u203A</button><div class="efx-lightbox__count" aria-live="polite"></div>';
    document.body.appendChild(d);
    const q = (c) => d.querySelector(".efx-lightbox__" + c);
    const s = { d, img: q("fig").firstChild, cap: q("fig").lastChild, count: q("count"), prev: q("prev"), next: q("next"), items: [], i: 0, opts: {}, opener: null, refs: 0, offs: [] };
    const step = (k) => {
      const n = s.items.length;
      let i = s.i + k;
      if (i < 0 || i >= n) {
        if (!s.opts.loop) return;
        i = (i + n) % n;
      }
      show(i);
    };
    s.step = step;
    let x0 = null;
    s.offs.push(
      on(q("close"), "click", () => d.close()),
      on(s.prev, "click", () => step(-1)),
      on(s.next, "click", () => step(1)),
      on(d, "click", (e) => {
        if (e.target !== d) return;
        const r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
      }),
      on(d, "keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          step(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          step(1);
        }
      }),
      on(d, "pointerdown", (e) => {
        x0 = e.pointerType === "mouse" ? null : e.clientX;
      }),
      on(d, "pointerup", (e) => {
        if (x0 === null) return;
        const dx = e.clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      }),
      on(d, "close", () => {
        if (s.opener && s.opener.focus) s.opener.focus();
        s.opener = null;
      })
    );
    return s;
  }
  function show(i) {
    const n = S.items.length, it = S.items[i];
    S.i = i;
    S.img.src = it.src;
    S.img.alt = it.cap;
    S.cap.textContent = S.opts.captions ? it.cap : "";
    S.cap.hidden = !S.opts.captions || !it.cap;
    S.count.textContent = n > 1 ? `${i + 1} / ${n}` : "";
    S.prev.hidden = S.next.hidden = n < 2;
    [i - 1, i + 1].forEach((j) => {
      const k = S.items[(j + n) % n];
      if (k) new Image().src = k.src;
    });
  }
  var lightbox_default = {
    name: "lightbox",
    selector: ".efx-lightbox",
    defaults: { loop: true, captions: true, group: "" },
    init(el, o) {
      if (!S) S = build();
      S.refs++;
      const links = () => {
        const roots = o.group ? [...document.querySelectorAll(".efx-lightbox")].filter((r) => r.dataset.efxGroup === o.group) : [el];
        return roots.flatMap((r) => [...r.querySelectorAll(SEL)]);
      };
      const off = on(el, "click", (e) => {
        const a = e.target.closest(SEL);
        if (!a || !el.contains(a) || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        e.preventDefault();
        const ls = links();
        S.items = ls.map(meta);
        S.opts = o;
        S.opener = a;
        show(Math.max(0, ls.indexOf(a)));
        if (!S.d.open) S.d.showModal();
      });
      return () => {
        off();
        if (--S.refs > 0) return;
        S.offs.forEach((f2) => f2());
        const op = S.opener;
        if (S.d.open) S.d.close();
        S.d.remove();
        if (op && op.isConnected && op.focus) op.focus();
        S = null;
      };
    }
  };

  // src/features/magnetic.js
  var subs = /* @__PURE__ */ new Set();
  var docOff2 = null;
  var dispatch = rafThrottle((e) => subs.forEach((fn) => fn(e)));
  var subscribe = (fn) => {
    subs.add(fn);
    if (!docOff2) docOff2 = on(document, "pointermove", dispatch, { passive: true });
    return () => {
      subs.delete(fn);
      if (!subs.size && docOff2) {
        docOff2();
        docOff2 = null;
        dispatch.cancel();
      }
    };
  };
  var magnetic_default = {
    name: "magnetic",
    selector: ".efx-magnetic",
    defaults: { strength: 0.3, radius: 120, max: 24 },
    init(el, o) {
      if (!finePointer() || !motionOK()) return;
      let unsub = null, pulled = false, settle = 0;
      const clamp2 = (v) => Math.max(-o.max, Math.min(o.max, v));
      const set = (x, y) => {
        el.style.setProperty("--efx-mx", x + "px");
        el.style.setProperty("--efx-my", y + "px");
      };
      const release2 = () => {
        if (!pulled) return;
        pulled = false;
        set(0, 0);
        el.classList.remove("is-pulled");
        clearTimeout(settle);
        settle = setTimeout(() => el.classList.remove("is-magnetic"), 350);
      };
      const handle = (e) => {
        const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right), dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
        if (Math.hypot(dx, dy) > o.radius) {
          release2();
          return;
        }
        clearTimeout(settle);
        pulled = true;
        el.classList.add("is-magnetic", "is-pulled");
        set(clamp2((e.clientX - cx) * o.strength).toFixed(1), clamp2((e.clientY - cy) * o.strength).toFixed(1));
      };
      const stopVis = onVisible(el, (v) => {
        if (v && !unsub) unsub = subscribe(handle);
        else if (!v && unsub) {
          unsub();
          unsub = null;
          release2();
        }
      });
      return () => {
        stopVis();
        unsub && unsub();
        clearTimeout(settle);
        el.style.removeProperty("--efx-mx");
        el.style.removeProperty("--efx-my");
        el.classList.remove("is-pulled", "is-magnetic");
      };
    }
  };

  // src/features/marquee.js
  var marquee_default = {
    name: "marquee",
    selector: ".efx-marquee",
    defaults: { speed: 60, direction: "left", pause: true, gap: 32 },
    init(el, o) {
      const kids = [...el.childNodes];
      el.style.setProperty("--efx-gap", o.gap + "px");
      if (!motionOK()) {
        el.classList.add("efx-marquee--static");
        return () => {
          el.classList.remove("efx-marquee--static");
          el.style.removeProperty("--efx-gap");
        };
      }
      const track = document.createElement("div");
      const g = document.createElement("div");
      track.className = "efx-marquee__track";
      g.className = "efx-marquee__group";
      kids.forEach((k) => g.appendChild(k));
      track.appendChild(g);
      el.appendChild(track);
      el.classList.add("efx-marquee--on");
      el.classList.toggle("efx-marquee--pause", o.pause);
      if (o.direction === "right") track.style.animationDirection = "reverse";
      let n = 0;
      const build2 = () => {
        const w = g.offsetWidth;
        if (!w) return;
        const k = Math.max(2, Math.ceil(el.clientWidth * 2 / w));
        if (k !== n) {
          while (track.children.length > 1) track.lastChild.remove();
          for (let i = 1; i < k; i++) {
            const c = g.cloneNode(true);
            c.setAttribute("aria-hidden", "true");
            c.setAttribute("data-efx-skip", "");
            c.setAttribute("inert", "");
            [c, ...c.querySelectorAll("[data-efx-ready],[data-efx-lazy]")].forEach((x) => {
              x.removeAttribute("data-efx-ready");
              x.removeAttribute("data-efx-lazy");
            });
            c.querySelectorAll("[id]").forEach((x) => x.removeAttribute("id"));
            track.appendChild(c);
          }
          n = k;
        }
        track.style.setProperty("--efx-shift", `-${100 / k}%`);
        track.style.animationDuration = Math.max(1, w / Math.max(1, o.speed)) + "s";
      };
      build2();
      const ro = typeof ResizeObserver !== "undefined" && new ResizeObserver(build2);
      ro && (ro.observe(el), ro.observe(g));
      const stop = onVisible(el, (v) => el.classList.toggle("is-paused", !v));
      return () => {
        ro && ro.disconnect();
        stop();
        kids.forEach((k) => el.insertBefore(k, track));
        track.remove();
        el.classList.remove("efx-marquee--on", "efx-marquee--pause", "is-paused");
        el.style.removeProperty("--efx-gap");
      };
    }
  };

  // src/features/media.js
  var media_default = {
    name: "media",
    selector: ".efx-media",
    defaults: { play: "view", threshold: 0.4, reset: false },
    init(el, o) {
      const vids = el.matches("video") ? [el] : [...el.querySelectorAll("video")];
      if (!vids.length) return;
      const hover = o.play === "hover" || el.hasAttribute("data-efx-hover");
      const reduce = !motionOK();
      const offs = [], undo = [];
      const play = () => vids.forEach((v) => {
        const p = v.play();
        p && p.catch(() => {
        });
      });
      const stop = () => vids.forEach((v) => {
        v.pause();
        if (o.reset) v.currentTime = 0;
      });
      const lazy = [el, ...el.querySelectorAll("[data-efx-src]")].filter((n) => n.dataset.efxSrc);
      if (lazy.length) {
        const s = onVisible(el, (v) => {
          if (!v) return;
          s();
          lazy.forEach((n) => {
            n.src = n.dataset.efxSrc;
          });
          vids.forEach((x) => x.load());
        }, "300px");
        offs.push(s);
      }
      if (reduce) {
        vids.forEach((v) => {
          const was = [v.autoplay, v.controls];
          v.autoplay = false;
          v.pause();
          if (el === v) v.controls = true;
          undo.push(() => {
            v.autoplay = was[0];
            v.controls = was[1];
          });
        });
        if (el !== vids[0]) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "efx-media__play";
          b.setAttribute("aria-label", "Play video");
          b.addEventListener("click", () => {
            play();
            b.hidden = true;
          });
          let restore = false;
          if (getComputedStyle(el).position === "static") {
            el.style.position = "relative";
            restore = true;
          }
          el.appendChild(b);
          undo.push(() => {
            b.remove();
            if (restore) el.style.position = "";
          });
        }
      } else if (hover) {
        vids.forEach((v) => v.pause());
        offs.push(on(el, "pointerenter", play), on(el, "pointerleave", stop), on(el, "focusin", play), on(el, "focusout", stop));
      } else if (o.play === "view") {
        offs.push(onVisible(el, (v) => v ? play() : stop(), "0px", o.threshold));
      }
      return () => {
        offs.forEach((f2) => f2());
        undo.forEach((f2) => f2());
      };
    }
  };

  // src/features/mouse.js
  var subs2 = /* @__PURE__ */ new Set();
  var docOff3 = null;
  var subscribe2 = (fn) => {
    subs2.add(fn);
    if (!docOff3) docOff3 = on(document, "pointermove", (e) => subs2.forEach((f2) => f2(e)), { passive: true });
    return () => {
      subs2.delete(fn);
      if (!subs2.size && docOff3) {
        docOff3();
        docOff3 = null;
      }
    };
  };
  var mouse_default = {
    name: "mouse",
    selector: ".efx-mouse",
    defaults: { strength: 20, scope: "self", invert: false, rotate: 0, ease: 0.12, gyro: false },
    init(el, o) {
      const fine = finePointer(), gy = o.gyro && !fine && "DeviceOrientationEvent" in window;
      if (!(fine || gy) || !motionOK()) return;
      const found = [...el.querySelectorAll("[data-efx-depth]")];
      const layers = (found.length ? found : [el]).map((n) => ({
        n,
        d: found.length ? parseFloat(n.dataset.efxDepth) || 0 : 1,
        x: 0,
        y: 0,
        r: 0,
        pt: n.style.translate,
        pr: n.style.rotate
      }));
      const sign = o.invert ? 1 : -1, page = o.scope === "page", ease2 = Math.min(1, Math.max(0.01, o.ease));
      let tx = 0, ty = 0, raf2 = 0, unsub = null, rect = null;
      const frame = () => {
        raf2 = 0;
        let moving = false;
        for (const l of layers) {
          const gx = tx * l.d * o.strength * sign, gy2 = ty * l.d * o.strength * sign, gr = tx * l.d * o.rotate * sign;
          l.x += (gx - l.x) * ease2;
          l.y += (gy2 - l.y) * ease2;
          l.r += (gr - l.r) * ease2;
          const settled = Math.abs(gx - l.x) < 0.05 && Math.abs(gy2 - l.y) < 0.05 && Math.abs(gr - l.r) < 0.05;
          if (settled) {
            l.x = gx;
            l.y = gy2;
            l.r = gr;
          } else moving = true;
          l.n.style.translate = l.x.toFixed(2) + "px " + l.y.toFixed(2) + "px";
          if (o.rotate) l.n.style.rotate = l.r.toFixed(2) + "deg";
        }
        if (moving) raf2 = requestAnimationFrame(frame);
      };
      const go = (x, y) => {
        if (!Number.isFinite(x) || !Number.isFinite(y)) x = y = 0;
        tx = x;
        ty = y;
        if (!raf2) raf2 = requestAnimationFrame(frame);
      };
      const handle = (e) => {
        if (page) return go(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
        const r = el.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return go(0, 0);
        go((e.clientX - r.left) / (r.width || 1) * 2 - 1, (e.clientY - r.top) / (r.height || 1) * 2 - 1);
      };
      const orient = (e) => {
        if (e.beta != null) go(Math.max(-1, Math.min(1, e.gamma / 40)), Math.max(-1, Math.min(1, (e.beta - 45) / 40)));
      };
      const stopVis = onVisible(el, (v) => {
        if (v && !unsub) unsub = fine ? subscribe2(handle) : on(window, "deviceorientation", orient, { passive: true });
        else if (!v && unsub) {
          unsub();
          unsub = null;
          go(0, 0);
        }
      });
      return () => {
        stopVis();
        unsub && unsub();
        cancelAnimationFrame(raf2);
        for (const l of layers) {
          l.n.style.translate = l.pt;
          l.n.style.rotate = l.pr;
        }
      };
    }
  };

  // src/features/odometer.js
  var DIGITS = "0\n1\n2\n3\n4\n5\n6\n7\n8\n9";
  var odometer_default = {
    name: "odometer",
    selector: ".efx-odometer",
    defaults: { duration: 1800, from: "", stagger: 60, once: true },
    init(el, o) {
      const orig = el.innerHTML;
      let target = (el.textContent || "").trim();
      if (!target) return;
      const grouped = target.includes(",");
      const ok = (v) => typeof v === "number" ? Number.isFinite(v) : typeof v === "string" && /\d/.test(v);
      const fmt = (v) => typeof v === "number" ? grouped ? v.toLocaleString("en-US", { maximumFractionDigits: 6 }) : String(v) : String(v);
      if (!motionOK()) {
        const off = on(el, "efx:data", (e) => {
          const v = e.detail && e.detail.value;
          if (ok(v)) el.textContent = fmt(v);
        });
        return () => {
          off();
          el.innerHTML = orig;
        };
      }
      let strips = [], shown2 = false;
      const build2 = (text, fromText) => {
        const n = (text.match(/\d/g) || []).length;
        const src = (fromText.match(/\d/g) || []).join("").padStart(n, "0").slice(-n || 0);
        const sr = document.createElement("span");
        sr.className = "efx-odometer__sr";
        sr.textContent = text;
        const vis = document.createElement("span");
        vis.className = "efx-odometer__v";
        vis.setAttribute("aria-hidden", "true");
        strips = [];
        let k = 0;
        for (const c of text) {
          const cell = document.createElement("span");
          if (/\d/.test(c)) {
            const strip = document.createElement("span");
            strip.className = "efx-odometer__s";
            strip.textContent = DIGITS;
            strip.dataset.to = c;
            strip.style.setProperty("--n", src[k++] || 0);
            strip.style.transitionDelay = strips.length * o.stagger + "ms";
            cell.className = "efx-odometer__d";
            cell.append(strip);
            strips.push(strip);
          } else {
            cell.className = "efx-odometer__c";
            cell.textContent = c;
          }
          vis.append(cell);
        }
        el.textContent = "";
        el.append(sr, vis);
      };
      const roll = () => {
        void el.offsetWidth;
        strips.forEach((s) => s.style.setProperty("--n", s.dataset.to));
        shown2 = true;
      };
      const reset = () => {
        build2(target, o.from);
        shown2 = false;
      };
      el.style.setProperty("--efx-odo-duration", o.duration + "ms");
      build2(target, o.from);
      let stop = () => {
      };
      stop = onVisible(el, (v) => {
        if (v) {
          if (!shown2) {
            roll();
            if (o.once) stop();
          }
        } else if (!o.once && shown2) reset();
      });
      const offData = on(el, "efx:data", (e) => {
        const v = e.detail && e.detail.value;
        if (!ok(v)) return;
        const next = fmt(v).trim();
        if (!next || next === target) return;
        const prev = target;
        target = next;
        build2(next, shown2 ? prev : o.from);
        if (shown2) roll();
      });
      return () => {
        stop();
        offData();
        el.innerHTML = orig;
        el.style.removeProperty("--efx-odo-duration");
      };
    }
  };

  // src/features/parallax.js
  var parallax_default = {
    name: "parallax",
    selector: ".efx-parallax",
    defaults: { speed: 0.3, axis: "y", bg: false },
    init(el, o) {
      if (!motionOK()) return;
      const x = o.axis === "x";
      let target = el, layer, saved, vis = true, last = 0;
      if (o.bg) {
        const cs = getComputedStyle(el);
        saved = [el.style.backgroundImage, el.style.position, el.style.overflow, el.style.isolation];
        layer = document.createElement("div");
        layer.className = "efx-parallax__bg";
        layer.setAttribute("aria-hidden", "true");
        layer.style.cssText = `background-image:${cs.backgroundImage};background-size:${cs.backgroundSize === "auto" ? "cover" : cs.backgroundSize};background-position:${cs.backgroundPosition};background-repeat:${cs.backgroundRepeat}`;
        if (cs.position === "static") el.style.position = "relative";
        el.style.overflow = "hidden";
        el.style.isolation = "isolate";
        el.style.backgroundImage = "none";
        el.insertBefore(layer, el.firstChild);
        target = layer;
      }
      target.style.willChange = "transform";
      const stopVis = onVisible(el, (v) => {
        vis = v;
      }, "100px");
      const stop = onScroll(() => {
        if (!vis) return;
        const r = el.getBoundingClientRect();
        const c = o.bg ? x ? r.left + r.width / 2 : r.top + r.height / 2 : x ? r.left + r.width / 2 - last : r.top + r.height / 2 - last;
        const v = (x ? innerWidth : innerHeight) / 2;
        last = o.bg ? 0 : (c - v) * -o.speed;
        const d = o.bg ? (c - v) * -o.speed : last;
        return () => {
          target.style.transform = x ? `translate3d(${d.toFixed(1)}px,0,0)` : `translate3d(0,${d.toFixed(1)}px,0)`;
        };
      });
      return () => {
        stop();
        stopVis();
        target.style.transform = target.style.willChange = "";
        if (layer) {
          layer.remove();
          [el.style.backgroundImage, el.style.position, el.style.overflow, el.style.isolation] = saved;
        }
      };
    }
  };

  // src/features/particles.js
  add("particle-shape", {
    circle: (c, r) => c.arc(0, 0, r, 0, 6.2832),
    square: (c, r) => c.rect(-r, -r, r * 2, r * 2),
    triangle: (c, r) => {
      c.moveTo(0, -r * 1.3);
      c.lineTo(r * 1.2, r);
      c.lineTo(-r * 1.2, r);
      c.closePath();
    },
    star: (c, r) => {
      for (let i = 0; i < 10; i++) {
        const a = i * 0.6283 - 1.5708, d = i % 2 ? r * 0.6 : r * 1.5;
        c[i ? "lineTo" : "moveTo"](Math.cos(a) * d, Math.sin(a) * d);
      }
      c.closePath();
    },
    heart: (c, r) => {
      c.moveTo(0, r);
      c.bezierCurveTo(-r * 2, -r * 0.2, -r * 0.8, -r * 1.6, 0, -r * 0.5);
      c.bezierCurveTo(r * 0.8, -r * 1.6, r * 2, -r * 0.2, 0, r);
    }
  });
  var splitColors = (s) => {
    const out = [];
    let depth = 0, cur = "";
    for (const ch of String(s)) {
      if (ch === "(") depth++;
      else if (ch === ")") depth = Math.max(0, depth - 1);
      if ((ch === "|" || ch === ",") && !depth) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out.map((c) => c.trim()).filter(Boolean);
  };
  var visSubs2 = /* @__PURE__ */ new Set();
  var visOff2 = null;
  var onDocVis2 = () => visSubs2.forEach((fn) => fn(document.hidden));
  var subVis2 = (fn) => {
    visSubs2.add(fn);
    if (!visOff2) visOff2 = on(document, "visibilitychange", onDocVis2);
    return () => {
      visSubs2.delete(fn);
      if (!visSubs2.size && visOff2) {
        visOff2();
        visOff2 = null;
      }
    };
  };
  var particles_default = {
    name: "particles",
    selector: ".efx-particles",
    lazy: true,
    defaults: {
      count: 50,
      color: "",
      sizeMin: 1,
      sizeMax: 2.8,
      speed: 100,
      opacity: 1,
      links: false,
      linkDistance: 110,
      interact: "repel",
      interactRadius: 120,
      shape: "circle"
    },
    init(el, o) {
      let restorePos = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restorePos = true;
      }
      const cv2 = document.createElement("canvas");
      cv2.className = "efx-particles__canvas";
      cv2.setAttribute("aria-hidden", "true");
      el.insertBefore(cv2, el.firstChild);
      const ctx2 = cv2.getContext("2d");
      const motion = motionOK();
      const colors = o.color ? splitColors(o.color) : [];
      if (!colors.length) colors.push(themeColor(el));
      const sp = o.speed / 100;
      const shapes = splitColors(o.shape).map((n) => get("particle-shape", n) || get("particle-shape", "circle"));
      if (!shapes.length) shapes.push(get("particle-shape", "circle"));
      let w = 0, h = 0, dpr2 = 1, ps2 = [], raf2 = 0, vis = true, hidden = document.hidden;
      const ptr = { x: -1e4, y: -1e4 };
      const rnd2 = (a, b) => a + Math.random() * (b - a);
      const seed = () => {
        dpr2 = Math.min(devicePixelRatio || 1, 1.5);
        w = el.clientWidth;
        h = el.clientHeight;
        cv2.width = w * dpr2;
        cv2.height = h * dpr2;
        ctx2.setTransform(dpr2, 0, 0, dpr2, 0, 0);
        const n = Math.min(o.count, Math.round(w * h / 14e3));
        ps2 = Array.from({ length: n }, () => ({
          x: rnd2(0, w),
          y: rnd2(0, h),
          vx: rnd2(-0.5, 0.5) * sp,
          vy: rnd2(-0.5, 0.5) * sp,
          r: rnd2(o.sizeMin, o.sizeMax),
          c: colors[Math.random() * colors.length | 0],
          s: shapes[Math.random() * shapes.length | 0]
        }));
        draw2();
      };
      const draw2 = () => {
        ctx2.clearRect(0, 0, w, h);
        ctx2.globalAlpha = o.opacity;
        for (const p of ps2) {
          ctx2.fillStyle = p.c;
          ctx2.setTransform(dpr2, 0, 0, dpr2, p.x * dpr2, p.y * dpr2);
          ctx2.beginPath();
          p.s(ctx2, p.r, p);
          ctx2.fill();
        }
        ctx2.setTransform(dpr2, 0, 0, dpr2, 0, 0);
        if (o.links || o.interact === "connect") {
          const L = o.linkDistance, nodes = o.interact === "connect" && ptr.x > -1e3 ? ps2.concat({ x: ptr.x, y: ptr.y, c: colors[0] }) : ps2;
          ctx2.lineWidth = 1;
          for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < L && (o.links || j === ps2.length)) {
              ctx2.globalAlpha = (1 - d / L) * 0.6 * o.opacity;
              ctx2.strokeStyle = a.c;
              ctx2.beginPath();
              ctx2.moveTo(a.x, a.y);
              ctx2.lineTo(b.x, b.y);
              ctx2.stroke();
            }
          }
        }
        ctx2.globalAlpha = 1;
      };
      const step = () => {
        raf2 = 0;
        const R = o.interactRadius, push = o.interact === "repel" ? 1 : o.interact === "attract" ? -1 : 0;
        for (const p of ps2) {
          p.vx = (p.vx + rnd2(-0.02, 0.02) * sp) * 0.99;
          p.vy = (p.vy + rnd2(-0.02, 0.02) * sp) * 0.99;
          if (push) {
            const dx = p.x - ptr.x, dy = p.y - ptr.y, d = Math.hypot(dx, dy);
            if (d < R && d > 1) {
              const f2 = (1 - d / R) * 0.6 * push;
              p.vx += dx / d * f2;
              p.vy += dy / d * f2;
            }
          }
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          else if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          else if (p.y > h) p.y = 0;
        }
        draw2();
        go();
      };
      const go = () => {
        if (motion && vis && !hidden && !raf2) raf2 = requestAnimationFrame(step);
      };
      const offs = [];
      seed();
      if (motion) {
        offs.push(onVisible(el, (v) => {
          vis = v;
          if (v) go();
          else {
            cancelAnimationFrame(raf2);
            raf2 = 0;
          }
        }));
        offs.push(subVis2((h2) => {
          hidden = h2;
          if (hidden) {
            cancelAnimationFrame(raf2);
            raf2 = 0;
          } else go();
        }));
        if (o.interact !== "none" && finePointer()) {
          let rect = null;
          const stale = () => {
            rect = null;
          };
          offs.push(on(el, "pointerenter", () => {
            rect = el.getBoundingClientRect();
          }));
          offs.push(on(el, "pointermove", (e) => {
            const r = rect || (rect = el.getBoundingClientRect());
            ptr.x = e.clientX - r.left;
            ptr.y = e.clientY - r.top;
          }));
          offs.push(on(window, "scroll", stale, { passive: true, capture: true }), on(window, "resize", stale, { passive: true }));
          offs.push(on(el, "pointerleave", () => {
            ptr.x = ptr.y = -1e4;
            rect = null;
          }));
        }
      }
      let ro;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          if (el.clientWidth !== w || el.clientHeight !== h) seed();
        });
        ro.observe(el);
      }
      return () => {
        cancelAnimationFrame(raf2);
        raf2 = 0;
        vis = false;
        offs.forEach((f2) => f2());
        ro && ro.disconnect();
        cv2.remove();
        if (restorePos) el.style.position = "";
      };
    }
  };

  // src/features/popup.js
  var shown = false;
  var bot = /bot|crawl|spider|lighthouse/i;
  var store = (s, fn) => {
    try {
      return fn(window[s]);
    } catch (e) {
    }
  };
  var popup_default = {
    name: "popup",
    selector: ".efx-popup",
    defaults: { delay: -1, scroll: 0, exit: false, frequency: "always", days: 7, id: "" },
    init(el, o) {
      const id = o.id || el.id, key = "efx-popup:" + id, offs = [];
      let timer = 0, opener = null;
      const canAuto = () => {
        if (o.frequency === "session") return !store("sessionStorage", (s) => s.getItem(key));
        if (o.frequency === "once") return !store("localStorage", (s) => s.getItem(key));
        if (o.frequency === "days") {
          const t = +store("localStorage", (s) => s.getItem(key));
          return !t || Date.now() - t > o.days * 864e5;
        }
        return true;
      };
      const mark = () => {
        if (o.frequency === "session") store("sessionStorage", (s) => s.setItem(key, "1"));
        else if (o.frequency === "once" || o.frequency === "days") store("localStorage", (s) => s.setItem(key, Date.now()));
      };
      const open = (by) => {
        if (el.open || !el.showModal) return;
        opener = by || document.activeElement;
        el.showModal();
      };
      let stopScroll = null, fired = false;
      const unscroll = () => {
        if (stopScroll) {
          stopScroll();
          stopScroll = null;
        }
      };
      const auto = () => {
        if (shown || el.open || !canAuto()) return;
        shown = true;
        mark();
        open();
        unscroll();
      };
      const close = () => el.open && el.close();
      offs.push(on(el, "close", () => {
        if (opener && opener.focus) opener.focus();
        opener = null;
      }));
      offs.push(on(el, "click", (e) => {
        if (e.target.closest("[data-efx-close]")) return close();
        if (e.target !== el) return;
        const r = el.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
      }));
      offs.push(on(document, "click", (e) => {
        const t = e.target.closest && e.target.closest('[data-efx-open],a[href^="#"]');
        if (!t || !id) return;
        if ((t.dataset.efxOpen || t.getAttribute("href").slice(1)) !== id) return;
        e.preventDefault();
        open(t);
      }));
      if (!bot.test(navigator.userAgent)) {
        if (o.delay >= 0) timer = setTimeout(auto, o.delay * 1e3);
        if (o.scroll > 0) {
          if (canAuto() && !shown) {
            stopScroll = onScroll((y, ih) => {
              const h = document.documentElement.scrollHeight - ih;
              if (h <= 0 || y / h * 100 < o.scroll) return;
              return () => {
                fired = true;
                auto();
                unscroll();
              };
            });
            if (fired) unscroll();
          }
        }
        if (o.exit && matchMedia("(hover: hover) and (pointer: fine)").matches) {
          offs.push(on(document, "mouseout", (e) => {
            if (!e.relatedTarget && e.clientY <= 0) auto();
          }));
        }
      }
      return () => {
        clearTimeout(timer);
        unscroll();
        offs.forEach((f2) => f2());
        close();
      };
    }
  };

  // src/features/progress.js
  var progress_default = {
    name: "progress",
    selector: ".efx-progress",
    defaults: { target: "", position: "top", height: 4 },
    init(el, o) {
      const t = o.target && document.querySelector(o.target);
      const pos = o.position === "bottom" ? "bottom" : o.position === "none" ? "" : "top";
      const attrs = ["role", "aria-valuemin", "aria-valuemax", "aria-valuenow"];
      const had = attrs.map((a) => el.getAttribute(a));
      if (pos) el.classList.add("efx-progress--" + pos);
      el.style.setProperty("--efx-progress-height", o.height + "px");
      el.setAttribute("role", "progressbar");
      el.setAttribute("aria-valuemin", "0");
      el.setAttribute("aria-valuemax", "100");
      if (!el.hasAttribute("aria-label")) {
        el.setAttribute("aria-label", "Reading progress");
        el.dataset.efxAl = "";
      }
      const stop = onScroll((y, h) => {
        let p;
        if (t) {
          const r = t.getBoundingClientRect();
          p = -r.top / (r.height - h || 1);
        } else p = y / (document.documentElement.scrollHeight - h || 1);
        p = Math.min(1, Math.max(0, p));
        return () => {
          el.style.setProperty("--efx-progress", p.toFixed(4));
          el.setAttribute("aria-valuenow", Math.round(p * 100));
        };
      });
      return () => {
        stop();
        el.classList.remove("efx-progress--top", "efx-progress--bottom");
        el.style.removeProperty("--efx-progress");
        el.style.removeProperty("--efx-progress-height");
        attrs.forEach((a, i) => had[i] === null ? el.removeAttribute(a) : el.setAttribute(a, had[i]));
        if (el.dataset.efxAl !== void 0) {
          el.removeAttribute("aria-label");
          delete el.dataset.efxAl;
        }
      };
    }
  };

  // src/features/proximity.js
  var subs3 = /* @__PURE__ */ new Set();
  var docOff4 = null;
  var subscribe3 = (fn) => {
    subs3.add(fn);
    if (!docOff4) docOff4 = on(document, "pointermove", (e) => subs3.forEach((f2) => f2(e)), { passive: true });
    return () => {
      subs3.delete(fn);
      if (!subs3.size && docOff4) {
        docOff4();
        docOff4 = null;
      }
    };
  };
  var proximity_default = {
    name: "proximity",
    selector: ".efx-proximity",
    defaults: { radius: 120, scale: 1.4, weight: 0, lift: 0, color: "", mode: "letters" },
    init(el, o) {
      if (!finePointer() || !motionOK()) return;
      let saved = null, pieces;
      if (o.mode === "items") pieces = [...el.querySelectorAll("[data-efx-item]")];
      else {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (!text || text.length > 300) return;
        saved = el.innerHTML;
        const sr = document.createElement("span");
        sr.className = "efx-proximity__sr";
        sr.textContent = text;
        const vis = document.createElement("span");
        vis.className = "efx-proximity__pieces";
        vis.setAttribute("aria-hidden", "true");
        text.split(" ").forEach((w, k) => {
          if (k) vis.append(" ");
          const wrap = document.createElement("span");
          wrap.className = "efx-proximity__w";
          [...w].forEach((c) => {
            const s = document.createElement("span");
            s.className = "efx-proximity__c";
            s.textContent = c;
            wrap.append(s);
          });
          vis.append(wrap);
        });
        el.textContent = "";
        el.append(sr, vis);
        pieces = [...vis.querySelectorAll(".efx-proximity__c")];
      }
      if (!pieces.length) return;
      const base = parseFloat(getComputedStyle(el).fontWeight) || 400;
      const keep = pieces.map((p) => ({ t: p.style.translate, s: p.style.scale, w: p.style.fontWeight }));
      if (o.color) {
        el.style.setProperty("--efx-pcolor", o.color);
        el.classList.add("has-pcolor");
      }
      el.classList.add("is-proximity");
      let px = 0, py = 0, raf2 = 0, dirty = false, unsub = null;
      const paint = (p, t) => {
        p.style.scale = t ? (1 + (o.scale - 1) * t).toFixed(3) : "";
        p.style.translate = t && o.lift ? "0 " + (-o.lift * t).toFixed(2) + "px" : "";
        if (o.weight) p.style.fontWeight = t ? Math.round(base + (o.weight - base) * t) : "";
        if (o.color) p.style.setProperty("--efx-p", t.toFixed(3));
      };
      const frame = () => {
        raf2 = 0;
        const r = el.getBoundingClientRect();
        const near = px > r.left - o.radius && px < r.right + o.radius && py > r.top - o.radius && py < r.bottom + o.radius;
        if (!near && !dirty) return;
        dirty = near;
        const rects = pieces.map((p) => p.getBoundingClientRect());
        pieces.forEach((p, i) => {
          const b = rects[i];
          const d = near ? Math.hypot(px - (b.left + b.width / 2), py - (b.top + b.height / 2)) : o.radius;
          const t = Math.max(0, 1 - d / o.radius);
          paint(p, t * t * (3 - 2 * t));
        });
      };
      const move = (e) => {
        px = e.clientX;
        py = e.clientY;
        if (!raf2) raf2 = requestAnimationFrame(frame);
      };
      const stopVis = onVisible(el, (v) => {
        if (v && !unsub) unsub = subscribe3(move);
        else if (!v && unsub) {
          unsub();
          unsub = null;
          px = py = -1e5;
          dirty = true;
          frame();
        }
      });
      return () => {
        stopVis();
        unsub && unsub();
        cancelAnimationFrame(raf2);
        if (saved !== null) el.innerHTML = saved;
        else pieces.forEach((p, i) => {
          p.style.translate = keep[i].t;
          p.style.scale = keep[i].s;
          p.style.fontWeight = keep[i].w;
          p.style.removeProperty("--efx-p");
        });
        el.style.removeProperty("--efx-pcolor");
        el.classList.remove("has-pcolor", "is-proximity");
      };
    }
  };

  // src/features/reveal.js
  var groupItems = /* @__PURE__ */ new WeakMap();
  var reveal_default = {
    name: "reveal",
    selector: ".efx-reveal",
    defaults: { reveal: "fade-up", delay: 0, once: true, threshold: 0.15 },
    init(el, o) {
      if (!motionOK()) return;
      const group = el.parentElement && el.parentElement.closest(".efx-stagger");
      let delay = o.delay;
      if (group) {
        let items = groupItems.get(group);
        if (!items || !items.includes(el)) {
          items = [...group.querySelectorAll(".efx-reveal")];
          groupItems.set(group, items);
        }
        delay += items.indexOf(el) * (parseFloat(group.dataset.efxStagger) || 80);
      }
      const prevDelay = el.style.getPropertyValue("--efx-delay");
      if (delay) el.style.setProperty("--efx-delay", delay + "ms");
      el.setAttribute("data-efx-anim", o.reveal);
      el.classList.add("efx-reveal-pending");
      const offEnd = on(el, "transitionend", (e) => {
        if (e.target === el && el.classList.contains("is-in") && o.once) el.classList.remove("efx-reveal-pending");
      });
      let stop = () => {
      };
      stop = onVisible(el, (vis, e) => {
        const enough = vis && (e.intersectionRatio >= o.threshold || e.intersectionRect.height >= innerHeight * 0.25);
        if (enough) {
          el.classList.add("is-in");
          if (o.once) stop();
        } else if (!o.once && !vis) el.classList.remove("is-in");
      }, "0px", [0, o.threshold, 0.5, 1]);
      return () => {
        stop();
        offEnd();
        el.classList.remove("efx-reveal-pending", "is-in");
        el.removeAttribute("data-efx-anim");
        if (prevDelay) el.style.setProperty("--efx-delay", prevDelay);
        else el.style.removeProperty("--efx-delay");
      };
    }
  };

  // src/features/ripple.js
  var ripple_default = {
    name: "ripple",
    selector: ".efx-ripple",
    defaults: { color: "", duration: 600, center: false },
    init(el, o) {
      if (!motionOK()) return;
      if (o.color) el.style.setProperty("--efx-ripple-color", o.color);
      el.style.setProperty("--efx-ripple-dur", o.duration + "ms");
      let restorePos = false, clip = null;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restorePos = true;
      }
      const getClip = () => {
        if (!clip) {
          clip = document.createElement("span");
          clip.className = "efx-ripple__clip";
          clip.setAttribute("aria-hidden", "true");
          el.appendChild(clip);
        }
        return clip;
      };
      const wave2 = (x, y) => {
        const r = el.getBoundingClientRect();
        const s = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) * 2;
        const w = document.createElement("span");
        w.className = "efx-ripple__wave";
        w.setAttribute("aria-hidden", "true");
        w.style.cssText = "width:" + s + "px;height:" + s + "px;left:" + x + "px;top:" + y + "px";
        w.addEventListener("animationend", () => w.remove(), { once: true });
        getClip().appendChild(w);
      };
      const offs = [
        on(el, "pointerdown", (e) => {
          if (e.button) return;
          const r = el.getBoundingClientRect();
          o.center ? wave2(r.width / 2, r.height / 2) : wave2(e.clientX - r.left, e.clientY - r.top);
        }),
        on(el, "keydown", (e) => {
          if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
            const r = el.getBoundingClientRect();
            wave2(r.width / 2, r.height / 2);
          }
        })
      ];
      return () => {
        offs.forEach((f2) => f2());
        clip && clip.remove();
        clip = null;
        if (restorePos) el.style.position = "";
        el.style.removeProperty("--efx-ripple-color");
        el.style.removeProperty("--efx-ripple-dur");
      };
    }
  };

  // src/features/schedule.js
  var DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var date = (s) => {
    if (!s) return 0;
    s = String(s);
    const d = new Date(/^\d{4}-\d\d-\d\d$/.test(s) ? s + "T00:00" : s);
    return isNaN(d) ? 0 : +d;
  };
  var dayIdx = (s) => DAYS.indexOf(s.trim().slice(0, 3).toLowerCase());
  var parseDays = (s) => {
    const set = /* @__PURE__ */ new Set();
    s.split(",").forEach((p) => {
      const [a, b] = p.split("-").map(dayIdx);
      if (!(a >= 0)) return;
      if (b === void 0) return set.add(a);
      if (b < 0) return;
      for (let k = 0, i = a; k < 7; k++, i = (i + 1) % 7) {
        set.add(i);
        if (i === b) break;
      }
    });
    return set.size ? set : null;
  };
  var mins = (s) => {
    const [h, m = 0] = s.split(":");
    return +h * 60 + +m;
  };
  var parseHours = (s) => {
    const r = s.split("-").map(mins);
    return r.length === 2 && r.every((x) => Number.isFinite(x)) ? r : null;
  };
  var schedule_default = {
    name: "schedule",
    selector: ".efx-schedule",
    defaults: { from: "", until: "", days: "", hours: "", mode: "show" },
    init(el, o) {
      const from = date(o.from), until = date(o.until);
      const days = o.days ? parseDays(String(o.days)) : null;
      const hr = o.hours ? parseHours(o.hours) : null;
      const wasHidden = el.hidden;
      let timer = 0, last;
      const run = () => {
        const now = /* @__PURE__ */ new Date(), t = +now, m = now.getHours() * 60 + now.getMinutes();
        let inside = (!from || t >= from) && (!until || t < until) && (!days || days.has(now.getDay()));
        if (inside && hr && hr[0] !== hr[1]) inside = hr[0] < hr[1] ? m >= hr[0] && m < hr[1] : m >= hr[0] || m < hr[1];
        const on2 = o.mode === "hide" ? !inside : inside;
        el.hidden = !on2;
        el.classList.toggle("is-scheduled-off", !on2);
        if (on2 !== last) {
          last = on2;
          el.dispatchEvent(new CustomEvent("efx:change", { bubbles: true, detail: { on: on2 } }));
        }
        const at = (d, mm) => {
          const x = new Date(now);
          x.setDate(x.getDate() + d);
          x.setHours(0, mm, 0, 0);
          return +x;
        };
        const c = [from, until, days && at(1, 0), hr && at(0, hr[0]), hr && at(0, hr[1]), hr && at(1, hr[0]), hr && at(1, hr[1])].filter((x) => x > t);
        timer = setTimeout(run, Math.min(Math.min(...c, t + 864e5) - t, 864e5) + 50);
      };
      run();
      return () => {
        clearTimeout(timer);
        el.hidden = wasHidden;
        el.classList.remove("is-scheduled-off");
      };
    }
  };

  // src/features/scramble.js
  var scramble_default = {
    name: "scramble",
    selector: ".efx-scramble",
    defaults: { trigger: "view", chars: "!<>-_\\/[]{}\u2014=+*^?#________", speed: 30, duration: 900, once: true, words: [], pause: 2e3 },
    init(el, o) {
      const saved = el.innerHTML;
      const words = o.words.length ? o.words : [el.textContent.trim()];
      const cycle = o.words.length > 1;
      if (!motionOK()) {
        if (o.words.length) el.textContent = words[0];
        return () => {
          el.innerHTML = saved;
        };
      }
      const mk = (c) => {
        const s = document.createElement("span");
        s.className = c;
        return s;
      };
      const sr = mk("efx-scramble__sr"), vis = mk("efx-scramble__v");
      vis.setAttribute("aria-hidden", "true");
      el.textContent = "";
      el.append(sr, vis);
      const pool = [...o.chars || "#"];
      vis.style.minWidth = Math.max(...words.map((w) => w.length)) + "ch";
      let cur = words[0], tgt = cur, tm = 0, running = false, played = false, i = 0;
      const show2 = (t) => {
        vis.textContent = t;
      };
      const set = (t) => {
        cur = t;
        sr.textContent = t;
        show2(t);
      };
      set(cur);
      const run = (to, done) => {
        clearTimeout(tm);
        running = true;
        tgt = to;
        const from = cur, len = Math.max(from.length, to.length), t0 = performance.now();
        const step = () => {
          const p = Math.min(1, (performance.now() - t0) / Math.max(1, o.duration));
          let out = "";
          for (let k = 0; k < len; k++) {
            const c = to[k] || "", lock = (k + 1) / len * 0.85;
            out += p >= 1 || p >= lock ? c : c === " " ? " " : pool[Math.random() * pool.length | 0];
          }
          show2(out);
          if (p < 1) tm = setTimeout(step, o.speed);
          else {
            running = false;
            set(to);
            done && done();
          }
        };
        sr.textContent = to;
        step();
      };
      const play = () => {
        if (!running) run(words[0]);
      };
      const offs = [];
      let stopVis = () => {
      }, seen = true;
      if (cycle) {
        const next = () => {
          i = (i + 1) % words.length;
          run(words[i], () => {
            tm = setTimeout(next, o.pause);
          });
        };
        stopVis = onVisible(el, (v) => {
          seen = v;
          clearTimeout(tm);
          if (!v && running) {
            running = false;
            set(tgt);
          }
          if (v && !running) tm = setTimeout(next, o.pause);
        });
      } else if (o.trigger === "hover") offs.push(on(el, "pointerenter", play), on(el, "focus", play));
      else if (o.trigger === "click") offs.push(on(el, "click", play));
      else if (o.trigger === "load") play();
      else {
        stopVis = onVisible(el, (v) => {
          if (!v) {
            if (!o.once) played = false;
            return;
          }
          if (played) return;
          played = true;
          play();
          if (o.once) stopVis();
        });
      }
      return () => {
        clearTimeout(tm);
        stopVis();
        offs.forEach((f2) => f2());
        el.innerHTML = saved;
      };
    }
  };

  // src/features/scrollspy.js
  var byHash = (h) => {
    let id = h.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch (e) {
    }
    return h.length > 1 && document.getElementById(id);
  };
  var scrollspy_default = {
    name: "scrollspy",
    selector: ".efx-scrollspy",
    defaults: { offset: 80, activeClass: "is-active", smooth: true },
    init(el, o) {
      const links = [...el.querySelectorAll('a[href^="#"]')];
      const items = links.map((a) => [a, byHash(a.hash)]).filter((i) => i[1]);
      const seen = /* @__PURE__ */ new Set();
      const tabbed = /* @__PURE__ */ new Map();
      let cur;
      const set = (a) => {
        if (a === cur) return;
        links.forEach((l) => {
          l.classList.toggle(o.activeClass, l === a);
          l === a ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current");
        });
        cur = a;
      };
      const stops = items.map(([a, sec]) => onVisible(sec, (v) => {
        v ? seen.add(a) : seen.delete(a);
        const hit = items.find((i) => seen.has(i[0]));
        if (hit) set(hit[0]);
      }, `-${o.offset}px 0px -55% 0px`));
      const restore = (t) => {
        if (!tabbed.has(t)) return;
        const p = tabbed.get(t);
        tabbed.delete(t);
        p === null ? t.removeAttribute("tabindex") : t.setAttribute("tabindex", p);
      };
      const off = o.smooth && on(el, "click", (e) => {
        const a = e.target.closest && e.target.closest('a[href^="#"]');
        const it = a && items.find((i) => i[0] === a);
        if (!it || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
        e.preventDefault();
        const t = it[1];
        scrollTo({ top: t.getBoundingClientRect().top + scrollY - o.offset + 1, behavior: motionOK() ? "smooth" : "auto" });
        history.replaceState(null, "", a.hash);
        if (!t.matches("a[href],button,input,select,textarea,[tabindex]") && !tabbed.has(t)) {
          tabbed.set(t, t.getAttribute("tabindex"));
          t.setAttribute("tabindex", "-1");
          t.addEventListener("blur", () => restore(t), { once: true });
        }
        t.focus({ preventScroll: true });
      });
      return () => {
        stops.forEach((s) => s());
        off && off();
        [...tabbed.keys()].forEach(restore);
        links.forEach((l) => {
          l.classList.remove(o.activeClass);
          l.removeAttribute("aria-current");
        });
      };
    }
  };

  // src/features/scrub.js
  var NEUTRAL = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0 };
  var parse = (s) => {
    const o = {};
    String(s).split(/[\s;,]+/).forEach((t) => {
      const [k, v] = t.split(":"), n = parseFloat(v);
      if (k in NEUTRAL && Number.isFinite(n)) o[k] = n;
    });
    return o;
  };
  var scrub_default = {
    name: "scrub",
    selector: ".efx-scrub",
    defaults: { from: "", to: "", start: 0, end: 1, ease: "linear", x: 0, y: 0, rotate: 0, scale: 1, opacity: -1, blur: 0 },
    init(el, o) {
      if (!motionOK()) return;
      const A = { ...NEUTRAL, ...parse(o.from) };
      const B = { ...NEUTRAL, x: o.x, y: o.y, rotate: o.rotate, scale: o.scale, blur: o.blur, ...o.opacity >= 0 ? { opacity: o.opacity } : {}, ...parse(o.to) };
      const ease2 = ease(o.ease), span = o.end - o.start || 1;
      const s = el.style, saved = [s.translate, s.rotate, s.scale, s.opacity, s.filter, s.transition, s.willChange, s.getPropertyValue("--efx-p")];
      const use = (k) => A[k] !== B[k];
      const moves = use("x") || use("y"), turns = use("rotate"), zooms = use("scale"), fades = use("opacity"), blurs = use("blur");
      s.transition = "none";
      s.willChange = "transform, opacity";
      let ty = 0, sc = A.scale;
      const stop = onScroll((y, vh) => {
        const r = el.getBoundingClientRect();
        const h0 = r.height / (sc || 1), top0 = r.top - ty - h0 * (1 - sc) / 2;
        const q = ease2(Math.min(1, Math.max(0, ((vh - top0) / (vh + h0) - o.start) / span)));
        const v = (k) => A[k] + (B[k] - A[k]) * q;
        return () => {
          ty = v("y");
          sc = v("scale");
          s.setProperty("--efx-p", q.toFixed(3));
          if (moves) s.translate = `${v("x").toFixed(1)}px ${ty.toFixed(1)}px`;
          if (turns) s.rotate = v("rotate").toFixed(2) + "deg";
          if (zooms) s.scale = sc.toFixed(3);
          if (fades) s.opacity = v("opacity").toFixed(3);
          if (blurs) s.filter = `blur(${Math.max(0, v("blur")).toFixed(1)}px)`;
        };
      });
      return () => {
        stop();
        [s.translate, s.rotate, s.scale, s.opacity, s.filter, s.transition, s.willChange] = saved;
        saved[7] ? s.setProperty("--efx-p", saved[7]) : s.removeProperty("--efx-p");
      };
    }
  };

  // src/features/sequence.js
  var sequence_default = {
    name: "sequence",
    selector: ".efx-sequence",
    lazy: true,
    defaults: { src: "", list: [], frames: 0, pad: 0, start: 1, height: 300, fit: "cover" },
    init(el, o) {
      const anim = motionOK(), video = el.tagName === "VIDEO";
      const host = document.createElement("div");
      host.className = "efx-sequence__track";
      let canvas, ctx2, ro, parent, saved, pin, saveH = "", dead = false, pump = () => {
      }, stop;
      const loading = /* @__PURE__ */ new Set();
      const prog = (r, vh) => Math.min(1, Math.max(0, -r.top / (r.height - vh || 1)));
      if (video) {
        parent = el.parentNode;
        saved = [el.className, el.style.cssText];
        parent.insertBefore(host, el);
        host.appendChild(el);
        el.style.objectFit = o.fit;
        el.pause();
        const seek = (t) => {
          if (el.duration && Math.abs(el.currentTime - t) > 0.03) el.currentTime = t;
        };
        if (!anim) {
          host.classList.add("efx-sequence-static");
          el.addEventListener("loadedmetadata", () => seek(0.01), { once: true });
        } else {
          host.style.height = o.height + "vh";
          el.classList.add("efx-sequence-on");
          let p = 0;
          const sync = () => seek(p * (el.duration || 0));
          el.addEventListener("loadedmetadata", sync);
          stop = onScroll((y, vh) => {
            p = prog(host.getBoundingClientRect(), vh);
            return sync;
          });
          const un = stop;
          stop = () => {
            un();
            el.removeEventListener("loadedmetadata", sync);
          };
        }
      } else {
        const MAX = 2e3, nf = Math.min(MAX, Math.max(0, o.frames | 0));
        const urls = o.list.length ? o.list.slice(0, MAX) : Array.from({ length: nf }, (_, i) => o.src.replace("{i}", String(o.start + i).padStart(o.pad, "0")));
        const n = urls.length;
        if (!n) return;
        const imgs = [], req = /* @__PURE__ */ new Set(), loaded = [];
        let active = 0, want = 0, drawn = -1;
        pin = document.createElement("div");
        pin.className = "efx-sequence__pin";
        pin.setAttribute("aria-hidden", "true");
        canvas = document.createElement("canvas");
        pin.appendChild(canvas);
        el.appendChild(pin);
        ctx2 = canvas.getContext("2d");
        saveH = el.style.height;
        if (anim) {
          el.style.height = o.height + "vh";
          el.classList.add("efx-sequence-on");
        }
        const draw2 = () => {
          if (dead || !loaded.length) return;
          let lo = 0, hi = loaded.length;
          while (lo < hi) {
            const m = lo + hi >> 1;
            if (loaded[m] < want) lo = m + 1;
            else hi = m;
          }
          const a = loaded[lo - 1], b = loaded[lo];
          const k = a === void 0 ? b : b === void 0 ? a : want - a <= b - want ? a : b;
          if (k === void 0 || k === drawn && canvas.dataset.w === canvas.width + "x" + canvas.height) return;
          const im = imgs[k], cw = canvas.width, ch = canvas.height;
          const s = (o.fit === "contain" ? Math.min : Math.max)(cw / im.naturalWidth, ch / im.naturalHeight);
          ctx2.clearRect(0, 0, cw, ch);
          ctx2.drawImage(im, (cw - im.naturalWidth * s) / 2, (ch - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
          drawn = k;
          canvas.dataset.w = cw + "x" + ch;
        };
        pump = () => {
          while (!dead && active < 6 && req.size < n) {
            let k = -1;
            const free = (i) => i >= 0 && i < n && !req.has(i);
            if (!anim) {
              if (free(want)) k = want;
            } else for (let d = 0; d < n && k < 0; d++) k = free(want + d) ? want + d : free(want - d) ? want - d : -1;
            if (k < 0) return;
            req.add(k);
            active++;
            const im = new Image();
            loading.add(im);
            im.onload = () => {
              loading.delete(im);
              if (dead) return;
              imgs[k] = im;
              active--;
              let lo = 0, hi = loaded.length;
              while (lo < hi) {
                const m = lo + hi >> 1;
                if (loaded[m] < k) lo = m + 1;
                else hi = m;
              }
              loaded.splice(lo, 0, k);
              draw2();
              pump();
            };
            im.onerror = () => {
              loading.delete(im);
              if (dead) return;
              active--;
              pump();
            };
            im.src = urls[k];
          }
        };
        const size = () => {
          const d = Math.min(devicePixelRatio || 1, 2), r = pin.getBoundingClientRect();
          canvas.width = Math.max(1, Math.round(r.width * d));
          canvas.height = Math.max(1, Math.round(r.height * d));
          draw2();
        };
        if (typeof ResizeObserver !== "undefined") {
          ro = new ResizeObserver(size);
          ro.observe(pin);
        } else size();
        const goto = (p) => {
          want = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));
          pump();
          draw2();
        };
        if (anim) stop = onScroll((y, vh) => {
          const p = prog(el.getBoundingClientRect(), vh);
          return () => goto(p);
        });
        else goto(0);
      }
      return () => {
        dead = true;
        stop && stop();
        ro && ro.disconnect();
        loading.forEach((im) => {
          im.onload = im.onerror = null;
          im.src = "";
        });
        loading.clear();
        if (video) {
          host.parentNode ? host.parentNode.insertBefore(el, host) : parent.appendChild(el);
          host.remove();
          el.className = saved[0];
          el.style.cssText = saved[1];
        } else {
          pin && pin.remove();
          el.style.height = saveH;
          el.classList.remove("efx-sequence-on");
        }
      };
    }
  };

  // src/features/split.js
  var split_default = {
    name: "split",
    selector: ".efx-split",
    defaults: { by: "word", effect: "fade-up", stagger: 40, duration: 600, once: true, max: 200 },
    init(el, o) {
      if (!motionOK()) return;
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) return;
      const saved = el.innerHTML;
      const words = text.split(" ");
      const letters = o.by === "letter" && text.replace(/ /g, "").length <= o.max;
      const wave2 = o.effect === "wave", st = el.style;
      const frag = document.createDocumentFragment();
      let i = 0;
      const piece = (t) => {
        const s = document.createElement("span");
        s.className = "efx-split__p";
        s.setAttribute("aria-hidden", "true");
        s.style.setProperty("--i", i++);
        s.textContent = t;
        return s;
      };
      words.forEach((w, k) => {
        if (k) frag.append(" ");
        if (!letters) return frag.append(piece(w));
        const wrap = document.createElement("span");
        wrap.className = "efx-split__w";
        wrap.setAttribute("aria-hidden", "true");
        [...w].forEach((c) => wrap.append(piece(c)));
        frag.append(wrap);
      });
      const sr = document.createElement("span");
      sr.className = "efx-split__sr";
      sr.textContent = text;
      const pieces = document.createElement("span");
      pieces.className = "efx-split__pieces";
      pieces.setAttribute("aria-hidden", "true");
      pieces.append(frag);
      el.textContent = "";
      el.append(sr, pieces);
      el.setAttribute("data-efx-effect", o.effect);
      st.setProperty("--efx-split-stagger", o.stagger + "ms");
      st.setProperty("--efx-split-dur", o.duration + "ms");
      el.classList.add(wave2 ? "efx-split-wave" : "efx-split-pending");
      const stop = onVisible(el, (v, e) => {
        if (v) {
          if (e.intersectionRatio >= 0.1 || e.intersectionRect.height >= innerHeight * 0.25) el.classList.add("is-in");
        } else if (wave2 || !o.once) el.classList.remove("is-in");
      }, "0px", [0, 0.1]);
      return () => {
        stop();
        el.innerHTML = saved;
        el.removeAttribute("data-efx-effect");
        el.classList.remove("efx-split-pending", "efx-split-wave", "is-in");
        st.removeProperty("--efx-split-stagger");
        st.removeProperty("--efx-split-dur");
      };
    }
  };

  // src/features/spotlight.js
  var spotlight_default = {
    name: "spotlight",
    selector: ".efx-spotlight",
    defaults: { size: 240, color: "", opacity: 0.18, border: false },
    init(el, o) {
      if (!finePointer()) return;
      let restorePos = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restorePos = true;
      }
      el.classList.add("is-spot");
      el.style.setProperty("--efx-size", o.size + "px");
      el.style.setProperty("--efx-spot-o", o.opacity);
      if (o.color) el.style.setProperty("--efx-spot", o.color);
      if (o.border) el.classList.add("efx-spotlight--border");
      const move = rafThrottle((e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--efx-x", e.clientX - r.left + "px");
        el.style.setProperty("--efx-y", e.clientY - r.top + "px");
        el.classList.add("is-lit");
      });
      const offs = [on(el, "pointermove", move), on(el, "pointerleave", () => {
        move.cancel();
        el.classList.remove("is-lit");
      })];
      return () => {
        offs.forEach((f2) => f2());
        move.cancel();
        ["--efx-x", "--efx-y", "--efx-size", "--efx-spot-o", "--efx-spot"].forEach((v) => el.style.removeProperty(v));
        el.classList.remove("is-lit", "is-spot", "efx-spotlight--border");
        if (restorePos) el.style.position = "";
      };
    }
  };

  // src/features/stack.js
  var stack_default = {
    name: "stack",
    selector: ".efx-stack",
    defaults: { offset: 80, gap: 16, shrink: 0.05, blur: 0, dim: 0.15 },
    init(el, o) {
      const cards = [...el.children], anim = motionOK();
      const saved = cards.map((c) => [c.style.position, c.style.top, c.style.transformOrigin, c.style.scale, c.style.filter, c.style.willChange]);
      cards.forEach((c, i) => {
        c.style.position = "sticky";
        c.style.top = o.offset + i * o.gap + "px";
        if (anim) {
          c.style.transformOrigin = "50% 0";
          c.style.willChange = "scale";
        }
      });
      const fx2 = o.blur || o.dim;
      const stop = anim && cards.length > 1 && onScroll(() => {
        const tops = cards.map((c) => c.getBoundingClientRect().top);
        const q = cards.map((c, j) => j ? 1 - Math.min(1, Math.max(0, (tops[j] - (o.offset + j * o.gap)) / (cards[j - 1].offsetHeight || 1))) : 0);
        return () => {
          let sum = 0;
          for (let i = cards.length - 1; i >= 0; i--) {
            cards[i].style.scale = (1 - o.shrink * sum).toFixed(4);
            if (fx2) cards[i].style.filter = sum ? `${o.blur ? `blur(${(o.blur * Math.min(sum, 1)).toFixed(1)}px) ` : ""}brightness(${(1 - o.dim * Math.min(sum, 1)).toFixed(3)})` : "";
            sum += q[i];
          }
        };
      });
      return () => {
        stop && stop();
        cards.forEach((c, i) => {
          [c.style.position, c.style.top, c.style.transformOrigin, c.style.scale, c.style.filter, c.style.willChange] = saved[i];
        });
      };
    }
  };

  // src/features/sticky.js
  var sticky_default = {
    name: "sticky",
    selector: ".efx-sticky",
    defaults: { offset: 0, hide: false, shrink: false, shrinkAt: 80 },
    init(el, o) {
      const top = el.style.top;
      if (o.offset) el.style.top = o.offset + "px";
      const stopV = onVisible(el, (v, e) => {
        const r = e.boundingClientRect;
        el.classList.toggle("is-stuck", !!r && e.intersectionRatio < 1 && r.top <= o.offset + 1);
      }, `-${o.offset + 1}px 0px 0px 0px`, 1);
      const hide = o.hide && motionOK(), shrink = o.shrink;
      const anim = hide || shrink;
      if (anim) el.classList.add("efx-sticky-anim");
      let h = el.offsetHeight, last = scrollY;
      const ro = hide && typeof ResizeObserver !== "undefined" && new ResizeObserver(() => {
        h = el.offsetHeight;
      });
      ro && ro.observe(el);
      const offF = hide && on(el, "focusin", () => el.classList.remove("is-hidden"));
      const stopS = anim && onScroll((y) => {
        const down = y > last, moved = y !== last, focused = el.contains(document.activeElement);
        last = y;
        return () => {
          if (shrink) el.classList.toggle("is-shrunk", y > o.shrinkAt);
          if (hide && moved) el.classList.toggle("is-hidden", down && y > h && !focused);
        };
      });
      return () => {
        stopV();
        stopS && stopS();
        ro && ro.disconnect();
        offF && offF();
        el.classList.remove("is-stuck", "is-hidden", "is-shrunk", "efx-sticky-anim");
        el.style.top = top;
      };
    }
  };

  // src/features/textfill.js
  var textfill_default = {
    name: "textfill",
    selector: ".efx-textfill",
    defaults: { start: 0.8, end: 0.3, by: "word", dim: 0.2, color: "" },
    init(el, o) {
      if (!motionOK()) return;
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) return;
      const saved = el.innerHTML, st = el.style;
      const letters = o.by === "letter" && text.length <= 600;
      const spans = [];
      const piece = (t) => {
        const s = document.createElement("span");
        s.className = "efx-textfill__p";
        s.textContent = t;
        spans.push(s);
        return s;
      };
      const wrapText = (root) => {
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
        while (w.nextNode()) nodes.push(w.currentNode);
        for (const n2 of nodes) {
          const parts = n2.nodeValue.split(/(\s+)/);
          if (!parts.some((p) => p && !/^\s+$/.test(p))) continue;
          const frag = document.createDocumentFragment();
          for (const p of parts) {
            if (!p) continue;
            if (/^\s+$/.test(p)) {
              frag.append(" ");
              continue;
            }
            if (!letters) {
              frag.append(piece(p));
              continue;
            }
            const wrap = document.createElement("span");
            wrap.className = "efx-textfill__w";
            [...p].forEach((c) => wrap.append(piece(c)));
            frag.append(wrap);
          }
          n2.replaceWith(frag);
        }
      };
      if (el.querySelector("a,button,input,select,textarea,summary,[tabindex],[contenteditable]")) {
        wrapText(el);
      } else {
        const pieces = document.createElement("span");
        pieces.className = "efx-textfill__pieces";
        pieces.setAttribute("aria-hidden", "true");
        while (el.firstChild) pieces.appendChild(el.firstChild);
        wrapText(pieces);
        const sr = document.createElement("span");
        sr.className = "efx-textfill__sr";
        sr.textContent = text;
        el.append(sr, pieces);
      }
      const prev = [st.getPropertyValue("--efx-textfill-dim"), st.getPropertyValue("--efx-textfill-color")];
      if (el.dataset.efxDim !== void 0) st.setProperty("--efx-textfill-dim", o.dim);
      if (o.color) st.setProperty("--efx-textfill-color", o.color);
      const n = spans.length, last = [];
      const stop = onScroll((y, vh) => {
        const r = el.getBoundingClientRect();
        const a = o.start * vh, p = (a - r.top) / (a - o.end * vh + r.height || 1);
        return () => spans.forEach((s, i) => {
          const f2 = Math.round(Math.min(1, Math.max(0, p * n - i)) * 20) / 20;
          if (last[i] !== f2) {
            last[i] = f2;
            s.style.setProperty("--f", f2);
          }
        });
      });
      return () => {
        stop();
        el.innerHTML = saved;
        prev[0] ? st.setProperty("--efx-textfill-dim", prev[0]) : st.removeProperty("--efx-textfill-dim");
        prev[1] ? st.setProperty("--efx-textfill-color", prev[1]) : st.removeProperty("--efx-textfill-color");
      };
    }
  };

  // src/features/tilt.js
  var tilt_default = {
    name: "tilt",
    selector: ".efx-tilt",
    defaults: { max: 10, perspective: 900, scale: 1.02, glare: false, reset: true, gyro: false },
    init(el, o) {
      const fine = finePointer(), gy = o.gyro && !fine && "DeviceOrientationEvent" in window;
      if (!(fine || gy) || !motionOK()) return;
      let restorePos = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restorePos = true;
      }
      el.style.setProperty("--efx-persp", o.perspective + "px");
      el.style.setProperty("--efx-tscale", o.scale);
      let g = null;
      if (o.glare) {
        g = document.createElement("span");
        g.className = "efx-tilt__glare";
        g.setAttribute("aria-hidden", "true");
        el.appendChild(g);
      }
      let rect = null, settle = 0;
      const enter = () => {
        clearTimeout(settle);
        rect = el.getBoundingClientRect();
        el.style.willChange = "transform";
        el.classList.add("is-tilt-active");
      };
      const move = rafThrottle((e) => {
        if (!rect) enter();
        const r = rect;
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--efx-ry", ((x - 0.5) * 2 * o.max).toFixed(2) + "deg");
        el.style.setProperty("--efx-rx", ((0.5 - y) * 2 * o.max).toFixed(2) + "deg");
        el.classList.add("is-tilting");
        if (g) {
          g.style.setProperty("--efx-gx", x * 100 + "%");
          g.style.setProperty("--efx-gy", y * 100 + "%");
        }
      });
      const reset = () => {
        move.cancel();
        el.classList.remove("is-tilting");
        rect = null;
        if (o.reset) {
          el.style.removeProperty("--efx-rx");
          el.style.removeProperty("--efx-ry");
          clearTimeout(settle);
          settle = setTimeout(() => {
            el.classList.remove("is-tilt-active");
            el.style.willChange = "";
          }, 300);
        }
      };
      const offs = fine ? [on(el, "pointerenter", enter), on(el, "pointermove", move), on(el, "pointerleave", reset)] : [];
      if (gy) offs.push(on(window, "deviceorientation", (e) => {
        if (e.beta == null) return;
        const k = (v) => Math.max(-1, Math.min(1, v / 40));
        el.classList.add("is-tilt-active", "is-tilting");
        el.style.setProperty("--efx-ry", (k(e.gamma) * o.max).toFixed(2) + "deg");
        el.style.setProperty("--efx-rx", (-k(e.beta - 45) * o.max).toFixed(2) + "deg");
      }, { passive: true }));
      return () => {
        offs.forEach((f2) => f2());
        move.cancel();
        ["--efx-rx", "--efx-ry", "--efx-persp", "--efx-tscale"].forEach((v) => el.style.removeProperty(v));
        clearTimeout(settle);
        el.style.willChange = "";
        el.classList.remove("is-tilting", "is-tilt-active");
        if (restorePos) el.style.position = "";
        g && g.remove();
      };
    }
  };

  // src/features/totop.js
  var totop_default = {
    name: "totop",
    selector: ".efx-totop",
    defaults: { show: 400, fixed: true },
    init(el, o) {
      const type = el.getAttribute("type"), label = el.hasAttribute("aria-label");
      if (el.tagName === "BUTTON" && !type) el.type = "button";
      if (!label && !el.textContent.trim().replace(/[↑^▲]/g, "")) el.setAttribute("aria-label", "Back to top");
      let mark = false;
      const clear = () => {
        if (mark) {
          mark = false;
          document.body.removeAttribute("tabindex");
        }
      };
      const stop = onScroll((y) => el.classList.toggle("is-shown", y > o.show));
      const off = on(el, "click", (e) => {
        if (el.tagName === "A") e.preventDefault();
        scrollTo({ top: 0, behavior: motionOK() ? "smooth" : "auto" });
        const b = document.body;
        if (!b.hasAttribute("tabindex")) {
          b.setAttribute("tabindex", "-1");
          mark = true;
          b.addEventListener("blur", clear, { once: true });
        }
        b.focus({ preventScroll: true });
      });
      return () => {
        stop();
        off();
        document.body.removeEventListener("blur", clear);
        clear();
        el.classList.remove("is-shown");
        if (!label) el.removeAttribute("aria-label");
        if (!type) el.removeAttribute("type");
      };
    }
  };

  // src/features/trail.js
  add("trail-shape", "emoji", (s, a) => {
    const e = document.createElement("span");
    e.textContent = a || "\u2728";
    e.style.fontSize = s * 0.5 + "px";
    return e;
  });
  var subs4 = /* @__PURE__ */ new Set();
  var docOff5 = null;
  var subscribe4 = (fn) => {
    subs4.add(fn);
    if (!docOff5) docOff5 = on(document, "pointermove", (e) => subs4.forEach((f2) => f2(e)), { passive: true });
    return () => {
      subs4.delete(fn);
      if (!subs4.size && docOff5) {
        docOff5();
        docOff5 = null;
      }
    };
  };
  var posRef = /* @__PURE__ */ new WeakMap();
  var hold = (el) => {
    const n = posRef.get(el) || 0;
    if (!n && getComputedStyle(el).position === "static") {
      el.style.position = "relative";
      posRef.set(el, 1);
    } else if (posRef.has(el)) posRef.set(el, n + 1);
  };
  var release = (el) => {
    const n = posRef.get(el);
    if (!n) return;
    if (n === 1) {
      el.style.position = "";
      posRef.delete(el);
    } else posRef.set(el, n - 1);
  };
  var trail_default = {
    name: "trail",
    selector: ".efx-trail",
    defaults: { images: [], spacing: 80, life: 900, size: 140, rotate: 12, max: 12, shape: "", mode: "trail" },
    init(el, o) {
      if (!finePointer() || !motionOK()) return;
      hold(el);
      const layer = document.createElement("div");
      layer.className = "efx-trail__layer";
      layer.setAttribute("aria-hidden", "true");
      el.append(layer);
      const hover = o.mode === "hover";
      const rnd2 = (d) => (Math.random() * 2 - 1) * d;
      const mkItem = () => {
        const n = document.createElement("div");
        n.className = "efx-trail__item";
        n.setAttribute("aria-hidden", "true");
        layer.append(n);
        return n;
      };
      let unsub = null, stopVis = () => {
      };
      let cleanupMode;
      if (hover) {
        const pv = mkItem();
        pv.classList.add("efx-trail__item--preview");
        pv.style.setProperty("--efx-trail-size", o.size + "px");
        let on_ = false;
        const handle = (e) => {
          const r = el.getBoundingClientRect(), t = e.target.closest && e.target.closest("[data-efx-image]");
          const src = t && el.contains(t) ? t.dataset.efxImage : "";
          if (!src) {
            if (on_) {
              on_ = false;
              pv.classList.remove("is-on");
            }
            return;
          }
          if (pv.dataset.src !== src) {
            pv.dataset.src = src;
            pv.style.backgroundImage = 'url("' + src.replace(/["\\]/g, "") + '")';
          }
          pv.style.translate = e.clientX - r.left + "px " + (e.clientY - r.top) + "px";
          if (!on_) {
            on_ = true;
            pv.classList.add("is-on");
          }
        };
        const offLeave = on(el, "pointerleave", () => {
          on_ = false;
          pv.classList.remove("is-on");
        });
        stopVis = onVisible(el, (v) => {
          if (v && !unsub) unsub = subscribe4(handle);
          else if (!v && unsub) {
            unsub();
            unsub = null;
            on_ = false;
            pv.classList.remove("is-on");
          }
        });
        cleanupMode = offLeave;
      } else {
        const imgs = o.images, pool = [], shape = imgs.length ? "" : o.shape || "dot";
        let k = 0, last = null;
        const spawn = (x, y) => {
          let n = pool[k];
          if (!n) {
            n = pool[k] = mkItem();
          }
          k = (k + 1) % Math.max(1, o.max);
          if (n._a) n._a.cancel();
          n.className = "efx-trail__item" + (shape ? " efx-trail__item--" + shape.split(":")[0] : "");
          n.style.width = n.style.height = o.size + "px";
          n.style.backgroundImage = "";
          n.textContent = "";
          if (imgs.length) n.style.backgroundImage = 'url("' + imgs[Math.random() * imgs.length | 0].replace(/["\\]/g, "") + '")';
          else if (shape) {
            const [k2, ...a] = shape.split(":"), fn = get("trail-shape", k2);
            if (fn) n.append(fn(o.size, a.join(":")));
          }
          const t = "translate(" + x + "px," + y + "px) translate(-50%,-50%) rotate(" + rnd2(o.rotate).toFixed(1) + "deg)";
          n._a = n.animate([
            { opacity: 0, transform: t + " scale(.6)" },
            { opacity: 1, transform: t + " scale(1)", offset: 0.2 },
            { opacity: 0, transform: t + " scale(.3)" }
          ], { duration: o.life, easing: "ease-out", fill: "both" });
        };
        const handle = (e) => {
          const r = el.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
            last = null;
            return;
          }
          const x = e.clientX - r.left, y = e.clientY - r.top;
          if (last && Math.hypot(x - last.x, y - last.y) < o.spacing) return;
          last = { x, y };
          spawn(x, y);
        };
        stopVis = onVisible(el, (v) => {
          if (v && !unsub) unsub = subscribe4(handle);
          else if (!v && unsub) {
            unsub();
            unsub = null;
            last = null;
          }
        });
        cleanupMode = () => pool.forEach((n) => n._a && n._a.cancel());
      }
      return () => {
        stopVis();
        unsub && unsub();
        cleanupMode && cleanupMode();
        layer.remove();
        release(el);
      };
    }
  };

  // src/features/transition.js
  var KEY = "efx-tr";
  var css = (s, d) => `@view-transition{navigation:auto}::view-transition-group(root){animation-duration:${d}ms}` + ({
    "slide-up": `::view-transition-new(root){animation:efx-tr-up ${d}ms cubic-bezier(.22,1,.36,1)}@keyframes efx-tr-up{from{transform:translateY(8%);opacity:0}}`,
    zoom: `::view-transition-new(root){animation:efx-tr-zoom ${d}ms cubic-bezier(.22,1,.36,1)}@keyframes efx-tr-zoom{from{transform:scale(.94);opacity:0}}`
  }[s] || "");
  var transition_default = {
    name: "transition",
    selector: ".efx-transition",
    defaults: { style: "fade", duration: 400, prefetch: true },
    init(el, o) {
      if (!motionOK()) return;
      const native = typeof CSSViewTransitionRule !== "undefined";
      const offs = [];
      let curtain = null, style = null;
      const ss = {
        get: () => {
          try {
            return sessionStorage.getItem(KEY);
          } catch (e) {
            return null;
          }
        },
        set: (v) => {
          try {
            v ? sessionStorage.setItem(KEY, 1) : sessionStorage.removeItem(KEY);
          } catch (e) {
          }
        }
      };
      if (native) {
        style = document.createElement("style");
        style.setAttribute("data-efx-transition", "");
        style.textContent = css(o.style, o.duration);
        document.head.appendChild(style);
      } else {
        curtain = document.createElement("div");
        curtain.className = "efx-transition__curtain";
        curtain.setAttribute("aria-hidden", "true");
        curtain.setAttribute("data-efx-style", o.style);
        curtain.style.setProperty("--efx-tr-dur", o.duration + "ms");
        document.body.appendChild(curtain);
        if (ss.get()) {
          ss.set(0);
          curtain.classList.add("is-cover", "is-instant");
          curtain.offsetWidth;
          curtain.classList.remove("is-cover", "is-instant");
          curtain.classList.add("is-leave");
        }
        offs.push(on(window, "pageshow", (e) => {
          if (e.persisted) curtain.classList.remove("is-cover");
        }));
      }
      const link = (e) => {
        const a = e.target.closest && e.target.closest("a[href]");
        if (!a || a.closest("[data-efx-no-transition]") || a.target && a.target !== "_self" || a.hasAttribute("download")) return null;
        let u;
        try {
          u = new URL(a.href, location.href);
        } catch (err) {
          return null;
        }
        if (!/^https?:$/.test(u.protocol) || u.origin !== location.origin) return null;
        if (u.pathname === location.pathname && u.search === location.search) return null;
        return u;
      };
      if (curtain) offs.push(on(document, "click", (e) => {
        if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const u = link(e);
        if (!u) return;
        e.preventDefault();
        ss.set(1);
        curtain.classList.remove("is-leave");
        curtain.classList.add("is-cover");
        setTimeout(() => {
          location.href = u.href;
        }, o.duration);
      }));
      if (o.prefetch) {
        const done = /* @__PURE__ */ new Set(), links = [];
        const pre = (e) => {
          const u = link(e);
          if (!u || done.has(u.href)) return;
          done.add(u.href);
          const l = document.createElement("link");
          l.rel = "prefetch";
          l.href = u.href;
          l.setAttribute("data-efx-prefetch-link", "");
          document.head.appendChild(l);
          links.push(l);
        };
        offs.push(on(document, "pointerover", pre, { passive: true }), on(document, "focusin", pre), () => links.forEach((l) => l.remove()));
      }
      return () => {
        offs.forEach((f2) => f2());
        curtain && curtain.remove();
        style && style.remove();
      };
    }
  };

  // src/features/typed.js
  var typed_default = {
    name: "typed",
    selector: ".efx-typed",
    defaults: { words: [], speed: 60, back: 30, pause: 1600, loop: true, cursor: true, mode: "type" },
    init(el, o) {
      const saved = el.innerHTML;
      const words = o.words.length ? o.words : [el.textContent.trim()];
      if (words.length < 2 || !motionOK()) {
        if (o.words.length) el.textContent = words[0];
        return () => {
          el.innerHTML = saved;
        };
      }
      const mk = (c, t) => {
        const s = document.createElement("span");
        s.className = c;
        if (t) s.textContent = t;
        return s;
      };
      const sr = mk("efx-typed__sr", words[0]), vis = mk("efx-typed__v"), txt = mk("efx-typed__t"), type = o.mode === "type";
      vis.setAttribute("aria-hidden", "true");
      vis.append(txt);
      if (o.cursor) vis.append(mk("efx-typed__cursor"));
      el.textContent = "";
      el.append(sr, vis);
      el.setAttribute("data-efx-mode", o.mode);
      let i = 0, n = 0, dir = 1, tm = 0, seen = true;
      const later = (ms, fn) => {
        clearTimeout(tm);
        tm = setTimeout(fn, ms);
      };
      const swap = () => {
        txt.classList.add("is-out");
        later(280, () => {
          i = (i + 1) % words.length;
          txt.textContent = words[i];
          txt.classList.add("is-pre");
          void txt.offsetWidth;
          txt.classList.remove("is-pre", "is-out");
          later(o.pause, tick);
        });
      };
      const tick = () => {
        if (!seen) return;
        if (!type) {
          if (!o.loop && i === words.length - 1) return;
          return swap();
        }
        const w = words[i];
        n += dir;
        txt.textContent = w.slice(0, n);
        if (dir > 0 && n >= w.length) {
          if (!o.loop && i === words.length - 1) return;
          return later(o.pause, () => {
            dir = -1;
            tick();
          });
        }
        if (dir < 0 && n <= 0) {
          dir = 1;
          i = (i + 1) % words.length;
        }
        later(dir > 0 ? o.speed : o.back, tick);
      };
      txt.textContent = words[0];
      if (type) n = words[0].length;
      later(o.pause, () => {
        if (type) {
          dir = -1;
        }
        tick();
      });
      const stop = onVisible(el, (v) => {
        const was = seen;
        seen = v;
        if (!v) clearTimeout(tm);
        else if (!was) later(o.pause, () => {
          if (type && dir > 0 && n >= words[i].length) dir = -1;
          tick();
        });
      });
      return () => {
        stop();
        clearTimeout(tm);
        el.removeAttribute("data-efx-mode");
        el.innerHTML = saved;
      };
    }
  };

  // src/features/zoom.js
  var zoom_default = {
    name: "zoom",
    selector: ".efx-zoom",
    defaults: { scale: 2.5, size: 160, shape: "circle" },
    init(el, o) {
      const img = el.querySelector("img");
      if (!img || !finePointer()) return;
      let restorePos = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restorePos = true;
      }
      const inner = o.shape === "inner";
      const lens = document.createElement("div");
      lens.className = "efx-zoom__lens";
      lens.setAttribute("aria-hidden", "true");
      lens.dataset.shape = o.shape;
      if (!inner) lens.style.width = lens.style.height = o.size + "px";
      else lens.style.borderRadius = getComputedStyle(img).borderRadius;
      el.appendChild(lens);
      el.classList.add("efx-zoom-on");
      let loaded = false;
      const move = (e) => {
        const ir = img.getBoundingClientRect(), er = el.getBoundingClientRect();
        const x = e.clientX - ir.left, y = e.clientY - ir.top;
        if (x < 0 || y < 0 || x > ir.width || y > ir.height) return lens.classList.remove("is-on");
        const lw = inner ? ir.width : o.size, lh = inner ? ir.height : o.size;
        lens.style.left = ir.left - er.left + (inner ? 0 : x - lw / 2) + "px";
        lens.style.top = ir.top - er.top + (inner ? 0 : y - lh / 2) + "px";
        if (inner) {
          lens.style.width = lw + "px";
          lens.style.height = lh + "px";
        }
        lens.style.backgroundSize = ir.width * o.scale + "px " + ir.height * o.scale + "px";
        lens.style.backgroundPosition = lw / 2 - x * o.scale + "px " + (lh / 2 - y * o.scale) + "px";
        lens.classList.add("is-on");
      };
      const offs = [
        on(el, "pointerenter", (e) => {
          if (e.pointerType === "touch") return;
          if (!loaded) {
            loaded = true;
            const u = img.dataset.efxFull || el.dataset.efxFull || img.currentSrc || img.src;
            lens.style.backgroundImage = 'url("' + u.replace(/"/g, "%22") + '")';
          }
          move(e);
        }),
        on(el, "pointermove", (e) => e.pointerType !== "touch" && move(e)),
        on(el, "pointerleave", () => lens.classList.remove("is-on"))
      ];
      return () => {
        offs.forEach((f2) => f2());
        lens.remove();
        el.classList.remove("efx-zoom-on");
        if (restorePos) el.style.position = "";
      };
    }
  };

  // src/effix-entry.js
  define(ambient_default, border_default, carousel_default, collapse_default, compare_default, confetti_default, copy_default, countdown_default, counter_default, cursor_default, direction_default, divider_default, drag_default, draw_default, hscroll_default, lazyimg_default, lightbox_default, magnetic_default, marquee_default, media_default, mouse_default, odometer_default, parallax_default, particles_default, popup_default, progress_default, proximity_default, reveal_default, ripple_default, schedule_default, scramble_default, scrollspy_default, scrub_default, sequence_default, split_default, spotlight_default, stack_default, sticky_default, textfill_default, tilt_default, totop_default, trail_default, transition_default, typed_default, zoom_default);
  if (typeof window !== "undefined") window.Effix = core_default;
  autoBoot();
  var effix_entry_default = core_default;
})();
