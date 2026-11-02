/* Docs data for proximity (not bundled). */
module.exports = {
  title: 'Proximity',
  group: 'Text',
  summary: 'Letters or icons scale, thicken, lift and recolor depending on how close the pointer is, like a macOS dock. Fine pointers and motion-OK only.',
  classes: [
    ['efx-proximity', 'Text is split into letters (screen readers get the original); with data-efx-mode="items" children marked [data-efx-item] react instead.'],
    ['efx-proximity__c', 'Injected letter span.'],
  ],
  options: [
    ['data-efx-radius', '120', 'Distance in px within which pieces react.'],
    ['data-efx-scale', '1.4', 'Scale of the closest piece.'],
    ['data-efx-weight', '0', 'Target font-weight at the pointer (0 = off). Needs a variable font to look smooth.'],
    ['data-efx-lift', '0', 'Upward lift in px.'],
    ['data-efx-color', '', 'Color to mix in near the pointer (empty = off), e.g. var(--sh-primary).'],
    ['data-efx-mode', 'letters', 'letters · items'],
  ],
  vars: [],
  examples: [
    { html: `<div class="card p-6 stack" style="min-height:260px">
  <h2 class="efx-proximity" data-efx-radius="110" data-efx-scale="1.5" data-efx-lift="6" data-efx-color="var(--sh-primary,#4f46e5)">Hover over these letters</h2>
  <div class="efx-proximity cluster gap-4" data-efx-mode="items" data-efx-scale="1.7" data-efx-lift="8" data-efx-radius="100" style="font-size:2rem">
    <span data-efx-item>★</span><span data-efx-item>♥</span><span data-efx-item>⚡</span><span data-efx-item>☀</span><span data-efx-item>✿</span>
  </div>
</div>` },
  ],
};
