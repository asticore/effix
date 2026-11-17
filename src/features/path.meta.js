/* Docs data for path (not bundled). */
module.exports = {
  title: 'Motion path',
  group: 'Scroll',
  summary: 'An element travels along an SVG path, driven by scroll, a loop or a one-shot play, rotating with the tangent and leaving a drawn trail.',
  classes: [
    ['spark-path', 'Container. Give it data-spark-svg (an existing svg/path) or data-spark-d (path data, drawn for you).'],
    ['spark-path__item', 'Child that travels the path (several are spaced by data-spark-gap). Its center sits on the path.'],
  ],
  options: [
    ['data-spark-mode', 'scroll', 'scroll = progress of the container through the viewport · loop = repeat every duration · view = play once when seen.'],
    ['data-spark-d', '', 'Path data to draw inside an svg the feature creates, scaled to the container.'],
    ['data-spark-viewbox', '0 0 1000 300', 'viewBox for data-spark-d; the container gets this aspect ratio if it has no height.'],
    ['data-spark-svg', '', 'Selector of an existing <svg> or <path> to follow instead of data-spark-d.'],
    ['data-spark-duration', '4000', 'ms per trip (loop and view).'],
    ['data-spark-rotate', 'true', 'Rotate the item to the path tangent.'],
    ['data-spark-show-path', 'true', 'Draw the path with a trail that grows behind the leading item.'],
    ['data-spark-start', '0', 'Where on the path (0–1) the trip begins.'],
    ['data-spark-end', '1', 'Where on the path (0–1) the trip ends.'],
    ['data-spark-gap', '0.08', 'Spacing between multiple items, as a fraction of the path.'],
  ],
  vars: [['--spark-color', 'var(--sh-primary)', 'Trail color.']],
  examples: [
    { html: `<div class="spark-path" data-spark-d="M20,250 C250,-40 450,330 700,120 S900,60 980,150" data-spark-viewbox="0 0 1000 300" data-spark-mode="loop" data-spark-duration="5000" data-spark-gap="0.1" style="max-width:640px;margin:auto">
  <span class="spark-path__item" style="font-size:1.6rem">➤</span>
  <span class="spark-path__item" style="font-size:1.2rem;opacity:.6">➤</span>
</div>` },
  ],
};
