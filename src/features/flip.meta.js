/* Docs data for flip (not bundled). */
const art = (a, b, kind) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/>${kind === 0 ? `<circle cx="440" cy="130" r="70" fill="#fde68a"/><path d="M0 400V290l130-110 110 90 120-150 240 170v110z" fill="#0f172a" opacity=".55"/>` : kind === 1 ? `<g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="10"><circle cx="300" cy="200" r="50"/><circle cx="300" cy="200" r="100"/><circle cx="300" cy="200" r="150"/></g><rect x="60" y="60" width="90" height="90" fill="#fff" opacity=".35"/>` : `<g fill="#fff" opacity=".55"><rect x="60" y="230" width="70" height="110"/><rect x="150" y="160" width="70" height="180"/><rect x="240" y="100" width="70" height="240"/><rect x="330" y="190" width="70" height="150"/><rect x="420" y="130" width="70" height="210"/></g><circle cx="500" cy="70" r="36" fill="#fff" opacity=".8"/>`}</svg>`);
const A = art("#6366f1", "#ec4899", 0), B = art("#06b6d4", "#22c55e", 1), C = art("#f97316", "#a855f7", 2);
module.exports = {
  title: 'Flip card',
  group: 'Images',
  summary: 'A card that flips in 3D on hover (or on click / Enter / Space). Height is the taller face, so nothing is clipped. Reduced motion crossfades instead of rotating.',
  classes: [
    ['efx-flip', 'The card wrapper.'],
    ['efx-flip__front', 'Front face (child of .efx-flip).'],
    ['efx-flip__back', 'Back face (child of .efx-flip). Hidden from assistive tech until shown.'],
  ],
  options: [
    ['data-efx-trigger', 'hover', 'hover · click. Click mode makes the card a button with aria-pressed. Touch devices always use click.'],
    ['data-efx-axis', 'y', 'y (horizontal flip) · x (vertical flip).'],
    ['data-efx-duration', '600', 'Flip time in ms.'],
  ],
  vars: [['--efx-ease', 'cubic-bezier(.22,1,.36,1)', 'Easing.']],
  examples: [
    { html: `<div class="grid md:grid-cols-2 gap-4">
  <div class="efx-flip">
    <div class="efx-flip__front card p-0 overflow-hidden"><img src="${A}" alt="Mountain at sunrise" style="display:block;width:100%;height:220px;object-fit:cover"><div class="p-4">Hover to flip</div></div>
    <div class="efx-flip__back card tone-primary p-6"><h3>Back side</h3><p>Any content, any height.</p></div>
  </div>
  <div class="efx-flip" data-efx-trigger="click" data-efx-axis="x">
    <div class="efx-flip__front card p-0 overflow-hidden"><img src="${C}" alt="City skyline" style="display:block;width:100%;height:220px;object-fit:cover"><div class="p-4">Click, Enter or Space (vertical)</div></div>
    <div class="efx-flip__back card tone-success p-6"><h3>Flipped</h3><p>Press again to flip back.</p></div>
  </div>
</div>` },
  ],
};
