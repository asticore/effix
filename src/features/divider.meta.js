/* Docs data for divider (not bundled). */
module.exports = {
  title: 'Shape dividers',
  group: 'Sections',
  summary: 'Animated SVG dividers (waves, clouds, mountains, drips…) generated inline and colored to match the neighbouring section.',
  classes: [['spark-divider', 'Placeholder block; JS fills it with an SVG. Shapes: wave, waves, tilt, curve, triangle, arrow, zigzag, clouds, mountains, drips (hangs from the top), steps, spikes, sawtooth, chevron, swoosh, leaves, hills. Or draw your own with data-spark-path.']],
  options: [
    ['data-spark-shape', 'wave', 'wave · waves · tilt · curve · triangle · arrow · zigzag · clouds · mountains · drips · steps · spikes · sawtooth · chevron · swoosh · leaves · hills, or any registered divider-shape'],
    ['data-spark-color', '', 'Fill color; empty = --spark-divider-color or Shine --sh-bg.'],
    ['data-spark-height', '80', 'Height in px.'],
    ['data-spark-flip', 'false', 'Mirror horizontally.'],
    ['data-spark-invert', 'false', 'Mirror vertically (for dividers at the top of a section).'],
    ['data-spark-animate', 'none', 'none · drift (periodic shapes scroll sideways) · layers (3 drifting copies) · float (bob). Non-periodic shapes fall back to float.'],
    ['data-spark-speed', '12', 'Seconds per drift loop.'],
    ['data-spark-path', '', 'Custom SVG path data in a 1200x120 viewBox (e.g. "M0,60 C300,0 700,120 1200,40 L1200,120 L0,120 Z"); overrides shape, not periodic (drift falls back to float).'],
    ['data-spark-position', '', 'top · bottom = absolutely placed on the parent section edge; empty = normal block.'],
  ],
  extend: [
    ['divider-shape', '{ periodic: 0|1, layers: [[y0, side, tile(ox) -> "L x,y…"]], ops?: [opacity…] }', 'Each layer is an SVG path in a 1200x120 viewBox: it starts at M0,y0, tile(ox) returns the path segments for one 1200-wide tile starting at x offset ox (periodic shapes must end at the same y they start so tiles join), side b|t = filled below|above. periodic 1 lets animate=drift/layers scroll it.'],
  ],
  extendExample: `<script>
window.SparkConfig = { extend(E) {
  E.add('divider-shape', 'saw', { periodic: 1, layers: [[100, 'b', ox => { let d = ''; for (let i = 0; i < 10; i++) d += 'L' + (ox + i * 120 + 100) + ',30L' + (ox + i * 120 + 120) + ',100'; return d; }]] });
} };
</script>
<section style="position:relative;height:160px;background:#4f46e5"><div class="spark-divider" data-spark-shape="saw" data-spark-position="bottom" data-spark-color="#fff"></div></section>`,
  vars: [['--spark-divider-color', 'var(--sh-bg)', 'Fill color (use the next section\'s background).']],
  examples: [
    { html: `<section class="p-6 tone-primary" style="position:relative;height:280px;overflow:hidden;background:var(--sh-primary,#4f46e5);color:#fff">
  <h3>Wavy section</h3><p>Dividers drift along the bottom edge.</p>
  <div class="spark-divider" data-spark-shape="waves" data-spark-animate="drift" data-spark-position="bottom" data-spark-height="90" data-spark-color="#fff"></div>
</section>` },
    { html: `<section class="p-6" style="position:relative;height:300px;overflow:hidden;background:#0f172a;color:#fff">
  <h3>New shapes</h3><p>hills drift; the white edge is a custom data-spark-path.</p>
  <div class="spark-divider" data-spark-shape="hills" data-spark-animate="drift" data-spark-position="bottom" data-spark-height="90" data-spark-color="#6366f1"></div>
  <div class="spark-divider" data-spark-path="M0,70 C200,0 400,120 700,60 S1050,10 1200,50 L1200,120 L0,120 Z" data-spark-position="bottom" data-spark-height="45" data-spark-color="#fff"></div>
</section>` },
  ],
};
