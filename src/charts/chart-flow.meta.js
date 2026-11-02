module.exports = {
  title: 'Flow chart',
  group: 'Charts',
  summary: 'Lightweight Sankey-style flow for funnels and user journeys. Hover a ribbon to see <em>A → B: value (x% of A)</em> and light up the two nodes it joins; hover a node to light up its links.',
  classes: [['efx-chart-flow', 'Renders a flow diagram from { nodes, links } JSON.']],
  options: [
    ['data-efx-data', '', 'JSON {"nodes":[{"name":"Visit"},…],"links":[{"source":0,"target":1,"value":120}]}. source/target may be indexes or node names. Or put the JSON in an inline <script type="application/json">.'],
    ['data-efx-node-width', '12', 'Node bar width in px.'],
    ['data-efx-node-pad', '12', 'Vertical gap between nodes in a column.'],
    ['data-efx-align', 'justify', '"justify" pushes end nodes to the last column, "left" keeps them where they are.'],
    ['data-efx-colors', 'Shine tones', 'Node colors (ribbons take their source node color).'],
    ['data-efx-height', '260', 'Chart height in px.'],
    ['data-efx-prefix / suffix / compact / decimals', '', 'Value formatting.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no labels).'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--efx-chart-1 … 7', 'Shine tones', 'Palette.'],
    ['--efx-chart-bg-opacity', '.35', 'Opacity in background mode.'],
  ],
  events: [
    ['efx:select', 'Link or node clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch with detail { nodes, links } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Signup funnel</h3>
  <div class="efx-chart-flow" data-efx-height="300" data-efx-data='{"nodes":[{"name":"Visits"},{"name":"Pricing"},{"name":"Docs"},{"name":"Signup"},{"name":"Paid"},{"name":"Churned"}],"links":[{"source":"Visits","target":"Pricing","value":520},{"source":"Visits","target":"Docs","value":300},{"source":"Pricing","target":"Signup","value":210},{"source":"Docs","target":"Signup","value":90},{"source":"Signup","target":"Paid","value":120},{"source":"Signup","target":"Churned","value":180}]}'></div>
</div>` },
    { html: `<div class="card p-6 efx-chart-flow" data-efx-background data-efx-height="0" style="min-height:160px" data-efx-data='{"nodes":[{"name":"a"},{"name":"b"},{"name":"c"},{"name":"d"}],"links":[{"source":0,"target":1,"value":8},{"source":0,"target":2,"value":5},{"source":1,"target":3,"value":6},{"source":2,"target":3,"value":4}]}'><h4 class="m-0">Journey</h4><p class="m-0">A flow as a card background.</p></div>`, label: 'Flow as a card background' },
  ],
};
