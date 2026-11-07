/* Docs data for shape (not bundled). */
module.exports = {
  title: 'Shape morph',
  group: 'Sections',
  summary: 'Morphs one SVG shape into another. Every shape is resampled to N points, the start points are aligned for minimum travel, and the polygon is interpolated. Loop through shapes, morph on hover/focus, or scrub with scroll. Built-ins: blob, circle, star, heart, square (add your own).',
  classes: [
    ['efx-shape', 'On an <svg> (a path is generated inside, filled with the Shine tone) or directly on a <path> (keeps your own fill/stroke).'],
  ],
  options: [
    ['data-efx-d', '', 'Pipe-separated shapes: registered names (blob|star) or path data "M…|M…". Names use a 0 0 100 100 viewBox (set for you on an <svg> without one).'],
    ['data-efx-shapes', '', 'Pipe-separated selectors of existing geometry (path, circle, rect…), e.g. "#s1|#s2|#s3". Put the sources in <defs>.'],
    ['data-efx-to', '', 'On a <path>: target path data. Morphs from the path\'s own d (pipe-separate for more).'],
    ['data-efx-points', '64', 'Samples per shape. More = smoother, heavier.'],
    ['data-efx-trigger', 'loop', 'loop (cycle all shapes) · hover (first -> second on hover/focus) · scroll (progress through the viewport)'],
    ['data-efx-duration', '1200', 'Morph time in ms.'],
    ['data-efx-pause', '800', 'loop: hold time between morphs in ms.'],
    ['data-efx-ease', 'ease-in-out', 'Easing name (see Effix.add("easing")).'],
    ['data-efx-target', '', 'hover: selector of the element that listens (default: the closest link/button, else the shape).'],
  ],
  extend: [
    ['Effix.add', '\'shape\', name, d', 'Register a named shape: path data in a 0 0 100 100 box. Then use data-efx-d="name|star".'],
  ],
  extendExample: `Effix.add('shape', 'bolt', 'M58,4 L20,56 H46 L38,96 L82,40 H54 Z');
Effix.refresh(document.querySelector('.efx-shape'));`,
  vars: [
    ['--efx-color', 'Shine tone/primary', 'Fill of the generated path.'],
  ],
  examples: [
    { html: `<div class="cluster gap-6 p-6 items-center">
  <svg class="efx-shape" viewBox="0 0 100 100" width="160" height="160" data-efx-d="blob|star|heart|circle" role="img" aria-label="Morphing shape"></svg>
  <button class="btn" style="display:inline-flex;align-items:center;gap:.75rem">
    <svg class="efx-shape" viewBox="0 0 100 100" width="40" height="40" data-efx-d="square|circle" data-efx-trigger="hover" data-efx-duration="400" aria-hidden="true"></svg>
    Hover me
  </button>
</div>` },
  ],
};
