const cal = JSON.stringify(Array.from({ length: 119 }, (_, i) => ({ date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10), value: (i * 7 + (i % 5) * 3 + ((i * i) % 11)) % 9 })));
module.exports = {
  title: 'Heatmap',
  group: 'Charts',
  dataFormat: `Grid: labels = columns, each series = a row of numbers (<code>null</code> = empty cell).
<code>data-efx-data="[[1,4,2],[3,0,5]]" data-efx-labels="A|B|C" data-efx-names="Row 1|Row 2"</code>
or <code>[{"name":"Mon","data":[1,4,2]}]</code>, or a table via <code>data-efx-source</code>.
Calendar (<code>data-efx-calendar</code>): day values for up to the last 53 weeks:
<code>[{"date":"2026-01-03","value":4},{"date":"2026-01-04","value":1}]</code> (ISO <code>YYYY-MM-DD</code>).`,
  summary: 'A grid heatmap (labels = columns, series = rows) or a GitHub-style calendar of weeks × 7 days. Color intensity is an opacity ramp of the first palette color, or a two-color diverging scale. Hover or arrow through the cells.',
  classes: [['efx-chart-heatmap', 'Renders a heatmap from data-efx-data, inline JSON or a table.']],
  options: [
    ['data-efx-data', '', 'Grid: "1,4,2|3,0,5" or JSON [[1,4,2],[3,0,5]]. Calendar: JSON [{"date":"2026-01-03","value":4}].'],
    ['data-efx-labels / names', '', 'Grid column labels "Mon|Tue" / row names "Morning|Evening".'],
    ['data-efx-source', '', 'CSS selector of a Shine table to read (first column = labels).'],
    ['data-efx-calendar', 'false', 'Calendar mode: weeks as columns, 7 rows, month and weekday labels.'],
    ['data-efx-scheme', '', '"" = single color ramp · "diverging" = colors[0] for positive, danger (or colors[1]) for negative.'],
    ['data-efx-gap', '2', 'Space between cells in px.'],
    ['data-efx-radius', '2', 'Cell corner radius.'],
    ['data-efx-height', 'auto', 'px. Default: 30px per row (grid) or square cells (calendar, max 20px).'],
    ['data-efx-colors', 'Shine tones', 'Ramp color, or "#positive|#negative" for diverging.'],
    ['data-efx-prefix / suffix / compact / decimals', '', 'Tooltip value formatting.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: cells stretch edge to edge behind the element content.'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Palette.'], ['--efx-chart-text', 'muted', 'Axis text and empty cells.']],
  events: [
    ['efx:select', 'Cell clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Grid: detail { labels, series }. Calendar: detail [{date,value}].'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Activity by hour</h3>
  <div class="efx-chart-heatmap" data-efx-labels="Mon|Tue|Wed|Thu|Fri|Sat|Sun" data-efx-names="Morning|Afternoon|Evening" data-efx-data="[[2,5,4,6,3,0,1],[4,8,7,9,6,2,2],[3,4,5,5,7,9,6]]" data-efx-suffix=" events"></div>
</div>` },
    { html: `<div class="grid gap-4">
  <div class="card p-6"><h3 class="m-0 mb-3">Contributions</h3><div class="efx-chart-heatmap" data-efx-calendar data-efx-data='${cal}' data-efx-suffix=" commits"></div></div>
  <div class="card p-6 efx-chart-heatmap" style="min-height:140px" data-efx-background data-efx-scheme="diverging" data-efx-gap="3" data-efx-labels="A|B|C|D|E|F|G|H" data-efx-data="[[3,-2,5,1,-4,2,6,-1],[-3,4,1,-5,2,6,-2,3],[5,1,-3,2,4,-1,3,-6]]"><h3 class="m-0">Net change</h3><p class="m-0">Diverging scale behind a card</p></div>
</div>`, label: 'Calendar heatmap, and a diverging heatmap as a card background' },
  ],
};
