module.exports = {
  title: 'Timeline / Gantt chart',
  group: 'Charts',
  dataFormat: `One object per bar: <code>label</code>, <code>start</code>, <code>end</code> (ISO dates <code>"2026-01-05"</code> or plain numbers), plus optional <code>group</code>, <code>color</code>, <code>progress</code> (0–1 or 0–100).
<code>data-efx-data='[{"label":"Design","start":"2026-01-05","end":"2026-02-01","group":"Phase 1","progress":0.6},</code>
<code>{"label":"Build","start":"2026-02-01","end":"2026-03-15","group":"Phase 2","color":"#8b5cf6"}]'</code>
Rows sharing a <code>group</code> are listed together under a group heading and share a color. Also accepts <code>{"rows":[…]}</code> or an inline <code>&lt;script type="application/json"&gt;</code>.
Dates give a day/week/month/year axis and a Today marker; numbers give a numeric axis.`,
  summary: 'Gantt-style timeline: one row per item with optional group lanes, a date axis that picks day, week, month or year ticks, a Today marker and progress fill inside bars.',
  classes: [['efx-chart-timeline', 'Renders rows of {label, start, end} as a Gantt chart.']],
  options: [
    ['data-efx-data', '', 'JSON [{label, start, end, group?, color?, progress?}] (dates or numbers).'],
    ['data-efx-today', 'true', 'Marker for the current date when it falls inside the range (dates only).'],
    ['data-efx-radius', '4', 'Bar corner radius.'],
    ['data-efx-colors', 'Shine tones', 'Group colors "#f43f5e|#8b5cf6" (a row\'s own color wins).'],
    ['data-efx-prefix / suffix / format', '', 'Formatting for numeric axes and durations.'],
    ['data-efx-tooltip / animate / grid', 'true', 'Turn parts off.'],
    ['data-efx-background', 'false', 'Decorative: bars only, filling the element behind its content.'],
    ['data-efx-title', '', 'Accessible name.'],
  ],
  vars: [['--efx-chart-1 … 7', 'Shine tones', 'Group palette (Today marker uses the 6th).']],
  events: [
    ['efx:select', 'Row clicked / Enter pressed. detail = { index, label, value (duration) }.'],
    ['efx:data (listen)', 'Dispatch with detail as the rows array or {rows:[…]} to update.'],
  ],
  examples: [
    { html: `<div class="card p-6">
  <h3 class="m-0 mb-3">Launch plan</h3>
  <div class="efx-chart-timeline" data-efx-data='[
    {"label":"Research","start":"2026-09-07","end":"2026-10-02","group":"Discover","progress":1},
    {"label":"Prototype","start":"2026-09-28","end":"2026-10-30","group":"Discover","progress":0.8},
    {"label":"Build","start":"2026-10-19","end":"2026-12-11","group":"Deliver","progress":0.35},
    {"label":"QA","start":"2026-11-23","end":"2026-12-23","group":"Deliver","progress":0},
    {"label":"Launch","start":"2026-12-14","end":"2026-12-31","group":"Go live"}]'></div>
</div>` },
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-6"><div class="efx-chart-timeline" data-efx-data='[{"label":"Boot","start":0,"end":40},{"label":"Load","start":30,"end":120,"progress":50},{"label":"Render","start":100,"end":180}]' data-efx-suffix=" ms"></div></div>
  <div class="card p-6 efx-chart-timeline" style="min-height:140px" data-efx-background data-efx-data='[{"start":0,"end":5},{"start":3,"end":9},{"start":6,"end":12},{"start":10,"end":15}]'><strong>Sprint view</strong></div>
</div>`, label: 'Numeric axis, and a timeline behind a card' },
  ],
};
