<p align="center">
  <a href="https://github.com/asticore/effix">
    <img src="docs/logo.svg" alt="Effix logo" width="88" height="88">
  </a>
</p>

<h1 align="center">Effix</h1>

<p align="center">
  <strong>JavaScript effects you apply with classes: particles, parallax, tilt, magnetic buttons, rotating borders, shape dividers, carousels, popups and more.</strong>
  <br>
  Built to work with <a href="https://github.com/asticore/shine">Shine CSS</a>. Only the features on the page start. ~20 KB gzipped for all 25.
  <br>
  <br>
  <a href="https://asticore.github.io/effix/docs/"><strong>Live docs &amp; playground</strong></a>
  ·
  <a href="#quick-start">Quick start</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="https://github.com/asticore/effix/issues">Report a bug</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/gzip-16.0%20KB%20JS%20%2B%204.1%20KB%20CSS-4f46e5" alt="Size: 16.0 KB JS + 4.1 KB CSS gzip">
  <img src="https://img.shields.io/badge/core-2.3%20KB-16a34a" alt="Core 2.3 KB">
  <img src="https://img.shields.io/badge/dependencies-0-16a34a" alt="Zero dependencies">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
</p>

---

## Why Effix

[Shine](https://github.com/asticore/shine) does styling with **no JavaScript**: buttons, cards, modals, carousels, tooltips and colors.
Some effects can't be done in CSS alone. Canvas particles, pointer tracking, scroll math, timers and focus handling all need code.
**Effix is that code.** It works the same way Shine does:

| | Shine | Effix |
|---|---|---|
| Turn it on | `class="btn"` | `class="efx-tilt"` |
| Tune it | `data-radius="3"` | `data-efx-max="15"` |
| Restyle it | `--sh-primary` | `--efx-color`, which falls back to `--sh-tone` and then `--sh-primary` |

Effix reads Shine's tokens. `tone-danger` and `--sh-primary` recolor particles, borders, progress bars and cursors too.
Without Shine, Effix uses its own indigo default.

## Quick start

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/asticore/shine@main/dist/shine.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/asticore/effix@main/dist/effix.min.css">
<script src="https://cdn.jsdelivr.net/gh/asticore/effix@main/dist/effix.min.js" defer></script>
```

You don't need to call anything. Add classes:

```html
<section class="section efx-particles" data-efx-count="60" data-efx-links="true">
  <h1 class="efx-split" data-efx-by="letter">Hello</h1>
  <a class="btn btn-lg efx-magnetic efx-border-spin" href="#go">Get started</a>
</section>

<div class="efx-divider" data-efx-shape="waves" data-efx-animate="drift"></div>

<div class="efx-stagger grid md:grid-cols-3 gap-4">
  <div class="card efx-reveal" data-efx-reveal="fade-up">One</div>
  <div class="card efx-reveal" data-efx-reveal="zoom">Two</div>
  <div class="card efx-tilt" data-efx-glare="true">Three</div>
</div>
```

### npm

```bash
npm i effix shine-css
```

```js
import 'shine-css';
import 'effix/css';
import Effix from 'effix';          // full bundle, starts itself
```

Or import only the features you use. Your bundler drops the rest:

```js
import { define, init } from 'effix/core';
import reveal from 'effix/features/reveal';
import particles from 'effix/features/particles';

define(reveal, particles);
init();
```

## How it stays fast

- **Only features on the page start.** When the page loads, the core runs one `querySelectorAll` per feature. A missing feature costs nothing.
- **Heavy features are lazy.** Particles only start when they come near the viewport. Every animation loop pauses when it scrolls off-screen or the tab is hidden.
- **Shared observers.** All reveal, sticky and parallax elements share one `IntersectionObserver` and one passive, rAF-throttled scroll loop. Elements don't get their own.
- **Tiny core.** The core is 2.3 KB gzip. Each feature adds 0.5 to 1.9 KB. Custom builds can cut it further: `node build.js --only=reveal,tilt`.
- **Accessible defaults.**
  - Reduced-motion users see the static end state.
  - Pointer effects only run on mouse or trackpad.
  - Content stays visible without JS.
  - Dialogs and carousels support the keyboard and screen readers.

## Features

| Group | Feature | Classes | gzip |
|---|---|---|---|
| Scroll | Reveal on scroll | `efx-reveal` `efx-stagger` | 0.6 KB |
| Scroll | Parallax | `efx-parallax` | 0.6 KB |
| Scroll | Counter (count-up) | `efx-counter` | 0.6 KB |
| Scroll | Marquee / ticker | `efx-marquee` | 0.9 KB |
| Scroll | Scroll progress bar | `efx-progress` | 0.6 KB |
| Scroll | Sticky header (stuck / hide on scroll / shrink) | `efx-sticky` | 0.7 KB |
| Scroll | Scrollspy | `efx-scrollspy` | 0.8 KB |
| Scroll | Back to top | `efx-totop` | 0.5 KB |
| Text | Typed / rotating words | `efx-typed` | 0.9 KB |
| Text | Split text (letter / word stagger) | `efx-split` | 0.9 KB |
| Buttons & borders | Rotating, tracing, glowing and gradient borders, plus a click-to-load state | `efx-border-spin` `efx-border-trace` `efx-border-glow` `efx-border-gradient` | 1.2 KB |
| Background | Particles (repel, attract, connect, links) | `efx-particles` | 1.6 KB |
| Pointer | Tilt (+ glare) | `efx-tilt` | 0.8 KB |
| Pointer | Magnetic | `efx-magnetic` | 0.6 KB |
| Pointer | Spotlight | `efx-spotlight` | 0.7 KB |
| Pointer | Ripple | `efx-ripple` | 0.7 KB |
| Pointer | Custom cursor | `efx-cursor` | 1.1 KB |
| Sections | Animated shape dividers (12 shapes, drift / layers / float) | `efx-divider` | 1.9 KB |
| Components | Popup triggers for Shine's `<dialog class="modal">` (delay, scroll, exit intent, frequency) | `efx-popup` | 0.7 KB |
| Components | Lightbox | `efx-lightbox` | 1.6 KB |
| Components | Carousel controls for Shine's `.carousel` (arrows, dots, autoplay, fade) | `efx-carousel` | 1.8 KB |
| Components | Before / after compare | `efx-compare` | 1.3 KB |
| Components | Copy to clipboard | `efx-copy` | 0.6 KB |
| Components | Schedule visibility (date, weekday and hour windows) | `efx-schedule` | 0.8 KB |
| Time | Countdown | `efx-countdown` | 1.2 KB |

The [docs](https://asticore.github.io/effix/docs/) list every option, CSS variable and event. Every example there is live, and you can edit it to try options.

## Customising

```html
<!-- behaviour: data-efx-* -->
<div class="efx-particles" data-efx-count="80" data-efx-interact="connect" data-efx-color="#f43f5e,#8b5cf6"></div>

<!-- look: --efx-* (or Shine tokens) -->
<button class="btn tone-accent efx-border-spin" style="--efx-border-speed:1.5s; --efx-border-width:3px">Loading…</button>
```

Global knobs: `--efx-duration`, `--efx-ease`, `--efx-distance`, `--efx-color`. Set them on `:root`, a section, or one element.

### Page switches

| Switch | Effect |
|---|---|
| `<html data-efx-manual>` | Don't auto-start. Call `Effix.init()` yourself. |
| `<html data-efx-observe>` | Start features on elements added later (SPAs, visual editors). |
| `<html data-efx-reduce>` | Force reduced motion. |
| `<html data-efx-margin="200px">` | How early lazy features start before they enter the viewport. |
| `window.EffixConfig = { auto: false, observe: true }` | The same switches from JS. Set it before the script loads. |

## Visual editors and SPAs

```js
Effix.observe();              // auto start/clean up nodes as the editor adds/removes blocks
Effix.refresh(block);         // re-read data-efx-* after a setting changed
Effix.destroy(block);         // remove listeners, timers and injected nodes
Effix.init(container);        // start features inside a container
Effix.define({ name, selector, defaults, init });   // add your own feature
```

Each feature maps onto a block setting. The class picks the effect and each `data-efx-*` attribute is one field in the settings panel. A builder can store the settings as attributes and call `Effix.refresh(el)` when one changes.

## Build

```bash
npm install
npm run build                                   # dist/ + docs/index.html, fails over the gzip budget
node build.js --only=reveal,parallax,tilt       # custom build -> dist/custom/
node build.js --exclude=cursor,popup
npm test                                        # Playwright smoke test (chromium firefox webkit)
```

| File | What |
|---|---|
| `dist/effix.min.js` | Minified bundle: `window.Effix`, starts itself |
| `dist/effix.esm.js` | ES module build |
| `dist/effix.min.css` | Styles, in `@layer effix` (ordered after Shine's layers) |
| `src/core.js`, `src/features/*.js` | ES sources for per-feature imports |

## Contributing

Read [CONVENTIONS.md](CONVENTIONS.md) and [CONTRIBUTING.md](CONTRIBUTING.md). To add a feature, create `src/features/<name>.js` (+ `.css`, + `.meta.js` for the docs). The build and the docs find new files automatically.

## License

[MIT](LICENSE)
