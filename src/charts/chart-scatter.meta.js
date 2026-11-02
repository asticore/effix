module.exports = {
  title: 'Scatter chart',
  group: 'Charts',
  summary: 'Scatter and bubble plots on two linear axes. Hover (or arrow through, left to right) for a tooltip with x, y and size; click a legend key to hide a series.',
  classes: [['efx-chart-scatter', 'Renders a scatter / bubble chart from data-efx-data or inline JSON points.']],
  options: [
    ['data-efx-data', '', 'JSON points [{"x":1,"y":4,"r":3,"label":"A"}] · several series [[{…}],[{…}]] or [{"name":"A","points":[…]}].'],
    ['data-efx-names', '', 'Series names: "2025|2026".'],
    ['data-efx-x-label / y-label', '', 'Axis titles (also used in the tooltip).'],
    ['data-efx-bubble', 'false', 'Size points by r (radius scales with the square root, up to 24px).'],
    ['data-efx-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Series colors "#f43f5e|#8b5cf6".'],
    ['data-efx-prefix / suffix / compact / decimals', '', 'Formatting for y values and y ticks.'],
    ['data-efx-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-grid / --efx-chart-text', 'border / muted', 'Gridlines and axis text.'],
  ],
  events: [
    ['efx:select', 'Point clicked / Enter pressed. detail = { index, label, value (y), series }.'],
    ['efx:data (listen)', 'Dispatch with detail { series: [{ name, points: [{x,y,r?,label?}] }] } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Price vs rating</h3>
  <div class="efx-chart-scatter" data-efx-x-label="Price ($)" data-efx-y-label="Rating" data-efx-names="Apps|Games" data-efx-data='[[{"x":5,"y":3.8},{"x":12,"y":4.1},{"x":20,"y":4.5},{"x":28,"y":4.2},{"x":35,"y":4.8},{"x":8,"y":3.5}],[{"x":3,"y":4.4},{"x":9,"y":4.0},{"x":15,"y":3.6},{"x":22,"y":3.9},{"x":30,"y":3.2}]]'></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-scatter" data-efx-bubble data-efx-height="220" data-efx-x-label="Users" data-efx-y-label="Revenue" data-efx-prefix="$" data-efx-suffix="k" data-efx-data='[{"x":10,"y":20,"r":4,"label":"Alpha"},{"x":25,"y":45,"r":12,"label":"Beta"},{"x":40,"y":30,"r":8,"label":"Gamma"},{"x":55,"y":70,"r":20,"label":"Delta"},{"x":70,"y":55,"r":6,"label":"Epsilon"}]'></div></div>
  <div class="card p-6 efx-chart-scatter" style="min-height:180px" data-efx-background data-efx-bubble data-efx-data='[{"x":1,"y":3,"r":3},{"x":2,"y":6,"r":8},{"x":3,"y":2,"r":5},{"x":4,"y":7,"r":12},{"x":5,"y":4,"r":4},{"x":6,"y":8,"r":9}]'><h3 class="m-0">Customers</h3><p class="m-0">Clusters by size</p></div>
</div>`, label: 'Bubble chart, and bubbles as a card background' },
  ],
};
