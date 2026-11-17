/* Docs data for lazyimg (not bundled). */
const svg = (c, t) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><defs><linearGradient id="g"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="800" height="400" fill="url(#g)"/><text x="50%" y="52%" text-anchor="middle" font-size="64" fill="#fff" font-family="sans-serif">${t}</text></svg>`);
module.exports = {
  title: 'Lazy images',
  group: 'Components',
  summary: 'Blur-up image loading: a tiny placeholder shows first, the full image loads when near the viewport and sharpens in. Works for <img> and background images.',
  classes: [
    ['spark-lazyimg', 'On an <img> (data-spark-src / data-spark-srcset) or any element with data-spark-bg.'],
    ['is-lazy / is-loaded / is-error', 'State classes set by JS.'],
  ],
  options: [
    ['data-spark-margin', '300px', 'How early to start loading (rootMargin).'],
    ['data-spark-blur', '12', 'Blur radius in px of the placeholder.'],
    ['data-spark-src', '', 'Full image URL (img).'],
    ['data-spark-srcset', '', 'Full srcset (img); optional data-spark-sizes.'],
    ['data-spark-bg', '', 'Full background image URL (any element).'],
  ],
  vars: [
    ['--spark-blur', 'set by JS', 'Placeholder blur radius.'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <img class="spark-lazyimg rounded-lg" style="width:100%;height:220px;object-fit:cover" alt="Gradient"
    src="${svg('#6366f1', 'tiny').replace(/"/g, '&quot;')}" data-spark-src="${svg('#6366f1', 'Sharp image').replace(/"/g, '&quot;')}">
  <div class="spark-lazyimg rounded-lg" style="height:220px;background-color:#c7d2fe" data-spark-bg="${svg('#0ea5e9', 'Background').replace(/"/g, '&quot;')}"></div>
</div>` },
  ],
};
