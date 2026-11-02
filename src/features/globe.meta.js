/* Docs data for globe (not bundled). */
module.exports = {
  title: 'Dot globe',
  group: 'Background',
  summary: 'A lightweight rotating globe made of dots on a canvas: back-facing dots fade, optional pulsing location markers, drag to spin. Pauses off-screen; a static frame with reduced motion. Lazy: starts when near the viewport.',
  classes: [
    ['efx-globe', 'Host. Square by default (aspect-ratio 1): set a width or max-width. The canvas fills it.'],
  ],
  options: [
    ['data-efx-dots', '1200', 'Number of dots on the sphere.'],
    ['data-efx-speed', '0.2', 'Auto-rotation in radians per second (0 = still, negative = reverse).'],
    ['data-efx-markers', '(none)', 'lat,lon pairs separated by |, e.g. 51.5,-0.12|40.7,-74. Markers pulse while facing you.'],
    ['data-efx-color', '(theme)', 'Dot and marker color. Empty = Shine tone/primary.'],
    ['data-efx-tilt', '0.3', 'Initial axis tilt in radians.'],
    ['data-efx-drag', 'true', 'Drag with the pointer to rotate.'],
  ],
  vars: [
    ['--efx-color', 'Shine tone / primary', 'Color when data-efx-color is empty.'],
  ],
  examples: [
    { html: `<div class="p-6" style="display:flex;justify-content:center">
  <div class="efx-globe" data-efx-markers="51.5,-0.12|40.7,-74|35.7,139.7|-33.9,151.2|-23.5,-46.6" style="width:100%;max-width:280px"></div>
</div>` },
  ],
};
