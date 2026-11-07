module.exports = {
  title: 'Fishbone diagram',
  group: 'Diagrams',
  dataFormat: `Cause-and-effect (Ishikawa). Either JSON in <code>data-efx-data</code> (or an inline <code>&lt;script type="application/json"&gt;</code>):
<code>{"problem":"Late deliveries","causes":[{"name":"People","items":["Training","Turnover"]},{"name":"Process","items":["Manual dispatch"]}]}</code>
or a nested list inside the element with the problem in <code>data-efx-problem</code>:
<code>&lt;ul&gt;&lt;li&gt;People&lt;ul&gt;&lt;li&gt;Training&lt;/li&gt;…&lt;/ul&gt;&lt;/li&gt;…&lt;/ul&gt;</code>. Update live with <code>efx:data</code> and the same object.`,
  summary: 'Ishikawa diagram: a spine ending in the problem, angled category bones alternating above and below, and cause labels along each bone. Hover or focus a bone to isolate it. Scales with the container width.',
  classes: [['efx-diagram-fishbone', 'Renders the diagram from JSON or a nested list.']],
  options: [
    ['data-efx-problem', '', 'Problem (head of the fish). Overrides the JSON value.'],
    ['data-efx-data', '', 'JSON {problem, causes:[{name, items[]}]}.'],
    ['data-efx-colors', 'Shine tones', 'Bone colors.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Bone palette.']],
  events: [
    ['efx:select', 'Bone clicked / Enter pressed. detail = { index, label, items, problem }.'],
    ['efx:data (listen)', 'Dispatch with detail { problem, causes } to update.'],
  ],
  examples: [
    { label: 'Nested list', html: `<div class="card p-4"><div class="efx-diagram-fishbone" data-efx-problem="Late deliveries"><ul>
  <li>People<ul><li>Short staffed</li><li>Training gaps</li><li>High turnover</li></ul></li>
  <li>Process<ul><li>Manual dispatch</li><li>No backup route</li><li>Late cutoffs</li></ul></li>
  <li>Vehicles<ul><li>Breakdowns</li><li>Fuel stops</li></ul></li>
  <li>Customers<ul><li>Wrong address</li><li>Not home</li><li>Changed slot</li></ul></li>
  <li>Weather<ul><li>Snow</li><li>Floods</li></ul></li>
  <li>Systems<ul><li>Stale ETAs</li><li>Scanner outages</li><li>Slow routing</li></ul></li>
</ul></div></div>` },
    { label: 'JSON', html: `<div class="card p-4"><div class="efx-diagram-fishbone" data-efx-data='{"problem":"Checkout drop-off","causes":[{"name":"UX","items":["Long form","Hidden fees"]},{"name":"Trust","items":["No reviews","Odd domain"]},{"name":"Speed","items":["Slow payment","Big images"]},{"name":"Payment","items":["Few methods","3DS failures"]}]}'></div></div>` },
  ],
};
