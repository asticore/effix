module.exports = {
  title: 'Treemap chart',
  group: 'Charts',
  dataFormat: `One rectangle per label; area = value. First series only; zero and negative values are skipped.
<code>data-spark-data="40,25,15,10" data-spark-labels="A|B|C|D"</code>
JSON: <code>[{"label":"Cloud","value":40},{"label":"Ads","value":25}]</code> or <code>{"labels":[…],"series":[{"values":[…]}]}</code>.
A table via <code>data-spark-source</code> also works. One <code>data-spark-colors</code> value makes a shaded ramp of it; several = one color per tile.`,
  summary: 'Squarified treemap: tile area is proportional to value. Hover or arrow-key through tiles for a tooltip with share, click one to fire <code>spark:select</code>. Give it a single color in <code>data-spark-colors</code> for a one-hue ramp by rank.',
  classes: [['spark-chart-treemap', 'Renders a treemap from labels and the first data series.']],
  options: [
    ['data-spark-data', '', '"40,25,15,10" or JSON {"data":[{"label":"A","value":40}]} or {labels, series}. Only the first series is used.'],
    ['data-spark-labels', '', 'Tile labels: "Rent|Food|Travel".'],
    ['data-spark-source', '', 'CSS selector of a Shine table to read.'],
    ['data-spark-csv', '', 'CSV text or URL (.csv): header row = series names, first column = labels. Or an inline <script type="text/csv">.'],
    ['data-spark-live', '', 'Name of a live source registered with Spark.chartSource(name, (push, el) => push({ labels, series })).'],
    ['data-spark-gap', '2', 'Gap between tiles in px.'],
    ['data-spark-radius', '4', 'Tile corner radius.'],
    ['data-spark-captions', 'true', 'Print label and value inside tiles that are big enough.'],
    ['data-spark-sort', 'true', 'Largest tile first (false keeps data order).'],
    ['data-spark-colors', 'Shine tones', 'Cycled per tile; a single color gives a ramp by rank.'],
    ['data-spark-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$".'],
    ['data-spark-compact / decimals', 'false / -1', 'Number formatting.'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Tile clicked / Enter pressed. detail = { index, label, value }.'],
    ['spark:data (listen)', 'Dispatch with detail { labels, series } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Spend by category</h3>
  <div class="spark-chart-treemap" data-spark-prefix="$" data-spark-data="4200,2600,1800,1500,900,700,450,300,180" data-spark-labels="Rent|Payroll|Cloud|Marketing|Travel|Legal|Software|Meals|Other" data-spark-height="300"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-treemap" data-spark-colors="#6366f1" data-spark-gap="3" data-spark-data="52,31,22,14,9,6" data-spark-labels="Organic|Direct|Paid|Email|Social|Other" data-spark-suffix="%" data-spark-height="200" data-spark-title="Traffic sources"></div></div>
  <div class="card p-6 spark-chart-treemap" data-spark-background data-spark-gap="1" data-spark-radius="0" data-spark-data="9,7,5,4,3,2,2,1" style="min-height:200px"><h4 class="m-0">Portfolio</h4><p class="m-0">A treemap as a card background.</p></div>
</div>`, label: 'One-hue ramp, and a treemap as a card background' },
  ],
};
