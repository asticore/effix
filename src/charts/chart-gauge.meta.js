module.exports = {
  title: 'Gauge & ring',
  group: 'Charts',
  dataFormat: `A single value, within <code>data-efx-min</code> / <code>data-efx-max</code> (default 0–100).
<code>data-efx-value="72"</code> (gauge or ring) · or <code>data-efx-data="72"</code>; optional <code>data-efx-label="Uptime"</code>, <code>data-efx-target="90"</code>.
Radial type (<code>data-efx-type="radial"</code>): one ring per value, names from labels:
<code>data-efx-data="80,60,35" data-efx-labels="Move|Exercise|Stand"</code> or JSON <code>[{"label":"Move","value":80}]</code>.
Live update: dispatch <code>efx:data</code> with <code>detail: { value: 64 }</code>.`,
  summary: 'A 240° gauge (optional needle and target marker), a full progress ring, or concentric radial bars. Sweeps in on entry. Scales down into a badge, button or stat card.',
  classes: [['efx-chart-gauge', 'Renders a gauge from data-efx-value (or the first data value).']],
  options: [
    ['data-efx-type', 'gauge', '<code>gauge</code> 240° arc · <code>ring</code> full circle · <code>radial</code> one concentric ring per label.'],
    ['data-efx-value', 'first data value', 'Current value.'],
    ['data-efx-min / max', '0 / 100', 'Scale.'],
    ['data-efx-thick', '0.18', 'Arc thickness as a ratio of the radius.'],
    ['data-efx-needle', 'false', 'Show a needle (gauge only).'],
    ['data-efx-target', '', 'Draw a target tick at this value.'],
    ['data-efx-label', '', 'Caption under the value.'],
    ['data-efx-data / labels', '', 'For radial: "80,60,35" and "Move|Exercise|Stand".'],
    ['data-efx-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6" (per stage / slice / series).'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact', 'false', '12.3k style numbers.'],
    ['data-efx-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no labels/tooltip).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Arc colors (first = gauge/ring).']],
  events: [['efx:select', 'Arc clicked. detail = { index, label, value }.'], ['efx:data (listen)', 'Dispatch with detail { labels, series } to update.']],
  examples: [
    { html: `<div class="grid md:grid-cols-3 gap-4">
  <div class="card p-6"><div class="efx-chart-gauge" data-efx-value="72" data-efx-label="Uptime" data-efx-suffix="%" data-efx-needle data-efx-target="90" data-efx-height="200"></div></div>
  <div class="card p-6"><div class="efx-chart-gauge" data-efx-type="ring" data-efx-value="64" data-efx-label="Storage" data-efx-suffix="%" data-efx-height="200"></div></div>
  <div class="card p-6"><div class="efx-chart-gauge" data-efx-type="radial" data-efx-data="82,64,38" data-efx-labels="Move|Exercise|Stand" data-efx-height="200"></div></div>
</div>` },
    { html: `<div class="card p-6 flex items-center gap-4">
  <div class="efx-chart-gauge" data-efx-type="ring" data-efx-value="78" data-efx-height="48" data-efx-thick="0.22" style="width:48px;height:48px"></div>
  <div><strong>Sprint progress</strong><br><span class="badge">78% complete</span></div>
</div>`, label: 'A tiny ring inside a stat card' },
  ],
};
