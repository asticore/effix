/* Docs data for compare (not bundled). */
const svg = (c, t) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="100%" height="100%" fill="${c}"/><text x="50%" y="50%" fill="#fff" font-size="48" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${t}</text></svg>`)}`;
module.exports = {
  title: 'Before / after compare',
  group: 'Components',
  summary: 'Drag a handle to reveal the second image over the first. Keyboard and screen reader friendly via a hidden range input.',
  classes: [['spark-compare', 'Container with exactly two <img> children: before, then after. Gets .is-dragging while dragging.']],
  options: [
    ['data-spark-start', '50', 'Starting position, percent.'],
    ['data-spark-vertical', 'false', 'Split top/bottom instead of left/right.'],
    ['data-spark-hover', 'false', 'Follow the mouse without dragging (fine pointers only).'],
  ],
  vars: [
    ['--spark-pos', '50%', 'Current split position (set by JS).'],
    ['--spark-handle', 'var(--sh-bg)', 'Handle line color.'],
  ],
  examples: [
    { html: `<div class="spark-compare rounded-lg" style="max-width:480px">
  <img src="${svg('#64748b', 'Before')}" alt="Before">
  <img src="${svg('#6366f1', 'After')}" alt="After">
</div>` },
  ],
};
