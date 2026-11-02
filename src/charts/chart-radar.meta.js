module.exports = {
  title: 'Radar chart',
  group: 'Charts',
  dataFormat: `Labels = the axes (3 or more), each series = one polygon, one number per axis, scaled to <code>data-efx-max</code> (default: nice max of the data).
<code>data-efx-data="[[8,6,7,5,9],[5,8,4,7,6]]" data-efx-names="A|B" data-efx-labels="Speed|Power|Range|Cost|Style"</code>
JSON: <code>[{"name":"A","data":[8,6,7,5,9]},{"name":"B","data":[5,8,4,7,6]}]</code>.
A single series can be <code>"8,6,7,5,9"</code>; a table via <code>data-efx-source</code> also works.`,
  summary: 'Radar / spider chart: one polygon per series, one axis per label. Hover vertices for values, click a legend key to hide a series.',
  classes: [['efx-chart-radar', 'Renders a radar chart (needs 3+ labels).']],
  options: [
    ['data-efx-data', '', '"8,6,7,5,9" · several series "8,6,7,5,9|5,8,4,7,6" · JSON.'],
    ['data-efx-labels', '', 'Axis names: "Speed|Power|Range|Cost|Style".'],
    ['data-efx-names', '', 'Series names: "A|B".'],
    ['data-efx-levels', '4', 'Number of grid rings.'],
    ['data-efx-area', 'true', 'Fill the polygons.'],
    ['data-efx-dots', 'true', 'Show vertex dots (hover still works when off).'],
    ['data-efx-max', 'auto', 'Value at the outer ring.'],
    ['data-efx-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6" (per stage / slice / series).'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact', 'false', '12.3k style numbers.'],
    ['data-efx-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no labels/tooltip).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Series colors.'], ['--efx-chart-grid', 'border color', 'Rings and axes.']],
  events: [['efx:select', 'Vertex clicked / Enter pressed. detail = { index, label, value, series }.'], ['efx:data (listen)', 'Dispatch with detail { labels, series } to update.']],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Skills</h3>
  <div class="efx-chart-radar" data-efx-data="[[8,6,9,5,7,8],[5,8,6,7,9,4]]" data-efx-names="Alex|Sam" data-efx-labels="Design|Code|Speed|Docs|Tests|Ops" data-efx-max="10"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-radar" data-efx-height="240" data-efx-dots="false" data-efx-levels="3" data-efx-data="70,40,90,60,80" data-efx-labels="Speed|Power|Range|Cost|Style"></div></div>
  <div class="card p-6 efx-chart-radar" data-efx-background data-efx-height="0" style="min-height:240px" data-efx-data="6,9,5,8,7" data-efx-labels="a|b|c|d|e"><h4 class="m-0">Radar as a background</h4></div>
</div>`, label: 'No dots, and a radar as a card background' },
  ],
};
