/* Docs data for marquee (not bundled). */
module.exports = {
  title: 'Marquee',
  group: 'Scroll',
  summary: 'Infinite scrolling ticker. Content is cloned (aria-hidden) to fill the width; pauses on hover/focus and when off-screen; wraps statically with reduced motion.',
  classes: [
    ['efx-marquee', 'Container whose children scroll endlessly.'],
  ],
  options: [
    ['data-efx-speed', '60', 'Pixels per second.'],
    ['data-efx-direction', 'left', 'left · right'],
    ['data-efx-pause', 'true', 'Pause on hover and keyboard focus.'],
    ['data-efx-gap', '32', 'Space between items in px.'],
  ],
  vars: [
    ['--efx-gap', 'set from data-efx-gap', 'Space between items.'],
  ],
  examples: [
    { html: `<div class="efx-marquee" data-efx-speed="80"><span class="btn">Alpha</span><span class="btn tone-primary">Beta</span><span class="btn">Gamma</span><span class="btn tone-secondary">Delta</span><span class="btn">Epsilon</span></div>` },
  ],
};
