/* Docs data for scramble (not bundled). */
module.exports = {
  title: 'Text scramble',
  group: 'Text',
  summary: 'Decodes text from random glyphs into the real thing, on view, hover, click or load, or cycles through a list of phrases. Real text stays available to screen readers; reduced motion shows the final text.',
  classes: [
    ['efx-scramble', 'Scramble this element\'s text (headings, spans, buttons).'],
  ],
  options: [
    ['data-efx-trigger', 'view', 'view · hover · load · click.'],
    ['data-efx-chars', '!<>-_\\/[]{}—=+*^?#________', 'Glyph pool used while scrambling.'],
    ['data-efx-speed', '30', 'Milliseconds per frame.'],
    ['data-efx-duration', '900', 'Total decode time in ms.'],
    ['data-efx-once', 'true', 'false = replay each time it re-enters the viewport.'],
    ['data-efx-words', '', 'a|b|c : cycle through these phrases like a rotating headline.'],
    ['data-efx-pause', '2000', 'Words mode: ms to hold each phrase.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="stack gap-4 p-6" style="min-height:200px;align-items:flex-start">
  <h2 class="efx-scramble" data-efx-trigger="load" data-efx-once="false">Decode this headline</h2>
  <button class="btn efx-scramble" data-efx-trigger="hover">Hover to scramble</button>
  <p class="efx-scramble" data-efx-words="Build faster|Ship smoother|Delight everyone" data-efx-duration="700">Build faster</p>
</div>` },
  ],
};
