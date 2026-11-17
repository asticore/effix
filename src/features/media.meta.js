/* Docs data for media (not bundled). */
module.exports = {
  title: 'Smart video',
  group: 'Components',
  summary: 'Videos that play when visible, pause off-screen, optionally play on hover, and only download when near the viewport. Reduced motion: no autoplay, a play control instead.',
  classes: [
    ['spark-media', 'On a <video>, or on a container holding videos.'],
    ['spark-media__play', 'Injected play button (reduced motion, container hosts).'],
  ],
  options: [
    ['data-spark-play', 'view', 'view = play while visible · hover = play on hover/focus (or add data-spark-hover) · none = lazy src only.'],
    ['data-spark-threshold', '0.4', 'Visible fraction (0–1) needed before playing.'],
    ['data-spark-reset', 'false', 'Rewind to the start when paused.'],
    ['data-spark-src', '', 'On the video or a <source>: URL, assigned only when within ~300px of the viewport.'],
  ],
  vars: [],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <video class="spark-media rounded-lg" muted playsinline loop preload="none" style="width:100%" data-spark-src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"></video>
  <video class="spark-media rounded-lg" muted playsinline loop preload="none" style="width:100%" data-spark-play="hover" data-spark-reset data-spark-src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"></video>
</div>` },
  ],
};
