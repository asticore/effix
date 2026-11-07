module.exports = {
  title: 'Quadrant matrix',
  group: 'Diagrams',
  dataFormat: `A list of items, each with a position: <code>[{"label":"Search","x":20,"y":80},{"label":"Rewrite","x":85,"y":70,"r":8,"group":"Core"}]</code>.
<code>x</code> and <code>y</code> run 0–100 unless you set <code>data-efx-x-domain="0,10"</code> / <code>data-efx-y-domain</code>. Optional <code>r</code> sizes the dot (bubble) and <code>group</code> colors it.
Quadrants are named top-left | top-right | bottom-left | bottom-right in <code>data-efx-quadrants</code>.
Data can sit in <code>data-efx-data</code>, an inline <code>&lt;script type="application/json"&gt;</code>, or arrive through <code>efx:data</code> as an array (or <code>{items:[…]}</code>).`,
  summary: 'Prioritisation 2×2 with tinted quadrants, axis titles and labelled dots whose labels nudge apart when they would collide. Hover or arrow-key for details, click a dot to fire <code>efx:select</code>.',
  classes: [['efx-chart-quadrant', 'Renders a 2×2 matrix from a list of {label, x, y} items.']],
  options: [
    ['data-efx-data', '', 'JSON items [{"label","x","y","r?","group?"}].'],
    ['data-efx-quadrants', '', 'Names "Quick wins|Big bets|Fill-ins|Money pits" (top-left, top-right, bottom-left, bottom-right).'],
    ['data-efx-x-label / y-label', '', 'Axis titles, e.g. "Effort →".'],
    ['data-efx-x-domain / y-domain', '0,100', 'Value range of each axis, e.g. "0,10".'],
    ['data-efx-height', '360', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Palette; groups and quadrant tints use it in order.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: tinted quadrants and dots only, behind the content.'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-text', 'muted text', 'Axis titles and quadrant names.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Dot clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch on the chart with detail = an items array to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Roadmap bets</h3>
  <div class="efx-chart-quadrant" data-efx-quadrants="Quick wins|Big bets|Fill-ins|Money pits" data-efx-x-label="Effort →" data-efx-y-label="Impact →"
    data-efx-data='[{"label":"Onboarding","x":22,"y":82,"group":"Growth"},{"label":"Search","x":30,"y":68,"group":"Core"},{"label":"Rewrite API","x":84,"y":78,"group":"Core"},{"label":"Mobile app","x":78,"y":60,"group":"Growth"},{"label":"Dark mode","x":18,"y":32,"group":"Polish"},{"label":"Legacy sync","x":88,"y":18,"group":"Core"},{"label":"Emoji","x":40,"y":12,"group":"Polish"}]'></div>
</div>` },
    { html: `<div class="card p-6 efx-chart-quadrant" data-efx-background data-efx-data='[{"label":"A","x":20,"y":75,"r":4},{"label":"B","x":70,"y":60,"r":9},{"label":"C","x":40,"y":25,"r":6},{"label":"D","x":82,"y":20,"r":3}]'>
  <h3 class="m-0">Portfolio health</h3><p class="m-0">The matrix sits behind this card as a background.</p>
</div>`, label: 'A quadrant as a card background' },
  ],
};
