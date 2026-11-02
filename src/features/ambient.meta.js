/* Docs data for ambient (not bundled). */
module.exports = {
  title: 'Ambient backgrounds',
  group: 'Background',
  summary: 'Animated canvas backgrounds for any section, card or button: twinkling stars, warp-speed starfield, soft drifting orbs (mesh gradient), waves, snow, leaves and bubbles. Pauses off-screen and in hidden tabs; one static frame with reduced motion.',
  classes: [
    ['efx-ambient', 'Injects a canvas behind the content (content stays clickable and above). Pick the look with data-efx-mode.'],
  ],
  options: [
    ['data-efx-mode', 'stars', 'stars · warp · orbs · waves · snow · leaves · bubbles'],
    ['data-efx-count', '0', 'Number of particles / orbs / wave layers. 0 = automatic by area and mode.'],
    ['data-efx-color', '(theme)', 'One color or a list separated by | (commas outside parentheses also work). Empty = Shine tone/primary.'],
    ['data-efx-speed', '1', 'Speed multiplier.'],
    ['data-efx-opacity', '1', 'Overall opacity (0–1).'],
    ['data-efx-interact', 'true', 'Stars, warp and orbs react to the pointer (fine pointers only). false = ignore the pointer.'],
  ],
  vars: [
    ['--efx-color', 'Shine tone / primary', 'Color when data-efx-color is empty.'],
  ],
  examples: [
    { html: `<section class="efx-ambient p-6 rounded-lg" data-efx-mode="orbs" data-efx-color="#6366f1|#ec4899|#06b6d4" style="min-height:280px;background:#0b1020;color:#fff">
  <div class="stack"><h3>Mesh gradient orbs</h3><p>Move the pointer: the orbs drift toward it.</p><button class="btn">Still clickable</button></div>
</section>` },
    { html: `<div class="grid md:grid-cols-3 gap-4">
  <div class="efx-ambient card p-6 rounded-lg" data-efx-mode="warp" data-efx-color="#fff" style="min-height:200px;background:#020617;color:#fff"><h4>Warp</h4></div>
  <div class="efx-ambient card p-6 rounded-lg" data-efx-mode="waves" data-efx-color="#38bdf8|#6366f1|#a855f7" style="min-height:200px;background:#0f172a;color:#fff"><h4>Waves</h4></div>
  <div class="efx-ambient card p-6 rounded-lg" data-efx-mode="snow" data-efx-color="#fff" style="min-height:200px;background:#1e293b;color:#fff"><h4>Snow</h4></div>
  <div class="efx-ambient card p-6 rounded-lg" data-efx-mode="leaves" data-efx-color="#f97316|#eab308|#b91c1c" style="min-height:200px;background:#1c1917;color:#fff"><h4>Leaves</h4></div>
  <div class="efx-ambient card p-6 rounded-lg" data-efx-mode="bubbles" data-efx-color="#7dd3fc" style="min-height:200px;background:#0c4a6e;color:#fff"><h4>Bubbles</h4></div>
  <div class="efx-ambient card p-6 rounded-lg" data-efx-mode="stars" style="min-height:200px;background:#0f172a;color:#fff" data-efx-color="#fff|#fde68a"><h4>Stars</h4></div>
</div>` },
  ],
};
