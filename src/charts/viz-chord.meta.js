module.exports = {
  title: 'Chord diagram',
  group: 'Visualisations',
  dataFormat: `Square flow matrix: row = source, column = target; labels name the groups.
<code>{"labels":["A","B","C"],"matrix":[[0,5,2],[3,0,4],[1,2,0]]}</code>
or <code>data-efx-data="[[0,5,2],[3,0,4],[1,2,0]]"</code> with <code>data-efx-labels="A|B|C"</code>.
Hover a ribbon for "A → B: x, B → A: y"; hover an outer arc to isolate its flows.`,
  summary: 'Chord diagram: outer arcs per group, ribbons sized by flow between groups. Hover a group to highlight its ribbons, hover a ribbon for both directions.',
  classes: [['efx-viz-chord', 'Renders a chord diagram from a square matrix.']],
  options: [
    ['data-efx-data', '', 'Matrix JSON (see data format).'],
    ['data-efx-labels', '', 'Group labels "A|B|C".'],
    ['data-efx-gap', '0.04', 'Gap between groups in radians.'],
    ['data-efx-height', '380', 'Chart height in px.'],
    ['data-efx-colors', 'Shine tones', 'Group colors.'],
    ['data-efx-prefix / suffix / compact', '', 'Value formatting.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Group palette.']],
  events: [
    ['efx:select', 'Arc or ribbon clicked / Enter. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch with { labels, matrix } as detail.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Migration between regions</h3>
  <div class="efx-viz-chord" data-efx-suffix="k" data-efx-data='{"labels":["Europe","Asia","Americas","Africa"],"matrix":[[0,12,18,4],[9,0,15,6],[22,11,0,3],[7,10,2,0]]}'></div>
</div>` },
    { html: `<a class="btn btn-lg efx-viz-chord" href="#" data-efx-background data-efx-height="0" style="min-height:120px" data-efx-data="[[0,4,2],[3,0,5],[1,3,0]]">Flows</a>`, label: 'As a button background' },
  ],
};
