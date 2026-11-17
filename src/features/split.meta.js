/* Docs data for split (not bundled). */
module.exports = {
  title: 'Split text',
  group: 'Text',
  summary: 'Splits a heading into words or letters and animates them in with a stagger when scrolled into view. Screen readers get the original text; no JS or reduced motion = plain text.',
  classes: [['spark-split', 'Element whose text is split and animated. Inline markup inside is flattened.']],
  options: [
    ['data-spark-by', 'word', 'word · letter (falls back to word above max pieces).'],
    ['data-spark-effect', 'fade-up', 'fade · fade-up · blur · slide · wave (looping).'],
    ['data-spark-stagger', '40', 'Delay between pieces in ms.'],
    ['data-spark-duration', '600', 'Per-piece animation time in ms.'],
    ['data-spark-once', 'true', 'false = replay when re-entering the viewport.'],
    ['data-spark-max', '200', 'Max letters to split; beyond this, split by word.'],
  ],
  vars: [['--spark-ease', 'cubic-bezier(.22,1,.36,1)', 'Easing.']],
  examples: [
    { html: `<div class="stack gap-4 p-6">
  <h2 class="spark-split" data-spark-by="letter" data-spark-effect="fade-up">Letters rise in</h2>
  <h3 class="spark-split" data-spark-effect="blur">Words fade from blur into focus</h3>
  <h3 class="spark-split" data-spark-by="letter" data-spark-effect="wave" data-spark-stagger="60">Looping wave</h3>
</div>` },
  ],
};
