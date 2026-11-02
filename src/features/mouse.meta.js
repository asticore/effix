/* Docs data for mouse (not bundled). */
module.exports = {
  title: 'Mouse parallax',
  group: 'Pointer',
  summary: 'Layered depth parallax: the container (or children with data-efx-depth) glide against the pointer. Uses the translate/rotate properties, so Shine transforms are untouched. Fine pointers and motion-OK only.',
  classes: [
    ['efx-mouse', 'Container whose layers follow the pointer.'],
  ],
  options: [
    ['data-efx-strength', '20', 'Max shift in px at depth 1.'],
    ['data-efx-scope', 'self', 'self = pointer inside the container · page = pointer anywhere in the viewport.'],
    ['data-efx-invert', 'false', 'Move with the pointer instead of against it.'],
    ['data-efx-rotate', '0', 'Max rotateZ in degrees per layer.'],
    ['data-efx-ease', '0.12', 'Smoothing per frame (0.01 slow – 1 instant).'],
    ['data-efx-depth', '', 'On a child layer: multiplier of strength (e.g. 0.2 far, 1 near, negative = opposite).'],
  ],
  vars: [],
  examples: [
    { html: `<div class="efx-mouse card p-6 rounded-lg" data-efx-strength="40" data-efx-rotate="6" style="min-height:260px;position:relative;overflow:hidden">
  <div class="rounded-lg tone-primary" data-efx-depth="0.3" style="position:absolute;left:12%;top:20%;width:90px;height:90px;background:var(--sh-primary,#4f46e5);opacity:.35"></div>
  <div class="rounded-lg" data-efx-depth="0.7" style="position:absolute;right:15%;top:30%;width:60px;height:60px;background:var(--sh-accent,#db2777);opacity:.5"></div>
  <h3 data-efx-depth="1" style="position:relative;text-align:center;margin-top:90px">Move the pointer</h3>
</div>` },
  ],
};
