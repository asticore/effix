/* Docs data for carousel (not bundled). */
module.exports = {
  title: 'Carousel controls',
  group: 'Components',
  summary: 'Adds arrows, dots, keyboard, accessible autoplay and an optional fade mode to Shine\'s scroll-snap .carousel.',
  classes: [
    ['efx-carousel', 'Add next to Shine\'s .carousel (the track itself). Children are the slides; the active ones get .is-active. Add tabindex="0" for ←/→ keys.'],
    ['efx-carousel__nav', 'Generated after the track: prev/next buttons, dots and a pause button when autoplay is on.'],
  ],
  options: [
    ['data-efx-autoplay', '0', 'Ms between slides. 0 = off. Pauses on hover, focus, offscreen, and via a pause button. Ignored with reduced motion.'],
    ['data-efx-loop', 'true', 'Wrap around at the ends.'],
    ['data-efx-dots', 'true', 'Show dot navigation.'],
    ['data-efx-arrows', 'true', 'Show prev/next buttons.'],
    ['data-efx-per-view', '0', 'Slides visible at once. 0 = respect CSS (e.g. .carousel-peek).'],
    ['data-efx-fade', 'false', 'Crossfade stacked slides instead of scrolling (hero sliders).'],
  ],
  vars: [['--efx-per-view', '(unset)', 'Slides per view, set when per-view is > 0.']],
  examples: [
    { html: `<div class="carousel efx-carousel" tabindex="0" aria-label="Demo slides" data-efx-autoplay="4000">
  <div class="card p-6 tone-primary" style="min-height:160px">Slide one</div>
  <div class="card p-6 tone-success" style="min-height:160px">Slide two</div>
  <div class="card p-6 tone-warning" style="min-height:160px">Slide three</div>
</div>` },
    { html: `<div class="carousel efx-carousel" data-efx-fade tabindex="0" aria-label="Fading slides">
  <div class="card p-6 tone-info" style="min-height:160px">Fade one</div>
  <div class="card p-6 tone-danger" style="min-height:160px">Fade two</div>
</div>` },
  ],
};
