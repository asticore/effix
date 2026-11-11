/* Docs data for kinetic (not bundled). */
module.exports = {
  title: 'Kinetic bumper',
  group: 'Text',
  summary: 'Kinetic typography: big centered type that shows one word per beat with rotating punch, slide, spin, blur and split entrances, colored from Shine tones. Screen readers get the full sentence; reduced motion shows it statically.',
  classes: [['efx-kinetic', 'Container. Words come from data-efx-words (or the element text).']],
  options: [
    ['data-efx-words', '', 'Words or phrases separated by |.'],
    ['data-efx-beat', '600', 'Milliseconds per word.'],
    ['data-efx-styles', 'punch|slide|spin|blur|split', 'Entrance styles, cycled in order.'],
    ['data-efx-random', 'false', 'Pick styles at random instead of cycling.'],
    ['data-efx-colors', '', 'Per-word colors separated by |; defaults to Shine tones.'],
    ['data-efx-hold', 'false', 'true = stop on the last word instead of looping.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="efx-kinetic" style="min-height:260px" data-efx-words="Ship|faster|with|Effix" data-efx-beat="700"></div>` },
    { html: `<div class="efx-kinetic" style="min-height:260px" data-efx-words="Design it|Animate it|Launch it" data-efx-styles="spin|blur" data-efx-colors="#6366f1|#ec4899|#f59e0b" data-efx-hold></div>` },
  ],
};
