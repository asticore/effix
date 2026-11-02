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
    ['data-efx-shapes', 'square|circle|strip', 'Particle shapes.'],
    ['data-efx-origin', '', '"x% y%" of the viewport; empty = pointer / element center.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="cluster gap-4 p-6" style="min-height:200px;align-items:center;justify-content:center">
  <button class="btn efx-confetti">Celebrate</button>
  <button class="btn efx-confetti" data-efx-count="150" data-efx-spread="140" data-efx-colors="#f43f5e|#facc15|#22c55e">Big burst</button>
</div>` },
  ],
};
