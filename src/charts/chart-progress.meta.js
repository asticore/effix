module.exports = {
  title: 'Progress bars',
  group: 'Charts',
  summary: 'Compact goal bars for KPI lists: label on the left, value on the right, a rounded track with an animated fill and an optional target tick. Hover or arrow-key through rows for a tooltip.',
  classes: [['efx-chart-progress', 'Renders one progress bar per label.']],
  options: [
    ['data-efx-data', '', 'Values "820,64,45" or two series "820,64|1000,80" (second series = targets). JSON works too.'],
    ['data-efx-labels', '', 'Row labels: "Signups|Revenue|NPS".'],
    ['data-efx-source', '', 'CSS selector of a Shine table (column 1 = labels, 2 = values, 3 = targets).'],
    ['data-efx-max', 'auto', 'Common scale for every row. Auto: each row with a target scales to max(target, value); otherwise the largest value.'],
    ['data-efx-values', 'true', 'Show "value / target" on the right.'],
    ['data-efx-percent', 'true', 'Show the percentage (value / target, else value / scale).'],
    ['data-efx-thick', '10', 'Bar thickness in px.'],
    ['data-efx-radius', '999', 'Bar corner radius (999 = pill).'],
    ['data-efx-colors', 'Shine tones', 'Cycled per row; give one color to use it everywhere.'],
    ['data-efx-height', 'auto', 'Defaults to a height that fits all rows.'],
    ['data-efx-prefix / suffix / compact / decimals', '', 'Value formatting.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: bars fill the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--sh-surface-2', 'Shine', 'Track color.'],
  ],
  events: [
    ['efx:select', 'Row clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch with detail { labels, series } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6" style="max-width:26rem">
  <h3 class="m-0 mb-4">Q4 goals</h3>
  <div class="efx-chart-progress" data-efx-labels="Signups|Revenue ($k)|Demos booked|NPS" data-efx-data="820,64,31,48|1000,80,40,60"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-4"><div class="efx-chart-progress" data-efx-colors="#10b981" data-efx-thick="6" data-efx-max="100" data-efx-suffix="%" data-efx-values="false" data-efx-labels="Storage|Seats|API calls" data-efx-data="72,45,91"></div></div>
  <div class="card p-6 efx-chart-progress" data-efx-background data-efx-data="70,45,85,30,60" style="min-height:160px"><h4 class="m-0">Onboarding</h4><p class="m-0">Progress bars as a card background.</p></div>
</div>`, label: 'Slim single-color bars, and progress bars as a card background' },
  ],
};
