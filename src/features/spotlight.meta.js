/* Docs data for spotlight (not bundled). */
module.exports = {
  title: 'Spotlight',
  group: 'Pointer',
  summary: 'A radial glow that follows the pointer inside a card or section, optionally lighting the border too. Fine pointers only.',
  classes: [
    ['spark-spotlight', 'Add the pointer-following glow to this element.'],
    ['spark-spotlight--border', 'Added automatically with data-spark-border.'],
  ],
  options: [
    ['data-spark-size', '240', 'Glow radius in px.'],
    ['data-spark-color', '(theme)', 'Glow color. Empty = Shine tone/primary.'],
    ['data-spark-opacity', '0.18', 'Glow strength (0–1).'],
    ['data-spark-border', 'false', 'Also light the border.'],
  ],
  vars: [
    ['--spark-x / --spark-y', 'set by JS', 'Pointer position inside the element.'],
    ['--spark-color', 'Shine tone / primary', 'Glow color fallback.'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card spark-spotlight p-6"><h3>Spotlight</h3><p>Move the pointer around.</p></div>
  <div class="card spark-spotlight p-6" data-spark-border data-spark-opacity="0.3" data-spark-size="300"><h3>Lit border</h3><p>Border glows too.</p></div>
</div>` },
  ],
};
