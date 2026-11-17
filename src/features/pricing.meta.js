/* Docs data for pricing (not bundled). */
module.exports = {
  title: 'Pricing toggle',
  group: 'Components',
  summary: 'Monthly/yearly switch that rolls prices to their new values (odometer digits or a count tween), swaps period text, toggles a "save" badge and announces the change. Radiogroup keyboard support.',
  classes: [
    ['spark-pricing', 'Container of the switch and the prices.'],
    ['spark-pricing__toggle', 'Optional checkbox instead of buttons: unchecked = first period, checked = second.'],
  ],
  options: [
    ['data-spark-periods', 'Monthly|Yearly', 'Period names, in the order of every "|" list below.'],
    ['data-spark-start', '0', 'Index of the initial period.'],
    ['data-spark-duration', '600', 'Count tween time in ms (non-odometer prices).'],
  ],
  extend: [
    ['Attributes', '[data-spark-period]', 'Switch buttons (value = period name or index). [data-spark-prices="9|90"] price per period; [data-spark-period-text="per month|per year"]; [data-spark-show-on="Yearly"] shown only for that period.'],
    ['Event', 'spark:period', 'Fires on the container with detail {index, period}.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="spark-pricing card p-6 stack gap-4 text-center" data-spark-periods="Monthly|Yearly" style="max-width:22rem;margin:auto">
  <div class="cluster gap-2" style="justify-content:center">
    <button class="btn" data-spark-period="Monthly">Monthly</button>
    <button class="btn" data-spark-period="Yearly">Yearly</button>
    <span class="badge tone-success" data-spark-show-on="Yearly">Save 20%</span>
  </div>
  <div class="text-5xl font-bold"><span data-spark-prices="9|90">$<span class="spark-odometer">9</span></span></div>
  <div class="text-muted" data-spark-period-text="per month|per year">per month</div>
  <div class="text-2xl">Fallback tween: <b data-spark-prices="$19.50|$190.00">$19.50</b></div>
</div>` },
  ],
};
