module.exports = {
  title: 'Marimekko',
  group: 'Visualisations',
  dataFormat: `Columns = <code>data-spark-labels</code> (width ∝ column total); series = segments stacked inside each column (height ∝ share).
<code>{"labels":["Asia","Europe","US"],"series":[{"name":"Mobile","data":[40,20,30]},{"name":"Desktop","data":[10,25,25]}]}</code>
Same inputs as every Spark chart: <code>data-spark-data</code>, inline JSON script, <code>data-spark-source</code> table (first column = columns) or an <code>spark:data</code> event.`,
  summary: 'Mosaic chart: column widths show each category\'s size, stacked segments show its composition. Hover for the value, share of the column and share of the total; legend keys hide segments.',
  classes: [['spark-viz-marimekko', 'Renders a Marimekko / mosaic chart.']],
  options: [
    ['data-spark-data', '', 'Segments per column (see data format).'],
    ['data-spark-labels', '', 'Column names: "Asia|Europe|US".'],
    ['data-spark-names', '', 'Segment names.'],
    ['data-spark-inside', 'percent', 'Cell labels: <code>percent</code>, <code>value</code> or <code>none</code> (shown only where they fit).'],
    ['data-spark-gap', '2', 'Pixels between columns.'],
    ['data-spark-height', '', 'Chart height in px.'],
    ['data-spark-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6".'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-spark-compact / decimals / format', '', '12.3k style, fixed decimals, or a registered formatter name.'],
    ['data-spark-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content (no axes/tooltip).'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--spark-chart-grid / --spark-chart-text', 'muted', 'Gridlines and axis labels.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Cell clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Dispatch with detail { labels, series } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Sales by region and channel</h3>
  <div class="spark-viz-marimekko" data-spark-prefix="$" data-spark-suffix="m" data-spark-labels="North America|Europe|Asia|Africa" data-spark-data='[{"name":"Retail","data":[40,25,30,5]},{"name":"Online","data":[35,30,25,3]},{"name":"Wholesale","data":[15,20,35,6]}]'></div>
</div>` },
    { html: `<a class="btn btn-lg tone-primary spark-viz-marimekko" href="#" style="min-height:120px;min-width:16rem" data-spark-background data-spark-data='[{"name":"A","data":[5,3,6]},{"name":"B","data":[3,5,2]}]'>See the market map</a>`, label: 'As a button background' },
  ],
};
