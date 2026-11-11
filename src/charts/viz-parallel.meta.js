module.exports = {
  title: 'Parallel coordinates',
  group: 'Visualisations',
  dataFormat: `Rows of objects: one numeric field per axis, optional <code>name</code> and <code>group</code> (line color).
<code>[{"name":"Golf","group":"Hatch","mpg":34,"hp":105,"weight":1.2},{"name":"Civic","group":"Sedan","mpg":38,"hp":130,"weight":1.3}]</code>
Choose/order axes with <code>data-efx-dims="mpg|hp"</code>; the group field is <code>data-efx-group</code> (default "group").
Or tabular: <code>data-efx-labels</code> = axes, series = rows: <code>[{"name":"Golf","data":[34,105,1.2]}]</code>.
Update with an <code>efx:data</code> event (rows array, or { labels, series }).`,
  summary: 'One vertical axis per dimension with a polyline per row. Hover a line to highlight it, drag on an axis to brush a range (other lines fade), double-click an axis to clear its brush.',
  classes: [['efx-viz-parallel', 'Renders parallel coordinates from rows of numeric fields.']],
  options: [
    ['data-efx-data', '', 'Rows (see data format).'],
    ['data-efx-dims', 'all numeric keys', 'Axes to show, in order: "mpg|hp|weight".'],
    ['data-efx-group', 'group', 'Row field used for line color and legend.'],
    ['data-efx-opacity', '0.65', 'Line opacity.'],
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
    ['efx:select', 'Line clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch with detail = rows array or { labels, series } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Cars compared</h3>
  <div class="efx-viz-parallel" data-efx-title="Cars compared"><script type="application/json">[
{"name":"Golf","group":"Hatch","mpg":34,"hp":105,"kg":1200,"price":22},{"name":"Fiesta","group":"Hatch","mpg":38,"hp":95,"kg":1100,"price":18},{"name":"Polo","group":"Hatch","mpg":36,"hp":95,"kg":1150,"price":19},
{"name":"Civic","group":"Sedan","mpg":32,"hp":130,"kg":1350,"price":26},{"name":"Accord","group":"Sedan","mpg":28,"hp":180,"kg":1500,"price":33},{"name":"Camry","group":"Sedan","mpg":29,"hp":190,"kg":1520,"price":31},
{"name":"X5","group":"SUV","mpg":20,"hp":300,"kg":2200,"price":65},{"name":"RAV4","group":"SUV","mpg":27,"hp":200,"kg":1650,"price":36},{"name":"Q7","group":"SUV","mpg":19,"hp":340,"kg":2250,"price":70},
{"name":"Mustang","group":"Sport","mpg":22,"hp":450,"kg":1700,"price":55},{"name":"911","group":"Sport","mpg":23,"hp":380,"kg":1500,"price":110}]</script></div>
</div>` },
    { html: `<div class="card p-6 text-center efx-viz-parallel" style="min-height:200px" data-efx-background data-efx-labels="Speed|Power|Range|Cost" data-efx-data='[{"name":"A","data":[3,5,2,7]},{"name":"B","data":[6,2,8,3]},{"name":"C","data":[4,7,5,5]},{"name":"D","data":[8,4,3,6]}]'><h3 class="m-0">Compare options</h3><p class="m-0">Every line is a candidate.</p></div>`, label: 'As a card background' },
  ],
};
