/* Docs data for sparkles (not bundled). */
module.exports = {
  title: 'Sparkles',
  group: 'Text',
  summary: 'Twinkling stars scattered around any element: a headline, a button, a badge. Each star scales and rotates in and out, then reappears somewhere new. Off with reduced motion; pauses off-screen.',
  classes: [
    ['spark-sparkles', 'Host element. Sparkles are drawn in an overlay (no pointer events) that may overflow the element a little.'],
  ],
  options: [
    ['data-spark-count', '10', 'Number of stars (max 60).'],
    ['data-spark-color', '(theme + gold)', 'One color or a list separated by |.'],
    ['data-spark-size-min', '8', 'Smallest star in px.'],
    ['data-spark-size-max', '18', 'Largest star in px.'],
    ['data-spark-speed', '1', 'Twinkle speed multiplier.'],
    ['data-spark-shape', 'star', 'Name of a registered sparkle-shape.'],
  ],
  extend: [
    ['sparkle-shape', 'fn(size) -> svg markup string or Node', 'Draw with fill="currentColor" so the star takes its color from data-spark-color.'],
  ],
  extendExample: `<script>
window.SparkConfig = { extend(E) {
  E.add('sparkle-shape', 'dot', s => '<svg viewBox="0 0 10 10" width="' + s / 2 + '" height="' + s / 2 + '"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg>');
} };
</script>
<span class="spark-sparkles" data-spark-shape="dot" data-spark-color="#38bdf8|#a855f7"><strong>Dots instead</strong></span>`,
  vars: [
    ['--spark-color', 'Shine tone / primary', 'Used for the first color when data-spark-color is empty.'],
  ],
  examples: [
    { html: `<div class="stack gap-8 p-6" style="align-items:center">
  <h2><span class="spark-sparkles" data-spark-count="14">Make it sparkle</span></h2>
  <button class="btn spark-sparkles" data-spark-color="#fde68a|#fff|#f59e0b" data-spark-count="8">Upgrade now</button>
</div>` },
  ],
};
