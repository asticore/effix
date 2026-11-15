module.exports = {
  title: 'Lottie player',
  group: 'Media',
  summary: 'Small dotLottie / Lottie player. Lazy: the player library is fetched only when an element nears the viewport, so pages without Lottie pay nothing. Autoplay, loop, play when visible, on hover or click, or scrub with scroll; reduced motion shows a still frame.',
  smoke: false, // needs the network to fetch the player library
  classes: [
    ['efx-lottie', 'Container; give it a width. Content inside is a fallback shown until the animation is ready (or if it fails).'],
    ['is-ready / is-error', 'State classes.'],
  ],
  options: [
    ['data-efx-src', '', '.lottie (dotLottie) or .json animation URL. Required.'],
    ['data-efx-trigger', 'auto', 'auto · visible (play in view, pause out) · hover · click · scroll (scrub with scroll position).'],
    ['data-efx-autoplay', 'true', 'With trigger=auto: false shows a still frame.'],
    ['data-efx-loop', 'true', 'Loop the animation.'],
    ['data-efx-speed', '1', 'Playback speed.'],
    ['data-efx-still', '0', 'Which frame (0–1 through the animation) to show when not playing / reduced motion.'],
    ['data-efx-label', '', 'Accessible name. Empty = decorative (aria-hidden).'],
    ['data-efx-lib', 'jsDelivr @lottiefiles/dotlottie-web', 'ES module URL exporting DotLottie (self-host it for privacy / offline).'],
  ],
  events: [['efx:ready', 'Animation loaded.'], ['efx:done', 'A non-looping animation finished.']],
  vars: [['--efx-lottie-ratio', '1', 'Aspect ratio of the box, e.g. 16 / 9.']],
  examples: [
    { html: `<div class="efx-lottie" data-efx-src="https://lottie.host/embed/placeholder.lottie" data-efx-trigger="visible" data-efx-label="Animation" style="width:200px"><p class="m-0 text-sm">Animation placeholder</p></div>` },
  ],
};
