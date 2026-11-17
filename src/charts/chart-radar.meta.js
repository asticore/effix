module.exports = {
  title: 'Radar chart',
  group: 'Charts',
  dataFormat: `Labels = the axes (3 or more), each series = one polygon, one number per axis, scaled to <code>data-spark-max</code> (default: nice max of the data).
<code>data-spark-data="[[8,6,7,5,9],[5,8,4,7,6]]" data-spark-names="A|B" data-spark-labels="Speed|Power|Range|Cost|Style"</code>
JSON: <code>[{"name":"A","data":[8,6,7,5,9]},{"name":"B","data":[5,8,4,7,6]}]</code>.
A single series can be <code>"8,6,7,5,9"</code>; a table via <code>data-spark-source</code> also works.`,
  summary: 'Radar / spider chart: one polygon per series, one axis per label. Hover vertices for values, click a legend key to hide a series.',
  classes: [['spark-chart-radar', 'Renders a radar chart (needs 3+ labels).']],
  options: [
    ['data-spark-data', '', '"8,6,7,5,9" · several series "8,6,7,5,9|5,8,4,7,6" · JSON.'],
    ['data-spark-labels', '', 'Axis names: "Speed|Power|Range|Cost|Style".'],
    ['data-spark-names', '', 'Series names: "A|B".'],
    ['data-spark-levels', '4', 'Number of grid rings.'],
    ['data-spark-area', 'true', 'Fill the polygons.'],
    ['data-spark-dots', 'true', 'Show vertex dots (hover still works when off).'],
    ['data-spark-max', 'auto', 'Value at the outer ring.'],
    ['data-spark-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6" (per stage / slice / series).'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-spark-compact', 'false', '12.3k style numbers.'],
    ['data-spark-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content (no labels/tooltip).'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--spark-chart-1 … 7', 'Shine tones', 'Series colors.'], ['--spark-chart-grid', 'border color', 'Rings and axes.']],
  events: [['spark:select', 'Vertex clicked / Enter pressed. detail = { index, label, value, series }.'], ['spark:data (listen)', 'Dispatch with detail { labels, series } to update.']],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Skills</h3>
  <div class="spark-chart-radar" data-spark-data="[[8,6,9,5,7,8],[5,8,6,7,9,4]]" data-spark-names="Alex|Sam" data-spark-labels="Design|Code|Speed|Docs|Tests|Ops" data-spark-max="10"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-radar" data-spark-height="240" data-spark-dots="false" data-spark-levels="3" data-spark-data="70,40,90,60,80" data-spark-labels="Speed|Power|Range|Cost|Style"></div></div>
  <div class="card p-6 spark-chart-radar" data-spark-background data-spark-height="0" style="min-height:240px" data-spark-data="6,9,5,8,7" data-spark-labels="a|b|c|d|e"><h4 class="m-0">Radar as a background</h4></div>
</div>`, label: 'No dots, and a radar as a card background' },
  ],
};
