/* Docs data for glitch (not bundled). */
module.exports = {
  title: 'Glitch text',
  group: 'Text',
  summary: 'RGB-split glitch effect for headings using clipped, offset copies of the text. Static under reduced motion.',
  classes: [['spark-glitch', 'Glitching text (always, or on hover with data-spark-trigger="hover").']],
  options: [
    ['data-spark-trigger', 'always', 'always · hover (also on keyboard focus).'],
    ['data-spark-text', '', 'Override the glitch layer text (default: the element text).'],
  ],
  vars: [
    ['--spark-glitch-a', 'Shine accent', 'First split color.'],
    ['--spark-glitch-b', 'Shine secondary', 'Second split color.'],
    ['--spark-glitch-speed', '2.4s', 'Cycle length.'],
    ['--spark-glitch-bg', 'transparent', 'Background of glitch layers (set to the surface color to mask the original).'],
  ],
  examples: [
    { html: `<div class="stack gap-4 p-6">
  <h2 class="spark-glitch text-4xl font-bold">System failure</h2>
  <h3 class="spark-glitch text-2xl font-bold" data-spark-trigger="hover">Hover me</h3>
</div>` },
  ],
};
