module.exports = {
  title: 'Marimekko',
  group: 'Visualisations',
  dataFormat: `Columns = <code>data-efx-labels</code> (width ∝ column total); series = segments stacked inside each column (height ∝ share).
<code>{"labels":["Asia","Europe","US"],"series":[{"name":"Mobile","data":[40,20,30]},{"name":"Desktop","data":[10,25,25]}]}</code>
Same inputs as every Effix chart: <code>data-efx-data</code>, inline JSON script, <code>data-efx-source</code> table (first column = columns) or an <code>efx:data</code> event.`,
  summary: 'Mosaic chart: column widths show each category\'s size, stacked segments show its composition. Hover for the value, share of the column and share of the total; legend keys hide segments.',
  classes: [['efx-viz-marimekko', 'Renders a Marimekko / mosaic chart.']],
  options: [
    ['data-efx-data', '', 'Segments per column (see data format).'],
    ['data-efx-labels', '', 'Column names: "Asia|Europe|US".'],
    ['data-efx-names', '', 'Segment names.'],
    ['data-efx-inside', 'percent', 'Cell labels: <code>percent</code>, <code>value</code> or <code>none</code> (shown only where they fit).'],
    ['data-efx-gap', '2', 'Pixels between columns.'],
    ['data-efx-height', '', 'Chart height in px.'],
    ['data-efx-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6".'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact / decimals / format', '', '12.3k style, fixed decimals, or a registered formatter name.'],
    ['data-efx-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no axes/tooltip).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-grid / --efx-chart-text', 'muted', 'Gridlines and axis labels.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Cell clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch with detail { labels, series } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Sales by region and channel</h3>
  <div class="efx-viz-marimekko" data-efx-prefix="$" data-efx-suffix="m" data-efx-labels="North America|Europe|Asia|Africa" data-efx-data='[{"name":"Retail","data":[40,25,30,5]},{"name":"Online","data":[35,30,25,3]},{"name":"Wholesale","data":[15,20,35,6]}]'></div>
</div>` },
    { html: `<a class="btn btn-lg tone-primary efx-viz-marimekko" href="#" style="min-height:120px;min-width:16rem" data-efx-background data-efx-data='[{"name":"A","data":[5,3,6]},{"name":"B","data":[3,5,2]}]'>See the market map</a>`, label: 'As a button background' },
  ],
};
