/* Docs data for collapse (not bundled). */
module.exports = {
  title: 'Smooth collapse',
  group: 'Components',
  summary: 'Animates native <details> open and close (Shine accordions). Keyboard and name groups keep working; reduced motion toggles instantly.',
  classes: [['spark-collapse', 'On a <details>, or a container: every <details> inside is animated.']],
  options: [
    ['data-spark-duration', '300', 'Animation time in ms.'],
    ['data-spark-easing', 'ease', 'Any CSS easing.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="spark-collapse stack gap-2 p-6">
  <details class="card p-4" name="faq" open><summary>What is Spark?</summary><p class="mt-2">A small JS partner for the Shine CSS framework.</p></details>
  <details class="card p-4" name="faq"><summary>Is it accessible?</summary><p class="mt-2">Native details/summary: keyboard and screen readers work as usual.</p><p>Opening one closes the other, animated.</p></details>
  <details class="card p-4" name="faq"><summary>Does it need JS?</summary><p class="mt-2">No: without JS the accordion toggles natively.</p></details>
</div>` },
  ],
};
