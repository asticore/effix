module.exports = {
  title: 'Network graph',
  group: 'Visualisations',
  dataFormat: `Graph JSON: <code>{"nodes":[{"id","group?","size?","label?"}],"links":[{"source","target","value?"}]}</code>.
<code>source</code>/<code>target</code> are node ids. Colour = <code>group</code>, radius = <code>size</code>, link width = <code>value</code>.
Pass it via <code>data-spark-data</code> or an inline <code>&lt;script type="application/json"&gt;</code>.
Example: <code>{"nodes":[{"id":"a","group":"x"},{"id":"b","group":"y"}],"links":[{"source":"a","target":"b"}]}</code>`,
  summary: 'Force-directed graph with its own tiny physics (springs, repulsion, collisions) that cools and stops. Drag nodes, zoom with the wheel, hover to highlight neighbours, arrow-key between nodes. Reduced motion renders the settled layout statically.',
  classes: [['spark-viz-network', 'Renders a force-directed graph from graph JSON.']],
  options: [
    ['data-spark-data', '', 'Graph JSON (see data format).'],
    ['data-spark-label', 'false', 'Print node labels (label or id).'],
    ['data-spark-zoom', 'true', 'Wheel zoom and background pan.'],
    ['data-spark-link-distance', '70', 'Preferred link length in px.'],
    ['data-spark-charge', '60', 'Repulsion strength between nodes.'],
    ['data-spark-radius', '5', 'Average node radius.'],
    ['data-spark-height', '420', 'Chart height in px.'],
    ['data-spark-colors', 'Shine tones', 'Group colors "#f43f5e|#8b5cf6".'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off (animate off = static layout).'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [['--spark-chart-1 … 7', 'Shine tones', 'Group palette.'], ['--spark-chart-text', 'muted text', 'Link color.']],
  events: [
    ['spark:select', 'Node clicked / Enter pressed. detail = { index, label, value, series }.'],
    ['spark:data (listen)', 'Dispatch with a new graph { nodes, links } as detail.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Team collaboration</h3>
  <div class="spark-viz-network" data-spark-label data-spark-height="360" data-spark-data='{"nodes":[{"id":"Ana","group":"Design","size":3},{"id":"Ben","group":"Design"},{"id":"Cy","group":"Eng","size":4},{"id":"Dee","group":"Eng"},{"id":"Eli","group":"Eng"},{"id":"Fay","group":"Ops","size":2},{"id":"Gus","group":"Ops"},{"id":"Hal","group":"Data"},{"id":"Ivy","group":"Data"}],"links":[{"source":"Ana","target":"Ben","value":4},{"source":"Ana","target":"Cy","value":2},{"source":"Cy","target":"Dee","value":5},{"source":"Cy","target":"Eli","value":3},{"source":"Dee","target":"Eli"},{"source":"Cy","target":"Fay"},{"source":"Fay","target":"Gus","value":3},{"source":"Fay","target":"Hal"},{"source":"Hal","target":"Ivy","value":4},{"source":"Ivy","target":"Cy"},{"source":"Ben","target":"Ivy"}]}'></div>
</div>` },
    { html: `<div class="card p-8 spark-viz-network" data-spark-background data-spark-height="0" style="min-height:180px" data-spark-data='{"nodes":[{"id":1,"group":"a"},{"id":2,"group":"a"},{"id":3,"group":"b"},{"id":4,"group":"b"},{"id":5,"group":"c"},{"id":6,"group":"c"}],"links":[{"source":1,"target":2},{"source":2,"target":3},{"source":3,"target":4},{"source":4,"target":5},{"source":5,"target":6},{"source":6,"target":1},{"source":1,"target":4}]}'>
  <h3 class="m-0">Everything is connected</h3><p class="m-0">A live graph drifting behind this card.</p>
</div>`, label: 'As a card background' },
  ],
};
