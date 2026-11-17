module.exports = {
  title: 'Bar chart',
  group: 'Charts',
  dataFormat: `Categories = <code>data-spark-labels</code>, one number per category per series.
<code>data-spark-data="12,19,7"</code> (one series) or <code>"3,5|4,1"</code> (several, split by <code>|</code>).
JSON: <code>[[3,5],[4,1]]</code> · <code>[{"name":"2025","data":[3,5]},{"name":"2026","data":[4,1]}]</code> · <code>[{"label":"Q1","value":3}]</code>.
Also <code>{"labels":[…],"series":[{"name","values"}]}</code>, an inline <code>&lt;script type="application/json"&gt;</code>, or a table via <code>data-spark-source</code> (first column = labels, other columns = series).
Per-series color: <code>{"name":"A","data":[…],"color":"#f43f5e"}</code>.`,
  summary: 'Vertical or horizontal bars, grouped or stacked. Hover or arrow-key through bars for tooltips, click a legend key to hide a series, click a bar to fire <code>spark:select</code>.',
  classes: [['spark-chart-bar', 'Renders a bar chart from data-spark-data, inline JSON or a table.']],
  options: [
    ['data-spark-data', '', '"12,19,7" · several series "3,5|4,1" · JSON [[3,5],[4,1]] or [{"name":"A","data":[…]}]'],
    ['data-spark-labels', '', 'Category labels: "Q1|Q2|Q3".'],
    ['data-spark-names', '', 'Series names: "2025|2026".'],
    ['data-spark-source', '', 'CSS selector of a Shine table to read (first column = labels).'],
    ['data-spark-csv', '', 'CSV text or URL (.csv): header row = series names, first column = labels. Or an inline <script type="text/csv">.'],
    ['data-spark-live', '', 'Name of a live source registered with Spark.chartSource(name, (push, el) => push({ labels, series })).'],
    ['data-spark-horizontal', 'false', 'Horizontal bars.'],
    ['data-spark-stacked', 'false', 'Stack series instead of grouping.'],
    ['data-spark-style', 'bar', '<code>lollipop</code> draws a stick and a dot instead of a bar.'],
    ['data-spark-radial', 'false', 'Circular barplot: bars radiate from an inner circle, labels around the ring (works stacked or grouped).'],
    ['data-spark-normalize', 'false', '100% stacked: every category is scaled to 100% (tooltip shows % and raw value).'],
    ['data-spark-diverging', 'false', 'Negative values extend left/down from a centred zero line; with one series negatives use the danger colour.'],
    ['data-spark-values', 'false', 'Print values on the bars.'],
    ['data-spark-radius', '4', 'Bar corner radius.'],
    ['data-spark-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'Series colors "#f43f5e|#8b5cf6".'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-spark-compact', 'false', '12.3k style numbers.'],
    ['data-spark-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-spark-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content (no axes/tooltip).'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--spark-chart-grid', 'border color', 'Gridlines.'],
    ['--spark-chart-text', 'muted text', 'Axis labels.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Bar clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Revenue</h3>
  <div class="spark-chart-bar" data-spark-data="[[42,58,51,77],[30,45,62,70]]" data-spark-names="2025|2026" data-spark-labels="Q1|Q2|Q3|Q4" data-spark-prefix="$" data-spark-suffix="k"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-bar" data-spark-horizontal data-spark-values data-spark-data="82,64,51,33" data-spark-labels="Chrome|Safari|Edge|Firefox" data-spark-suffix="%" data-spark-height="200" data-spark-title="Browser share"></div></div>
  <a class="btn btn-lg tone-accent spark-chart-bar" href="#" style="min-height:120px" data-spark-background data-spark-data="3,5,4,7,6,9,8,12">Sales up 24%</a>
</div>`, label: 'Horizontal with values, and a chart as a button background' },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><h4 class="m-0 mb-2">Lollipop</h4><div class="spark-chart-bar" data-spark-style="lollipop" data-spark-values data-spark-height="200" data-spark-data="42,68,35,81,56" data-spark-labels="Mon|Tue|Wed|Thu|Fri"></div></div>
  <div class="card p-6"><h4 class="m-0 mb-2">Radial</h4><div class="spark-chart-bar" data-spark-radial data-spark-height="240" data-spark-data="12,19,7,24,15,9,21,17" data-spark-labels="Jan|Feb|Mar|Apr|May|Jun|Jul|Aug"></div></div>
  <div class="card p-6"><h4 class="m-0 mb-2">100% stacked</h4><div class="spark-chart-bar" data-spark-normalize data-spark-height="220" data-spark-data="[[30,20,50],[50,45,30],[20,35,20]]" data-spark-names="Free|Pro|Team" data-spark-labels="Q1|Q2|Q3"></div></div>
  <div class="card p-6"><h4 class="m-0 mb-2">Diverging</h4><div class="spark-chart-bar" data-spark-diverging data-spark-horizontal data-spark-values data-spark-height="220" data-spark-data="35,-18,12,-42,27" data-spark-labels="North|East|South|West|Centre"></div></div>
</div>`, label: 'Lollipop, radial, 100% stacked and diverging variants' },
  ],
};
