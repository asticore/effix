/* Docs data for copy (not bundled). */
module.exports = {
  title: 'Copy to clipboard',
  group: 'Components',
  summary: 'Copies an element\'s text (or a literal) to the clipboard, swaps the label and announces it to screen readers.',
  classes: [['efx-copy', 'Add to a button. Gets .is-copied while the done label shows.']],
  options: [
    ['data-efx-target', '', 'CSS selector of the element to copy. Inputs/textareas use their value, others textContent.'],
    ['data-efx-text', '', 'Literal text to copy (wins over target).'],
    ['data-efx-done', 'Copied!', 'Label shown after copying.'],
    ['data-efx-duration', '1800', 'Ms before the label reverts.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="card p-6 stack gap-4">
  <code id="demo-copy-code">npm install effix</code>
  <div class="cluster gap-2">
    <button class="btn efx-copy" data-efx-target="#demo-copy-code">Copy command</button>
    <button class="btn btn-outline efx-copy" data-efx-text="https://example.com" data-efx-done="Link copied">Copy link</button>
  </div>
</div>` },
  ],
};
