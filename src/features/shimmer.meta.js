/* Docs data for shimmer (not bundled). */
module.exports = {
  title: 'Shimmer / skeleton',
  group: 'Components',
  summary: 'Loading shimmer: skeleton blocks, shimmering text and a button shine sweep in pure CSS, plus an optional JS wrapper that hides content until an image/element loads (or a timeout) and then crossfades it in. aria-busy tracks the state; reduced motion gives static gray.',
  classes: [
    ['spark-shimmer', 'Skeleton block. With data-spark-until / data-spark-for it wraps real content and clears when ready.'],
    ['spark-shimmer-text', 'Shimmering text (gradient sweep clipped to the glyphs).'],
    ['spark-shimmer-btn', 'Button shine sweep (add to .btn).'],
    ['spark-skeleton-line', 'Text-line placeholder.'],
    ['spark-skeleton-circle', 'Avatar placeholder.'],
    ['spark-skeleton-rect', 'Image/card placeholder.'],
  ],
  options: [
    ['data-spark-until', '', 'Selector of image/element to wait for (load/error event; "spark:ready" event also works).'],
    ['data-spark-for', '0', 'Ms to wait, or the timeout when combined with until.'],
  ],
  vars: [
    ['--spark-shimmer-base', 'var(--sh-surface-2)', 'Skeleton base color.'],
    ['--spark-shimmer-hi', 'derived', 'Sweep highlight color.'],
    ['--spark-shimmer-duration', '1.6s', 'Sweep time.'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-6 p-6" style="min-height:300px">
  <div class="stack gap-3">
    <div class="cluster gap-3"><div class="spark-skeleton-circle"></div><div class="stack" style="flex:1"><div class="spark-skeleton-line"></div><div class="spark-skeleton-line" style="width:60%"></div></div></div>
    <div class="spark-skeleton-rect"></div>
    <div class="spark-shimmer-text text-2xl font-bold">Loading…</div>
    <button class="btn spark-shimmer-btn">Upgrade now</button>
  </div>
  <div class="spark-shimmer card" data-spark-for="2500" style="min-height:10rem"><div class="p-4"><h3>Content ready</h3><p>This card was a skeleton for 2.5 seconds.</p></div></div>
</div>` },
  ],
};
