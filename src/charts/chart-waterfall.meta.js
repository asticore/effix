module.exports = {
  title: 'Waterfall chart',
  group: 'Charts',
  dataFormat: `One number per label. Values are <em>deltas</em> (positive = up, negative = down), added to a running total.
<code>data-spark-data="100,30,-20,15,-10,0" data-spark-labels="Start|Sales|Refunds|Upsell|Costs|End" data-spark-totals="0|5"</code>
<code>data-spark-totals</code> lists the indexes drawn as total bars (from zero; <code>-1</code> = last). A total bar shows the running total; a non-zero value on it resets the total to that figure.
JSON also works: <code>[{"label":"Start","value":100},{"label":"Sales","value":30},{"label":"Refunds","value":-20}]</code>
or <code>{"labels":[…],"series":[{"values":[…]}]}</code> (first series only).`,
  summary: 'Running-total bars: green for increases, red for decreases, primary for totals, joined by connector lines. Tooltip shows the change and the running total.',
  classes: [['spark-chart-waterfall', 'Renders a waterfall from deltas in data-spark-data and total indexes in data-spark-totals.']],
  options: [
    ['data-spark-data', '', 'Deltas: "100,30,-20,15" · JSON [{"label","value"}] · table via data-spark-source.'],
    ['data-spark-labels', '', 'Step names: "Start|Sales|Costs|End".'],
    ['data-spark-totals', '', 'Indexes drawn as total bars, e.g. "0|5" (negative counts from the end).'],
    ['data-spark-values', 'true', 'Print the value above each bar (+30, −20 …).'],
    ['data-spark-connectors', 'true', 'Dashed lines linking one bar to the next.'],
    ['data-spark-radius', '3', 'Bar corner radius.'],
    ['data-spark-colors', 'success / danger / primary', 'Override as "total|up|down".'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "k".'],
    ['data-spark-compact / decimals / format', '', 'Number formatting (format = registered formatter).'],
    ['data-spark-height', '260', 'Chart height in px.'],
    ['data-spark-tooltip / animate / grid', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--sh-success / --sh-danger / --sh-primary', 'Shine tones', 'Up, down and total colors.'],
    ['--spark-chart-grid / --spark-chart-text', '', 'Gridlines and axis text.'],
  ],
  events: [
    ['spark:select', 'Bar clicked / Enter pressed. detail = { index, label, value }.'],
    ['spark:data (listen)', 'Dispatch with detail { labels, series:[{values}] } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Profit bridge</h3>
  <div class="spark-chart-waterfall" data-spark-prefix="$" data-spark-suffix="k" data-spark-totals="0|-1"
    data-spark-labels="Revenue|Refunds|COGS|Salaries|Ads|Other income|Profit" data-spark-data="480,-32,-140,-170,-45,25,0"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-waterfall" data-spark-height="180" data-spark-totals="0" data-spark-values="false" data-spark-data="50,8,-12,20,-5" data-spark-labels="Q1|Jan|Feb|Mar|Apr"></div></div>
  <a class="badge tone-success spark-chart-waterfall" href="#" style="display:block;min-height:90px" data-spark-background data-spark-totals="0" data-spark-data="40,10,-6,14,-3,9">Net +24</a>
</div>`, label: 'Compact bridge, and a chart behind a badge' },
  ],
};
