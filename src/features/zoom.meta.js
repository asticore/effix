/* Docs data for zoom (not bundled). */
module.exports = {
  title: 'Image zoom lens',
  group: 'Components',
  summary: 'Hover magnifier for images: a round or square lens, or the whole image zooming in place like product pages. Uses an optional large version of the image. Fine pointers only; touch is untouched.',
  classes: [
    ['efx-zoom', 'Wrapper around an <img>. Add data-efx-full="large.jpg" on the img (or wrapper) for a sharper zoom source.'],
  ],
  options: [
    ['data-efx-scale', '2.5', 'Magnification factor.'],
    ['data-efx-size', '160', 'Lens diameter in px (circle and square).'],
    ['data-efx-shape', 'circle', 'circle · square · inner (whole image zooms in place, following the pointer).'],
  ],
  vars: [],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="efx-zoom" data-efx-shape="circle"><img alt="Gradient sample" style="display:block;width:100%;height:220px;object-fit:cover" src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop offset='0' stop-color='%236366f1'/%3E%3Cstop offset='1' stop-color='%23ec4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='400' fill='url(%23g)'/%3E%3Ccircle cx='300' cy='200' r='90' fill='none' stroke='white' stroke-width='6'/%3E%3Ctext x='300' y='215' font-size='40' text-anchor='middle' fill='white'%3EEffix%3C/text%3E%3C/svg%3E"></div>
  <div class="efx-zoom" data-efx-shape="inner" data-efx-scale="3"><img alt="Gradient sample" style="display:block;width:100%;height:220px;object-fit:cover" src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop offset='0' stop-color='%2310b981'/%3E%3Cstop offset='1' stop-color='%23f59e0b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='400' fill='url(%23g)'/%3E%3Cpath d='M0 300 L150 150 L300 280 L450 120 L600 260 V400 H0Z' fill='white' opacity='.5'/%3E%3C/svg%3E"></div>
</div>` },
  ],
};
