/* Docs data for ascii (not bundled). */
// Offline demo image: an SVG data URI (same-origin safe, no network).
const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><defs><radialGradient id='g'><stop offset='0' stop-color='white'/><stop offset='1' stop-color='black'/></radialGradient></defs><rect width='320' height='200' fill='black'/><circle cx='160' cy='100' r='85' fill='url(#g)'/><circle cx='120' cy='85' r='14' fill='black'/><circle cx='200' cy='85' r='14' fill='black'/><path d='M110 125 Q160 175 210 125' stroke='black' stroke-width='10' fill='none'/></svg>`;
const uri = 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27');
module.exports = {
  smokeRefresh: false, // renders lazily when its output scrolls into view
  title: 'ASCII art',
  group: 'Images',
  summary: 'Turns an image, video, canvas or big text into ASCII art in a <pre> (or canvas) by sampling luminance per cell. Characters scramble then settle when it scrolls into view; videos render live at a capped fps. The original stays in the DOM (visually hidden) for assistive tech; the art is aria-hidden. Images need to be same-origin or CORS-enabled, otherwise the original is shown and a warning logged. Reduced motion: static render.',
  classes: [
    ['efx-ascii', 'On an <img>, <video>, <canvas>, or a block element with data-efx-text.'],
    ['efx-ascii__out', 'Injected <pre> (or <canvas>) holding the art.'],
    ['efx-ascii__src', 'Added to the original image/video/canvas while it is replaced.'],
  ],
  options: [
    ['data-efx-cols', '80', 'Characters per row (rows follow the aspect ratio).'],
    ['data-efx-chars', ' .:-=+*#%@', 'Characters from dark to bright.'],
    ['data-efx-invert', 'false', 'Flip the brightness mapping (use on light backgrounds).'],
    ['data-efx-color', 'mono', 'mono (inherits text color, or --efx-ascii-color) · source (per-character color from the image).'],
    ['data-efx-text', '', 'Render this text large and convert it (use "&#10;" for line breaks). Falls back to the element\'s own text.'],
    ['data-efx-output', 'pre', 'pre · canvas.'],
    ['data-efx-reveal', 'true', 'Scramble-then-settle animation when first visible.'],
    ['data-efx-duration', '1200', 'Reveal length in ms.'],
    ['data-efx-fps', '24', 'Frame cap for the reveal and live video.'],
    ['data-efx-live', 'false', 'On a <canvas> source: re-sample every frame. Videos are always live while playing.'],
  ],
  vars: [
    ['--efx-ascii-color', 'inherit', 'Text color of the art.'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4 p-4">
  <div><img class="efx-ascii" src="${uri}" alt="A smiling face" data-efx-cols="60" data-efx-color="source" style="width:100%"></div>
  <div class="stack gap-3"><div class="efx-ascii" data-efx-text="EFFIX" data-efx-cols="46" style="font-weight:800;font-family:sans-serif"></div>
  <img class="efx-ascii" src="${uri}" alt="A smiling face" data-efx-cols="36" data-efx-chars=" .oO@" data-efx-reveal="false" style="width:100%"></div>
</div>` },
  ],
};
