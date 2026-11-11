module.exports = {
  title: 'Circle packing',
  group: 'Visualisations',
  dataFormat: `Hierarchy JSON: <code>{"name","value?","children":[…]}</code>. Leaves carry <code>value</code> (default 1), parents sum their children.
Example: <code>{"name":"root","children":[{"name":"a","value":3},{"name":"b","children":[{"name":"c","value":2},{"name":"d","value":1}]}]}</code>`,
  summary: 'Nested circles packed by value. Click a circle to zoom into it (animated), click the background or the focused circle to zoom back out. Leaf labels appear when they fit.',
  classes: [['efx-viz-pack', 'Renders circle packing from hierarchy JSON.']],
  options: [
    ['data-efx-data', '', 'Hierarchy JSON (see data format).'],
    ['data-efx-padding', '0.15', 'Gap between circles, as a fraction of the average leaf radius.'],
    ['data-efx-height', '420', 'Chart height in px.'],
    ['data-efx-colors', 'Shine tones', 'Colors for top-level branches.'],
    ['data-efx-prefix / suffix / compact', '', 'Value formatting.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off (animate off = instant zoom).'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Branch palette.']],
  events: [
    ['efx:select', 'Circle clicked / Enter (also zooms). detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch with a new hierarchy as detail.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Bundle size by package</h3>
  <div class="efx-viz-pack" data-efx-suffix=" kB" data-efx-data='{"name":"app","children":[{"name":"ui","children":[{"name":"button","value":12},{"name":"modal","value":22},{"name":"table","value":40},{"name":"form","value":31}]},{"name":"data","children":[{"name":"store","value":28},{"name":"cache","value":17},{"name":"api","value":24}]},{"name":"charts","children":[{"name":"bar","value":9},{"name":"line","value":11},{"name":"pie","value":8},{"name":"map","value":35},{"name":"axes","value":14}]},{"name":"utils","children":[{"name":"dates","value":19},{"name":"i18n","value":26}]}]}'></div>
</div>` },
    { html: `<div class="card p-6 efx-viz-pack" data-efx-background data-efx-height="0" style="min-height:160px" data-efx-data='{"name":"r","children":[{"name":"a","value":5},{"name":"b","value":3},{"name":"c","children":[{"name":"d","value":2},{"name":"e","value":2}]}]}'><strong>Portfolio</strong></div>`, label: 'As a card background' },
  ],
};
