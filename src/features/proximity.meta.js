/* Docs data for proximity (not bundled). */
module.exports = {
  title: 'Proximity',
  group: 'Text',
  summary: 'Letters or icons scale, thicken, lift and recolor depending on how close the pointer is, like a macOS dock. Fine pointers and motion-OK only.',
  classes: [
    ['spark-proximity', 'Text is split into letters (screen readers get the original); with data-spark-mode="items" children marked [data-spark-item] react instead.'],
    ['spark-proximity__c', 'Injected letter span.'],
  ],
  options: [
    ['data-spark-radius', '120', 'Distance in px within which pieces react.'],
    ['data-spark-scale', '1.4', 'Scale of the closest piece.'],
    ['data-spark-weight', '0', 'Target font-weight at the pointer (0 = off). Needs a variable font to look smooth.'],
    ['data-spark-lift', '0', 'Upward lift in px.'],
    ['data-spark-color', '', 'Color to mix in near the pointer (empty = off), e.g. var(--sh-primary).'],
    ['data-spark-mode', 'letters', 'letters · items'],
  ],
  vars: [],
  examples: [
    { html: `<div class="card p-6 stack" style="min-height:260px">
  <h2 class="spark-proximity" data-spark-radius="110" data-spark-scale="1.5" data-spark-lift="6" data-spark-color="var(--sh-primary,#4f46e5)">Hover over these letters</h2>
  <div class="spark-proximity cluster gap-4" data-spark-mode="items" data-spark-scale="1.7" data-spark-lift="8" data-spark-radius="100" style="font-size:2rem">
    <span data-spark-item>★</span><span data-spark-item>♥</span><span data-spark-item>⚡</span><span data-spark-item>☀</span><span data-spark-item>✿</span>
  </div>
</div>` },
  ],
};
