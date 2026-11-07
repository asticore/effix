/* Docs data for spinner (not bundled). */
module.exports = {
  title: 'Spinners',
  group: 'Components',
  summary: 'Pure CSS loaders in seven styles. A tiny script adds role="status" and a visually hidden "Loading" label when missing. With reduced motion they switch to a slow, subtle pulse.',
  classes: [
    ['efx-spinner', 'Base loader (ring). Choose a variant with data-efx-type or a class.'],
    ['efx-spinner-ring / -dots / -bars / -pulse / -orbit / -wave / -square', 'Variant classes (alternative to data-efx-type).'],
  ],
  options: [
    ['data-efx-type', '', 'ring · dots · bars · pulse · orbit · wave · square'],
    ['data-efx-label', 'Loading', 'Hidden label text for screen readers.'],
  ],
  vars: [
    ['--efx-spinner-size', '2.5rem', 'Width and height.'],
    ['--efx-color', 'Shine tone/primary', 'Spinner color.'],
  ],
  examples: [
    { html: `<div class="cluster gap-6" style="align-items:center;min-height:120px">
  <span class="efx-spinner" data-efx-type="ring"></span>
  <span class="efx-spinner" data-efx-type="dots"></span>
  <span class="efx-spinner" data-efx-type="bars"></span>
  <span class="efx-spinner" data-efx-type="pulse"></span>
  <span class="efx-spinner" data-efx-type="orbit"></span>
  <span class="efx-spinner" data-efx-type="wave"></span>
  <span class="efx-spinner efx-spinner-square" style="--efx-color:#ec4899"></span>
</div>` },
  ],
};
