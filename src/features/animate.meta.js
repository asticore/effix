/* Docs data for animate (not bundled). */
const names = 'fade-in fade-out fade-in-up fade-in-down bounce bounce-in bounce-out bounce-up bounce-down slide-up slide-down slide-left slide-right pop pop-in pop-elastic rotate rotate-in spin spin-reverse scale-up scale-down zoom-in zoom-out flip-x flip-y flip-3d shake wobble pulse heartbeat jello tada swing rubber'.split(' ');
module.exports = {
  title: 'Animations',
  group: 'Animations',
  summary: 'Ready-made keyframe animations as classes (fade, bounce, slide, pop, rotate, zoom, flip, plus attention seekers) with triggers: hover, focus, active, load, click, scroll. Plus underline animations. Class alone plays once on load.',
  classes: [
    ['spark-' + names.slice(0, 4).join(' · spark-'), 'Fades. Entrance anims start hidden.'],
    ['spark-' + names.slice(4, 9).join(' · spark-'), 'Bounces (entrance, exit, directional).'],
    ['spark-' + names.slice(9, 13).join(' · spark-'), 'Slides from the element\'s own size.'],
    ['spark-' + names.slice(13, 20).join(' · spark-'), 'Pop, rotate and continuous spin (spin loops by default).'],
    ['spark-' + names.slice(20, 28).join(' · spark-'), 'Scale, zoom and 3D flips.'],
    ['spark-' + names.slice(28).join(' · spark-'), 'Attention seekers.'],
    ['spark-anim', 'Generic: plays whatever --spark-anim names (use with your own keyframes).'],
    ['spark-hover · spark-focus · spark-active', 'Trigger (pure CSS): play on hover, focus-visible/focus-within, or while pressed.'],
    ['spark-load', 'Trigger: plays once on load (the default with no trigger class; supports .spark-stagger).'],
    ['spark-click', 'Trigger: replays on every click.'],
    ['spark-scroll', 'Trigger: plays when scrolled into view (entrance anims stay hidden until then, only once JS runs).'],
    ['spark-loop', 'Repeat forever (or data-spark-repeat="3").'],
    ['spark-underline-grow', 'Underline that grows in on hover/focus and leaves out the other side.'],
    ['spark-underline-left · spark-underline-right · spark-underline-center', 'Underline wipes in from that origin on hover/focus-visible.'],
    ['spark-stagger', 'Container: cascades delays of .spark-load / .spark-scroll children (data-spark-stagger="80").'],
  ],
  options: [
    ['data-spark-delay', '0', 'Extra delay in ms (click/load/scroll triggers).'],
    ['data-spark-once', 'true', 'spark-scroll: false = replay each time it re-enters.'],
    ['data-spark-threshold', '0.15', 'spark-scroll: how far into the viewport (0-1) before it plays.'],
    ['data-spark-repeat', '', 'Iteration count (number or "infinite"); CSS handles 2-5 and infinite without JS.'],
    ['data-spark-stagger', '80', 'On .spark-stagger: ms between children.'],
    ['data-spark-from', 'first', 'On .spark-stagger: where the cascade starts: first · last · center · edges · random · or an item index (0-based).'],
    ['data-spark-grid', '', 'On .spark-stagger: "cols,rows" (e.g. "4,3") or "auto" (measures item positions) to delay by 2D distance from the origin.'],
    ['data-spark-axis', '', 'On .spark-stagger with a grid: x or y to measure distance on one axis only.'],
    ['data-spark-ease', 'linear', 'On .spark-stagger: easing name (see Spark.add("easing")) distributing the delays along a curve.'],
    ['data-spark-total', '', 'On .spark-stagger: spread the cascade across this many ms in total instead of ms per step.'],
  ],
  extend: [
    ['CSS', '--spark-anim', 'Custom animation in pure CSS: `@keyframes spark-wiggle { 50% { rotate: 8deg } }  .spark-wiggle { --spark-anim: spark-wiggle }` then `class="spark-anim spark-wiggle spark-hover"`. All triggers and iteration knobs work.'],
  ],
  vars: [
    ['--spark-duration', '700ms', 'Animation length.'],
    ['--spark-ease', 'cubic-bezier(.22,1,.36,1)', 'Easing.'],
    ['--spark-delay', '0s', 'Start delay.'],
    ['--spark-iter', '1', 'Iteration count.'],
    ['--spark-distance', '24px', 'Travel for fade-in-up/down.'],
    ['--spark-color', 'Shine tone/primary', 'Underline color.'],
    ['--spark-thickness', '2px', 'Underline thickness.'],
  ],
  examples: [
    { html: `<div class="spark-stagger grid md:grid-cols-4 gap-4 p-6" data-spark-stagger="100">
  <div class="card p-4 spark-fade-in-up spark-scroll">Fade in up</div>
  <div class="card p-4 spark-bounce-in spark-scroll">Bounce in</div>
  <div class="card p-4 spark-pop-elastic spark-scroll">Pop elastic</div>
  <div class="card p-4 spark-flip-x spark-scroll">Flip X</div>
</div>
<div class="cluster gap-3 p-6">
  <button class="btn spark-shake spark-hover">Hover: shake</button>
  <button class="btn spark-tada spark-click">Click: tada</button>
  <button class="btn spark-pulse spark-loop">Pulse loop</button>
  <a href="#" class="spark-underline-center">Center underline</a>
  <a href="#" class="spark-underline-grow">Grow underline</a>
</div>` },
  ],
};
