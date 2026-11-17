module.exports = {
  title: 'Bullet chart',
  group: 'Charts',
  dataFormat: `One row per KPI: <code>[{"label":"Revenue","value":270,"target":300,"ranges":[150,225,300],"max":320}]</code>
<code>ranges</code> are ascending upper bounds of the qualitative bands (poor, ok, good); <code>max</code> optional (default = largest number in the row); <code>color</code> optional per row.
Or flat: <code>data-spark-data="270,45" data-spark-labels="Revenue|Profit" data-spark-targets="300|50" data-spark-ranges="150,225,300"</code>.
Each row has its own 0–max scale unless <code>data-spark-shared</code> is set (one common axis).`,
  summary: 'Stephen Few bullet chart: grayscale qualitative bands, a colored measure bar and a target tick per row. Compact enough for KPI cards; horizontal by default.',
  classes: [['spark-chart-bullet', 'Renders bullet rows from JSON rows or flat values + targets + ranges.']],
  options: [
    ['data-spark-data', '', 'JSON rows [{label, value, target, ranges:[…], max?}] or "270,45" with labels/targets/ranges.'],
    ['data-spark-labels', '', 'Row labels (flat form): "Revenue|Profit".'],
    ['data-spark-targets', '', 'Targets (flat form): "300|50" (one value = all rows).'],
    ['data-spark-ranges', '', 'Band upper bounds for every row: "150,225,300".'],
    ['data-spark-vertical', 'false', 'Columns instead of rows.'],
    ['data-spark-bar-height', '18', 'Thickness of each bullet in px (try 10 for a compact list).'],
    ['data-spark-shared', 'false', 'One common scale and axis for all rows.'],
    ['data-spark-values', 'true', 'Print the value next to each row.'],
    ['data-spark-height', '220', 'Height in px (vertical only; rows size themselves).'],
    ['data-spark-colors', 'Shine tones', 'Measure bar color.'],
    ['data-spark-prefix / suffix', '', 'Value formatting.'],
    ['data-spark-compact / decimals / format', 'false / -1', 'Number formatting (or a registered formatter name).'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: bands and bars fill the element behind its content.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--spark-chart-1', 'Shine primary', 'Measure bar.'],
    ['--spark-chart-text', 'muted text', 'Row labels.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Row clicked / Enter pressed. detail = { index, label, value }.'],
    ['spark:data (listen)', 'Dispatch with detail as a rows array [{label,value,target,ranges}] (or { labels, series }) to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Quarterly KPIs</h3>
  <div class="spark-chart-bullet" data-spark-data='[{"label":"Revenue","value":270,"target":300,"ranges":[150,225,300]},{"label":"Profit","value":24,"target":28,"ranges":[15,22,30]},{"label":"Orders","value":1420,"target":1200,"ranges":[800,1100,1500]},{"label":"Satisfaction","value":4.2,"target":4.5,"ranges":[3,4,5]}]'></div>
</div>` },
    { html: `<div class="grid md:grid-cols-3 gap-4">
  <div class="card p-4"><small class="muted">Signups</small><div class="spark-chart-bullet" data-spark-bar-height="10" data-spark-legend="false" data-spark-data='[{"label":"","value":840,"target":900,"ranges":[500,750,1000]}]' data-spark-title="Signups vs target"></div></div>
  <div class="card p-4"><small class="muted">Uptime %</small><div class="spark-chart-bullet" data-spark-bar-height="10" data-spark-suffix="%" data-spark-data='[{"label":"","value":99.2,"target":99.9,"ranges":[97,99,100]}]' data-spark-title="Uptime vs target"></div></div>
  <a class="btn btn-lg tone-accent spark-chart-bullet" href="#" style="min-height:90px" data-spark-background data-spark-data='[{"label":"","value":7,"target":9,"ranges":[4,7,10]}]'>Goal: 7 of 10</a>
</div>`, label: 'KPI stat cards, and a bullet as a button background' },
  ],
};
