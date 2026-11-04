/* Docs data for pixelate (not bundled). */
const art = (a, b, kind) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/>${kind === 0 ? `<circle cx="440" cy="130" r="70" fill="#fde68a"/><path d="M0 400V290l130-110 110 90 120-150 240 170v110z" fill="#0f172a" opacity=".55"/>` : kind === 1 ? `<g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="10"><circle cx="300" cy="200" r="50"/><circle cx="300" cy="200" r="100"/><circle cx="300" cy="200" r="150"/></g><rect x="60" y="60" width="90" height="90" fill="#fff" opacity=".35"/>` : `<g fill="#fff" opacity=".55"><rect x="60" y="230" width="70" height="110"/><rect x="150" y="160" width="70" height="180"/><rect x="240" y="100" width="70" height="240"/><rect x="330" y="190" width="70" height="150"/><rect x="420" y="130" width="70" height="210"/></g><circle cx="500" cy="70" r="36" fill="#fff" opacity=".8"/>`}</svg>`);
const A = art("#6366f1", "#ec4899", 0), B = art("#06b6d4", "#22c55e", 1), C = art("#f97316", "#a855f7", 2);
module.exports = {
  title: 'Pixelate',
  group: 'Images',
  summary: 'Mosaic that sharpens into the real image when it scrolls into view, or pixelates on hover. Draws with canvas drawImage only (no pixel reads), so cross-origin images work. Reduced motion shows the plain image.',
  classes: [['efx-pixelate', 'The <img>, or a wrapper that contains one.']],
  options: [
    ['data-efx-from', '32', 'Largest block size in px.'],
    ['data-efx-duration', '900', 'Transition time in ms.'],
    ['data-efx-trigger', 'view', 'view (sharpen on scroll-in) · hover (pixelate on hover, sharpen on leave).'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="card p-3"><img class="efx-pixelate rounded-lg" src="${A}" alt="Mountain" style="display:block;width:100%;height:200px;object-fit:cover"><p class="mt-2">trigger: view</p></div>
  <div class="card p-3"><img class="efx-pixelate rounded-lg" data-efx-trigger="hover" data-efx-from="24" src="${C}" alt="City" style="display:block;width:100%;height:200px;object-fit:cover"><p class="mt-2">trigger: hover</p></div>
</div>` },
  ],
};
