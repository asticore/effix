/* Docs data for reel (not bundled). */
const scene = (tone, t, sub, tr, extra = '') => `<section class="efx-reel__scene tone-${tone} p-6 stack gap-2 justify-center" data-efx-duration="2200" data-efx-transition="${tr}" style="min-height:260px;background:var(--sh-tone);color:var(--sh-on-tone,#fff)"><h2 class="efx-fade-in-up efx-scroll" ${extra}>${t}</h2><p class="efx-fade-in-up efx-scroll" data-efx-delay="200">${sub}</p></section>`;
module.exports = {
  title: 'Scene reel',
  group: 'Animations',
  summary: 'A showreel sequencer: scenes play one after another with fade, slide, wipe or zoom transitions. Effects inside each scene replay as it enters. Play/pause, clickable progress segments, keyboard, pauses offscreen. Manual and cut-only with reduced motion.',
  classes: [
    ['efx-reel', 'The container. Its scene children play in order.'],
    ['efx-reel__scene', 'A scene (or use [data-efx-scene]). Only the current one is visible; the rest are hidden and inert.'],
  ],
  options: [
    ['data-efx-autoplay', 'true', 'Start playing when visible (never with reduced motion).'],
    ['data-efx-loop', 'false', 'Restart after the last scene.'],
    ['data-efx-controls', 'true', 'Inject play/pause button and progress segments.'],
    ['data-efx-duration', '3000', 'Default scene length in ms (override per scene).'],
    ['data-efx-transition', 'fade', 'Default transition: fade · slide · wipe · zoom · cut (override per scene).'],
  ],
  extend: [['Events', 'efx:scene', 'Fires on the container with detail.index whenever a scene is entered. Keys: ← → switch scenes, Space plays/pauses.']],
  vars: [['--efx-reel-t', '600ms', 'Transition length.'], ['--efx-color', 'Shine tone', 'Progress fill color.']],
  examples: [
    { html: `<div class="efx-reel rounded-lg" data-efx-loop>
  ${scene('primary', 'Meet Effix', 'Motion for Shine, in one script.', 'fade')}
  ${scene('success', 'Slide right in', 'Each scene replays its own effects.', 'slide')}
  ${scene('info', 'Wipe it clean', 'Clip-path reveal.', 'wipe')}
  ${scene('warning', 'Zoom finale', 'Loop, pause, or jump with the bar.', 'zoom')}
</div>` },
  ],
};
