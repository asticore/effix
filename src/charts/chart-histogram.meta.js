module.exports = {
  title: 'Histogram',
  group: 'Charts',
  dataFormat: `Raw values, binned for you: <code>data-spark-data="1.2,3.4,2.2,5.1,3.3"</code> (or JSON <code>[1.2,3.4,…]</code>, a table column via <code>data-spark-source</code>).
Bins: Sturges' rule by default, <code>data-spark-bins="12"</code> for an exact count between min and max, or <code>data-spark-step="5"</code> for a fixed bin width.
Bins are half-open [a, b), the last one is closed. Add <code>data-spark-curve</code> to overlay a normal curve fitted to the data.
Live update: <code>spark:data</code> with <code>{series:[{values:[…]}]}</code>.`,
  summary: 'Auto-binned histogram of raw values with touching bars and an optional normal-curve overlay. Tooltip shows the bin range and count.',
  classes: [['spark-chart-histogram', 'Bins the values and renders a histogram.']],
  options: [
    ['data-spark-data', '', '"1.2,3.4,2.2,…" or JSON [1.2,3.4,…].'],
    ['data-spark-bins', '0', 'Exact number of bins (0 = Sturges).'],
    ['data-spark-step', '0', 'Fixed bin width (wins over bins).'],
    ['data-spark-curve', 'false', 'Overlay a fitted normal curve.'],
    ['data-spark-grid', 'true', 'Gridlines.'],
    ['data-spark-height', '260', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6".'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-spark-compact / decimals / format', 'false / -1', 'Number formatting (or a registered formatter name).'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content (no axes/tooltip).'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 2', 'Shine tones', 'Bars (1) and curve (2).'],
    ['--spark-chart-grid / text', 'theme', 'Gridlines and axis labels.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Bin clicked / Enter pressed. detail = { index, label: "[a, b)", value: count }.'],
    ['spark:data (listen)', 'Dispatch with detail { series:[{values}] } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Page load time (s)</h3>
  <div class="spark-chart-histogram" data-spark-curve data-spark-suffix="s" data-spark-data="1.2,1.4,1.5,1.5,1.7,1.8,1.8,1.9,2.0,2.1,2.1,2.2,2.2,2.3,2.4,2.4,2.5,2.6,2.7,2.8,2.9,3.1,3.2,3.4,3.7,4.1,4.8"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-histogram" data-spark-step="10" data-spark-height="200" data-spark-title="Exam scores" data-spark-colors="#10b981" data-spark-data="45,52,55,58,61,63,64,66,67,68,69,70,71,72,72,74,75,76,78,79,81,83,85,88,91,95"></div></div>
  <div class="card p-6 spark-chart-histogram" data-spark-background data-spark-bins="10" data-spark-data="1,2,2,3,3,3,4,4,4,4,5,5,5,6,6,7,8" style="min-height:200px"><h4 class="m-0">Distribution</h4><p class="m-0">A histogram as a card background.</p></div>
</div>`, label: 'Fixed step, and as a card background' },
  ],
};
