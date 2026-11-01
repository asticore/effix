/* Docs data for split (not bundled). */
module.exports = {
  title: 'Split text',
  group: 'Text',
  summary: 'Splits a heading into words or letters and animates them in with a stagger when scrolled into view. Screen readers get the original text; no JS or reduced motion = plain text.',
  classes: [['efx-split', 'Element whose text is split and animated. Inline markup inside is flattened.']],
  options: [
    ['data-efx-by', 'word', 'word · letter (falls back to word above max pieces).'],
    ['data-efx-effect', 'fade-up', 'fade · fade-up · blur · slide · wave (looping).'],
    ['data-efx-stagger', '40', 'Delay between pieces in ms.'],
    ['data-efx-duration', '600', 'Per-piece animation time in ms.'],
    ['data-efx-once', 'true', 'false = replay when re-entering the viewport.'],
    ['data-efx-max', '200', 'Max letters to split; beyond this, split by word.'],
  ],
  vars: [['--efx-ease', 'cubic-bezier(.22,1,.36,1)', 'Easing.']],
  examples: [
    { html: `<div class="stack gap-4 p-6">
  <h2 class="efx-split" data-efx-by="letter" data-efx-effect="fade-up">Letters rise in</h2>
  <h3 class="efx-split" data-efx-effect="blur">Words fade from blur into focus</h3>
  <h3 class="efx-split" data-efx-by="letter" data-efx-effect="wave" data-efx-stagger="60">Looping wave</h3>
</div>` },
  ],
};
