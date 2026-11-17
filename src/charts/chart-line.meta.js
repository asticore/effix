module.exports = {
  title: 'Line chart',
  group: 'Charts',
  dataFormat: `Same shapes as the bar chart: one value per label per series.
<code>data-spark-data="3,5,4,8"</code> · <code>"3,5,4|2,4,6"</code> (two series) · JSON <code>[[3,5],[4,1]]</code>.
Named series: <code>[{"name":"Visits","data":[3,5,4]},{"name":"Signups","data":[1,2,2]}]</code>.
Labels: <code>data-spark-labels="Mon|Tue|Wed"</code> or <code>{"labels":[…],"series":[…]}</code>; a table via <code>data-spark-source</code> also works.
<code>data-spark-stacked</code> stacks series (areas); values are plain numbers (no dates).`,
  summary: 'Multi-series lines with optional gradient area or stacked area. A crosshair snaps to the nearest point and the tooltip lists every visible series at that x. Arrow keys step through x positions, legend keys toggle series.',
  classes: [['spark-chart-line', 'Renders a line / area chart from data-spark-data, inline JSON or a table.']],
  options: [
    ['data-spark-data', '', '"3,5,4" · several series "3,5|4,1" · JSON [[3,5],[4,1]] or [{"name":"A","data":[…]}]'],
    ['data-spark-labels', '', 'X labels: "Mon|Tue|Wed".'],
    ['data-spark-names', '', 'Series names: "2025|2026".'],
    ['data-spark-source', '', 'CSS selector of a Shine table to read (first column = labels).'],
    ['data-spark-csv', '', 'CSV text or URL (.csv): header row = series names, first column = labels. Or an inline <script type="text/csv">.'],
    ['data-spark-live', '', 'Name of a live source registered with Spark.chartSource(name, (push, el) => push({ labels, series })).'],
    ['data-spark-area', 'false', 'Gradient fill under each line (35% → 0 of the series color).'],
    ['data-spark-stacked', 'false', 'Stacked area (implies area).'],
    ['data-spark-stream', 'false', 'Streamgraph: stacked areas around a centred wiggle baseline (no y axis), smooth. Tooltip still shows real values.'],
    ['data-spark-smooth', 'true', 'Monotone curve; false = straight segments.'],
    ['data-spark-dots', 'true', 'Always-visible dots; false shows them only under the crosshair.'],
    ['data-spark-grid', 'true', 'Horizontal gridlines.'],
    ['data-spark-min', '(auto)', 'Y axis minimum; empty = automatic.'],
    ['data-spark-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'Series colors "#f43f5e|#8b5cf6".'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-spark-compact / decimals', 'false / -1', '12.3k style numbers / fixed decimals.'],
    ['data-spark-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content (lines/areas only).'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--spark-chart-grid / --spark-chart-text', 'border / muted', 'Gridlines and axis text.'],
  ],
  events: [
    ['spark:select', 'Point clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Visitors</h3>
  <div class="spark-chart-line" data-spark-area data-spark-data="[[120,180,150,240,210,320,290],[80,110,140,130,190,200,260]]" data-spark-names="Web|Mobile" data-spark-labels="Mon|Tue|Wed|Thu|Fri|Sat|Sun"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-line" data-spark-stacked data-spark-height="200" data-spark-dots="false" data-spark-data="[[4,6,5,8,7],[3,4,6,5,9],[2,3,3,4,5]]" data-spark-names="Free|Pro|Team" data-spark-labels="Jan|Feb|Mar|Apr|May" data-spark-title="Signups by plan"></div></div>
  <div class="card p-6 spark-chart-line" style="min-height:160px" data-spark-background data-spark-area data-spark-data="12,18,14,22,19,28,26,34"><h3 class="m-0">Revenue</h3><p class="m-0">$34k this week</p></div>
</div>`, label: 'Stacked area with hover-only dots, and a card with a line chart behind its content' },
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Listening by genre</h3>
  <div class="spark-chart-line" data-spark-stream data-spark-height="220" data-spark-dots="false" data-spark-data="[[3,5,9,12,8,5,3,2],[2,4,6,9,11,9,6,4],[5,5,4,4,6,8,9,10],[1,2,2,4,5,6,5,4]]" data-spark-names="Rock|Jazz|Pop|Folk" data-spark-labels="2018|2019|2020|2021|2022|2023|2024|2025"></div>
</div>`, label: 'Streamgraph' },
  ],
};
