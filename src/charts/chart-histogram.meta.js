module.exports = {
  title: 'Histogram',
  group: 'Charts',
  dataFormat: `Raw values, binned for you: <code>data-efx-data="1.2,3.4,2.2,5.1,3.3"</code> (or JSON <code>[1.2,3.4,…]</code>, a table column via <code>data-efx-source</code>).
Bins: Sturges' rule by default, <code>data-efx-bins="12"</code> for an exact count between min and max, or <code>data-efx-step="5"</code> for a fixed bin width.
Bins are half-open [a, b), the last one is closed. Add <code>data-efx-curve</code> to overlay a normal curve fitted to the data.
Live update: <code>efx:data</code> with <code>{series:[{values:[…]}]}</code>.`,
  summary: 'Auto-binned histogram of raw values with touching bars and an optional normal-curve overlay. Tooltip shows the bin range and count.',
  classes: [['efx-chart-histogram', 'Bins the values and renders a histogram.']],
  options: [
    ['data-efx-data', '', '"1.2,3.4,2.2,…" or JSON [1.2,3.4,…].'],
    ['data-efx-bins', '0', 'Exact number of bins (0 = Sturges).'],
    ['data-efx-step', '0', 'Fixed bin width (wins over bins).'],
    ['data-efx-curve', 'false', 'Overlay a fitted normal curve.'],
    ['data-efx-grid', 'true', 'Gridlines.'],
    ['data-efx-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6".'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact / decimals / format', 'false / -1', 'Number formatting (or a registered formatter name).'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no axes/tooltip).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 2', 'Shine tones', 'Bars (1) and curve (2).'],
    ['--efx-chart-grid / text', 'theme', 'Gridlines and axis labels.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Bin clicked / Enter pressed. detail = { index, label: "[a, b)", value: count }.'],
    ['efx:data (listen)', 'Dispatch with detail { series:[{values}] } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Page load time (s)</h3>
  <div class="efx-chart-histogram" data-efx-curve data-efx-suffix="s" data-efx-data="1.2,1.4,1.5,1.5,1.7,1.8,1.8,1.9,2.0,2.1,2.1,2.2,2.2,2.3,2.4,2.4,2.5,2.6,2.7,2.8,2.9,3.1,3.2,3.4,3.7,4.1,4.8"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-histogram" data-efx-step="10" data-efx-height="200" data-efx-title="Exam scores" data-efx-colors="#10b981" data-efx-data="45,52,55,58,61,63,64,66,67,68,69,70,71,72,72,74,75,76,78,79,81,83,85,88,91,95"></div></div>
  <div class="card p-6 efx-chart-histogram" data-efx-background data-efx-bins="10" data-efx-data="1,2,2,3,3,3,4,4,4,4,5,5,5,6,6,7,8" style="min-height:200px"><h4 class="m-0">Distribution</h4><p class="m-0">A histogram as a card background.</p></div>
</div>`, label: 'Fixed step, and as a card background' },
  ],
};
