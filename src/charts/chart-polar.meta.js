module.exports = {
  title: 'Polar area chart',
  group: 'Charts',
  dataFormat: `One series: each label is a sector of equal angle, its radius shows the value (linear, on concentric rings).
<code>data-efx-data="12,19,7,15,9" data-efx-labels="A|B|C|D|E"</code>, JSON <code>[{"label":"A","value":12}]</code>, CSV or a table via <code>data-efx-source</code>.`,
  summary: 'Polar area chart: equal-angle sectors whose radius is the value, drawn over grid rings. (<code>chart-pie</code> with <code>data-efx-rose</code> is the donut variant with √-scaled radius.)',
  classes: [['efx-chart-polar', 'Renders a polar area chart.']],
  options: [
    ['data-efx-data', '', '"12,19,7,15,9" · JSON.'],
    ['data-efx-labels', '', 'Sector names: "A|B|C|D|E".'],
    ['data-efx-levels', '4', 'Grid rings.'],
    ['data-efx-max', 'auto', 'Value at the outer ring.'],
    ['data-efx-pad', '0.02', 'Angular gap between sectors (radians).'],
    ['data-efx-csv', '', 'CSV text or URL: first column labels, second column values.'],
    ['data-efx-live', '', 'Live source name (see Effix.chartSource).'],
    ['data-efx-height', '320', 'Chart height in px.'],
    ['data-efx-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6".'],
    ['data-efx-prefix / suffix', '', 'Value formatting.'],
    ['data-efx-compact', 'false', '12.3k style numbers.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Sector colors.']],
  events: [['efx:select', 'Sector clicked / Enter pressed. detail = { index, label, value }.'], ['efx:data (listen)', 'Dispatch { labels, series } to update.']],
  examples: [
    { html: `<div class="card p-6"><h3 class="m-0 mb-3">Visits by channel</h3>
  <div class="efx-chart-polar" data-efx-data="42,28,19,12,31" data-efx-labels="Search|Social|Email|Ads|Direct"></div></div>` },
  ],
};
