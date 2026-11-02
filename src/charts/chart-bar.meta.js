module.exports = {
  title: 'Bar chart',
  group: 'Charts',
  summary: 'Vertical or horizontal bars, grouped or stacked. Hover or arrow-key through bars for tooltips, click a legend key to hide a series, click a bar to fire <code>efx:select</code>.',
  classes: [['efx-chart-bar', 'Renders a bar chart from data-efx-data, inline JSON or a table.']],
  options: [
    ['data-efx-data', '', '"12,19,7" · several series "3,5|4,1" · JSON [[3,5],[4,1]] or [{"name":"A","data":[…]}]'],
    ['data-efx-labels', '', 'Category labels: "Q1|Q2|Q3".'],
    ['data-efx-names', '', 'Series names: "2025|2026".'],
    ['data-efx-source', '', 'CSS selector of a Shine table to read (first column = labels).'],
    ['data-efx-horizontal', 'false', 'Horizontal bars.'],
    ['data-efx-stacked', 'false', 'Stack series instead of grouping.'],
    ['data-efx-values', 'false', 'Print values on the bars.'],
    ['data-efx-radius', '4', 'Bar corner radius.'],
    ['data-efx-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Series colors "#f43f5e|#8b5cf6".'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact', 'false', '12.3k style numbers.'],
    ['data-efx-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-efx-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no axes/tooltip).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-grid', 'border color', 'Gridlines.'],
    ['--efx-chart-text', 'muted text', 'Axis labels.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Bar clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Revenue</h3>
  <div class="efx-chart-bar" data-efx-data="[[42,58,51,77],[30,45,62,70]]" data-efx-names="2025|2026" data-efx-labels="Q1|Q2|Q3|Q4" data-efx-prefix="$" data-efx-suffix="k"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-bar" data-efx-horizontal data-efx-values data-efx-data="82,64,51,33" data-efx-labels="Chrome|Safari|Edge|Firefox" data-efx-suffix="%" data-efx-height="200" data-efx-title="Browser share"></div></div>
  <a class="btn btn-lg tone-accent efx-chart-bar" href="#" style="min-height:120px" data-efx-background data-efx-data="3,5,4,7,6,9,8,12">Sales up 24%</a>
</div>`, label: 'Horizontal with values, and a chart as a button background' },
  ],
};
