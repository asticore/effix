module.exports = {
  title: 'Quadrant matrix',
  group: 'Diagrams',
  dataFormat: `A list of items, each with a position: <code>[{"label":"Search","x":20,"y":80},{"label":"Rewrite","x":85,"y":70,"r":8,"group":"Core"}]</code>.
<code>x</code> and <code>y</code> run 0–100 unless you set <code>data-spark-x-domain="0,10"</code> / <code>data-spark-y-domain</code>. Optional <code>r</code> sizes the dot (bubble) and <code>group</code> colors it.
Quadrants are named top-left | top-right | bottom-left | bottom-right in <code>data-spark-quadrants</code>.
Data can sit in <code>data-spark-data</code>, an inline <code>&lt;script type="application/json"&gt;</code>, or arrive through <code>spark:data</code> as an array (or <code>{items:[…]}</code>).`,
  summary: 'Prioritisation 2×2 with tinted quadrants, axis titles and labelled dots whose labels nudge apart when they would collide. Hover or arrow-key for details, click a dot to fire <code>spark:select</code>.',
  classes: [['spark-chart-quadrant', 'Renders a 2×2 matrix from a list of {label, x, y} items.']],
  options: [
    ['data-spark-data', '', 'JSON items [{"label","x","y","r?","group?"}].'],
    ['data-spark-quadrants', '', 'Names "Quick wins|Big bets|Fill-ins|Money pits" (top-left, top-right, bottom-left, bottom-right).'],
    ['data-spark-x-label / y-label', '', 'Axis titles, e.g. "Effort →".'],
    ['data-spark-x-domain / y-domain', '0,100', 'Value range of each axis, e.g. "0,10".'],
    ['data-spark-height', '360', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'Palette; groups and quadrant tints use it in order.'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: tinted quadrants and dots only, behind the content.'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--spark-chart-text', 'muted text', 'Axis titles and quadrant names.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Dot clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Dispatch on the chart with detail = an items array to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Roadmap bets</h3>
  <div class="spark-chart-quadrant" data-spark-quadrants="Quick wins|Big bets|Fill-ins|Money pits" data-spark-x-label="Effort →" data-spark-y-label="Impact →"
    data-spark-data='[{"label":"Onboarding","x":22,"y":82,"group":"Growth"},{"label":"Search","x":30,"y":68,"group":"Core"},{"label":"Rewrite API","x":84,"y":78,"group":"Core"},{"label":"Mobile app","x":78,"y":60,"group":"Growth"},{"label":"Dark mode","x":18,"y":32,"group":"Polish"},{"label":"Legacy sync","x":88,"y":18,"group":"Core"},{"label":"Emoji","x":40,"y":12,"group":"Polish"}]'></div>
</div>` },
    { html: `<div class="card p-6 spark-chart-quadrant" data-spark-background data-spark-data='[{"label":"A","x":20,"y":75,"r":4},{"label":"B","x":70,"y":60,"r":9},{"label":"C","x":40,"y":25,"r":6},{"label":"D","x":82,"y":20,"r":3}]'>
  <h3 class="m-0">Portfolio health</h3><p class="m-0">The matrix sits behind this card as a background.</p>
</div>`, label: 'A quadrant as a card background' },
  ],
};
