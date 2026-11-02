/* Docs data for glitch (not bundled). */
module.exports = {
  title: 'Glitch text',
  group: 'Text',
  summary: 'RGB-split glitch effect for headings using clipped, offset copies of the text. Static under reduced motion.',
  classes: [['efx-glitch', 'Glitching text (always, or on hover with data-efx-trigger="hover").']],
  options: [
    ['data-efx-trigger', 'always', 'always · hover (also on keyboard focus).'],
    ['data-efx-text', '', 'Override the glitch layer text (default: the element text).'],
  ],
  vars: [
    ['--efx-glitch-a', 'Shine accent', 'First split color.'],
    ['--efx-glitch-b', 'Shine secondary', 'Second split color.'],
    ['--efx-glitch-speed', '2.4s', 'Cycle length.'],
    ['--efx-glitch-bg', 'transparent', 'Background of glitch layers (set to the surface color to mask the original).'],
  ],
  examples: [
    { html: `<div class="stack gap-4 p-6">
  <h2 class="efx-glitch text-4xl font-bold">System failure</h2>
  <h3 class="efx-glitch text-2xl font-bold" data-efx-trigger="hover">Hover me</h3>
</div>` },
  ],
};
