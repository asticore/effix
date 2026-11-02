module.exports = {
  title: 'Combo chart',
  group: 'Charts',
  dataFormat: `Categories = <code>data-efx-labels</code>; each series has numbers per category plus a <code>type</code> and <code>axis</code>.
<code>[{"name":"Revenue","data":[40,52,48],"type":"bar"},{"name":"Margin %","data":[22,31,27],"type":"line","axis":"right"}]</code>
<code>type</code>: <code>"bar"</code> (default for the first series) or <code>"line"</code>; <code>axis</code>: <code>"left"</code> (default) or <code>"right"</code>.
Plain data works too: <code>data-efx-data="40,52,48|22,31,27" data-efx-names="Revenue|Margin %"</code>
with <code>data-efx-types="bar|line"</code> and <code>data-efx-axes="left|right"</code>. Tables via <code>data-efx-source</code> use the attributes.`,
  summary: 'Bars and lines on one plot, with an optional second y-axis on the right. A crosshair tooltip lists every series at the hovered x; arrow keys step through categories and legend keys toggle series.',
  classes: [['efx-chart-combo', 'Renders bars and lines from data-efx-data (per-series type and axis) or inline JSON.']],
  options: [
    ['data-efx-data', '', 'JSON [{"name","data","type":"bar|line","axis":"left|right"}] or "40,52|22,31".'],
    ['data-efx-labels', '', 'Category labels: "Jan|Feb|Mar".'],
    ['data-efx-names', '', 'Series names: "Revenue|Margin %".'],
    ['data-efx-types', '', 'Per-series fallback: "bar|line" (first series bar, others line when omitted).'],
    ['data-efx-axes', '', 'Per-series fallback: "left|right".'],
    ['data-efx-smooth', 'true', 'Smooth (monotone) lines.'],
    ['data-efx-dots', 'true', 'Dots on line points (false = only on hover).'],
    ['data-efx-area', 'false', 'Gradient fill under the lines.'],
    ['data-efx-radius', '4', 'Bar corner radius.'],
    ['data-efx-prefix / suffix', '', 'Left axis and tooltip value formatting, e.g. "$" / "k".'],
    ['data-efx-prefix2 / suffix2', '', 'Right axis formatting, e.g. "%".'],
    ['data-efx-height', '260', 'Chart height in px.'],
    ['data-efx-colors', 'Shine tones', 'Series colors "#f43f5e|#8b5cf6".'],
    ['data-efx-legend / tooltip / animate / grid', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Palette.']],
  events: [
    ['efx:select', 'Column clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch with detail { labels, series:[{name, values, type, axis}] } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Revenue and margin</h3>
  <div class="efx-chart-combo" data-efx-labels="Jan|Feb|Mar|Apr|May|Jun" data-efx-prefix="$" data-efx-suffix="k" data-efx-suffix2="%"
    data-efx-data='[{"name":"Revenue","data":[42,58,51,77,69,88],"type":"bar"},{"name":"Margin","data":[18,24,21,31,28,35],"type":"line","axis":"right"}]'></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-combo" data-efx-height="200" data-efx-area data-efx-labels="Mon|Tue|Wed|Thu|Fri" data-efx-names="Orders|Avg" data-efx-types="bar|line" data-efx-data="30,45,38,60,52|28,35,40,44,48"></div></div>
  <button class="btn btn-lg tone-primary efx-chart-combo" style="min-height:120px" data-efx-background data-efx-labels="a|b|c|d|e|f" data-efx-types="bar|line" data-efx-data="3,5,4,7,6,9|4,4,5,6,7,8">Pipeline</button>
</div>`, label: 'Plain-data fallback, and a chart as a button background' },
  ],
};
