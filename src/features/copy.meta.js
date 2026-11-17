/* Docs data for copy (not bundled). */
module.exports = {
  title: 'Copy to clipboard',
  group: 'Components',
  summary: 'Copies an element\'s text (or a literal) to the clipboard, swaps the label and announces it to screen readers.',
  classes: [['spark-copy', 'Add to a button. Gets .is-copied while the done label shows.']],
  options: [
    ['data-spark-target', '', 'CSS selector of the element to copy. Inputs/textareas use their value, others textContent.'],
    ['data-spark-text', '', 'Literal text to copy (wins over target).'],
    ['data-spark-done', 'Copied!', 'Label shown after copying.'],
    ['data-spark-duration', '1800', 'Ms before the label reverts.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="card p-6 stack gap-4">
  <code id="demo-copy-code">npm install spark</code>
  <div class="cluster gap-2">
    <button class="btn spark-copy" data-spark-target="#demo-copy-code">Copy command</button>
    <button class="btn btn-outline spark-copy" data-spark-text="https://example.com" data-spark-done="Link copied">Copy link</button>
  </div>
</div>` },
  ],
};
