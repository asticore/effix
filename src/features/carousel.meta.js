/* Docs data for carousel (not bundled). */
module.exports = {
  title: 'Carousel controls',
  group: 'Components',
  summary: 'Adds arrows, dots, keyboard, accessible autoplay and an optional fade mode to Shine\'s scroll-snap .carousel.',
  classes: [
    ['spark-carousel', 'Add next to Shine\'s .carousel (the track itself). Children are the slides; the active ones get .is-active. Add tabindex="0" for ←/→ keys.'],
    ['spark-carousel__nav', 'Generated after the track: prev/next buttons, dots and a pause button when autoplay is on.'],
  ],
  options: [
    ['data-spark-autoplay', '0', 'Ms between slides. 0 = off. Pauses on hover, focus, offscreen, and via a pause button. Ignored with reduced motion.'],
    ['data-spark-loop', 'true', 'Wrap around at the ends.'],
    ['data-spark-dots', 'true', 'Show dot navigation.'],
    ['data-spark-arrows', 'true', 'Show prev/next buttons.'],
    ['data-spark-per-view', '0', 'Slides visible at once. 0 = respect CSS (e.g. .carousel-peek).'],
    ['data-spark-fade', 'false', 'Crossfade stacked slides instead of scrolling (hero sliders).'],
  ],
  vars: [['--spark-per-view', '(unset)', 'Slides per view, set when per-view is > 0.']],
  examples: [
    { html: `<div class="carousel spark-carousel" tabindex="0" aria-label="Demo slides" data-spark-autoplay="4000">
  <div class="card p-6 bg-primary-soft" style="min-height:160px">Slide one</div>
  <div class="card p-6 bg-success-soft" style="min-height:160px">Slide two</div>
  <div class="card p-6 bg-warning-soft" style="min-height:160px">Slide three</div>
</div>` },
    { html: `<div class="carousel spark-carousel" data-spark-fade tabindex="0" aria-label="Fading slides">
  <div class="card p-6 bg-info-soft" style="min-height:160px">Fade one</div>
  <div class="card p-6 bg-danger-soft" style="min-height:160px">Fade two</div>
</div>` },
  ],
};
