/* Docs data for scrub (not bundled). */
module.exports = {
  title: 'Scroll scrub',
  group: 'Scroll',
  summary: 'Ties transforms, opacity and blur to how far an element has travelled through the viewport. Works on buttons, images, sections, anything. Neutral with reduced motion.',
  classes: [
    ['efx-scrub', 'Scrub this element with scroll. Progress is 0 as it enters at the bottom and 1 as it leaves at the top.'],
  ],
  options: [
    ['data-efx-x', '0', 'Horizontal travel in px (neutral to value).'],
    ['data-efx-y', '0', 'Vertical travel in px.'],
    ['data-efx-rotate', '0', 'End rotation in degrees.'],
    ['data-efx-scale', '1', 'End scale.'],
    ['data-efx-opacity', '-1', 'End opacity (0–1). -1 leaves opacity alone.'],
    ['data-efx-blur', '0', 'End blur in px.'],
    ['data-efx-from', '', 'Advanced start state, e.g. "y:60 opacity:0 scale:.8". Keys: x y rotate scale opacity blur.'],
    ['data-efx-to', '', 'Advanced end state, same keys. Overrides the single options.'],
    ['data-efx-start', '0', 'Progress (0–1) where the scrub begins.'],
    ['data-efx-end', '1', 'Progress (0–1) where it finishes.'],
    ['data-efx-ease', 'linear', 'linear · ease-in · ease-out · ease-in-out · ease-out-cubic · back-out · elastic-out (in/out/inout aliases), or any registered easing'],
  ],
  extend: [
    ['easing', '(t: 0..1) => number', 'Shared by scrub and counter (data-efx-ease). Return 0..1 (overshoot allowed).'],
  ],
  extendExample: `<script>
window.EffixConfig = { extend(E) {
  E.add('easing', 'steps4', t => Math.floor(t * 4) / 4);
} };
</script>
<div class="efx-scrub" data-efx-ease="steps4" data-efx-y="120"></div>`,
  vars: [
    ['--efx-p', '0', 'Written on the element: eased progress 0–1. Use it in your own CSS calc().'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-3 gap-4 text-center" style="min-height:300px;align-content:center">
  <div class="card tone-primary p-6 efx-scrub" data-efx-from="y:60 opacity:0" data-efx-to="y:0 opacity:1" data-efx-end=".5">Rises in</div>
  <div class="card tone-secondary p-6 efx-scrub" data-efx-rotate="180" data-efx-scale=".6">Spins and shrinks</div>
  <button class="btn efx-scrub" data-efx-x="-80" data-efx-blur="6">Slides and blurs</button>
</div>` },
  ],
};
