module.exports = {
  title: 'Scatter chart',
  group: 'Charts',
  dataFormat: `Points are <code>{x, y}</code> objects; add <code>r</code> (size, with <code>data-spark-bubble</code>) and <code>label</code> if wanted.
<code>data-spark-data='[{"x":1,"y":4},{"x":3,"y":7,"r":5,"label":"A"}]'</code>
Several series: <code>[[{"x":1,"y":4}],[{"x":2,"y":5}]]</code> or <code>[{"name":"Plan A","points":[{"x":1,"y":4}]}]</code>.
Also <code>{"series":[…]}</code> or an inline <code>&lt;script type="application/json"&gt;</code>. Axis titles: <code>data-spark-x-label</code> / <code>data-spark-y-label</code>.`,
  summary: 'Scatter and bubble plots on two linear axes. Hover (or arrow through, left to right) for a tooltip with x, y and size; click a legend key to hide a series.',
  classes: [['spark-chart-scatter', 'Renders a scatter / bubble chart from data-spark-data or inline JSON points.']],
  options: [
    ['data-spark-data', '', 'JSON points [{"x":1,"y":4,"r":3,"label":"A"}] · several series [[{…}],[{…}]] or [{"name":"A","points":[…]}].'],
    ['data-spark-names', '', 'Series names: "2025|2026".'],
    ['data-spark-x-label / y-label', '', 'Axis titles (also used in the tooltip).'],
    ['data-spark-connected', 'false', 'Join each series\' points in data order with a line and an arrow at the end (trajectories, paths over time).'],
    ['data-spark-bubble', 'false', 'Size points by r (radius scales with the square root, up to 24px).'],
    ['data-spark-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'Series colors "#f43f5e|#8b5cf6".'],
    ['data-spark-prefix / suffix / compact / decimals', '', 'Formatting for y values and y ticks.'],
    ['data-spark-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--spark-chart-grid / --spark-chart-text', 'border / muted', 'Gridlines and axis text.'],
  ],
  events: [
    ['spark:select', 'Point clicked / Enter pressed. detail = { index, label, value (y), series }.'],
    ['spark:data (listen)', 'Dispatch with detail { series: [{ name, points: [{x,y,r?,label?}] }] } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Price vs rating</h3>
  <div class="spark-chart-scatter" data-spark-x-label="Price ($)" data-spark-y-label="Rating" data-spark-names="Apps|Games" data-spark-data='[[{"x":5,"y":3.8},{"x":12,"y":4.1},{"x":20,"y":4.5},{"x":28,"y":4.2},{"x":35,"y":4.8},{"x":8,"y":3.5}],[{"x":3,"y":4.4},{"x":9,"y":4.0},{"x":15,"y":3.6},{"x":22,"y":3.9},{"x":30,"y":3.2}]]'></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-scatter" data-spark-bubble data-spark-height="220" data-spark-x-label="Users" data-spark-y-label="Revenue" data-spark-prefix="$" data-spark-suffix="k" data-spark-data='[{"x":10,"y":20,"r":4,"label":"Alpha"},{"x":25,"y":45,"r":12,"label":"Beta"},{"x":40,"y":30,"r":8,"label":"Gamma"},{"x":55,"y":70,"r":20,"label":"Delta"},{"x":70,"y":55,"r":6,"label":"Epsilon"}]'></div></div>
  <div class="card p-6 spark-chart-scatter" style="min-height:180px" data-spark-background data-spark-bubble data-spark-data='[{"x":1,"y":3,"r":3},{"x":2,"y":6,"r":8},{"x":3,"y":2,"r":5},{"x":4,"y":7,"r":12},{"x":5,"y":4,"r":4},{"x":6,"y":8,"r":9}]'><h3 class="m-0">Customers</h3><p class="m-0">Clusters by size</p></div>
</div>`, label: 'Bubble chart, and bubbles as a card background' },
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Unemployment vs inflation, 2015-2024</h3>
  <div class="spark-chart-scatter" data-spark-connected data-spark-height="240" data-spark-x-label="Unemployment %" data-spark-y-label="Inflation %" data-spark-data='[{"x":5.3,"y":0.1,"label":"2015"},{"x":4.9,"y":1.3,"label":"2016"},{"x":4.4,"y":2.1,"label":"2017"},{"x":3.9,"y":2.4,"label":"2018"},{"x":3.7,"y":1.8,"label":"2019"},{"x":8.1,"y":1.2,"label":"2020"},{"x":5.4,"y":4.7,"label":"2021"},{"x":3.6,"y":8,"label":"2022"},{"x":3.6,"y":4.1,"label":"2023"},{"x":4,"y":2.9,"label":"2024"}]'></div>
</div>`, label: 'Connected scatter (path with arrow)' },
  ],
};
