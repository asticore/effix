/* Docs data for marquee (not bundled). */
module.exports = {
  title: 'Marquee',
  group: 'Scroll',
  summary: 'Infinite scrolling ticker. Content is cloned (aria-hidden) to fill the width; pauses on hover/focus and when off-screen; wraps statically with reduced motion.',
  classes: [
    ['spark-marquee', 'Container whose children scroll endlessly.'],
  ],
  options: [
    ['data-spark-speed', '60', 'Pixels per second.'],
    ['data-spark-direction', 'left', 'left · right'],
    ['data-spark-pause', 'true', 'Pause on hover and keyboard focus.'],
    ['data-spark-gap', '32', 'Space between items in px.'],
  ],
  vars: [
    ['--spark-gap', 'set from data-spark-gap', 'Space between items.'],
  ],
  examples: [
    { html: `<div class="spark-marquee" data-spark-speed="80"><span class="btn">Alpha</span><span class="btn tone-primary">Beta</span><span class="btn">Gamma</span><span class="btn tone-secondary">Delta</span><span class="btn">Epsilon</span></div>` },
  ],
};
