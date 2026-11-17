module.exports = {
  title: 'Tree diagram',
  group: 'Diagrams',
  dataFormat: `A plain nested list. The node is the first element (or text) of each <code>&lt;li&gt;</code>; a nested <code>&lt;ul&gt;</code> holds its children.
<code>&lt;ul class="spark-diagram-tree"&gt;&lt;li data-spark-tone="primary"&gt;&lt;span&gt;CEO&lt;/span&gt;&lt;ul&gt;&lt;li&gt;CTO&lt;/li&gt;&lt;li&gt;CFO&lt;/li&gt;&lt;/ul&gt;&lt;/li&gt;&lt;/ul&gt;</code>
Per-node: <code>data-spark-tone="success"</code> (any Shine tone or CSS colour), <code>data-spark-collapsed</code> to start folded. Links, headings and other markup inside a node are kept. Without JS it stays a readable nested list.`,
  summary: 'Turns a nested list into an org chart, tree or mind map. JS lays the nodes out and draws curved or elbow connectors; the list stays real, accessible HTML (role=tree). Click, Enter or Space folds a branch (animated); arrow keys move between nodes.',
  classes: [['spark-diagram-tree', 'On a <ul>: lay the list out as a diagram.']],
  options: [
    ['data-spark-direction', 'down', '"down" (org chart) or "right" (horizontal tree).'],
    ['data-spark-layout', 'tree', '"mindmap" centres the root and splits its children left/right.'],
    ['data-spark-links', 'elbow', '"elbow", "curve" or "straight" connectors.'],
    ['data-spark-collapsible', 'true', 'Branches fold on click / Enter / Space.'],
    ['data-spark-collapse', '0', 'Start folded from this depth (1 = fold every branch below the root\'s children). 0 = all open.'],
    ['data-spark-gap', '16', 'Gap between siblings in px.'],
    ['data-spark-level-gap', '44', 'Gap between levels in px.'],
    ['data-spark-tone', '', 'Default tone for every node (a Shine tone name).'],
    ['data-spark-animate', 'true', 'Entrance + fold animation (off for reduced motion).'],
    ['data-spark-title', '', 'Accessible name (or aria-label on the list).'],
  ],
  vars: [
    ['--spark-tree-line', 'muted', 'Connector colour.'],
    ['--spark-tone', 'per node', 'Node accent + connector colour; set by data-spark-tone.'],
  ],
  events: [
    ['spark:select', 'Node clicked / Enter. detail = { label, depth }.'],
    ['spark:toggle', 'Branch folded or unfolded. detail = { label, expanded }.'],
  ],
  examples: [
    { html: `<div class="card p-6"><ul class="spark-diagram-tree" aria-label="Organisation">
  <li data-spark-tone="primary"><span>CEO</span><ul>
    <li data-spark-tone="info"><span>CTO</span><ul><li>Platform</li><li>Mobile</li><li>Data</li></ul></li>
    <li data-spark-tone="success"><span>CFO</span><ul><li>Finance</li><li>Legal</li></ul></li>
    <li data-spark-tone="warning"><span>COO</span><ul><li>Support</li><li>Ops</li></ul></li>
  </ul></li></ul></div>`, label: 'Org chart (click a node to fold)' },
    { html: `<div class="card p-6"><ul class="spark-diagram-tree" data-spark-layout="mindmap" data-spark-links="curve" aria-label="Launch plan">
  <li data-spark-tone="primary"><span>Launch</span><ul>
    <li data-spark-tone="info"><span>Marketing</span><ul><li>Blog</li><li>Social</li></ul></li>
    <li data-spark-tone="success"><span>Product</span><ul><li>Beta</li><li>Docs</li></ul></li>
    <li data-spark-tone="warning"><span>Sales</span><ul><li>Pricing</li><li>Demos</li></ul></li>
    <li data-spark-tone="danger"><span>Risks</span><ul><li>Load</li><li>Legal</li></ul></li>
  </ul></li></ul></div>`, label: 'Mind map' },
    { html: `<div class="card p-6"><ul class="spark-diagram-tree" data-spark-direction="right" data-spark-collapse="1" aria-label="Files">
  <li data-spark-tone="secondary"><span>src</span><ul>
    <li><span>charts</span><ul><li>_lib.js</li><li>chart-bar.js</li></ul></li>
    <li><span>features</span><ul><li>reveal.js</li><li>tilt.js</li></ul></li>
    <li>core.js</li>
  </ul></li></ul></div>`, label: 'Horizontal, folded' },
  ],
};
