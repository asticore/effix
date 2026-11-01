/* Docs data for totop (not bundled). */
module.exports = {
  title: 'Back to top',
  group: 'Scroll',
  summary: 'A button that fades in after scrolling and returns to the top (smooth when motion is allowed).',
  classes: [
    ['efx-totop', 'The button. Fixed bottom-right by default; gets is-shown after scrolling.'],
  ],
  options: [
    ['data-efx-show', '400', 'Scroll distance in px before it appears.'],
    ['data-efx-fixed', 'true', 'false = no fixed positioning, place it yourself.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="cluster"><button class="btn efx-totop" data-efx-show="100" data-efx-fixed="false" style="position:static" aria-label="Back to top">↑ Top</button><span>Appears after scrolling 100px.</span></div>` },
  ],
};
