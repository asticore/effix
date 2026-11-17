/* Docs data for border (not bundled). */
module.exports = {
  title: 'Animated border',
  group: 'Buttons & borders',
  summary: 'Spinning, tracing, glowing or shifting gradient borders for buttons, cards or anything. Optional loading mode driven by clicks.',
  classes: [
    ['spark-border-spin', 'Rotating conic-gradient ring.'],
    ['spark-border-trace', 'A short comet segment travelling around the border (loading indicator).'],
    ['spark-border-glow', 'Gradient ring with a pulsing glow.'],
    ['spark-border-gradient', 'Slowly shifting linear gradient border.'],
    ['spark-border-wipe', 'Border draws itself around the edges on hover / keyboard focus (straight edges).'],
    ['spark-border-pulse', 'Expanding ring pulse radiating from the element (loops).'],
  ],
  options: [
    ['data-spark-colors', '(Shine primary/accent/secondary)', 'Gradient colors, e.g. #f0f|#0ff|#f0f (end with the first color for a seamless loop).'],
    ['data-spark-speed', '0', 'Seconds per cycle; 0 = CSS default (3s).'],
    ['data-spark-width', '0', 'Border width in px; 0 = CSS default (2px).'],
    ['data-spark-loading', '', '"" = always animate · click = animate only while loading (after a click) · always.'],
    ['data-spark-timeout', '0', 'With loading=click: auto-stop after ms (0 = until spark:done).'],
  ],
  vars: [
    ['--spark-border-colors', 'primary, accent, secondary', 'Comma list of gradient colors.'],
    ['--spark-border-color', 'var(--sh-tone, --sh-primary)', 'Single color for trace and glow.'],
    ['--spark-border-width', '2px', 'Ring thickness.'],
    ['--spark-border-speed', '3s', 'Cycle duration.'],
    ['--spark-border-radius', 'inherit', 'Ring radius (inherits Shine button/card radius).'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4 p-6">
  <div class="card p-6 spark-border-spin">Spinning border</div>
  <div class="card p-6 spark-border-glow">Glow pulse</div>
  <div class="card p-6 spark-border-gradient">Shifting gradient</div>
  <div class="stack gap-3 p-6"><button class="btn spark-border-trace" data-spark-loading="click" data-spark-timeout="3000">Click to load</button>
  <button class="btn spark-border-spin" data-spark-speed="1.5">Fast spin</button>
  <button class="btn spark-border-wipe">Hover: wipe</button>
  <button class="btn spark-border-pulse">Pulse ring</button></div>
</div>` },
  ],
};
