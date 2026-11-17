/* Docs data for reveal (not bundled). */
module.exports = {
  title: 'Reveal on scroll',
  group: 'Scroll',
  summary: 'Fades, slides, zooms or blurs elements in as they enter the viewport. Content stays visible without JS.',
  classes: [
    ['spark-reveal', 'Animate this element in when it scrolls into view.'],
    ['spark-stagger', 'Container: cascades the delay of every .spark-reveal inside it.'],
  ],
  options: [
    ['data-spark-reveal', 'fade-up', 'fade · fade-up · fade-down · slide-left · slide-right · zoom · blur · flip · wipe-up · wipe-left · wipe-right · rise · scale-down'],
    ['data-spark-delay', '0', 'Extra delay in ms.'],
    ['data-spark-once', 'true', 'false = hide again when it leaves the viewport.'],
    ['data-spark-threshold', '0.15', 'How far into the viewport (0–1) before it plays.'],
    ['data-spark-stagger', '80', 'On .spark-stagger: ms between children.'],
    ['data-spark-from', 'first', 'On .spark-stagger: where the cascade starts: first · last · center · edges · random · or an item index (0-based).'],
    ['data-spark-grid', '', 'On .spark-stagger: "cols,rows" (e.g. "4,3") or "auto" (measures item positions) to delay by 2D distance from the origin.'],
    ['data-spark-axis', '', 'On .spark-stagger with a grid: x or y to measure distance on one axis only.'],
    ['data-spark-ease', 'linear', 'On .spark-stagger: easing name (see Spark.add("easing")) distributing the delays along a curve.'],
    ['data-spark-total', '', 'On .spark-stagger: spread the cascade across this many ms in total instead of ms per step.'],
  ],
  extend: [
    ['CSS', '[data-spark-anim="name"]', 'Add your own animation in pure CSS: `.spark-reveal-pending[data-spark-anim="myname"] { transform: skewY(6deg); }` then use data-spark-reveal="myname". Define the hidden state; .is-in clears it.'],
  ],
  vars: [
    ['--spark-duration', '700ms', 'Animation length.'],
    ['--spark-ease', 'cubic-bezier(.22,1,.36,1)', 'Easing.'],
    ['--spark-distance', '24px', 'Travel distance for fade/slide.'],
  ],
  examples: [
    { html: `<div class="spark-stagger grid md:grid-cols-3 gap-4" data-spark-stagger="120">
  <div class="card spark-reveal" data-spark-reveal="fade-up">Fade up</div>
  <div class="card spark-reveal" data-spark-reveal="zoom">Zoom</div>
  <div class="card spark-reveal" data-spark-reveal="blur">Blur</div>
  <div class="card spark-reveal" data-spark-reveal="wipe-up">Wipe up</div>
  <div class="card spark-reveal" data-spark-reveal="rise">Rise</div>
  <div class="card spark-reveal" data-spark-reveal="scale-down">Scale down</div>
</div>` },
    { html: `<div class="spark-stagger grid grid-cols-4 gap-3 p-4" data-spark-stagger="70" data-spark-from="center" data-spark-grid="4,3" data-spark-ease="ease-out">
  <div class="card spark-reveal p-4" data-spark-reveal="zoom">1</div><div class="card spark-reveal p-4" data-spark-reveal="zoom">2</div><div class="card spark-reveal p-4" data-spark-reveal="zoom">3</div><div class="card spark-reveal p-4" data-spark-reveal="zoom">4</div>
  <div class="card spark-reveal p-4" data-spark-reveal="zoom">5</div><div class="card spark-reveal p-4" data-spark-reveal="zoom">6</div><div class="card spark-reveal p-4" data-spark-reveal="zoom">7</div><div class="card spark-reveal p-4" data-spark-reveal="zoom">8</div>
  <div class="card spark-reveal p-4" data-spark-reveal="zoom">9</div><div class="card spark-reveal p-4" data-spark-reveal="zoom">10</div><div class="card spark-reveal p-4" data-spark-reveal="zoom">11</div><div class="card spark-reveal p-4" data-spark-reveal="zoom">12</div>
</div>` },
  ],
};
