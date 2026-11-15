module.exports = {
  title: 'Star rating',
  group: 'Data',
  summary: 'Star rating: read-only display or an input with half stars, a slider-style keyboard model, a change event and an optional hidden form field.',
  classes: [
    ['efx-rating', 'The rating. Plain text inside (e.g. 4.5) is used as the value without JS.'],
    ['efx-rating__star', 'Injected star; --efx-fill (0–1) says how much of it is filled.'],
    ['is-readonly', 'Set while read-only.'],
  ],
  options: [
    ['data-efx-value', '0', 'Current value (0 – count).'],
    ['data-efx-count', '5', 'Number of stars.'],
    ['data-efx-half', 'false', 'Allow half stars.'],
    ['data-efx-readonly', 'true', 'false = user can click / use arrow keys, Home, End.'],
    ['data-efx-name', '', 'Writes the value to a hidden input with this name (for forms).'],
    ['data-efx-label', 'Rating', 'Accessible name.'],
  ],
  events: [['change', 'Value changed by the user (bubbles). detail = { value }.']],
  vars: [['--efx-color', 'Shine tone / amber', 'Filled star colour.'], ['--efx-rating-empty', 'border color', 'Empty star colour.']],
  examples: [
    { html: `<div class="stack gap-3"><div class="efx-rating" data-efx-value="3.5" data-efx-half data-efx-label="Average rating"></div>
<div class="efx-rating" data-efx-readonly="false" data-efx-half data-efx-value="2" data-efx-name="score"></div></div>` },
  ],
};
