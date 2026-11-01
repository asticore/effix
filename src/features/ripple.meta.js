/* Docs data for ripple (not bundled). */
module.exports = {
  title: 'Ripple',
  group: 'Pointer',
  summary: 'Material-style click ripple for buttons and cards. Enter/Space ripple from the centre. Disabled under reduced motion.',
  classes: [
    ['efx-ripple', 'Adds position:relative, overflow:hidden and the click ripple.'],
  ],
  options: [
    ['data-efx-color', '(currentColor 25%)', 'Ripple color.'],
    ['data-efx-duration', '600', 'Duration in ms.'],
    ['data-efx-center', 'false', 'Always ripple from the centre.'],
  ],
  vars: [
    ['--efx-ripple-color', 'currentColor 25%', 'Ripple color.'],
    ['--efx-ripple-dur', '600ms', 'Duration.'],
  ],
  examples: [
    { html: `<div class="cluster gap-4 p-6">
  <button class="btn efx-ripple">Click me</button>
  <button class="btn efx-ripple" data-efx-center data-efx-duration="900">Centered</button>
  <div class="card efx-ripple p-6" tabindex="0">Cards ripple too</div>
</div>` },
  ],
};
