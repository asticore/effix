module.exports = {
  title: 'Polar area chart',
  group: 'Charts',
  dataFormat: `One series: each label is a sector of equal angle, its radius shows the value (linear, on concentric rings).
<code>data-spark-data="12,19,7,15,9" data-spark-labels="A|B|C|D|E"</code>, JSON <code>[{"label":"A","value":12}]</code>, CSV or a table via <code>data-spark-source</code>.`,
  summary: 'Polar area chart: equal-angle sectors whose radius is the value, drawn over grid rings. (<code>chart-pie</code> with <code>data-spark-rose</code> is the donut variant with √-scaled radius.)',
  classes: [['spark-chart-polar', 'Renders a polar area chart.']],
  options: [
    ['data-spark-data', '', '"12,19,7,15,9" · JSON.'],
    ['data-spark-labels', '', 'Sector names: "A|B|C|D|E".'],
    ['data-spark-levels', '4', 'Grid rings.'],
    ['data-spark-max', 'auto', 'Value at the outer ring.'],
    ['data-spark-pad', '0.02', 'Angular gap between sectors (radians).'],
    ['data-spark-csv', '', 'CSV text or URL: first column labels, second column values.'],
    ['data-spark-live', '', 'Live source name (see Spark.chartSource).'],
    ['data-spark-height', '320', 'Chart height in px.'],
    ['data-spark-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6".'],
    ['data-spark-prefix / suffix', '', 'Value formatting.'],
    ['data-spark-compact', 'false', '12.3k style numbers.'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [['--spark-chart-1 … 7', 'Shine tones', 'Sector colors.']],
  events: [['spark:select', 'Sector clicked / Enter pressed. detail = { index, label, value }.'], ['spark:data (listen)', 'Dispatch { labels, series } to update.']],
  examples: [
    { html: `<div class="card p-6"><h3 class="m-0 mb-3">Visits by channel</h3>
  <div class="spark-chart-polar" data-spark-data="42,28,19,12,31" data-spark-labels="Search|Social|Email|Ads|Direct"></div></div>` },
  ],
};
