module.exports = {
  title: 'Calendar & date picker',
  group: 'Data',
  summary: 'Month view with events from JSON or an ICS feed, plus an optional single-date or range picker. First day of week and locale are options. Keyboard: arrows, Home/End, PageUp/PageDown (Shift = year).',
  classes: [
    ['efx-calendar', 'The calendar. Injected parts: __head, __title, __nav, __grid, __row, __dow, __day, __dots, __events.'],
    ['is-selected / is-start / is-end', 'On picked day buttons (the gridcell also gets aria-selected).'],
    ['has-events', 'On a day button that has events.'],
  ],
  options: [
    ['data-efx-events', '', 'JSON array [{ date, end?, title, color? }], or a URL to an .ics / .json file. An inline <script type="application/json"> child also works.'],
    ['data-efx-picker', 'true', 'false = view-only (days are not selectable).'],
    ['data-efx-range', 'false', 'Pick a start and end date instead of one date.'],
    ['data-efx-value', '', '"2026-11-20" or "2026-11-20/2026-11-25".'],
    ['data-efx-month', '', 'Month to show first, "2026-11" (default: value or today).'],
    ['data-efx-first-day', '0', 'First day of the week: 0 = Sunday, 1 = Monday…'],
    ['data-efx-locale', '', 'BCP 47 locale for month and weekday names (default: the browser).'],
    ['data-efx-min / max', '', 'Earliest / latest selectable date (YYYY-MM-DD).'],
    ['data-efx-name', '', 'Writes the picked date (or "start/end") to a hidden input for forms.'],
    ['data-efx-label', 'Calendar', 'Accessible name.'],
  ],
  events: [
    ['change', 'A date (or a complete range) was picked (bubbles). detail = { value, end, events }.'],
    ['efx:data (listen)', 'Dispatch with detail = events array, { events } or ICS text to replace the events.'],
  ],
  vars: [['--efx-color', 'Shine tone', 'Selection and today colour.']],
  examples: [
    { html: `<div class="card p-6"><div class="efx-calendar" data-efx-first-day="1" data-efx-month="2026-11" data-efx-events='[{"date":"2026-11-12","title":"Team offsite","end":"2026-11-13"},{"date":"2026-11-20","title":"Launch","color":"#ef4444"}]'></div></div>` },
    { html: `<div class="card p-6"><div class="efx-calendar" data-efx-range data-efx-name="stay" data-efx-month="2026-12" data-efx-locale="en-GB"></div></div>`, label: 'Range picker' },
  ],
};
