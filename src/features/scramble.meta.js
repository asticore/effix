/* Docs data for scramble (not bundled). */
module.exports = {
  title: 'Text scramble',
  group: 'Text',
  summary: 'Decodes text from random glyphs into the real thing, on view, hover, click or load, or cycles through a list of phrases. Real text stays available to screen readers; reduced motion shows the final text.',
  classes: [
    ['spark-scramble', 'Scramble this element\'s text (headings, spans, buttons).'],
  ],
  options: [
    ['data-spark-trigger', 'view', 'view · hover · load · click.'],
    ['data-spark-chars', '!<>-_\\/[]{}—=+*^?#________', 'Glyph pool used while scrambling.'],
    ['data-spark-speed', '30', 'Milliseconds per frame.'],
    ['data-spark-duration', '900', 'Total decode time in ms.'],
    ['data-spark-once', 'true', 'false = replay each time it re-enters the viewport.'],
    ['data-spark-words', '', 'a|b|c : cycle through these phrases like a rotating headline.'],
    ['data-spark-pause', '2000', 'Words mode: ms to hold each phrase.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="stack gap-4 p-6" style="min-height:200px;align-items:flex-start">
  <h2 class="spark-scramble" data-spark-trigger="load" data-spark-once="false">Decode this headline</h2>
  <button class="btn spark-scramble" data-spark-trigger="hover">Hover to scramble</button>
  <p class="spark-scramble" data-spark-words="Build faster|Ship smoother|Delight everyone" data-spark-duration="700">Build faster</p>
</div>` },
  ],
};
