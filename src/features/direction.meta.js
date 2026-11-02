/* Docs data for direction (not bundled). */
module.exports = {
  title: 'Direction-aware hover',
  group: 'Pointer',
  summary: 'Detects which edge the pointer entered or left and slides a fill in from that side. Works on buttons, cards, nav items and image tiles; sets data-efx-from so you can build your own transitions.',
  classes: [
    ['efx-direction', 'Sets data-efx-from (top | right | bottom | left) and .is-hover; adds the sliding fill overlay.'],
  ],
  options: [
    ['data-efx-fill', 'true', 'false = only set data-efx-from and .is-hover, for custom CSS.'],
  ],
  vars: [
    ['--efx-direction-color', 'Shine primary 15%', 'Fill color.'],
    ['--efx-direction-duration', '280ms', 'Slide duration.'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-3 gap-4">
  <div class="card efx-direction p-6 rounded-lg" style="--efx-direction-color:rgb(99 102 241 / .25)"><h4>Card</h4><p>Enter and leave from different sides.</p></div>
  <div class="card efx-direction p-6 rounded-lg" style="--efx-direction-color:rgb(244 63 94 / .25)"><h4>Another</h4><p>Keyboard focus fills from the left.</p></div>
  <a href="#" class="btn efx-direction" style="--efx-direction-color:rgb(16 185 129 / .3)">Button</a>
</div>` },
  ],
};
