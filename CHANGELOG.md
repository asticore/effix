# Changelog

## v0.1.0 — first release

Effix is the JavaScript partner to [Shine CSS](https://github.com/asticore/shine): effects, charts and diagrams applied with classes, tuned with `data-efx-*` attributes and styled through Shine's tokens.

### Highlights
- **96 features** — 68 effects, 19 charts, 9 diagrams.
- **One-tag auto-loader** (`effix.auto.min.js`, 4.4 KB gzip) fetches only the features on the page; every effect is also a standalone file in `dist/features/`.
- **Separate add-ons** for charts (30.5 KB gzip) and diagrams (19.1 KB gzip), so effect-only pages never download them.
- **Accessible by default**: reduced motion gives static end states, pointer effects need a fine pointer, content is visible without JS, keyboard and ARIA on interactive pieces.
- **Plugin registry** (`Effix.add`) for particle/divider/confetti/trail/sparkle shapes, ambient modes, easings, chart number formats and SVG shapes; `Effix.define` for whole new features or chart types.
- **Responsive gating** with `data-efx-media`, live data with `Effix.setData`, DOM watching for SPAs and visual editors (`data-efx-observe`, `Effix.refresh`).
- **React, Vue and Svelte helpers** (`effix/react`, `effix/vue`, `effix/svelte`).
- **Docs portal with live, editable demos** and an interactive **playground** that generates the HTML and `<head>` tags.

### Effects
Animations with hover/focus/active/click/load/scroll triggers and advanced stagger · reveal · parallax · scroll scrub (incl. centre peak) · pinned horizontal scroll · stacking cards · scroll image sequence · SVG draw · motion path · progress · sticky header · scrollspy · chapter indicator · back to top · counter · odometer · marquee · typed · split · scramble · morph · text fill · proximity · glitch · sparkles · animated borders (spin, trace, glow, gradient, wipe, pulse) · confetti · ripple · magnetic · tilt (+ gyro) · spotlight · mouse layers · cursor · trail · direction-aware fill · dim siblings · draggable · particles · ambient backgrounds (stars, warp, orbs, waves, snow, leaves, bubbles, grid, flicker, meteors, dots) · globe · shape dividers · beams · shape morph · image flip, distort, pixelate, mask, Ken Burns, zoom lens, lazy blur-up · carousel · lightbox · compare · popup · toast · nudge · feed · pricing toggle · shimmer/skeletons · spinners · collapse · copy · schedule · media · layout (FLIP filter/sort) · drag-scroll · page transitions.

### Charts
bar · line/area · combo · pie/donut/rose · funnel · gauge/ring · radar · sparkline · scatter/bubble · heatmap/calendar · treemap · sunburst · flow (Sankey) · progress · waterfall · candlestick · timeline/Gantt · box plot · histogram · bullet.

### Diagrams
quadrant · Venn · pyramid · cycle · tree/org chart/mind map · flow (flowchart, process, swimlane, architecture, state, ER/UML) · sequence · fishbone.
