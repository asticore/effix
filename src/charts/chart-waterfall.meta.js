module.exports = {
  title: 'Waterfall chart',
  group: 'Charts',
  dataFormat: `One number per label. Values are <em>deltas</em> (positive = up, negative = down), added to a running total.
<code>data-efx-data="100,30,-20,15,-10,0" data-efx-labels="Start|Sales|Refunds|Upsell|Costs|End" data-efx-totals="0|5"</code>
<code>data-efx-totals</code> lists the indexes drawn as total bars (from zero; <code>-1</code> = last). A total bar shows the running total; a non-zero value on it resets the total to that figure.
JSON also works: <code>[{"label":"Start","value":100},{"label":"Sales","value":30},{"label":"Refunds","value":-20}]</code>
or <code>{"labels":[…],"series":[{"values":[…]}]}</code> (first series only).`,
  summary: 'Running-total bars: green for increases, red for decreases, primary for totals, joined by connector lines. Tooltip shows the change and the running total.',
  classes: [['efx-chart-waterfall', 'Renders a waterfall from deltas in data-efx-data and total indexes in data-efx-totals.']],
  options: [
    ['data-efx-data', '', 'Deltas: "100,30,-20,15" · JSON [{"label","value"}] · table via data-efx-source.'],
    ['data-efx-labels', '', 'Step names: "Start|Sales|Costs|End".'],
    ['data-efx-totals', '', 'Indexes drawn as total bars, e.g. "0|5" (negative counts from the end).'],
    ['data-efx-values', 'true', 'Print the value above each bar (+30, −20 …).'],
    ['data-efx-connectors', 'true', 'Dashed lines linking one bar to the next.'],
    ['data-efx-radius', '3', 'Bar corner radius.'],
    ['data-efx-colors', 'success / danger / primary', 'Override as "total|up|down".'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "k".'],
    ['data-efx-compact / decimals / format', '', 'Number formatting (format = registered formatter).'],
    ['data-efx-height', '260', 'Chart height in px.'],
    ['data-efx-tooltip / animate / grid', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--sh-success / --sh-danger / --sh-primary', 'Shine tones', 'Up, down and total colors.'],
    ['--efx-chart-grid / --efx-chart-text', '', 'Gridlines and axis text.'],
  ],
  events: [
    ['efx:select', 'Bar clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch with detail { labels, series:[{values}] } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Profit bridge</h3>
  <div class="efx-chart-waterfall" data-efx-prefix="$" data-efx-suffix="k" data-efx-totals="0|-1"
    data-efx-labels="Revenue|Refunds|COGS|Salaries|Ads|Other income|Profit" data-efx-data="480,-32,-140,-170,-45,25,0"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-waterfall" data-efx-height="180" data-efx-totals="0" data-efx-values="false" data-efx-data="50,8,-12,20,-5" data-efx-labels="Q1|Jan|Feb|Mar|Apr"></div></div>
  <a class="badge tone-success efx-chart-waterfall" href="#" style="display:block;min-height:90px" data-efx-background data-efx-totals="0" data-efx-data="40,10,-6,14,-3,9">Net +24</a>
</div>`, label: 'Compact bridge, and a chart behind a badge' },
  ],
};
