/* Docs data for counter (not bundled). */
module.exports = {
  title: 'Counter',
  group: 'Scroll',
  summary: 'Counts up to the number written in the element when it scrolls into view. Without JS (or with reduced motion) the final value shows.',
  classes: [
    ['efx-counter', 'Element whose text is the final number.'],
  ],
  options: [
    ['data-efx-from', '0', 'Start value.'],
    ['data-efx-to', 'from text', 'End value (defaults to the number in the text).'],
    ['data-efx-duration', '1600', 'Duration in ms.'],
    ['data-efx-ease', 'ease-out-cubic', 'linear · ease-in · ease-out · ease-in-out · ease-out-cubic · back-out · elastic-out, or any registered easing.'],
    ['data-efx-decimals', '-1', 'Decimal places; -1 = infer from the target.'],
    ['data-efx-separator', ',', 'Thousands separator.'],
    ['data-efx-prefix', '""', 'Text before the number, e.g. $.'],
    ['data-efx-suffix', '""', 'Text after the number, e.g. + or %.'],
    ['data-efx-once', 'true', 'false = replay every time it re-enters the viewport.'],
  ],
  extend: [
    ['easing', '(t: 0..1) => number', 'Shared with scrub (data-efx-ease). Return 0..1 (overshoot allowed).'],
  ],
  extendExample: `<script>
window.EffixConfig = { extend(E) {
  E.add('easing', 'steps4', t => Math.floor(t * 4) / 4);
} };
</script>
<span class="efx-counter" data-efx-ease="steps4">1000</span>`,
  vars: [],
  examples: [
    { html: `<div class="grid md:grid-cols-3 gap-4 text-center">
  <div class="card p-6"><div class="efx-counter" style="font-size:2.25rem;font-weight:700" data-efx-suffix="+">12840</div>Users</div>
  <div class="card p-6"><div class="efx-counter" style="font-size:2.25rem;font-weight:700" data-efx-prefix="$">9.99</div>Price</div>
  <div class="card p-6"><div class="efx-counter" style="font-size:2.25rem;font-weight:700" data-efx-suffix="%" data-efx-once="false">99</div>Uptime</div>
</div>` },
  ],
};
