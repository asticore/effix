module.exports = {
  title: 'Pie & donut chart',
  group: 'Charts',
  summary: 'Pie, donut or semicircle with outside labels and leader lines. Slices pull out on hover and the donut hole shows the hovered slice. Click a legend key to hide a slice.',
  classes: [['efx-chart-pie', 'Renders a pie/donut from data-efx-data (first series) and data-efx-labels.']],
  options: [
    ['data-efx-data', '', '"40,30,20,10" · JSON · or a table via data-efx-source.'],
    ['data-efx-labels', '', 'Slice names: "A|B|C|D".'],
    ['data-efx-donut', '0.6', 'Inner radius ratio (0 = full pie).'],
    ['data-efx-pad', '0.01', 'Gap between slices in radians.'],
    ['data-efx-sort', 'false', 'Largest slice first.'],
    ['data-efx-center', '', 'Text in the donut hole. <code>{total}</code> = formatted total. Empty shows the total with caption "Total".'],
    ['data-efx-show', 'auto', 'Labels: <code>auto</code> outside with leader lines when there is room · <code>percent</code> inside slices · <code>none</code>.'],
    ['data-efx-half', 'false', 'Semicircle.'],
    ['data-efx-legend', 'true', 'Legend keys toggle slices.'],
    ['data-efx-height', '320', 'Chart height in px (0 = element CSS height).'],
    ['data-efx-colors', 'Shine tones', 'Colors "#f43f5e|#8b5cf6" (per stage / slice / series).'],
    ['data-efx-prefix / suffix', '', 'Value formatting, e.g. "$" or "%".'],
    ['data-efx-compact', 'false', '12.3k style numbers.'],
    ['data-efx-decimals', '-1', 'Fixed decimals (-1 = auto).'],
    ['data-efx-tooltip / animate', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: fills the element behind its content (no labels/tooltip).'],
    ['data-efx-title', '', 'Accessible name (else aria-label or first heading).'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Palette.']],
  events: [
    ['efx:select', 'Slice clicked / Enter pressed. detail = { index, label, value }.'],
    ['efx:data (listen)', 'Dispatch on the chart with detail { labels, series } to update it.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Traffic sources</h3>
  <div class="efx-chart-pie" data-efx-data="4200,2800,1900,900" data-efx-labels="Organic|Direct|Referral|Social" data-efx-center="{total} visits"></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-pie" data-efx-donut="0" data-efx-show="percent" data-efx-sort data-efx-height="240" data-efx-data="45,25,18,12" data-efx-labels="Pro|Team|Free|Edu"></div></div>
  <div class="card p-6"><div class="efx-chart-pie" data-efx-half data-efx-donut="0.7" data-efx-show="none" data-efx-height="170" data-efx-data="62,23,15" data-efx-labels="Done|Doing|Todo" data-efx-center="62%"></div></div>
</div>`, label: 'Pie with inner percents, and a semicircle' },
  ],
};
