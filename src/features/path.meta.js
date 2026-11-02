/* Docs data for path (not bundled). */
module.exports = {
  title: 'Motion path',
  group: 'Scroll',
  summary: 'An element travels along an SVG path, driven by scroll, a loop or a one-shot play, rotating with the tangent and leaving a drawn trail.',
  classes: [
    ['efx-path', 'Container. Give it data-efx-svg (an existing svg/path) or data-efx-d (path data, drawn for you).'],
    ['efx-path__item', 'Child that travels the path (several are spaced by data-efx-gap). Its center sits on the path.'],
  ],
  options: [
    ['data-efx-mode', 'scroll', 'scroll = progress of the container through the viewport · loop = repeat every duration · view = play once when seen.'],
    ['data-efx-d', '', 'Path data to draw inside an svg the feature creates, scaled to the container.'],
    ['data-efx-viewbox', '0 0 1000 300', 'viewBox for data-efx-d; the container gets this aspect ratio if it has no height.'],
    ['data-efx-svg', '', 'Selector of an existing <svg> or <path> to follow instead of data-efx-d.'],
    ['data-efx-duration', '4000', 'ms per trip (loop and view).'],
    ['data-efx-rotate', 'true', 'Rotate the item to the path tangent.'],
    ['data-efx-show-path', 'true', 'Draw the path with a trail that grows behind the leading item.'],
    ['data-efx-start', '0', 'Where on the path (0–1) the trip begins.'],
    ['data-efx-end', '1', 'Where on the path (0–1) the trip ends.'],
    ['data-efx-gap', '0.08', 'Spacing between multiple items, as a fraction of the path.'],
  ],
  vars: [['--efx-color', 'var(--sh-primary)', 'Trail color.']],
  examples: [
    { html: `<div class="efx-path" data-efx-d="M20,250 C250,-40 450,330 700,120 S900,60 980,150" data-efx-viewbox="0 0 1000 300" data-efx-mode="loop" data-efx-duration="5000" data-efx-gap="0.1" style="max-width:640px;margin:auto">
  <span class="efx-path__item" style="font-size:1.6rem">➤</span>
  <span class="efx-path__item" style="font-size:1.2rem;opacity:.6">➤</span>
</div>` },
  ],
};
