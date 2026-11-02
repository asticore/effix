/* Docs data for draw (not bundled). */
module.exports = {
  title: 'SVG draw',
  group: 'Scroll',
  summary: 'Draws SVG strokes in, either scrubbed by scroll or played once when visible. Fully drawn without JS or with reduced motion.',
  classes: [['efx-draw', 'On an <svg>, or a container holding one. Paths, lines, circles, rects… are drawn (or only [data-efx-draw-item] ones).']],
  options: [
    ['data-efx-mode', 'scroll', 'scroll (tied to scroll progress) · view (plays once when visible).'],
    ['data-efx-duration', '1500', 'View mode: draw time in ms.'],
    ['data-efx-start', '0', 'Scroll mode: progress (0–1) where drawing begins.'],
    ['data-efx-end', '0.7', 'Scroll mode: progress (0–1) where drawing finishes.'],
    ['data-efx-stagger', '0', 'Per-shape offset: ms in view mode, progress fraction in scroll mode.'],
    ['data-efx-fill', 'false', 'Fade the fill in at the end of the drawing.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4 p-6 items-center" style="min-height:300px">
  <svg class="efx-draw" data-efx-mode="view" data-efx-stagger="300" data-efx-duration="1600" viewBox="0 0 200 100" width="100%" height="140" fill="none" stroke="currentColor" stroke-width="3">
    <path d="M10 80 C 40 10, 70 10, 100 50 S 160 90, 190 20"/>
    <circle cx="100" cy="50" r="22"/>
    <rect x="20" y="20" width="40" height="30" rx="6"/>
  </svg>
  <svg class="efx-draw tone-primary" data-efx-fill data-efx-mode="view" data-efx-duration="2000" viewBox="0 0 100 100" width="100%" height="140" fill="none" stroke="currentColor" stroke-width="3">
    <polygon points="50,8 61,38 93,38 67,57 77,90 50,70 23,90 33,57 7,38 39,38"/>
  </svg>
</div>` },
  ],
};
