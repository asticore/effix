/* Docs data for beam (not bundled). */
module.exports = {
  title: 'Beam connectors',
  group: 'Sections',
  summary: 'Animated SVG beams that connect elements: perfect for integration diagrams and "how it works" maps. A faint curved path with a glowing segment travelling along it. Re-routes on resize; pauses off-screen; static paths with reduced motion.',
  classes: [
    ['efx-beam', 'Container holding the nodes. Draws an overlay SVG (no pointer events) with one beam per link.'],
  ],
  options: [
    ['data-efx-links', '(none)', 'Links as from>to pairs separated by |, e.g. #a>#hub|#b>#hub. Selectors are scoped to the container.'],
    ['data-efx-curvature', '40', 'Curve height in px (0 = straight line, negative bends downward).'],
    ['data-efx-speed', '3', 'Seconds for a beam to travel its path.'],
    ['data-efx-width', '2', 'Stroke width in px.'],
    ['data-efx-color', '(Shine primary to accent)', 'Solid CSS color. Empty = gradient from --sh-primary to --sh-accent.'],
    ['data-efx-reverse', 'false', 'Travel from the second element to the first.'],
  ],
  vars: [
    ['--sh-primary', '#6366f1', 'Gradient start (Shine token).'],
    ['--sh-accent', '#ec4899', 'Gradient end (Shine token).'],
  ],
  examples: [
    { html: `<div class="efx-beam" data-efx-links="#bm-a>#bm-hub|#bm-b>#bm-hub|#bm-c>#bm-hub|#bm-hub>#bm-out" style="height:280px;display:flex;align-items:center;justify-content:space-between;padding:0 24px">
  <div class="stack gap-12">
    <div id="bm-a" class="card p-3 rounded-lg">Slack</div>
    <div id="bm-b" class="card p-3 rounded-lg">GitHub</div>
    <div id="bm-c" class="card p-3 rounded-lg">Stripe</div>
  </div>
  <div id="bm-hub" class="card p-6 rounded-lg"><strong>Hub</strong></div>
  <div id="bm-out" class="card p-3 rounded-lg">Dashboard</div>
</div>` },
  ],
};
