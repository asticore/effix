const cal = JSON.stringify(Array.from({ length: 119 }, (_, i) => ({ date: new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10), value: (i * 7 + (i % 5) * 3 + ((i * i) % 11)) % 9 })));
module.exports = {
  title: 'Heatmap',
  group: 'Charts',
  dataFormat: `Grid: labels = columns, each series = a row of numbers (<code>null</code> = empty cell).
<code>data-spark-data="[[1,4,2],[3,0,5]]" data-spark-labels="A|B|C" data-spark-names="Row 1|Row 2"</code>
or <code>[{"name":"Mon","data":[1,4,2]}]</code>, or a table via <code>data-spark-source</code>.
Calendar (<code>data-spark-calendar</code>): day values for up to the last 53 weeks:
<code>[{"date":"2026-01-03","value":4},{"date":"2026-01-04","value":1}]</code> (ISO <code>YYYY-MM-DD</code>).`,
  summary: 'A grid heatmap (labels = columns, series = rows) or a GitHub-style calendar of weeks × 7 days. Color intensity is an opacity ramp of the first palette color, or a two-color diverging scale. Hover or arrow through the cells.',
  classes: [['spark-chart-heatmap', 'Renders a heatmap from data-spark-data, inline JSON or a table.']],
  options: [
    ['data-spark-data', '', 'Grid: "1,4,2|3,0,5" or JSON [[1,4,2],[3,0,5]]. Calendar: JSON [{"date":"2026-01-03","value":4}].'],
    ['data-spark-labels / names', '', 'Grid column labels "Mon|Tue" / row names "Morning|Evening".'],
    ['data-spark-source', '', 'CSS selector of a Shine table to read (first column = labels).'],
    ['data-spark-csv', '', 'CSV text or URL (.csv): header row = series names, first column = labels. Or an inline <script type="text/csv">.'],
    ['data-spark-live', '', 'Name of a live source registered with Spark.chartSource(name, (push, el) => push({ labels, series })).'],
    ['data-spark-calendar', 'false', 'Calendar mode: weeks as columns, 7 rows, month and weekday labels.'],
    ['data-spark-scheme', '', '"" = single color ramp · "diverging" = colors[0] for positive, danger (or colors[1]) for negative.'],
    ['data-spark-gap', '2', 'Space between cells in px.'],
    ['data-spark-radius', '2', 'Cell corner radius.'],
    ['data-spark-height', 'auto', 'px. Default: 30px per row (grid) or square cells (calendar, max 20px).'],
    ['data-spark-colors', 'Shine tones', 'Ramp color, or "#positive|#negative" for diverging.'],
    ['data-spark-prefix / suffix / compact / decimals', '', 'Tooltip value formatting.'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: cells stretch edge to edge behind the element content.'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--spark-chart-1 … 7', 'Shine tones', 'Palette.'], ['--spark-chart-text', 'muted', 'Axis text and empty cells.']],
  events: [
    ['spark:select', 'Cell clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Grid: detail { labels, series }. Calendar: detail [{date,value}].'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Activity by hour</h3>
  <div class="spark-chart-heatmap" data-spark-labels="Mon|Tue|Wed|Thu|Fri|Sat|Sun" data-spark-names="Morning|Afternoon|Evening" data-spark-data="[[2,5,4,6,3,0,1],[4,8,7,9,6,2,2],[3,4,5,5,7,9,6]]" data-spark-suffix=" events"></div>
</div>` },
    { html: `<div class="grid gap-4">
  <div class="card p-6"><h3 class="m-0 mb-3">Contributions</h3><div class="spark-chart-heatmap" data-spark-calendar data-spark-data='${cal}' data-spark-suffix=" commits"></div></div>
  <div class="card p-6 spark-chart-heatmap" style="min-height:140px" data-spark-background data-spark-scheme="diverging" data-spark-gap="3" data-spark-labels="A|B|C|D|E|F|G|H" data-spark-data="[[3,-2,5,1,-4,2,6,-1],[-3,4,1,-5,2,6,-2,3],[5,1,-3,2,4,-1,3,-6]]"><h3 class="m-0">Net change</h3><p class="m-0">Diverging scale behind a card</p></div>
</div>`, label: 'Calendar heatmap, and a diverging heatmap as a card background' },
  ],
};
