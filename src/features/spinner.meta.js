/* Docs data for spinner (not bundled). */
module.exports = {
  title: 'Spinners',
  group: 'Components',
  summary: 'Pure CSS loaders in seven styles. A tiny script adds role="status" and a visually hidden "Loading" label when missing. With reduced motion they switch to a slow, subtle pulse.',
  classes: [
    ['spark-spinner', 'Base loader (ring). Choose a variant with data-spark-type or a class.'],
    ['spark-spinner-ring / -dots / -bars / -pulse / -orbit / -wave / -square', 'Variant classes (alternative to data-spark-type).'],
  ],
  options: [
    ['data-spark-type', '', 'ring · dots · bars · pulse · orbit · wave · square'],
    ['data-spark-label', 'Loading', 'Hidden label text for screen readers.'],
  ],
  vars: [
    ['--spark-spinner-size', '2.5rem', 'Width and height.'],
    ['--spark-color', 'Shine tone/primary', 'Spinner color.'],
  ],
  examples: [
    { html: `<div class="cluster gap-6" style="align-items:center;min-height:120px">
  <span class="spark-spinner" data-spark-type="ring"></span>
  <span class="spark-spinner" data-spark-type="dots"></span>
  <span class="spark-spinner" data-spark-type="bars"></span>
  <span class="spark-spinner" data-spark-type="pulse"></span>
  <span class="spark-spinner" data-spark-type="orbit"></span>
  <span class="spark-spinner" data-spark-type="wave"></span>
  <span class="spark-spinner spark-spinner-square" style="--spark-color:#ec4899"></span>
</div>` },
  ],
};
