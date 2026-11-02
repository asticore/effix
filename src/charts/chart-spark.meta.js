module.exports = {
  title: 'Sparkline',
  group: 'Charts',
  dataFormat: `A short list of numbers (first series), drawn as <code>data-efx-type="line|bar|win-loss"</code>.
<code>data-efx-data="3,5,4,8,6,9"</code> or JSON <code>[3,5,4,8,6,9]</code> · <code>[{"label":"Mon","value":3}]</code>.
Labels (optional, used by the tooltip): <code>data-efx-labels="Mon|Tue|Wed"</code>.
Works on any inline element (<code>&lt;span&gt;</code>, badge, button, stat card) or as <code>data-efx-background</code>.`,
  summary: 'A tiny chart for use inside text, badges, buttons and stat cards, or as a card background. Inline elements become about 6em wide and 1.2em tall and sit on the text baseline. Hover for the nearest value.',
  classes: [['efx-chart-spark', 'Renders a sparkline (line, bar or win-loss) from data-efx-data.']],
  options: [
    ['data-efx-data', '', '"3,5,4,8" (first series only) · JSON [3,5,4].'],
    ['data-efx-labels', '', 'Tooltip labels: "Mon|Tue|Wed" (default 1, 2, 3…).'],
    ['data-efx-type', 'line', 'line · bar · win-loss (positive values up, negative down).'],
    ['data-efx-area', 'true', 'Gradient fill under the line (type line).'],
    ['data-efx-last', 'true', 'Dot on the last point (type line).'],
    ['data-efx-smooth', 'true', 'Monotone curve (type line).'],
    ['data-efx-height', '40 / 1.2em', 'Height in px; inline elements default to 1.2em, others to 40.'],
    ['data-efx-colors', 'Shine tones', 'Line/bar color; win-loss uses "#win|#loss" (default success / danger).'],
    ['data-efx-prefix / suffix / compact / decimals', '', 'Tooltip value formatting.'],
    ['data-efx-legend', 'false', 'Legend (off by default).'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Palette.'], ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.']],
  events: [
    ['efx:select', 'Point clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch with detail { series: [{ values }] } to update.'],
  ],
  examples: [
    { html: `<p class="m-0">Signups <strong>1,284</strong> <span class="efx-chart-spark" data-efx-data="4,6,5,9,8,12,11,15" data-efx-title="Signups trend"></span> and churn <span class="efx-chart-spark" data-efx-type="bar" data-efx-colors="#ef4444" data-efx-data="5,4,6,3,4,2,3,2" data-efx-title="Churn"></span> are both improving.</p>` },
    { html: `<div class="grid md:grid-cols-3 gap-4">
  <div class="card p-6"><div class="text-sm">MRR</div><div class="text-2xl font-bold">$48.2k</div><div class="efx-chart-spark" data-efx-data="30,32,31,36,40,39,44,48" data-efx-prefix="$" data-efx-suffix="k" data-efx-title="MRR"></div></div>
  <div class="card p-6"><div class="text-sm">Daily results</div><div class="efx-chart-spark" data-efx-type="win-loss" data-efx-height="32" data-efx-data="2,-1,3,1,-2,-1,4,2,1,-3,2,5" data-efx-title="Wins and losses"></div></div>
  <div class="card p-6 efx-chart-spark" data-efx-background data-efx-data="3,6,4,9,7,12,10,15" style="min-height:120px"><span class="badge">Live</span><div class="text-2xl font-bold">15 online</div></div>
</div>
<p><button class="btn">Traffic <span class="efx-chart-spark" data-efx-data="2,3,2,5,4,6" data-efx-area="false" data-efx-colors="#fff" data-efx-title="Traffic"></span></button></p>`, label: 'Sparklines inline, in a button, in stat cards and as a background' },
  ],
};
