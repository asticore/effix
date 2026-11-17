/* Docs data for schedule (not bundled). */
module.exports = {
  title: 'Schedule visibility',
  group: 'Components',
  summary: 'Shows or hides content by date window, weekday and hours of day (visitor local time). Re-evaluates at the next boundary with one timer, no polling.',
  classes: [['spark-schedule', 'Gets [hidden] and .is-scheduled-off while outside its window. Fires "spark:change" with detail {on}. Tip: add `hidden` in the HTML for mode="show" items to avoid a flash.']],
  options: [
    ['data-spark-from', '', 'Start, e.g. 2026-12-01 or 2026-12-01T09:00 (local time).'],
    ['data-spark-until', '', 'End (exclusive), e.g. 2026-12-26T00:00.'],
    ['data-spark-days', '', 'Weekdays, e.g. mon-fri or sat,sun.'],
    ['data-spark-hours', '', 'Daily hours, e.g. 09:00-17:00 (may wrap past midnight).'],
    ['data-spark-mode', 'show', 'show = visible inside the window · hide = visible outside it.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="stack gap-3">
  <div class="card p-4 tone-success spark-schedule" hidden data-spark-from="2020-01-01" data-spark-until="2099-01-01">Visible now: inside the window.</div>
  <div class="card p-4 tone-danger spark-schedule" hidden data-spark-from="2099-01-01">Hidden now: starts in 2099.</div>
  <div class="card p-4 spark-schedule" data-spark-days="mon-fri" data-spark-hours="09:00-17:00" data-spark-mode="hide">Shown outside weekday office hours.</div>
</div>` },
  ],
};
