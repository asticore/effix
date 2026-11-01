/* Docs data for schedule (not bundled). */
module.exports = {
  title: 'Schedule visibility',
  group: 'Components',
  summary: 'Shows or hides content by date window, weekday and hours of day (visitor local time). Re-evaluates at the next boundary with one timer, no polling.',
  classes: [['efx-schedule', 'Gets [hidden] and .is-scheduled-off while outside its window. Fires "efx:change" with detail {on}. Tip: add `hidden` in the HTML for mode="show" items to avoid a flash.']],
  options: [
    ['data-efx-from', '', 'Start, e.g. 2026-12-01 or 2026-12-01T09:00 (local time).'],
    ['data-efx-until', '', 'End (exclusive), e.g. 2026-12-26T00:00.'],
    ['data-efx-days', '', 'Weekdays, e.g. mon-fri or sat,sun.'],
    ['data-efx-hours', '', 'Daily hours, e.g. 09:00-17:00 (may wrap past midnight).'],
    ['data-efx-mode', 'show', 'show = visible inside the window · hide = visible outside it.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="stack gap-3">
  <div class="card p-4 tone-success efx-schedule" hidden data-efx-from="2020-01-01" data-efx-until="2099-01-01">Visible now: inside the window.</div>
  <div class="card p-4 tone-danger efx-schedule" hidden data-efx-from="2099-01-01">Hidden now: starts in 2099.</div>
  <div class="card p-4 efx-schedule" data-efx-days="mon-fri" data-efx-hours="09:00-17:00" data-efx-mode="hide">Shown outside weekday office hours.</div>
</div>` },
  ],
};
