module.exports = {
  title: 'Sparkline',
  group: 'Charts',
  dataFormat: `A short list of numbers (first series), drawn as <code>data-spark-type="line|bar|win-loss"</code>.
<code>data-spark-data="3,5,4,8,6,9"</code> or JSON <code>[3,5,4,8,6,9]</code> · <code>[{"label":"Mon","value":3}]</code>.
Labels (optional, used by the tooltip): <code>data-spark-labels="Mon|Tue|Wed"</code>.
Works on any inline element (<code>&lt;span&gt;</code>, badge, button, stat card) or as <code>data-spark-background</code>.`,
  summary: 'A tiny chart for use inside text, badges, buttons and stat cards, or as a card background. Inline elements become about 6em wide and 1.2em tall and sit on the text baseline. Hover for the nearest value.',
  classes: [['spark-chart-spark', 'Renders a sparkline (line, bar or win-loss) from data-spark-data.']],
  options: [
    ['data-spark-data', '', '"3,5,4,8" (first series only) · JSON [3,5,4].'],
    ['data-spark-labels', '', 'Tooltip labels: "Mon|Tue|Wed" (default 1, 2, 3…).'],
    ['data-spark-type', 'line', 'line · bar · win-loss (positive values up, negative down).'],
    ['data-spark-area', 'true', 'Gradient fill under the line (type line).'],
    ['data-spark-last', 'true', 'Dot on the last point (type line).'],
    ['data-spark-smooth', 'true', 'Monotone curve (type line).'],
    ['data-spark-height', '40 / 1.2em', 'Height in px; inline elements default to 1.2em, others to 40.'],
    ['data-spark-colors', 'Shine tones', 'Line/bar color; win-loss uses "#win|#loss" (default success / danger).'],
    ['data-spark-prefix / suffix / compact / decimals', '', 'Tooltip value formatting.'],
    ['data-spark-legend', 'false', 'Legend (off by default).'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--spark-chart-1 … 7', 'Shine tones', 'Palette.'], ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.']],
  events: [
    ['spark:select', 'Point clicked / Enter pressed. detail = { index, label, value }.'],
    ['spark:data (listen)', 'Dispatch with detail { series: [{ values }] } to update.'],
  ],
  examples: [
    { html: `<p class="m-0">Signups <strong>1,284</strong> <span class="spark-chart-spark" data-spark-data="4,6,5,9,8,12,11,15" data-spark-title="Signups trend"></span> and churn <span class="spark-chart-spark" data-spark-type="bar" data-spark-colors="#ef4444" data-spark-data="5,4,6,3,4,2,3,2" data-spark-title="Churn"></span> are both improving.</p>` },
    { html: `<div class="grid md:grid-cols-3 gap-4">
  <div class="card p-6"><div class="text-sm">MRR</div><div class="text-2xl font-bold">$48.2k</div><div class="spark-chart-spark" data-spark-data="30,32,31,36,40,39,44,48" data-spark-prefix="$" data-spark-suffix="k" data-spark-title="MRR"></div></div>
  <div class="card p-6"><div class="text-sm">Daily results</div><div class="spark-chart-spark" data-spark-type="win-loss" data-spark-height="32" data-spark-data="2,-1,3,1,-2,-1,4,2,1,-3,2,5" data-spark-title="Wins and losses"></div></div>
  <div class="card p-6 spark-chart-spark" data-spark-background data-spark-data="3,6,4,9,7,12,10,15" style="min-height:120px"><span class="badge">Live</span><div class="text-2xl font-bold">15 online</div></div>
</div>
<p><button class="btn">Traffic <span class="spark-chart-spark" data-spark-data="2,3,2,5,4,6" data-spark-area="false" data-spark-colors="#fff" data-spark-title="Traffic"></span></button></p>`, label: 'Sparklines inline, in a button, in stat cards and as a background' },
  ],
};
