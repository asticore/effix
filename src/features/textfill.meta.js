/* Docs data for textfill (not bundled). */
module.exports = {
  title: 'Text fill',
  group: 'Text',
  summary: 'Apple-style paragraph that lights up word by word as you scroll. Screen readers get the original text; no JS or reduced motion = full-color text.',
  classes: [['efx-textfill', 'Element whose text is split into pieces that fill in with scroll.']],
  options: [
    ['data-efx-start', '0.8', 'Viewport fraction (from top) where the element top starts the fill.'],
    ['data-efx-end', '0.3', 'Viewport fraction where the element bottom finishes the fill.'],
    ['data-efx-by', 'word', 'word · letter.'],
    ['data-efx-dim', '0.2', 'Opacity of unfilled text.'],
    ['data-efx-color', '', 'Text color once filled (default: current color).'],
  ],
  vars: [
    ['--efx-textfill-dim', '0.2', 'Opacity of unfilled text.'],
    ['--efx-textfill-color', 'currentColor', 'Filled text color.'],
  ],
  examples: [
    { html: `<div class="p-6" style="min-height:300px">
  <p class="efx-textfill text-2xl font-bold">Scroll this panel into view and every word lights up in turn, one after another, as you move down the page.</p>
</div>` },
  ],
};
