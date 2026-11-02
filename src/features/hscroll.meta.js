/* Docs data for hscroll (not bundled). */
module.exports = {
  title: 'Horizontal scroll',
  group: 'Scroll',
  summary: 'Pins a section while vertical scrolling slides a row of panels sideways. On small screens or with reduced motion it becomes a native swipeable row.',
  classes: [
    ['efx-hscroll', 'The section. Its height is computed from the track width.'],
    ['efx-hscroll__track', 'Optional child holding the panels. Added automatically if missing.'],
  ],
  options: [
    ['data-efx-offset', '0', 'Pin this many px below the top (for a sticky header).'],
    ['data-efx-snap', 'false', 'Settle on the nearest panel when scrolling stops.'],
  ],
  vars: [],
  examples: [
    { html: `<section class="efx-hscroll rounded-lg" data-efx-snap>
  <div class="efx-hscroll__track">
    <div class="card tone-primary p-6 m-4"><h3>One</h3><p>Keep scrolling down.</p></div>
    <div class="card tone-secondary p-6 m-4"><h3>Two</h3><p>The page moves sideways.</p></div>
    <div class="card tone-success p-6 m-4"><h3>Three</h3><p>Then continues down.</p></div>
  </div>
</section>` },
  ],
};
