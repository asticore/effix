/* Docs data for sticky (not bundled). */
module.exports = {
  title: 'Sticky header',
  group: 'Scroll',
  summary: 'Makes an element position: sticky and adds state classes: is-stuck (with shadow), is-hidden (hide on scroll down) and is-shrunk.',
  classes: [
    ['efx-sticky', 'Sticky element. Gets is-stuck, is-hidden, is-shrunk.'],
  ],
  options: [
    ['data-efx-offset', '0', 'Distance from the top edge in px.'],
    ['data-efx-hide', 'false', 'Hide when scrolling down, show when scrolling up.'],
    ['data-efx-shrink', 'false', 'Add is-shrunk after scrolling past shrinkAt.'],
    ['data-efx-shrink-at', '80', 'Scroll distance in px for is-shrunk.'],
  ],
  vars: [],
  examples: [
    { html: `<div>
  <div class="efx-sticky card p-4 tone-primary" data-efx-shrink data-efx-shrink-at="20" style="top:0">Sticky bar: gets is-stuck (shadow) and is-shrunk while scrolling</div>
  <div class="p-6" style="min-height:900px">Scroll the page so the bar sticks.</div>
</div>` },
  ],
};
