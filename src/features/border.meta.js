/* Docs data for border (not bundled). */
module.exports = {
  title: 'Animated border',
  group: 'Buttons & borders',
  summary: 'Spinning, tracing, glowing or shifting gradient borders for buttons, cards or anything. Optional loading mode driven by clicks.',
  classes: [
    ['efx-border-spin', 'Rotating conic-gradient ring.'],
    ['efx-border-trace', 'A short comet segment travelling around the border (loading indicator).'],
    ['efx-border-glow', 'Gradient ring with a pulsing glow.'],
    ['efx-border-gradient', 'Slowly shifting linear gradient border.'],
    ['efx-border-wipe', 'Border draws itself around the edges on hover / keyboard focus (straight edges).'],
    ['efx-border-pulse', 'Expanding ring pulse radiating from the element (loops).'],
  ],
  options: [
    ['data-efx-colors', '(Shine primary/accent/secondary)', 'Gradient colors, e.g. #f0f|#0ff|#f0f (end with the first color for a seamless loop).'],
    ['data-efx-speed', '0', 'Seconds per cycle; 0 = CSS default (3s).'],
    ['data-efx-width', '0', 'Border width in px; 0 = CSS default (2px).'],
    ['data-efx-loading', '', '"" = always animate · click = animate only while loading (after a click) · always.'],
    ['data-efx-timeout', '0', 'With loading=click: auto-stop after ms (0 = until efx:done).'],
  ],
  vars: [
    ['--efx-border-colors', 'primary, accent, secondary', 'Comma list of gradient colors.'],
    ['--efx-border-color', 'var(--sh-tone, --sh-primary)', 'Single color for trace and glow.'],
    ['--efx-border-width', '2px', 'Ring thickness.'],
    ['--efx-border-speed', '3s', 'Cycle duration.'],
    ['--efx-border-radius', 'inherit', 'Ring radius (inherits Shine button/card radius).'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4 p-6">
  <div class="card p-6 efx-border-spin">Spinning border</div>
  <div class="card p-6 efx-border-glow">Glow pulse</div>
  <div class="card p-6 efx-border-gradient">Shifting gradient</div>
  <div class="stack gap-3 p-6"><button class="btn efx-border-trace" data-efx-loading="click" data-efx-timeout="3000">Click to load</button>
  <button class="btn efx-border-spin" data-efx-speed="1.5">Fast spin</button>
  <button class="btn efx-border-wipe">Hover: wipe</button>
  <button class="btn efx-border-pulse">Pulse ring</button></div>
</div>` },
  ],
};
