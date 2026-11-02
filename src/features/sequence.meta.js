/* Docs data for sequence (not bundled). */
const frames = Array.from({ length: 12 }, (_, i) => {
  const a = i * 30, hue = Math.round(i * 30);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="hsl(${hue},60%,16%)"/><g transform="translate(320 180) rotate(${a})"><rect x="-70" y="-70" width="140" height="140" rx="22" fill="hsl(${hue},80%,60%)"/><circle cx="70" cy="0" r="22" fill="#fff"/></g></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
});

module.exports = {
  title: 'Scroll sequence',
  group: 'Scroll',
  summary: 'Plays an image sequence (canvas) or a video as you scroll through a tall pinned section. Frames load progressively, nearest first. Shows a still frame with reduced motion.',
  classes: [
    ['efx-sequence', 'A div (image sequence) or a video (scrubbed by currentTime). Becomes a tall scroll track with a pinned stage.'],
  ],
  options: [
    ['data-efx-src', '', 'Frame URL template with {i}, e.g. frames/f{i}.webp.'],
    ['data-efx-frames', '0', 'Number of frames when using src.'],
    ['data-efx-pad', '0', 'Zero-pad the frame number to this many digits.'],
    ['data-efx-start', '1', 'First frame number.'],
    ['data-efx-list', '', 'Alternative to src: frame URLs separated by |.'],
    ['data-efx-height', '300', 'Scroll length of the section in vh.'],
    ['data-efx-fit', 'cover', 'cover · contain'],
  ],
  vars: [],
  examples: [
    { html: `<div class="efx-sequence rounded-lg" data-efx-height="200" data-efx-fit="cover" data-efx-list="${frames.join('|')}"></div>` },
  ],
};
