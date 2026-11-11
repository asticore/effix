module.exports = {
  title: 'Bump and slope',
  group: 'Visualisations',
  dataFormat: `Periods = <code>data-efx-labels</code>, one series per item with one value per period; ranks are computed per period (highest value = #1).
<code>{"labels":["2023","2024","2025"],"series":[{"name":"Rust","data":[5,8,9]},{"name":"Go","data":[7,7,6]}]}</code>
Already have ranks? Add <code>data-efx-ranks</code> and give ranks (1 = best) as the values.
Slope mode uses the first and last period and plots the values themselves.
Also <code>[{"name","data"}]</code>, an inline JSON script, a table via <code>data-efx-source</code> or an <code>efx:data</code> event.`,
  summary: 'Bump chart: smooth rank lines with dots and end labels. Slope chart: two periods side by side. Hover or arrow through items to highlight one and read its path in the tooltip.',
  classes: [['efx-viz-rank', 'Renders a bump or slope chart.']],
  options: [
    ['data-efx-mode', 'bump', '<code>bump</code> (ranks over periods) or <code>slope</code> (first vs last period).'],
    ['data-efx-data', '', 'Items and values (see data format).'],
    ['data-efx-labels', '', 'Period names: "2023|2024|2025".'],
    ['data-efx-ranks', 'false', 'Values are already ranks (1 = best).'],
    ['data-efx-smooth', 'true', 'Curved connectors (false = straight).'],
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
    ['efx:select', 'Item clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['efx:data (listen)', 'Dispatch with detail { labels, series } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Language popularity</h3>
  <div class="efx-viz-rank" data-efx-labels="2021|2022|2023|2024|2025" data-efx-data='[{"name":"Python","data":[90,92,95,97,98]},{"name":"JavaScript","data":[88,90,91,90,89]},{"name":"Rust","data":[30,40,55,70,82]},{"name":"Go","data":[50,55,60,64,66]},{"name":"Java","data":[85,80,76,72,65]},{"name":"PHP","data":[60,55,45,38,30]}]'></div>
</div>` },
    { html: `<div class="card p-6" style="max-width:26rem"><h3 class="m-0 mb-2">Revenue by team</h3><div class="efx-viz-rank" data-efx-mode="slope" data-efx-labels="2024|2025" data-efx-height="240" data-efx-prefix="$" data-efx-suffix="k" data-efx-data='[{"name":"Sales","data":[120,160]},{"name":"Support","data":[90,85]},{"name":"Ops","data":[70,110]},{"name":"R&D","data":[40,38]}]'></div></div>`, label: 'Slope chart inside a stat card' },
  ],
};
