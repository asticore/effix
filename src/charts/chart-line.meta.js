module.exports = {
  title: 'Line chart',
  group: 'Charts',
  dataFormat: `Same shapes as the bar chart: one value per label per series.
<code>data-efx-data="3,5,4,8"</code> · <code>"3,5,4|2,4,6"</code> (two series) · JSON <code>[[3,5],[4,1]]</code>.
Named series: <code>[{"name":"Visits","data":[3,5,4]},{"name":"Signups","data":[1,2,2]}]</code>.
Labels: <code>data-efx-labels="Mon|Tue|Wed"</code> or <code>{"labels":[…],"series":[…]}</code>; a table via <code>data-efx-source</code> also works.
<code>data-efx-stacked</code> stacks series (areas); values are plain numbers (no dates).`,
  summary: 'Multi-series lines with optional gradient area or stacked area. A crosshair snaps to the nearest point and the tooltip lists every visible series at that x. Arrow keys step through x positions, legend keys toggle series.',
  classes: [['efx-chart-line', 'Renders a line / area chart from data-efx-data, inline JSON or a table.']],
  options: [
    ['data-efx-data', '', '"3,5,4" · several series "3,5|4,1" · JSON [[3,5],[4,1]] or [{"name":"A","data":[…]}]'],
    ['data-efx-labels', '', 'X labels: "Mon|Tue|Wed".'],
    ['data-efx-names', '', 'Series names: "2025|2026".'],
    ['data-efx-source', '', 'CSS selector of a Shine table to read (first column = labels).'],
    ['data-efx-area', 'false', 'Gradient fill under each line (35% → 0 of the series color).'],
    ['data-efx-stacked', 'false', 'Stacked area (implies area).'],
    ['data-efx-smooth', 'true', 'Monotone curve; false = straight segments.'],
    ['data-efx-dots', 'true', 'Always-visible dots; false shows them only under the crosshair.'],
    ['data-efx-grid', 'true', 'Horizontal gridlines.'],
    ['data-efx-min', '(auto)', 'Y axis minimum; empty = automatic.'],
    ['data-efx-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Series colors "#f43f5e|#8b5cf6".'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact / decimals', 'false / -1', '12.3k style numbers / fixed decimals.'],
    ['data-efx-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (lines/areas only).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-grid / --efx-chart-text', 'border / muted', 'Gridlines and axis text.'],
  ],
  events: [
    ['efx:select', 'Point clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Visitors</h3>
  <div class="efx-chart-line" data-efx-area data-efx-data="[[120,180,150,240,210,320,290],[80,110,140,130,190,200,260]]" data-efx-names="Web|Mobile" data-efx-labels="Mon|Tue|Wed|Thu|Fri|Sat|Sun"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-line" data-efx-stacked data-efx-height="200" data-efx-dots="false" data-efx-data="[[4,6,5,8,7],[3,4,6,5,9],[2,3,3,4,5]]" data-efx-names="Free|Pro|Team" data-efx-labels="Jan|Feb|Mar|Apr|May" data-efx-title="Signups by plan"></div></div>
  <div class="card p-6 efx-chart-line" style="min-height:160px" data-efx-background data-efx-area data-efx-data="12,18,14,22,19,28,26,34"><h3 class="m-0">Revenue</h3><p class="m-0">$34k this week</p></div>
</div>`, label: 'Stacked area with hover-only dots, and a card with a line chart behind its content' },
  ],
};
