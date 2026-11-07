# Effix conventions

Rules every feature follows. Read this before adding one.

## Goals
1. **Shine's JS partner.** [Shine](https://github.com/asticore/shine) is pure CSS. Effix only ships what *needs* JavaScript
   (canvas, pointer tracking, scroll math, timers, focus management) plus the small CSS each effect needs.
   Never re-implement something Shine already does with CSS (buttons, modals, carousel track, tooltips, colors, spacing).
2. **Only pay for what is on the page.** On boot the core runs one `querySelectorAll` per registered feature. Absent features
   cost nothing. Heavy features set `lazy: true` (initialised when first near the viewport) and pause their loops off-screen.
3. **Budget.** Effects bundle ≤ 52 KB gzip JS + 12 KB CSS (the auto-loader is the recommended path; the full bundle is for sites using many features), charts + diagrams add-on ≤ 36 KB JS + 5 KB CSS (`build.js` fails above). Core ≈ 2 KB. Aim for ≤ 1 KB gzip per feature.
4. **Zero runtime dependencies.** esbuild + Playwright are dev-only.

## Files
```
src/core.js                 registry, auto-boot, options, shared observers/loops
src/css/base.css            shared knobs (--efx-duration, --efx-ease, --efx-distance)
src/features/<name>.js      the feature (ES module, default export = definition)
src/features/<name>.css     optional CSS (build wraps everything in @layer effix)
src/features/<name>.meta.js docs data (CommonJS, never bundled) -> docs/index.html
```
Adding a file to `src/features/` is enough; `build.js` and `docs.js` discover it.

## Feature definition
```js
import { onVisible, motionOK, on } from '../core.js';
export default {
  name: 'tilt',                 // = file name
  selector: '.efx-tilt',        // what it claims
  lazy: false,                  // true for canvas/heavy setup
  defaults: { max: 10, glare: false },   // read from data-efx-max, data-efx-glare
  init(el, opts, Effix) {       // return a cleanup function that fully undoes init
    const off = on(el, 'pointermove', …);
    return () => { off(); el.style.transform = ''; };
  },
};
```
- Option keys are camelCase in `defaults`, kebab-case in HTML: `linkDistance` ↔ `data-efx-link-distance`.
  Type comes from the default: number, boolean (`""`/`true`/`1`/`on` = true), string, array (`a|b|c` or `a,b,c`).
- Cleanup must remove listeners, timers, rAF, observers, injected nodes and inline styles. `Effix.refresh(el)` = destroy + init.
- Use core helpers instead of private copies: `onVisible` (shared IntersectionObserver per rootMargin), `onScroll`
  (one shared passive scroll/resize rAF loop), `rafThrottle`, `on`, `motionOK`, `finePointer`, `themeColor`, `cssVar`.
- Never throw on bad input: fall back to defaults.

## Naming
- Main class: `efx-<name>`. Variant classes: `efx-<name>-<variant>` (e.g. `efx-border-spin`). State classes: `is-*` (`is-in`, `is-active`, `is-stuck`, `is-loading`).
- Options: `data-efx-<option>`. CSS knobs: `--efx-<thing>` read with fallbacks, never required.
- Injected elements get class `efx-<name>__<part>` and `aria-hidden="true"` when decorative.

## Colors & Shine tokens
Read colors at use-site with a Shine fallback chain:
```css
color: var(--efx-color, var(--sh-tone, var(--sh-primary, #6366f1)));
```
JS uses `themeColor(el)` for the same chain. Surfaces: `--sh-surface`, `--sh-bg`, `--sh-text`, `--sh-border`. Radius: `var(--sh-radius, .5rem)`.
Motion: `var(--efx-duration)` / `var(--efx-ease)`. Shine's `.tone-*` classes therefore recolor effix effects too.

## Accessibility & motion
- `motionOK()` false (OS reduced motion, or `<html data-efx-reduce>`) → render a static end state, no loops.
- Pointer effects only when `finePointer()`; never block touch scrolling.
- Content must be visible without JS: hide only after JS has claimed the element (e.g. `.efx-reveal-pending`).
- Interactive features: real buttons, `aria-*`, keyboard (Esc, arrows, Tab trap in dialogs), return focus.

## Style
2-space indent, ES2019+, no classes/`this` needed, short header comment with a usage example per file.

## Charts (`src/charts/`)
Charts ship as a separate add-on bundle (`effix-charts.min.js`) so effect-only pages never download them.
```
src/charts/_lib.js        shared toolkit: data parsing, scales, nice ticks, curves, arcs, tooltip, legend, keyboard, resize
src/charts/_lib.css       shared chart styles + entrance animation classes
src/charts/chart-<type>.js  one chart type (+ .css, + .meta.js)
```
- Name `chart-<type>`, selector `.efx-chart-<type>`, `lazy: true`, `defaults: { ...COMMON, ...own }`.
- `init` returns `chart(el, opts, draw)`. `draw(ctx)` paints into `ctx.g` and returns marks
  `[{ x, y, label, value, series, node, index, hit?, xOnly?, group?, html? }]`. The toolkit turns marks into tooltips,
  hover dimming, ←/→ keyboard focus, `efx:select` events and the screen-reader value list.
- Data: `data-efx-data` ("1,2,3", "1,2|3,4", JSON), `data-efx-labels`, `data-efx-names`, inline
  `<script type="application/json">`, or `data-efx-source="#table"` to read a Shine table. Live updates:
  `el.dispatchEvent(new CustomEvent('efx:data', { detail: { labels, series } }))`.
- Colors come from `ctx.colors` (Shine tones → `--efx-chart-1…7` → `data-efx-colors`). No hard-coded colors.
- `data-efx-background` must work: no axes, fill the element, sit behind its content. Any chart can then decorate a button, card or section.
- Entrance animation uses the toolkit classes (`efx-chart__grow`, `__grow-x`, `__draw` + `pathLength="1"`, `__fade`, `--i` stagger).
