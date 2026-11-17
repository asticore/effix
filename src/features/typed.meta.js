/* Docs data for typed (not bundled). */
module.exports = {
  title: 'Typed text',
  group: 'Text',
  summary: 'Typewriter or rotating words with a blinking cursor. Screen readers get the first word; reduced motion shows it statically.',
  classes: [['spark-typed', 'Inline element whose text rotates through data-spark-words.']],
  options: [
    ['data-spark-words', '', 'Words separated by | or ,.'],
    ['data-spark-speed', '60', 'Typing speed, ms per character.'],
    ['data-spark-back', '30', 'Deleting speed, ms per character.'],
    ['data-spark-pause', '1600', 'Hold time per word in ms.'],
    ['data-spark-loop', 'true', 'false = stop on the last word.'],
    ['data-spark-cursor', 'true', 'Show blinking cursor.'],
    ['data-spark-mode', 'type', 'type · fade · slide (fade/slide swap whole words).'],
  ],
  vars: [],
  examples: [
    { html: `<div class="stack gap-4 p-6">
  <h2>Build <span class="spark-typed" data-spark-words="fast|light|accessible|beautiful">fast</span> sites</h2>
  <h3>Make it <span class="spark-typed" data-spark-mode="slide" data-spark-cursor="false" data-spark-words="simple|bold|yours">simple</span></h3>
</div>` },
  ],
};
