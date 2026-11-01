/* Docs data for progress (not bundled). */
module.exports = {
  title: 'Scroll progress',
  group: 'Scroll',
  summary: 'A bar that fills as the page (or one article) is scrolled. Exposes --efx-progress and role="progressbar".',
  classes: [
    ['efx-progress', 'The bar element. Fixed to the top by default.'],
  ],
  options: [
    ['data-efx-target', '""', 'CSS selector of an article to measure instead of the whole page.'],
    ['data-efx-position', 'top', 'top · bottom · none (none = you position it).'],
    ['data-efx-height', '4', 'Bar thickness in px.'],
  ],
  vars: [
    ['--efx-color', 'var(--sh-tone, --sh-primary)', 'Bar color (Shine .tone-* classes work).'],
    ['--efx-progress', '0..1', 'Set by JS; use it to style anything else.'],
  ],
  examples: [
    { html: `<div class="card p-6 stack"><div class="efx-progress" data-efx-position="none" data-efx-height="8" data-efx-target="#efx-prog-art" style="border-radius:4px"></div>
  <article id="efx-prog-art" class="stack" style="min-height:700px"><p>This bar tracks how far you have scrolled through this article.</p><p>Keep scrolling the page.</p></article></div>` },
  ],
};
