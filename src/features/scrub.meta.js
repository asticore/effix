/* Docs data for scrub (not bundled). */
module.exports = {
  title: 'Scroll scrub',
  group: 'Scroll',
  summary: 'Ties transforms, opacity and blur to how far an element has travelled through the viewport. Works on buttons, images, sections, anything. Neutral with reduced motion.',
  classes: [
    ['spark-scrub', 'Scrub this element with scroll. Progress is 0 as it enters at the bottom and 1 as it leaves at the top.'],
  ],
  options: [
    ['data-spark-x', '0', 'Horizontal travel in px (neutral to value).'],
    ['data-spark-y', '0', 'Vertical travel in px.'],
    ['data-spark-rotate', '0', 'End rotation in degrees.'],
    ['data-spark-scale', '1', 'End scale.'],
    ['data-spark-opacity', '-1', 'End opacity (0–1). -1 leaves opacity alone.'],
    ['data-spark-blur', '0', 'End blur in px.'],
    ['data-spark-from', '', 'Advanced start state, e.g. "y:60 opacity:0 scale:.8". Keys: x y rotate scale opacity blur.'],
    ['data-spark-to', '', 'Advanced end state, same keys. Overrides the single options.'],
    ['data-spark-start', '0', 'Progress (0–1) where the scrub begins.'],
    ['data-spark-end', '1', 'Progress (0–1) where it finishes.'],
    ['data-spark-peak', 'none', 'center = progress is a triangle peaking at 1 when the element center is at the viewport center (images grow as they reach center, shrink after). none = normal 0 to 1.'],
    ['data-spark-ease', 'linear', 'linear · ease-in · ease-out · ease-in-out · ease-out-cubic · back-out · elastic-out (in/out/inout aliases), or any registered easing'],
  ],
  extend: [
    ['easing', '(t: 0..1) => number', 'Shared by scrub and counter (data-spark-ease). Return 0..1 (overshoot allowed).'],
  ],
  extendExample: `<script>
window.SparkConfig = { extend(E) {
  E.add('easing', 'steps4', t => Math.floor(t * 4) / 4);
} };
</script>
<div class="spark-scrub" data-spark-ease="steps4" data-spark-y="120"></div>`,
  vars: [
    ['--spark-p', '0', 'Written on the element: eased progress 0–1. Use it in your own CSS calc().'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-3 gap-4 text-center" style="min-height:300px;align-content:center">
  <div class="card tone-primary p-6 spark-scrub" data-spark-from="y:60 opacity:0" data-spark-to="y:0 opacity:1" data-spark-end=".5">Rises in</div>
  <div class="card tone-secondary p-6 spark-scrub" data-spark-rotate="180" data-spark-scale=".6">Spins and shrinks</div>
  <div class="card tone-success p-6 spark-scrub" data-spark-peak="center" data-spark-scale="1.3">Peaks at center</div>
  <button class="btn spark-scrub" data-spark-x="-80" data-spark-blur="6">Slides and blurs</button>
</div>` },
  ],
};
