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
    ['data-efx-from', 'first', 'On .efx-stagger: where the cascade starts: first · last · center · edges · random · or an item index (0-based).'],
    ['data-efx-grid', '', 'On .efx-stagger: "cols,rows" (e.g. "4,3") or "auto" (measures item positions) to delay by 2D distance from the origin.'],
    ['data-efx-axis', '', 'On .efx-stagger with a grid: x or y to measure distance on one axis only.'],
    ['data-efx-ease', 'linear', 'On .efx-stagger: easing name (see Effix.add("easing")) distributing the delays along a curve.'],
    ['data-efx-total', '', 'On .efx-stagger: spread the cascade across this many ms in total instead of ms per step.'],
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
    { html: `<div class="efx-stagger grid grid-cols-4 gap-3 p-4" data-efx-stagger="70" data-efx-from="center" data-efx-grid="4,3" data-efx-ease="ease-out">
  <div class="card efx-reveal p-4" data-efx-reveal="zoom">1</div><div class="card efx-reveal p-4" data-efx-reveal="zoom">2</div><div class="card efx-reveal p-4" data-efx-reveal="zoom">3</div><div class="card efx-reveal p-4" data-efx-reveal="zoom">4</div>
  <div class="card efx-reveal p-4" data-efx-reveal="zoom">5</div><div class="card efx-reveal p-4" data-efx-reveal="zoom">6</div><div class="card efx-reveal p-4" data-efx-reveal="zoom">7</div><div class="card efx-reveal p-4" data-efx-reveal="zoom">8</div>
  <div class="card efx-reveal p-4" data-efx-reveal="zoom">9</div><div class="card efx-reveal p-4" data-efx-reveal="zoom">10</div><div class="card efx-reveal p-4" data-efx-reveal="zoom">11</div><div class="card efx-reveal p-4" data-efx-reveal="zoom">12</div>
</div>` },
  ],
};
