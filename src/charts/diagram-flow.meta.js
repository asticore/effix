module.exports = {
  title: 'Flow diagram',
  group: 'Diagrams',
  dataFormat: `Nodes are ordinary HTML children with an <code>id</code>; connections go in <code>data-efx-edges</code>, separated by <code>|</code>:
<code>data-efx-edges="start&gt;check|check&gt;ok:Yes|check&gt;fix:No|fix~&gt;check"</code>
Edge styles: <code>a&gt;b</code> solid arrow, <code>a~&gt;b</code> dashed, <code>a=&gt;b</code> thick, <code>a&lt;&gt;b</code> both ways. Text after <code>:</code> is the label.
ER cardinality: a label such as <code>1..n</code>, <code>1..0n</code>, <code>01..n</code> (1, n, 0n = zero-or-many, 01 = zero-or-one) draws crow's-foot markers instead of text.
Shapes via <code>data-efx-shape</code>: box (default), pill, diamond, circle, db, doc, dot, end, table. Tone via <code>data-efx-tone</code> (primary, accent, success, warning, danger, info, secondary, or 1–7).
Placement: <code>data-efx-cell="col,row[,colspan,rowspan]"</code>, or <code>data-efx-layout="auto"</code>, or swimlanes (<code>data-efx-lanes</code> + <code>data-efx-lane</code>).`,
  summary: 'One engine for flowcharts, process maps, swimlanes, architecture and data-flow diagrams, state machines and ER/UML cards. Your nodes stay real HTML; orthogonal connectors are drawn behind them and redraw on resize. Hover or focus a node to light up its connections.',
  classes: [
    ['efx-diagram-flow', 'The diagram container. Children with ids are nodes.'],
    ['data-efx-group="Name"', 'On a wrapper element: labelled dashed boundary around the nodes inside (zones, deployment boxes). Add data-efx-cols to lay it out as a grid.'],
  ],
  options: [
    ['data-efx-edges', '', 'Connections: "a>b|b>c:label|c~>a". Operators > ~> => <>.'],
    ['data-efx-layout', '', '"auto" = layered layout (longest-path ranks, barycenter ordering) for the container’s direct children. Empty = place with data-efx-cell or let it flow.'],
    ['data-efx-direction', 'TB', 'Auto layout direction: TB (top to bottom) or LR.'],
    ['data-efx-cols', '0', 'Grid columns when using data-efx-cell (inferred from the cells if 0). Also valid on a group.'],
    ['data-efx-lanes', '', 'Swimlane names "Customer|Support|Billing". Nodes pick a lane with data-efx-lane="Support"; column comes from the flow rank or data-efx-cell.'],
    ['data-efx-route', 'orth', '"orth" elbow connectors, "curve" or "straight".'],
    ['data-efx-flow', 'false', 'Animated dots travelling along each connector (off for reduced motion).'],
    ['data-efx-colors', 'Shine tones', 'Palette for numeric tones (data-efx-tone="3").'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--efx-diagram-gap', '3rem 3.5rem', 'Gap between nodes.'],
    ['--efx-lane-h', '5.5rem', 'Minimum swimlane height.'],
    ['--efx-edge', 'text-muted', 'Default connector color (a node tone colors its outgoing edges).'],
    ['--efx-n', 'per tone', 'Node accent color; set it on a node to override.'],
  ],
  events: [['efx:select', 'Node clicked / Enter or Space pressed. detail = { id, label, index }.']],
  examples: [
    { label: 'Flowchart with a decision', html: `<div class="card p-4"><div class="efx-diagram-flow" data-efx-layout="auto" data-efx-edges="start>in|in>check|check>ok:Yes|check>fix:No|fix>in:retry|ok>done">
  <div id="start" data-efx-shape="pill" data-efx-tone="success">Start</div>
  <div id="in">Receive order</div>
  <div id="check" data-efx-shape="diamond">In stock?</div>
  <div id="ok">Ship order</div>
  <div id="fix" data-efx-tone="warning">Backorder</div>
  <div id="done" data-efx-shape="pill" data-efx-tone="primary">Done</div>
</div></div>` },
    { label: 'Architecture with groups', html: `<div class="card p-4"><div class="efx-diagram-flow" data-efx-flow data-efx-edges="web>cdn|cdn>api:HTTPS|api>db|api~>cache|api=>worker|worker>db">
  <div id="web" data-efx-cell="1,1" data-efx-tone="info" data-efx-shape="pill">Browser</div>
  <div id="cdn" data-efx-cell="2,1" data-efx-shape="circle">CDN</div>
  <div data-efx-group="Backend" data-efx-cols="1" data-efx-cell="3,1" data-efx-tone="primary">
    <div id="api" data-efx-tone="primary">API</div>
    <div id="worker">Worker</div>
  </div>
  <div data-efx-group="Data" data-efx-cols="1" data-efx-cell="4,1" data-efx-tone="success">
    <div id="db" data-efx-shape="db" data-efx-tone="success">Postgres</div>
    <div id="cache" data-efx-shape="db">Redis</div>
  </div>
</div></div>` },
    { label: 'Swimlane process', html: `<div class="card p-4"><div class="efx-diagram-flow" data-efx-lanes="Customer|Support|Billing" data-efx-edges="c1>s1|s1>s2|s2>b1:Yes|s2>c2:No|b1>c2">
  <div id="c1" data-efx-lane="Customer" data-efx-shape="pill" data-efx-tone="success">Request</div>
  <div id="s1" data-efx-lane="Support">Triage</div>
  <div id="s2" data-efx-lane="Support" data-efx-shape="diamond">Refund?</div>
  <div id="b1" data-efx-lane="Billing" data-efx-tone="accent">Issue refund</div>
  <div id="c2" data-efx-lane="Customer" data-efx-shape="pill" data-efx-tone="primary">Notified</div>
</div></div>` },
    { label: 'State machine', html: `<div class="card p-4"><div class="efx-diagram-flow" data-efx-layout="auto" data-efx-direction="LR" data-efx-edges="s0>idle|idle>running:start|running<>paused:pause / resume|running>done:finish|running>failed:error|failed>idle:reset">
  <div id="s0" data-efx-shape="dot" aria-label="Initial"></div>
  <div id="idle" data-efx-shape="pill">Idle</div>
  <div id="running" data-efx-shape="pill" data-efx-tone="primary">Running</div>
  <div id="paused" data-efx-shape="pill" data-efx-tone="warning">Paused</div>
  <div id="done" data-efx-shape="pill" data-efx-tone="success">Done</div>
  <div id="failed" data-efx-shape="pill" data-efx-tone="danger">Failed</div>
</div></div>` },
    { label: 'ER diagram with field cards', html: `<div class="card p-4"><div class="efx-diagram-flow" data-efx-edges="users>orders:1..0n|orders>items:1..n|products>items:1..0n">
  <div id="users" data-efx-cell="1,1" data-efx-shape="table" data-efx-tone="primary"><b>users</b><span>id <i>PK</i></span><span>email</span><span>name</span></div>
  <div id="orders" data-efx-cell="2,1" data-efx-shape="table" data-efx-tone="accent"><b>orders</b><span>id <i>PK</i></span><span>user_id <i>FK</i></span><span>placed_at</span></div>
  <div id="items" data-efx-cell="3,1" data-efx-shape="table" data-efx-tone="success"><b>order_items</b><span>order_id <i>FK</i></span><span>product_id <i>FK</i></span><span>qty</span></div>
  <div id="products" data-efx-cell="3,2" data-efx-shape="table" data-efx-tone="info"><b>products</b><span>id <i>PK</i></span><span>sku</span><span>price</span></div>
</div></div>` },
  ],
};
