/* Docs data for kenburns (not bundled). */
const art = (a, b, kind) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/>${kind === 0 ? `<circle cx="440" cy="130" r="70" fill="#fde68a"/><path d="M0 400V290l130-110 110 90 120-150 240 170v110z" fill="#0f172a" opacity=".55"/>` : kind === 1 ? `<g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="10"><circle cx="300" cy="200" r="50"/><circle cx="300" cy="200" r="100"/><circle cx="300" cy="200" r="150"/></g><rect x="60" y="60" width="90" height="90" fill="#fff" opacity=".35"/>` : `<g fill="#fff" opacity=".55"><rect x="60" y="230" width="70" height="110"/><rect x="150" y="160" width="70" height="180"/><rect x="240" y="100" width="70" height="240"/><rect x="330" y="190" width="70" height="150"/><rect x="420" y="130" width="70" height="210"/></g><circle cx="500" cy="70" r="36" fill="#fff" opacity=".8"/>`}</svg>`);
const A = art("#6366f1", "#ec4899", 0), B = art("#06b6d4", "#22c55e", 1), C = art("#f97316", "#a855f7", 2);
module.exports = {
  title: 'Ken Burns',
  group: 'Images',
  summary: 'Slow pan and zoom with a random origin and direction per image. Several images in one wrapper become a crossfading slideshow. Pauses off-screen; static with reduced motion.',
  classes: [['efx-kenburns', 'An <img> (gets wrapped in a clipping frame) or a wrapper holding one or more <img>.']],
  options: [
    ['data-efx-duration', '12000', 'Pan/zoom length in ms; also the slideshow interval.'],
    ['data-efx-zoom', '1.15', 'End zoom factor.'],
  ],
  vars: [['--efx-kb-x0 … --efx-kb-y1', 'random', 'Per-image start/end translation, set by JS.']],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-3"><img class="efx-kenburns rounded-lg" data-efx-duration="8000" src="${A}" alt="Mountain" style="height:220px"><p class="mt-2">single image</p></div>
  <div class="card p-3"><div class="efx-kenburns rounded-lg" data-efx-duration="4000" style="height:220px"><img src="${B}" alt="Rings"><img src="${C}" alt="City"><img src="${A}" alt="Mountain"></div><p class="mt-2">slideshow</p></div>
</div>` },
  ],
};
