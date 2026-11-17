module.exports = {
  title: 'Gauge & ring',
  group: 'Charts',
  dataFormat: `A single value, within <code>data-spark-min</code> / <code>data-spark-max</code> (default 0–100).
<code>data-spark-value="72"</code> (gauge or ring) · or <code>data-spark-data="72"</code>; optional <code>data-spark-label="Uptime"</code>, <code>data-spark-target="90"</code>.
Radial type (<code>data-spark-type="radial"</code>): one ring per value, names from labels:
<code>data-spark-data="80,60,35" data-spark-labels="Move|Exercise|Stand"</code> or JSON <code>[{"label":"Move","value":80}]</code>.
Live update: dispatch <code>spark:data</code> with <code>detail: { value: 64 }</code>.`,
  summary: 'A 240° gauge (optional needle and target marker), a full progress ring, or concentric radial bars. Sweeps in on entry. Scales down into a badge, button or stat card.',
  classes: [['spark-chart-gauge', 'Renders a gauge from data-spark-value (or the first data value).']],
  options: [
    ['data-spark-type', 'gauge', '<code>gauge</code> 240° arc · <code>ring</code> full circle · <code>radial</code> one concentric ring per label.'],
    ['data-spark-value', 'first data value', 'Current value.'],
    ['data-spark-min / max', '0 / 100', 'Scale.'],
    ['data-spark-thick', '0.18', 'Arc thickness as a ratio of the radius.'],
    ['data-spark-needle', 'false', 'Show a needle (gauge only).'],
    ['data-spark-target', '', 'Draw a target tick at this value.'],
    ['data-spark-label', '', 'Caption under the value.'],
    ['data-spark-data / labels', '', 'For radial: "80,60,35" and "Move|Exercise|Stand".'],
    ['data-spark-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6" (per stage / slice / series).'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-spark-compact', 'false', '12.3k style numbers.'],
    ['data-spark-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content (no labels/tooltip).'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--spark-chart-1 … 7', 'Shine tones', 'Arc colors (first = gauge/ring).']],
  events: [['spark:select', 'Arc clicked. detail = { index, label, value }.'], ['spark:data (listen)', 'Dispatch with detail { labels, series } to update.']],
  examples: [
    { html: `<div class="grid md:grid-cols-3 gap-4">
  <div class="card p-6"><div class="spark-chart-gauge" data-spark-value="72" data-spark-label="Uptime" data-spark-suffix="%" data-spark-needle data-spark-target="90" data-spark-height="200"></div></div>
  <div class="card p-6"><div class="spark-chart-gauge" data-spark-type="ring" data-spark-value="64" data-spark-label="Storage" data-spark-suffix="%" data-spark-height="200"></div></div>
  <div class="card p-6"><div class="spark-chart-gauge" data-spark-type="radial" data-spark-data="82,64,38" data-spark-labels="Move|Exercise|Stand" data-spark-height="200"></div></div>
</div>` },
    { html: `<div class="card p-6 flex items-center gap-4">
  <div class="spark-chart-gauge" data-spark-type="ring" data-spark-value="78" data-spark-height="48" data-spark-thick="0.22" style="width:48px;height:48px"></div>
  <div><strong>Sprint progress</strong><br><span class="badge">78% complete</span></div>
</div>`, label: 'A tiny ring inside a stat card' },
  ],
};
