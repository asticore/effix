module.exports = {
  title: 'Venn diagram',
  group: 'Diagrams',
  dataFormat: `A list of regions: <code>[{"sets":["Design"],"size":12},{"sets":["Dev"],"size":10},{"sets":["Design","Dev"],"size":4}]</code>.
A one-set entry is that set's <em>total</em> size (circle area ∝ size); a two- or three-set entry is the size of that overlap. Two-set overlaps are exact; with three sets each pair overlap is exact and the centre region is approximate.
<code>sets</code> may also be written <code>"Design&amp;Dev"</code>. Up to three sets. Data can sit in <code>data-efx-data</code>, an inline <code>&lt;script type="application/json"&gt;</code>, or arrive through <code>efx:data</code> as an array.`,
  summary: 'Area-proportional two- or three-set Venn with translucent blended circles, set names, totals and overlap counts. Hover a region (or arrow through them) for a tooltip; click fires <code>efx:select</code>.',
  classes: [['efx-chart-venn', 'Renders a 2- or 3-set Venn from region sizes.']],
  options: [
    ['data-efx-data', '', 'JSON regions [{"sets":["A"],"size":12},{"sets":["A","B"],"size":4}].'],
    ['data-efx-opacity', '0.4', 'Circle fill opacity.'],
    ['data-efx-height', '300', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'One color per set "#f43f5e|#8b5cf6|#10b981".'],
    ['data-efx-prefix / suffix / compact / decimals', '', 'Number formatting of the counts.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: just the circles, behind the content.'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 3', 'Shine tones', 'Set colors.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Region clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch on the chart with detail = a regions array to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Who uses what</h3>
  <div class="efx-chart-venn" data-efx-data='[{"sets":["Web"],"size":120},{"sets":["Mobile"],"size":80},{"sets":["Desktop"],"size":50},{"sets":["Web","Mobile"],"size":35},{"sets":["Web","Desktop"],"size":20},{"sets":["Mobile","Desktop"],"size":12},{"sets":["Web","Mobile","Desktop"],"size":6}]' data-efx-suffix=" users"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-venn" data-efx-height="200" data-efx-data='[{"sets":["Design"],"size":12},{"sets":["Dev"],"size":10},{"sets":["Design","Dev"],"size":4}]' data-efx-title="Design and dev overlap"></div></div>
  <div class="card p-6 efx-chart-venn" data-efx-background data-efx-data='[{"sets":["A"],"size":10},{"sets":["B"],"size":8},{"sets":["A","B"],"size":3}]'><h3 class="m-0">Overlap</h3><p class="m-0">Venn as a card background.</p></div>
</div>`, label: 'Two-set overlap, and a Venn as a card background' },
  ],
};
