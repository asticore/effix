/* Docs data for animate (not bundled). */
const names = 'fade-in fade-out fade-in-up fade-in-down bounce bounce-in bounce-out bounce-up bounce-down slide-up slide-down slide-left slide-right pop pop-in pop-elastic rotate rotate-in spin spin-reverse scale-up scale-down zoom-in zoom-out flip-x flip-y flip-3d shake wobble pulse heartbeat jello tada swing rubber'.split(' ');
module.exports = {
  title: 'Animations',
  group: 'Animations',
  summary: 'Ready-made keyframe animations as classes (fade, bounce, slide, pop, rotate, zoom, flip, plus attention seekers) with triggers: hover, focus, active, load, click, scroll. Plus underline animations. Class alone plays once on load.',
  classes: [
    ['efx-' + names.slice(0, 4).join(' · efx-'), 'Fades. Entrance anims start hidden.'],
    ['efx-' + names.slice(4, 9).join(' · efx-'), 'Bounces (entrance, exit, directional).'],
    ['efx-' + names.slice(9, 13).join(' · efx-'), 'Slides from the element\'s own size.'],
    ['efx-' + names.slice(13, 20).join(' · efx-'), 'Pop, rotate and continuous spin (spin loops by default).'],
    ['efx-' + names.slice(20, 28).join(' · efx-'), 'Scale, zoom and 3D flips.'],
    ['efx-' + names.slice(28).join(' · efx-'), 'Attention seekers.'],
    ['efx-anim', 'Generic: plays whatever --efx-anim names (use with your own keyframes).'],
    ['efx-hover · efx-focus · efx-active', 'Trigger (pure CSS): play on hover, focus-visible/focus-within, or while pressed.'],
    ['efx-load', 'Trigger: plays once on load (the default with no trigger class; supports .efx-stagger).'],
    ['efx-click', 'Trigger: replays on every click.'],
    ['efx-scroll', 'Trigger: plays when scrolled into view (entrance anims stay hidden until then, only once JS runs).'],
    ['efx-loop', 'Repeat forever (or data-efx-repeat="3").'],
    ['efx-underline-grow', 'Underline that grows in on hover/focus and leaves out the other side.'],
    ['efx-underline-left · efx-underline-right · efx-underline-center', 'Underline wipes in from that origin on hover/focus-visible.'],
    ['efx-stagger', 'Container: cascades delays of .efx-load / .efx-scroll children (data-efx-stagger="80").'],
  ],
  options: [
    ['data-efx-delay', '0', 'Extra delay in ms (click/load/scroll triggers).'],
    ['data-efx-once', 'true', 'efx-scroll: false = replay each time it re-enters.'],
    ['data-efx-threshold', '0.15', 'efx-scroll: how far into the viewport (0-1) before it plays.'],
    ['data-efx-repeat', '', 'Iteration count (number or "infinite"); CSS handles 2-5 and infinite without JS.'],
    ['data-efx-stagger', '80', 'On .efx-stagger: ms between children.'],
    ['data-efx-from', 'first', 'On .efx-stagger: where the cascade starts: first · last · center · edges · random · or an item index (0-based).'],
    ['data-efx-grid', '', 'On .efx-stagger: "cols,rows" (e.g. "4,3") or "auto" (measures item positions) to delay by 2D distance from the origin.'],
    ['data-efx-axis', '', 'On .efx-stagger with a grid: x or y to measure distance on one axis only.'],
    ['data-efx-ease', 'linear', 'On .efx-stagger: easing name (see Effix.add("easing")) distributing the delays along a curve.'],
    ['data-efx-total', '', 'On .efx-stagger: spread the cascade across this many ms in total instead of ms per step.'],
  ],
  extend: [
    ['CSS', '--efx-anim', 'Custom animation in pure CSS: `@keyframes efx-wiggle { 50% { rotate: 8deg } }  .efx-wiggle { --efx-anim: efx-wiggle }` then `class="efx-anim efx-wiggle efx-hover"`. All triggers and iteration knobs work.'],
  ],
  vars: [
    ['--efx-duration', '700ms', 'Animation length.'],
    ['--efx-ease', 'cubic-bezier(.22,1,.36,1)', 'Easing.'],
    ['--efx-delay', '0s', 'Start delay.'],
    ['--efx-iter', '1', 'Iteration count.'],
    ['--efx-distance', '24px', 'Travel for fade-in-up/down.'],
    ['--efx-color', 'Shine tone/primary', 'Underline color.'],
    ['--efx-thickness', '2px', 'Underline thickness.'],
  ],
  examples: [
    { html: `<div class="efx-stagger grid md:grid-cols-4 gap-4 p-6" data-efx-stagger="100">
  <div class="card p-4 efx-fade-in-up efx-scroll">Fade in up</div>
  <div class="card p-4 efx-bounce-in efx-scroll">Bounce in</div>
  <div class="card p-4 efx-pop-elastic efx-scroll">Pop elastic</div>
  <div class="card p-4 efx-flip-x efx-scroll">Flip X</div>
</div>
<div class="cluster gap-3 p-6">
  <button class="btn efx-shake efx-hover">Hover: shake</button>
  <button class="btn efx-tada efx-click">Click: tada</button>
  <button class="btn efx-pulse efx-loop">Pulse loop</button>
  <a href="#" class="efx-underline-center">Center underline</a>
  <a href="#" class="efx-underline-grow">Grow underline</a>
</div>` },
  ],
};
