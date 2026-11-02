module.exports = {
  title: 'Funnel chart',
  group: 'Charts',
  dataFormat: `Stages top to bottom = <code>data-efx-labels</code>, one number per stage (usually decreasing).
<code>data-efx-data="1200,780,420,180" data-efx-labels="Visits|Signups|Trials|Paid"</code>.
JSON: <code>[{"label":"Visits","value":1200},{"label":"Signups","value":780}]</code>.
Two series compare two funnels (<code>data-efx-compare="mirror|ghost"</code>):
<code>"1200,780,420|1000,600,300"</code> or <code>[{"name":"2025","data":[…]},{"name":"2026","data":[…]}]</code>.`,
  summary: 'Conversion funnel with smooth curved, straight, centered-bar or pyramid stages, per-stage and step-to-step conversion, drop-off rates, and a compare mode for two series. Hover for value, % of total, % of previous step and drop count; click a legend key to hide a stage.',
  classes: [['efx-chart-funnel', 'Renders a funnel from data-efx-data (first series) and data-efx-labels (stage names).']],
  options: [
    ['data-efx-data', '', '"1200,780,420,180" · two series "1200,780|900,700" compare mode · JSON or a table via data-efx-source.'],
    ['data-efx-labels', '', 'Stage names: "Visits|Signups|Trials|Paid".'],
    ['data-efx-style', 'curved', '<code>curved</code> smooth trapezoid stack · <code>straight</code> · <code>bars</code> centered bars with drop-off connectors · <code>pyramid</code>.'],
    ['data-efx-horizontal', 'false', 'Flow left to right.'],
    ['data-efx-neck', '0.25', 'Bottom width ratio for curved/straight. 0 = widths proportional to each value.'],
    ['data-efx-gap', '4', 'Pixels between stages.'],
    ['data-efx-conversion', 'true', 'Show % of first stage and the "−32%" drop-off between stages.'],
    ['data-efx-show', 'inside', 'Stage labels: <code>inside</code> (auto-moves outside when too narrow) · <code>side</code> · <code>none</code>. (Not named "labels": that is the stage names.)'],
    ['data-efx-dynamic', 'true', 'Stage height proportional to value (false = equal heights).'],
    ['data-efx-compare', 'mirror', 'With 2+ series: <code>mirror</code> halves side by side · <code>ghost</code> series 2 as an outline behind series 1.'],
    ['data-efx-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6" (per stage / slice / series).'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact', 'false', '12.3k style numbers.'],
    ['data-efx-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no labels/tooltip).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-text', 'muted text', 'Secondary labels and drop-off rates.'],
  ],
  events: [
    ['efx:select', 'Stage clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Signup funnel</h3>
  <div class="efx-chart-funnel" data-efx-data="12400,7800,4100,1900,820" data-efx-labels="Visited|Signed up|Activated|Trial|Paid"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-funnel" data-efx-style="bars" data-efx-horizontal data-efx-height="220" data-efx-data="900,640,380,210" data-efx-labels="Leads|Qualified|Proposal|Won" data-efx-title="Sales pipeline"></div></div>
  <div class="card p-6"><div class="efx-chart-funnel" data-efx-compare="ghost" data-efx-style="straight" data-efx-data="[[5000,3100,1500,600],[4200,3300,1900,900]]" data-efx-names="This year|Last year" data-efx-labels="Visit|Cart|Checkout|Paid"></div></div>
</div>`, label: 'Horizontal bars, and a compare funnel with ghost overlay' },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-funnel" data-efx-compare="mirror" data-efx-data="[[5000,3100,1500,600],[4200,3300,1900,900]]" data-efx-names="2025|2026" data-efx-labels="Visit|Cart|Checkout|Paid" data-efx-neck="0"></div></div>
  <div class="card p-6 efx-chart-funnel" data-efx-background data-efx-height="0" style="min-height:220px" data-efx-data="100,64,38,17"><h4 class="m-0">Funnel as a card background</h4><p class="m-0 mt-2">Decorative mode fills the whole card.</p></div>
</div>`, label: 'Mirrored compare, and a funnel as a card background' },
  ],
};
