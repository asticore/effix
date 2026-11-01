/* Docs data for spotlight (not bundled). */
module.exports = {
  title: 'Spotlight',
  group: 'Pointer',
  summary: 'A radial glow that follows the pointer inside a card or section, optionally lighting the border too. Fine pointers only.',
  classes: [
    ['efx-spotlight', 'Add the pointer-following glow to this element.'],
    ['efx-spotlight--border', 'Added automatically with data-efx-border.'],
  ],
  options: [
    ['data-efx-size', '240', 'Glow radius in px.'],
    ['data-efx-color', '(theme)', 'Glow color. Empty = Shine tone/primary.'],
    ['data-efx-opacity', '0.18', 'Glow strength (0–1).'],
    ['data-efx-border', 'false', 'Also light the border.'],
  ],
  vars: [
    ['--efx-x / --efx-y', 'set by JS', 'Pointer position inside the element.'],
    ['--efx-color', 'Shine tone / primary', 'Glow color fallback.'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card efx-spotlight p-6"><h3>Spotlight</h3><p>Move the pointer around.</p></div>
  <div class="card efx-spotlight p-6" data-efx-border data-efx-opacity="0.3" data-efx-size="300"><h3>Lit border</h3><p>Border glows too.</p></div>
</div>` },
  ],
};
