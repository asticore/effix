/* Docs data for parallax (not bundled). */
module.exports = {
  title: 'Parallax',
  group: 'Scroll',
  summary: 'Moves an element slower, faster or opposite to the scroll. Only computes while visible; static with reduced motion.',
  classes: [
    ['spark-parallax', 'Shift this element (or its background image with data-spark-bg) as the page scrolls.'],
  ],
  options: [
    ['data-spark-speed', '0.3', 'Strength, -1 to 1. Negative moves against the scroll.'],
    ['data-spark-axis', 'y', 'y · x'],
    ['data-spark-bg', 'false', 'Move the CSS background-image through an injected oversized layer instead of the element.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4" style="min-height:300px;overflow:hidden">
  <div class="card tone-primary p-6 spark-parallax" data-spark-speed="0.25">Slow drift</div>
  <div class="card tone-secondary p-6 spark-parallax" data-spark-speed="-0.25">Opposite drift</div>
</div>` },
    { html: `<section class="spark-parallax rounded-lg p-6" data-spark-bg data-spark-speed="0.4" style="min-height:300px;background-image:linear-gradient(135deg,#6366f1,#ec4899 60%,#f59e0b);color:#fff">
  <h3>Background parallax</h3><p>The gradient layer moves behind this text.</p>
</section>` },
  ],
};
