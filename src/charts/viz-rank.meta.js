module.exports = {
  title: 'Bump and slope',
  group: 'Visualisations',
  dataFormat: `Periods = <code>data-spark-labels</code>, one series per item with one value per period; ranks are computed per period (highest value = #1).
<code>{"labels":["2023","2024","2025"],"series":[{"name":"Rust","data":[5,8,9]},{"name":"Go","data":[7,7,6]}]}</code>
Already have ranks? Add <code>data-spark-ranks</code> and give ranks (1 = best) as the values.
Slope mode uses the first and last period and plots the values themselves.
Also <code>[{"name","data"}]</code>, an inline JSON script, a table via <code>data-spark-source</code> or an <code>spark:data</code> event.`,
  summary: 'Bump chart: smooth rank lines with dots and end labels. Slope chart: two periods side by side. Hover or arrow through items to highlight one and read its path in the tooltip.',
  classes: [['spark-viz-rank', 'Renders a bump or slope chart.']],
  options: [
    ['data-spark-mode', 'bump', '<code>bump</code> (ranks over periods) or <code>slope</code> (first vs last period).'],
    ['data-spark-data', '', 'Items and values (see data format).'],
    ['data-spark-labels', '', 'Period names: "2023|2024|2025".'],
    ['data-spark-ranks', 'false', 'Values are already ranks (1 = best).'],
    ['data-spark-smooth', 'true', 'Curved connectors (false = straight).'],
    ['data-spark-height', '', 'Chart height in px.'],
    ['data-spark-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6".'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-spark-compact / decimals / format', '', '12.3k style, fixed decimals, or a registered formatter name.'],
    ['data-spark-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content (no axes/tooltip).'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--spark-chart-grid / --spark-chart-text', 'muted', 'Gridlines and axis labels.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Item clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Dispatch with detail { labels, series } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Language popularity</h3>
  <div class="spark-viz-rank" data-spark-labels="2021|2022|2023|2024|2025" data-spark-data='[{"name":"Python","data":[90,92,95,97,98]},{"name":"JavaScript","data":[88,90,91,90,89]},{"name":"Rust","data":[30,40,55,70,82]},{"name":"Go","data":[50,55,60,64,66]},{"name":"Java","data":[85,80,76,72,65]},{"name":"PHP","data":[60,55,45,38,30]}]'></div>
</div>` },
    { html: `<div class="card p-6" style="max-width:26rem"><h3 class="m-0 mb-2">Revenue by team</h3><div class="spark-viz-rank" data-spark-mode="slope" data-spark-labels="2024|2025" data-spark-height="240" data-spark-prefix="$" data-spark-suffix="k" data-spark-data='[{"name":"Sales","data":[120,160]},{"name":"Support","data":[90,85]},{"name":"Ops","data":[70,110]},{"name":"R&D","data":[40,38]}]'></div></div>`, label: 'Slope chart inside a stat card' },
  ],
};
