module.exports = {
  title: 'Pyramid',
  group: 'Diagrams',
  dataFormat: `Tiers are the labels, <strong>top to bottom</strong>: <code>data-efx-labels="Vision|Strategy|Tactics|Tasks"</code>.
Without values every tier gets the same height. Add values (<code>data-efx-data="1,3,6,12"</code>, JSON <code>[{"label":"Vision","value":1}]</code>, or a table via <code>data-efx-source</code>) and tier heights follow them (set <code>data-efx-equal</code> to ignore them).
Side notes are one per tier, in the same order: <code>data-efx-notes="Why|Where|How|What"</code>. Only the first series is used.`,
  summary: 'Layered pyramid (or inverted triangle) with stacked tiers, optional value-sized bands and leader-lined side notes. Tiers stagger in. Click a legend key to hide a tier, click a tier to fire <code>efx:select</code>.',
  classes: [['efx-chart-pyramid', 'Renders a pyramid from data-efx-labels (and optional values).']],
  options: [
    ['data-efx-labels', '', 'Tier names top → bottom: "A|B|C".'],
    ['data-efx-data', '', 'Optional values "1,3,6,12": tier heights follow them.'],
    ['data-efx-equal', 'false', 'Equal tier heights even when values exist.'],
    ['data-efx-inverted', 'false', 'Point the triangle down (widest tier on top).'],
    ['data-efx-notes', '', 'Side annotations, one per tier "Why|Where|How".'],
    ['data-efx-gap', '3', 'Gap between tiers in px.'],
    ['data-efx-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'One color per tier.'],
    ['data-efx-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: just the tiers, behind the content.'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Tier colors.'],
    ['--efx-chart-text', 'muted text', 'Side notes.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Tier clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Planning layers</h3>
  <div class="efx-chart-pyramid" data-efx-labels="Vision|Strategy|Tactics|Daily tasks" data-efx-notes="Why we exist|Where we play and how we win|Quarterly bets and projects|The work itself" data-efx-legend="false"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-pyramid" data-efx-inverted data-efx-height="240" data-efx-data="420,260,140,60" data-efx-labels="Leads|Qualified|Proposals|Won" data-efx-legend="false" data-efx-title="Sales pipeline"></div></div>
  <div class="card p-6 efx-chart-pyramid" data-efx-background data-efx-labels="A|B|C|D"><h3 class="m-0">Foundations first</h3><p class="m-0">Pyramid as a card background.</p></div>
</div>`, label: 'Inverted value-sized pyramid, and a pyramid as a card background' },
  ],
};
