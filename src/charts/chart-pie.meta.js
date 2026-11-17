module.exports = {
  title: 'Pie & donut chart',
  group: 'Charts',
  dataFormat: `One slice per label, from the <em>first</em> series only; zero and negative values are skipped.
<code>data-spark-data="40,30,20,10" data-spark-labels="A|B|C|D"</code>.
JSON: <code>[{"label":"Organic","value":4200},{"label":"Direct","value":2800}]</code> or <code>{"labels":["A","B"],"series":[{"values":[40,30]}]}</code>.
A table via <code>data-spark-source</code> (first column = slice names, second = values) also works.
Slice colors: <code>data-spark-colors="#f43f5e|#8b5cf6"</code> (one per slice).`,
  summary: 'Pie, donut or semicircle with outside labels and leader lines. Slices pull out on hover and the donut hole shows the hovered slice. Click a legend key to hide a slice.',
  classes: [['spark-chart-pie', 'Renders a pie/donut from data-spark-data (first series) and data-spark-labels.']],
  options: [
    ['data-spark-data', '', '"40,30,20,10" · JSON · or a table via data-spark-source.'],
    ['data-spark-labels', '', 'Slice names: "A|B|C|D".'],
    ['data-spark-donut', '0.6', 'Inner radius ratio (0 = full pie).'],
    ['data-spark-pad', '0.01', 'Gap between slices in radians.'],
    ['data-spark-sort', 'false', 'Largest slice first.'],
    ['data-spark-center', '', 'Text in the donut hole. <code>{total}</code> = formatted total. Empty shows the total with caption "Total".'],
    ['data-spark-show', 'auto', 'Labels: <code>auto</code> outside with leader lines when there is room · <code>percent</code> inside slices · <code>none</code>.'],
    ['data-spark-half', 'false', 'Semicircle.'],
    ['data-spark-rose', 'false', 'Polar-area (Nightingale) rose: equal angles, radius proportional to √value.'],
    ['data-spark-legend', 'true', 'Legend keys toggle slices.'],
    ['data-spark-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-spark-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6" (per stage / slice / series).'],
    ['data-spark-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-spark-compact', 'false', '12.3k style numbers.'],
    ['data-spark-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-spark-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-spark-background', 'false', 'Decorative: fills the element behind its content (no labels/tooltip).'],
    ['data-spark-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--spark-chart-1 … 7', 'Shine tones', 'Palette.']],
  events: [
    ['spark:select', 'Slice clicked / Enter pressed. detail = { index, label, value }.'],
    ['spark:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Traffic sources</h3>
  <div class="spark-chart-pie" data-spark-data="4200,2800,1900,900" data-spark-labels="Organic|Direct|Referral|Social" data-spark-center="{total} visits"></div>
</div>` },
    { html: `<div class="card p-6"><div class="spark-chart-pie" data-spark-rose data-spark-donut="0.15" data-spark-height="300" data-spark-data="90,64,48,35,22,12" data-spark-labels="Jan|Feb|Mar|Apr|May|Jun" data-spark-title="Monthly orders"></div></div>`, label: 'Rose (polar-area) variant' },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="spark-chart-pie" data-spark-donut="0" data-spark-show="percent" data-spark-sort data-spark-height="240" data-spark-data="45,25,18,12" data-spark-labels="Pro|Team|Free|Edu"></div></div>
  <div class="card p-6"><div class="spark-chart-pie" data-spark-half data-spark-donut="0.7" data-spark-show="none" data-spark-height="170" data-spark-data="62,23,15" data-spark-labels="Done|Doing|Todo" data-spark-center="62%"></div></div>
</div>`, label: 'Pie with inner percents, and a semicircle' },
  ],
};
