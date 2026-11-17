module.exports = {
  title: 'Funnel chart',
  group: 'Charts',
  dataFormat: `Stages top to bottom = <code>data-spark-labels</code>, one number per stage (usually decreasing).
<code>data-spark-data="1200,780,420,180" data-spark-labels="Visits|Signups|Trials|Paid"</code>.
JSON: <code>[{"label":"Visits","value":1200},{"label":"Signups","value":780}]</code>.
Two series compare two funnels (<code>data-spark-compare="mirror|ghost"</code>):
<code>"1200,780,420|1000,600,300"</code> or <code>[{"name":"2025","data":[…]},{"name":"2026","data":[…]}]</code>.`,
  summary: 'Conversion funnel with smooth curved, straight, centered-bar or pyramid stages, per-stage and step-to-step conversion, drop-off rates, and a compare mode for two series. Hover for value, % of total, % of previous step and drop count; click a legend key to hide a stage.',
  classes: [['spark-chart-funnel', 'Renders a funnel from data-spark-data (first series) and data-spark-labels (stage names).']],
  options: [
    ['data-spark-data', '', '"1200,780,420,180" · two series "1200,780|900,700" compare mode · JSON or a table via data-spark-source.'],
    ['data-spark-labels', '', 'Stage names: "Visits|Signups|Trials|Paid".'],
    ['data-spark-style', 'curved', '<code>curved</code> smooth trapezoid stack · <code>straight</code> · <code>bars</code> centered bars with drop-off connectors · <code>pyramid</code>.'],
    ['data-spark-horizontal', 'false', 'Flow left to right.'],
    ['data-spark-neck', '0.25', 'Bottom width ratio for curved/straight. 0 = widths proportional to each value.'],
    ['data-spark-gap', '4', 'Pixels between stages.'],
    ['data-spark-conversion', 'true', 'Show % of first stage and the "−32%" drop-off between stages.'],
    ['data-spark-show', 'inside', 'Stage labels: <code>inside</code> (auto-moves outside when too narrow) · <code>side</code> · <code>none</code>. (Not named "labels": that is the stage names.)'],
    ['data-spark-dynamic', 'true', 'Stage height proportional to value (false = equal heights).'],
    ['data-spark-compare', 'mirror', 'With 2+ series: <code>mirror</code> halves side by side · <code>ghost</code> series 2 as an outline behind series 1.'],
    ['data-spark-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6" (per stage / slice / series).'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-spark-compact', 'false', '12.3k style numbers.'],
    ['data-spark-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content (no labels/tooltip).'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--spark-chart-text', 'muted text', 'Secondary labels and drop-off rates.'],
  ],
  events: [
    ['spark:select', 'Stage clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Signup funnel</h3>
  <div class="spark-chart-funnel" data-spark-data="12400,7800,4100,1900,820" data-spark-labels="Visited|Signed up|Activated|Trial|Paid"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-funnel" data-spark-style="bars" data-spark-horizontal data-spark-height="220" data-spark-data="900,640,380,210" data-spark-labels="Leads|Qualified|Proposal|Won" data-spark-title="Sales pipeline"></div></div>
  <div class="card p-6"><div class="spark-chart-funnel" data-spark-compare="ghost" data-spark-style="straight" data-spark-data="[[5000,3100,1500,600],[4200,3300,1900,900]]" data-spark-names="This year|Last year" data-spark-labels="Visit|Cart|Checkout|Paid"></div></div>
</div>`, label: 'Horizontal bars, and a compare funnel with ghost overlay' },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-funnel" data-spark-compare="mirror" data-spark-data="[[5000,3100,1500,600],[4200,3300,1900,900]]" data-spark-names="2025|2026" data-spark-labels="Visit|Cart|Checkout|Paid" data-spark-neck="0"></div></div>
  <div class="card p-6 spark-chart-funnel" data-spark-background data-spark-height="0" style="min-height:220px" data-spark-data="100,64,38,17"><h4 class="m-0">Funnel as a card background</h4><p class="m-0 mt-2">Decorative mode fills the whole card.</p></div>
</div>`, label: 'Mirrored compare, and a funnel as a card background' },
  ],
};
