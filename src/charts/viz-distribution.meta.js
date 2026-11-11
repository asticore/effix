module.exports = {
  title: 'Distribution',
  group: 'Visualisations',
  dataFormat: `Raw samples, not summaries. Groups = <code>data-efx-labels</code> (or <code>"labels"</code>), one array of numbers per group per series.
<code>{"labels":["Fri","Sat"],"series":[{"name":"Tips","data":[[2,3,3,5,8],[4,6,6,9,15]]}]}</code>
Several series → <code>"series":[{"name":"2025","data":[[…],[…]]},{"name":"2026","data":[[…],[…]]}]</code> (one color per series).
Shorthands: <code>[1,2,2,3]</code> (one group) · <code>[[…],[…]]</code> (one group per array).
Also an inline <code>&lt;script type="application/json"&gt;</code> or an <code>efx:data</code> event.`,
  summary: 'Gaussian-KDE density curves, violins, ridgelines or beeswarms from raw samples. Silverman bandwidth by default. Hover for count, median and quartiles; click a legend key to hide a group.',
  classes: [['efx-viz-distribution', 'Renders a distribution plot; pick the shape with data-efx-mode.']],
  options: [
    ['data-efx-mode', 'density', '<code>density</code> (overlaid curves) · <code>violin</code> · <code>ridgeline</code> · <code>beeswarm</code>.'],
    ['data-efx-data', '', 'Samples as JSON (see data format).'],
    ['data-efx-labels', '', 'Group names: "Fri|Sat|Sun".'],
    ['data-efx-names', '', 'Series names.'],
    ['data-efx-bandwidth', 'auto', 'KDE bandwidth in value units (default: Silverman rule of thumb).'],
    ['data-efx-overlap', '0.8', 'Ridgeline: how far peaks rise into the row above (0 = none).'],
    ['data-efx-grid', 'true', 'Gridlines.'],
    ['data-efx-height', '', 'Chart height in px.'],
    ['data-efx-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6".'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact / decimals / format', '', '12.3k style, fixed decimals, or a registered formatter name.'],
    ['data-efx-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no axes/tooltip).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-grid / --efx-chart-text', 'muted', 'Gridlines and axis labels.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Curve, violin or dot clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch on the element with detail { labels, series:[{name, data:[[…]]}] } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Response time by region (ms)</h3>
  <div class="efx-viz-distribution" data-efx-mode="violin" data-efx-suffix="ms" data-efx-title="Response times"><script type="application/json">{"labels":["EU","US","Asia"],"series":[{"data":[[88,92,95,99,101,104,108,110,112,118,125,131,140,150],[60,64,66,70,72,73,75,79,80,84,90,96,120,180],[110,125,130,140,150,155,160,170,190,210,240,260,310,400]]}]}</script></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-viz-distribution" data-efx-mode="ridgeline" data-efx-title="Scores by class"><script type="application/json">{"labels":["Class A","Class B","Class C","Class D"],"series":[{"data":[[52,58,61,64,66,68,70,71,73,75,79,84],[40,45,50,55,58,60,62,65,70,74,80,88],[65,70,72,74,76,78,79,80,82,85,88,92],[30,38,44,48,52,55,57,60,66,71,77,83]]}]}</script></div></div>
  <div class="card p-6 text-center efx-viz-distribution" style="min-height:180px" data-efx-mode="density" data-efx-background data-efx-data="[[1,2,2,3,3,3,4,4,5,7],[3,4,5,5,6,6,6,7,8,9]]" data-efx-bandwidth="1"><h3 class="m-0">412 ms</h3><p class="m-0">median latency</p></div>
</div>`, label: 'Ridgeline, and a density curve as a stat-card background' },
  ],
};
