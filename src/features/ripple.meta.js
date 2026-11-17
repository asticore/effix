/* Docs data for ripple (not bundled). */
module.exports = {
  title: 'Ripple',
  group: 'Pointer',
  summary: 'Material-style click ripple for buttons and cards. Enter/Space ripple from the centre. Disabled under reduced motion.',
  classes: [
    ['spark-ripple', 'Adds position:relative, overflow:hidden and the click ripple.'],
  ],
  options: [
    ['data-spark-color', '(currentColor 25%)', 'Ripple color.'],
    ['data-spark-duration', '600', 'Duration in ms.'],
    ['data-spark-center', 'false', 'Always ripple from the centre.'],
  ],
  vars: [
    ['--spark-ripple-color', 'currentColor 25%', 'Ripple color.'],
    ['--spark-ripple-dur', '600ms', 'Duration.'],
  ],
  examples: [
    { html: `<div class="cluster gap-4 p-6">
  <button class="btn spark-ripple">Click me</button>
  <button class="btn spark-ripple" data-spark-center data-spark-duration="900">Centered</button>
  <div class="card spark-ripple p-6" tabindex="0">Cards ripple too</div>
</div>` },
  ],
};
