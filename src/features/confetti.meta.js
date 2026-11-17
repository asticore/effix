/* Docs data for confetti (not bundled). */
module.exports = {
  title: 'Confetti',
  group: 'Buttons & borders',
  summary: 'Confetti burst from a button or any element, drawn on one shared fixed canvas that exists only while particles are alive. Listens for click, view or spark:done; any element can also dispatch a bubbling spark:confetti event. Reduced motion: a tiny scale pulse instead.',
  classes: [
    ['spark-confetti', 'Burst confetti from this element.'],
  ],
  options: [
    ['data-spark-trigger', 'click', 'click · view · done (spark:done from border loading, copy, countdown).'],
    ['data-spark-count', '80', 'Particles per burst.'],
    ['data-spark-spread', '70', 'Fan angle in degrees (centered upward).'],
    ['data-spark-velocity', '45', 'Launch speed.'],
    ['data-spark-gravity', '1', 'Gravity multiplier.'],
    ['data-spark-colors', '', 'red|#0af|… (default: Shine primary, accent, success, warning, danger).'],
    ['data-spark-shapes', 'square|circle|strip', 'square · circle · strip, or any registered confetti-shape.'],
    ['data-spark-origin', '', '"x% y%" of the viewport; empty = pointer / element center.'],
  ],
  extend: [
    ['confetti-shape', '(ctx, size, piece) => void', 'Paint centered on 0,0 (fillStyle set, already translated/rotated); size is in canvas px; call ctx.fill()/fillRect yourself. piece = { x, y, rot, c, shape }.'],
  ],
  extendExample: `<script>
window.SparkConfig = { extend(E) {
  E.add('confetti-shape', 'heart', (c, s) => { c.beginPath(); c.moveTo(0, s / 2); c.bezierCurveTo(-s, -s / 6, -s / 3, -s, 0, -s / 4); c.bezierCurveTo(s / 3, -s, s, -s / 6, 0, s / 2); c.fill(); });
} };
</script>
<button class="btn spark-confetti" data-spark-shapes="heart|circle" data-spark-colors="#f43f5e|#fb7185">Love</button>`,
  vars: [],
  examples: [
    { html: `<div class="cluster gap-4 p-6" style="min-height:200px;align-items:center;justify-content:center">
  <button class="btn spark-confetti">Celebrate</button>
  <button class="btn spark-confetti" data-spark-count="150" data-spark-spread="140" data-spark-colors="#f43f5e|#facc15|#22c55e">Big burst</button>
</div>` },
  ],
};
