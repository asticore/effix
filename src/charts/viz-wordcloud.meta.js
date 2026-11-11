module.exports = {
  title: 'Word cloud',
  group: 'Visualisations',
  dataFormat: `Weighted words, or raw text to count.
<code>data-efx-data="design:40|code:28|motion:19"</code> ("word:weight" split by <code>|</code>)
JSON: <code>[{"text":"design","value":40},{"text":"code","value":28}]</code> (also <code>word</code>/<code>weight</code>/<code>count</code>)
Raw text: <code>data-efx-text="long text…"</code> counts words (lower-cased, ~60 English stop words and 1-letter words dropped).
Also an inline <code>&lt;script type="application/json"&gt;</code>, or live: <code>efx:data</code> with detail <code>{words:[…]}</code> or <code>{text:"…"}</code>.`,
  summary: 'Words sized by weight (square-root scale) and packed along an Archimedean spiral without overlap. Optional 90° or custom rotation, hover for the count, click fires <code>efx:select</code>. Text is inserted as text, never HTML.',
  classes: [['efx-viz-wordcloud', 'Renders a word cloud from weighted words or raw text.']],
  options: [
    ['data-efx-data', '', '"word:weight|word:weight" or JSON [{text,value}].'],
    ['data-efx-text', '', 'Raw text; words are counted, stop words removed.'],
    ['data-efx-min-size / max-size', '12 / 56', 'Font size range in px.'],
    ['data-efx-rotate', '0', 'Angles to pick from, e.g. "0|90" or "0|-30|30". The biggest word stays at the first angle.'],
    ['data-efx-max', '80', 'Maximum words shown.'],
    ['data-efx-padding', '2', 'Gap between words in px.'],
    ['data-efx-height', 'auto', 'Chart height in px (default half the width, min 200).'],
    ['data-efx-colors', 'Shine tones', 'Palette "#f43f5e|#8b5cf6", cycled by rank.'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Palette.']],
  events: [
    ['efx:select', 'Word clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch with detail { words:[{text,value}] } or { text } to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">What people talk about</h3>
  <div class="efx-viz-wordcloud" data-efx-rotate="0|90" data-efx-data="[{&quot;text&quot;:&quot;design&quot;,&quot;value&quot;:46},{&quot;text&quot;:&quot;motion&quot;,&quot;value&quot;:38},{&quot;text&quot;:&quot;speed&quot;,&quot;value&quot;:31},{&quot;text&quot;:&quot;tiny&quot;,&quot;value&quot;:27},{&quot;text&quot;:&quot;charts&quot;,&quot;value&quot;:24},{&quot;text&quot;:&quot;accessible&quot;,&quot;value&quot;:20},{&quot;text&quot;:&quot;keyboard&quot;,&quot;value&quot;:17},{&quot;text&quot;:&quot;theme&quot;,&quot;value&quot;:15},{&quot;text&quot;:&quot;css&quot;,&quot;value&quot;:14},{&quot;text&quot;:&quot;shine&quot;,&quot;value&quot;:13},{&quot;text&quot;:&quot;svg&quot;,&quot;value&quot;:11},{&quot;text&quot;:&quot;zero-dependency&quot;,&quot;value&quot;:9},{&quot;text&quot;:&quot;tooltip&quot;,&quot;value&quot;:8},{&quot;text&quot;:&quot;legend&quot;,&quot;value&quot;:7},{&quot;text&quot;:&quot;dark&quot;,&quot;value&quot;:7},{&quot;text&quot;:&quot;resize&quot;,&quot;value&quot;:6},{&quot;text&quot;:&quot;lazy&quot;,&quot;value&quot;:5}]"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-viz-wordcloud" data-efx-height="220" data-efx-max-size="40" data-efx-text="Effix adds motion and charts to Shine. Charts are tiny, charts are accessible, and effects respect reduced motion. Small effects, small charts, small bundle. Motion should help people, not distract people."></div></div>
  <div class="card p-6 efx-viz-wordcloud" style="min-height:160px" data-efx-background data-efx-data="launch:9|ship:7|fast:6|calm:5|bold:4|clean:3|new:3|soft:2"><strong>Release notes</strong></div>
</div>`, label: 'Raw text counted for you, and a cloud behind a card' },
  ],
};
