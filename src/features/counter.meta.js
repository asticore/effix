/* Docs data for counter (not bundled). */
module.exports = {
  title: 'Counter',
  group: 'Scroll',
  summary: 'Counts up to the number written in the element when it scrolls into view. Without JS (or with reduced motion) the final value shows.',
  classes: [
    ['spark-counter', 'Element whose text is the final number.'],
  ],
  options: [
    ['data-spark-from', '0', 'Start value.'],
    ['data-spark-to', 'from text', 'End value (defaults to the number in the text).'],
    ['data-spark-duration', '1600', 'Duration in ms.'],
    ['data-spark-ease', 'ease-out-cubic', 'linear · ease-in · ease-out · ease-in-out · ease-out-cubic · back-out · elastic-out, or any registered easing.'],
    ['data-spark-decimals', '-1', 'Decimal places; -1 = infer from the target.'],
    ['data-spark-separator', ',', 'Thousands separator.'],
    ['data-spark-prefix', '""', 'Text before the number, e.g. $.'],
    ['data-spark-suffix', '""', 'Text after the number, e.g. + or %.'],
    ['data-spark-once', 'true', 'false = replay every time it re-enters the viewport.'],
  ],
  extend: [
    ['easing', '(t: 0..1) => number', 'Shared with scrub (data-spark-ease). Return 0..1 (overshoot allowed).'],
  ],
  extendExample: `<script>
window.SparkConfig = { extend(E) {
  E.add('easing', 'steps4', t => Math.floor(t * 4) / 4);
} };
</script>
<span class="spark-counter" data-spark-ease="steps4">1000</span>`,
  vars: [],
  examples: [
    { html: `<div class="grid md:grid-cols-3 gap-4 text-center">
  <div class="card p-6"><div class="spark-counter" style="font-size:2.25rem;font-weight:700" data-spark-suffix="+">12840</div>Users</div>
  <div class="card p-6"><div class="spark-counter" style="font-size:2.25rem;font-weight:700" data-spark-prefix="$">9.99</div>Price</div>
  <div class="card p-6"><div class="spark-counter" style="font-size:2.25rem;font-weight:700" data-spark-suffix="%" data-spark-once="false">99</div>Uptime</div>
</div>` },
  ],
};
