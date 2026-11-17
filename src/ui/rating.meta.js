module.exports = {
  title: 'Star rating',
  group: 'Data',
  summary: 'Star rating: read-only display or an input with half stars, a slider-style keyboard model, a change event and an optional hidden form field.',
  classes: [
    ['spark-rating', 'The rating. Plain text inside (e.g. 4.5) is used as the value without JS.'],
    ['spark-rating__star', 'Injected star; --spark-fill (0–1) says how much of it is filled.'],
    ['is-readonly', 'Set while read-only.'],
    ['rating / rating-input / rating-half', 'With 5 stars and Shine\'s widgets CSS loaded, Shine\'s own markup is used: a read-only .rating with --sh-rating, or radio inputs and labels in .rating-input (with .rating-half for half stars). The change event still carries detail.value.'],
  ],
  options: [
    ['data-spark-value', '0', 'Current value (0 – count).'],
    ['data-spark-count', '5', 'Number of stars.'],
    ['data-spark-half', 'false', 'Allow half stars.'],
    ['data-spark-readonly', 'true', 'false = user can click / use arrow keys, Home, End.'],
    ['data-spark-name', '', 'Writes the value to a hidden input with this name (for forms).'],
    ['data-spark-label', 'Rating', 'Accessible name.'],
  ],
  events: [['change', 'Value changed by the user (bubbles). detail = { value }.']],
  vars: [['--spark-color', 'Shine tone / amber', 'Filled star colour.'], ['--spark-rating-empty', 'border color', 'Empty star colour.']],
  examples: [
    { html: `<div class="stack gap-3"><div class="spark-rating" data-spark-value="3.5" data-spark-half data-spark-label="Average rating"></div>
<div class="spark-rating" data-spark-readonly="false" data-spark-half data-spark-value="2" data-spark-name="score"></div></div>` },
  ],
};
