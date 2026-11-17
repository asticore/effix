module.exports = {
  title: 'Flow diagram',
  group: 'Diagrams',
  dataFormat: `Nodes are ordinary HTML children with an <code>id</code>; connections go in <code>data-spark-edges</code>, separated by <code>|</code>:
<code>data-spark-edges="start&gt;check|check&gt;ok:Yes|check&gt;fix:No|fix~&gt;check"</code>
Edge styles: <code>a&gt;b</code> solid arrow, <code>a~&gt;b</code> dashed, <code>a=&gt;b</code> thick, <code>a&lt;&gt;b</code> both ways. Text after <code>:</code> is the label.
ER cardinality: a label such as <code>1..n</code>, <code>1..0n</code>, <code>01..n</code> (1, n, 0n = zero-or-many, 01 = zero-or-one) draws crow's-foot markers instead of text.
Shapes via <code>data-spark-shape</code>: box (default), pill, diamond, circle, db, doc, dot, end, table. Tone via <code>data-spark-tone</code> (primary, accent, success, warning, danger, info, secondary, or 1–7).
Placement: <code>data-spark-cell="col,row[,colspan,rowspan]"</code>, or <code>data-spark-layout="auto"</code>, or swimlanes (<code>data-spark-lanes</code> + <code>data-spark-lane</code>).`,
  summary: 'One engine for flowcharts, process maps, swimlanes, architecture and data-flow diagrams, state machines and ER/UML cards. Your nodes stay real HTML; orthogonal connectors are drawn behind them and redraw on resize. Hover or focus a node to light up its connections.',
  classes: [
    ['spark-diagram-flow', 'The diagram container. Children with ids are nodes.'],
    ['data-spark-group="Name"', 'On a wrapper element: labelled dashed boundary around the nodes inside (zones, deployment boxes). Add data-spark-cols to lay it out as a grid.'],
  ],
  options: [
    ['data-spark-edges', '', 'Connections: "a>b|b>c:label|c~>a". Operators > ~> => <>.'],
    ['data-spark-layout', '', '"auto" = layered layout (longest-path ranks, barycenter ordering) for the container’s direct children. Empty = place with data-spark-cell or let it flow.'],
    ['data-spark-direction', 'TB', 'Auto layout direction: TB (top to bottom) or LR.'],
    ['data-spark-cols', '0', 'Grid columns when using data-spark-cell (inferred from the cells if 0). Also valid on a group.'],
    ['data-spark-lanes', '', 'Swimlane names "Customer|Support|Billing". Nodes pick a lane with data-spark-lane="Support"; column comes from the flow rank or data-spark-cell.'],
    ['data-spark-route', 'orth', '"orth" elbow connectors, "curve" or "straight".'],
    ['data-spark-flow', 'false', 'Animated dots travelling along each connector (off for reduced motion).'],
    ['data-spark-colors', 'Shine tones', 'Palette for numeric tones (data-spark-tone="3").'],
    ['data-spark-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--spark-diagram-gap', '3rem 3.5rem', 'Gap between nodes.'],
    ['--spark-lane-h', '5.5rem', 'Minimum swimlane height.'],
    ['--spark-edge', 'text-muted', 'Default connector color (a node tone colors its outgoing edges).'],
    ['--spark-n', 'per tone', 'Node accent color; set it on a node to override.'],
  ],
  events: [['spark:select', 'Node clicked / Enter or Space pressed. detail = { id, label, index }.']],
  examples: [
    { label: 'Flowchart with a decision', html: `<div class="card p-4"><div class="spark-diagram-flow" data-spark-layout="auto" data-spark-edges="start>in|in>check|check>ok:Yes|check>fix:No|fix>in:retry|ok>done">
  <div id="start" data-spark-shape="pill" data-spark-tone="success">Start</div>
  <div id="in">Receive order</div>
  <div id="check" data-spark-shape="diamond">In stock?</div>
  <div id="ok">Ship order</div>
  <div id="fix" data-spark-tone="warning">Backorder</div>
  <div id="done" data-spark-shape="pill" data-spark-tone="primary">Done</div>
</div></div>` },
    { label: 'Architecture with groups', html: `<div class="card p-4"><div class="spark-diagram-flow" data-spark-flow data-spark-edges="web>cdn|cdn>api:HTTPS|api>db|api~>cache|api=>worker|worker>db">
  <div id="web" data-spark-cell="1,1" data-spark-tone="info" data-spark-shape="pill">Browser</div>
  <div id="cdn" data-spark-cell="2,1" data-spark-shape="circle">CDN</div>
  <div data-spark-group="Backend" data-spark-cols="1" data-spark-cell="3,1" data-spark-tone="primary">
    <div id="api" data-spark-tone="primary">API</div>
    <div id="worker">Worker</div>
  </div>
  <div data-spark-group="Data" data-spark-cols="1" data-spark-cell="4,1" data-spark-tone="success">
    <div id="db" data-spark-shape="db" data-spark-tone="success">Postgres</div>
    <div id="cache" data-spark-shape="db">Redis</div>
  </div>
</div></div>` },
    { label: 'Swimlane process', html: `<div class="card p-4"><div class="spark-diagram-flow" data-spark-lanes="Customer|Support|Billing" data-spark-edges="c1>s1|s1>s2|s2>b1:Yes|s2>c2:No|b1>c2">
  <div id="c1" data-spark-lane="Customer" data-spark-shape="pill" data-spark-tone="success">Request</div>
  <div id="s1" data-spark-lane="Support">Triage</div>
  <div id="s2" data-spark-lane="Support" data-spark-shape="diamond">Refund?</div>
  <div id="b1" data-spark-lane="Billing" data-spark-tone="accent">Issue refund</div>
  <div id="c2" data-spark-lane="Customer" data-spark-shape="pill" data-spark-tone="primary">Notified</div>
</div></div>` },
    { label: 'State machine', html: `<div class="card p-4"><div class="spark-diagram-flow" data-spark-layout="auto" data-spark-direction="LR" data-spark-edges="s0>idle|idle>running:start|running<>paused:pause / resume|running>done:finish|running>failed:error|failed>idle:reset">
  <div id="s0" data-spark-shape="dot" aria-label="Initial"></div>
  <div id="idle" data-spark-shape="pill">Idle</div>
  <div id="running" data-spark-shape="pill" data-spark-tone="primary">Running</div>
  <div id="paused" data-spark-shape="pill" data-spark-tone="warning">Paused</div>
  <div id="done" data-spark-shape="pill" data-spark-tone="success">Done</div>
  <div id="failed" data-spark-shape="pill" data-spark-tone="danger">Failed</div>
</div></div>` },
    { label: 'ER diagram with field cards', html: `<div class="card p-4"><div class="spark-diagram-flow" data-spark-edges="users>orders:1..0n|orders>items:1..n|products>items:1..0n">
  <div id="users" data-spark-cell="1,1" data-spark-shape="table" data-spark-tone="primary"><b>users</b><span>id <i>PK</i></span><span>email</span><span>name</span></div>
  <div id="orders" data-spark-cell="2,1" data-spark-shape="table" data-spark-tone="accent"><b>orders</b><span>id <i>PK</i></span><span>user_id <i>FK</i></span><span>placed_at</span></div>
  <div id="items" data-spark-cell="3,1" data-spark-shape="table" data-spark-tone="success"><b>order_items</b><span>order_id <i>FK</i></span><span>product_id <i>FK</i></span><span>qty</span></div>
  <div id="products" data-spark-cell="3,2" data-spark-shape="table" data-spark-tone="info"><b>products</b><span>id <i>PK</i></span><span>sku</span><span>price</span></div>
</div></div>` },
  ],
};
