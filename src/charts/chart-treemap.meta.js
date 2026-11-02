module.exports = {
  title: 'Treemap chart',
  group: 'Charts',
  dataFormat: `One rectangle per label; area = value. First series only; zero and negative values are skipped.
<code>data-efx-data="40,25,15,10" data-efx-labels="A|B|C|D"</code>
JSON: <code>[{"label":"Cloud","value":40},{"label":"Ads","value":25}]</code> or <code>{"labels":[…],"series":[{"values":[…]}]}</code>.
A table via <code>data-efx-source</code> also works. One <code>data-efx-colors</code> value makes a shaded ramp of it; several = one color per tile.`,
  summary: 'Squarified treemap: tile area is proportional to value. Hover or arrow-key through tiles for a tooltip with share, click one to fire <code>efx:select</code>. Give it a single color in <code>data-efx-colors</code> for a one-hue ramp by rank.',
  classes: [['efx-chart-treemap', 'Renders a treemap from labels and the first data series.']],
  options: [
    ['data-efx-data', '', '"40,25,15,10" or JSON {"data":[{"label":"A","value":40}]} or {labels, series}. Only the first series is used.'],
    ['data-efx-labels', '', 'Tile labels: "Rent|Food|Travel".'],
    ['data-efx-source', '', 'CSS selector of a Shine table to read.'],
    ['data-efx-gap', '2', 'Gap between tiles in px.'],
    ['data-efx-radius', '4', 'Tile corner radius.'],
    ['data-efx-captions', 'true', 'Print label and value inside tiles that are big enough.'],
    ['data-efx-sort', 'true', 'Largest tile first (false keeps data order).'],
    ['data-efx-colors', 'Shine tones', 'Cycled per tile; a single color gives a ramp by rank.'],
    ['data-efx-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$".'],
    ['data-efx-compact / decimals', 'false / -1', 'Number formatting.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Tile clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch with detail { labels, series } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Spend by category</h3>
  <div class="efx-chart-treemap" data-efx-prefix="$" data-efx-data="4200,2600,1800,1500,900,700,450,300,180" data-efx-labels="Rent|Payroll|Cloud|Marketing|Travel|Legal|Software|Meals|Other" data-efx-height="300"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-treemap" data-efx-colors="#6366f1" data-efx-gap="3" data-efx-data="52,31,22,14,9,6" data-efx-labels="Organic|Direct|Paid|Email|Social|Other" data-efx-suffix="%" data-efx-height="200" data-efx-title="Traffic sources"></div></div>
  <div class="card p-6 efx-chart-treemap" data-efx-background data-efx-gap="1" data-efx-radius="0" data-efx-data="9,7,5,4,3,2,2,1" style="min-height:200px"><h4 class="m-0">Portfolio</h4><p class="m-0">A treemap as a card background.</p></div>
</div>`, label: 'One-hue ramp, and a treemap as a card background' },
  ],
};
