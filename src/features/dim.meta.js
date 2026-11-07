/* Docs data for dim (not bundled). */
module.exports = {
  title: 'Dim siblings',
  group: 'Pointer',
  summary: 'Hover or focus one item of a list or grid and every sibling dims. Optionally a floating image preview follows the cursor, taken from the item\'s data-efx-image. Touch taps never dim.',
  classes: [
    ['efx-dim', 'List/grid container. Its children (or data-efx-items) dim while one is hovered or focused.'],
    ['is-hovered', 'Added to the active child, handy for an expand/underline style of your own.'],
  ],
  options: [
    ['data-efx-opacity', '0.35', 'Opacity of the dimmed siblings.'],
    ['data-efx-blur', '0', 'Blur in px for dimmed siblings.'],
    ['data-efx-preview', 'true', 'Show a floating image following the cursor when the item has data-efx-image (fine pointers only).'],
    ['data-efx-items', '', 'CSS selector for the items. Default: direct children.'],
  ],
  vars: [
    ['--efx-dim-opacity', '0.35', 'Dimmed opacity (also set by data-efx-opacity).'],
    ['--efx-dim-blur', '0px', 'Dimmed blur.'],
    ['--efx-dim-gray', '0', 'Grayscale amount 0 to 1 for dimmed items.'],
    ['--efx-dim-size', '220px', 'Preview width.'],
  ],
  examples: [
    { html: `<ul class="efx-dim stack gap-2" data-efx-blur="1" style="list-style:none;padding:0;min-height:260px">
  <li class="card p-4" tabindex="0" data-efx-image="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='154'%3E%3Crect width='220' height='154' fill='%236366f1'/%3E%3C/svg%3E"><h4>Alpha</h4></li>
  <li class="card p-4" tabindex="0" data-efx-image="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='154'%3E%3Crect width='220' height='154' fill='%23ec4899'/%3E%3C/svg%3E"><h4>Beta</h4></li>
  <li class="card p-4" tabindex="0" data-efx-image="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='154'%3E%3Crect width='220' height='154' fill='%2310b981'/%3E%3C/svg%3E"><h4>Gamma</h4></li>
  <li class="card p-4" tabindex="0"><h4>Delta (no image)</h4></li>
</ul>` },
  ],
};
