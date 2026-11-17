/* Docs data for kinetic (not bundled). */
module.exports = {
  smokeRefresh: false, // the word on screen depends on the current beat
  title: 'Kinetic bumper',
  group: 'Text',
  summary: 'Kinetic typography: big centered type that shows one word per beat with rotating punch, slide, spin, blur and split entrances, colored from Shine tones. Screen readers get the full sentence; reduced motion shows it statically.',
  classes: [['spark-kinetic', 'Container. Words come from data-spark-words (or the element text).']],
  options: [
    ['data-spark-words', '', 'Words or phrases separated by |.'],
    ['data-spark-beat', '600', 'Milliseconds per word.'],
    ['data-spark-styles', 'punch|slide|spin|blur|split', 'Entrance styles, cycled in order.'],
    ['data-spark-random', 'false', 'Pick styles at random instead of cycling.'],
    ['data-spark-colors', '', 'Per-word colors separated by |; defaults to Shine tones.'],
    ['data-spark-hold', 'false', 'true = stop on the last word instead of looping.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="spark-kinetic" style="min-height:260px" data-spark-words="Ship|faster|with|Spark" data-spark-beat="700"></div>` },
    { html: `<div class="spark-kinetic" style="min-height:260px" data-spark-words="Design it|Animate it|Launch it" data-spark-styles="spin|blur" data-spark-colors="#6366f1|#ec4899|#f59e0b" data-spark-hold></div>` },
  ],
};
