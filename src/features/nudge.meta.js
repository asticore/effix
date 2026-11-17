/* Docs data for nudge (not bundled). */
module.exports = {
  title: 'Nudge',
  group: 'Animations',
  summary: 'Repeats a small attention animation (shake, wobble, bell ring or any animate.css effect) on an element until the user clicks or hovers it. Only runs while the element and tab are visible. Optional pulsing notification dot. Reduced motion shows only the static dot.',
  classes: [['spark-nudge', 'Element to nudge (button, bell icon, CTA).']],
  options: [
    ['data-spark-every', '6000', 'Ms between nudges.'],
    ['data-spark-anim', 'shake', 'shake · wobble · ring, or any animate.css name (pulse, tada, heartbeat, jello...).'],
    ['data-spark-times', '0', 'Max repeats (0 = until interaction).'],
    ['data-spark-delay', '3000', 'Ms before the first nudge.'],
    ['data-spark-stop', 'click', 'click · hover · never.'],
    ['data-spark-dot', 'false', 'Add a pulsing notification dot top-right (hides on interaction).'],
  ],
  vars: [['--spark-nudge-dot', 'var(--sh-danger)', 'Dot color.']],
  examples: [
    { html: `<div class="cluster gap-6 p-6" style="min-height:300px;align-content:center;justify-content:center">
  <button class="btn spark-nudge" data-spark-anim="ring" data-spark-dot data-spark-delay="600" data-spark-every="3000" aria-label="Notifications">🔔</button>
  <button class="btn tone-primary spark-nudge" data-spark-anim="shake" data-spark-delay="1200" data-spark-every="3000">Click me</button>
  <button class="btn spark-nudge" data-spark-anim="wobble" data-spark-stop="hover" data-spark-delay="1800" data-spark-every="3000">Hover to stop</button>
</div>` },
  ],
};
