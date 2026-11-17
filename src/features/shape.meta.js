/* Docs data for shape (not bundled). */
module.exports = {
  title: 'Shape morph',
  group: 'Sections',
  summary: 'Morphs one SVG shape into another. Every shape is resampled to N points, the start points are aligned for minimum travel, and the polygon is interpolated. Loop through shapes, morph on hover/focus, or scrub with scroll. Built-ins: blob, circle, star, heart, square (add your own).',
  classes: [
    ['spark-shape', 'On an <svg> (a path is generated inside, filled with the Shine tone) or directly on a <path> (keeps your own fill/stroke).'],
  ],
  options: [
    ['data-spark-d', '', 'Pipe-separated shapes: registered names (blob|star) or path data "M…|M…". Names use a 0 0 100 100 viewBox (set for you on an <svg> without one).'],
    ['data-spark-shapes', '', 'Pipe-separated selectors of existing geometry (path, circle, rect…), e.g. "#s1|#s2|#s3". Put the sources in <defs>.'],
    ['data-spark-to', '', 'On a <path>: target path data. Morphs from the path\'s own d (pipe-separate for more).'],
    ['data-spark-points', '64', 'Samples per shape. More = smoother, heavier.'],
    ['data-spark-trigger', 'loop', 'loop (cycle all shapes) · hover (first -> second on hover/focus) · scroll (progress through the viewport)'],
    ['data-spark-duration', '1200', 'Morph time in ms.'],
    ['data-spark-pause', '800', 'loop: hold time between morphs in ms.'],
    ['data-spark-ease', 'ease-in-out', 'Easing name (see Spark.add("easing")).'],
    ['data-spark-target', '', 'hover: selector of the element that listens (default: the closest link/button, else the shape).'],
  ],
  extend: [
    ['Spark.add', '\'shape\', name, d', 'Register a named shape: path data in a 0 0 100 100 box. Then use data-spark-d="name|star".'],
  ],
  extendExample: `Spark.add('shape', 'bolt', 'M58,4 L20,56 H46 L38,96 L82,40 H54 Z');
Spark.refresh(document.querySelector('.spark-shape'));`,
  vars: [
    ['--spark-color', 'Shine tone/primary', 'Fill of the generated path.'],
  ],
  examples: [
    { html: `<div class="cluster gap-6 p-6 items-center">
  <svg class="spark-shape" viewBox="0 0 100 100" width="160" height="160" data-spark-d="blob|star|heart|circle" role="img" aria-label="Morphing shape"></svg>
  <button class="btn" style="display:inline-flex;align-items:center;gap:.75rem">
    <svg class="spark-shape" viewBox="0 0 100 100" width="40" height="40" data-spark-d="square|circle" data-spark-trigger="hover" data-spark-duration="400" aria-hidden="true"></svg>
    Hover me
  </button>
</div>` },
  ],
};
