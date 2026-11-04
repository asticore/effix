/* Docs data for shimmer (not bundled). */
module.exports = {
  title: 'Shimmer / skeleton',
  group: 'Components',
  summary: 'Loading shimmer: skeleton blocks, shimmering text and a button shine sweep in pure CSS, plus an optional JS wrapper that hides content until an image/element loads (or a timeout) and then crossfades it in. aria-busy tracks the state; reduced motion gives static gray.',
  classes: [
    ['efx-shimmer', 'Skeleton block. With data-efx-until / data-efx-for it wraps real content and clears when ready.'],
    ['efx-shimmer-text', 'Shimmering text (gradient sweep clipped to the glyphs).'],
    ['efx-shimmer-btn', 'Button shine sweep (add to .btn).'],
    ['efx-skeleton-line', 'Text-line placeholder.'],
    ['efx-skeleton-circle', 'Avatar placeholder.'],
    ['efx-skeleton-rect', 'Image/card placeholder.'],
  ],
  options: [
    ['data-efx-until', '', 'Selector of image/element to wait for (load/error event; "efx:ready" event also works).'],
    ['data-efx-for', '0', 'Ms to wait, or the timeout when combined with until.'],
  ],
  vars: [
    ['--efx-shimmer-base', 'var(--sh-surface-2)', 'Skeleton base color.'],
    ['--efx-shimmer-hi', 'derived', 'Sweep highlight color.'],
    ['--efx-shimmer-duration', '1.6s', 'Sweep time.'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-6 p-6" style="min-height:300px">
  <div class="stack gap-3">
    <div class="cluster gap-3"><div class="efx-skeleton-circle"></div><div class="stack" style="flex:1"><div class="efx-skeleton-line"></div><div class="efx-skeleton-line" style="width:60%"></div></div></div>
    <div class="efx-skeleton-rect"></div>
    <div class="efx-shimmer-text text-2xl font-bold">Loading…</div>
    <button class="btn efx-shimmer-btn">Upgrade now</button>
  </div>
  <div class="efx-shimmer card" data-efx-for="2500" style="min-height:10rem"><div class="p-4"><h3>Content ready</h3><p>This card was a skeleton for 2.5 seconds.</p></div></div>
</div>` },
  ],
};
