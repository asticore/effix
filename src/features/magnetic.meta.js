/* Docs data for magnetic (not bundled). */
module.exports = {
  title: 'Magnetic',
  group: 'Pointer',
  summary: 'Pulls a button or element toward the pointer as it approaches, then springs back. Fine pointers and motion-OK only.',
  classes: [
    ['spark-magnetic', 'Make this element magnetic.'],
  ],
  options: [
    ['data-spark-strength', '0.3', 'Fraction of the pointer offset applied.'],
    ['data-spark-radius', '120', 'Activation distance (px) beyond the element edge.'],
    ['data-spark-max', '24', 'Max displacement in px.'],
  ],
  vars: [
    ['--spark-mx / --spark-my', 'set by JS', 'Current offset.'],
  ],
  examples: [
    { html: `<div class="cluster gap-4 p-6" style="min-height:200px;align-items:center;justify-content:center">
  <button class="btn spark-magnetic">Magnetic</button>
  <button class="btn spark-magnetic" data-spark-strength="0.6" data-spark-max="40" data-spark-radius="180">Strong pull</button>
</div>` },
  ],
};
