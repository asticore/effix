module.exports = {
  title: 'Sunburst chart',
  group: 'Charts',
  dataFormat: `A tree: <code>{"name":"All","children":[{"name":"EU","children":[{"name":"FR","value":4},{"name":"DE","value":7}]},{"name":"US","value":12}]}</code>
Leaves carry <code>value</code>; a parent's value is the sum of its children. A bare array is treated as the children of an unnamed root.
Colors follow the top-level branches (deeper rings are lighter). Click an arc to zoom into it, click the center to go back up.
Inline <code>&lt;script type="application/json"&gt;</code> works too; live update with <code>spark:data</code> and a tree as detail.`,
  summary: 'Radial hierarchy: one ring per depth, arc angle = value. Hover highlights the ancestor path and shows it in the center, click zooms into a branch, click the center to go up. Arrow keys and Enter work too.',
  classes: [['spark-chart-sunburst', 'Renders a sunburst from a JSON tree.']],
  options: [
    ['data-spark-data', '', 'JSON tree {name, value?, children:[…]}.'],
    ['data-spark-depth', '4', 'Rings shown at once (zooming reveals deeper levels).'],
    ['data-spark-captions', 'true', 'Print names on arcs that are big enough.'],
    ['data-spark-height', '320', 'Chart height in px.'],
    ['data-spark-colors', 'Shine tones', 'One color per top-level branch.'],
    ['data-spark-prefix / suffix', '', 'Value formatting.'],
    ['data-spark-compact / decimals / format', 'false / -1', 'Number formatting (or a registered formatter name).'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: a quiet sunburst behind the element\'s content.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Branch colors.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Arc clicked / Enter pressed (index -1 = center, going up). detail = { index, label, value }. Zooming happens on the same click.'],
    ['spark:data (listen)', 'Dispatch with a tree as detail to replace the data and reset the zoom.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Budget by team</h3>
  <div class="spark-chart-sunburst" data-spark-prefix="$" data-spark-suffix="k" data-spark-data='{"name":"Company","children":[{"name":"Engineering","children":[{"name":"Platform","children":[{"name":"Infra","value":420},{"name":"Data","value":310}]},{"name":"Product","children":[{"name":"Web","value":380},{"name":"Mobile","value":260}]}]},{"name":"Sales","children":[{"name":"EMEA","value":300},{"name":"AMER","value":420},{"name":"APAC","value":180}]},{"name":"Ops","children":[{"name":"People","value":210},{"name":"Finance","value":150},{"name":"Legal","value":90}]}]}'></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6 text-center"><div class="spark-chart-sunburst" data-spark-height="140" data-spark-depth="2" data-spark-legend="false" data-spark-title="Disk usage" data-spark-suffix=" GB" data-spark-data='[{"name":"Apps","value":120},{"name":"Media","children":[{"name":"Photos","value":210},{"name":"Video","value":340}]},{"name":"System","value":60}]'></div><p class="m-0 mt-2">Disk usage</p></div>
  <div class="card p-6 spark-chart-sunburst" data-spark-background data-spark-data='{"name":"x","children":[{"name":"a","children":[{"name":"a1","value":3},{"name":"a2","value":2}]},{"name":"b","children":[{"name":"b1","value":4},{"name":"b2","value":1}]},{"name":"c","value":3}]}' style="min-height:200px"><h4 class="m-0">Storage</h4><p class="m-0">A sunburst as a card background.</p></div>
</div>`, label: 'A tiny stat-card sunburst, and a card background' },
  ],
};
