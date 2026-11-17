module.exports = {
  title: 'Progress bars',
  group: 'Charts',
  dataFormat: `Rows = labels; the first series = current values, an optional second series = targets (100% when absent).
<code>data-spark-labels="Signups|Revenue" data-spark-data="820,64|1000,80"</code> (values | targets).
JSON: <code>[{"name":"Value","data":[820,64]},{"name":"Target","data":[1000,80]}]</code> or <code>[{"label":"Signups","value":820}]</code>.
<code>data-spark-max</code> sets a common scale when there are no targets; a table via <code>data-spark-source</code> also works.`,
  summary: 'Compact goal bars for KPI lists: label on the left, value on the right, a rounded track with an animated fill and an optional target tick. Hover or arrow-key through rows for a tooltip.',
  classes: [['spark-chart-progress', 'Renders one progress bar per label.']],
  options: [
    ['data-spark-data', '', 'Values "820,64,45" or two series "820,64|1000,80" (second series = targets). JSON works too.'],
    ['data-spark-labels', '', 'Row labels: "Signups|Revenue|NPS".'],
    ['data-spark-source', '', 'CSS selector of a Shine table (column 1 = labels, 2 = values, 3 = targets).'],
    ['data-spark-csv', '', 'CSV text or URL (.csv): header row = series names, first column = labels. Or an inline <script type="text/csv">.'],
    ['data-spark-live', '', 'Name of a live source registered with Spark.chartSource(name, (push, el) => push({ labels, series })).'],
    ['data-spark-max', 'auto', 'Common scale for every row. Auto: each row with a target scales to max(target, value); otherwise the largest value.'],
    ['data-spark-values', 'true', 'Show "value / target" on the right.'],
    ['data-spark-percent', 'true', 'Show the percentage (value / target, else value / scale).'],
    ['data-spark-thick', '10', 'Bar thickness in px.'],
    ['data-spark-radius', '999', 'Bar corner radius (999 = pill).'],
    ['data-spark-colors', 'Shine tones', 'Cycled per row; give one color to use it everywhere.'],
    ['data-spark-height', 'auto', 'Defaults to a height that fits all rows.'],
    ['data-spark-prefix / suffix / compact / decimals', '', 'Value formatting.'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: bars fill the element behind its content.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--sh-surface-2', 'Shine', 'Track color.'],
  ],
  events: [
    ['spark:select', 'Row clicked / Enter pressed. detail = { index, label, value }.'],
    ['spark:data (listen)', 'Dispatch with detail { labels, series } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6" style="max-width:26rem">
  <h3 class="m-0 mb-4">Q4 goals</h3>
  <div class="spark-chart-progress" data-spark-labels="Signups|Revenue ($k)|Demos booked|NPS" data-spark-data="820,64,31,48|1000,80,40,60"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-4"><div class="spark-chart-progress" data-spark-colors="#10b981" data-spark-thick="6" data-spark-max="100" data-spark-suffix="%" data-spark-values="false" data-spark-labels="Storage|Seats|API calls" data-spark-data="72,45,91"></div></div>
  <div class="card p-6 spark-chart-progress" data-spark-background data-spark-data="70,45,85,30,60" style="min-height:160px"><h4 class="m-0">Onboarding</h4><p class="m-0">Progress bars as a card background.</p></div>
</div>`, label: 'Slim single-color bars, and progress bars as a card background' },
  ],
};
