// A tiny made-up map (no network, no real borders): four regions around a centre.
const ring = (...p) => [p.concat([p[0]])];
const geo = { type: 'FeatureCollection', features: [
  { type: 'Feature', id: 'N', properties: { name: 'North' }, geometry: { type: 'Polygon', coordinates: ring([-9, 49], [-6, 52.5], [-1, 54], [4, 53], [9, 50.5], [4, 49.5], [-3, 50]) } },
  { type: 'Feature', id: 'E', properties: { name: 'East' }, geometry: { type: 'Polygon', coordinates: ring([4, 49.5], [9, 50.5], [12, 47], [11, 43], [7, 42], [5, 45.5]) } },
  { type: 'Feature', id: 'S', properties: { name: 'South' }, geometry: { type: 'Polygon', coordinates: ring([-8, 38], [-2, 36.5], [7, 38], [7, 42], [1, 43.5], [-6, 42]) } },
  { type: 'Feature', id: 'W', properties: { name: 'West' }, geometry: { type: 'Polygon', coordinates: ring([-9, 49], [-3, 50], [1, 46], [1, 43.5], [-6, 42], [-10, 44.5]) } },
  { type: 'Feature', id: 'C', properties: { name: 'Centre' }, geometry: { type: 'Polygon', coordinates: ring([-3, 50], [4, 49.5], [5, 45.5], [7, 42], [1, 43.5], [1, 46]) } },
] };
const attr = v => JSON.stringify(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const data = [{ id: 'N', value: 42 }, { id: 'E', value: 77 }, { id: 'S', value: 25 }, { id: 'W', value: 58 }, { id: 'C', value: 91 }];
const points = [{ lat: 51.5, lon: -2, value: 120, label: 'Harbour' }, { lat: 47, lon: 8, value: 60, label: 'Mill' }, { lat: 40, lon: 0, value: 85, label: 'Port' }, { lat: 45, lon: -5, value: 30, label: 'Farm' }];
const routes = [{ from: [51.5, -2], to: [40, 0] }, { from: [47, 8], to: [45, -5] }, { from: [51.5, -2], to: [47, 8] }];

module.exports = {
  title: 'Map',
  group: 'Visualisations',
  dataFormat: `<strong>No map data is bundled.</strong> Supply a GeoJSON FeatureCollection of Polygon / MultiPolygon features (e.g. from <a href="https://www.naturalearthdata.com/">Natural Earth</a>, simplified) as an inline <code>&lt;script type="application/json"&gt;</code>, <code>data-efx-geo='{…}'</code> or <code>data-efx-geo-url="/world.geojson"</code> (same origin or CORS). TopoJSON is not read.
Choropleth <code>data-efx-data='[{"id":"FR","value":12},{"name":"Spain","value":7}]'</code> matches <code>feature.id</code> or <code>properties.name</code> (case-insensitive); also <code>{"FR":12}</code>.
Bubbles <code>data-efx-points='[{"lat":48.8,"lon":2.3,"value":9,"label":"Paris"}]'</code> · routes <code>data-efx-routes='[{"from":[lat,lon],"to":[lat,lon]}]'</code> (arrays are [lat, lon]).
Live update: <code>efx:data</code> with detail <code>{geo, data, points, routes}</code> (any subset).`,
  summary: 'A dependency-free map for your own GeoJSON: choropleth regions with a one-colour ramp and legend, sized bubbles, animated route arcs, hover tooltips and optional wheel/drag zoom. Mercator, equirectangular or natural-earth projection, fitted to the bounds. The example uses a made-up map, so it works offline.',
  classes: [['efx-viz-map', 'Renders a GeoJSON map with optional choropleth, bubbles and routes.']],
  options: [
    ['data-efx-geo / data-efx-geo-url', '', 'GeoJSON inline, or a URL to fetch (also inline script JSON).'],
    ['data-efx-projection', 'mercator', '<code>mercator</code>, <code>equirectangular</code> or <code>natural</code> (natural earth).'],
    ['data-efx-data', '', 'Choropleth values [{id|name, value}] matched to feature.id / properties.name.'],
    ['data-efx-points', '', 'Bubbles [{lat, lon, value, label}], radius by sqrt(value).'],
    ['data-efx-routes', '', 'Curved animated arcs [{from:[lat,lon], to:[lat,lon]}].'],
    ['data-efx-steps', '6', 'Colour steps in the ramp.'],
    ['data-efx-zoom', 'false', 'Wheel to zoom, drag to pan, double-click to reset.'],
    ['data-efx-colors', 'Shine tones', 'First colour = choropleth ramp, second = bubbles and routes.'],
    ['data-efx-prefix / suffix / compact / decimals / format', '', 'Value formatting.'],
    ['data-efx-height', 'auto', 'px; default follows the map aspect ratio.'],
    ['data-efx-legend / tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Palette; ramps mix colour 1 with --sh-surface.']],
  events: [
    ['efx:select', 'Region or bubble clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'detail { geo, data, points, routes } replaces any of them.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Sales by region</h3>
  <div class="efx-viz-map" data-efx-zoom data-efx-geo="${attr(geo)}" data-efx-data="${attr(data)}" data-efx-points="${attr(points)}" data-efx-routes="${attr(routes)}" data-efx-suffix=" units" data-efx-title="Sales by region"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-viz-map" data-efx-projection="natural" data-efx-colors="#10b981|#f59e0b" data-efx-geo="${attr(geo)}" data-efx-points="${attr(points)}" data-efx-title="Sites"></div></div>
  <div class="card p-6 efx-viz-map" style="min-height:180px" data-efx-background data-efx-projection="equirectangular" data-efx-geo="${attr(geo)}" data-efx-data="${attr(data)}" data-efx-routes="${attr(routes)}"><strong>Coverage</strong><p class="m-0">Map as a card background</p></div>
</div>`, label: 'Natural projection with bubbles, and a map behind a card' },
  ],
};
