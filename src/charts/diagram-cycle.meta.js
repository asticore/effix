module.exports = {
  title: 'Cycle diagram',
  group: 'Diagrams',
  dataFormat: `Steps are the labels, in order: <code>data-spark-labels="Plan|Build|Measure|Learn"</code> (or JSON <code>[{"label":"Plan","desc":"Pick a bet"}]</code>, <code>{"labels":[…]}</code>).
Step descriptions show in the tooltip: <code>data-spark-descriptions="Pick a bet|Ship it|…"</code>, or a <code>desc</code> field on each JSON item. Arrows run clockwise and the last step loops back to the first.
Values are not used; an inline <code>&lt;script type="application/json"&gt;</code> and <code>spark:data</code> (<code>{labels, descriptions}</code> or an items array) also work.`,
  summary: 'Numbered steps on a circle joined by curved, flowing arrows, with an optional centre label. Hover or arrow-key through steps for the description; click a step to fire <code>spark:select</code>. The arrow flow stops for reduced motion.',
  classes: [['spark-diagram-cycle', 'Renders a loop diagram from data-spark-labels.']],
  options: [
    ['data-spark-labels', '', 'Step names in order: "Plan|Build|Measure|Learn".'],
    ['data-spark-descriptions', '', 'Tooltip text per step, "a|b|c".'],
    ['data-spark-center', '', 'Label in the middle; "|" starts a new line.'],
    ['data-spark-numbers', 'true', 'Number the steps.'],
    ['data-spark-flow', 'true', 'Animate dashes flowing along the arrows.'],
    ['data-spark-start', '0', 'Angle of step 1 in degrees (0 = top, clockwise).'],
    ['data-spark-height', '340', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'One color per step.'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: just nodes and arrows, behind the content.'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Step colors.'],
    ['--spark-chart-text', 'muted text', 'Arrows.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Step clicked / Enter pressed. detail = { index, label, value }.'],
    ['spark:data (listen)', 'Dispatch on the diagram with detail { labels, descriptions } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Product loop</h3>
  <div class="spark-diagram-cycle" data-spark-center="Ship|learn|repeat" data-spark-labels="Discover|Build|Launch|Measure|Learn" data-spark-descriptions="Talk to users and find the problem|Make the smallest useful thing|Put it in front of real people|Watch what they actually do|Decide what to change next"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-diagram-cycle" data-spark-height="260" data-spark-labels="Plan|Do|Check|Act" data-spark-title="PDCA cycle"></div></div>
  <div class="card p-6 spark-diagram-cycle" data-spark-background data-spark-labels="A|B|C|D|E"><h3 class="m-0">Always iterating</h3><p class="m-0">Cycle as a card background.</p></div>
</div>`, label: 'Compact PDCA loop, and a cycle as a card background' },
  ],
};
