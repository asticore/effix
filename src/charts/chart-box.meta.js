module.exports = {
  title: 'Box plot',
  group: 'Charts',
  dataFormat: `Raw samples per category (quartiles are computed, linear interpolation, whiskers at 1.5×IQR, the rest are outlier dots):
<code>{"labels":["A","B"],"series":[{"name":"2026","data":[[3,4,4,5,9],[6,7,7,8,8]]}]}</code>
Or precomputed, one object per category:
<code>[{"label":"A","min":1,"q1":2,"median":3,"q3":4,"max":5,"outliers":[9]}]</code>
Several series are grouped side by side (legend toggles them); labels can also come from <code>data-efx-labels</code>. Inline <code>&lt;script type="application/json"&gt;</code> works too.`,
  summary: 'Box-and-whisker plot from raw samples or precomputed five-number summaries. Hover or arrow-key through boxes for min, Q1, median, Q3, max and outlier count.',
  classes: [['efx-chart-box', 'Renders a box plot from JSON samples or summaries.']],
  options: [
    ['data-efx-data', '', 'JSON: {labels, series:[{name, data:[[samples]…]}]} or [{label,min,q1,median,q3,max,outliers}].'],
    ['data-efx-labels', '', 'Category labels: "A|B|C".'],
    ['data-efx-names', '', 'Series names for the legend.'],
    ['data-efx-horizontal', 'false', 'Horizontal boxes.'],
    ['data-efx-grid', 'true', 'Gridlines.'],
    ['data-efx-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6".'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact / decimals / format', 'false / -1', 'Number formatting (or a registered formatter name).'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no axes/tooltip).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-grid / text', 'theme', 'Gridlines and axis labels.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Box clicked / Enter pressed. detail = { index, label, value (median), series }.'],
    ['efx:data (listen)', 'Dispatch with detail { labels, series } (same shape as data-efx-data) to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Response time by region (ms)</h3>
  <div class="efx-chart-box" data-efx-suffix=" ms" data-efx-data='{"labels":["EU","US","APAC","LATAM"],"series":[{"name":"Mon","data":[[82,90,95,101,104,110,118,160],[70,74,80,83,90,92,99,150],[120,135,140,155,160,171,180,260],[100,108,111,120,133,140,150]]},{"name":"Fri","data":[[75,81,86,90,99,104,109],[66,70,73,80,85,89,93,140],[110,126,131,140,150,158,170],[95,99,105,115,121,128,132,210]]}]}'></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-box" data-efx-horizontal data-efx-height="200" data-efx-title="Salary bands" data-efx-prefix="$" data-efx-compact data-efx-data='[{"label":"Junior","min":38000,"q1":45000,"median":52000,"q3":58000,"max":66000},{"label":"Mid","min":55000,"q1":65000,"median":74000,"q3":84000,"max":96000,"outliers":[120000]},{"label":"Senior","min":80000,"q1":96000,"median":110000,"q3":128000,"max":150000,"outliers":[185000,200000]}]'></div></div>
  <div class="card p-6 efx-chart-box" data-efx-background data-efx-data='{"labels":["a","b","c","d","e"],"series":[{"data":[[1,2,3,4,5,12],[2,3,4,5,6],[4,5,6,7,8,9],[3,5,7,8,9,10],[5,6,7,8,9,15]]}]}' style="min-height:200px"><h4 class="m-0">Spread</h4><p class="m-0">A box plot as a card background.</p></div>
</div>`, label: 'Precomputed, horizontal, and as a card background' },
  ],
};
