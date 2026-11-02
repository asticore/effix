/* Docs data for sparkles (not bundled). */
module.exports = {
  title: 'Sparkles',
  group: 'Text',
  summary: 'Twinkling stars scattered around any element: a headline, a button, a badge. Each star scales and rotates in and out, then reappears somewhere new. Off with reduced motion; pauses off-screen.',
  classes: [
    ['efx-sparkles', 'Host element. Sparkles are drawn in an overlay (no pointer events) that may overflow the element a little.'],
  ],
  options: [
    ['data-efx-count', '10', 'Number of stars (max 60).'],
    ['data-efx-color', '(theme + gold)', 'One color or a list separated by |.'],
    ['data-efx-size-min', '8', 'Smallest star in px.'],
    ['data-efx-size-max', '18', 'Largest star in px.'],
    ['data-efx-speed', '1', 'Twinkle speed multiplier.'],
    ['data-efx-shape', 'star', 'Name of a registered sparkle-shape.'],
  ],
  extend: [
    ['sparkle-shape', 'fn(size) -> svg markup string or Node', 'Draw with fill="currentColor" so the star takes its color from data-efx-color.'],
  ],
  extendExample: `<script>
window.EffixConfig = { extend(E) {
  E.add('sparkle-shape', 'dot', s => '<svg viewBox="0 0 10 10" width="' + s / 2 + '" height="' + s / 2 + '"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg>');
} };
</script>
<span class="efx-sparkles" data-efx-shape="dot" data-efx-color="#38bdf8|#a855f7"><strong>Dots instead</strong></span>`,
  vars: [
    ['--efx-color', 'Shine tone / primary', 'Used for the first color when data-efx-color is empty.'],
  ],
  examples: [
    { html: `<div class="stack gap-8 p-6" style="align-items:center">
  <h2><span class="efx-sparkles" data-efx-count="14">Make it sparkle</span></h2>
  <button class="btn efx-sparkles" data-efx-color="#fde68a|#fff|#f59e0b" data-efx-count="8">Upgrade now</button>
</div>` },
  ],
};
