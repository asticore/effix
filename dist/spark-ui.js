/*! Spark UI v0.4.0 | MIT | https://github.com/asticore/spark */
(() => {
  // spark-host:spark-core
  var get = (...a) => window.Spark.get(...a);
  var parseCSV = (...a) => window.Spark.parseCSV(...a);
  var motionOK = (...a) => window.Spark.motionOK(...a);
  var finePointer = (...a) => window.Spark.finePointer(...a);
  var on = (...a) => window.Spark.on(...a);
  var onVisible = (...a) => window.Spark.onVisible(...a);
  var onScroll = (...a) => window.Spark.onScroll(...a);
  var spark_core_default = window.Spark;

  // src/ui/_shine.js
  var yes = false;
  var shineWidgets = () => {
    if (yes || typeof document === "undefined" || !document.body) return yes;
    const p = document.createElement("div");
    p.className = "calendar";
    p.style.visibility = "hidden";
    document.body.appendChild(p);
    yes = getComputedStyle(p).display === "inline-block";
    p.remove();
    return yes;
  };

  // src/ui/calendar.js
  var pad = (n) => String(n).padStart(2, "0");
  var key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  var parse = (v) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ""));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  };
  var addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  function parseICS(text) {
    const lines = String(text).replace(/\r?\n[ \t]/g, "").split(/\r?\n/), out = [];
    let ev = null;
    const day = (v, p) => {
      const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/.exec(v);
      if (!m) return null;
      if (m[7]) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
      return new Date(+m[1], +m[2] - 1, +m[3]);
    };
    for (const l of lines) {
      if (l === "BEGIN:VEVENT") ev = {};
      else if (l === "END:VEVENT") {
        if (ev && ev.s) {
          const s = ev.s, allDay = ev.allDay, e = ev.e ? allDay ? addDays(ev.e, -1) : ev.e : s;
          out.push({ date: key(s), end: key(e < s ? s : e), title: ev.title || "" });
        }
        ev = null;
      } else if (ev) {
        const i = l.indexOf(":");
        if (i < 0) continue;
        const name = l.slice(0, i).split(";")[0], val = l.slice(i + 1);
        if (name === "SUMMARY") ev.title = val.replace(/\\([,;nN\\])/g, (_, c) => c === "n" || c === "N" ? " " : c);
        else if (name === "DTSTART") {
          ev.s = day(val);
          ev.allDay = !/T/.test(val);
        } else if (name === "DTEND") ev.e = day(val);
      }
    }
    return out;
  }
  var calendar_default = {
    name: "calendar",
    selector: ".spark-calendar",
    defaults: { events: "", range: false, picker: true, firstDay: 0, locale: "", month: "", value: "", min: "", max: "", name: "", label: "Calendar" },
    init(el, o) {
      const saved = el.innerHTML, offs = [], sh = shineWidgets(), cls0 = el.getAttribute("class");
      const c = (shine, own) => sh ? shine : own;
      el.classList.add(...sh ? ["calendar"] : ["spark-calendar--own"]);
      const jsonTag = el.querySelector(':scope > script[type="application/json"]');
      let dead = false, events = [], sel = [null, null], view, focus;
      const loc = o.locale || void 0;
      const mn = parse(o.min), mx = parse(o.max), fd = (Math.round(o.firstDay) % 7 + 7) % 7;
      const [v0, v1] = String(o.value).split("/").map(parse);
      if (v0) sel = [v0, o.range ? v1 || null : null];
      const m0 = parse(o.month + "-01") || v0 || /* @__PURE__ */ new Date();
      view = new Date(m0.getFullYear(), m0.getMonth(), 1);
      focus = v0 || (view.getMonth() === (/* @__PURE__ */ new Date()).getMonth() && view.getFullYear() === (/* @__PURE__ */ new Date()).getFullYear() ? /* @__PURE__ */ new Date() : view);
      el.textContent = "";
      const head = document.createElement("div"), title = document.createElement("div"), grid = document.createElement("div"), list = document.createElement("ul");
      const mkBtn = (cls, txt, label) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = sh ? "btn btn-ghost btn-icon btn-sm" : cls;
        b.textContent = txt;
        b.setAttribute("aria-label", label);
        return b;
      };
      const prev = mkBtn("spark-calendar__nav", "\u2039", "Previous month"), nextB = mkBtn("spark-calendar__nav", "\u203A", "Next month");
      head.className = c("calendar-head", "spark-calendar__head");
      title.className = "spark-calendar__title";
      title.setAttribute("aria-live", "polite");
      grid.className = c("calendar-grid", "spark-calendar__grid");
      grid.setAttribute("role", "grid");
      list.className = "spark-calendar__events";
      head.append(prev, title, nextB);
      el.append(head, grid, list);
      el.setAttribute("aria-label", o.label);
      const input = o.name ? Object.assign(document.createElement("input"), { type: "hidden", name: o.name }) : null;
      if (input) el.append(input);
      const fmtM = new Intl.DateTimeFormat(loc, { month: "long", year: "numeric" }), fmtD = new Intl.DateTimeFormat(loc, { dateStyle: "full" });
      const wk = new Intl.DateTimeFormat(loc, { weekday: "short" }), wkL = new Intl.DateTimeFormat(loc, { weekday: "long" });
      const eventsOn = (k) => events.filter((e) => k >= e.date && k <= (e.end || e.date));
      const disabled = (d) => mn && d < mn || mx && d > mx;
      const same = (a, b) => a && b && key(a) === key(b);
      const render = () => {
        title.textContent = fmtM.format(view);
        grid.textContent = "";
        const hr = document.createElement("div");
        hr.setAttribute("role", "row");
        hr.className = "spark-calendar__row";
        if (sh) hr.style.display = "contents";
        for (let i = 0; i < 7; i++) {
          const d = new Date(2023, 0, 1 + (fd + i) % 7), c2 = document.createElement("div"), cc = (a, b) => sh ? a : b;
          c2.setAttribute("role", "columnheader");
          c2.className = cc("calendar-dow", "spark-calendar__dow");
          c2.textContent = wk.format(d);
          c2.setAttribute("aria-label", wkL.format(d));
          hr.append(c2);
        }
        grid.append(hr);
        const first = new Date(view.getFullYear(), view.getMonth(), 1), lead = (first.getDay() - fd + 7) % 7;
        const dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate(), weeks = Math.ceil((lead + dim) / 7);
        const fk = key(focus), inView = focus.getMonth() === view.getMonth() && focus.getFullYear() === view.getFullYear();
        const lo = sel[0] && sel[1] ? sel[0] < sel[1] ? sel[0] : sel[1] : sel[0], hi = sel[0] && sel[1] ? sel[0] < sel[1] ? sel[1] : sel[0] : sel[0];
        for (let w = 0; w < weeks; w++) {
          const row = document.createElement("div");
          row.setAttribute("role", "row");
          row.className = "spark-calendar__row";
          if (sh) row.style.display = "contents";
          for (let i = 0; i < 7; i++) {
            const d = addDays(first, w * 7 + i - lead), k = key(d), out = d.getMonth() !== view.getMonth();
            const cell = document.createElement("div");
            cell.setAttribute("role", "gridcell");
            if (sh) cell.style.display = "contents";
            const b = document.createElement("button");
            b.type = "button";
            b.className = sh ? "calendar-day" : "spark-calendar__day";
            b.dataset.date = k;
            b.textContent = d.getDate();
            b.tabIndex = k === fk && inView || !inView && !out && d.getDate() === 1 ? 0 : -1;
            const ev = eventsOn(k);
            b.setAttribute("aria-label", fmtD.format(d) + (ev.length ? `, ${ev.length} event${ev.length > 1 ? "s" : ""}` : ""));
            if (out) b.classList.add(sh ? "outside" : "is-outside");
            if (same(d, /* @__PURE__ */ new Date())) b.setAttribute("aria-current", "date");
            if (disabled(d)) b.disabled = true;
            const picked = o.picker && lo && d >= lo && d <= hi;
            if (picked) {
              cell.setAttribute("aria-selected", "true");
              b.classList.add("is-selected");
              if (same(d, lo)) b.classList.add("is-start");
              if (same(d, hi)) b.classList.add("is-end");
              if (sh) {
                const ends = same(d, lo) || same(d, hi), span = !same(lo, hi);
                if (ends) b.setAttribute("aria-selected", "true");
                else b.classList.add("in-range");
                if (span && same(d, lo)) b.classList.add("range-start");
                if (span && same(d, hi)) b.classList.add("range-end");
              }
            }
            if (ev.length) {
              b.classList.add("has-events");
              const dots = document.createElement("span");
              dots.className = sh ? "calendar-dots" : "spark-calendar__dots";
              dots.setAttribute("aria-hidden", "true");
              ev.slice(0, 3).forEach((e) => {
                const dot = document.createElement("i");
                if (e.color && /^[\w#(),.% -]+$/.test(e.color)) dot.style.background = e.color;
                dots.append(dot);
              });
              b.append(dots);
            }
            cell.append(b);
            row.append(cell);
          }
          grid.append(row);
        }
        renderList();
      };
      const renderList = () => {
        list.textContent = "";
        const ref = sel[0] || focus, hi = sel[1] && sel[1] > ref ? sel[1] : ref;
        const shown = events.filter((e) => e.date <= key(hi) && (e.end || e.date) >= key(ref));
        const items = sel[0] ? shown : events.filter((e) => {
          const a = parse(e.date), b = parse(e.end || e.date);
          return a < new Date(view.getFullYear(), view.getMonth() + 1, 1) && b >= view;
        });
        items.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 50).forEach((e) => {
          const li = document.createElement("li"), t = document.createElement("time"), s = document.createElement("span");
          t.dateTime = e.date;
          t.textContent = e.end && e.end !== e.date ? `${e.date} \u2013 ${e.end}` : e.date;
          s.textContent = e.title;
          li.append(t, " ", s);
          list.append(li);
        });
        list.hidden = !list.children.length;
      };
      const go = (d, keep) => {
        focus = d;
        if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) view = new Date(d.getFullYear(), d.getMonth(), 1);
        render();
        if (keep) {
          const b = grid.querySelector(`[data-date="${key(d)}"]`);
          if (b) b.focus();
        }
      };
      const pick = (d) => {
        if (!o.picker || disabled(d)) return;
        if (o.range) {
          if (!sel[0] || sel[1]) sel = [d, null];
          else sel = d < sel[0] ? [d, sel[0]] : [sel[0], d];
        } else sel = [d, null];
        const done = !o.range || !!sel[1];
        if (input) input.value = sel[0] ? key(sel[0]) + (sel[1] ? "/" + key(sel[1]) : "") : "";
        focus = d;
        render();
        const b = grid.querySelector(`[data-date="${key(d)}"]`);
        if (b) b.focus();
        if (done) {
          const a = sel[0], z = sel[1];
          el.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value: key(a), end: z ? key(z) : "", events: events.filter((e) => e.date <= key(z || a) && (e.end || e.date) >= key(a)) } }));
        }
      };
      offs.push(on(prev, "click", () => {
        view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
        focus = new Date(view);
        render();
      }));
      offs.push(on(nextB, "click", () => {
        view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
        focus = new Date(view);
        render();
      }));
      offs.push(on(grid, "click", (e) => {
        const b = e.target.closest("[data-date]");
        if (b) pick(parse(b.dataset.date));
      }));
      offs.push(on(grid, "keydown", (e) => {
        const b = e.target.closest("[data-date]");
        if (!b) return;
        const d = parse(b.dataset.date), k = e.key;
        const mv = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[k];
        if (mv) go(addDays(d, mv), true);
        else if (k === "Home") go(addDays(d, -((d.getDay() - fd + 7) % 7)), true);
        else if (k === "End") go(addDays(d, 6 - (d.getDay() - fd + 7) % 7), true);
        else if (k === "PageUp" || k === "PageDown") {
          const n = k === "PageUp" ? -1 : 1, t = new Date(d.getFullYear(), d.getMonth() + n + (e.shiftKey ? 11 * n : 0), 1);
          t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()));
          go(t, true);
        } else return;
        e.preventDefault();
      }));
      const setEvents = (raw) => {
        let a = raw;
        if (typeof a === "string") a = a.trim()[0] === "[" || a.trim()[0] === "{" ? JSON.parse(a) : parseICS(a);
        if (a && !Array.isArray(a)) a = a.events;
        events = (Array.isArray(a) ? a : []).filter((e) => e && parse(e.date)).map((e) => ({ date: String(e.date).slice(0, 10), end: e.end ? String(e.end).slice(0, 10) : "", title: String(e.title || e.name || ""), color: e.color }));
        if (!dead) render();
      };
      offs.push(on(el, "spark:data", (e) => {
        try {
          setEvents(e.detail);
        } catch (err) {
          console.warn("[spark] calendar data", err);
        }
      }));
      const src = (o.events || "").trim();
      try {
        if (!src && jsonTag) setEvents(jsonTag.textContent);
        else if (src && /^(\[|\{|BEGIN:VCALENDAR)/.test(src)) setEvents(src);
        else if (src) fetch(src).then((r) => r.text()).then((t) => {
          if (!dead) setEvents(t);
        }).catch((err) => console.warn("[spark] calendar events", err));
      } catch (err) {
        console.warn("[spark] calendar events", err);
      }
      render();
      return () => {
        dead = true;
        offs.forEach((f) => f());
        el.innerHTML = saved;
        el.removeAttribute("aria-label");
        cls0 === null ? el.removeAttribute("class") : el.setAttribute("class", cls0);
      };
    }
  };

  // src/ui/lottie.js
  var LIB = "https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0/+esm";
  var libP = null;
  var loadLib = (url) => libP || (libP = (async () => {
    if (window.DotLottie) return window.DotLottie;
    const custom = get("lottie-lib", "default");
    const mod = custom ? await custom() : await import(
      /* @vite-ignore */
      url
    );
    return mod.DotLottie || mod.default && mod.default.DotLottie || mod.default;
  })().catch((e) => {
    libP = null;
    throw e;
  }));
  var lottie_default = {
    name: "lottie",
    selector: ".spark-lottie",
    lazy: true,
    defaults: { src: "", autoplay: true, loop: true, speed: 1, trigger: "auto", still: 0, lib: LIB, label: "" },
    init(el, o) {
      if (!o.src) return;
      const canvas = document.createElement("canvas");
      canvas.className = "spark-lottie__canvas";
      el.append(canvas);
      const a0 = ["role", "aria-label"].map((a) => [a, el.getAttribute(a)]);
      if (o.label) {
        el.setAttribute("role", "img");
        el.setAttribute("aria-label", o.label);
      } else canvas.setAttribute("aria-hidden", "true");
      const offs = [];
      let dead = false, player = null, ready = false, inView = true;
      const reduced = !motionOK(), trig = ["auto", "visible", "hover", "click", "scroll"].includes(o.trigger) ? o.trigger : "auto";
      const total = () => Math.max(1, player.totalFrames || 1);
      const start = () => {
        if (dead || !ready) return;
        const still = Math.min(1, Math.max(0, o.still));
        if (reduced) {
          player.setFrame(Math.round(still * (total() - 1)));
          return;
        }
        if (trig === "auto") {
          if (o.autoplay) player.play();
          else player.setFrame(Math.round(still * (total() - 1)));
        } else if (trig === "visible") {
          offs.push(onVisible(el, (v) => {
            inView = v;
            if (v) player.play();
            else player.pause();
          }, "0px", 0.25));
        } else if (trig === "hover") {
          player.setFrame(Math.round(still * (total() - 1)));
          offs.push(on(el, "pointerenter", () => player.play()), on(el, "pointerleave", () => player.pause()));
        } else if (trig === "click") {
          player.setFrame(Math.round(still * (total() - 1)));
          offs.push(on(el, "click", () => {
            if (player.isPlaying) player.pause();
            else player.play();
          }));
        } else if (trig === "scroll") {
          offs.push(onScroll((y, h) => {
            const r = el.getBoundingClientRect(), p = Math.min(1, Math.max(0, (h - r.top) / (h + r.height)));
            return () => player.setFrame(p * (total() - 1));
          }));
        }
      };
      loadLib(o.lib).then((DotLottie) => {
        if (dead) return;
        player = new DotLottie({ canvas, src: o.src, autoplay: false, loop: o.loop && !reduced, speed: o.speed, renderConfig: { autoResize: true } });
        const done = () => {
          if (dead || ready) return;
          ready = true;
          el.classList.add("is-ready");
          el.dispatchEvent(new CustomEvent("spark:ready", { bubbles: true }));
          start();
        };
        player.addEventListener("load", done);
        player.addEventListener("loadError", () => {
          if (!dead) el.classList.add("is-error");
        });
        player.addEventListener("complete", () => el.dispatchEvent(new CustomEvent("spark:done", { bubbles: true })));
      }).catch((e) => {
        if (!dead) {
          el.classList.add("is-error");
          console.warn("[spark] lottie player failed to load", e);
        }
      });
      return () => {
        dead = true;
        offs.forEach((f) => f());
        try {
          player && player.destroy();
        } catch (e) {
        }
        canvas.remove();
        el.classList.remove("is-ready", "is-error");
        a0.forEach(([a, v]) => v === null ? el.removeAttribute(a) : el.setAttribute(a, v));
      };
    }
  };

  // src/ui/rating.js
  var uid = 0;
  var rating_default = {
    name: "rating",
    selector: ".spark-rating",
    defaults: { value: -1, count: 5, half: false, readonly: true, name: "", label: "Rating" },
    init(el, o) {
      const saved = el.innerHTML, attrs = ["role", "tabindex", "aria-label", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext", "aria-readonly"].map((a) => [a, el.getAttribute(a)]);
      const count = Math.max(1, Math.min(20, Math.round(o.count))), step = o.half ? 0.5 : 1;
      const clamp = (v) => Math.max(0, Math.min(count, Math.round(v / step) * step));
      let value = clamp(o.value >= 0 ? o.value : parseFloat(el.textContent) || 0), preview = null;
      const stars = [], offs = [];
      if (shineWidgets() && count === 5) {
        const cls0 = el.getAttribute("class"), style0 = el.getAttribute("style");
        el.textContent = "";
        el.setAttribute("aria-label", o.label);
        if (o.readonly) {
          el.classList.add("rating", "is-readonly");
          el.style.setProperty("--sh-rating", value);
          el.setAttribute("role", "img");
          el.setAttribute("aria-label", `${o.label}: ${value} of 5`);
        } else {
          const id = "spark-rt" + ++uid, nm = o.name || id;
          el.classList.add("rating-input");
          if (o.half) el.classList.add("rating-half");
          el.setAttribute("role", "radiogroup");
          for (let k = 1; k <= 5 / step; k++) {
            const v = k * step, r = document.createElement("input"), l = document.createElement("label");
            r.type = "radio";
            r.name = nm;
            r.id = `${id}-${k}`;
            r.value = v;
            r.checked = v === value;
            l.htmlFor = r.id;
            l.textContent = v;
            l.title = `${v} of 5`;
            el.append(r, l);
          }
          offs.push(on(el, "change", (e) => {
            if (e.target === el) return;
            e.stopPropagation();
            value = parseFloat(e.target.value);
            el.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value } }));
          }));
        }
        return () => {
          offs.forEach((f) => f());
          el.innerHTML = saved;
          cls0 === null ? el.removeAttribute("class") : el.setAttribute("class", cls0);
          style0 === null ? el.removeAttribute("style") : el.setAttribute("style", style0);
          attrs.forEach(([a, v]) => v === null ? el.removeAttribute(a) : el.setAttribute(a, v));
        };
      }
      const input = o.name ? Object.assign(document.createElement("input"), { type: "hidden", name: o.name }) : null;
      el.textContent = "";
      for (let i = 0; i < count; i++) {
        const st = document.createElement("span");
        st.className = "spark-rating__star";
        st.setAttribute("aria-hidden", "true");
        st.textContent = "\u2605";
        el.append(st);
        stars.push(st);
      }
      if (input) el.append(input);
      const text = (v) => `${v} of ${count}`;
      const paint = (v) => stars.forEach((st, i) => st.style.setProperty("--spark-fill", Math.max(0, Math.min(1, v - i))));
      const set = (v, fire) => {
        v = clamp(v);
        const changed = v !== value;
        value = v;
        preview = null;
        paint(v);
        el.setAttribute("aria-valuenow", v);
        el.setAttribute("aria-valuetext", text(v));
        if (input) input.value = v;
        if (fire && changed) el.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value: v } }));
      };
      el.classList.add("spark-rating--own");
      el.classList.toggle("is-readonly", o.readonly);
      el.setAttribute("aria-label", o.label);
      if (o.readonly) {
        el.setAttribute("role", "img");
        el.setAttribute("aria-label", `${o.label}: ${text(value)}`);
        paint(value);
        if (input) input.value = value;
      } else {
        el.setAttribute("role", "slider");
        el.tabIndex = 0;
        el.setAttribute("aria-valuemin", 0);
        el.setAttribute("aria-valuemax", count);
        set(value);
        const at = (e) => {
          const i = Math.max(0, Math.min(count - 1, stars.findIndex((s) => s.contains(e.target))));
          if (!stars.some((s) => s.contains(e.target))) return null;
          if (!o.half) return i + 1;
          const r = stars[i].getBoundingClientRect(), rtl = getComputedStyle(el).direction === "rtl";
          const left = rtl ? e.clientX > r.left + r.width / 2 : e.clientX < r.left + r.width / 2;
          return i + (left ? 0.5 : 1);
        };
        if (finePointer()) {
          offs.push(on(el, "pointermove", (e) => {
            const v = at(e);
            if (v != null && v !== preview) {
              preview = v;
              paint(v);
            }
          }));
          offs.push(on(el, "pointerleave", () => {
            preview = null;
            paint(value);
          }));
        }
        offs.push(on(el, "click", (e) => {
          const v = at(e);
          if (v != null) set(v === value ? 0 : v, true);
        }));
        offs.push(on(el, "keydown", (e) => {
          const k = e.key, d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[k];
          if (d != null) set(value + d, true);
          else if (k === "Home") set(0, true);
          else if (k === "End") set(count, true);
          else return;
          e.preventDefault();
        }));
      }
      return () => {
        offs.forEach((f) => f());
        el.innerHTML = saved;
        el.classList.remove("is-readonly", "spark-rating--own");
        attrs.forEach(([a, v]) => v === null ? el.removeAttribute(a) : el.setAttribute(a, v));
      };
    }
  };

  // src/ui/steps.js
  var steps_default = {
    name: "steps",
    selector: ".spark-steps",
    defaults: { start: 0, hash: false, linear: true, native: true, validate: "", back: "Back", next: "Next", finish: "Finish", label: "Progress" },
    init(el, o) {
      const panels = [...el.children].filter((c) => c.classList.contains("spark-step"));
      if (!panels.length) return;
      const n = panels.length, key2 = el.id || "step", offs = [], sh = shineWidgets();
      const saved = panels.map((p) => [p.hidden, p.getAttribute("aria-labelledby"), p.getAttribute("role"), p.id]);
      const bits = [];
      const mk2 = (tag, cls, txt) => {
        const x = document.createElement(tag);
        x.className = cls;
        if (txt != null) x.textContent = txt;
        return x;
      };
      const list = mk2("ol", sh ? "stepper" : "spark-steps__list"), bar = mk2("div", "spark-steps__bar"), status = mk2("div", "spark-steps__status");
      const nav = mk2("div", "spark-steps__nav"), back = mk2("button", "btn btn-outline spark-steps__back", o.back), next = mk2("button", "btn spark-steps__next", o.next);
      back.type = next.type = "button";
      status.setAttribute("aria-live", "polite");
      list.setAttribute("aria-label", o.label);
      bar.setAttribute("aria-hidden", "true");
      const items = panels.map((p, i) => {
        const li = mk2("li", sh ? "step" : "spark-steps__item"), b = mk2("button", sh ? "step-marker" : "spark-steps__btn"), t = mk2("span", sh ? "step-label" : "spark-steps__title", p.dataset.sparkTitle || `Step ${i + 1}`);
        b.type = "button";
        if (sh) {
          b.textContent = i + 1;
          li.append(b, t);
        } else {
          b.append(mk2("span", "spark-steps__num", i + 1), t);
          li.append(b);
        }
        list.append(li);
        if (!p.id) {
          p.id = `${key2}-panel-${i + 1}`;
          bits.push(p);
        }
        p.setAttribute("role", "group");
        b.id = `${key2}-tab-${i + 1}`;
        p.setAttribute("aria-labelledby", b.id);
        b.setAttribute("aria-label", `Step ${i + 1}: ${t.textContent}`);
        offs.push(on(b, "click", () => go(i, true)));
        return { li, b, p, t };
      });
      nav.append(back, next);
      el.prepend(list);
      el.prepend(bar);
      el.append(status, nav);
      el.classList.add("spark-steps--on");
      let cur = -1, doneAll = false;
      const valid = (i) => {
        const p = panels[i];
        if (o.native) {
          const bad = [...p.querySelectorAll("input,select,textarea")].find((f) => !f.disabled && f.willValidate && !f.checkValidity());
          if (bad) {
            bad.reportValidity();
            return false;
          }
        }
        const fn = o.validate && get("step-validate", o.validate);
        if (typeof fn === "function") {
          try {
            if (fn(p, i) === false) return false;
          } catch (e) {
            console.warn("[spark] steps validate", e);
          }
        }
        return p.dispatchEvent(new CustomEvent("spark:validate", { bubbles: true, cancelable: true, detail: { index: i } }));
      };
      function show(i, quiet) {
        const prevI = cur;
        cur = i;
        items.forEach((it, k) => {
          it.p.hidden = k !== i;
          const d = k < i || doneAll, cur2 = sh ? it.li : it.b;
          it.li.classList.toggle("is-active", k === i);
          it.li.classList.toggle("is-done", d);
          it.li.classList.toggle("done", sh && d);
          if (k === i) cur2.setAttribute("aria-current", "step");
          else cur2.removeAttribute("aria-current");
          it.b.disabled = o.linear && k > i && !(k < reached + 1);
        });
        el.style.setProperty("--spark-steps-progress", n > 1 ? i / (n - 1) : 1);
        el.setAttribute("data-spark-step", i);
        back.disabled = i === 0;
        next.textContent = i === n - 1 ? o.finish : o.next;
        next.classList.toggle("is-last", i === n - 1);
        status.textContent = `Step ${i + 1} of ${n}: ${items[i].t.textContent}`;
        if (o.hash && !quiet) {
          const h = `#${key2}=${i + 1}`;
          if (location.hash !== h) history.replaceState(null, "", h);
        }
        if (!quiet || prevI < 0) el.dispatchEvent(new CustomEvent("spark:step", { bubbles: true, detail: { index: i, count: n, previous: prevI } }));
      }
      let reached = 0;
      function go(i, userNav) {
        i = Math.max(0, Math.min(n - 1, i));
        if (i === cur) return;
        if (i > cur) {
          if (o.linear && userNav && i > reached) return;
          for (let k = cur; k < i; k++) if (!valid(k)) return;
        }
        reached = Math.max(reached, i);
        show(i);
        const focus = panels[i].querySelector("[autofocus],input,select,textarea,button,a[href]");
        if (userNav !== "quiet" && focus) try {
          focus.focus({ preventScroll: true });
        } catch (e) {
        }
      }
      offs.push(on(back, "click", () => go(cur - 1)));
      offs.push(on(next, "click", () => {
        if (cur < n - 1) return go(cur + 1);
        if (!valid(cur)) return;
        doneAll = true;
        items.forEach((it) => {
          it.li.classList.add("is-done");
          if (sh) it.li.classList.add("done");
        });
        el.classList.add("is-done");
        el.dispatchEvent(new CustomEvent("spark:done", { bubbles: true }));
      }));
      offs.push(on(el, "spark:goto", (e) => {
        const i = Math.round(e.detail && e.detail.index);
        if (Number.isFinite(i)) {
          reached = Math.max(reached, i);
          go(i, "quiet");
        }
      }));
      const fromHash = () => {
        const m = new RegExp(`[#&]${key2.replace(/[^\w-]/g, "")}=(\\d+)`).exec(location.hash);
        return m ? +m[1] - 1 : null;
      };
      if (o.hash) offs.push(on(window, "hashchange", () => {
        const i = fromHash();
        if (i != null && i >= 0 && i < n && i !== cur) {
          reached = Math.max(reached, i);
          show(i, true);
        }
      }));
      const h0 = o.hash ? fromHash() : null, s0 = Math.max(0, Math.min(n - 1, Math.round(h0 != null ? h0 : o.start)));
      reached = s0;
      show(s0, true);
      return () => {
        offs.forEach((f) => f());
        [list, bar, status, nav].forEach((x) => x.remove());
        panels.forEach((p, i) => {
          p.hidden = saved[i][0];
          [["aria-labelledby", saved[i][1]], ["role", saved[i][2]]].forEach(([a, v]) => v === null ? p.removeAttribute(a) : p.setAttribute(a, v));
          if (bits.includes(p)) p.removeAttribute("id");
        });
        el.classList.remove("spark-steps--on", "is-done");
        el.style.removeProperty("--spark-steps-progress");
        el.removeAttribute("data-spark-step");
      };
    }
  };

  // src/ui/table.js
  var num = (v) => {
    const t = String(v).replace(/[\s,$£€%]/g, "");
    return t !== "" && /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t) ? parseFloat(t) : NaN;
  };
  var mk = (tag, cls, txt) => {
    const n = document.createElement(tag);
    n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  };
  var csvCell = (v) => {
    let t = String(v);
    if (/^[=+\-@\t\r]/.test(t) && Number.isNaN(num(t))) t = "'" + t;
    return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  };
  function normalise(d) {
    if (typeof d === "string") d = parseCSV(d);
    if (d && !Array.isArray(d) && typeof d === "object") {
      const cols = d.columns || (d.rows && d.rows[0] && !Array.isArray(d.rows[0]) ? Object.keys(d.rows[0]) : null);
      return normalise(cols ? [cols, ...(d.rows || []).map((r) => Array.isArray(r) ? r : cols.map((c) => r[c]))] : d.rows || []);
    }
    if (!Array.isArray(d) || !d.length) return { columns: [], rows: [] };
    if (!Array.isArray(d[0]) && typeof d[0] === "object") {
      const columns = [...new Set(d.flatMap((r) => Object.keys(r)))];
      return { columns, rows: d.map((r) => columns.map((c) => r[c] == null ? "" : String(r[c]))) };
    }
    return { columns: d[0].map(String), rows: d.slice(1).map((r) => r.map((c) => c == null ? "" : String(c))) };
  }
  var table_default = {
    name: "table",
    selector: ".spark-table",
    defaults: {
      data: "",
      sort: true,
      search: false,
      filters: false,
      pageSize: 0,
      sticky: false,
      height: "",
      columns: false,
      select: false,
      stack: false,
      csv: false,
      filename: "table",
      empty: "No results",
      placeholder: "Search\u2026"
    },
    init(el, o) {
      const table = el.tagName === "TABLE" ? el : el.querySelector("table");
      if (!table) return;
      const saved = table.innerHTML, parent = table.parentNode;
      const sh = shineWidgets();
      const cls0 = table.className, bar = mk("div", sh ? "dt-toolbar" : "spark-table__bar"), pager = mk("div", sh ? "dt-pagebar" : "spark-table__pager");
      const mark = (tr, on_) => {
        tr.classList.toggle("is-selected", on_);
        if (sh) tr.setAttribute("aria-selected", String(on_));
      };
      const live = mk("span", "spark-table__live");
      live.setAttribute("aria-live", "polite");
      const offs = [];
      let dead = false, rows = [], cols = [], wrap = null, order = [], view = [], page = 0;
      let sortCol = -1, sortDir = 1, query = "", hiddenCols = /* @__PURE__ */ new Set(), selected = /* @__PURE__ */ new Set();
      const colF = [];
      const fromMarkup = () => {
        const ths = [...table.querySelectorAll("thead tr:first-child > *")];
        cols = ths.map((th) => th.textContent.trim());
        rows = [...table.querySelectorAll(":scope > tbody > tr")].map((tr) => {
          const tds = [...tr.children];
          return { tr, cells: tds.map((td) => td.textContent.trim()), vals: tds.map((td) => {
            var _a;
            return (_a = td.dataset.sparkValue) != null ? _a : td.textContent.trim();
          }) };
        });
        if (!cols.length && rows[0]) cols = rows[0].cells.map((_, i) => "Column " + (i + 1));
      };
      const fromData = (d) => {
        const n = normalise(d);
        cols = n.columns;
        rows = n.rows.map((r) => ({ cells: cols.map((_, i) => {
          var _a;
          return (_a = r[i]) != null ? _a : "";
        }), vals: cols.map((_, i) => {
          var _a;
          return (_a = r[i]) != null ? _a : "";
        }) }));
        table.textContent = "";
        const th = table.createTHead().insertRow();
        cols.forEach((c) => th.appendChild(mk("th", "", c)).setAttribute("scope", "col"));
        const tb = table.createTBody();
        rows.forEach((r) => {
          r.tr = tb.insertRow();
          r.cells.forEach((c) => r.tr.insertCell().textContent = c);
        });
      };
      const pass = (r) => {
        if (query && !r.cells.some((c, i) => !hiddenCols.has(i) && c.toLowerCase().includes(query))) return false;
        return colF.every((f, i) => !f || r.cells[i].toLowerCase().includes(f));
      };
      const cmp = (a, b) => {
        const x = a.vals[sortCol], y = b.vals[sortCol], nx = num(x), ny = num(y);
        return (Number.isNaN(nx) || Number.isNaN(ny) ? String(x).localeCompare(String(y), void 0, { numeric: true, sensitivity: "base" }) : nx - ny) * sortDir;
      };
      const selectedRows = () => rows.filter((r) => selected.has(r)).map((r) => r.cells);
      const fire = () => el.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { selected: selectedRows(), count: selected.size } }));
      const tbody = () => table.tBodies[0];
      let empty = null, all = null;
      function render(announce) {
        view = rows.filter(pass);
        if (sortCol >= 0) view = view.map((r, i) => [r, i]).sort((a, b) => cmp(a[0], b[0]) || a[1] - b[1]).map((x) => x[0]);
        const size2 = o.pageSize > 0 ? Math.floor(o.pageSize) : view.length || 1, pages = Math.max(1, Math.ceil(view.length / size2));
        page = Math.min(page, pages - 1);
        const shown = view.slice(page * size2, page * size2 + size2);
        const tb = tbody();
        tb.replaceChildren(...shown.map((r) => r.tr));
        if (empty) {
          empty.remove();
          empty = null;
        }
        if (!shown.length) {
          empty = mk("tr", "spark-table__empty");
          const td = mk("td", "", sh ? null : o.empty);
          td.colSpan = Math.max(1, cols.length + (o.select ? 1 : 0));
          if (sh) td.append(mk("div", "dt-empty", o.empty));
          empty.append(td);
          tb.append(empty);
        }
        table.querySelectorAll("thead tr:first-child th[aria-sort]").forEach((th) => th.setAttribute("aria-sort", "none"));
        if (sortCol >= 0) {
          const th = headCell(sortCol);
          if (th) th.setAttribute("aria-sort", sortDir > 0 ? "ascending" : "descending");
        }
        if (all) {
          all.checked = !!shown.length && shown.every((r) => selected.has(r));
          all.indeterminate = !all.checked && shown.some((r) => selected.has(r));
        }
        if (o.pageSize > 0) {
          pager.hidden = pages < 2;
          pager.querySelector(".dt-info, .spark-table__info").textContent = view.length ? `${page * size2 + 1}\u2013${page * size2 + shown.length} of ${view.length}` : "0 of 0";
          pager.querySelector('[data-p="prev"]').disabled = page <= 0;
          pager.querySelector('[data-p="next"]').disabled = page >= pages - 1;
        }
        if (announce) live.textContent = `${view.length} row${view.length === 1 ? "" : "s"}`;
      }
      const headCell = (i) => table.querySelector(`thead tr:first-child > :nth-child(${i + 1 + (o.select ? 1 : 0)})`);
      const prep = () => {
        const row0 = table.querySelector("thead tr:first-child");
        if (!row0) return;
        if (o.select) {
          const th = mk("th", "spark-table__sel");
          th.scope = "col";
          all = mk("input", "checkbox");
          all.type = "checkbox";
          all.setAttribute("aria-label", "Select all rows");
          th.append(all);
          row0.prepend(th);
          offs.push(on(all, "change", () => {
            const shown = [...tbody().children].map((tr) => rows.find((r) => r.tr === tr)).filter(Boolean);
            shown.forEach((r) => {
              all.checked ? selected.add(r) : selected.delete(r);
              r.box.checked = all.checked;
              mark(r.tr, all.checked);
            });
            render();
            fire();
          }));
        }
        rows.forEach((r) => {
          if (o.select) {
            const td = mk("td", "spark-table__sel"), b = mk("input", "checkbox");
            b.type = "checkbox";
            b.setAttribute("aria-label", "Select row");
            td.append(b);
            r.tr.prepend(td);
            r.box = b;
            offs.push(on(b, "change", () => {
              b.checked ? selected.add(r) : selected.delete(r);
              mark(r.tr, b.checked);
              render();
              fire();
            }));
          }
          if (o.stack) [...r.tr.children].forEach((td, i) => {
            const k = i - (o.select ? 1 : 0);
            if (k >= 0 && cols[k]) td.dataset.label = cols[k];
          });
        });
        cols.forEach((c, i) => {
          const th = headCell(i);
          if (!th || !o.sort) return;
          const b = mk("button", sh ? "" : "spark-table__sort");
          b.type = "button";
          th.setAttribute("aria-sort", "none");
          while (th.firstChild) b.append(th.firstChild);
          th.append(b);
          offs.push(on(b, "click", () => {
            sortDir = sortCol === i ? -sortDir : 1;
            sortCol = i;
            render(true);
          }));
        });
        if (o.filters) {
          const fr = mk("tr", "spark-table__filters");
          if (o.select) fr.append(mk("th", ""));
          cols.forEach((c, i) => {
            const th = mk("th", ""), inp = mk("input", "input input-sm");
            inp.type = "search";
            inp.placeholder = "Filter";
            inp.setAttribute("aria-label", "Filter " + c);
            colF[i] = "";
            th.append(inp);
            fr.append(th);
            offs.push(on(inp, "input", () => {
              colF[i] = inp.value.trim().toLowerCase();
              page = 0;
              render(true);
            }));
          });
          row0.after(fr);
        }
      };
      const buildBar = () => {
        if (o.search) {
          const inp = mk("input", sh ? "input input-sm dt-search" : "input input-sm spark-table__search");
          inp.type = "search";
          inp.placeholder = o.placeholder;
          inp.setAttribute("aria-label", "Search table");
          bar.append(inp);
          offs.push(on(inp, "input", () => {
            query = inp.value.trim().toLowerCase();
            page = 0;
            render(true);
          }));
        }
        if (o.columns && cols.length) {
          const d = mk("details", "spark-table__cols"), sm = mk("summary", "btn btn-sm btn-outline", "Columns"), list = mk("div", "spark-table__colist");
          cols.forEach((c, i) => {
            const lab = mk("label", ""), cb = mk("input", "checkbox");
            cb.type = "checkbox";
            cb.checked = true;
            lab.append(cb, document.createTextNode(" " + c));
            list.append(lab);
            offs.push(on(cb, "change", () => {
              cb.checked ? hiddenCols.delete(i) : hiddenCols.add(i);
              if (hiddenCols.size >= cols.length) {
                hiddenCols.delete(i);
                cb.checked = true;
              }
              applyCols();
              render(true);
            }));
          });
          d.append(sm, list);
          bar.append(d);
        }
        if (o.csv) {
          const b = mk("button", "btn btn-sm btn-outline spark-table__csv", "Download CSV");
          b.type = "button";
          bar.append(b);
          offs.push(on(b, "click", () => {
            const keep = cols.map((_, i) => i).filter((i) => !hiddenCols.has(i));
            const src = selected.size ? view.filter((r) => selected.has(r)) : view;
            const text = [keep.map((i) => cols[i]), ...src.map((r) => keep.map((i) => r.cells[i]))].map((r) => r.map(csvCell).join(",")).join("\r\n");
            const a = document.createElement("a"), url = URL.createObjectURL(new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" }));
            a.href = url;
            a.download = (o.filename || "table").replace(/[^\w.-]+/g, "_") + ".csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1e3);
          }));
        }
        if (o.pageSize > 0) {
          pager.append(mk("span", sh ? "dt-info" : "spark-table__info"));
          ["prev", "next"].forEach((k) => {
            const b = mk("button", "btn btn-sm btn-outline", k === "prev" ? "Previous" : "Next");
            b.type = "button";
            b.dataset.p = k;
            pager.append(b);
            offs.push(on(b, "click", () => {
              page += k === "prev" ? -1 : 1;
              render(true);
            }));
          });
        }
      };
      const applyCols = () => {
        const off = o.select ? 1 : 0;
        table.querySelectorAll("tr").forEach((tr) => {
          if (!tr.classList.contains("spark-table__empty")) [...tr.children].forEach((c, i) => {
            c.hidden = i >= off && hiddenCols.has(i - off);
          });
        });
      };
      const start = (d) => {
        if (dead) return;
        offs.splice(0).forEach((f) => f());
        table.innerHTML = saved;
        bar.textContent = "";
        pager.textContent = "";
        sortCol = -1;
        query = "";
        page = 0;
        selected = /* @__PURE__ */ new Set();
        hiddenCols = /* @__PURE__ */ new Set();
        colF.length = 0;
        all = null;
        if (d === void 0) fromMarkup();
        else fromData(d);
        buildBar();
        prep();
        render();
        bar.hidden = !bar.children.length;
        el.setAttribute("data-spark-rows", rows.length);
      };
      const parse2 = (src) => /^\s*[[{]/.test(src) ? JSON.parse(src) : src;
      const load = async () => {
        const d = o.data.trim();
        if (!d) return start();
        let src = d;
        if (/^(https?:\/\/|\/|\.\.?\/)\S+$|^[^\s,{[]+\.(csv|json)(\?\S*)?$/i.test(d)) {
          try {
            src = await (await fetch(d)).text();
          } catch (e) {
            console.warn("[spark] table data", e);
            return start();
          }
        }
        try {
          start(parse2(src));
        } catch (e) {
          console.warn("[spark] table data", e);
          start();
        }
      };
      table.classList.add("spark-table--on");
      if (o.stack) table.classList.add("spark-table--stack");
      const size = /^\d+$/.test(o.height) ? o.height + "px" : o.height;
      let unit = table, tw = null, dt = null, unitStyle = null;
      if (sh) {
        if (parent.classList.contains("table-wrap")) unit = parent;
        else {
          tw = mk("div", "table-wrap");
          parent.insertBefore(tw, table);
          tw.append(table);
          unit = tw;
        }
        unitStyle = unit.getAttribute("style");
        if (o.height) unit.style.maxHeight = size;
        if (o.sticky || o.height) table.classList.add("table-sticky-head");
        dt = mk("div", "dt");
        unit.before(dt);
        dt.append(bar, unit, pager);
        dt.after(live);
      } else {
        if (o.height) {
          wrap = mk("div", "spark-table__wrap");
          wrap.style.maxHeight = size;
          parent.insertBefore(wrap, table);
          wrap.append(table);
          unit = wrap;
        }
        if (o.sticky || o.height) table.classList.add("spark-table--sticky");
        unit.before(bar);
        unit.after(pager, live);
      }
      bar.hidden = pager.hidden = true;
      const stat = [on(el, "spark:data", (e) => start(e.detail))];
      load();
      return () => {
        dead = true;
        offs.forEach((f) => f());
        stat.forEach((f) => f());
        table.innerHTML = saved;
        table.className = cls0;
        bar.remove();
        pager.remove();
        live.remove();
        if (wrap) {
          wrap.before(table);
          wrap.remove();
        }
        if (dt) {
          dt.before(unit);
          dt.remove();
          unitStyle === null ? unit.removeAttribute("style") : unit.setAttribute("style", unitStyle);
          if (tw) {
            tw.before(table);
            tw.remove();
          }
        }
        el.removeAttribute("data-spark-rows");
      };
    }
  };

  // src/ui/timeline.js
  var LAYOUTS = ["vertical", "alternate", "horizontal"];
  var timeline_default = {
    name: "timeline",
    selector: ".spark-timeline",
    defaults: { layout: "vertical", reveal: true, progress: false, threshold: 0.2 },
    init(el, o) {
      const items = [...el.querySelectorAll(":scope > .spark-timeline__item")];
      if (!items.length) return;
      const layout = LAYOUTS.includes(o.layout) ? o.layout : "vertical";
      const cls0 = el.getAttribute("class"), role0 = el.getAttribute("role");
      const added = [], shClass = [], offs = [], saved = items.map((i) => i.getAttribute("role"));
      const sh = shineWidgets();
      el.classList.add("spark-timeline--on");
      if (sh) el.classList.add("timeline", ...layout === "alternate" ? ["timeline-alt"] : layout === "horizontal" ? ["timeline-horizontal"] : []);
      else el.classList.add("spark-timeline--own", "spark-timeline--" + layout);
      if (el.tagName !== "OL" && el.tagName !== "UL") el.setAttribute("role", "list");
      items.forEach((it) => {
        if (it.tagName !== "LI") it.setAttribute("role", "listitem");
        const m = document.createElement("span");
        m.className = "spark-timeline__marker" + (sh ? " timeline-marker" : "");
        m.setAttribute("aria-hidden", "true");
        if (it.dataset.sparkIcon) m.textContent = it.dataset.sparkIcon;
        else m.classList.add("is-dot");
        if (sh) {
          it.classList.add("timeline-item");
          shClass.push(it);
          it.querySelectorAll(":scope > .spark-timeline__time").forEach((x) => {
            x.classList.add("timeline-date");
            shClass.push(x);
          });
          it.querySelectorAll(":scope > .spark-timeline__body").forEach((x) => {
            x.classList.add("timeline-body");
            shClass.push(x);
          });
        }
        it.prepend(m);
        added.push(m);
      });
      if (o.reveal && motionOK()) {
        el.classList.add("spark-timeline--reveal");
        items.forEach((it, i) => {
          it.style.setProperty("--i", i % 6);
          it.classList.add("spark-timeline__pending");
          offs.push(onVisible(it, (v, e) => {
            if (!v) return;
            it.classList.remove("spark-timeline__pending");
            it.classList.add("is-in");
          }, "0px 0px -8% 0px", o.threshold));
        });
      }
      if (o.progress && !sh && layout !== "horizontal") {
        offs.push(onScroll((y, h) => {
          const r = el.getBoundingClientRect(), p = Math.max(0, Math.min(1, (h / 2 - r.top) / (r.height || 1)));
          return () => el.style.setProperty("--spark-timeline-progress", p.toFixed(3));
        }));
      }
      return () => {
        offs.forEach((f) => f());
        added.forEach((m) => m.remove());
        items.forEach((it, i) => {
          it.classList.remove("spark-timeline__pending", "is-in");
          it.style.removeProperty("--i");
          saved[i] === null ? it.removeAttribute("role") : it.setAttribute("role", saved[i]);
        });
        el.style.removeProperty("--spark-timeline-progress");
        shClass.forEach((x) => x.classList.remove("timeline-item", "timeline-date", "timeline-body"));
        cls0 === null ? el.removeAttribute("class") : el.setAttribute("class", cls0);
        role0 === null ? el.removeAttribute("role") : el.setAttribute("role", role0);
      };
    }
  };

  // src/spark-entry.js
  var defs = [calendar_default, lottie_default, rating_default, steps_default, table_default, timeline_default];
  if (window.Spark) window.Spark.define(defs);
  else (window.SparkPending = window.SparkPending || []).push(...defs);
})();
