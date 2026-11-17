/* Docs data for particles (not bundled). */
module.exports = {
  title: 'Particles',
  group: 'Background',
  summary: 'Drifting canvas particles behind any section, optionally linked by lines and reacting to the pointer. Pauses off-screen and in hidden tabs.',
  classes: [
    ['spark-particles', 'Injects a canvas behind the content (content stays clickable and above).'],
  ],
  options: [
    ['data-spark-count', '50', 'Max particles (also capped by area / 14000).'],
    ['data-spark-color', '(theme)', 'One color or a list separated by | (commas outside parentheses also work) for multicolor, e.g. rgb(1,2,3)|#f00. Empty = Shine tone/primary.'],
    ['data-spark-size-min', '1', 'Smallest radius in px.'],
    ['data-spark-size-max', '2.8', 'Largest radius in px.'],
    ['data-spark-speed', '100', 'Speed in percent.'],
    ['data-spark-opacity', '1', 'Particle opacity (0–1).'],
    ['data-spark-links', 'false', 'Draw lines between nearby particles.'],
    ['data-spark-link-distance', '110', 'Max link length in px.'],
    ['data-spark-interact', 'repel', 'none · repel · attract · connect (pointer joins the network).'],
    ['data-spark-interact-radius', '120', 'Pointer influence radius in px.'],
    ['data-spark-shape', 'circle', 'circle · square · triangle · star · heart, a list like circle|star, or any registered particle-shape.'],
  ],
  extend: [
    ['particle-shape', '(ctx2d, size, particle) => void', 'Build a path (no beginPath/fill) centered on 0,0; size is the particle radius. Feature translates, fills and uses data-spark-shape="name" or "a|b".'],
  ],
  extendExample: `<script>
window.SparkConfig = { extend(E) {
  E.add('particle-shape', 'plus', (ctx, s) => { ctx.rect(-s * .3, -s * 1.2, s * .6, s * 2.4); ctx.rect(-s * 1.2, -s * .3, s * 2.4, s * .6); });
} };
</script>
<div class="spark-particles" data-spark-shape="plus|star" style="min-height:240px"></div>`,
  vars: [
    ['--spark-color', 'Shine tone / primary', 'Particle color when data-spark-color is empty.'],
  ],
  examples: [
    { html: `<section class="spark-particles p-6 rounded-lg" data-spark-links data-spark-interact="connect" style="min-height:280px;background:#0f172a;color:#fff">
  <div class="stack"><h3>Connected particles</h3><p>Move the pointer over this area.</p><button class="btn">Still clickable</button></div>
</section>` },
    { html: `<section class="spark-particles p-6 rounded-lg" data-spark-color="#f43f5e|#f59e0b|rgb(34,211,238)" data-spark-shape="square" data-spark-count="70" style="min-height:280px;background:#111827;color:#fff">
  <h3>Multicolor squares</h3>
</section>` },
  ],
};
