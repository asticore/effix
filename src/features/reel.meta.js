/* Docs data for reel (not bundled). */
const scene = (tone, t, sub, tr, extra = '') => `<section class="spark-reel__scene tone-${tone} p-6 stack gap-2 justify-center" data-spark-duration="2200" data-spark-transition="${tr}" style="min-height:260px;background:var(--sh-tone);color:var(--sh-on-tone,#fff)"><h2 class="spark-fade-in-up spark-scroll" ${extra}>${t}</h2><p class="spark-fade-in-up spark-scroll" data-spark-delay="200">${sub}</p></section>`;
module.exports = {
  title: 'Scene reel',
  group: 'Animations',
  summary: 'A showreel sequencer: scenes play one after another with fade, slide, wipe or zoom transitions. Effects inside each scene replay as it enters. Play/pause, clickable progress segments, keyboard, pauses offscreen. Manual and cut-only with reduced motion.',
  classes: [
    ['spark-reel', 'The container. Its scene children play in order.'],
    ['spark-reel__scene', 'A scene (or use [data-spark-scene]). Only the current one is visible; the rest are hidden and inert.'],
  ],
  options: [
    ['data-spark-autoplay', 'true', 'Start playing when visible (never with reduced motion).'],
    ['data-spark-loop', 'false', 'Restart after the last scene.'],
    ['data-spark-controls', 'true', 'Inject play/pause button and progress segments.'],
    ['data-spark-duration', '3000', 'Default scene length in ms (override per scene).'],
    ['data-spark-transition', 'fade', 'Default transition: fade · slide · wipe · zoom · cut (override per scene).'],
  ],
  extend: [['Events', 'spark:scene', 'Fires on the container with detail.index whenever a scene is entered. Keys: ← → switch scenes, Space plays/pauses.']],
  vars: [['--spark-reel-t', '600ms', 'Transition length.'], ['--spark-color', 'Shine tone', 'Progress fill color.']],
  examples: [
    { html: `<div class="spark-reel rounded-lg" data-spark-loop>
  ${scene('primary', 'Meet Spark', 'Motion for Shine, in one script.', 'fade')}
  ${scene('success', 'Slide right in', 'Each scene replays its own effects.', 'slide')}
  ${scene('info', 'Wipe it clean', 'Clip-path reveal.', 'wipe')}
  ${scene('warning', 'Zoom finale', 'Loop, pause, or jump with the bar.', 'zoom')}
</div>` },
  ],
};
