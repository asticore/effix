/* Docs data for mask (not bundled). */
const art = (a, b, kind) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/>${kind === 0 ? `<circle cx="440" cy="130" r="70" fill="#fde68a"/><path d="M0 400V290l130-110 110 90 120-150 240 170v110z" fill="#0f172a" opacity=".55"/>` : kind === 1 ? `<g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="10"><circle cx="300" cy="200" r="50"/><circle cx="300" cy="200" r="100"/><circle cx="300" cy="200" r="150"/></g><rect x="60" y="60" width="90" height="90" fill="#fff" opacity=".35"/>` : `<g fill="#fff" opacity=".55"><rect x="60" y="230" width="70" height="110"/><rect x="150" y="160" width="70" height="180"/><rect x="240" y="100" width="70" height="240"/><rect x="330" y="190" width="70" height="150"/><rect x="420" y="130" width="70" height="210"/></g><circle cx="500" cy="70" r="36" fill="#fff" opacity=".8"/>`}</svg>`);
const A = art("#6366f1", "#ec4899", 0), B = art("#06b6d4", "#22c55e", 1), C = art("#f97316", "#a855f7", 2);
module.exports = {
  title: 'Spotlight mask',
  group: 'Images',
  summary: 'A circular spotlight follows the pointer and reveals the colour image over a greyscale base. Tap or press Enter to toggle the full reveal on touch and keyboard.',
  classes: [
    ['efx-mask', 'Wrapper containing the base <img>.'],
    ['efx-mask__reveal', 'Optional second <img> shown inside the spotlight. Without it a colour copy of the base is used.'],
  ],
  options: [
    ['data-efx-radius', '120', 'Spotlight radius in px (grows in on enter).'],
    ['data-efx-soft', '0.4', 'Edge softness 0–1.'],
    ['data-efx-gray', 'true', 'false = leave the base image in colour (use with a different reveal image).'],
  ],
  vars: [['--efx-x / --efx-y / --efx-r', 'set by JS', 'Spotlight position and radius, readable for custom styling.']],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="efx-mask rounded-lg overflow-hidden" style="height:240px"><img src="${A}" alt="Mountain at sunrise"></div>
  <div class="efx-mask rounded-lg overflow-hidden" data-efx-gray="false" data-efx-radius="90" style="height:240px"><img src="${C}" alt="City by day"><img class="efx-mask__reveal" src="${B}" alt=""></div>
</div>` },
  ],
};
