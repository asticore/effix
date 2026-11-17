module.exports = {
  title: 'Pyramid',
  group: 'Diagrams',
  dataFormat: `Tiers are the labels, <strong>top to bottom</strong>: <code>data-spark-labels="Vision|Strategy|Tactics|Tasks"</code>.
Without values every tier gets the same height. Add values (<code>data-spark-data="1,3,6,12"</code>, JSON <code>[{"label":"Vision","value":1}]</code>, or a table via <code>data-spark-source</code>) and tier heights follow them (set <code>data-spark-equal</code> to ignore them).
Side notes are one per tier, in the same order: <code>data-spark-notes="Why|Where|How|What"</code>. Only the first series is used.`,
  summary: 'Layered pyramid (or inverted triangle) with stacked tiers, optional value-sized bands and leader-lined side notes. Tiers stagger in. Click a legend key to hide a tier, click a tier to fire <code>spark:select</code>.',
  classes: [['spark-chart-pyramid', 'Renders a pyramid from data-spark-labels (and optional values).']],
  options: [
    ['data-spark-labels', '', 'Tier names top → bottom: "A|B|C".'],
    ['data-spark-data', '', 'Optional values "1,3,6,12": tier heights follow them.'],
    ['data-spark-equal', 'false', 'Equal tier heights even when values exist.'],
    ['data-spark-inverted', 'false', 'Point the triangle down (widest tier on top).'],
    ['data-spark-notes', '', 'Side annotations, one per tier "Why|Where|How".'],
    ['data-spark-gap', '3', 'Gap between tiers in px.'],
    ['data-spark-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'One color per tier.'],
    ['data-spark-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: just the tiers, behind the content.'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--spark-chart-1 … 7', 'Shine tones', 'Tier colors.'],
    ['--spark-chart-text', 'muted text', 'Side notes.'],
    ['--spark-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['spark:select', 'Tier clicked / Enter pressed. detail = { index, label, value }.'],
    ['spark:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Planning layers</h3>
  <div class="spark-chart-pyramid" data-spark-labels="Vision|Strategy|Tactics|Daily tasks" data-spark-notes="Why we exist|Where we play and how we win|Quarterly bets and projects|The work itself" data-spark-legend="false"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-pyramid" data-spark-inverted data-spark-height="240" data-spark-data="420,260,140,60" data-spark-labels="Leads|Qualified|Proposals|Won" data-spark-legend="false" data-spark-title="Sales pipeline"></div></div>
  <div class="card p-6 spark-chart-pyramid" data-spark-background data-spark-labels="A|B|C|D"><h3 class="m-0">Foundations first</h3><p class="m-0">Pyramid as a card background.</p></div>
</div>`, label: 'Inverted value-sized pyramid, and a pyramid as a card background' },
  ],
};
