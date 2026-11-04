/* Docs data for nudge (not bundled). */
module.exports = {
  title: 'Nudge',
  group: 'Animations',
  summary: 'Repeats a small attention animation (shake, wobble, bell ring or any animate.css effect) on an element until the user clicks or hovers it. Only runs while the element and tab are visible. Optional pulsing notification dot. Reduced motion shows only the static dot.',
  classes: [['efx-nudge', 'Element to nudge (button, bell icon, CTA).']],
  options: [
    ['data-efx-every', '6000', 'Ms between nudges.'],
    ['data-efx-anim', 'shake', 'shake · wobble · ring, or any animate.css name (pulse, tada, heartbeat, jello...).'],
    ['data-efx-times', '0', 'Max repeats (0 = until interaction).'],
    ['data-efx-delay', '3000', 'Ms before the first nudge.'],
    ['data-efx-stop', 'click', 'click · hover · never.'],
    ['data-efx-dot', 'false', 'Add a pulsing notification dot top-right (hides on interaction).'],
  ],
  vars: [['--efx-nudge-dot', 'var(--sh-danger)', 'Dot color.']],
  examples: [
    { html: `<div class="cluster gap-6 p-6" style="min-height:300px;align-content:center;justify-content:center">
  <button class="btn efx-nudge" data-efx-anim="ring" data-efx-dot data-efx-delay="600" data-efx-every="3000" aria-label="Notifications">🔔</button>
  <button class="btn tone-primary efx-nudge" data-efx-anim="shake" data-efx-delay="1200" data-efx-every="3000">Click me</button>
  <button class="btn efx-nudge" data-efx-anim="wobble" data-efx-stop="hover" data-efx-delay="1800" data-efx-every="3000">Hover to stop</button>
</div>` },
  ],
};
