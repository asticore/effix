/* Docs data for textfill (not bundled). */
module.exports = {
  title: 'Text fill',
  group: 'Text',
  summary: 'Apple-style paragraph that lights up word by word as you scroll. Screen readers get the original text; no JS or reduced motion = full-color text.',
  classes: [['spark-textfill', 'Element whose text is split into pieces that fill in with scroll.']],
  options: [
    ['data-spark-start', '0.8', 'Viewport fraction (from top) where the element top starts the fill.'],
    ['data-spark-end', '0.3', 'Viewport fraction where the element bottom finishes the fill.'],
    ['data-spark-by', 'word', 'word · letter.'],
    ['data-spark-dim', '0.2', 'Opacity of unfilled text.'],
    ['data-spark-color', '', 'Text color once filled (default: current color).'],
  ],
  vars: [
    ['--spark-textfill-dim', '0.2', 'Opacity of unfilled text.'],
    ['--spark-textfill-color', 'currentColor', 'Filled text color.'],
  ],
  examples: [
    { html: `<div class="p-6" style="min-height:300px">
  <p class="spark-textfill text-2xl font-bold">Scroll this panel into view and every word lights up in turn, one after another, as you move down the page.</p>
</div>` },
  ],
};
