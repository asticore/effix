/* Docs data for countdown (not bundled). */
module.exports = {
  title: 'Countdown',
  group: 'Time',
  summary: 'Live countdown to a date, rendered as a cluster of small cards (or one compact line). Pauses while the tab is hidden and fires efx:done at zero.',
  classes: [['efx-countdown', 'Container; renders .efx-countdown__unit > __num + __label.']],
  options: [
    ['data-efx-to', '', 'Target date/time, e.g. 2027-01-31T18:00 (local) or with Z.'],
    ['data-efx-units', 'dhms', 'Subset of d h m s; larger omitted units roll into the next.'],
    ['data-efx-labels', 'Days|Hours|Minutes|Seconds', 'Unit labels separated by |.'],
    ['data-efx-expired', '', 'Text shown when finished; empty = keep zeros.'],
    ['data-efx-pad', 'true', 'Zero-pad hours/minutes/seconds.'],
    ['data-efx-compact', 'false', 'Single line like "3d 04:05:06".'],
  ],
  vars: [['--efx-countdown-bg', 'var(--sh-surface-2)', 'Unit card background.']],
  examples: [
    { html: `<div class="stack gap-4 p-6">
  <div class="efx-countdown" data-efx-to="2099-01-31T18:00"></div>
  <div class="efx-countdown" data-efx-compact data-efx-to="2099-01-31T18:00" data-efx-units="dhms"></div>
</div>` },
  ],
};
