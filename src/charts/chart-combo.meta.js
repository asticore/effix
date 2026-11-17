module.exports = {
  title: 'Combo chart',
  group: 'Charts',
  dataFormat: `Categories = <code>data-spark-labels</code>; each series has numbers per category plus a <code>type</code> and <code>axis</code>.
<code>[{"name":"Revenue","data":[40,52,48],"type":"bar"},{"name":"Margin %","data":[22,31,27],"type":"line","axis":"right"}]</code>
<code>type</code>: <code>"bar"</code> (default for the first series) or <code>"line"</code>; <code>axis</code>: <code>"left"</code> (default) or <code>"right"</code>.
Plain data works too: <code>data-spark-data="40,52,48|22,31,27" data-spark-names="Revenue|Margin %"</code>
with <code>data-spark-types="bar|line"</code> and <code>data-spark-axes="left|right"</code>. Tables via <code>data-spark-source</code> use the attributes.`,
  summary: 'Bars and lines on one plot, with an optional second y-axis on the right. A crosshair tooltip lists every series at the hovered x; arrow keys step through categories and legend keys toggle series.',
  classes: [['spark-chart-combo', 'Renders bars and lines from data-spark-data (per-series type and axis) or inline JSON.']],
  options: [
    ['data-spark-data', '', 'JSON [{"name","data","type":"bar|line","axis":"left|right"}] or "40,52|22,31".'],
    ['data-spark-labels', '', 'Category labels: "Jan|Feb|Mar".'],
    ['data-spark-names', '', 'Series names: "Revenue|Margin %".'],
    ['data-spark-types', '', 'Per-series fallback: "bar|line" (first series bar, others line when omitted).'],
    ['data-spark-axes', '', 'Per-series fallback: "left|right".'],
    ['data-spark-smooth', 'true', 'Smooth (monotone) lines.'],
    ['data-spark-dots', 'true', 'Dots on line points (false = only on hover).'],
    ['data-spark-stacked', 'false', 'Stack the bar series (per axis); lines stay on top.'],
    ['data-spark-area', 'false', 'Gradient fill under the lines.'],
    ['data-spark-radius', '4', 'Bar corner radius.'],
    ['data-spark-prefix / suffix', '', 'Left axis and tooltip value formatting, e.g. "$" / "k".'],
    ['data-spark-prefix2 / suffix2', '', 'Right axis formatting, e.g. "%".'],
    ['data-spark-height', '260', 'Chart height in px.'],
    ['data-spark-colors', 'Shine tones', 'Series colors "#f43f5e|#8b5cf6".'],
    ['data-spark-legend / tooltip / animate / grid', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [['--spark-chart-1 … 7', 'Shine tones', 'Palette.']],
  events: [
    ['spark:select', 'Column clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Dispatch with detail { labels, series:[{name, values, type, axis}] } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Revenue and margin</h3>
  <div class="spark-chart-combo" data-spark-labels="Jan|Feb|Mar|Apr|May|Jun" data-spark-prefix="$" data-spark-suffix="k" data-spark-suffix2="%"
    data-spark-data='[{"name":"Revenue","data":[42,58,51,77,69,88],"type":"bar"},{"name":"Margin","data":[18,24,21,31,28,35],"type":"line","axis":"right"}]'></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-combo" data-spark-height="200" data-spark-area data-spark-labels="Mon|Tue|Wed|Thu|Fri" data-spark-names="Orders|Avg" data-spark-types="bar|line" data-spark-data="30,45,38,60,52|28,35,40,44,48"></div></div>
  <button class="btn btn-lg tone-primary spark-chart-combo" style="min-height:120px" data-spark-background data-spark-labels="a|b|c|d|e|f" data-spark-types="bar|line" data-spark-data="3,5,4,7,6,9|4,4,5,6,7,8">Pipeline</button>
</div>`, label: 'Plain-data fallback, and a chart as a button background' },
  ],
};
