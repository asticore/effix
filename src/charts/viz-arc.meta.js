module.exports = {
  title: 'Arc diagram',
  group: 'Visualisations',
  dataFormat: `Same graph JSON as the network graph: <code>{"nodes":[{"id","group?","label?"}],"links":[{"source","target","value?"}]}</code>.
Nodes sit on a line in the given order (or <code>data-spark-sort="group|degree"</code>); link width = <code>value</code>.
Example: <code>{"nodes":[{"id":"a"},{"id":"b"},{"id":"c"}],"links":[{"source":"a","target":"c","value":3}]}</code>`,
  summary: 'Nodes on a line, links drawn as arcs above it. Hover a node to highlight its arcs, hover an arc for its endpoints and value.',
  classes: [['spark-viz-arc', 'Renders an arc diagram from graph JSON.']],
  options: [
    ['data-spark-data', '', 'Graph JSON (see data format).'],
    ['data-spark-sort', '', 'Order nodes by "group" or "degree" (default: input order).'],
    ['data-spark-radius', '5', 'Base node radius.'],
    ['data-spark-height', '280', 'Chart height in px.'],
    ['data-spark-colors', 'Shine tones', 'Group colors.'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [['--spark-chart-1 … 7', 'Shine tones', 'Group palette.']],
  events: [
    ['spark:select', 'Node or arc clicked / Enter. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Dispatch with a new graph { nodes, links } as detail.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Character co-appearances</h3>
  <div class="spark-viz-arc" data-spark-sort="group" data-spark-data='{"nodes":[{"id":"Myriel","group":"A"},{"id":"Napoleon","group":"A"},{"id":"Valjean","group":"B"},{"id":"Javert","group":"B"},{"id":"Fantine","group":"C"},{"id":"Cosette","group":"C"},{"id":"Marius","group":"D"},{"id":"Eponine","group":"D"}],"links":[{"source":"Myriel","target":"Napoleon","value":2},{"source":"Myriel","target":"Valjean","value":5},{"source":"Valjean","target":"Javert","value":8},{"source":"Valjean","target":"Fantine","value":4},{"source":"Valjean","target":"Cosette","value":9},{"source":"Cosette","target":"Marius","value":6},{"source":"Marius","target":"Eponine","value":3},{"source":"Javert","target":"Eponine"},{"source":"Fantine","target":"Cosette","value":3}]}'></div>
</div>` },
    { html: `<span class="badge spark-viz-arc" style="display:inline-block;inline-size:12rem" data-spark-background data-spark-height="0" data-spark-data='{"nodes":[1,2,3,4,5,6],"links":[{"source":1,"target":3},{"source":2,"target":6},{"source":1,"target":5},{"source":4,"target":6}]}'>6 nodes</span>`, label: 'Inside a badge' },
  ],
};
