module.exports = {
  title: 'Tree diagram',
  group: 'Diagrams',
  dataFormat: `A plain nested list. The node is the first element (or text) of each <code>&lt;li&gt;</code>; a nested <code>&lt;ul&gt;</code> holds its children.
<code>&lt;ul class="efx-diagram-tree"&gt;&lt;li data-efx-tone="primary"&gt;&lt;span&gt;CEO&lt;/span&gt;&lt;ul&gt;&lt;li&gt;CTO&lt;/li&gt;&lt;li&gt;CFO&lt;/li&gt;&lt;/ul&gt;&lt;/li&gt;&lt;/ul&gt;</code>
Per-node: <code>data-efx-tone="success"</code> (any Shine tone or CSS colour), <code>data-efx-collapsed</code> to start folded. Links, headings and other markup inside a node are kept. Without JS it stays a readable nested list.`,
  summary: 'Turns a nested list into an org chart, tree or mind map. JS lays the nodes out and draws curved or elbow connectors; the list stays real, accessible HTML (role=tree). Click, Enter or Space folds a branch (animated); arrow keys move between nodes.',
  classes: [['efx-diagram-tree', 'On a <ul>: lay the list out as a diagram.']],
  options: [
    ['data-efx-direction', 'down', '"down" (org chart) or "right" (horizontal tree).'],
    ['data-efx-layout', 'tree', '"mindmap" centres the root and splits its children left/right.'],
    ['data-efx-links', 'elbow', '"elbow", "curve" or "straight" connectors.'],
    ['data-efx-collapsible', 'true', 'Branches fold on click / Enter / Space.'],
    ['data-efx-collapse', '0', 'Start folded from this depth (1 = fold every branch below the root\'s children). 0 = all open.'],
    ['data-efx-gap', '16', 'Gap between siblings in px.'],
    ['data-efx-level-gap', '44', 'Gap between levels in px.'],
    ['data-efx-tone', '', 'Default tone for every node (a Shine tone name).'],
    ['data-efx-animate', 'true', 'Entrance + fold animation (off for reduced motion).'],
    ['data-efx-title', '', 'Accessible name (or aria-label on the list).'],
  ],
  vars: [
    ['--efx-tree-line', 'muted', 'Connector colour.'],
    ['--efx-tone', 'per node', 'Node accent + connector colour; set by data-efx-tone.'],
  ],
  events: [
    ['efx:select', 'Node clicked / Enter. detail = { label, depth }.'],
    ['efx:toggle', 'Branch folded or unfolded. detail = { label, expanded }.'],
  ],
  examples: [
    { html: `<div class="card p-6"><ul class="efx-diagram-tree" aria-label="Organisation">
  <li data-efx-tone="primary"><span>CEO</span><ul>
    <li data-efx-tone="info"><span>CTO</span><ul><li>Platform</li><li>Mobile</li><li>Data</li></ul></li>
    <li data-efx-tone="success"><span>CFO</span><ul><li>Finance</li><li>Legal</li></ul></li>
    <li data-efx-tone="warning"><span>COO</span><ul><li>Support</li><li>Ops</li></ul></li>
  </ul></li></ul></div>`, label: 'Org chart (click a node to fold)' },
    { html: `<div class="card p-6"><ul class="efx-diagram-tree" data-efx-layout="mindmap" data-efx-links="curve" aria-label="Launch plan">
  <li data-efx-tone="primary"><span>Launch</span><ul>
    <li data-efx-tone="info"><span>Marketing</span><ul><li>Blog</li><li>Social</li></ul></li>
    <li data-efx-tone="success"><span>Product</span><ul><li>Beta</li><li>Docs</li></ul></li>
    <li data-efx-tone="warning"><span>Sales</span><ul><li>Pricing</li><li>Demos</li></ul></li>
    <li data-efx-tone="danger"><span>Risks</span><ul><li>Load</li><li>Legal</li></ul></li>
  </ul></li></ul></div>`, label: 'Mind map' },
    { html: `<div class="card p-6"><ul class="efx-diagram-tree" data-efx-direction="right" data-efx-collapse="1" aria-label="Files">
  <li data-efx-tone="secondary"><span>src</span><ul>
    <li><span>charts</span><ul><li>_lib.js</li><li>chart-bar.js</li></ul></li>
    <li><span>features</span><ul><li>reveal.js</li><li>tilt.js</li></ul></li>
    <li>core.js</li>
  </ul></li></ul></div>`, label: 'Horizontal, folded' },
  ],
};
