/* Docs data for parallax (not bundled). */
module.exports = {
  title: 'Parallax',
  group: 'Scroll',
  summary: 'Moves an element slower, faster or opposite to the scroll. Only computes while visible; static with reduced motion.',
  classes: [
    ['efx-parallax', 'Shift this element (or its background image with data-efx-bg) as the page scrolls.'],
  ],
  options: [
    ['data-efx-speed', '0.3', 'Strength, -1 to 1. Negative moves against the scroll.'],
    ['data-efx-axis', 'y', 'y · x'],
    ['data-efx-bg', 'false', 'Move the CSS background-image through an injected oversized layer instead of the element.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4" style="min-height:300px;overflow:hidden">
  <div class="card tone-primary p-6 efx-parallax" data-efx-speed="0.25">Slow drift</div>
  <div class="card tone-secondary p-6 efx-parallax" data-efx-speed="-0.25">Opposite drift</div>
</div>` },
    { html: `<section class="efx-parallax rounded-lg p-6" data-efx-bg data-efx-speed="0.4" style="min-height:300px;background-image:linear-gradient(135deg,#6366f1,#ec4899 60%,#f59e0b);color:#fff">
  <h3>Background parallax</h3><p>The gradient layer moves behind this text.</p>
</section>` },
  ],
};
