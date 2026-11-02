/* Docs data for confetti (not bundled). */
module.exports = {
  title: 'Confetti',
  group: 'Buttons & borders',
  summary: 'Confetti burst from a button or any element, drawn on one shared fixed canvas that exists only while particles are alive. Listens for click, view or efx:done; any element can also dispatch a bubbling efx:confetti event. Reduced motion: a tiny scale pulse instead.',
  classes: [
    ['efx-confetti', 'Burst confetti from this element.'],
  ],
  options: [
    ['data-efx-trigger', 'click', 'click · view · done (efx:done from border loading, copy, countdown).'],
    ['data-efx-count', '80', 'Particles per burst.'],
    ['data-efx-spread', '70', 'Fan angle in degrees (centered upward).'],
    ['data-efx-velocity', '45', 'Launch speed.'],
    ['data-efx-gravity', '1', 'Gravity multiplier.'],
    ['data-efx-colors', '', 'red|#0af|… (default: Shine primary, accent, success, warning, danger).'],
    ['data-efx-shapes', 'square|circle|strip', 'square · circle · strip, or any registered confetti-shape.'],
    ['data-efx-origin', '', '"x% y%" of the viewport; empty = pointer / element center.'],
  ],
  extend: [
    ['confetti-shape', '(ctx, size, piece) => void', 'Paint centered on 0,0 (fillStyle set, already translated/rotated); size is in canvas px; call ctx.fill()/fillRect yourself. piece = { x, y, rot, c, shape }.'],
  ],
  extendExample: `<script>
window.EffixConfig = { extend(E) {
  E.add('confetti-shape', 'heart', (c, s) => { c.beginPath(); c.moveTo(0, s / 2); c.bezierCurveTo(-s, -s / 6, -s / 3, -s, 0, -s / 4); c.bezierCurveTo(s / 3, -s, s, -s / 6, 0, s / 2); c.fill(); });
} };
</script>
<button class="btn efx-confetti" data-efx-shapes="heart|circle" data-efx-colors="#f43f5e|#fb7185">Love</button>`,
  vars: [],
  examples: [
    { html: `<div class="cluster gap-4 p-6" style="min-height:200px;align-items:center;justify-content:center">
  <button class="btn efx-confetti">Celebrate</button>
  <button class="btn efx-confetti" data-efx-count="150" data-efx-spread="140" data-efx-colors="#f43f5e|#facc15|#22c55e">Big burst</button>
</div>` },
  ],
};
