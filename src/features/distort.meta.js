/* Docs data for distort (not bundled). */
const art = (a, b, kind) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/>${kind === 0 ? `<circle cx="440" cy="130" r="70" fill="#fde68a"/><path d="M0 400V290l130-110 110 90 120-150 240 170v110z" fill="#0f172a" opacity=".55"/>` : kind === 1 ? `<g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="10"><circle cx="300" cy="200" r="50"/><circle cx="300" cy="200" r="100"/><circle cx="300" cy="200" r="150"/></g><rect x="60" y="60" width="90" height="90" fill="#fff" opacity=".35"/>` : `<g fill="#fff" opacity=".55"><rect x="60" y="230" width="70" height="110"/><rect x="150" y="160" width="70" height="180"/><rect x="240" y="100" width="70" height="240"/><rect x="330" y="190" width="70" height="150"/><rect x="420" y="130" width="70" height="210"/></g><circle cx="500" cy="70" r="36" fill="#fff" opacity=".8"/>`}</svg>`);
const A = art("#6366f1", "#ec4899", 0), B = art("#06b6d4", "#22c55e", 1), C = art("#f97316", "#a855f7", 2);
module.exports = {
  title: 'Distort',
  group: 'Images',
  summary: 'Liquid ripple warp from an inline SVG filter (feTurbulence + feDisplacementMap) on images or any element. Animates only while active and eases back; no effect with reduced motion.',
  classes: [['efx-distort', 'Image or element to warp. One hidden <svg><filter> per instance, removed on cleanup.']],
  options: [
    ['data-efx-scale', '30', 'Maximum displacement in px.'],
    ['data-efx-frequency', '0.02', 'Noise base frequency (lower = broader waves).'],
    ['data-efx-speed', '1', 'Animation speed multiplier.'],
    ['data-efx-trigger', 'hover', 'hover · always (while on screen) · view (one pulse when scrolled in).'],
  ],
  examples: [
    { html: `<div class="grid md:grid-cols-3 gap-4">
  <div class="card p-3"><img class="efx-distort rounded-lg" src="${B}" alt="Rings" style="display:block;width:100%;height:200px;object-fit:cover"><p class="mt-2">hover</p></div>
  <div class="card p-3"><img class="efx-distort rounded-lg" data-efx-trigger="always" data-efx-scale="18" data-efx-frequency="0.012" src="${A}" alt="Mountain" style="display:block;width:100%;height:200px;object-fit:cover"><p class="mt-2">always</p></div>
  <div class="card p-3"><h3 class="efx-distort" data-efx-scale="14" data-efx-frequency="0.03">Any element</h3><p>Text warps too.</p></div>
</div>` },
  ],
};
