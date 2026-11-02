module.exports = {
  title: 'Candlestick chart',
  group: 'Charts',
  dataFormat: `One row per period with open, high, low, close and optional volume.
<code>data-efx-data='[{"label":"Mon","o":10,"h":14,"l":9,"c":13,"v":900},{"label":"Tue","o":13,"h":15,"l":11,"c":12,"v":700}]'</code>
Or series arrays in the order (or named) open, high, low, close, volume, with labels from <code>data-efx-labels</code>:
<code>[{"name":"open","data":[10,13]},{"name":"high","data":[14,15]},{"name":"low","data":[9,11]},{"name":"close","data":[13,12]},{"name":"volume","data":[900,700]}]</code>
Rows where close &ge; open are drawn green, others red. <code>data-efx-volume</code> adds volume bars. A table via <code>data-efx-source</code> (columns Open, High, Low, Close, Volume) also works.`,
  summary: 'Candlestick or OHLC bars with an optional volume strip. A crosshair tooltip shows open, high, low, close and the period change; many points automatically give thin candles and fewer axis labels.',
  classes: [['efx-chart-candle', 'Renders OHLC data as candles or OHLC bars.']],
  options: [
    ['data-efx-data', '', 'JSON [{label,o,h,l,c,v?}] or OHLC(V) series arrays.'],
    ['data-efx-labels', '', 'Period labels (series form): "Mon|Tue|Wed".'],
    ['data-efx-style', 'candle', '<code>candle</code> (body + wick) or <code>ohlc</code> (open/close ticks).'],
    ['data-efx-volume', 'false', 'Volume bars in the bottom 20% of the plot.'],
    ['data-efx-colors', 'success / danger', 'Override as "up|down".'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$".'],
    ['data-efx-compact / decimals / format', '', 'Number formatting.'],
    ['data-efx-height', '260', 'Chart height in px.'],
    ['data-efx-tooltip / animate / grid', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [
    ['--sh-success / --sh-danger', 'Shine tones', 'Up and down colors.'],
    ['--efx-chart-grid / --efx-chart-text', '', 'Gridlines and axis text.'],
  ],
  events: [
    ['efx:select', 'Candle clicked / Enter pressed. detail = { index, label, value (close) }.'],
    ['efx:data (listen)', 'Dispatch with detail as the rows array, {rows:[…]}, or { labels, series }.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">ACME share price</h3>
  <div class="efx-chart-candle" data-efx-prefix="$" data-efx-volume data-efx-compact data-efx-data='[
    {"label":"Mon","o":102,"h":108,"l":100,"c":107,"v":12000},{"label":"Tue","o":107,"h":111,"l":104,"c":105,"v":9800},
    {"label":"Wed","o":105,"h":106,"l":98,"c":99,"v":15400},{"label":"Thu","o":99,"h":104,"l":97,"c":103,"v":11200},
    {"label":"Fri","o":103,"h":110,"l":102,"c":109,"v":13900},{"label":"Mon","o":109,"h":113,"l":107,"c":112,"v":10800},
    {"label":"Tue","o":112,"h":114,"l":106,"c":108,"v":14100},{"label":"Wed","o":108,"h":109,"l":103,"c":104,"v":9200}]'></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-candle" data-efx-style="ohlc" data-efx-height="200" data-efx-labels="A|B|C|D|E|F"
    data-efx-data='[{"name":"open","data":[10,12,11,14,13,15]},{"name":"high","data":[13,14,15,16,16,18]},{"name":"low","data":[9,10,10,12,12,14]},{"name":"close","data":[12,11,14,13,15,17]}]'></div></div>
  <div class="card p-6 efx-chart-candle" style="min-height:140px" data-efx-background data-efx-data='[{"o":5,"h":8,"l":4,"c":7},{"o":7,"h":9,"l":5,"c":6},{"o":6,"h":10,"l":6,"c":9},{"o":9,"h":11,"l":8,"c":8},{"o":8,"h":12,"l":7,"c":11}]'><strong>Market pulse</strong></div>
</div>`, label: 'OHLC style from series arrays, and candles behind a card' },
  ],
};
