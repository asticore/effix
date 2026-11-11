/* Docs data for popout (not bundled). */
const bg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset=".6" stop-color="#7c3aed"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs><rect width="600" height="420" fill="url(#s)"/><g fill="#fff" opacity=".8"><circle cx="60" cy="50" r="2"/><circle cx="180" cy="110" r="1.5"/><circle cx="330" cy="40" r="2"/><circle cx="470" cy="90" r="2.5"/><circle cx="540" cy="200" r="1.5"/><circle cx="120" cy="220" r="1.5"/></g></svg>');
const fg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="420" height="500" viewBox="0 0 420 500"><defs><radialGradient id="p" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fde68a"/><stop offset=".6" stop-color="#f59e0b"/><stop offset="1" stop-color="#b45309"/></radialGradient></defs><ellipse cx="210" cy="190" rx="205" ry="42" fill="none" stroke="#fff" stroke-width="10" opacity=".9" transform="rotate(-14 210 190)"/><circle cx="210" cy="190" r="125" fill="url(#p)"/><path d="M95 200a125 125 0 0 0 230 0z" fill="#92400e" opacity=".25"/><path d="M5 190c60-50 330-90 410 0" fill="none" stroke="#fff" stroke-width="10" transform="rotate(-14 210 190)" opacity=".95"/><rect x="170" y="310" width="80" height="170" rx="40" fill="#fff"/><circle cx="210" cy="365" r="20" fill="#7c3aed"/></svg>');
module.exports = {
  title: 'Poster pop-out',
  group: 'Images',
  summary: 'A background image stays clipped to the card while a transparent cut-out bursts out of the frame. Pointer movement and scroll shift the layers at different depths with a slight 3D tilt. Static overflow look with reduced motion.',
  classes: [
    ['efx-popout', 'The card (give it a size and a radius).'],
    ['efx-popout__bg', 'Background layer, clipped to the card. A div with background-image, or an img.'],
    ['efx-popout__fg', 'Foreground cut-out (transparent PNG/SVG img) that overflows the top and sides.'],
  ],
  options: [
    ['data-efx-depth', '20', 'Layer travel in px (foreground moves most, background least).'],
    ['data-efx-tilt', '8', 'Maximum 3D tilt in degrees (pointer).'],
    ['data-efx-mode', 'both', 'pointer · scroll · both (pointer needs a fine pointer; scroll works on touch).'],
  ],
  vars: [],
  examples: [
    { html: `<div class="p-6" style="padding-top:5rem"><div class="efx-popout rounded-xl" style="max-width:360px;margin-inline:auto;aspect-ratio:4/3" data-efx-depth="26" data-efx-tilt="9">
  <div class="efx-popout__bg" style="background-image:url('${bg}')"></div>
  <img class="efx-popout__fg" src="${fg}" alt="A ringed planet bursting out of the frame">
</div></div>` },
  ],
};
