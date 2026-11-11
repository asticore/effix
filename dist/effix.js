/*! Effix v0.2.0 | MIT | https://github.com/asticore/effix */
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
      if (!mediaOK(el)) continue;
      if (def.lazy) queueLazy(el, def);
      else mount(el, def);
    }
  }
  function define(...defs2) {
    for (const def of defs2.flat()) {
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
    for (const el of els) teardown(el, name);
    return api;
  }
  function teardown(el, name) {
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
    if (!m) return;
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
  var mediaWatch = /* @__PURE__ */ new WeakMap();
  function mediaOK(el) {
    const q = el.getAttribute("data-efx-media");
    if (!q || typeof matchMedia === "undefined") return true;
    let mql = mediaWatch.get(el);
    if (!mql) {
      try {
        mql = matchMedia(q);
      } catch (e) {
        return true;
      }
      mediaWatch.set(el, mql);
      mql.addEventListener("change", () => {
        if (!el.isConnected) return;
        if (mql.matches) for (const def of registry.values()) {
          if (el.matches(def.selector)) def.lazy ? queueLazy(el, def) : mount(el, def);
        }
        else teardown(el);
      });
    }
    return mql.matches;
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
    version: "0.2.0",
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
  var cell = (a) => Math.max(14, Math.sqrt(a / 1200));
  var cells = (a) => {
    const c = cell(a);
    return Math.ceil(a / (c * c) + 2 * Math.sqrt(a) / c + 2);
  };
  var place = (p, S2) => {
    const c = cell(S2.w * S2.h), n = Math.ceil(S2.w / c) || 1;
    p.s = c;
    p.x = p.i % n * c;
    p.y = (p.i / n | 0) * c;
    p.l = 0;
    p.k = S2.rnd(0, 1);
  };
  add("ambient-mode", {
    grid: {
      count: cells,
      ptr: 1,
      spawn: place,
      step: (p, S2) => {
        const q = S2.ptr, d = Math.hypot(q.x - p.x - p.s / 2, q.y - p.y - p.s / 2);
        p.l = q.on && d < 110 ? Math.max(p.l, 1 - d / 110) : p.l * 0.93;
        return 1;
      },
      draw: (c, p, S2) => {
        if (p.y > S2.h) return;
        c.globalAlpha = S2.op * 0.12;
        c.lineWidth = 1;
        c.strokeRect(p.x + 0.5, p.y + 0.5, p.s - 1, p.s - 1);
        if (p.l > 0.02) {
          c.globalAlpha = S2.op * p.l * 0.7;
          c.fillRect(p.x + 1, p.y + 1, p.s - 2, p.s - 2);
        }
      }
    },
    flicker: {
      count: cells,
      spawn: place,
      step: (p, S2) => {
        if (Math.random() < 0.012 * S2.sp) p.k = Math.random() < 0.35 ? S2.rnd(0.4, 1) : 0;
        p.l += (p.k - p.l) * 0.15;
        return 1;
      },
      draw: (c, p, S2) => {
        if (p.y > S2.h) return;
        c.globalAlpha = S2.op * (0.04 + p.l * 0.8);
        c.fillRect(p.x + 1, p.y + 1, p.s - 2, p.s - 2);
      }
    },
    meteors: {
      count: cnt(2e4, 14),
      step: (p, S2) => {
        p.x -= p.v * 0.7 * S2.sp;
        p.y += p.v * 0.7 * S2.sp;
        return p.y < S2.h + 60 && p.x > -60;
      },
      spawn: (p, S2, first) => {
        p.v = S2.rnd(4, 9);
        p.l = S2.rnd(60, 140);
        p.x = S2.rnd(0, S2.w + S2.h);
        p.y = first ? S2.rnd(-S2.h, S2.h) : -S2.rnd(20, 400);
      },
      draw: (c, p, S2) => {
        const t = p.l * 0.7, g = c.createLinearGradient(p.x, p.y, p.x + t, p.y - t);
        g.addColorStop(0, p.c);
        g.addColorStop(1, "transparent");
        c.globalAlpha = S2.op;
        c.strokeStyle = g;
        c.lineWidth = 1.5;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(p.x + t, p.y - t);
        c.stroke();
      }
    }
  });
  add("ambient-mode", {
    dots: {
      count: (a) => {
        const c = Math.max(16, Math.sqrt(a / 900));
        return Math.ceil(a / (c * c) + 2 * Math.sqrt(a) / c + 2);
      },
      ptr: 1,
      spawn: (p, S2) => {
        const c = Math.max(16, Math.sqrt(S2.w * S2.h / 900)), n = Math.ceil(S2.w / c) || 1;
        p.s = c;
        p.x = p.i % n * c + c / 2;
        p.y = (p.i / n | 0) * c + c / 2;
        p.l = 0;
      },
      step: (p, S2) => {
        const q = S2.ptr, d = Math.hypot(q.x - p.x, q.y - p.y);
        p.l = q.on && d < 140 ? Math.max(p.l * 0.9, 1 - d / 140) : p.l * 0.92;
        return 1;
      },
      draw: (c, p, S2) => {
        if (p.y > S2.h + p.s) return;
        c.globalAlpha = S2.op * (0.14 + p.l * 0.86);
        dot(c, p.x, p.y, 1 + p.l * 1.8);
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

  // src/features/_stagger.js
  var cache = /* @__PURE__ */ new WeakMap();
  var bucket = (vals) => {
    const u = [];
    [...vals].sort((a, b) => a - b).forEach((v) => {
      if (!u.length || v - u[u.length - 1] > 4) u.push(v);
    });
    return (v) => {
      let k = 0;
      u.forEach((c, i) => {
        if (v >= c - 4) k = i;
      });
      return k;
    };
  };
  function compute(g, items) {
    const ds = g.dataset, n = items.length;
    const step = parseFloat(ds.efxStagger) || 80, total = parseFloat(ds.efxTotal) || 0;
    const from = (ds.efxFrom || "first").trim(), grid = (ds.efxGrid || "").trim(), axis = grid && ds.efxAxis;
    let pos;
    if (grid === "auto") {
      const bx = bucket(items.map((e) => e.offsetLeft)), by = bucket(items.map((e) => e.offsetTop));
      pos = items.map((e) => [bx(e.offsetLeft), by(e.offsetTop)]);
    } else if (parseInt(grid) > 0) {
      const c = parseInt(grid);
      pos = items.map((_, i) => [i % c, Math.floor(i / c)]);
    } else pos = items.map((_, i) => [i, 0]);
    const mx = Math.max(...pos.map((p) => p[0])), my = Math.max(...pos.map((p) => p[1]));
    const dist = (p, o) => {
      const dx = p[0] - o[0], dy = p[1] - o[1];
      return axis === "x" ? Math.abs(dx) : axis === "y" ? Math.abs(dy) : Math.hypot(dx, dy);
    };
    const mid = [mx / 2, my / 2];
    let d;
    if (from === "random") {
      d = items.map((_, i) => i);
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [d[i], d[j]] = [d[j], d[i]];
      }
    } else if (from === "edges") {
      d = pos.map((p) => dist(p, mid));
      const m = Math.max(...d);
      d = d.map((v) => m - v);
    } else {
      const o = from === "center" ? mid : from === "last" ? pos[n - 1] : /^\d+$/.test(from) ? pos[Math.min(+from, n - 1)] : pos[0];
      d = pos.map((p) => dist(p, o));
    }
    const max = Math.max(...d), fn = ds.efxEase ? ease(ds.efxEase) : null;
    return d.map((v) => {
      let t = max ? v / max : 0;
      if (fn) t = fn(t);
      return total > 0 ? t * total : t * max * step;
    });
  }
  var staggerGroup = (el) => el.parentElement && el.parentElement.closest(".efx-stagger");
  function stagger(group, sel, el) {
    let m = cache.get(group);
    if (!m) cache.set(group, m = /* @__PURE__ */ new Map());
    const sig = JSON.stringify(group.dataset);
    let c = m.get(sel);
    if (!c || c.sig !== sig || !c.items.includes(el)) {
      const items = [...group.querySelectorAll(sel)];
      m.set(sel, c = { sig, items, delays: compute(group, items) });
    }
    return c.delays[c.items.indexOf(el)] || 0;
  }

  // src/features/animate.js
  var ENTER = /\befx-(fade-in|bounce-(in|up|down)|slide-|pop-in|rotate-in|scale-|zoom-in|flip-)/;
  var animate_default = {
    name: "animate",
    selector: ".efx-click,.efx-load,.efx-scroll",
    defaults: { delay: 0, once: true, threshold: 0.15, repeat: "" },
    init(el, o) {
      if (!motionOK()) return;
      const cl = el.classList, st = el.style, offs = [];
      const prevDelay = st.getPropertyValue("--efx-delay"), prevIter = st.getPropertyValue("--efx-iter");
      let delay = o.delay;
      const group = staggerGroup(el);
      if (group && !cl.contains("efx-click")) delay += stagger(group, ".efx-load,.efx-scroll", el);
      if (delay) st.setProperty("--efx-delay", delay + "ms");
      if (o.repeat) st.setProperty("--efx-iter", o.repeat === "infinite" || o.repeat === "loop" ? "infinite" : parseFloat(o.repeat) || 1);
      const play = () => {
        cl.remove("efx-anim-pending");
        cl.remove("is-playing");
        void el.offsetWidth;
        cl.add("is-playing");
      };
      let stop = () => {
      };
      if (cl.contains("efx-click")) {
        offs.push(on(el, "click", play), on(el, "animationend", (e) => {
          if (e.target === el) cl.remove("is-playing");
        }));
      } else if (cl.contains("efx-scroll")) {
        const enter = ENTER.test(el.className);
        if (enter) cl.add("efx-anim-pending");
        stop = onVisible(el, (vis, e) => {
          if (vis && (e.intersectionRatio >= o.threshold || e.intersectionRect.height >= innerHeight * 0.25)) {
            cl.remove("efx-anim-pending");
            cl.add("is-playing");
            if (o.once) stop();
          } else if (!o.once && !vis) {
            cl.remove("is-playing");
            if (enter) cl.add("efx-anim-pending");
          }
        }, "0px", [0, o.threshold, 0.5, 1]);
      } else if (delay) {
        st.animation = "none";
        void el.offsetWidth;
        st.animation = "";
      }
      return () => {
        stop();
        offs.forEach((f2) => f2());
        cl.remove("efx-anim-pending", "is-playing");
        if (prevDelay) st.setProperty("--efx-delay", prevDelay);
        else st.removeProperty("--efx-delay");
        if (prevIter) st.setProperty("--efx-iter", prevIter);
        else st.removeProperty("--efx-iter");
      };
    }
  };

  // src/features/ascii.js
  var CH = 0.6;
  var esc = (c) => c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c;
  var ascii_default = {
    name: "ascii",
    selector: ".efx-ascii",
    lazy: true,
    defaults: { cols: 80, chars: " .:-=+*#%@", invert: false, color: "mono", text: "", fps: 24, reveal: true, duration: 1200, output: "pre", live: false },
    init(el, o) {
      const tag = el.tagName, isVid = tag === "VIDEO", isCv = tag === "CANVAS", isImg = tag === "IMG";
      const text = !(isVid || isCv || isImg) ? o.text || el.textContent.trim() : "";
      if (!(isVid || isCv || isImg) && !text) return;
      const chars = o.chars || " .:-=+*#%@", pool = chars.replace(/ /g, "") || chars, N = chars.length;
      const source = o.color === "source" && !text, toCv = o.output === "canvas";
      const offs = [], reduce = !motionOK();
      const parent = text ? el : el.parentElement || el;
      const initW = text ? 0 : el.getBoundingClientRect().width;
      const mkText = () => {
        const cs = getComputedStyle(el), f2 = cs.fontWeight + " 100px " + cs.fontFamily, lines = text.split("\n");
        const c = document.createElement("canvas"), x = c.getContext("2d");
        x.font = f2;
        c.width = Math.ceil(Math.max(...lines.map((l) => x.measureText(l).width))) + 20;
        c.height = 130 * lines.length;
        x.font = f2;
        x.textBaseline = "middle";
        x.fillStyle = "#fff";
        lines.forEach((l, i) => x.fillText(l, 10, 130 * (i + 0.5)));
        return c;
      };
      const was = { html: el.innerHTML, label: el.getAttribute("aria-label"), role: el.getAttribute("role") };
      let tc = text ? mkText() : null;
      const out = document.createElement(toCv ? "canvas" : "pre");
      out.className = "efx-ascii__out";
      out.setAttribute("aria-hidden", "true");
      if (text) {
        el.setAttribute("role", "img");
        el.setAttribute("aria-label", text);
        el.textContent = "";
        el.appendChild(out);
      } else {
        if (isImg && el.alt) el.setAttribute("aria-label", el.alt);
        el.classList.add("efx-ascii__src");
        el.after(out);
      }
      if (isVid) offs.push(on(out, "click", () => el.paused ? el.play() : el.pause()));
      const oc2 = document.createElement("canvas"), ox = oc2.getContext("2d", { willReadFrequently: true });
      const src = text ? () => tc : () => el;
      const dims = () => text ? [tc.width, tc.height] : isImg ? [el.naturalWidth, el.naturalHeight] : isVid ? [el.videoWidth, el.videoHeight] : [el.width, el.height];
      let g = null, S2 = null, raf2 = 0, last = 0, k0 = null, vis = false, dead = false, fs = 10, revealed = !(o.reveal && !reduce);
      const sample2 = () => {
        const [w, h] = dims();
        if (!w || !h) return null;
        const cols = Math.max(4, o.cols | 0), rows = Math.max(1, Math.round(cols * h / w * CH));
        oc2.width = cols;
        oc2.height = rows;
        let d;
        try {
          ox.drawImage(src(), 0, 0, cols, rows);
          d = ox.getImageData(0, 0, cols, rows).data;
        } catch (e) {
          return e.name === "SecurityError" ? false : null;
        }
        const L = new Float32Array(cols * rows), C = source ? [] : null;
        for (let i = 0; i < L.length; i++) {
          const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2], l = (0.2126 * r + 0.7152 * gg + 0.0722 * b) / 255 * d[i * 4 + 3] / 255;
          L[i] = o.invert ? 1 - l : l;
          if (C) C[i] = "rgb(" + (r & 240) + "," + (gg & 240) + "," + (b & 240) + ")";
        }
        return { cols, rows, L, C };
      };
      const fit = () => {
        if (!g) return;
        const tw = Math.min(initW || 1e9, parent.clientWidth) || 300;
        fs = Math.max(2, tw / (g.cols * CH));
        if (!toCv) out.style.fontSize = fs + "px";
      };
      const paint = (k) => {
        const { cols, rows, L, C } = g, n = cols * rows;
        if (k != null && (!S2 || S2.length !== n)) {
          S2 = new Float32Array(n);
          for (let i = 0; i < n; i++) S2[i] = (i % cols / cols * 0.5 + Math.random() * 0.5) * o.duration;
        }
        const at = (i) => {
          const ch = chars[Math.max(0, Math.min(N - 1, Math.round(L[i] * (N - 1))))];
          return k != null && S2[i] > k && ch !== " " ? pool[Math.random() * pool.length | 0] : ch;
        };
        if (toCv) {
          const dpr2 = Math.min(devicePixelRatio || 1, 2), W = Math.ceil(cols * fs * CH), H = Math.ceil(rows * fs), c = out.getContext("2d");
          out.width = W * dpr2;
          out.height = H * dpr2;
          out.style.width = W + "px";
          out.style.height = H + "px";
          c.setTransform(dpr2, 0, 0, dpr2, 0, 0);
          c.font = fs + "px ui-monospace,Menlo,Consolas,monospace";
          c.textBaseline = "top";
          c.fillStyle = getComputedStyle(out).color;
          for (let i = 0; i < n; i++) {
            const ch = at(i);
            if (ch === " ") continue;
            if (C) c.fillStyle = C[i];
            c.fillText(ch, i % cols * fs * CH, (i / cols | 0) * fs);
          }
          return;
        }
        let s = "", run = null;
        for (let i = 0; i < n; i++) {
          if (C && C[i] !== run) {
            s += (run ? "</span>" : "") + '<span style="color:' + C[i] + '">';
            run = C[i];
          }
          s += esc(at(i)) + ((i + 1) % cols ? "" : "\n");
        }
        if (C) out.innerHTML = s + "</span>";
        else out.textContent = s;
      };
      const live = () => isVid && !el.paused && !el.ended && !reduce || isCv && o.live && !reduce;
      const frame = (t) => {
        raf2 = 0;
        if (dead) return;
        if (t - last >= 1e3 / o.fps || !g) {
          last = t;
          if (!revealed && k0 == null) k0 = t;
          const r = live() || !g ? sample2() : g;
          if (r === false) {
            console.warn("[effix] ascii: source is cross-origin/tainted (needs same-origin or CORS), showing the original");
            dead = true;
            out.remove();
            el.classList.remove("efx-ascii__src");
            return;
          }
          if (r) {
            g = r;
            fit();
            const k = revealed ? null : t - k0;
            paint(k);
            if (k != null && k >= o.duration) revealed = true;
          }
        }
        if (vis && g && (!revealed || live())) raf2 = requestAnimationFrame(frame);
      };
      const kick = () => {
        if (!raf2 && !dead && vis) raf2 = requestAnimationFrame(frame);
      };
      const refresh2 = () => {
        g = null;
        kick();
      };
      offs.push(onVisible(out, (v) => {
        vis = v;
        if (v) kick();
        else {
          cancelAnimationFrame(raf2);
          raf2 = 0;
        }
      }));
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => {
          fit();
          if (g && !raf2) paint(revealed ? null : -1);
        });
        ro.observe(parent);
        offs.push(() => ro.disconnect());
      }
      if (isImg) offs.push(on(el, "load", refresh2));
      if (isVid) ["loadeddata", "seeked", "play"].forEach((e) => offs.push(on(el, e, e === "play" ? kick : refresh2)));
      if (text && document.fonts) document.fonts.ready.then(() => {
        if (!dead) {
          tc = mkText();
          refresh2();
        }
      });
      return () => {
        dead = true;
        cancelAnimationFrame(raf2);
        offs.forEach((f2) => f2());
        out.remove();
        el.classList.remove("efx-ascii__src");
        if (text) el.innerHTML = was.html;
        ["aria-label", "role"].forEach((a, i) => {
          const v = [was.label, was.role][i];
          v == null ? el.removeAttribute(a) : el.setAttribute(a, v);
        });
      };
    }
  };

  // src/features/audio.js
  var split2 = (s) => {
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
  var pick = (c, f2) => c[Math.min(c.length - 1, f2 * c.length | 0)];
  var avg = (a, i, n, step) => {
    let s = 0;
    for (let k = 0; k < step; k++) s += a[i * step + k] || 0;
    return s / step / 255;
  };
  var grad = (c, cols, x0, x1) => {
    const g = c.createLinearGradient(x0, 0, x1, 0);
    cols.forEach((k, i) => g.addColorStop(cols.length > 1 ? i / (cols.length - 1) : 0, k));
    return g;
  };
  add("audio-viz", {
    bars(c, d, w, h, cols) {
      const n = d.count, step = Math.max(1, Math.floor(d.freq.length * 0.75 / n)), bw = w / n;
      for (let i = 0; i < n; i++) {
        const v = Math.pow(avg(d.freq, i, n, step), 1.2), bh = Math.max(3, v * h * 0.96);
        c.fillStyle = pick(cols, i / n);
        c.beginPath();
        c.roundRect ? c.roundRect(i * bw + bw * 0.15, h - bh, bw * 0.7, bh, Math.min(bw * 0.35, 6)) : c.rect(i * bw + bw * 0.15, h - bh, bw * 0.7, bh);
        c.fill();
      }
    },
    wave(c, d, w, h, cols) {
      const t = d.time, n = t.length;
      c.lineWidth = 2.5;
      c.lineJoin = "round";
      c.strokeStyle = grad(c, cols, 0, w);
      c.beginPath();
      for (let i = 0; i < n; i++) {
        const x = i / (n - 1) * w, y = h / 2 + (t[i] - 128) / 128 * h * 0.45;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    },
    circle(c, d, w, h, cols) {
      const n = d.count, step = Math.max(1, Math.floor(d.freq.length * 0.75 / n)), m = Math.min(w, h), r0 = m * 0.2;
      c.lineCap = "round";
      c.lineWidth = Math.max(2, m * 0.018);
      for (let i = 0; i < n; i++) {
        const a = i / n * 6.2832 - 1.5708, len = 3 + avg(d.freq, i, n, step) * m * 0.26;
        c.strokeStyle = pick(cols, i / n);
        c.beginPath();
        c.moveTo(w / 2 + Math.cos(a) * r0, h / 2 + Math.sin(a) * r0);
        c.lineTo(w / 2 + Math.cos(a) * (r0 + len), h / 2 + Math.sin(a) * (r0 + len));
        c.stroke();
      }
    },
    scope(c, d, w, h, cols) {
      const t = d.time, n = t.length, off = n >> 2, m = Math.min(w, h);
      c.lineWidth = 1.5;
      c.strokeStyle = cols[0];
      c.shadowColor = cols[cols.length - 1];
      c.shadowBlur = 10;
      c.lineJoin = "round";
      c.beginPath();
      for (let i = 0; i < n; i++) {
        const x = w / 2 + (t[i] - 128) / 128 * m * 0.46, y = h / 2 + (t[(i + off) % n] - 128) / 128 * m * 0.46;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    },
    dots(c, d, w, h, cols) {
      const n = Math.max(8, d.count >> 1), rows = 8, step = Math.max(1, Math.floor(d.freq.length * 0.75 / n)), cw = w / n, rh = h / rows, r = Math.max(1.5, Math.min(cw, rh) * 0.32);
      for (let i = 0; i < n; i++) {
        const lit = avg(d.freq, i, n, step) * rows;
        c.fillStyle = pick(cols, i / n);
        for (let j = 0; j < rows; j++) {
          c.globalAlpha = j < lit ? 1 : 0.14;
          c.beginPath();
          c.arc(i * cw + cw / 2, h - j * rh - rh / 2, r, 0, 6.2832);
          c.fill();
        }
      }
      c.globalAlpha = 1;
    }
  });
  var graphs = /* @__PURE__ */ new WeakMap();
  var AC;
  var sameOK = (m) => {
    const u = m.currentSrc || m.src;
    if (!u || m.crossOrigin !== null) return true;
    try {
      const l = new URL(u, location.href);
      return /^(data|blob):$/.test(l.protocol) || l.origin === location.origin;
    } catch (e) {
      return true;
    }
  };
  function tap(m) {
    const had = graphs.get(m);
    if (had !== void 0) return had;
    const AX = window.AudioContext || window.webkitAudioContext;
    if (!AX) return null;
    if (!sameOK(m)) {
      graphs.set(m, null);
      console.warn("[effix] audio: cross-origin media without crossorigin attribute, visualizer skipped", m.currentSrc);
      return null;
    }
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
    try {
      AC = AC || new AX();
      const a = AC.createAnalyser();
      a.fftSize = 512;
      a.smoothingTimeConstant = 0.8;
      AC.createMediaElementSource(m).connect(a);
      a.connect(AC.destination);
      const g = { a, f: new Uint8Array(a.frequencyBinCount), t: new Uint8Array(a.fftSize) };
      graphs.set(m, g);
      return g;
    } catch (e) {
      graphs.set(m, null);
      console.warn("[effix] audio: analyser unavailable", e);
      return null;
    }
  }
  var audio_default = {
    name: "audio",
    selector: ".efx-audio",
    lazy: true,
    defaults: { for: "", type: "bars", color: "", count: 48, gain: 1 },
    init(el, o, Effix) {
      const m = o.for ? document.querySelector(o.for) : el.querySelector("audio,video");
      if (!m || el === m) return console.warn("[effix] audio: media not found", o.for);
      const fn = Effix.get("audio-viz", o.type) || Effix.get("audio-viz", "bars");
      let restore = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restore = true;
      }
      const cv2 = document.createElement("canvas");
      cv2.className = "efx-audio__canvas";
      cv2.setAttribute("aria-hidden", "true");
      el.appendChild(cv2);
      const cx = cv2.getContext("2d");
      let colors = split2(o.color);
      if (!colors.length) for (let i = 1; i < 5; i++) {
        const v = cssVar(el, "--efx-chart-" + i);
        if (v) colors.push(v);
      }
      if (!colors.length) colors = [themeColor(el)];
      const count = Math.max(4, o.count | 0);
      const offs = [], reduce = !motionOK();
      let w = 0, h = 0, raf2 = 0, vis = true, playing = false, lv = 0, g = null, linked = [];
      const idle = { freq: new Uint8Array(256), time: new Uint8Array(512).fill(128), level: 0, count };
      const calm = { freq: idle.freq.map((_, i) => 70 + 40 * Math.cos(i / 40)), time: idle.time.map((_, i) => 128 + 22 * Math.sin(i / 14)), level: 0.2, count };
      const paint = (d) => {
        cx.clearRect(0, 0, w, h);
        cx.save();
        cx.fillStyle = cx.strokeStyle = colors[0];
        fn(cx, d, w, h, colors);
        cx.restore();
      };
      const setLv = (v) => {
        const s = v.toFixed(3);
        [el, ...linked].forEach((n) => n.style.setProperty("--efx-level", s));
      };
      const rest = () => paint(reduce ? calm : idle);
      const tick = () => {
        raf2 = 0;
        if (!g) return;
        g.a.getByteFrequencyData(g.f);
        g.a.getByteTimeDomainData(g.t);
        let s = 0;
        const n = g.f.length * 0.6 | 0;
        for (let i = 0; i < n; i++) s += g.f[i];
        lv += (Math.min(1, s / n / 255 * 1.6 * o.gain) - lv) * 0.25;
        paint({ freq: g.f, time: g.t, level: lv, count });
        setLv(lv);
        if (vis && (playing || lv > 0.01)) raf2 = requestAnimationFrame(tick);
        else if (!playing) {
          lv = 0;
          setLv(0);
          rest();
        }
      };
      const kick = () => {
        if (!raf2 && g) raf2 = requestAnimationFrame(tick);
      };
      const size = () => {
        const dpr2 = Math.min(devicePixelRatio || 1, 2);
        w = el.clientWidth;
        h = el.clientHeight;
        cv2.width = w * dpr2;
        cv2.height = h * dpr2;
        cx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
        if (!raf2) rest();
      };
      size();
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(size);
        ro.observe(el);
        offs.push(() => ro.disconnect());
      }
      if (!reduce) {
        const onPlay = () => {
          linked = [...document.querySelectorAll("[data-efx-level-for]")].filter((n) => document.querySelector(n.dataset.efxLevelFor) === m);
          g = tap(m);
          if (!g) return;
          if (AC.state === "suspended") AC.resume();
          playing = true;
          kick();
        };
        const onStop = () => {
          playing = false;
          kick();
        };
        offs.push(
          on(m, "play", onPlay),
          on(m, "playing", onPlay),
          on(m, "pause", onStop),
          on(m, "ended", onStop),
          onVisible(el, (v) => {
            vis = v;
            if (v) kick();
          })
        );
        if (!m.paused) onPlay();
      }
      return () => {
        cancelAnimationFrame(raf2);
        raf2 = 0;
        playing = false;
        offs.forEach((f2) => f2());
        [el, ...linked].forEach((n) => n.style.removeProperty("--efx-level"));
        cv2.remove();
        if (restore) el.style.position = "";
      };
    }
  };

  // src/features/beam.js
  var NS = "http://www.w3.org/2000/svg";
  var mk = (t, a, p) => {
    const n = document.createElementNS(NS, t);
    for (const k in a) n.setAttribute(k, a[k]);
    p && p.appendChild(n);
    return n;
  };
  var uid = 0;
  var beam_default = {
    name: "beam",
    selector: ".efx-beam",
    defaults: { links: "", curvature: 40, speed: 3, width: 2, color: "", reverse: false },
    init(el, o) {
      const q = (s) => {
        try {
          return el.querySelector(s);
        } catch (e) {
          return null;
        }
      };
      const L = o.links.split("|").map((s) => s.split(">").map((x) => x.trim())).filter((l) => l.length === 2 && l[0] && l[1]).map(([a, b]) => [q(a), q(b)]).filter((l) => l[0] && l[1]);
      if (!L.length) return;
      let restore = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restore = true;
      }
      const motion = motionOK(), id = "efx-beam-" + ++uid;
      const svg = mk("svg", { class: "efx-beam__svg", "aria-hidden": "true" });
      svg.style.setProperty("--efx-beam-s", o.speed + "s");
      const parts = L.map((l, i) => {
        const g = mk("linearGradient", { id: id + i, gradientUnits: "userSpaceOnUse" }, svg);
        const stops = o.color ? [o.color, o.color] : ["var(--sh-primary,#6366f1)", "var(--sh-accent,#ec4899)"];
        stops.forEach((c, k) => mk("stop", { offset: k, style: "stop-color:" + c }, g));
        const at = { class: "efx-beam__path", stroke: `url(#${id + i})`, "stroke-width": o.width, pathLength: 100 };
        const base = mk("path", { ...at, opacity: motion ? 0.18 : 0.6 }, svg);
        const run = motion && mk("path", { ...at, class: "efx-beam__path efx-beam__run" + (o.reverse ? " efx-beam__rev" : ""), "stroke-dasharray": "25 200" }, svg);
        if (run) run.style.animationDelay = -(i * o.speed / 3) + "s";
        return { g, base, run };
      });
      el.appendChild(svg);
      const layout = () => {
        const r = el.getBoundingClientRect();
        svg.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
        L.forEach(([a, b], i) => {
          const pt = (n) => {
            const t = n.getBoundingClientRect();
            return [t.left - r.left + t.width / 2, t.top - r.top + t.height / 2];
          };
          const [ax, ay] = pt(a), [bx, by] = pt(b), p = parts[i];
          const d = `M${ax},${ay} Q${(ax + bx) / 2},${(ay + by) / 2 - o.curvature} ${bx},${by}`;
          p.base.setAttribute("d", d);
          p.run && p.run.setAttribute("d", d);
          [["x1", ax], ["y1", ay], ["x2", bx], ["y2", by]].forEach(([k, v]) => p.g.setAttribute(k, v));
        });
      };
      const lay = rafThrottle(layout);
      layout();
      const offs = [on(window, "resize", lay), onVisible(el, (v) => svg.classList.toggle("is-paused", !v))];
      let ro;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(lay);
        ro.observe(el);
        L.forEach((l) => l.forEach((n) => ro.observe(n)));
      }
      return () => {
        lay.cancel();
        ro && ro.disconnect();
        offs.forEach((f2) => f2());
        svg.remove();
        if (restore) el.style.position = "";
      };
    }
  };

  // src/features/border.js
  var border_default = {
    name: "border",
    selector: ".efx-border-spin,.efx-border-trace,.efx-border-glow,.efx-border-gradient,.efx-border-wipe,.efx-border-pulse",
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

  // src/features/chapter.js
  var NS2 = "http://www.w3.org/2000/svg";
  var titleOf = (s) => s.dataset.efxTitle || (s.querySelector("h1,h2,h3,h4,h5,h6") || {}).textContent || "";
  var chapter_default = {
    name: "chapter",
    selector: ".efx-chapter",
    defaults: { sections: "section[data-efx-title]", ring: true },
    init(el, o) {
      const secs = [...document.querySelectorAll(o.sections)];
      if (!secs.length) return;
      const prevLive = el.getAttribute("aria-live"), prevHref = el.getAttribute("href");
      if (!prevLive) el.setAttribute("aria-live", "polite");
      el.classList.add("efx-chapter-on", "is-empty");
      const nodes = [];
      const add2 = (tag, cls, ns) => {
        const n = ns ? document.createElementNS(NS2, tag) : document.createElement(tag);
        n.setAttribute("class", cls);
        nodes.push(n);
        return n;
      };
      const text = add2("span", "efx-chapter__text");
      let circle = null;
      if (o.ring) {
        const svg = add2("svg", "efx-chapter__ring", 1);
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        const bg = add2("circle", "efx-chapter__track", 1);
        circle = add2("circle", "efx-chapter__bar", 1);
        [bg, circle].forEach((c) => {
          c.setAttribute("cx", 12);
          c.setAttribute("cy", 12);
          c.setAttribute("r", 9);
          c.setAttribute("pathLength", 100);
          svg.append(c);
        });
        el.append(svg);
      }
      el.append(text);
      const seen = /* @__PURE__ */ new Set();
      let cur = null, label = null;
      const set = (s) => {
        if (s === cur) return;
        cur = s;
        el.classList.toggle("is-empty", !s);
        if (!s) return;
        const t = titleOf(s).trim();
        if (s.id && el.tagName === "A") el.setAttribute("href", "#" + s.id);
        if (t === (label && label.textContent)) return;
        const n = document.createElement("span");
        n.textContent = t;
        const old = label;
        label = n;
        text.append(n);
        if (old && motionOK()) {
          const o2 = { duration: 400, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" };
          n.animate([{ transform: "translateY(100%)", opacity: 0 }, { transform: "none", opacity: 1 }], o2);
          old.style.position = "absolute";
          old.animate([{ transform: "none", opacity: 1 }, { transform: "translateY(-100%)", opacity: 0 }], o2).onfinish = () => old.remove();
        } else if (old) old.remove();
      };
      const pick2 = () => set(secs.filter((s) => seen.has(s)).pop() || null);
      const stops = secs.map((s) => onVisible(s, (v) => {
        v ? seen.add(s) : seen.delete(s);
        pick2();
      }, "-45% 0px -45% 0px"));
      const stopScroll = circle && onScroll((y, vh) => {
        if (!cur) return;
        const r = cur.getBoundingClientRect(), p = Math.min(1, Math.max(0, (vh / 2 - r.top) / (r.height || 1)));
        return () => circle.setAttribute("stroke-dashoffset", (100 - p * 100).toFixed(1));
      });
      const offClick = on(el, "click", (e) => {
        if (!cur || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        e.preventDefault();
        cur.scrollIntoView({ behavior: motionOK() ? "smooth" : "auto", block: "start" });
      });
      return () => {
        stops.forEach((f2) => f2());
        stopScroll && stopScroll();
        offClick();
        nodes.forEach((n) => n.remove());
        [...text.children].forEach((n) => n.remove());
        el.classList.remove("efx-chapter-on", "is-empty");
        prevLive === null ? el.removeAttribute("aria-live") : el.setAttribute("aria-live", prevLive);
        prevHref === null ? el.removeAttribute("href") : el.setAttribute("href", prevHref);
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
      const mk2 = (tag, cls) => {
        const n = document.createElement(tag);
        n.className = "efx-compare__" + cls;
        return n;
      };
      const clip = mk2("div", "clip"), handle = mk2("div", "handle"), knob = mk2("span", "knob"), input = mk2("input", "range");
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
          const cell2 = document.createElement("div"), n = document.createElement("span"), l = document.createElement("span");
          cell2.className = "efx-countdown__unit";
          n.className = "efx-countdown__num";
          l.className = "efx-countdown__label";
          l.textContent = labels["dhms".indexOf(u)] || "";
          nums[u] = n;
          cell2.append(n, l);
          el.append(cell2);
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
      const mk2 = (k) => {
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
      const ring = o.style !== "dot" ? mk2("ring") : null;
      const dot2 = o.style !== "ring" ? mk2("dot") : null;
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
      const show3 = (v) => parts.forEach((n) => {
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
          show3(true);
          const h = !!(e.target.closest && e.target.closest(hoverSel));
          parts.forEach((n) => n.toggleAttribute("data-hover", h));
        }, { passive: true }),
        on(document, "pointerdown", () => parts.forEach((n) => n.setAttribute("data-down", ""))),
        on(document, "pointerup", () => parts.forEach((n) => n.removeAttribute("data-down"))),
        on(document.documentElement, "pointerleave", () => {
          seen = false;
          show3(false);
        }),
        on(window, "blur", () => {
          seen = false;
          show3(false);
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

  // src/features/dim.js
  var dim_default = {
    name: "dim",
    selector: ".efx-dim",
    defaults: { opacity: 0.35, blur: 0, preview: true, items: "" },
    init(el, o) {
      const kids = () => o.items ? [...el.querySelectorAll(o.items)] : [...el.children].filter((c) => !c.classList.contains("efx-dim__preview"));
      const s = el.style, saved = [s.getPropertyValue("--efx-dim-opacity"), s.getPropertyValue("--efx-dim-blur")];
      if (!el.style.getPropertyValue("--efx-dim-opacity")) s.setProperty("--efx-dim-opacity", o.opacity);
      if (o.blur) s.setProperty("--efx-dim-blur", o.blur + "px");
      el.classList.add("efx-dim-on");
      const fine = finePointer();
      let cur = null, pv = null, restorePos = false, ptr = 0, shown2 = "";
      if (o.preview && fine && motionOK()) {
        if (getComputedStyle(el).position === "static") {
          el.style.position = "relative";
          restorePos = true;
        }
        pv = document.createElement("div");
        pv.className = "efx-dim__preview";
        pv.setAttribute("aria-hidden", "true");
        el.append(pv);
      }
      const itemOf = (t) => {
        const k = kids();
        let n = t instanceof Element ? t : null;
        while (n && n.parentElement !== el && !k.includes(n)) n = n.parentElement;
        return n && k.includes(n) ? n : null;
      };
      const set = (it) => {
        if (it === cur) return;
        if (cur) cur.classList.remove("is-hovered");
        cur = it;
        el.classList.toggle("efx-dim-active", !!it);
        if (it) it.classList.add("is-hovered");
        if (pv) {
          const src = it && it.dataset.efxImage;
          pv.classList.toggle("is-on", !!src && ptr);
          if (src && shown2 !== src) {
            shown2 = src;
            pv.style.backgroundImage = 'url("' + src.replace(/["\\]/g, "") + '")';
          }
        }
      };
      const move = (e) => {
        if (e.pointerType === "touch") return;
        ptr = 1;
        set(itemOf(e.target));
        if (pv && cur && cur.dataset.efxImage) {
          const r = el.getBoundingClientRect();
          pv.style.translate = e.clientX - r.left + "px " + (e.clientY - r.top) + "px";
          pv.classList.add("is-on");
        }
      };
      const offs = [
        on(el, "pointermove", move),
        on(el, "pointerover", move),
        on(el, "pointerleave", (e) => {
          if (e.pointerType === "touch") return;
          ptr = 0;
          pv && pv.classList.remove("is-on");
          set(el.contains(document.activeElement) && document.activeElement.matches(":focus-visible") ? itemOf(document.activeElement) : null);
        }),
        on(el, "focusin", (e) => {
          try {
            if (e.target.matches(":focus-visible")) {
              ptr = 0;
              pv && pv.classList.remove("is-on");
              set(itemOf(e.target));
            }
          } catch (_) {
          }
        }),
        on(el, "focusout", (e) => {
          if (!e.relatedTarget || !el.contains(e.relatedTarget)) {
            if (!el.matches(":hover")) set(null);
          }
        })
      ];
      return () => {
        offs.forEach((f2) => f2());
        if (cur) cur.classList.remove("is-hovered");
        el.classList.remove("efx-dim-on", "efx-dim-active");
        saved[0] ? s.setProperty("--efx-dim-opacity", saved[0]) : s.removeProperty("--efx-dim-opacity");
        saved[1] ? s.setProperty("--efx-dim-blur", saved[1]) : s.removeProperty("--efx-dim-blur");
        pv && pv.remove();
        if (restorePos) el.style.position = "";
      };
    }
  };

  // src/features/direction.js
  var direction_default = {
    name: "direction",
    selector: ".efx-direction",
    defaults: { fill: "edge" },
    init(el, o) {
      let restorePos = false;
      const fill = !/^(false|off|0|none)$/.test(o.fill), circle = o.fill === "circle";
      if (fill) {
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
      const at = (e) => {
        if (!circle) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--efx-x", (e ? (e.clientX - r.left) / (r.width || 1) * 100 : 50).toFixed(1) + "%");
        el.style.setProperty("--efx-y", (e ? (e.clientY - r.top) / (r.height || 1) * 100 : 50).toFixed(1) + "%");
      };
      const enter = (from, e) => {
        at(e);
        el.setAttribute("data-efx-from", from);
        el.classList.add("efx-direction-snap");
        void el.offsetWidth;
        el.classList.remove("efx-direction-snap");
        el.classList.add("is-hover");
      };
      const leave = (from, e) => {
        at(e);
        el.setAttribute("data-efx-from", from);
        el.classList.remove("is-hover");
      };
      const mouse = (e) => e.pointerType !== "touch";
      const offs = [
        on(el, "pointerenter", (e) => mouse(e) && enter(edge(e), e)),
        on(el, "pointerleave", (e) => mouse(e) && leave(edge(e), e)),
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
        el.style.removeProperty("--efx-x");
        el.style.removeProperty("--efx-y");
        if (restorePos) el.style.position = "";
      };
    }
  };

  // src/features/distort.js
  var NS3 = "http://www.w3.org/2000/svg";
  var uid2 = 0;
  var distort_default = {
    name: "distort",
    selector: ".efx-distort",
    defaults: { scale: 30, frequency: 0.02, speed: 1, trigger: "hover" },
    init(el, o) {
      if (!motionOK() || o.trigger === "hover" && !finePointer()) return;
      const id = "efx-distort-" + ++uid2;
      const svg = document.createElementNS(NS3, "svg");
      svg.setAttribute("class", "efx-distort__svg");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="${o.frequency}" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`;
      document.body.appendChild(svg);
      const turb = svg.querySelector("feTurbulence"), disp = svg.querySelector("feDisplacementMap");
      const prevFilter = el.style.filter;
      let target = 0, k = 0, t = 0, last = 0, raf2 = 0, vis = true, pulse = 0;
      const frame = (now) => {
        const dt = Math.min(now - last, 50) / 1e3;
        last = now;
        t += dt * o.speed;
        k += (target - k) * Math.min(1, dt * 6);
        if (!target && k < 0.01) {
          raf2 = 0;
          el.style.filter = prevFilter;
          return;
        }
        const f2 = o.frequency;
        turb.setAttribute("baseFrequency", (f2 * (1 + 0.3 * Math.sin(t * 2.1))).toFixed(5) + " " + (f2 * (1 + 0.3 * Math.cos(t * 1.7))).toFixed(5));
        disp.setAttribute("scale", (o.scale * k).toFixed(2));
        raf2 = requestAnimationFrame(frame);
      };
      const go = (v) => {
        target = v;
        if (v && !raf2 && vis) {
          el.style.filter = `url(#${id})`;
          last = performance.now();
          raf2 = requestAnimationFrame(frame);
        }
      };
      const offs = [];
      let stop;
      if (o.trigger === "hover") offs.push(on(el, "pointerenter", (e) => e.pointerType !== "touch" && go(1)), on(el, "pointerleave", () => go(0)));
      else stop = onVisible(el, (v) => {
        vis = v;
        clearTimeout(pulse);
        if (!v) {
          cancelAnimationFrame(raf2);
          raf2 = 0;
          el.style.filter = prevFilter;
          k = 0;
          return;
        }
        go(1);
        if (o.trigger === "view") pulse = setTimeout(() => go(0), 900 / o.speed);
      });
      return () => {
        offs.forEach((f2) => f2());
        stop && stop();
        clearTimeout(pulse);
        cancelAnimationFrame(raf2);
        el.style.filter = prevFilter;
        svg.remove();
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
    sawtooth: [1, [[100, "b", rep(12, (x, w) => `L${x + w},35L${x + w},100`)]]],
    chevron: [1, [[30, "b", rep(4, (x, w) => `L${x + w / 2},95L${x + w},30`)], [60, "b", rep(4, (x, w) => `L${x + w / 2},112L${x + w},60`)]], [0.4, 1]],
    swoosh: [0, [[85, "b", (ox) => `C${ox + 300},-10 ${ox + 700},150 ${ox + 1200},25`], [100, "b", (ox) => `C${ox + 400},20 ${ox + 800},140 ${ox + 1200},60`]], [0.35, 1]],
    leaves: [1, [[100, "b", rep(6, (x, w) => `Q${x + w * 0.1},0 ${x + w / 2},50Q${x + w * 0.9},0 ${x + w},100`)]]],
    hills: [1, [[100, "b", rep(4, (x, w) => `Q${x + w / 2},50 ${x + w},100`)], [100, "b", rep(3, (x, w) => `Q${x + w / 2},10 ${x + w},100`)]], [0.4, 1]],
    spikes: [1, [[100, "b", rep(24, (x, w) => `L${x + w / 2},20L${x + w},100`)]]]
  };
  add("divider-shape", Object.fromEntries(Object.entries(SHAPES).map(([k, [periodic, layers, ops]]) => [k, { periodic, layers, ops }])));
  var divider_default = {
    name: "divider",
    selector: ".efx-divider",
    defaults: { shape: "wave", color: "", height: 80, flip: false, invert: false, animate: "none", speed: 12, position: "", path: "" },
    init(el, o) {
      const custom = o.path.replace(/[^\d\sMmLlHhVvCcSsQqTtAaZz.,eE+-]/g, "").trim();
      const { periodic: per, layers, ops = [] } = custom ? { periodic: 0, layers: [[0, "b"]] } : get("divider-shape", o.shape) || get("divider-shape", "wave");
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
      const mk2 = (k, op) => {
        let body = "";
        layers.forEach(([y0, s2, tile], li) => {
          if (custom) {
            body = `<path d="${custom}"/>`;
            return;
          }
          let d = `M0,${y0}`;
          for (let ox = 0; ox < W; ox += 1200) d += tile(ox);
          d += s2 === "t" ? `L${W},0L0,0Z` : `L${W},120L0,120Z`;
          body += `<path d="${d}"${ops[li] ? ` opacity="${ops[li]}"` : ""}/>`;
        });
        const s = `<svg viewBox="0 0 ${W} 120" preserveAspectRatio="none" focusable="false" class="efx-divider__svg" style="${drift ? "width:200%;" : ""}${op < 1 ? `opacity:${op};` : ""}--efx-dv-t:${move ? o.speed : 0}s;${k ? `animation-duration:${(o.speed * [1.5, 1, 0.7][k]).toFixed(1)}s;animation-delay:-${(o.speed * k / 3).toFixed(1)}s;` : ""}">${body}</svg>`;
        return s;
      };
      const copies = mode === "layers" && move ? [0, 1, 2] : [0];
      el.innerHTML = copies.map((k) => mk2(k, copies.length > 1 ? [0.35, 0.6, 1][k] : 1)).join("");
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

  // src/features/draggable.js
  var KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  var draggable_default = {
    name: "draggable",
    selector: ".efx-draggable",
    defaults: { axis: "both", bounds: "parent", release: "spring", spring: "170,18", friction: 0.92, bounce: 0.5, snap: 0, step: 10, handle: "" },
    init(el, o) {
      const ax = o.axis === "x" || o.axis === "y" ? o.axis : "both";
      const sp = o.spring.split(",").map(parseFloat), k = sp[0] > 0 ? sp[0] : 170, c = sp[1] >= 0 ? sp[1] : 18;
      const handle = o.handle && el.querySelector(o.handle) || el;
      const st = el.style, hs = handle.style;
      const saved = { tr: st.translate, ta: hs.touchAction, cu: hs.cursor, ti: el.getAttribute("tabindex"), ro: el.getAttribute("role"), rd: el.getAttribute("aria-roledescription") };
      let x = 0, y = 0, id = 0, drag = null, block = false, lim = [-Infinity, Infinity, -Infinity, Infinity], offW = [];
      const emit = (n) => el.dispatchEvent(new CustomEvent("efx:" + n, { bubbles: true, detail: { x, y } }));
      const put = () => {
        st.translate = x + "px " + y + "px";
      };
      const stop = () => {
        cancelAnimationFrame(id);
        id = 0;
      };
      const snap2 = (v) => o.snap > 0 ? Math.round(v / o.snap) * o.snap : v;
      const fit = (v, lo, hi) => Math.min(hi, Math.max(lo, snap2(v)));
      const limits = () => {
        const box = o.bounds === "none" ? null : o.bounds === "parent" ? el.parentElement : document.querySelector(o.bounds) || el.parentElement;
        if (!box) return [-Infinity, Infinity, -Infinity, Infinity];
        const r = el.getBoundingClientRect(), p = box.getBoundingClientRect();
        const x0 = x + p.left - r.left, y0 = y + p.top - r.top;
        return [x0, Math.max(x0, x + p.right - r.right), y0, Math.max(y0, y + p.bottom - r.bottom)];
      };
      const run = (step) => {
        let last = performance.now();
        const f2 = (now) => {
          const dt = Math.min(0.032, (now - last) / 1e3);
          last = now;
          const more = step(dt);
          put();
          id = more ? requestAnimationFrame(f2) : 0;
        };
        id = requestAnimationFrame(f2);
      };
      const release2 = (vx, vy) => {
        if (o.release === "stay") return;
        if (!motionOK()) {
          if (o.release === "spring") {
            x = 0;
            y = 0;
          }
          return put();
        }
        if (o.release === "spring") {
          run((dt) => {
            vx += (-k * x - c * vx) * dt;
            vy += (-k * y - c * vy) * dt;
            x += vx * dt;
            y += vy * dt;
            if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1 && Math.abs(vx) < 2 && Math.abs(vy) < 2) {
              x = y = 0;
              return false;
            }
            return true;
          });
        } else {
          run((dt) => {
            const f2 = Math.pow(o.friction, dt * 60);
            vx *= f2;
            vy *= f2;
            x += vx * dt;
            y += vy * dt;
            if (x < lim[0] || x > lim[1]) {
              x = x < lim[0] ? lim[0] : lim[1];
              vx = -vx * o.bounce;
            }
            if (y < lim[2] || y > lim[3]) {
              y = y < lim[2] ? lim[2] : lim[3];
              vy = -vy * o.bounce;
            }
            if (Math.hypot(vx, vy) < 8) {
              x = fit(x, lim[0], lim[1]);
              y = fit(y, lim[2], lim[3]);
              return false;
            }
            return true;
          });
        }
      };
      const mv = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
        if (!drag.on) {
          if (Math.hypot(dx, dy) < 4) return;
          drag.on = true;
          el.classList.add("is-dragging");
          try {
            handle.setPointerCapture(e.pointerId);
          } catch (_) {
          }
          emit("dragstart");
        }
        x = ax === "y" ? x : fit(drag.sx + dx, lim[0], lim[1]);
        y = ax === "x" ? y : fit(drag.sy + dy, lim[2], lim[3]);
        put();
        const s = drag.s;
        s.push([e.timeStamp, x, y]);
        while (s.length > 2 && e.timeStamp - s[0][0] > 100) s.shift();
        emit("drag");
      };
      const up = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const d = drag, s = d.s;
        drag = null;
        offW.forEach((f2) => f2());
        offW = [];
        try {
          handle.releasePointerCapture(e.pointerId);
        } catch (_) {
        }
        el.classList.remove("is-dragging");
        if (!d.on) return;
        block = true;
        setTimeout(() => {
          block = false;
        });
        const a = s[0], b = s[s.length - 1], dt = a && b && b[0] > a[0] ? (b[0] - a[0]) / 1e3 : 0;
        const fresh = b && e.timeStamp - b[0] < 80;
        emit("dragend");
        release2(dt && fresh ? (b[1] - a[1]) / dt : 0, dt && fresh ? (b[2] - a[2]) / dt : 0);
      };
      const offs = [
        on(handle, "pointerdown", (e) => {
          if (e.pointerType === "mouse" && e.button !== 0 || e.target.closest("input,textarea,select,[contenteditable]")) return;
          stop();
          lim = limits();
          drag = { id: e.pointerId, px: e.clientX, py: e.clientY, sx: x, sy: y, s: [], on: false };
          offW = [on(window, "pointermove", mv), on(window, "pointerup", up), on(window, "pointercancel", up)];
        }),
        on(handle, "dragstart", (e) => e.preventDefault()),
        on(el, "click", (e) => {
          if (block) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true),
        on(el, "keydown", (e) => {
          const m = KEYS[e.key];
          if (e.target !== el || !m || e.altKey || e.ctrlKey || e.metaKey || ax === "x" && m[1] || ax === "y" && m[0]) return;
          e.preventDefault();
          stop();
          const L = limits(), s = (o.snap > 0 ? o.snap : o.step) * (e.shiftKey ? 5 : 1);
          x = Math.min(L[1], Math.max(L[0], x + m[0] * s));
          y = Math.min(L[3], Math.max(L[2], y + m[1] * s));
          put();
          emit("drag");
        })
      ];
      hs.touchAction = "none";
      hs.cursor = "grab";
      if (saved.ti === null) el.setAttribute("tabindex", "0");
      if (saved.ro === null) el.setAttribute("role", "group");
      el.setAttribute("aria-roledescription", "draggable");
      el.classList.add("efx-draggable-on");
      return () => {
        stop();
        offs.forEach((f2) => f2());
        offW.forEach((f2) => f2());
        st.translate = saved.tr;
        hs.touchAction = saved.ta;
        hs.cursor = saved.cu;
        const attr = (n, v) => v === null ? el.removeAttribute(n) : el.setAttribute(n, v);
        attr("tabindex", saved.ti);
        attr("role", saved.ro);
        attr("aria-roledescription", saved.rd);
        el.classList.remove("efx-draggable-on", "is-dragging");
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
        const span2 = o.end - o.start || 1, tail = Math.max(0.05, 1 - (n - 1) * st);
        stop = onScroll((y, vh) => {
          const r = el.getBoundingClientRect();
          const q = clamp(((vh - r.top) / (vh + r.height) - o.start) / span2);
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

  // src/features/feed.js
  var TR = ["height", "opacity", "margin", "padding", "border-width"].map((p) => p + " .45s ease").join(",");
  var feed_default = {
    name: "feed",
    selector: ".efx-feed",
    defaults: { interval: 1500, max: 4, loop: true, order: "newest" },
    init(el, o) {
      const items = [...el.children], n = items.length;
      const css2 = items.map((i) => i.getAttribute("style"));
      const reset = (it, k = items.indexOf(it)) => {
        it.hidden = false;
        css2[k] == null ? it.removeAttribute("style") : it.setAttribute("style", css2[k]);
      };
      const restore = () => {
        items.forEach((it) => reset(it));
        el.append(...items);
      };
      if (!n) return;
      const max = Math.max(1, o.max | 0);
      if (!motionOK() || n < 2) {
        items.forEach((it, k) => {
          it.hidden = k >= max;
        });
        return restore;
      }
      const newest = o.order !== "append", lim = Math.min(max, n - 1);
      const shown2 = [], timers = /* @__PURE__ */ new Set();
      const later = (fn, ms2) => {
        const t = setTimeout(() => {
          timers.delete(t);
          fn();
        }, ms2);
        timers.add(t);
      };
      const collapse = (s) => {
        s.overflow = "hidden";
        s.height = "0";
        s.opacity = "0";
        s.marginBlock = s.paddingBlock = s.borderBlockWidth = "0";
      };
      const enter = (it) => {
        it.remove();
        reset(it);
        newest ? el.prepend(it) : el.append(it);
        const h = it.offsetHeight, s = it.style;
        s.transition = "none";
        collapse(s);
        it.offsetHeight;
        s.transition = TR;
        s.height = h + "px";
        s.opacity = s.marginBlock = s.paddingBlock = s.borderBlockWidth = "";
        later(() => shown2.includes(it) && reset(it), 500);
      };
      const leave = (it) => {
        const s = it.style;
        s.overflow = "hidden";
        s.height = it.offsetHeight + "px";
        s.transition = "none";
        it.offsetHeight;
        s.transition = TR;
        collapse(s);
        later(() => {
          if (!shown2.includes(it)) {
            it.remove();
            reset(it);
          }
        }, 500);
      };
      items.forEach((it) => it.remove());
      el.append(items[0]);
      shown2.push(items[0]);
      let idx = 1, timer = 0, vis = true, hid = document.hidden;
      const tick = () => {
        timer = 0;
        if (idx >= n) {
          if (!o.loop) return;
          idx = 0;
        }
        const it = items[idx++];
        newest ? shown2.unshift(it) : shown2.push(it);
        enter(it);
        while (shown2.length > lim) leave(newest ? shown2.pop() : shown2.shift());
        run();
      };
      const run = () => {
        if (vis && !hid && !timer) timer = setTimeout(tick, o.interval);
      };
      const halt = () => {
        clearTimeout(timer);
        timer = 0;
      };
      const offs = [
        onVisible(el, (v) => {
          vis = v;
          v ? run() : halt();
        }),
        on(document, "visibilitychange", () => {
          hid = document.hidden;
          hid ? halt() : run();
        })
      ];
      run();
      return () => {
        halt();
        timers.forEach(clearTimeout);
        offs.forEach((f2) => f2());
        restore();
      };
    }
  };

  // src/features/flip.js
  var flip_default = {
    name: "flip",
    selector: ".efx-flip",
    defaults: { trigger: "hover", axis: "y", duration: 600 },
    init(el, o) {
      const front = el.querySelector(":scope > .efx-flip__front"), back = el.querySelector(":scope > .efx-flip__back");
      if (!front || !back) return;
      const click = o.trigger === "click" || !finePointer();
      const prev = { role: el.getAttribute("role"), tab: el.getAttribute("tabindex"), pressed: el.getAttribute("aria-pressed") };
      const cls = ["efx-flip-on", o.axis === "x" ? "efx-flip-x" : "efx-flip-y"];
      if (!motionOK()) cls.push("efx-flip-fade");
      el.classList.add(...cls);
      el.style.setProperty("--efx-flip-duration", o.duration + "ms");
      const set = (v) => {
        el.classList.toggle("is-flipped", v);
        back.setAttribute("aria-hidden", String(!v));
        if (click) el.setAttribute("aria-pressed", String(v));
      };
      set(false);
      const flipped = () => el.classList.contains("is-flipped");
      const offs = [];
      if (click) {
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        offs.push(
          on(el, "click", () => set(!flipped())),
          on(el, "keydown", (e) => {
            if ((e.key === "Enter" || e.key === " ") && e.target === el) {
              e.preventDefault();
              set(!flipped());
            }
          })
        );
      } else {
        offs.push(
          on(el, "pointerenter", (e) => e.pointerType !== "touch" && set(true)),
          on(el, "pointerleave", () => set(false)),
          on(el, "focusin", () => set(true)),
          on(el, "focusout", (e) => !el.contains(e.relatedTarget) && set(false))
        );
      }
      return () => {
        offs.forEach((f2) => f2());
        el.classList.remove(...cls, "is-flipped");
        el.style.removeProperty("--efx-flip-duration");
        back.removeAttribute("aria-hidden");
        ["role", "tabindex", "aria-pressed"].forEach((a, i) => {
          const v = [prev.role, prev.tab, prev.pressed][i];
          v == null ? el.removeAttribute(a) : el.setAttribute(a, v);
        });
      };
    }
  };

  // src/features/glitch.js
  var glitch_default = {
    name: "glitch",
    selector: ".efx-glitch",
    defaults: { trigger: "always", text: "" },
    init(el, o) {
      const hadText = el.hasAttribute("data-efx-text"), prev = el.getAttribute("data-efx-text");
      el.setAttribute("data-efx-text", o.text || (el.textContent || "").replace(/\s+/g, " ").trim());
      let restorePos = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restorePos = true;
      }
      if (motionOK()) el.classList.add("efx-glitch-on");
      return () => {
        el.classList.remove("efx-glitch-on");
        if (restorePos) el.style.position = "";
        if (hadText) el.setAttribute("data-efx-text", prev);
        else el.removeAttribute("data-efx-text");
      };
    }
  };

  // src/features/globe.js
  var globe_default = {
    name: "globe",
    selector: ".efx-globe",
    lazy: true,
    defaults: { dots: 1200, speed: 0.2, markers: [], color: "", tilt: 0.3, drag: true },
    init(el, o) {
      let restore = 0;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restore = 1;
      }
      const cv2 = document.createElement("canvas"), c = cv2.getContext("2d"), col = o.color || themeColor(el);
      cv2.className = "efx-globe__canvas";
      cv2.setAttribute("aria-hidden", "true");
      el.appendChild(cv2);
      const N = Math.min(6e3, o.dots), P = [];
      for (let i = 0, y, r, a; i < N; i++) {
        y = 1 - 2 * (i + 0.5) / N;
        r = Math.sqrt(1 - y * y);
        a = i * 2.39996;
        P.push([Math.cos(a) * r, y, Math.sin(a) * r]);
      }
      const M = (el.dataset.efxMarkers || "").split("|").map((s) => s.split(",").map(parseFloat)).filter((m) => m.length > 1 && m.every(isFinite)).map(([la, lo]) => {
        la *= Math.PI / 180;
        lo *= Math.PI / 180;
        return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)];
      });
      let w = 0, h = 0, R = 0, rot = 0, tilt = o.tilt, raf2 = 0, last = 0, vis = true, dx = null, dy = 0;
      const draw2 = (t) => {
        c.clearRect(0, 0, w, h);
        const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
        const pr = ([x, y, z]) => {
          const X = x * cr + z * sr, Z = z * cr - x * sr;
          return [w / 2 + X * R, h / 2 - (y * ct - Z * st) * R, y * st + Z * ct];
        };
        c.fillStyle = c.strokeStyle = col;
        for (const p of P) {
          const [x, y, z] = pr(p);
          c.globalAlpha = z > 0 ? 0.3 + 0.7 * z : 0.07;
          c.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
        }
        const ph = t / 1500 % 1;
        for (const m of M) {
          const [x, y, z] = pr(m);
          if (z <= 0) continue;
          c.globalAlpha = 1;
          c.beginPath();
          c.arc(x, y, 3, 0, 6.3);
          c.fill();
          c.globalAlpha = 1 - ph;
          c.beginPath();
          c.arc(x, y, 3 + 10 * ph, 0, 6.3);
          c.stroke();
        }
      };
      const step = (t) => {
        raf2 = 0;
        rot += o.speed * Math.min(50, t - last) / 1e3;
        last = t;
        draw2(t);
        go();
      };
      const go = () => {
        if (motion && vis && !raf2) {
          last = performance.now();
          raf2 = requestAnimationFrame(step);
        }
      };
      const motion = motionOK();
      const size = () => {
        const d = Math.min(devicePixelRatio || 1, 2);
        w = el.clientWidth;
        h = el.clientHeight;
        R = Math.min(w, h) * 0.45;
        cv2.width = w * d;
        cv2.height = h * d;
        c.setTransform(d, 0, 0, d, 0, 0);
        draw2(performance.now());
      };
      size();
      const offs = [];
      if (motion) offs.push(onVisible(el, (v) => {
        vis = v;
        if (v) go();
        else {
          cancelAnimationFrame(raf2);
          raf2 = 0;
        }
      }));
      if (o.drag) {
        cv2.style.cursor = "grab";
        cv2.style.touchAction = "pan-y";
        cv2.style.pointerEvents = "auto";
        offs.push(on(cv2, "pointerdown", (e) => {
          dx = e.clientX;
          dy = e.clientY;
          cv2.setPointerCapture(e.pointerId);
        }));
        offs.push(on(cv2, "pointermove", (e) => {
          if (dx == null) return;
          rot += (e.clientX - dx) * 8e-3;
          tilt = Math.max(-1.2, Math.min(1.2, tilt + (e.clientY - dy) * 5e-3));
          dx = e.clientX;
          dy = e.clientY;
          if (!raf2) draw2(performance.now());
        }));
        const up = () => {
          dx = null;
        };
        offs.push(on(cv2, "pointerup", up), on(cv2, "pointercancel", up));
      }
      let ro;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          if (el.clientWidth !== w || el.clientHeight !== h) size();
        });
        ro.observe(el);
      }
      go();
      return () => {
        cancelAnimationFrame(raf2);
        raf2 = 0;
        vis = false;
        offs.forEach((f2) => f2());
        ro && ro.disconnect();
        cv2.remove();
        if (restore) el.style.position = "";
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
      const teardown2 = () => {
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
        teardown2();
        setup();
      };
      setup();
      const offMq = mq2.addEventListener ? on(mq2, "change", rebuild) : () => {
      };
      return () => {
        offMq();
        teardown2();
        made.forEach((t) => {
          while (t.firstChild) el.insertBefore(t.firstChild, t);
          t.remove();
        });
      };
    }
  };

  // src/features/kenburns.js
  var rnd2 = (m) => ((Math.random() * 2 - 1) * m).toFixed(2) + "%";
  var kenburns_default = {
    name: "kenburns",
    selector: ".efx-kenburns",
    defaults: { duration: 12e3, zoom: 1.15 },
    init(el, o) {
      let host = el, frame = null;
      const single = el.tagName === "IMG";
      if (single) {
        frame = document.createElement("span");
        frame.className = "efx-kenburns__frame";
        el.parentNode.insertBefore(frame, el);
        frame.appendChild(el);
        host = frame;
      }
      const imgs = single ? [el] : [...el.querySelectorAll("img")];
      if (!imgs.length) return;
      const live = motionOK(), multi = imgs.length > 1;
      const m = Math.max(0, (o.zoom - 1) / (2 * o.zoom) * 100);
      host.classList.add("efx-kenburns-on");
      if (!live) host.classList.add("is-static");
      host.style.setProperty("--efx-kb-duration", o.duration + (multi ? 1e3 : 0) + "ms");
      host.style.setProperty("--efx-kb-zoom", String(o.zoom));
      if (multi) host.classList.add("is-slides");
      imgs.forEach((im) => {
        im.classList.add("efx-kenburns__img");
        ["x0", "y0", "x1", "y1"].forEach((k) => im.style.setProperty("--efx-kb-" + k, rnd2(m)));
      });
      let i = 0, timer = 0;
      const show3 = (n) => {
        imgs.forEach((im, j) => {
          im.classList.toggle("is-active", j === n);
          im.classList.toggle("is-leaving", j === i && j !== n);
        });
        if (multi) imgs.forEach((im) => {
          if (im.classList.contains("is-active")) {
            ["x0", "y0", "x1", "y1"].forEach((k) => im.style.setProperty("--efx-kb-" + k, rnd2(m)));
          }
        });
        i = n;
      };
      show3(0);
      const tick = () => {
        timer = setTimeout(() => {
          show3((i + 1) % imgs.length);
          tick();
        }, o.duration);
      };
      const stop = live ? onVisible(host, (v) => {
        host.classList.toggle("is-paused", !v);
        clearTimeout(timer);
        if (v && multi) tick();
      }) : () => {
      };
      return () => {
        stop();
        clearTimeout(timer);
        host.classList.remove("efx-kenburns-on", "is-static", "is-slides", "is-paused");
        ["--efx-kb-duration", "--efx-kb-zoom"].forEach((v) => host.style.removeProperty(v));
        imgs.forEach((im) => {
          im.classList.remove("efx-kenburns__img", "is-active", "is-leaving");
          ["x0", "y0", "x1", "y1"].forEach((k) => im.style.removeProperty("--efx-kb-" + k));
        });
        if (frame) {
          frame.parentNode.insertBefore(el, frame);
          frame.remove();
        }
      };
    }
  };

  // src/features/kinetic.js
  var STYLES = ["punch", "slide", "spin", "blur", "split"];
  var TONES = ["var(--sh-primary,#6366f1)", "var(--sh-success,#22c55e)", "var(--sh-info,#0ea5e9)", "var(--sh-warning,#f59e0b)", "var(--sh-danger,#ef4444)", "var(--sh-accent,#ec4899)"];
  var kinetic_default = {
    name: "kinetic",
    selector: ".efx-kinetic",
    defaults: { words: [], beat: 600, styles: STYLES, colors: [], random: false, hold: false },
    init(el, o) {
      const words = o.words.length ? o.words : el.textContent.trim().split(/\s+/).filter(Boolean);
      if (!words.length) return;
      const html = el.innerHTML, sentence = words.join(" ");
      const sr = document.createElement("span");
      sr.className = "efx-kinetic__sr";
      sr.textContent = sentence;
      const stage = document.createElement("span");
      stage.className = "efx-kinetic__stage";
      stage.setAttribute("aria-hidden", "true");
      el.textContent = "";
      el.append(sr, stage);
      const styles = o.styles.filter((s) => STYLES.includes(s)), list2 = styles.length ? styles : STYLES;
      const colors = o.colors.length ? o.colors : TONES;
      const cleanup = () => {
        el.innerHTML = html;
        el.classList.remove("is-kinetic");
        el.style.removeProperty("--efx-kin");
      };
      if (!motionOK()) {
        stage.textContent = sentence;
        el.classList.add("is-kinetic", "is-static");
        return () => {
          el.classList.remove("is-static");
          cleanup();
        };
      }
      el.classList.add("is-kinetic");
      el.style.setProperty("--efx-kin", Math.min(o.beat * 0.75, 700) + "ms");
      let cur = -1, timer = 0, vis = false, tab = !document.hidden, k = 0;
      const stop = () => {
        clearTimeout(timer);
        timer = 0;
      };
      const later = () => {
        if (cur + 1 < words.length) timer = setTimeout(() => show3(cur + 1), o.beat);
        else if (!o.hold) timer = setTimeout(() => show3(0), o.beat);
      };
      const show3 = (i) => {
        cur = i;
        const st = o.random ? list2[Math.floor(Math.random() * list2.length)] : list2[k++ % list2.length];
        const w = document.createElement("span");
        w.className = "efx-kinetic__word k-" + st;
        w.style.color = colors[i % colors.length];
        if (st === "split") [...words[i]].forEach((c, j) => {
          const s = document.createElement("span");
          s.textContent = c;
          s.style.setProperty("--efx-i", j);
          w.appendChild(s);
        });
        else w.textContent = words[i];
        stage.textContent = "";
        stage.appendChild(w);
        later();
      };
      const sync = () => {
        stop();
        if (vis && tab) {
          if (cur < 0) show3(0);
          else later();
        }
      };
      const offs = [on(document, "visibilitychange", () => {
        tab = !document.hidden;
        sync();
      })];
      const off = onVisible(el, (v) => {
        vis = v;
        sync();
      });
      return () => {
        off();
        offs.forEach((f2) => f2());
        stop();
        cleanup();
      };
    }
  };

  // src/features/layout.js
  var SKIP = ".efx-layout__ghost,.efx-layout__status,[data-efx-filter],[data-efx-sort],[data-efx-controls]";
  var layout_default = {
    name: "layout",
    selector: ".efx-layout",
    defaults: { duration: 400, ease: "cubic-bezier(.22,1,.36,1)", scale: 0.9, noun: "item", count: "" },
    init(el, o) {
      const animate = motionOK() && !!el.animate;
      const items = () => [...el.children].filter((c) => !c.matches(SKIP));
      const shown2 = (c) => c.getClientRects().length > 0;
      const savedPos = el.style.position;
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      const rectOf = (c) => {
        const r = c.getBoundingClientRect(), b = el.getBoundingClientRect();
        return { x: r.left - b.left - el.clientLeft, y: r.top - b.top - el.clientTop, w: r.width, h: r.height };
      };
      let cache2 = /* @__PURE__ */ new Map();
      const running = /* @__PURE__ */ new Map();
      const ghosts = /* @__PURE__ */ new Set();
      const snapshot = () => {
        cache2 = /* @__PURE__ */ new Map();
        items().filter(shown2).forEach((c) => cache2.set(c, rectOf(c)));
      };
      const play = (c, frames) => {
        const a = c.animate(frames, { duration: o.duration, easing: o.ease });
        running.set(c, a);
        const done = () => {
          if (running.get(c) === a) running.delete(c);
        };
        a.onfinish = done;
        a.oncancel = done;
      };
      const ghost = (c, r) => {
        const g = c.cloneNode(true);
        g.classList.add("efx-layout__ghost");
        g.removeAttribute("id");
        g.removeAttribute("hidden");
        g.removeAttribute("data-efx-ready");
        g.setAttribute("aria-hidden", "true");
        g.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        Object.assign(g.style, { position: "absolute", margin: "0", boxSizing: "border-box", left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
        el.appendChild(g);
        ghosts.add(g);
        const a = g.animate([{ opacity: 1, scale: 1 }, { opacity: 0, scale: o.scale }], { duration: o.duration, easing: o.ease });
        a.onfinish = a.oncancel = () => {
          g.remove();
          ghosts.delete(g);
        };
      };
      const flip = () => {
        const visual = /* @__PURE__ */ new Map();
        running.forEach((a, c) => visual.set(c, rectOf(c)));
        running.forEach((a) => a.cancel());
        running.clear();
        const now = items().filter(shown2), next = /* @__PURE__ */ new Map();
        now.forEach((c) => next.set(c, rectOf(c)));
        now.forEach((c) => {
          const last = next.get(c), first = visual.get(c) || cache2.get(c);
          if (!first) return play(c, [{ opacity: 0, scale: o.scale }, { opacity: 1, scale: 1 }]);
          const dx = first.x - last.x, dy = first.y - last.y;
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) play(c, [{ translate: dx + "px " + dy + "px" }, { translate: "0px 0px" }]);
        });
        cache2.forEach((r, c) => {
          if (!next.has(c)) ghost(c, visual.get(c) || r);
        });
        cache2 = next;
      };
      let status = null;
      const made = [];
      const target = o.count && document.querySelector(o.count);
      const savedLive = target ? target.getAttribute("aria-live") : null;
      if (target) {
        if (savedLive === null) target.setAttribute("aria-live", "polite");
        status = target;
      } else {
        status = document.createElement("span");
        status.className = "efx-layout__status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        el.after(status);
        made.push(status);
      }
      const count = () => {
        const n = items().filter((c) => !c.hidden && shown2(c)).length;
        status.textContent = n + " " + o.noun + (n === 1 ? "" : "s");
      };
      const ctl = /* @__PURE__ */ new Set([...el.querySelectorAll("[data-efx-filter],[data-efx-sort]")]);
      document.querySelectorAll("[data-efx-for]").forEach((b) => {
        if (b.matches("[data-efx-filter],[data-efx-sort]") && el.matches(b.dataset.efxFor || "\0")) ctl.add(b);
      });
      const filters = [...ctl].filter((b) => b.hasAttribute("data-efx-filter"));
      const sorts = [...ctl].filter((b) => b.hasAttribute("data-efx-sort"));
      const savedPressed = new Map([...ctl].map((b) => [b, b.getAttribute("aria-pressed")]));
      const hid = /* @__PURE__ */ new Set();
      const setPressed = (list2, on_) => list2.forEach((b) => b.setAttribute("aria-pressed", b === on_ ? "true" : "false"));
      const applyFilter = (tag) => {
        items().forEach((c) => {
          const ok = tag === "*" || (c.getAttribute("data-efx-tags") || "").split(/\s+/).includes(tag);
          if (!ok && !c.hidden) {
            c.hidden = true;
            hid.add(c);
          } else if (ok && c.hidden && hid.has(c)) {
            c.hidden = false;
            hid.delete(c);
          }
        });
      };
      const sortBy = (key, dir) => {
        const val = (c) => c.getAttribute("data-efx-key-" + key) || "";
        const list2 = items();
        if (!list2.length) return;
        const end = list2[list2.length - 1].nextSibling;
        list2.sort((a, b) => {
          const x = val(a), y = val(b), nx = parseFloat(x), ny = parseFloat(y);
          const r = Number.isFinite(nx) && Number.isFinite(ny) && x !== "" && y !== "" ? nx - ny : x.localeCompare(y);
          return dir === "desc" ? -r : r;
        }).forEach((c) => el.insertBefore(c, end));
      };
      const offs = [];
      filters.forEach((b) => offs.push(on(b, "click", () => {
        applyFilter(b.getAttribute("data-efx-filter"));
        setPressed(filters, b);
      })));
      sorts.forEach((b) => offs.push(on(b, "click", () => {
        const dir = b.getAttribute("aria-pressed") === "true" && b.getAttribute("data-efx-dir") !== "desc" ? "desc" : "asc";
        sorts.forEach((s) => s.removeAttribute("data-efx-dir"));
        b.setAttribute("data-efx-dir", dir);
        sortBy(b.getAttribute("data-efx-sort"), dir);
        setPressed(sorts, b);
      })));
      const start = filters.find((b) => b.getAttribute("aria-pressed") === "true");
      if (start) {
        applyFilter(start.getAttribute("data-efx-filter"));
        setPressed(filters, start);
      } else filters.forEach((b) => {
        if (b.getAttribute("data-efx-filter") === "*") b.setAttribute("aria-pressed", "true");
        else b.setAttribute("aria-pressed", "false");
      });
      sorts.forEach((b) => {
        if (b.getAttribute("aria-pressed") === null) b.setAttribute("aria-pressed", "false");
      });
      el.classList.add("efx-layout-on");
      snapshot();
      count();
      let mo2 = null, ro = null, raf2 = 0;
      if (animate) {
        const relevant = (r) => [...r.addedNodes, ...r.removedNodes].some((n) => !(n.nodeType === 1 && n.classList.contains("efx-layout__ghost") || n.classList && n.classList.contains("efx-layout__status"))) || r.type === "attributes" && !r.target.classList.contains("efx-layout__ghost") && !(r.target.closest && r.target.closest(".efx-layout__ghost"));
        mo2 = new MutationObserver((rs) => {
          if (rs.some(relevant)) {
            flip();
            count();
          }
        });
        mo2.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "class", "style"] });
        if (typeof ResizeObserver !== "undefined") {
          ro = new ResizeObserver(() => {
            cancelAnimationFrame(raf2);
            raf2 = requestAnimationFrame(() => items().filter(shown2).forEach((c) => {
              if (!running.has(c)) cache2.set(c, rectOf(c));
            }));
          });
          ro.observe(el);
        }
      } else {
        mo2 = new MutationObserver(() => count());
        mo2.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
      }
      return () => {
        mo2 && mo2.disconnect();
        ro && ro.disconnect();
        cancelAnimationFrame(raf2);
        offs.forEach((f2) => f2());
        running.forEach((a) => {
          a.onfinish = a.oncancel = null;
          a.cancel();
        });
        ghosts.forEach((g) => g.remove());
        ghosts.clear();
        made.forEach((n) => n.remove());
        if (target) {
          if (savedLive === null) target.removeAttribute("aria-live");
        }
        hid.forEach((c) => {
          c.hidden = false;
        });
        savedPressed.forEach((v, b) => v === null ? b.removeAttribute("aria-pressed") : b.setAttribute("aria-pressed", v));
        ctl.forEach((b) => b.removeAttribute("data-efx-dir"));
        el.style.position = savedPos;
        el.classList.remove("efx-layout-on");
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

  // src/features/lyrics.js
  var ts = (s) => s.split(":").reduce((a, v) => a * 60 + parseFloat(v), 0);
  var parse = (a) => (Array.isArray(a) ? a : []).map((c) => ({ t: +c.t || 0, end: c.end, text: String(c.text == null ? "" : c.text), words: c.words })).sort((a2, b) => a2.t - b.t);
  var lyrics_default = {
    name: "lyrics",
    selector: ".efx-lyrics",
    defaults: { for: "", karaoke: false, scroll: true, seek: true, offset: 0 },
    init(el, o) {
      const m = o.for && document.querySelector(o.for) || el.parentElement && el.parentElement.querySelector("audio,video");
      if (!m) return console.warn("[effix] lyrics: media not found", o.for);
      const orig = el.innerHTML;
      const offs = [];
      let cues = [], lines = [], W = [], cur = -2, raf2 = 0, hold2 = 0, rm = [];
      const reduce = !motionOK();
      const sc = el.querySelector('script[type="application/json"]');
      try {
        cues = parse(JSON.parse(el.dataset.efxCues || sc && sc.textContent || "[]"));
      } catch (e) {
        console.warn("[effix] lyrics: bad cue JSON", e);
      }
      const ol = document.createElement("ol");
      ol.className = "efx-lyrics__list";
      el.textContent = "";
      el.appendChild(ol);
      el.classList.toggle("efx-lyrics--karaoke", o.karaoke);
      const build2 = () => {
        ol.textContent = "";
        W = [];
        cur = -2;
        lines = cues.map((c, i) => {
          const li = document.createElement("li");
          li.className = "efx-lyrics__line";
          const b = document.createElement(o.seek ? "button" : "span");
          b.className = "efx-lyrics__btn";
          if (o.seek) {
            b.type = "button";
            b.onclick = () => {
              m.currentTime = Math.max(0, c.t - o.offset);
            };
          }
          if (o.karaoke) {
            const end = c.end != null ? c.end : cues[i + 1] ? cues[i + 1].t : c.t + 4;
            let ws = c.words;
            if (!ws || !ws.length) {
              const parts = c.text.split(/\s+/).filter(Boolean), tot = parts.join("").length || 1;
              let a = c.t;
              ws = parts.map((w) => {
                const t = a;
                a += (end - c.t) * w.length / tot;
                return { t, w };
              });
            }
            W[i] = ws.map((w, k) => {
              const s = document.createElement("span");
              s.className = "efx-lyrics__word";
              s.textContent = w.w;
              if (k) b.appendChild(document.createTextNode(" "));
              b.appendChild(s);
              return { s, t0: w.t, t1: ws[k + 1] ? ws[k + 1].t : end, p: 0 };
            });
          } else b.textContent = c.text;
          li.appendChild(b);
          ol.appendChild(li);
          return li;
        });
        sync();
      };
      const setP = (w, p) => {
        if (w.p !== p) {
          w.p = p;
          w.s.style.setProperty("--p", p);
        }
      };
      const sync = () => {
        const t = m.currentTime + o.offset;
        let a = -1;
        for (let i = 0; i < cues.length && cues[i].t <= t; i++) a = i;
        if (a !== cur) {
          if (lines[cur]) {
            lines[cur].removeAttribute("aria-current");
            lines[cur].classList.remove("is-active");
          }
          if (lines[a]) {
            lines[a].setAttribute("aria-current", "true");
            lines[a].classList.add("is-active");
            if (o.scroll && Date.now() > hold2) {
              const r = lines[a].getBoundingClientRect(), b = el.getBoundingClientRect();
              el.scrollTo({ top: r.top - b.top + el.scrollTop - (el.clientHeight - r.height) / 2, behavior: reduce ? "auto" : "smooth" });
            }
          }
          if (o.karaoke) W.forEach((ws, i) => ws.forEach((w) => setP(w, i < a ? 1 : 0)));
          cur = a;
        }
        if (o.karaoke && W[a]) W[a].forEach((w) => setP(w, reduce ? 1 : Math.min(1, Math.max(0, (t - w.t0) / (w.t1 - w.t0 || 1)))));
      };
      const loop = () => {
        sync();
        raf2 = m.paused || m.ended ? 0 : requestAnimationFrame(loop);
      };
      const kick = () => {
        if (!raf2) raf2 = requestAnimationFrame(loop);
      };
      if (!cues.length) {
        const read = () => {
          const tt = [...m.textTracks].find((t) => t.kind === "captions" || t.kind === "subtitles");
          if (!tt) return;
          if (tt.mode === "disabled") {
            rm.push([tt, tt.mode]);
            tt.mode = "hidden";
          }
          if (!tt.cues || !tt.cues.length || tt.cues.length === cues.length) return;
          cues = parse([...tt.cues].map((c) => {
            const text = c.text || "", parts = text.split(/<((?:\d+:)?\d+:\d+\.\d+)>/);
            let tm = c.startTime;
            const words = parts.length > 1 ? parts.reduce((a, p, k) => {
              if (k % 2) tm = ts(p);
              else p.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).forEach((w) => a.push({ t: tm, w }));
              return a;
            }, []) : 0;
            return { t: c.startTime, end: c.endTime, text: text.replace(/<[^>]+>/g, ""), words };
          }));
          build2();
        };
        read();
        [...m.querySelectorAll("track")].forEach((tr) => offs.push(on(tr, "load", read)));
        offs.push(on(m, "loadedmetadata", read));
      }
      offs.push(on(m, "play", kick), on(m, "timeupdate", sync), on(m, "seeked", sync), on(m, "loadedmetadata", sync));
      const hush = () => {
        hold2 = Date.now() + 3e3;
      };
      offs.push(on(el, "wheel", hush, { passive: true }), on(el, "touchmove", hush, { passive: true }));
      build2();
      if (!m.paused) kick();
      return () => {
        cancelAnimationFrame(raf2);
        raf2 = 0;
        offs.forEach((f2) => f2());
        rm.forEach(([t, md]) => {
          t.mode = md;
        });
        el.classList.remove("efx-lyrics--karaoke");
        el.innerHTML = orig;
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
      const clamp4 = (v) => Math.max(-o.max, Math.min(o.max, v));
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
        set(clamp4((e.clientX - cx) * o.strength).toFixed(1), clamp4((e.clientY - cy) * o.strength).toFixed(1));
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

  // src/features/mask.js
  var mask_default = {
    name: "mask",
    selector: ".efx-mask",
    defaults: { radius: 120, soft: 0.4, gray: true },
    init(el, o) {
      const base = el.querySelector("img");
      if (!base) return;
      let reveal = el.querySelector(".efx-mask__reveal"), made = false;
      if (!reveal) {
        reveal = base.cloneNode();
        reveal.className = "efx-mask__reveal";
        reveal.alt = "";
        reveal.removeAttribute("id");
        reveal.removeAttribute("loading");
        el.appendChild(reveal);
        made = true;
      }
      reveal.setAttribute("aria-hidden", "true");
      const prev = { role: el.getAttribute("role"), tab: el.getAttribute("tabindex"), label: el.getAttribute("aria-label") };
      el.classList.add("efx-mask-on");
      base.classList.toggle("efx-mask__base", o.gray);
      el.style.setProperty("--efx-soft", String(Math.min(0.99, Math.max(0, o.soft))));
      el.style.setProperty("--efx-r", "0px");
      el.style.setProperty("--efx-x", "50%");
      el.style.setProperty("--efx-y", "50%");
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-pressed", "false");
      if (!prev.label) el.setAttribute("aria-label", base.alt || "Reveal image");
      let r = 0, target = 0, raf2 = 0;
      const anim = () => {
        r += (target - r) * (motionOK() ? 0.18 : 1);
        if (Math.abs(target - r) < 0.5) r = target;
        el.style.setProperty("--efx-r", r.toFixed(1) + "px");
        raf2 = r === target ? 0 : requestAnimationFrame(anim);
      };
      const grow = (v) => {
        target = v;
        if (!raf2) raf2 = requestAnimationFrame(anim);
      };
      const move = rafThrottle((e) => {
        const b = el.getBoundingClientRect();
        el.style.setProperty("--efx-x", e.clientX - b.left + "px");
        el.style.setProperty("--efx-y", e.clientY - b.top + "px");
      });
      const toggle = () => {
        const v = !el.classList.contains("is-full");
        el.classList.toggle("is-full", v);
        el.setAttribute("aria-pressed", String(v));
      };
      const offs = [
        on(el, "click", toggle),
        on(el, "keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        })
      ];
      if (finePointer()) offs.push(
        on(el, "pointerenter", (e) => {
          if (e.pointerType === "touch") return;
          move(e);
          grow(o.radius);
        }),
        on(el, "pointermove", (e) => e.pointerType !== "touch" && move(e)),
        on(el, "pointerleave", () => grow(0))
      );
      return () => {
        offs.forEach((f2) => f2());
        move.cancel();
        cancelAnimationFrame(raf2);
        if (made) reveal.remove();
        else reveal.removeAttribute("aria-hidden");
        base.classList.remove("efx-mask__base");
        el.classList.remove("efx-mask-on", "is-full");
        ["--efx-soft", "--efx-r", "--efx-x", "--efx-y"].forEach((v) => el.style.removeProperty(v));
        ["role", "tabindex", "aria-pressed", "aria-label"].forEach((a) => el.removeAttribute(a));
        if (prev.role) el.setAttribute("role", prev.role);
        if (prev.tab) el.setAttribute("tabindex", prev.tab);
        if (prev.label) el.setAttribute("aria-label", prev.label);
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

  // src/features/morph.js
  var defs = null;
  var refs2 = 0;
  var needFilter = () => {
    if (!refs2++) {
      defs = document.createElement("div");
      defs.className = "efx-morph__defs";
      defs.setAttribute("aria-hidden", "true");
      defs.innerHTML = '<svg width="0" height="0"><filter id="efx-morph-f"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140"/></filter></svg>';
      document.body.appendChild(defs);
    }
    return () => {
      if (!--refs2) defs.remove();
    };
  };
  var span = (c, t) => {
    const s = document.createElement("span");
    s.className = "efx-morph__" + c;
    if (t != null) s.textContent = t;
    return s;
  };
  var morph_default = {
    name: "morph",
    selector: ".efx-morph",
    defaults: { words: [], duration: 1200, pause: 1800 },
    init(el, o) {
      const W = o.words.length ? o.words : [el.textContent.trim()];
      if (!W[0]) return;
      const saved = el.innerHTML;
      if (!motionOK() || W.length < 2) {
        el.textContent = W[0];
        return () => {
          el.innerHTML = saved;
        };
      }
      const free = needFilter();
      const sr = span("sr", W[0]), vis = span("vis"), a = span("a", W[0]), b = span("b");
      vis.setAttribute("aria-hidden", "true");
      W.forEach((w) => vis.appendChild(span("g", w)));
      vis.append(a, b);
      el.textContent = "";
      el.append(sr, vis);
      let i = 0, timer = 0, raf2 = 0;
      const set = (s, blur, op) => {
        s.style.filter = blur > 0.1 ? `blur(${blur}px)` : "";
        s.style.opacity = op;
      };
      const settle = () => {
        vis.classList.remove("is-morphing");
        a.textContent = W[i];
        b.textContent = "";
        set(a, 0, 1);
        set(b, 0, 0);
      };
      const next = () => {
        timer = 0;
        const j = (i + 1) % W.length, t0 = performance.now();
        b.textContent = W[j];
        vis.classList.add("is-morphing");
        const tick = (now) => {
          const f2 = Math.min(1, (now - t0) / o.duration);
          set(b, Math.min(8 / f2 - 8, 100), f2 ** 0.4);
          set(a, Math.min(8 / (1 - f2) - 8, 100), (1 - f2) ** 0.4);
          if (f2 < 1) raf2 = requestAnimationFrame(tick);
          else {
            raf2 = 0;
            i = j;
            sr.textContent = W[i];
            settle();
            timer = setTimeout(next, o.pause);
          }
        };
        raf2 = requestAnimationFrame(tick);
      };
      const stop = onVisible(el, (v) => {
        if (v) {
          if (!timer && !raf2) timer = setTimeout(next, o.pause);
        } else {
          clearTimeout(timer);
          cancelAnimationFrame(raf2);
          timer = raf2 = 0;
          settle();
        }
      });
      return () => {
        stop();
        clearTimeout(timer);
        cancelAnimationFrame(raf2);
        free();
        el.innerHTML = saved;
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
      const sign = o.invert ? 1 : -1, page = o.scope === "page", ease3 = Math.min(1, Math.max(0.01, o.ease));
      let tx = 0, ty = 0, raf2 = 0, unsub = null, rect = null;
      const frame = () => {
        raf2 = 0;
        let moving = false;
        for (const l of layers) {
          const gx = tx * l.d * o.strength * sign, gy2 = ty * l.d * o.strength * sign, gr = tx * l.d * o.rotate * sign;
          l.x += (gx - l.x) * ease3;
          l.y += (gy2 - l.y) * ease3;
          l.r += (gr - l.r) * ease3;
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

  // src/features/nudge.js
  var BUILTIN = ["shake", "wobble", "ring"];
  var nudge_default = {
    name: "nudge",
    selector: ".efx-nudge",
    defaults: { every: 6e3, anim: "shake", times: 0, delay: 3e3, stop: "click", dot: false },
    init(el, o) {
      const offs = [];
      let dot2, restorePos = null;
      if (o.dot) {
        if (getComputedStyle(el).position === "static") {
          el.style.position = "relative";
          restorePos = true;
        }
        dot2 = document.createElement("span");
        dot2.className = "efx-nudge__dot";
        dot2.setAttribute("aria-hidden", "true");
        el.append(dot2);
      }
      if (!motionOK()) return () => {
        if (dot2) dot2.remove();
        if (restorePos) el.style.position = "";
      };
      const kf = BUILTIN.includes(o.anim) ? "efx-nudge-" + o.anim : o.anim.startsWith("efx-") ? o.anim : "efx-" + o.anim;
      let timer = 0, count = 0, vis = false, stopped = false;
      const clear = () => {
        el.style.animation = "";
        el.classList.remove("is-nudging");
      };
      const schedule = (ms2) => {
        clearTimeout(timer);
        timer = 0;
        if (!stopped && vis && !document.hidden) timer = setTimeout(play, ms2);
      };
      const play = () => {
        timer = 0;
        if (stopped || !vis || document.hidden) return;
        clear();
        void el.offsetWidth;
        el.classList.add("is-nudging");
        el.style.animation = `${kf} .9s ease both`;
        if (o.times && ++count >= o.times) {
          stopped = true;
          return;
        }
        schedule(o.every);
      };
      const halt = () => {
        stopped = true;
        clearTimeout(timer);
        clear();
        if (dot2) dot2.classList.add("is-seen");
      };
      offs.push(on(el, "animationend", (e) => {
        if (e.target === el) clear();
      }));
      offs.push(onVisible(el, (v) => {
        vis = v;
        if (v) {
          if (!timer) schedule(count ? o.every : o.delay);
        } else {
          clearTimeout(timer);
          timer = 0;
          clear();
        }
      }));
      offs.push(on(document, "visibilitychange", () => {
        if (document.hidden) {
          clearTimeout(timer);
          timer = 0;
        } else if (!timer) schedule(o.every);
      }));
      if (o.stop === "click") offs.push(on(el, "click", halt), on(el, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") halt();
      }));
      else if (o.stop === "hover") offs.push(on(el, "pointerenter", halt), on(el, "focus", halt));
      return () => {
        clearTimeout(timer);
        offs.forEach((f2) => f2());
        clear();
        if (dot2) dot2.remove();
        if (restorePos) el.style.position = "";
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
          const cell2 = document.createElement("span");
          if (/\d/.test(c)) {
            const strip = document.createElement("span");
            strip.className = "efx-odometer__s";
            strip.textContent = DIGITS;
            strip.dataset.to = c;
            strip.style.setProperty("--n", src[k++] || 0);
            strip.style.transitionDelay = strips.length * o.stagger + "ms";
            cell2.className = "efx-odometer__d";
            cell2.append(strip);
            strips.push(strip);
          } else {
            cell2.className = "efx-odometer__c";
            cell2.textContent = c;
          }
          vis.append(cell2);
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
      const rnd3 = (a, b) => a + Math.random() * (b - a);
      const seed = () => {
        dpr2 = Math.min(devicePixelRatio || 1, 1.5);
        w = el.clientWidth;
        h = el.clientHeight;
        cv2.width = w * dpr2;
        cv2.height = h * dpr2;
        ctx2.setTransform(dpr2, 0, 0, dpr2, 0, 0);
        const n = Math.min(o.count, Math.round(w * h / 14e3));
        ps2 = Array.from({ length: n }, () => ({
          x: rnd3(0, w),
          y: rnd3(0, h),
          vx: rnd3(-0.5, 0.5) * sp,
          vy: rnd3(-0.5, 0.5) * sp,
          r: rnd3(o.sizeMin, o.sizeMax),
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
          p.vx = (p.vx + rnd3(-0.02, 0.02) * sp) * 0.99;
          p.vy = (p.vy + rnd3(-0.02, 0.02) * sp) * 0.99;
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

  // src/features/path.js
  var NS4 = "http://www.w3.org/2000/svg";
  var clamp2 = (v) => Math.min(1, Math.max(0, v));
  var ease2 = (t) => 1 - Math.pow(1 - t, 3);
  var path_default = {
    name: "path",
    selector: ".efx-path",
    defaults: { mode: "scroll", duration: 4e3, rotate: true, showPath: true, start: 0, end: 1, svg: "", d: "", viewbox: "0 0 1000 300", gap: 0.08 },
    init(el, o) {
      const items = [...el.querySelectorAll(".efx-path__item")];
      const made = [];
      let path, ref = null, vbox = null;
      if (o.d) {
        const vb = o.viewbox.split(/[\s,]+/).map(Number);
        const svg = document.createElementNS(NS4, "svg");
        svg.setAttribute("viewBox", o.viewbox);
        svg.setAttribute("class", "efx-path__svg");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        path = document.createElementNS(NS4, "path");
        path.setAttribute("d", o.d);
        path.setAttribute("class", "efx-path__line");
        if (!o.showPath) path.style.visibility = "hidden";
        svg.appendChild(path);
        el.insertBefore(svg, el.firstChild);
        made.push(svg);
        ref = path;
        vbox = vb;
      } else if (o.svg) {
        const t = document.querySelector(o.svg);
        path = t && (t.matches("path") ? t : t.querySelector("path"));
        ref = path;
      }
      if (!path || !items.length || !path.getTotalLength) return;
      const len = path.getTotalLength();
      let trail = null;
      if (o.showPath) {
        trail = path.cloneNode(false);
        trail.removeAttribute("id");
        trail.setAttribute("class", "efx-path__trail");
        trail.style.fill = "none";
        trail.style.strokeDasharray = len;
        trail.style.strokeDashoffset = len;
        path.after(trail);
        made.push(trail);
      }
      const saved = items.map((i) => i.style.cssText), savedEl = el.style.cssText;
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.classList.add("is-pathing");
      if (vbox && vbox[2] > 0 && vbox[3] > 0 && el.offsetHeight < 20) el.style.aspectRatio = vbox[2] + " / " + vbox[3];
      const toScreen = (t, m) => {
        const p = path.getPointAtLength(len * clamp2(t));
        return new DOMPoint(p.x, p.y).matrixTransform(m);
      };
      const n = items.length;
      const spread = (p, i) => clamp2(p * (1 + (n - 1) * o.gap) - i * o.gap);
      let last = 0;
      const measure = (p) => {
        last = p;
        const r = el.getBoundingClientRect(), m = path.getScreenCTM();
        if (!m) return;
        const ox = r.left + el.clientLeft, oy = r.top + el.clientTop, e = 0.5 / len;
        const pos = items.map((_, i) => {
          const tt = o.start + (o.end - o.start) * spread(p, i);
          const a = toScreen(tt, m);
          let ang = 0;
          if (o.rotate) {
            const b = toScreen(tt - e, m), c = toScreen(tt + e, m);
            ang = Math.atan2(c.y - b.y, c.x - b.x) * 180 / Math.PI;
          }
          return [a.x - ox, a.y - oy, ang];
        });
        const lead = o.start + (o.end - o.start) * spread(p, 0);
        return () => {
          items.forEach((it, i) => {
            it.style.translate = `calc(${pos[i][0].toFixed(1)}px - 50%) calc(${pos[i][1].toFixed(1)}px - 50%)`;
            if (o.rotate) it.style.rotate = pos[i][2].toFixed(1) + "deg";
          });
          if (trail) trail.style.strokeDashoffset = len * (1 - clamp2(lead));
        };
      };
      const render = (p) => {
        const w = measure(p);
        if (w) w();
      };
      const offs = [];
      if (!motionOK()) {
        render(1);
        offs.push(on(window, "resize", () => render(1)));
      } else if (o.mode === "scroll") {
        let stop = null;
        offs.push(onVisible(el, (v) => {
          if (v && !stop) stop = onScroll((y, h) => measure(clamp2((h - el.getBoundingClientRect().top) / (h + el.offsetHeight))));
          else if (!v && stop) {
            stop();
            stop = null;
          }
        }, "100px"));
        offs.push(() => stop && stop());
      } else {
        let raf2 = 0, acc = 0, t0 = 0, done = false;
        const frame = (now) => {
          acc += now - t0;
          t0 = now;
          const x = acc / o.duration;
          if (o.mode === "view") {
            render(ease2(clamp2(x)));
            if (x >= 1) {
              done = true;
              return;
            }
          } else render(x % 1);
          raf2 = requestAnimationFrame(frame);
        };
        offs.push(onVisible(el, (v) => {
          cancelAnimationFrame(raf2);
          if (v && !done) {
            t0 = performance.now();
            raf2 = requestAnimationFrame(frame);
          }
        }));
        offs.push(() => cancelAnimationFrame(raf2));
        offs.push(on(window, "resize", () => render(last)));
        render(0);
      }
      return () => {
        offs.forEach((f2) => f2());
        made.forEach((n2) => n2.remove());
        items.forEach((it, i) => {
          it.style.cssText = saved[i];
        });
        el.style.cssText = savedEl;
        el.classList.remove("is-pathing");
      };
    }
  };

  // src/features/pixelate.js
  var pixelate_default = {
    name: "pixelate",
    selector: ".efx-pixelate",
    defaults: { from: 32, duration: 900, trigger: "view" },
    init(el, o) {
      const img = el.tagName === "IMG" ? el : el.querySelector("img");
      if (!img || !motionOK()) return;
      const host = img.parentElement;
      const restorePos = getComputedStyle(host).position === "static";
      if (restorePos) host.style.position = "relative";
      const hover = o.trigger === "hover";
      const cv2 = document.createElement("canvas"), tiny = document.createElement("canvas");
      cv2.className = "efx-pixelate__canvas";
      cv2.setAttribute("aria-hidden", "true");
      host.appendChild(cv2);
      const prevOpacity = img.style.opacity;
      let p = hover ? 0 : 1, target = p, from = 0, raf2 = 0, ready = false, shown2 = -1, stop;
      const draw2 = () => {
        const W = img.offsetWidth, H = img.offsetHeight, nw = img.naturalWidth, nh = img.naturalHeight;
        if (!W || !H || !nw) return;
        const b = Math.max(1, Math.round(Math.pow(o.from, p)));
        if (b === shown2 && cv2.width) return;
        shown2 = b;
        const dpr2 = Math.min(devicePixelRatio || 1, 2);
        cv2.style.left = img.offsetLeft + "px";
        cv2.style.top = img.offsetTop + "px";
        cv2.style.width = W + "px";
        cv2.style.height = H + "px";
        cv2.width = W * dpr2;
        cv2.height = H * dpr2;
        let sx = 0, sy = 0, sw = nw, sh = nh;
        if (getComputedStyle(img).objectFit === "cover") {
          const r = W / H;
          if (nw / nh > r) {
            sw = nh * r;
            sx = (nw - sw) / 2;
          } else {
            sh = nw / r;
            sy = (nh - sh) / 2;
          }
        }
        const w = Math.max(1, Math.ceil(W / b)), h = Math.max(1, Math.ceil(H / b));
        tiny.width = w;
        tiny.height = h;
        const t = tiny.getContext("2d");
        t.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
        const c = cv2.getContext("2d");
        c.imageSmoothingEnabled = false;
        c.drawImage(tiny, 0, 0, w, h, 0, 0, w * b * dpr2, h * b * dpr2);
      };
      const render = () => {
        const on_ = (b) => {
          cv2.style.display = b ? "" : "none";
          img.style.opacity = b ? "0" : prevOpacity;
        };
        if (p <= 1e-3) on_(false);
        else {
          on_(true);
          draw2();
        }
      };
      const frame = (now) => {
        const d = (now - from) / Math.max(1, o.duration);
        from = now;
        p += Math.sign(target - p) * Math.min(Math.abs(target - p), d);
        render();
        raf2 = p === target ? 0 : requestAnimationFrame(frame);
      };
      const go = (v) => {
        target = v;
        if (ready && !raf2) {
          from = performance.now();
          raf2 = requestAnimationFrame(frame);
        }
      };
      const start = () => {
        ready = true;
        render();
        if (hover) return;
        stop = onVisible(el, (v) => {
          if (v) {
            stop && stop();
            go(0);
          }
        });
      };
      if (!hover) img.style.opacity = "0";
      const offs = [];
      if (hover) offs.push(on(el, "pointerenter", (e) => e.pointerType !== "touch" && go(1)), on(el, "pointerleave", () => go(0)));
      if (img.complete && img.naturalWidth) start();
      else offs.push(on(img, "load", start, { once: true }));
      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
        shown2 = -1;
        ready && p > 1e-3 && draw2();
      }) : null;
      ro && ro.observe(img);
      return () => {
        offs.forEach((f2) => f2());
        stop && stop();
        ro && ro.disconnect();
        cancelAnimationFrame(raf2);
        cv2.remove();
        img.style.opacity = prevOpacity;
        if (restorePos) host.style.position = "";
      };
    }
  };

  // src/features/popout.js
  var popout_default = {
    name: "popout",
    selector: ".efx-popout",
    defaults: { depth: 20, tilt: 8, mode: "both" },
    init(el, o) {
      let restorePos = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restorePos = true;
      }
      const undoPos = () => {
        if (restorePos) el.style.position = "";
      };
      const bg = el.querySelector(":scope > .efx-popout__bg");
      if (!bg || !motionOK()) return undoPos;
      const ptr = finePointer() && o.mode !== "scroll", scr = o.mode !== "pointer";
      if (!ptr && !scr) return undoPos;
      const clip = document.createElement("div");
      clip.className = "efx-popout__clip";
      const mark = document.createComment("efx-popout");
      bg.replaceWith(mark);
      clip.appendChild(bg);
      mark.replaceWith(clip);
      el.style.setProperty("--efx-depth", o.depth + "px");
      el.style.setProperty("--efx-tilt", o.tilt + "deg");
      el.classList.add("is-popout");
      const offs = [];
      let rect = null;
      if (ptr) {
        const move = rafThrottle((e) => {
          if (!rect) rect = el.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * 2 - 1, y = (e.clientY - rect.top) / rect.height * 2 - 1;
          el.style.setProperty("--efx-px", x.toFixed(3));
          el.style.setProperty("--efx-py", y.toFixed(3));
        });
        const leave = () => {
          move.cancel();
          rect = null;
          el.style.removeProperty("--efx-px");
          el.style.removeProperty("--efx-py");
        };
        offs.push(on(el, "pointermove", move), on(el, "pointerleave", leave), () => move.cancel());
      }
      const stopScroll = scr ? onScroll((y, vh) => {
        const r = el.getBoundingClientRect();
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
        return () => el.style.setProperty("--efx-sy", p.toFixed(3));
      }) : null;
      return () => {
        offs.forEach((f2) => f2());
        stopScroll && stopScroll();
        ["--efx-depth", "--efx-tilt", "--efx-px", "--efx-py", "--efx-sy"].forEach((v) => el.style.removeProperty(v));
        el.classList.remove("is-popout");
        clip.replaceWith(bg);
        undoPos();
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

  // src/features/pricing.js
  var num = /[\d][\d,]*\.?\d*/;
  var pricing_default = {
    name: "pricing",
    selector: ".efx-pricing",
    defaults: { periods: ["Monthly", "Yearly"], start: 0, duration: 600 },
    init(el, o) {
      const periods = o.periods, undo = [];
      const norm = (s) => String(s).trim().toLowerCase();
      const btns = [...el.querySelectorAll("[data-efx-period]")];
      const chk = el.querySelector(".efx-pricing__toggle");
      const prices = [...el.querySelectorAll("[data-efx-prices]")].map((p) => ({
        el: p,
        vals: p.dataset.efxPrices.split("|").map((s) => s.trim()),
        odo: p.matches(".efx-odometer") ? p : p.querySelector(".efx-odometer"),
        orig: p.innerHTML,
        raf: 0
      }));
      const texts = [...el.querySelectorAll("[data-efx-period-text]")].map((t2) => ({ el: t2, vals: t2.dataset.efxPeriodText.split("|").map((s) => s.trim()), orig: t2.textContent }));
      const shows = [...el.querySelectorAll("[data-efx-show-on]")].map((s) => ({ el: s, hid: s.hidden }));
      const live = document.createElement("span");
      live.className = "efx-pricing__live";
      live.setAttribute("aria-live", "polite");
      live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
      el.append(live);
      const setAttr = (n, k, v) => {
        const had = n.getAttribute(k);
        n.setAttribute(k, v);
        if (!undo.some((u) => u.n === n && u.k === k)) undo.push({ n, k, had });
      };
      const group = btns.length && btns[0].parentElement;
      if (group && !group.hasAttribute("role")) setAttr(group, "role", "radiogroup");
      btns.forEach((b) => {
        if (!b.hasAttribute("role")) setAttr(b, "role", "radio");
        if (!b.hasAttribute("type") && b.tagName === "BUTTON") setAttr(b, "type", "button");
      });
      const bIdx = (b) => {
        const v = b.dataset.efxPeriod;
        const i = periods.findIndex((p) => norm(p) === norm(v));
        return i >= 0 ? i : parseInt(v, 10) || 0;
      };
      const fmtLike = (tpl, n) => {
        const dec = (tpl.split(".")[1] || "").length;
        const s = n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        return tpl.includes(",") ? s : s.replace(/,/g, "");
      };
      const roll = (p, val, animate) => {
        cancelAnimationFrame(p.raf);
        if (p.odo) {
          p.odo.dispatchEvent(new CustomEvent("efx:data", { detail: { value: val } }));
          return;
        }
        const to = val.match(num), from = p.el.textContent.match(num);
        if (!animate || !to || !from) {
          p.el.textContent = val;
          return;
        }
        const a = parseFloat(from[0].replace(/,/g, "")), b = parseFloat(to[0].replace(/,/g, "")), t0 = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - t0) / o.duration), e = 1 - (1 - k) ** 3;
          p.el.textContent = k < 1 ? val.replace(num, fmtLike(to[0], a + (b - a) * e)) : val;
          if (k < 1) p.raf = requestAnimationFrame(step);
        };
        p.raf = requestAnimationFrame(step);
      };
      let idx = -1;
      const set = (i, animate, quiet) => {
        i = Math.max(0, Math.min(periods.length - 1, i));
        if (i === idx) return;
        idx = i;
        const anim = animate && motionOK();
        prices.forEach((p) => {
          var _a;
          return roll(p, (_a = p.vals[i]) != null ? _a : p.vals[p.vals.length - 1], anim);
        });
        texts.forEach((t2) => {
          var _a;
          t2.el.textContent = (_a = t2.vals[i]) != null ? _a : t2.vals[t2.vals.length - 1];
        });
        shows.forEach((s) => {
          s.el.hidden = norm(s.el.dataset.efxShowOn) !== norm(periods[i]);
        });
        btns.forEach((b) => {
          const on2 = bIdx(b) === i;
          b.setAttribute("aria-checked", on2);
          b.tabIndex = on2 ? 0 : -1;
          b.classList.toggle("is-active", on2);
        });
        if (chk) chk.checked = i > 0;
        if (!quiet) {
          const f2 = prices[0], ft = texts[0];
          live.textContent = [periods[i], f2 && f2.vals[i], ft && ft.vals[i]].filter(Boolean).join(" ");
          el.dispatchEvent(new CustomEvent("efx:period", { bubbles: true, detail: { index: i, period: periods[i] } }));
        }
      };
      const offs = [];
      btns.forEach((b) => {
        offs.push(on(b, "click", () => set(bIdx(b), true)));
        offs.push(on(b, "keydown", (e) => {
          const k = e.key, d = k === "ArrowRight" || k === "ArrowDown" ? 1 : k === "ArrowLeft" || k === "ArrowUp" ? -1 : 0;
          const to = k === "Home" ? 0 : k === "End" ? periods.length - 1 : idx + d;
          if (!d && k !== "Home" && k !== "End") return;
          e.preventDefault();
          set(to, true);
          const nb = btns.find((x) => bIdx(x) === idx);
          if (nb) nb.focus();
        }));
      });
      if (chk) offs.push(on(chk, "change", () => set(chk.checked ? 1 : 0, true)));
      const start = Math.max(0, Math.min(periods.length - 1, o.start | 0));
      set(start, false, true);
      const t = setTimeout(() => prices.forEach((p) => {
        var _a;
        return p.odo && roll(p, (_a = p.vals[start]) != null ? _a : p.vals[0], false);
      }), 0);
      return () => {
        clearTimeout(t);
        offs.forEach((f2) => f2());
        prices.forEach((p) => {
          cancelAnimationFrame(p.raf);
          if (!p.odo) p.el.innerHTML = p.orig;
        });
        texts.forEach((t2) => {
          t2.el.textContent = t2.orig;
        });
        shows.forEach((s) => {
          s.el.hidden = s.hid;
        });
        btns.forEach((b) => {
          b.removeAttribute("aria-checked");
          b.removeAttribute("tabindex");
          b.classList.remove("is-active");
        });
        undo.forEach((u) => u.had === null ? u.n.removeAttribute(u.k) : u.n.setAttribute(u.k, u.had));
        live.remove();
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

  // src/features/reel.js
  var snap = (n, attrs) => {
    const o = attrs.map((a) => [a, n.getAttribute(a)]);
    return () => o.forEach(([a, v]) => v == null ? n.removeAttribute(a) : n.setAttribute(a, v));
  };
  var ms = (v) => {
    const n = parseFloat(v);
    return /ms\s*$/.test(v) || !/s\s*$/.test(v) ? n || 600 : n * 1e3;
  };
  var reel_default = {
    name: "reel",
    selector: ".efx-reel",
    defaults: { autoplay: true, loop: false, controls: true, duration: 3e3, transition: "fade" },
    init(el, o) {
      const scenes = [...el.children].filter((c) => c.matches(".efx-reel__scene,[data-efx-scene]"));
      const n = scenes.length;
      if (!n) return;
      const calm = !motionOK();
      const undo = [snap(el, ["role", "aria-roledescription", "aria-label", "tabindex"])];
      let restorePos = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restorePos = true;
      }
      el.classList.add("is-reel");
      if (calm) el.classList.add("is-manual");
      el.setAttribute("role", "group");
      el.setAttribute("aria-roledescription", "scene sequence");
      if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Scenes");
      if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
      const dur = (s) => Math.max(200, parseFloat(s.dataset.efxDuration) || o.duration);
      scenes.forEach((s, i) => {
        undo.push(snap(s, ["role", "aria-roledescription", "aria-label", "aria-hidden", "inert"]));
        s.setAttribute("role", "group");
        s.setAttribute("aria-roledescription", "scene");
        s.setAttribute("aria-label", `${i + 1} of ${n}`);
        s.setAttribute("aria-hidden", "true");
        s.inert = true;
      });
      const live = document.createElement("span");
      live.className = "efx-reel__live";
      live.setAttribute("aria-live", "polite");
      el.appendChild(live);
      let bar, btn;
      const segs = [];
      if (o.controls) {
        bar = document.createElement("div");
        bar.className = "efx-reel__controls";
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "efx-reel__play";
        bar.appendChild(btn);
        scenes.forEach((s, i) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "efx-reel__seg";
          b.setAttribute("aria-label", `Go to scene ${i + 1} of ${n}`);
          b.style.setProperty("--efx-d", dur(s) + "ms");
          b.innerHTML = '<span class="efx-reel__fill"></span>';
          b.onclick = () => go(i, true);
          segs.push(b);
          bar.appendChild(b);
        });
        el.appendChild(bar);
      }
      let idx = -1, want = o.autoplay && !calm, vis = false, tab = !document.hidden, timer = 0, t0 = 0, left = 0, leaving = null, leaveT = 0;
      const running = () => want && vis && tab;
      const halt = () => {
        if (timer) {
          clearTimeout(timer);
          timer = 0;
          left -= performance.now() - t0;
        }
      };
      const sync = () => {
        halt();
        const r = running();
        el.classList.toggle("is-paused", !r);
        if (btn) {
          btn.setAttribute("aria-label", want ? "Pause" : "Play");
          btn.classList.toggle("is-on", want);
        }
        if (r) {
          t0 = performance.now();
          timer = setTimeout(() => {
            timer = 0;
            step();
          }, Math.max(0, left));
        }
      };
      const step = () => {
        if (idx + 1 < n || o.loop) go((idx + 1) % n);
        else {
          want = false;
          left = 0;
          sync();
        }
      };
      function go(i, manual) {
        i = (i % n + n) % n;
        if (i === idx) return;
        const dir = i > idx ? 1 : -1, s = scenes[i], prev = scenes[idx];
        const type = calm ? "cut" : s.dataset.efxTransition || o.transition;
        el.style.setProperty("--efx-dir", dir);
        clearTimeout(leaveT);
        if (leaving) leaving.className = leaving.className.replace(/\s?(is-leave|t-\w+)/g, "");
        scenes.forEach((x) => x.classList.remove("is-enter"));
        if (prev) {
          prev.classList.remove("is-active");
          prev.inert = true;
          prev.setAttribute("aria-hidden", "true");
          if (type !== "cut") {
            prev.classList.add("is-leave", "t-" + type);
            leaving = prev;
            leaveT = setTimeout(() => {
              prev.classList.remove("is-leave", "t-" + type);
              leaving = null;
            }, ms(cssVar(el, "--efx-reel-t", "600ms")) + 50);
          }
        }
        idx = i;
        s.classList.add("is-active", "t-" + type);
        if (prev && type !== "cut") s.classList.add("is-enter");
        s.inert = false;
        s.removeAttribute("aria-hidden");
        el.classList.remove("is-first");
        if (i === 0) el.classList.add("is-first");
        segs.forEach((b, k) => {
          b.classList.toggle("is-current", k === i);
          b.classList.toggle("is-done", k < i);
          if (k === i) b.setAttribute("aria-current", "true");
          else b.removeAttribute("aria-current");
          if (k === i) {
            const f2 = b.firstChild;
            f2.style.animation = "none";
            void f2.offsetWidth;
            f2.style.animation = "";
          }
        });
        halt();
        left = dur(s);
        core_default.refresh(s);
        if (manual || !running()) live.textContent = `Scene ${i + 1} of ${n}`;
        el.dispatchEvent(new CustomEvent("efx:scene", { detail: { index: i }, bubbles: true }));
        sync();
      }
      const toggle = () => {
        if (!want && idx === n - 1 && !o.loop) {
          want = true;
          idx = -1;
          go(0);
          return;
        }
        want = !want;
        sync();
      };
      const offs = [
        on(el, "keydown", (e) => {
          if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
          const k = e.key;
          if (k === "ArrowRight") go(idx + 1, true);
          else if (k === "ArrowLeft") go(idx - 1, true);
          else if (k === " " && !e.target.closest("button")) toggle();
          else return;
          e.preventDefault();
        }),
        on(document, "visibilitychange", () => {
          tab = !document.hidden;
          sync();
        })
      ];
      btn && (btn.onclick = toggle);
      const stop = onVisible(el, (v) => {
        vis = v;
        sync();
      });
      go(0);
      return () => {
        stop();
        offs.forEach((f2) => f2());
        halt();
        clearTimeout(leaveT);
        bar && bar.remove();
        live.remove();
        scenes.forEach((s) => s.classList.remove("is-active", "is-enter", "is-leave", "t-fade", "t-slide", "t-wipe", "t-zoom", "t-cut"));
        undo.reverse().forEach((f2) => f2());
        el.classList.remove("is-reel", "is-manual", "is-paused", "is-first");
        el.style.removeProperty("--efx-dir");
        if (restorePos) el.style.position = "";
      };
    }
  };

  // src/features/reveal.js
  var reveal_default = {
    name: "reveal",
    selector: ".efx-reveal",
    defaults: { reveal: "fade-up", delay: 0, once: true, threshold: 0.15 },
    init(el, o) {
      if (!motionOK()) return;
      const group = staggerGroup(el);
      let delay = o.delay;
      if (group) delay += stagger(group, ".efx-reveal", el);
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
      const mk2 = (c) => {
        const s = document.createElement("span");
        s.className = c;
        return s;
      };
      const sr = mk2("efx-scramble__sr"), vis = mk2("efx-scramble__v");
      vis.setAttribute("aria-hidden", "true");
      el.textContent = "";
      el.append(sr, vis);
      const pool = [...o.chars || "#"];
      vis.style.minWidth = Math.max(...words.map((w) => w.length)) + "ch";
      let cur = words[0], tgt = cur, tm = 0, running = false, played = false, i = 0;
      const show3 = (t) => {
        vis.textContent = t;
      };
      const set = (t) => {
        cur = t;
        sr.textContent = t;
        show3(t);
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
          show3(out);
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
  var parse2 = (s) => {
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
    defaults: { from: "", to: "", start: 0, end: 1, ease: "linear", peak: "none", x: 0, y: 0, rotate: 0, scale: 1, opacity: -1, blur: 0 },
    init(el, o) {
      if (!motionOK()) return;
      const A = { ...NEUTRAL, ...parse2(o.from) };
      const B = { ...NEUTRAL, x: o.x, y: o.y, rotate: o.rotate, scale: o.scale, blur: o.blur, ...o.opacity >= 0 ? { opacity: o.opacity } : {}, ...parse2(o.to) };
      const ease3 = ease(o.ease), span2 = o.end - o.start || 1;
      const s = el.style, saved = [s.translate, s.rotate, s.scale, s.opacity, s.filter, s.transition, s.willChange, s.getPropertyValue("--efx-p")];
      const use = (k) => A[k] !== B[k];
      const moves = use("x") || use("y"), turns = use("rotate"), zooms = use("scale"), fades = use("opacity"), blurs = use("blur");
      s.transition = "none";
      s.willChange = "transform, opacity";
      let ty = 0, sc = A.scale;
      const stop = onScroll((y, vh) => {
        const r = el.getBoundingClientRect();
        const h0 = r.height / (sc || 1), top0 = r.top - ty - h0 * (1 - sc) / 2;
        let q = Math.min(1, Math.max(0, ((vh - top0) / (vh + h0) - o.start) / span2));
        if (o.peak === "center") q = 1 - Math.abs(2 * q - 1);
        q = ease3(q);
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

  // src/features/shape.js
  var NS5 = "http://www.w3.org/2000/svg";
  var clamp3 = (v) => Math.min(1, Math.max(0, v));
  var star = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI * i / 5 - Math.PI / 2, r = i % 2 ? 20 : 48;
    star.push((50 + r * Math.cos(a)).toFixed(1) + "," + (50 + r * Math.sin(a)).toFixed(1));
  }
  add("shape", {
    blob: "M50,6 C72,4 94,24 94,50 C94,76 72,96 48,94 C24,92 6,74 6,50 C6,26 28,8 50,6 Z",
    circle: "M50,5 A45,45 0 1,1 49.9,5 Z",
    star: "M" + star.join("L") + "Z",
    heart: "M50,88 C10,58 4,32 22,18 C36,8 48,18 50,28 C52,18 64,8 78,18 C96,32 90,58 50,88 Z",
    square: "M16,6 H84 Q94,6 94,16 V84 Q94,94 84,94 H16 Q6,94 6,84 V16 Q6,6 16,6 Z"
  });
  var isD = (s) => /^[Mm][\s\d.+-]/.test(s);
  var closedD = (d) => /z\s*$/i.test(d.trim());
  function sample(tok, host, n) {
    tok = tok.trim();
    let node = null, tmp = null, closed = true;
    if (/^[#.[]/.test(tok)) {
      node = document.querySelector(tok);
      const d = node && node.getAttribute("d");
      if (d) closed = closedD(d);
    } else {
      const d = isD(tok) ? tok : get("shape", tok);
      if (!d) return null;
      tmp = document.createElementNS(NS5, "path");
      tmp.setAttribute("d", d);
      host.appendChild(tmp);
      node = tmp;
      closed = closedD(d);
    }
    try {
      const len = node.getTotalLength(), div = closed ? n : n - 1, pts = [];
      for (let i = 0; i < n; i++) {
        const p = node.getPointAtLength(len * i / div);
        pts.push(p.x, p.y);
      }
      return { pts, closed };
    } catch (_) {
      return null;
    } finally {
      if (tmp) tmp.remove();
    }
  }
  function align(a, b, closed) {
    const n = a.length / 2;
    const at = (r, s, i) => closed ? r ? (s - i + n) % n : (i + s) % n : r ? n - 1 - i : i;
    let best = Infinity, bo = [0, 0];
    for (let r = 0; r < 2; r++) {
      for (let s = 0; s < (closed ? n : 1); s++) {
        let cost = 0;
        for (let i = 0; i < n && cost < best; i++) {
          const j = at(r, s, i);
          cost += (a[2 * i] - b[2 * j]) ** 2 + (a[2 * i + 1] - b[2 * j + 1]) ** 2;
        }
        if (cost < best) {
          best = cost;
          bo = [r, s];
        }
      }
    }
    const out = [];
    for (let i = 0; i < n; i++) {
      const j = at(bo[0], bo[1], i);
      out.push(b[2 * j], b[2 * j + 1]);
    }
    return out;
  }
  var shape_default = {
    name: "shape",
    selector: ".efx-shape",
    defaults: { shapes: "", d: "", to: "", points: 64, trigger: "loop", duration: 1200, pause: 800, ease: "ease-in-out", target: "" },
    init(el, o) {
      const isPath = el.localName === "path";
      const svg = isPath ? el.ownerSVGElement : el;
      if (!svg || !svg.createSVGPoint) return;
      const own = isPath ? el.getAttribute("d") || "" : "";
      const split3 = (s) => s.split("|").map((t) => t.trim()).filter(Boolean);
      const toks = o.shapes ? split3(o.shapes) : o.d ? split3(o.d) : o.to ? [own, ...split3(o.to)].filter(Boolean) : [];
      if (!toks.length) return;
      const n = Math.max(8, Math.round(o.points) || 64);
      const shapes = toks.map((t) => sample(t, svg, n)).filter(Boolean);
      if (!shapes.length) return;
      const closed = shapes.every((s) => s.closed), m = shapes.length;
      const T = shapes.map((s, i) => [s.pts, align(s.pts, shapes[(i + 1) % m].pts, closed)]);
      const named = toks.some((t) => !/^[#.[]/.test(t) && !isD(t));
      const addVB = !isPath && named && !svg.hasAttribute("viewBox");
      if (addVB) svg.setAttribute("viewBox", "0 0 100 100");
      let path = el;
      if (!isPath) {
        path = document.createElementNS(NS5, "path");
        path.setAttribute("class", "efx-shape__path");
        svg.appendChild(path);
      }
      const draw2 = (i, t) => {
        const [a, b] = T[i];
        let s = "M";
        for (let k = 0; k < n; k++) s += (k ? "L" : "") + (a[2 * k] + (b[2 * k] - a[2 * k]) * t).toFixed(2) + "," + (a[2 * k + 1] + (b[2 * k + 1] - a[2 * k + 1]) * t).toFixed(2);
        path.setAttribute("d", s + (closed ? "Z" : ""));
      };
      const offs = [];
      const e = ease(o.ease);
      draw2(0, 0);
      if (m > 1 && motionOK()) {
        let raf2 = 0;
        if (o.trigger === "hover") {
          const host = o.target && document.querySelector(o.target) || el.closest("a,button,[tabindex]") || el;
          let prog = 0, dir = 0, last = 0;
          const tick = (now) => {
            prog = clamp3(prog + (dir ? 1 : -1) * Math.max(0, now - last) / o.duration);
            last = now;
            draw2(0, e(prog));
            raf2 = dir ? prog < 1 ? requestAnimationFrame(tick) : 0 : prog > 0 ? requestAnimationFrame(tick) : 0;
          };
          const go = (d) => () => {
            dir = d;
            if (!raf2) {
              last = performance.now();
              raf2 = requestAnimationFrame(tick);
            }
          };
          offs.push(on(host, "pointerenter", go(1)), on(host, "pointerleave", go(0)), on(host, "focusin", go(1)), on(host, "focusout", go(0)));
        } else if (o.trigger === "scroll") {
          let stop = null;
          offs.push(onVisible(el, (v) => {
            if (v && !stop) {
              stop = onScroll((y, h) => {
                const r = el.getBoundingClientRect();
                const q = clamp3((clamp3((h - r.top) / (h + r.height)) - 0.25) / 0.5) * (m - 1), i = Math.min(m - 2, Math.floor(q));
                return () => draw2(i, e(q - i));
              });
            } else if (!v && stop) {
              stop();
              stop = null;
            }
          }, "100px"));
          offs.push(() => stop && stop());
        } else {
          let acc = 0, t0 = 0;
          const cyc = o.pause + o.duration;
          const frame = (now) => {
            acc += now - t0;
            t0 = now;
            draw2(Math.floor(acc / cyc) % m, e(clamp3((acc % cyc - o.pause) / o.duration)));
            raf2 = requestAnimationFrame(frame);
          };
          offs.push(onVisible(el, (v) => {
            cancelAnimationFrame(raf2);
            if (v) {
              t0 = performance.now();
              raf2 = requestAnimationFrame(frame);
            }
          }));
        }
        offs.push(() => cancelAnimationFrame(raf2));
      }
      el.classList.add("is-morphing");
      return () => {
        offs.forEach((f2) => f2());
        if (isPath) {
          if (own) el.setAttribute("d", own);
          else el.removeAttribute("d");
        } else path.remove();
        if (addVB) svg.removeAttribute("viewBox");
        el.classList.remove("is-morphing");
      };
    }
  };

  // src/features/shimmer.js
  var shimmer_default = {
    name: "shimmer",
    selector: ".efx-shimmer[data-efx-until],.efx-shimmer[data-efx-for]",
    defaults: { until: "", for: 0 },
    init(el, o) {
      const offs = [];
      let timer = 0, done = false;
      const prevBusy = el.getAttribute("aria-busy");
      el.classList.add("is-loading");
      el.setAttribute("aria-busy", "true");
      const ready = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        offs.forEach((f2) => f2());
        offs.length = 0;
        el.classList.remove("is-loading");
        el.classList.add("is-ready");
        if (motionOK()) {
          el.classList.add("is-fading");
          const end = () => el.classList.remove("is-fading");
          offs.push(on(el, "animationend", end, { once: true }));
        }
        el.setAttribute("aria-busy", "false");
      };
      const targets = o.until ? [...document.querySelectorAll(o.until)] : [];
      const pending = targets.filter((t) => !(t.tagName === "IMG" ? t.complete : t.readyState === 4 || t.readyState === "complete"));
      if (o.until && !pending.length && targets.length) ready();
      else {
        let left = pending.length;
        pending.forEach((t) => ["load", "error", "loadeddata", "efx:ready"].forEach((ev) => offs.push(on(t, ev, () => {
          if (--left <= 0) ready();
        }, { once: true }))));
        if (o.for > 0) timer = setTimeout(ready, o.for);
        else if (!pending.length) timer = setTimeout(ready, 0);
      }
      return () => {
        done = true;
        clearTimeout(timer);
        offs.forEach((f2) => f2());
        el.classList.remove("is-loading", "is-ready", "is-fading");
        if (prevBusy === null) el.removeAttribute("aria-busy");
        else el.setAttribute("aria-busy", prevBusy);
      };
    }
  };

  // src/features/sparkles.js
  add("sparkle-shape", "star", (s) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"><path d="M12 0c.6 7 4.9 11.4 12 12-7.1.6-11.4 5-12 12-.6-7-4.9-11.4-12-12 7.1-.6 11.4-5 12-12z"/></svg>`);
  var sparkles_default = {
    name: "sparkles",
    selector: ".efx-sparkles",
    defaults: { count: 10, color: "", sizeMin: 8, sizeMax: 18, speed: 1, shape: "star" },
    init(el, o) {
      if (!motionOK()) return;
      let restore = false;
      if (getComputedStyle(el).position === "static") {
        el.style.position = "relative";
        restore = true;
      }
      const layer = document.createElement("span");
      layer.className = "efx-sparkles__layer";
      layer.setAttribute("aria-hidden", "true");
      const cols = o.color ? o.color.split("|").map((s) => s.trim()).filter(Boolean) : [themeColor(el), "#fbbf24"];
      const shape = get("sparkle-shape", o.shape) || get("sparkle-shape", "star");
      const r = (a, b) => a + Math.random() * (b - a);
      const place2 = (s) => {
        s.style.left = r(-8, 108) + "%";
        s.style.top = r(-25, 125) + "%";
      };
      for (let i = 0; i < Math.min(60, o.count); i++) {
        const s = document.createElement("span"), m = shape(r(o.sizeMin, o.sizeMax) | 0);
        s.className = "efx-sparkles__s";
        typeof m === "string" ? s.innerHTML = m : s.appendChild(m);
        s.style.color = cols[i % cols.length];
        s.style.animationDuration = r(0.8, 1.6) / o.speed + "s";
        s.style.animationDelay = -r(0, 1.6) + "s";
        place2(s);
        layer.appendChild(s);
      }
      el.appendChild(layer);
      const offs = [on(layer, "animationiteration", (e) => place2(e.target)), onVisible(el, (v) => layer.classList.toggle("is-paused", !v))];
      return () => {
        offs.forEach((f2) => f2());
        layer.remove();
        if (restore) el.style.position = "";
      };
    }
  };

  // src/features/spinner.js
  var spinner_default = {
    name: "spinner",
    selector: '.efx-spinner, [class*="efx-spinner-"]',
    defaults: { type: "", label: "Loading" },
    init(el, o) {
      const undo = [];
      if (o.type) {
        const c = "efx-spinner-" + o.type;
        if (!el.classList.contains(c)) {
          el.classList.add(c);
          undo.push(() => el.classList.remove(c));
        }
      }
      if (!el.classList.contains("efx-spinner")) {
        el.classList.add("efx-spinner");
        undo.push(() => el.classList.remove("efx-spinner"));
      }
      if (!el.hasAttribute("role")) {
        el.setAttribute("role", "status");
        undo.push(() => el.removeAttribute("role"));
      }
      if (!el.hasAttribute("aria-label") && !el.querySelector(".efx-spinner__label") && !el.textContent.trim()) {
        const l = document.createElement("span");
        l.className = "efx-spinner__label";
        l.textContent = o.label;
        el.append(l);
        undo.push(() => l.remove());
      }
      return () => undo.forEach((f2) => f2());
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

  // src/features/toast.js
  var POS = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];
  var stacks = /* @__PURE__ */ new Map();
  var users = 0;
  var offGlobal = [];
  var stackFor = (pos) => {
    pos = POS.includes(pos) ? pos : "bottom-right";
    let s = stacks.get(pos);
    if (!s) {
      s = document.createElement("div");
      s.className = "efx-toast__stack";
      s.dataset.pos = pos;
      s.setAttribute("data-efx-skip", "");
      s.setAttribute("popover", "manual");
      document.body.append(s);
      try {
        s.showPopover();
      } catch (e) {
        s.removeAttribute("popover");
      }
      stacks.set(pos, s);
    }
    return s;
  };
  function show2(fill, o) {
    const stack = stackFor(o.position);
    const t = document.createElement("div");
    t.className = "toast efx-toast__item" + (/^[\w-]+$/.test(o.tone || "") ? " tone-" + o.tone : "");
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    const body = document.createElement("div");
    body.className = "efx-toast__body";
    fill(body);
    const x = document.createElement("button");
    x.type = "button";
    x.className = "btn-close";
    x.setAttribute("aria-label", "Close");
    t.append(body, x);
    stack.append(t);
    let left = o.duration, t0 = 0, timer = 0, paused = false, closed = false;
    const run = () => {
      if (o.duration > 0 && !paused && !closed) {
        t0 = Date.now();
        timer = setTimeout(close, Math.max(left, 300));
      }
    };
    const pause = () => {
      if (paused) return;
      paused = true;
      clearTimeout(timer);
      if (t0) left -= Date.now() - t0;
    };
    const resume = () => {
      if (!paused) return;
      paused = false;
      run();
    };
    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      t.classList.add("is-out");
      const done = () => {
        t.remove();
        if (!stack.children.length && stacks.get(o.position) === stack) {
          stack.remove();
          stacks.delete(o.position);
        }
      };
      t.addEventListener("animationend", done, { once: true });
      setTimeout(done, 450);
    }
    x.addEventListener("click", close);
    t.addEventListener("pointerenter", pause);
    t.addEventListener("pointerleave", resume);
    t.addEventListener("focusin", pause);
    t.addEventListener("focusout", (e) => {
      if (!t.contains(e.relatedTarget)) resume();
    });
    t.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    run();
    return close;
  }
  var toast_default = {
    name: "toast",
    selector: ".efx-toast",
    defaults: { show: -1, position: "bottom-right", duration: 5e3, tone: "" },
    init(el, o) {
      const closers = /* @__PURE__ */ new Set(), timers = /* @__PURE__ */ new Set();
      const id = el.id;
      const fire2 = () => {
        const c = show2((b) => {
          for (const n of el.childNodes) b.append(n.cloneNode(true));
        }, o);
        closers.add(c);
      };
      if (el.hasAttribute("data-efx-show")) {
        const t = setTimeout(fire2, Math.max(0, o.show));
        timers.add(t);
      }
      if (!users++) {
        offGlobal = [
          on(document, "efx:toast", (e) => {
            const d = e.detail || {};
            show2((b) => {
              b.textContent = d.text == null ? "" : String(d.text);
            }, {
              position: d.position || "bottom-right",
              tone: d.tone || "",
              duration: Number.isFinite(+d.duration) && d.duration !== void 0 ? +d.duration : 5e3
            });
          })
        ];
      }
      const offClick = id ? on(document, "click", (e) => {
        const a = e.target.closest && e.target.closest("[data-efx-toast]");
        if (a && a.dataset.efxToast === "#" + id) fire2();
      }) : () => {
      };
      return () => {
        timers.forEach(clearTimeout);
        offClick();
        closers.forEach((c) => c());
        if (!--users) {
          offGlobal.forEach((f2) => f2());
          offGlobal = [];
          stacks.forEach((s) => s.remove());
          stacks.clear();
        }
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
      const rnd3 = (d) => (Math.random() * 2 - 1) * d;
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
          const t = "translate(" + x + "px," + y + "px) translate(-50%,-50%) rotate(" + rnd3(o.rotate).toFixed(1) + "deg)";
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
      const mk2 = (c, t) => {
        const s = document.createElement("span");
        s.className = c;
        if (t) s.textContent = t;
        return s;
      };
      const sr = mk2("efx-typed__sr", words[0]), vis = mk2("efx-typed__v"), txt = mk2("efx-typed__t"), type = o.mode === "type";
      vis.setAttribute("aria-hidden", "true");
      vis.append(txt);
      if (o.cursor) vis.append(mk2("efx-typed__cursor"));
      el.textContent = "";
      el.append(sr, vis);
      el.setAttribute("data-efx-mode", o.mode);
      let i = 0, n = 0, dir = 1, tm = 0, seen = true;
      const later = (ms2, fn) => {
        clearTimeout(tm);
        tm = setTimeout(fn, ms2);
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
  define(ambient_default, animate_default, ascii_default, audio_default, beam_default, border_default, carousel_default, chapter_default, collapse_default, compare_default, confetti_default, copy_default, countdown_default, counter_default, cursor_default, dim_default, direction_default, distort_default, divider_default, drag_default, draggable_default, draw_default, feed_default, flip_default, glitch_default, globe_default, hscroll_default, kenburns_default, kinetic_default, layout_default, lazyimg_default, lightbox_default, lyrics_default, magnetic_default, marquee_default, mask_default, media_default, morph_default, mouse_default, nudge_default, odometer_default, parallax_default, particles_default, path_default, pixelate_default, popout_default, popup_default, pricing_default, progress_default, proximity_default, reel_default, reveal_default, ripple_default, schedule_default, scramble_default, scrollspy_default, scrub_default, sequence_default, shape_default, shimmer_default, sparkles_default, spinner_default, split_default, spotlight_default, stack_default, sticky_default, textfill_default, tilt_default, toast_default, totop_default, trail_default, transition_default, typed_default, zoom_default);
  if (typeof window !== "undefined") window.Effix = core_default;
  autoBoot();
  var effix_entry_default = core_default;
})();
