/* Docs data for typed (not bundled). */
module.exports = {
  title: 'Typed text',
  group: 'Text',
  summary: 'Typewriter or rotating words with a blinking cursor. Screen readers get the first word; reduced motion shows it statically.',
  classes: [['efx-typed', 'Inline element whose text rotates through data-efx-words.']],
  options: [
    ['data-efx-words', '', 'Words separated by | or ,.'],
    ['data-efx-speed', '60', 'Typing speed, ms per character.'],
    ['data-efx-back', '30', 'Deleting speed, ms per character.'],
    ['data-efx-pause', '1600', 'Hold time per word in ms.'],
    ['data-efx-loop', 'true', 'false = stop on the last word.'],
    ['data-efx-cursor', 'true', 'Show blinking cursor.'],
    ['data-efx-mode', 'type', 'type · fade · slide (fade/slide swap whole words).'],
  ],
  vars: [],
  examples: [
    { html: `<div class="stack gap-4 p-6">
  <h2>Build <span class="efx-typed" data-efx-words="fast|light|accessible|beautiful">fast</span> sites</h2>
  <h3>Make it <span class="efx-typed" data-efx-mode="slide" data-efx-cursor="false" data-efx-words="simple|bold|yours">simple</span></h3>
</div>` },
  ],
};
