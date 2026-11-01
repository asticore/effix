/* Docs data for particles (not bundled). */
module.exports = {
  title: 'Particles',
  group: 'Background',
  summary: 'Drifting canvas particles behind any section, optionally linked by lines and reacting to the pointer. Pauses off-screen and in hidden tabs.',
  classes: [
    ['efx-particles', 'Injects a canvas behind the content (content stays clickable and above).'],
  ],
  options: [
    ['data-efx-count', '50', 'Max particles (also capped by area / 14000).'],
    ['data-efx-color', '(theme)', 'One color or a list separated by | (commas outside parentheses also work) for multicolor, e.g. rgb(1,2,3)|#f00. Empty = Shine tone/primary.'],
    ['data-efx-size-min', '1', 'Smallest radius in px.'],
    ['data-efx-size-max', '2.8', 'Largest radius in px.'],
    ['data-efx-speed', '100', 'Speed in percent.'],
    ['data-efx-opacity', '1', 'Particle opacity (0–1).'],
    ['data-efx-links', 'false', 'Draw lines between nearby particles.'],
    ['data-efx-link-distance', '110', 'Max link length in px.'],
    ['data-efx-interact', 'repel', 'none · repel · attract · connect (pointer joins the network).'],
    ['data-efx-interact-radius', '120', 'Pointer influence radius in px.'],
    ['data-efx-shape', 'circle', 'circle · square · triangle'],
  ],
  vars: [
    ['--efx-color', 'Shine tone / primary', 'Particle color when data-efx-color is empty.'],
  ],
  examples: [
    { html: `<section class="efx-particles p-6 rounded-lg" data-efx-links data-efx-interact="connect" style="min-height:280px;background:#0f172a;color:#fff">
  <div class="stack"><h3>Connected particles</h3><p>Move the pointer over this area.</p><button class="btn">Still clickable</button></div>
</section>` },
    { html: `<section class="efx-particles p-6 rounded-lg" data-efx-color="#f43f5e|#f59e0b|rgb(34,211,238)" data-efx-shape="square" data-efx-count="70" style="min-height:280px;background:#111827;color:#fff">
  <h3>Multicolor squares</h3>
</section>` },
  ],
};
