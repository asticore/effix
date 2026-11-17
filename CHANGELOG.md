# Changelog

## v0.4.0 — Effix is now Spark

The project and repository are renamed from **Effix** to **Spark** (github.com/asticore/spark). Nothing else changes in behaviour.

### Migration (breaking)
| Before | After |
|---|---|
| `effix.auto.min.js`, `effix.min.js`, `effix-charts.min.js` … | `spark.auto.min.js`, `spark.min.js`, `spark-charts.min.js` … |
| `class="efx-tilt"` | `class="spark-tilt"` |
| `data-efx-count="40"` | `data-spark-count="40"` |
| `--efx-color` | `--spark-color` |
| `window.Effix`, `window.EffixConfig` | `window.Spark`, `window.SparkConfig` |
| events `efx:data`, `efx:select`, `efx:ready` … | `spark:data`, `spark:select`, `spark:ready` … |
| npm `effix` (never published) | `@asticore/spark` |
| CSS layer `effix` | CSS layer `spark` |

Docs: https://asticore.github.io/spark/docs/

## Unreleased

Data widgets for the Engage builder (issues #1–#8). 119 features in total.

- **`spark-table`** — sort, search, per-column filter, paging, sticky header / scroll height, column visibility, row selection (`change` event), responsive stack, CSV download, empty state; data from markup, `data-spark-data` (JSON/CSV/URL) or `spark:data`.
- **Charts** — `data-spark-csv` (inline, `<script type="text/csv">` or URL) and `Spark.chartSource(name, (push, el) => …)` with `data-spark-live` for live data on every chart; `data-spark-stacked` on `chart-combo`. `Spark.parseCSV` added to the core.
- **`spark-chart-polar`** — polar area chart (`chart-pie` `data-spark-rose` stays the donut/rose variant).
- **`spark-rating`** — read-only or input, half stars, `change` event, hidden form field.
- **`spark-calendar`** — month view, JSON / ICS events, single-date or range picker, locale and first day of week.
- **`spark-steps`** — stepper with progress, validation hook, URL hash sync.
- **`spark-lottie`** — lazy dotLottie player: the player library is fetched only when an element nears the viewport; autoplay, loop, visible / hover / click / scroll triggers, reduced-motion still frame.
- **`spark-timeline`** — vertical, alternating and horizontal content timeline with icons and reveal on scroll.
- The data widgets (table, rating, calendar, steps, timeline, lottie) ship as their own **`spark-ui`** add-on (`src/ui/`, `spark-ui.min.js` + `.css`, budget 24 KB JS / 8 KB CSS) so the effects bundle stays within 60 / 14 KB. The auto-loader is unchanged.
- When Shine's optional widgets stylesheet (`shine-widgets.css`) is on the page, these widgets emit Shine's markup and ARIA hooks (`.dt`, `.stepper`/`.step`, `.timeline*`, `.calendar*`, `.rating`/`.rating-input`; `aria-sort`, `aria-selected`, `aria-current`) and leave the look to Shine; without it they use their own `spark-*` classes and CSS.

## v0.3.0

d3-gallery visualisations and a leaner loading model. 112 features in total.

### Loading
- The auto-loader (`spark.auto.min.js`) now fetches **one small file per chart, diagram or visualisation** instead of whole add-on bundles. Chart types share one toolkit file (`features/_chartkit.min.js`) fetched once.
- `build.js` fails if any single feature file exceeds 8 KB gzip (largest today: 5.6 KB). All-in-one bundles remain optional.

### New visualisations (`spark-viz-*`)
- **Network** — force-directed graph with drag, zoom/pan and neighbour highlighting.
- **Chord** and **arc** diagrams for relationships and flows.
- **Circle packing** with click-to-zoom.
- **Distribution** — density, violin, ridgeline or beeswarm from raw samples (KDE).
- **Parallel coordinates** with axis brushing.
- **Rank** — bump or slope charts.
- **Marimekko** mosaic.
- **Word cloud** from weighted words or raw text.
- **Map** — choropleth, bubbles and routes from your own GeoJSON (no map data bundled).

### New chart options
- Bar: `lollipop` style, `radial` (circular barplot), `normalize` (100% stacked), `diverging`.
- Line: `stream` (streamgraph). Scatter: `connected`.

## v0.2.0

Motion-video ideas (from AI motion-prompt galleries) turned into web features. 102 features in total.

### New
- **Reel** (`spark-reel`): an HTML scene sequencer for showreels and product explainers, with timed scenes, fade/slide/wipe/zoom/cut transitions, effects that replay per scene, play/pause, clickable progress segments and keyboard control.
- **Kinetic typography** (`spark-kinetic`): one word per beat with punch, slide, spin, blur or split transitions; the full sentence stays available to screen readers.
- **Lyrics & captions** (`spark-lyrics`): synced to `<audio>`/`<video>` from JSON or WebVTT tracks, with karaoke word fill, auto-scroll inside the box and click-to-seek.
- **Audio visualizer** (`spark-audio`): bars, wave, circle, scope or dots from the media's sound, plus a `--spark-level` CSS variable so any element can pulse to the beat. Custom visualizers via the `audio-viz` plugin.
- **ASCII art** (`spark-ascii`): renders images, video, canvas or big text as animated ASCII.
- **Popout** (`spark-popout`): "poster breaking its frame" — a cut-out spills past the card with layered depth on hover or scroll.

### Changed
- Full effects bundle guard raised to 60 KB JS / 14 KB CSS (the auto-loader still ships only what a page uses).

## v0.1.0 — first release

Spark is the JavaScript partner to [Shine CSS](https://github.com/asticore/shine): effects, charts and diagrams applied with classes, tuned with `data-spark-*` attributes and styled through Shine's tokens.

### Highlights
- **96 features** — 68 effects, 19 charts, 9 diagrams.
- **One-tag auto-loader** (`spark.auto.min.js`, 4.4 KB gzip) fetches only the features on the page; every effect is also a standalone file in `dist/features/`.
- **Separate add-ons** for charts (30.5 KB gzip) and diagrams (19.1 KB gzip), so effect-only pages never download them.
- **Accessible by default**: reduced motion gives static end states, pointer effects need a fine pointer, content is visible without JS, keyboard and ARIA on interactive pieces.
- **Plugin registry** (`Spark.add`) for particle/divider/confetti/trail/sparkle shapes, ambient modes, easings, chart number formats and SVG shapes; `Spark.define` for whole new features or chart types.
- **Responsive gating** with `data-spark-media`, live data with `Spark.setData`, DOM watching for SPAs and visual editors (`data-spark-observe`, `Spark.refresh`).
- **React, Vue and Svelte helpers** (`@asticore/spark/react`, `@asticore/spark/vue`, `@asticore/spark/svelte`).
- **Docs portal with live, editable demos** and an interactive **playground** that generates the HTML and `<head>` tags.

### Effects
Animations with hover/focus/active/click/load/scroll triggers and advanced stagger · reveal · parallax · scroll scrub (incl. centre peak) · pinned horizontal scroll · stacking cards · scroll image sequence · SVG draw · motion path · progress · sticky header · scrollspy · chapter indicator · back to top · counter · odometer · marquee · typed · split · scramble · morph · text fill · proximity · glitch · sparkles · animated borders (spin, trace, glow, gradient, wipe, pulse) · confetti · ripple · magnetic · tilt (+ gyro) · spotlight · mouse layers · cursor · trail · direction-aware fill · dim siblings · draggable · particles · ambient backgrounds (stars, warp, orbs, waves, snow, leaves, bubbles, grid, flicker, meteors, dots) · globe · shape dividers · beams · shape morph · image flip, distort, pixelate, mask, Ken Burns, zoom lens, lazy blur-up · carousel · lightbox · compare · popup · toast · nudge · feed · pricing toggle · shimmer/skeletons · spinners · collapse · copy · schedule · media · layout (FLIP filter/sort) · drag-scroll · page transitions.

### Charts
bar · line/area · combo · pie/donut/rose · funnel · gauge/ring · radar · sparkline · scatter/bubble · heatmap/calendar · treemap · sunburst · flow (Sankey) · progress · waterfall · candlestick · timeline/Gantt · box plot · histogram · bullet.

### Diagrams
quadrant · Venn · pyramid · cycle · tree/org chart/mind map · flow (flowchart, process, swimlane, architecture, state, ER/UML) · sequence · fishbone.
