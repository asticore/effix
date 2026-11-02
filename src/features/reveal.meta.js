/* Docs data for reveal (not bundled). */
module.exports = {
  title: 'Reveal on scroll',
  group: 'Scroll',
  summary: 'Fades, slides, zooms or blurs elements in as they enter the viewport. Content stays visible without JS.',
  classes: [
    ['efx-reveal', 'Animate this element in when it scrolls into view.'],
    ['efx-stagger', 'Container: cascades the delay of every .efx-reveal inside it.'],
  ],
  options: [
    ['data-efx-reveal', 'fade-up', 'fade · fade-up · fade-down · slide-left · slide-right · zoom · blur · flip · wipe-up · wipe-left · wipe-right · rise · scale-down'],
    ['data-efx-delay', '0', 'Extra delay in ms.'],
    ['data-efx-once', 'true', 'false = hide again when it leaves the viewport.'],
    ['data-efx-threshold', '0.15', 'How far into the viewport (0–1) before it plays.'],
    ['data-efx-stagger', '80', 'On .efx-stagger: ms between children.'],
  ],
  extend: [
    ['CSS', '[data-efx-anim="name"]', 'Add your own animation in pure CSS: `.efx-reveal-pending[data-efx-anim="myname"] { transform: skewY(6deg); }` then use data-efx-reveal="myname". Define the hidden state; .is-in clears it.'],
  ],
  vars: [
    ['--efx-duration', '700ms', 'Animation length.'],
    ['--efx-ease', 'cubic-bezier(.22,1,.36,1)', 'Easing.'],
    ['--efx-distance', '24px', 'Travel distance for fade/slide.'],
  ],
  examples: [
    { html: `<div class="efx-stagger grid md:grid-cols-3 gap-4" data-efx-stagger="120">
  <div class="card efx-reveal" data-efx-reveal="fade-up">Fade up</div>
  <div class="card efx-reveal" data-efx-reveal="zoom">Zoom</div>
  <div class="card efx-reveal" data-efx-reveal="blur">Blur</div>
  <div class="card efx-reveal" data-efx-reveal="wipe-up">Wipe up</div>
  <div class="card efx-reveal" data-efx-reveal="rise">Rise</div>
  <div class="card efx-reveal" data-efx-reveal="scale-down">Scale down</div>
</div>` },
  ],
};
