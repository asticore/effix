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
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        const s = cbs.get(e.target);
        if (s) [...s].forEach((f2) => f2(e.isIntersecting, e));
      }), { rootMargin, threshold });
      v = { io, cbs };
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
  var runScroll = (subs2) => {
    const y = scrollY, h = innerHeight;
    const writes = [];
    subs2.forEach((f2) => {
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
        const names = lazyQueue.get(e.target);
        lazyIO.unobserve(e.target);
        lazyQueue.delete(e.target);
        e.target.removeAttribute("data-efx-lazy");
        if (names) names.forEach((n) => registry.has(n) && mount(e.target, registry.get(n)));
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
    if (cfg.auto === false || html.hasAttribute("data-efx-manual")) return;
    const go = () => {
      init();
      if (cfg.observe || html.hasAttribute("data-efx-observe")) observe();
    };
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", go, { once: true });
    else go();
  }
  var core_default = api;

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
      let io;
      if (o.fade) {
        act.add(0);
        mark();
      } else if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver((es) => {
          es.forEach((e) => {
            const i = slides.indexOf(e.target);
            if (e.isIntersecting) act.add(i);
            else act.delete(i);
          });
          if (act.size) cur = Math.min(...act);
          mark();
        }, { root: el, threshold: 0.6 });
        slides.forEach((s) => io.observe(s));
      }
      sched();
      return () => {
        clearTimeout(timer);
        offs.forEach((f2) => f2());
        io && io.disconnect();
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

  // src/features/counter.js
  var counter_default = {
    name: "counter",
    selector: ".efx-counter",
    defaults: { from: 0, to: NaN, duration: 1600, decimals: -1, separator: ",", prefix: "", suffix: "", once: true },
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
      let raf = 0;
      const run = () => {
        cancelAnimationFrame(raf);
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - t0) / o.duration);
          el.textContent = fmt(o.from + (to - o.from) * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
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
          cancelAnimationFrame(raf);
          el.textContent = fmt(o.from);
        }
      });
      return () => {
        stop();
        cancelAnimationFrame(raf);
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
      const dot = o.style !== "ring" ? mk("dot") : null;
      const parts = [ring, dot].filter(Boolean);
      if (o.hideNative) el.classList.add("efx-cursor-hide");
      let tx = 0, ty = 0, rx = 0, ry = 0, raf = 0, seen = false;
      const put = (n, x, y) => {
        n.style.transform = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%)";
      };
      const tick = () => {
        raf = 0;
        rx += (tx - rx) * 0.2;
        ry += (ty - ry) * 0.2;
        if (Math.abs(tx - rx) < 0.3 && Math.abs(ty - ry) < 0.3) {
          rx = tx;
          ry = ty;
        } else raf = requestAnimationFrame(tick);
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
          if (dot) put(dot, tx, ty);
          if (ring) {
            if (!seen) {
              rx = tx;
              ry = ty;
              put(ring, rx, ry);
            } else if (!raf) raf = requestAnimationFrame(tick);
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
        cancelAnimationFrame(raf);
        parts.forEach((n) => n.remove());
        el.classList.remove("efx-cursor-hide");
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
  var divider_default = {
    name: "divider",
    selector: ".efx-divider",
    defaults: { shape: "wave", color: "", height: 80, flip: false, invert: false, animate: "none", speed: 12, position: "" },
    init(el, o) {
      const [per, layers, ops = []] = SHAPES[o.shape] || SHAPES.wave;
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
  var docOff = null;
  var dispatch = rafThrottle((e) => subs.forEach((fn) => fn(e)));
  var subscribe = (fn) => {
    subs.add(fn);
    if (!docOff) docOff = on(document, "pointermove", dispatch, { passive: true });
    return () => {
      subs.delete(fn);
      if (!subs.size && docOff) {
        docOff();
        docOff = null;
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
      const clamp = (v) => Math.max(-o.max, Math.min(o.max, v));
      const set = (x, y) => {
        el.style.setProperty("--efx-mx", x + "px");
        el.style.setProperty("--efx-my", y + "px");
      };
      const release = () => {
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
          release();
          return;
        }
        clearTimeout(settle);
        pulled = true;
        el.classList.add("is-magnetic", "is-pulled");
        set(clamp((e.clientX - cx) * o.strength).toFixed(1), clamp((e.clientY - cy) * o.strength).toFixed(1));
      };
      const stopVis = onVisible(el, (v) => {
        if (v && !unsub) unsub = subscribe(handle);
        else if (!v && unsub) {
          unsub();
          unsub = null;
          release();
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
      const cv = document.createElement("canvas");
      cv.className = "efx-particles__canvas";
      cv.setAttribute("aria-hidden", "true");
      el.insertBefore(cv, el.firstChild);
      const ctx = cv.getContext("2d");
      const motion = motionOK();
      const colors = o.color ? splitColors(o.color) : [];
      if (!colors.length) colors.push(themeColor(el));
      const sp = o.speed / 100;
      let w = 0, h = 0, dpr = 1, ps = [], raf = 0, vis = true, hidden = document.hidden;
      const ptr = { x: -1e4, y: -1e4 };
      const rnd = (a, b) => a + Math.random() * (b - a);
      const seed = () => {
        dpr = Math.min(devicePixelRatio || 1, 1.5);
        w = el.clientWidth;
        h = el.clientHeight;
        cv.width = w * dpr;
        cv.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.min(o.count, Math.round(w * h / 14e3));
        ps = Array.from({ length: n }, () => ({
          x: rnd(0, w),
          y: rnd(0, h),
          vx: rnd(-0.5, 0.5) * sp,
          vy: rnd(-0.5, 0.5) * sp,
          r: rnd(o.sizeMin, o.sizeMax),
          c: colors[Math.random() * colors.length | 0]
        }));
        draw();
      };
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = o.opacity;
        for (const p of ps) {
          ctx.fillStyle = p.c;
          ctx.beginPath();
          if (o.shape === "square") ctx.rect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
          else if (o.shape === "triangle") {
            ctx.moveTo(p.x, p.y - p.r * 1.3);
            ctx.lineTo(p.x + p.r * 1.2, p.y + p.r);
            ctx.lineTo(p.x - p.r * 1.2, p.y + p.r);
            ctx.closePath();
          } else ctx.arc(p.x, p.y, p.r, 0, 6.2832);
          ctx.fill();
        }
        if (o.links || o.interact === "connect") {
          const L = o.linkDistance, nodes = o.interact === "connect" && ptr.x > -1e3 ? ps.concat({ x: ptr.x, y: ptr.y, c: colors[0] }) : ps;
          ctx.lineWidth = 1;
          for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < L && (o.links || j === ps.length)) {
              ctx.globalAlpha = (1 - d / L) * 0.6 * o.opacity;
              ctx.strokeStyle = a.c;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      };
      const step = () => {
        raf = 0;
        const R = o.interactRadius, push = o.interact === "repel" ? 1 : o.interact === "attract" ? -1 : 0;
        for (const p of ps) {
          p.vx = (p.vx + rnd(-0.02, 0.02) * sp) * 0.99;
          p.vy = (p.vy + rnd(-0.02, 0.02) * sp) * 0.99;
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
        draw();
        go();
      };
      const go = () => {
        if (motion && vis && !hidden && !raf) raf = requestAnimationFrame(step);
      };
      const offs = [];
      seed();
      if (motion) {
        offs.push(onVisible(el, (v) => {
          vis = v;
          if (v) go();
          else {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        }));
        offs.push(subVis((h2) => {
          hidden = h2;
          if (hidden) {
            cancelAnimationFrame(raf);
            raf = 0;
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
        cancelAnimationFrame(raf);
        raf = 0;
        vis = false;
        offs.forEach((f2) => f2());
        ro && ro.disconnect();
        cv.remove();
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

  // src/features/tilt.js
  var tilt_default = {
    name: "tilt",
    selector: ".efx-tilt",
    defaults: { max: 10, perspective: 900, scale: 1.02, glare: false, reset: true },
    init(el, o) {
      if (!finePointer() || !motionOK()) return;
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
      const offs = [on(el, "pointerenter", enter), on(el, "pointermove", move), on(el, "pointerleave", reset)];
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

  // src/effix-entry.js
  define(border_default, carousel_default, compare_default, copy_default, countdown_default, counter_default, cursor_default, divider_default, lightbox_default, magnetic_default, marquee_default, parallax_default, particles_default, popup_default, progress_default, reveal_default, ripple_default, schedule_default, scrollspy_default, split_default, spotlight_default, sticky_default, tilt_default, totop_default, typed_default);
  if (typeof window !== "undefined") window.Effix = core_default;
  autoBoot();
  var effix_entry_default = core_default;
})();
