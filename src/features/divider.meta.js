/* Docs data for divider (not bundled). */
module.exports = {
  title: 'Shape dividers',
  group: 'Sections',
  summary: 'Animated SVG dividers (waves, clouds, mountains, drips…) generated inline and colored to match the neighbouring section.',
  classes: [['efx-divider', 'Placeholder block; JS fills it with an SVG. Shapes: wave, waves, tilt, curve, triangle, arrow, zigzag, clouds, mountains, drips (hangs from the top), steps, spikes.']],
  options: [
    ['data-efx-shape', 'wave', 'wave · waves · tilt · curve · triangle · arrow · zigzag · clouds · mountains · drips · steps · spikes'],
    ['data-efx-color', '', 'Fill color; empty = --efx-divider-color or Shine --sh-bg.'],
    ['data-efx-height', '80', 'Height in px.'],
    ['data-efx-flip', 'false', 'Mirror horizontally.'],
    ['data-efx-invert', 'false', 'Mirror vertically (for dividers at the top of a section).'],
    ['data-efx-animate', 'none', 'none · drift (periodic shapes scroll sideways) · layers (3 drifting copies) · float (bob). Non-periodic shapes fall back to float.'],
    ['data-efx-speed', '12', 'Seconds per drift loop.'],
    ['data-efx-position', '', 'top · bottom = absolutely placed on the parent section edge; empty = normal block.'],
  ],
  vars: [['--efx-divider-color', 'var(--sh-bg)', 'Fill color (use the next section\'s background).']],
  examples: [
    { html: `<section class="p-6 tone-primary" style="position:relative;height:280px;overflow:hidden;background:var(--sh-primary,#4f46e5);color:#fff">
  <h3>Wavy section</h3><p>Dividers drift along the bottom edge.</p>
  <div class="efx-divider" data-efx-shape="waves" data-efx-animate="drift" data-efx-position="bottom" data-efx-height="90" data-efx-color="#fff"></div>
</section>` },
  ],
};
