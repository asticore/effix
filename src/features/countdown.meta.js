/* Docs data for countdown (not bundled). */
module.exports = {
  title: 'Countdown',
  group: 'Time',
  summary: 'Live countdown to a date, rendered as a cluster of small cards (or one compact line). Pauses while the tab is hidden and fires spark:done at zero.',
  classes: [['spark-countdown', 'Container; renders .spark-countdown__unit > __num + __label.']],
  options: [
    ['data-spark-to', '', 'Target date/time, e.g. 2027-01-31T18:00 (local) or with Z.'],
    ['data-spark-units', 'dhms', 'Subset of d h m s; larger omitted units roll into the next.'],
    ['data-spark-labels', 'Days|Hours|Minutes|Seconds', 'Unit labels separated by |.'],
    ['data-spark-expired', '', 'Text shown when finished; empty = keep zeros.'],
    ['data-spark-pad', 'true', 'Zero-pad hours/minutes/seconds.'],
    ['data-spark-compact', 'false', 'Single line like "3d 04:05:06".'],
  ],
  vars: [['--spark-countdown-bg', 'var(--sh-surface-2)', 'Unit card background.']],
  examples: [
    { html: `<div class="stack gap-4 p-6">
  <div class="spark-countdown" data-spark-to="2027-12-31T23:59"></div>
  <div class="spark-countdown" data-spark-compact data-spark-to="2027-12-31T23:59" data-spark-units="dhms"></div>
</div>` },
  ],
};
