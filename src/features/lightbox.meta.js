/* Docs data for lightbox (not bundled). */
const svg = (c, t) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="${c}"/><text x="50%" y="50%" fill="#fff" font-size="64" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${t}</text></svg>`)}`;
const thumb = (c, t) => `<a href="${svg(c, t)}" data-efx-caption="${t} caption"><img src="${svg(c, t)}" alt="${t}" class="rounded-lg" style="width:120px;height:75px;object-fit:cover"></a>`;
module.exports = {
  title: 'Lightbox',
  group: 'Components',
  summary: 'Opens linked images in one shared Shine modal with captions, prev/next, counter, arrow keys and touch swipe. Links still work without JS.',
  classes: [['efx-lightbox', 'Container of <a href="full.jpg"><img></a> links (or any element with data-efx-src). Caption: data-efx-caption, img alt, or figcaption.']],
  options: [
    ['data-efx-loop', 'true', 'Wrap from last to first.'],
    ['data-efx-captions', 'true', 'Show captions.'],
    ['data-efx-group', '', 'Containers sharing the same group value form one gallery.'],
  ],
  vars: [['--efx-lb-bg', 'var(--sh-surface)', 'Dialog background.']],
  examples: [
    { html: `<div class="efx-lightbox cluster gap-3">
  ${thumb('#6366f1', 'One')}
  ${thumb('#0f766e', 'Two')}
  ${thumb('#be123c', 'Three')}
</div>` },
  ],
};
