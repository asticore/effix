module.exports = {
  title: 'Lottie player',
  group: 'Media',
  summary: 'Small dotLottie / Lottie player. Lazy: the player library is fetched only when an element nears the viewport, so pages without Lottie pay nothing. Autoplay, loop, play when visible, on hover or click, or scrub with scroll; reduced motion shows a still frame.',
  smoke: false, // needs the network to fetch the player library
  classes: [
    ['spark-lottie', 'Container; give it a width. Content inside is a fallback shown until the animation is ready (or if it fails).'],
    ['is-ready / is-error', 'State classes.'],
  ],
  options: [
    ['data-spark-src', '', '.lottie (dotLottie) or .json animation URL. Required.'],
    ['data-spark-trigger', 'auto', 'auto · visible (play in view, pause out) · hover · click · scroll (scrub with scroll position).'],
    ['data-spark-autoplay', 'true', 'With trigger=auto: false shows a still frame.'],
    ['data-spark-loop', 'true', 'Loop the animation.'],
    ['data-spark-speed', '1', 'Playback speed.'],
    ['data-spark-still', '0', 'Which frame (0–1 through the animation) to show when not playing / reduced motion.'],
    ['data-spark-label', '', 'Accessible name. Empty = decorative (aria-hidden).'],
    ['data-spark-lib', 'jsDelivr @lottiefiles/dotlottie-web', 'ES module URL exporting DotLottie (self-host it for privacy / offline).'],
  ],
  events: [['spark:ready', 'Animation loaded.'], ['spark:done', 'A non-looping animation finished.']],
  vars: [['--spark-lottie-ratio', '1', 'Aspect ratio of the box, e.g. 16 / 9.']],
  examples: [
    { html: `<div class="spark-lottie" data-spark-src="https://lottie.host/embed/placeholder.lottie" data-spark-trigger="visible" data-spark-label="Animation" style="width:200px"><p class="m-0 text-sm">Animation placeholder</p></div>` },
  ],
};
